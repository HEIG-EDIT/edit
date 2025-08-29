import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { CollaborationService } from '../collaboration.service';
import { CreateCollaborationDto } from '../dto/create-collaboration.dto';
import { EditCollaborationDto } from '../dto/edit-collaboration.dto';
import { execSync } from 'child_process';

describe('CollaborationService (integration)', () => {
  let service: CollaborationService;
  let prisma: PrismaService;
  let user: any;
  let project: any;
  let collaboration: any;

  beforeAll(async () => {
    // Start Docker container
    execSync('docker compose up -d', { stdio: 'inherit' });

    // Run migrations
    for (let i = 0; i < 10; i++) {
        try {
            execSync('npx prisma db push', { stdio: 'inherit' });
            break; // success, exit loop
        } catch (err) {
            console.log(`DB not ready yet, retrying... (${i+1}/10)`);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, CollaborationService],
    }).compile();

    prisma = module.get(PrismaService);
    service = module.get(CollaborationService);

    await prisma.$connect();
  }, 50000);

  beforeEach(async () => {
    await prisma.collaboration.deleteMany();
    await prisma.role.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    user = await prisma.user.create({
      data: { email: 'test@example.com', 
        passwordHash: 'hashed', 
        userName: 'test',
        isEmailVerified: false  
      },
    });

    project = await prisma.project.create({
      data: { name: 'My Project', creatorId: user.id },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();

    // Stop docker container
    execSync('docker compose down', { stdio: 'inherit' });
  });

  it('should addPrjCollaboration', async () => {
    const dto: CreateCollaborationDto = {
      userEmail: user.email,
      projectId: project.id,
      roles: ['editor', 'viewer'],
    };

    collaboration = await service.addPrjCollaboration(dto);

    expect(collaboration).toBeDefined();
    expect(collaboration.user.email).toBe(user.email);
    expect(collaboration.roles.map(r => r.name)).toEqual(
      expect.arrayContaining(['editor', 'viewer']),
    );
  });

  it('should listPrjCollaborations (with owner)', async () => {
    await service.addPrjCollaboration({
      userEmail: user.email,
      projectId: project.id,
      roles: ['contributor'],
    });

    const result = await service.listPrjCollaborations(project.id);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userEmail: user.email }),
        expect.objectContaining({ roles: ['owner'] }),
      ]),
    );
  });

  it('should editCollaborationRole', async () => {
    const dto: CreateCollaborationDto = {
      userEmail: user.email,
      projectId: project.id,
      roles: ['viewer'],
    };
    collaboration = await service.addPrjCollaboration(dto);

    const editDto: EditCollaborationDto = {
      collaborationId: collaboration.id,
      roles: ['editor'],
    };

    const updated = await service.editCollaborationRole(editDto);

    expect(updated.roles.map(r => r.name)).toEqual(['editor']);
  });

  it('should removeCollaboration', async () => {
    const dto: CreateCollaborationDto = {
      userEmail: user.email,
      projectId: project.id,
      roles: ['viewer'],
    };
    collaboration = await service.addPrjCollaboration(dto);

    const removed = await service.removeCollaboration(collaboration.id);

    expect(removed.id).toBe(collaboration.id);

    const exists = await prisma.collaboration.findUnique({
      where: { id: collaboration.id },
    });
    expect(exists).toBeNull();
  });
});
