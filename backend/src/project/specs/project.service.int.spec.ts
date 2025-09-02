import { Test, TestingModule } from '@nestjs/testing';
import { execSync } from 'child_process';
import { ProjectService } from '../project.service';
import { PrismaService } from '../../prisma/prisma.service';
import { S3Service } from '../../s3/s3.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { SaveProjectDto } from '../dto/save-project.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as projectHelper from '../../common/helpers/projects_collab.helper';
import * as authHelp from '../../common/helpers/auth.helpers';

// Mock S3Service
const mockS3Service = {
  uploadJson: jest.fn(),
  uploadThumbnail: jest.fn(),
  getJson: jest.fn().mockResolvedValue('{}'),
  deleteProjectFiles: jest.fn(),
  getThumbnail: jest
    .fn()
    .mockImplementation((projectId: number) =>
      Promise.resolve(`https://s3.fake/${projectId}/thumbnail.png`),
    ),
};

// a valid base64 PNG string
const base64Thumbnail =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9YpJ8hAAAAAASUVORK5CYII=';

jest.setTimeout(60000); // allow enough time for docker + db

describe('ProjectService (integration)', () => {
  let service: ProjectService;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Start Dockerized DB
    execSync('docker compose up -d', { stdio: 'inherit' });

    // Wait for DB to be ready and push schema
    for (let i = 0; i < 10; i++) {
      try {
        execSync('npx prisma db push', { stdio: 'inherit' });
        break;
      } catch (err) {
        console.log(`DB not ready yet, retrying... (${i + 1}/10)`);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        PrismaService,
        { provide: S3Service, useValue: mockS3Service },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean DB
    await prisma.collaboration.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

    await prisma.$disconnect();

    // Stop Docker
    execSync('docker compose down -v', { stdio: 'inherit' });
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    // cleanup tables before each test
    await prisma.collaboration.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
  });

  describe('create()', () => {
    it('should throw if user does not exist', async () => {
      await expect(
        service.create(9999, { name: 'Test Project' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create project and collaboration', async () => {
      const user = await prisma.user.create({
        data: { email: 'john@example.com', 
          userName: 'john',
          isEmailVerified: true,
          passwordHash: 'secret' 
        },
      });

      const project = await service.create(user.id, {
        name: 'New Project',
      } as CreateProjectDto);

      expect(project).toHaveProperty('id');

      const collabs = await prisma.collaboration.findMany({
        where: { userId: user.id },
        include: { roles: true, project: true },
      });

      expect(collabs.length).toBe(1);
      expect(collabs[0].roles[0].name).toBe('owner');
    });
  });

  describe('saveProject', () => {
    it('should save JSON + thumbnail to S3 for an existing project if user has permission', async () => {
      const user = await prisma.user.create({
        data: { 
          email: 'save@test.com',
          passwordHash: 'pwd',
          userName: 'test3',
          isEmailVerified: false,
        },
      });

      const project = await prisma.project.create({
        data: { name: 'SaveTestProject', creatorId: user.id },
      });

      // Ensure owner role exists
      const ownerRole = await prisma.role.upsert({
        where: { name: 'owner' },
        update: {},
        create: { name: 'owner' },
      });

      // Link user as owner
      await prisma.collaboration.create({
        data: {
          userId: user.id,
          projectId: project.id,
          roles: { connect: { id: ownerRole.id } },
        },
      });

      mockS3Service.uploadJson.mockResolvedValueOnce(undefined);
      mockS3Service.uploadThumbnail.mockResolvedValueOnce(undefined);

      await service.saveProject(
        {
          projectId: project.id,
          jsonProject: JSON.stringify({ foo: 'bar' }),
          thumbnailBase64: `data:image/png;base64,${base64Thumbnail}`,
        },
        user.id,
      );

      expect(mockS3Service.uploadJson).toHaveBeenCalledTimes(1);
      expect(mockS3Service.uploadThumbnail).toHaveBeenCalledTimes(1);
      expect(mockS3Service.uploadJson).toHaveBeenCalledWith(
        project.id,
        JSON.stringify({ foo: 'bar' }),
      );
      expect(mockS3Service.uploadThumbnail).toHaveBeenCalledWith(
        project.id,
        expect.stringContaining(base64Thumbnail),
      );

      await prisma.project.delete({ where: { id: project.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should throw if project does not exist', async () => {
      const fakeUser = await prisma.user.create({
        data: { 
          email: 'fake@test.com',
          passwordHash: 'pwd',
          userName: 'fakeuser',
          isEmailVerified: false,
        },
      });

      await expect(
        service.saveProject(
          {
            projectId: 9999,
            jsonProject: JSON.stringify({ foo: 'bar' }),
            thumbnailBase64: `data:image/png;base64,${base64Thumbnail}`,
          },
          fakeUser.id,
        ),
      ).rejects.toThrow('Project 9999 not found');

      await prisma.user.delete({ where: { id: fakeUser.id } });
    });

    it('should throw ForbiddenException if user has no roles on the project', async () => {
      const user = await prisma.user.create({
        data: { email: 'noRole@test.com', passwordHash: 'pwd', userName: 'nrole', isEmailVerified: false },
      });
      const project = await prisma.project.create({
        data: { name: 'NoRoleProject', creatorId: user.id },
      });

      // no collaboration created!

      await expect(
        service.saveProject(
          {
            projectId: project.id,
            jsonProject: JSON.stringify({ foo: 'bar' }),
            thumbnailBase64: `data:image/png;base64,${base64Thumbnail}`,
          },
          user.id,
        ),
      ).rejects.toThrow('You do not have permission to save this project');

      await prisma.project.delete({ where: { id: project.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should throw BadRequestException if JSON is invalid', async () => {
      const user = await prisma.user.create({
        data: { email: 'badjson@test.com', passwordHash: 'pwd', userName: 'bjson', isEmailVerified: false },
      });
      const project = await prisma.project.create({
        data: { name: 'BadJsonProject', creatorId: user.id },
      });

      const editorRole = await prisma.role.upsert({
        where: { name: 'editor' },
        update: {},
        create: { name: 'editor' },
      });

      await prisma.collaboration.create({
        data: {
          userId: user.id,
          projectId: project.id,
          roles: { connect: { id: editorRole.id } },
        },
      });

      await expect(
        service.saveProject(
          {
            projectId: project.id,
            jsonProject: 'not-json',
            thumbnailBase64: `data:image/png;base64,${base64Thumbnail}`,
          },
          user.id,
        ),
      ).rejects.toThrow('jsonProject must be valid JSON');

      await prisma.project.delete({ where: { id: project.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe('renameProject', () => {
    it('should fail when renaming a project that does not exist', async () => {
      // Create a user so we have a valid userId
      const user = await prisma.user.create({
        data: {
          email: 'rename404@example.com',
          passwordHash: 'hashed',
          userName: 'rename404',
          isEmailVerified: false,
        },
      });

      await expect(
        service.renameProject(9999, 'DoesNotExist', user.id),
      ).rejects.toThrow('Project 9999 not found');

      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should rename an existing project when called by user owner', async () => {
      // Create owner
      const user = await prisma.user.create({
        data: {
          email: 'rename-owner@example.com',
          passwordHash: 'hashedpassword',
          userName: 'renameOwner',
          isEmailVerified: false,
        },
      });

      // Create project
      const project = await prisma.project.create({
        data: {
          name: 'Old Name',
          creatorId: user.id,
        },
      });

      // Ensure the role owner exists (create if missing)
      await prisma.role.upsert({
        where: { name: 'owner' },  // assumes `name` is unique
        update: {},                // nothing to update if it exists
        create: { name: 'owner' }, // create if not found
      });
      
      const collab = await prisma.collaboration.create({
        data: {
          userId: user.id,
          projectId: project.id,
          roles: {
            connect: [{ name: 'owner' }], 
          },
        }
      })

      // Call renameProject with correct userId
      await service.renameProject(project.id, 'New Name', user.id);

      const updated = await prisma.project.findUnique({
        where: { id: project.id },
      });
      expect(updated?.name).toBe('New Name');

      // Cleanup
      await prisma.project.delete({ where: { id: project.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should throw if a non-owner tries to rename the project', async () => {
      // Create owner + project
      const owner = await prisma.user.create({
        data: {
          email: 'owner@example.com',
          passwordHash: 'hashed',
          userName: 'ownerUser',
          isEmailVerified: false,
        },
      });

      const project = await prisma.project.create({
        data: {
          name: 'Original Name',
          creatorId: owner.id,
        },
      });

      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          passwordHash: 'hashed',
          userName: 'otherUser',
          isEmailVerified: false,
        },
      });

      // Non-owner should be forbidden
      await expect(
        service.renameProject(project.id, 'Hacked Name', otherUser.id),
      ).rejects.toThrow('Only the owner can perform this action');

      // Cleanup
      await prisma.project.delete({ where: { id: project.id } });
      await prisma.user.delete({ where: { id: owner.id } });
      await prisma.user.delete({ where: { id: otherUser.id } });
    });
  });


  describe('getJSONProject()', () => {
    it('should throw if project does not exist', async () => {
      await expect(service.getJSONProject(9999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return JSON from S3', async () => {
      const user = await prisma.user.create({
        data: { email: 'json@test.com', 
          userName: 'json',
          isEmailVerified: true,
          passwordHash: 'secret' 
        },
      });
      const project = await service.create(user.id, { name: 'projJson' });

      const result = await service.getJSONProject(project.id);

      expect(result).toEqual({ JSONProject: '{}' });
      expect(mockS3Service.getJson).toHaveBeenCalledWith(project.id);
    });
  });

  describe('deleteProject()', () => {
    it('should throw if project does not exist', async () => {
      await expect(service.deleteProject(9999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete project, files and collaboration if user is owner', async () => {
      const user = await prisma.user.create({
        data: { email: 'del@test.com',  
          userName: 'del',
          isEmailVerified: true,
          passwordHash: 'secret' 
        },
      });
      const project = await service.create(user.id, { name: 'projDel' });

      jest
        .spyOn(authHelp, 'resolveUserId')
        .mockReturnValueOnce(user.id);
      jest.spyOn(projectHelper, 'assertOwner').mockResolvedValueOnce();

      await service.deleteProject(project.id);

      const prj = await prisma.project.findUnique({
        where: { id: project.id },
      });
      expect(prj).toBeNull();

      expect(mockS3Service.deleteProjectFiles).toHaveBeenCalledWith(project.id);
    });
  });

  describe('listAccessibleProjects()', () => {
    it('should return empty list if no collaborations', async () => {
      const user = await prisma.user.create({
        data: { email: 'access@test.com', 
          userName: 'access',
          isEmailVerified: true,
          passwordHash: 'secret' 
        },
      });

      const result = await service.listAccessibleProjects(user.id);
      expect(result).toEqual([]);
    });

    it('should return projects where user is collaborator', async () => {
      const user = await prisma.user.create({
        data: { email: 'access2@test.com',  
          userName: 'cd',
          isEmailVerified: true,
          passwordHash: 'secret' 
        },
      });
      const project = await service.create(user.id, { name: 'projAcc' });

      const result = await service.listAccessibleProjects(user.id);

      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({
        projectId: project.id,
        projectName: 'projAcc',
        roles: expect.arrayContaining(['owner']),
      });
      expect(result[0].thumbnail).toContain(`${project.id}/thumbnail.png`);
    });
  });

  describe('listOwnedProjects()', () => {
    it('should return only projects where role = owner', async () => {
      const owner = await prisma.user.create({
        data: { email: 'owner@test.com',  
          userName: 'owner',
          isEmailVerified: true,
          passwordHash: 'secret' 
        },
      });
      const collab = await prisma.user.create({
        data: { email: 'collab@test.com',  
          userName: 'collab',
          isEmailVerified: true,
          passwordHash: 'secret' 
        },
      });

      const project = await service.create(owner.id, { name: 'projOwner' });

      // Add a second collaboration for collab (role = not owner)
      const viewerRole = await prisma.role.upsert({
        where: { name: 'viewer' },
        update: {},
        create: { name: 'viewer' },
      });
      await prisma.collaboration.create({
        data: {
          userId: collab.id,
          projectId: project.id,
          roles: { connect: { id: viewerRole.id } },
        },
      });

      const owned = await service.listOwnedProjects(owner.id);
      const notOwned = await service.listOwnedProjects(collab.id);

      expect(owned.length).toBe(1);
      expect(owned[0].roles).toContain('owner');
      expect(notOwned.length).toBe(0);
    });
  });
});
