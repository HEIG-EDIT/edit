import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';
import { EditCollaborationDto } from './dto/edit-collaboration.dto';
import * as projectHelper from '../common/helpers/projects_collab.helper';

@Injectable()
export class CollaborationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Add a collaboration to a project.
   * @param currentUserId
   * @param dto
   */
  async addPrjCollaboration(
    currentUserId: number,
    dto: CreateCollaborationDto,
  ) {
    await projectHelper.assertOwner(this.prisma, currentUserId, dto.projectId);
    const user = await this.prisma.user.findUnique({
      where: { email: dto.userEmail },
    });
    if (!user) throw new NotFoundException(`User ${dto.userEmail} not found`);

    await projectHelper.assertProjectExists(this.prisma, dto.projectId);

    // Ensure roles exist or create them
    const roleRecords = await Promise.all(
      dto.roles.map((name) =>
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
      const existingRoleIds = existingCollaboration.roles.map((r) => r.id);
      const newRoleIds = roleRecords.map((r) => r.id);

      // Check if all new roles already exist
      const allRolesExist = newRoleIds.every((id) =>
        existingRoleIds.includes(id),
      );
      if (allRolesExist) {
        throw new ConflictException(
          `Collaboration for user ${dto.userEmail} on project ${dto.projectId} already exists with these roles`,
        );
      }

      // Otherwise, connect the missing roles
      const missingRoleIds = newRoleIds.filter(
        (id) => !existingRoleIds.includes(id),
      );

      return this.prisma.collaboration.update({
        where: { id: existingCollaboration.id },
        data: {
          roles: {
            connect: missingRoleIds.map((id) => ({ id })),
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
          connect: roleRecords.map((r) => ({ id: r.id })),
        },
      },
      include: { user: true, roles: true },
    });
  }

  /**
   * List all collaborations for a project.
   * @param currentUserId
   * @param projectId
   */
  async listPrjCollaborations(currentUserId: number, projectId: number) {
    await projectHelper.assertCollaborator(
      this.prisma,
      currentUserId,
      projectId,
    );

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { collaborations: { include: { user: true, roles: true } } },
    });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);

    const collaborations = project.collaborations.map((c) => ({
      collaborationId: c.id,
      userEmail: c.user.email,
      roles: c.roles.map((r) => r.name),
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

  /**
   * Edit roles for a collaboration.
   * @param currentUserId
   * @param dto
   */

  async editCollaborationRole(
    currentUserId: number,
    dto: EditCollaborationDto,
  ) {
    const collaboration = await this.prisma.collaboration.findUnique({
      where: { id: dto.collaborationId },
      include: { project: true }, // include project to get creatorId
    });

    if (!collaboration)
      throw new NotFoundException(
        `Collaboration ${dto.collaborationId} not found`,
      );

    await projectHelper.assertOwner(
      this.prisma,
      currentUserId,
      collaboration.project.id,
    );

    // Ensure project creator always has "owner" role
    if (collaboration.userId === collaboration.project.creatorId) {
      if (!dto.roles.includes('owner')) {
        throw new BadRequestException(
          'Cannot remove "owner" role from project creator',
        );
      }
    }

    const roleRecords = await Promise.all(
      dto.roles.map((name) =>
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
          set: roleRecords.map((r) => ({ id: r.id })), // replaces roles
        },
      },
      include: { user: true, roles: true },
    });
  }

  /**
   * Remove a collaboration by its ID.
   * @param currentUserId
   * @param id
   */
  async removeCollaboration(currentUserId: number, id: number) {
    const collaboration = await this.prisma.collaboration.findUnique({
      where: { id },
      include: { project: true }, // include project to get creatorId
    });

    if (!collaboration)
      throw new NotFoundException(`Collaboration ${id} not found`);

    // Only owner of the project can remove a collaboration
    await projectHelper.assertOwner(
      this.prisma,
      currentUserId,
      collaboration.project.id,
    );

    // Prevent deleting collaboration for project creator
    if (collaboration.userId === collaboration.project.creatorId) {
      throw new BadRequestException(
        'Cannot remove collaboration for project creator',
      );
    }
    return this.prisma.collaboration.delete({
      where: { id: id },
    });
  }
}
