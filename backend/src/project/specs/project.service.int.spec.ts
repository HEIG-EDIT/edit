import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from '../project.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { execSync } from 'child_process';
import { S3Service } from '../../s3/s3.service';

describe('ProjectService (integration)', () => {
  let service: ProjectService;
  let prisma: PrismaService;
  
  // Mock S3Service
  const mockS3Service = {
    uploadJson: jest.fn(),          
    uploadThumbnail: jest.fn(),     
    getJson: jest.fn().mockResolvedValue('{}'),
    deleteProjectFiles: jest.fn(),
  };

  const base64Thumbnail =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAucB9Y9Nn98AAAAASUVORK5CYII=';

  beforeAll(async () => {
    // Start Docker container
    execSync('docker compose up -d', { stdio: 'inherit' });

    // Wait a bit for DB
    await new Promise((resolve) => setTimeout(resolve, 15000));

    // Run migrations
    execSync('npx prisma db push', {
      stdio: 'inherit'
    });

    /*const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectService, PrismaService],
    }).compile();*/
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        PrismaService,
        { provide: S3Service, useValue: mockS3Service },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    prisma = module.get<PrismaService>(PrismaService);
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
    // Stop docker container
    execSync('docker compose down', { stdio: 'inherit' });
  });

  // ----------------------------
  // create project tests
  // ----------------------------
  describe('createProject', () => {
    it('should fail if creatorId does not exist', async () => {
      const dto: CreateProjectDto = { name: 'Ghost Project', creatorId: 9999 };

      await expect(service.create(dto)).rejects.toThrow(
        `User with id ${dto.creatorId} does not exist`,
      );
    });

    it('should create a project when creatorId exists', async () => {
      // Create a user
      const user = await prisma.user.create({
        data: { email: 'test@example.com', 
          passwordHash: 'hashedpassword',
          userName: 'test1',
          isEmailVerified: false, },
      });

      // Create a project for this user
      const dto: CreateProjectDto = { name: 'Valid Project', creatorId: user.id };
      const project = await service.create(dto);

      expect(project).toHaveProperty('id');

      // Clean up
      await prisma.project.delete({ where: { id: project.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  // ----------------------------
  // rename project tests
  // ----------------------------
  describe('renameProject', () => {
    it('should fail when renaming a project that does not exist', async () => {
      await expect(service.renameProject(9999, 'DoesNotExist')).rejects.toThrow(
        'Project with id 9999 does not exist',
      );
    });

    it('should rename an existing project successfully', async () => {
      // Create user
      const user = await prisma.user.create({
        data: { email: 'rename@example.com', 
          passwordHash: 'hashedpassword',
          userName: 'test2',
          isEmailVerified: false, },
      });

      // Create project
      const project = await prisma.project.create({
        data: { name: 'Old Name', creatorId: user.id },
      });

      // Rename project
      await service.renameProject(project.id, 'New Name');

      const updated = await prisma.project.findUnique({ where: { id: project.id } });
      expect(updated?.name).toBe('New Name');

      // Cleanup
      await prisma.project.delete({ where: { id: project.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  // ----------------------------
  // save project tests
  // ----------------------------

  describe('saveProject', () => {
    it('should save JSON + thumbnail to S3 for an existing project', async () => {
      // Create a test user + project
      const user = await prisma.user.create({
        data: { email: 'save@test.com', 
          passwordHash: 'pwd',
          userName: 'test3',
          isEmailVerified: false
        }
      });
      const project = await service.create({creatorId : user.id, name: 'SaveTestProject'});

      mockS3Service.uploadJson.mockResolvedValueOnce(undefined);
      mockS3Service.uploadThumbnail.mockResolvedValueOnce(undefined);

      await service.saveProject({projectId: project.id, jsonProject: "{ foo: 'bar' }", thumbnailBase64: `data:image/png;base64,${base64Thumbnail}`});

      expect(mockS3Service.uploadJson).toHaveBeenCalledTimes(1);
      expect(mockS3Service.uploadThumbnail).toHaveBeenCalledTimes(1);
      expect(mockS3Service.uploadJson).toHaveBeenCalledWith(
        project.id,
        "{ foo: 'bar' }", 
      );
      expect(mockS3Service.uploadThumbnail).toHaveBeenCalledWith(
        project.id,
        expect.stringContaining(base64Thumbnail),
      );

      await prisma.project.delete({ where: { id: project.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should throw if project does not exist', async () => {
      await expect(
        service.saveProject({projectId: 9999, jsonProject: "{ foo: 'bar' }", thumbnailBase64: `data:image/png;base64,${base64Thumbnail}`}),
      ).rejects.toThrow('Project 9999 not found');
    });
  });

  
  // ----------------------------
  // get project tests
  // ----------------------------

  describe('getJSONProject', () => {
    it('should return JSONProject string if found in S3', async () => {
      const user = await prisma.user.create({
        data: { email: 'get@test.com', 
          passwordHash: 'pwd',
          userName: 'test4',
          isEmailVerified: false },
      });
      const project = await service.create({creatorId: user.id, name: 'GetTestProject'});

      mockS3Service.getJson.mockResolvedValueOnce(JSON.stringify({ foo: 'bar' }));

      const result = await service.getJSONProject(project.id);

      expect(result).toEqual({ JSONProject: '{"foo":"bar"}' });

      await prisma.project.delete({ where: { id: project.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should throw if project does not exist', async () => {
      await expect(service.getJSONProject(9999)).rejects.toThrow('Project 9999 not found');
    });
  });

  
  // ----------------------------
  // delete project tests
  // ----------------------------

  describe('deleteProject', () => {
    it('should delete project from DB and S3', async () => {
      const user = await prisma.user.create({
        data: { email: 'delete@test.com',  
          passwordHash: 'pwd',
          userName: 'test5',
          isEmailVerified: false
        },
      });
      const project = await service.create({creatorId: user.id, name: 'DeleteTestProject'});

      mockS3Service.deleteProjectFiles.mockResolvedValueOnce(undefined);

      await service.deleteProject({projectId: project.id});

      const deleted = await prisma.project.findUnique({ where: { id: project.id } });
      expect(deleted).toBeNull();
      expect(mockS3Service.deleteProjectFiles).toHaveBeenCalledWith(project.id);

      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should throw if project does not exist', async () => {
      await expect(service.deleteProject({projectId: 9999})).rejects.toThrow('Project 9999 not found');
    });
  });
});