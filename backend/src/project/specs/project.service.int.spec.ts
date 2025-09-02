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

jest.setTimeout(60000); // allow enough time for docker + db

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

  describe('saveProject()', () => {
    it('should throw if project not found', async () => {
      const dto: SaveProjectDto = {
        projectId: 9999,
        jsonProject: '{}',
        thumbnailBase64: 'base64string',
      };

      await expect(service.saveProject(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw if jsonProject is invalid', async () => {
      const user = await prisma.user.create({
        data: { email: 'a@b.com', 
          userName: 'ab',
          isEmailVerified: true,
          passwordHash: 'secret' 
        },
      });

      const project = await service.create(user.id, { name: 'p1' });

      const dto: SaveProjectDto = {
        projectId: project.id,
        jsonProject: 'not-json',
        thumbnailBase64: 'base64string',
      };

      await expect(service.saveProject(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should upload files and update project', async () => {
      const user = await prisma.user.create({
        data: { email: 'c@d.com',  
          userName: 'cd',
          isEmailVerified: true,
          passwordHash: 'secret' 
        },
      });

      const project = await service.create(user.id, { name: 'p2' });

      const dto: SaveProjectDto = {
        projectId: project.id,
        jsonProject: JSON.stringify({ hello: 'world' }),
        thumbnailBase64: 'base64string',
      };

      await service.saveProject(dto);

      expect(mockS3Service.uploadJson).toHaveBeenCalledWith(
        project.id,
        dto.jsonProject,
      );
      expect(mockS3Service.uploadThumbnail).toHaveBeenCalledWith(
        project.id,
        dto.thumbnailBase64,
      );

      const updated = await prisma.project.findUnique({
        where: { id: project.id },
      });
      expect(updated?.lastSavedAt).not.toBeNull();
    });
  });

  
  describe('renameProject()', () => {
    it('should throw if project does not exist', async () => {
      jest.spyOn(projectHelper, 'assertOwner').mockResolvedValueOnce();

      await expect(
        service.renameProject(9999, 'newName', 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should rename an existing project if user is owner', async () => {
      const user = await prisma.user.create({
        data: { email: 'rename@test.com', 
          userName: 'rename',
          isEmailVerified: true,
          passwordHash: 'secret'
        },
      });
      const project = await service.create(user.id, { name: 'oldName' });

      jest.spyOn(projectHelper, 'assertOwner').mockResolvedValueOnce();

      await service.renameProject(project.id, 'newName', user.id);

      const updated = await prisma.project.findUnique({
        where: { id: project.id },
      });
      expect(updated?.name).toBe('newName');
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
          userName: 'access2',
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
