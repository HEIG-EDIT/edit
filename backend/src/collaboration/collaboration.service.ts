import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';
import { EditCollaborationDto } from './dto/edit-collaboration.dto';

@Injectable()
export class CollaborationService {
  constructor(private readonly prisma: PrismaService) {}

  async addPrjCollaboration(dto: CreateCollaborationDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.userEmail } });
    if (!user) throw new NotFoundException(`User ${dto.userEmail} not found`);

    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundException(`Project ${dto.projectId} not found`);

    // Ensure roles exist or create them
    const roleRecords = await Promise.all(
      dto.roles.map(name =>
        this.prisma.role.upsert({
          where: { name },
          update: {},
          create: { name },
        }),
      ),
    );

    // Check if collaboration already exists
    const existingCollaboration = await this.prisma.collaboration.findFirst({
      where: {
        userId: user.id,
        projectId: dto.projectId,
      },
      include: { roles: true },
    });

    if (existingCollaboration) {
      // Get role IDs in DB for this collaboration
      const existingRoleIds = existingCollaboration.roles.map(r => r.id);
      const newRoleIds = roleRecords.map(r => r.id);

      // Check if all new roles already exist
      const allRolesExist = newRoleIds.every(id => existingRoleIds.includes(id));

      if (allRolesExist) {
        throw new ConflictException(
          `Collaboration for user ${dto.userEmail} on project ${dto.projectId} already exists with these roles`,
        );
      }

      // Otherwise, connect the missing roles
      const missingRoleIds = newRoleIds.filter(id => !existingRoleIds.includes(id));

      return this.prisma.collaboration.update({
        where: { id: existingCollaboration.id },
        data: {
          roles: {
            connect: missingRoleIds.map(id => ({ id })),
          },
        },
        include: { user: true, roles: true },
      });
    }

    // Create new collaboration if none exists
    return this.prisma.collaboration.create({
      data: {
        userId: user.id,
        projectId: dto.projectId,
        roles: {
          connect: roleRecords.map(r => ({ id: r.id })),
        },
      },
      include: { user: true, roles: true },
    });
  }

  async listPrjCollaborations(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: id },
      include: { collaborations: { include: { user: true, roles: true } } },
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);

    const collaborations = project.collaborations.map(c => ({
      collaborationId: c.id,
      userEmail: c.user.email,
      roles: c.roles.map(r => r.name),
    }));

    const owner = await this.prisma.user.findUnique({
      where: { id: project.creatorId },
    });

    collaborations.push({
      collaborationId: -1,
      userEmail: owner!.email,
      roles: ['owner'],
    });

    return collaborations;
  }

  async editCollaborationRole(dto: EditCollaborationDto) {
    const collaboration = await this.prisma.collaboration.findUnique({
      where: { id: dto.collaborationId },
    });
    if (!collaboration) throw new NotFoundException(`Collaboration ${dto.collaborationId} not found`);

    const roleRecords = await Promise.all(
      dto.roles.map(name =>
        this.prisma.role.upsert({
          where: { name },
          update: {},
          create: { name },
        }),
      ),
    );

    return this.prisma.collaboration.update({
      where: { id: dto.collaborationId },
      data: {
        roles: {
          set: roleRecords.map(r => ({ id: r.id })), // replaces roles
        },
      },
      include: { user: true, roles: true },
    });
  }

  async removeCollaboration(id: number) {
    return this.prisma.collaboration.delete({
      where: { id: id },
    });
  }
}
