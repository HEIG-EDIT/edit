import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { CollaborationService } from '../collaboration.service';
import { CreateCollaborationDto } from '../dto/create-collaboration.dto';
import { EditCollaborationDto } from '../dto/edit-collaboration.dto';
import { execSync } from 'child_process';

jest.setTimeout(60000); // allow enough time for docker + db

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
  });

  // Clean DB before each test
  beforeEach(async () => {
    await prisma.collaboration.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
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

  // ========== addPrjCollaboration ==========
  describe('addPrjCollaboration', () => {
    it('should allow owner to add a collaborator with valid roles', async () => {
      const owner = await prisma.user.create({
        data: { email: 'owner@example.com', passwordHash: 'pwd', userName: 'owner', isEmailVerified: false },
      });
      const project = await prisma.project.create({
        data: { name: 'Proj', creatorId: owner.id },
      });

      // Ensure owner is in collaboration with owner role
      const role = await prisma.role.upsert({
        where: { name: 'owner' },
        update: {},
        create: { name: 'owner' },
      });
      await prisma.collaboration.create({
        data: { userId: owner.id, projectId: project.id, roles: { connect: [{ id: role.id }] } },
      });

      const user = await prisma.user.create({
        data: { email: 'collab@example.com', passwordHash: 'pwd', userName: 'collab', isEmailVerified: false },
      });

      const result = await service.addPrjCollaboration(owner.id, {
        userEmail: user.email,
        projectId: project.id,
        roles: ['viewer'],
      });

      expect(result.user.email).toBe(user.email);
      expect(result.roles.map((r) => r.name)).toContain('viewer');
    });

    it('should throw if role is invalid', async () => {
      const owner = await prisma.user.create({
        data: { email: 'owner2@example.com', passwordHash: 'pwd', userName: 'owner2', isEmailVerified: false },
      });
      const project = await prisma.project.create({
        data: { name: 'Proj2', creatorId: owner.id },
      });

      const role = await prisma.role.upsert({
        where: { name: 'owner' },
        update: {},
        create: { name: 'owner' },
      });
      await prisma.collaboration.create({
        data: { userId: owner.id, projectId: project.id, roles: { connect: [{ id: role.id }] } },
      });

      const stranger = await prisma.user.create({
        data: { email: 'stranger@example.com', passwordHash: 'pwd', userName: 'stranger', isEmailVerified: false },
      });

      await expect(
        service.addPrjCollaboration(owner.id, {
          userEmail: stranger.email,
          projectId: project.id,
          roles: ['invalidRole'],
        }),
      ).rejects.toThrow();
    });
  });

  // ========== listPrjCollaborations ==========
  describe('listPrjCollaborations', () => {
    it('should list all collaborations for a project', async () => {
      const owner = await prisma.user.create({
        data: { email: 'list-owner@example.com', passwordHash: 'pwd', userName: 'listOwner', isEmailVerified: false },
      });
      const project = await prisma.project.create({
        data: { name: 'Proj3', creatorId: owner.id },
      });
      const roleOwner = await prisma.role.upsert({
        where: { name: 'owner' },
        update: {},
        create: { name: 'owner' },
      });
      await prisma.collaboration.create({
        data: { userId: owner.id, projectId: project.id, roles: { connect: [{ id: roleOwner.id }] } },
      });

      const viewer = await prisma.user.create({
        data: { email: 'viewer@example.com', passwordHash: 'pwd', userName: 'viewer', isEmailVerified: false },
      });
      const roleViewer = await prisma.role.upsert({
        where: { name: 'viewer' },
        update: {},
        create: { name: 'viewer' },
      });
      await prisma.collaboration.create({
        data: { userId: viewer.id, projectId: project.id, roles: { connect: [{ id: roleViewer.id }] } },
      });

      const collaborations = await service.listPrjCollaborations(owner.id, project.id);

      expect(collaborations).toHaveLength(2);
      expect(collaborations.some((c) => c.userEmail === viewer.email)).toBe(true);
    });
  });

  // ========== editCollaborationRole ==========
  describe('editCollaborationRole', () => {
    it('should allow owner to edit collaborator roles', async () => {
      const owner = await prisma.user.create({
        data: { email: 'edit-owner@example.com', passwordHash: 'pwd', userName: 'editOwner', isEmailVerified: false },
      });
      const project = await prisma.project.create({
        data: { name: 'Proj4', creatorId: owner.id },
      });
      const roleOwner = await prisma.role.upsert({
        where: { name: 'owner' },
        update: {},
        create: { name: 'owner' },
      });
      await prisma.collaboration.create({
        data: { userId: owner.id, projectId: project.id, roles: { connect: [{ id: roleOwner.id }] } },
      });

      const collabUser = await prisma.user.create({
        data: { email: 'toedit@example.com', passwordHash: 'pwd', userName: 'toEdit', isEmailVerified: false },
      });
      const roleViewer = await prisma.role.upsert({
        where: { name: 'viewer' },
        update: {},
        create: { name: 'viewer' },
      });
      const collab = await prisma.collaboration.create({
        data: { userId: collabUser.id, projectId: project.id, roles: { connect: [{ id: roleViewer.id }] } },
      });

      const updated = await service.editCollaborationRole(owner.id, {
        collaborationId: collab.id,
        roles: ['editor'],
      });

      expect(updated.roles.map((r) => r.name)).toEqual(['editor']);
    });
  });

  // ========== removeCollaboration ==========
  describe('removeCollaboration', () => {
    it('should allow owner to remove a collaboration', async () => {
      const owner = await prisma.user.create({
        data: { email: 'rem-owner@example.com', passwordHash: 'pwd', userName: 'remOwner', isEmailVerified: false },
      });
      const project = await prisma.project.create({
        data: { name: 'Proj5', creatorId: owner.id },
      });
      const roleOwner = await prisma.role.upsert({
        where: { name: 'owner' },
        update: {},
        create: { name: 'owner' },
      });
      await prisma.collaboration.create({
        data: { userId: owner.id, projectId: project.id, roles: { connect: [{ id: roleOwner.id }] } },
      });

      const collabUser = await prisma.user.create({
        data: { email: 'remove@example.com', passwordHash: 'pwd', userName: 'removeU', isEmailVerified: false },
      });
      const roleViewer = await prisma.role.upsert({
        where: { name: 'viewer' },
        update: {},
        create: { name: 'viewer' },
      });
      const collab = await prisma.collaboration.create({
        data: { userId: collabUser.id, projectId: project.id, roles: { connect: [{ id: roleViewer.id }] } },
      });

      await service.removeCollaboration(owner.id, collab.id);

      const remaining = await prisma.collaboration.findMany({ where: { projectId: project.id } });
      expect(remaining.some((c) => c.userId === collabUser.id)).toBe(false);
    });

    it('should not allow removing creator collaboration', async () => {
      const owner = await prisma.user.create({
        data: { email: 'rem-creator@example.com', passwordHash: 'pwd', userName: 'remCreator', isEmailVerified: false },
      });
      const project = await prisma.project.create({
        data: { name: 'Proj6', creatorId: owner.id },
      });
      const roleOwner = await prisma.role.upsert({
        where: { name: 'owner' },
        update: {},
        create: { name: 'owner' },
      });
      const collab = await prisma.collaboration.create({
        data: { userId: owner.id, projectId: project.id, roles: { connect: [{ id: roleOwner.id }] } },
      });

      await expect(service.removeCollaboration(owner.id, collab.id)).rejects.toThrow(
        'Cannot remove collaboration for project creator',
      );
    });
  });
});