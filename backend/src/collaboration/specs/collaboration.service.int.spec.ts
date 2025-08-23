import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { CollaborationService } from '../collaboration.service';
import { CreateCollaborationDto } from '../dto/create-collaboration.dto';
import { EditCollaborationDto } from '../dto/edit-collaboration.dto';
import { ListCollaborationsDto } from '../dto/list-collaborations.dto';
import { RemoveCollaborationDto } from '../dto/remove-collaboration.dto';

describe('CollaborationService (integration)', () => {
  let service: CollaborationService;
  let prisma: PrismaService;
  let user: any;
  let project: any;
  let collaboration: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, CollaborationService],
    }).compile();

    prisma = module.get(PrismaService);
    service = module.get(CollaborationService);

    await prisma.$connect();
  });

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

    const result = await service.listPrjCollaborations({
      projectId: project.id,
    } as ListCollaborationsDto);

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

    const removed = await service.removeCollaboration({
      collaborationId: collaboration.id,
    } as RemoveCollaborationDto);

    expect(removed.id).toBe(collaboration.id);

    const exists = await prisma.collaboration.findUnique({
      where: { id: collaboration.id },
    });
    expect(exists).toBeNull();
  });
});
