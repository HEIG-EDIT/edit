import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { SaveProjectDto } from './dto/save-project.dto';
import { S3Service } from '../s3/s3.service';
import { AccessibleProjectDto } from './dto/list-accessible-prj.dto';
import * as authHelp from '../common/helpers/auth.helpers';
import * as projectHelper from '../common/helpers/projects_collab.helper';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  /**
   * Create a new project.
   * @param userId
   * @param createProjectDto
   * @return The created project.
   */
  async create(userId: number, createProjectDto: CreateProjectDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} does not exist`); // UPDATED
    }

    // Create the project
    const project = await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        creatorId: userId,
      },
      select: {
        id: true, // return id
      },
    });

    // Ensure role owner exists or create it
    const ownerRole = await this.prisma.role.upsert({
      where: { name: 'owner' },
      update: {},
      create: { name: 'owner' },
    });

    // Create the collaboration for project creator = owner
    await this.prisma.collaboration.create({
      data: {
        userId: userId,
        projectId: project.id,
        roles: {
          connect: { id: ownerRole.id },
        },
      },
      include: { user: true, roles: true },
    });

    return project;
  }

  /**
   * Rename a project.
   * @param id
   * @param name
   * @param userId
   */
  async renameProject(id: number, name: string, userId: number): Promise<void> {
    await projectHelper.assertOwner(this.prisma, userId, id);

    // Check if project exists
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new NotFoundException(`Project with id ${id} does not exist`);
    }

    await this.prisma.project.update({
      where: { id },
      data: { name },
    });

    return;
  }

  /**
   * Save project data (JSON and thumbnail) to S3 and update last saved date in DB.
   * @param dto
   */
  async saveProject(dto: SaveProjectDto, userId: number): Promise<void> {
    const { projectId, jsonProject } = dto;
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        collaborations: {
          where: { userId },
          include: { roles: true },
        },
      },
    });
    if (!project)
      throw new NotFoundException(`Project ${dto.projectId} not found`);

    // Check permissions
    const userRoles = project.collaborations.flatMap((c) =>
      c.roles.map((r) => r.name),
    );

    const allowedRoles = ["owner", "editor"];

    const hasPermission = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasPermission) {
      throw new ForbiddenException("You do not have permission to save this project");
    }

    // validate JSON string is actually JSON
    try {
      JSON.parse(jsonProject);
    } catch {
      throw new BadRequestException('jsonProject must be valid JSON');
    }

    // run uploads in parallel so we don’t partially write on failure and it’s faster
    await Promise.all([
      this.s3Service.uploadJson(projectId, jsonProject),
      this.s3Service.uploadThumbnail(dto.projectId, dto.thumbnailBase64),
    ]);

    // Update DB with last saved date
    await this.prisma.project.update({
      where: { id: dto.projectId },
      data: { lastSavedAt: new Date() },
    });
  }

  /**
   * Get project JSON data from S3.
   * @param projectId
   * @return The project JSON data or null if not found.
   */

  async getJSONProject(
    projectId: number,
  ): Promise<{ JSONProject: string | null }> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);

    const json = await this.s3Service.getJson(projectId);
    /*if (!json) {
      throw new NotFoundException('Json fro project ${projectId} not found');
    }*/
    return { JSONProject: json };
  }

  /**
   * Delete a project and its files from S3.
   * @param id
   */
  async deleteProject(id: number): Promise<void> {
    const project = await this.prisma.project.findUnique({ where: { id: id } });
    if (!project) throw new NotFoundException(`Project ${id} not found`);

    const userId = authHelp.resolveUserId({ userId: project.creatorId });
    await projectHelper.assertOwner(this.prisma, Number(userId), Number(id));

    await this.s3Service.deleteProjectFiles(id);
    await this.prisma.project.delete({ where: { id: id } });
  }

  /**
   * List all projects accessible by a user (as collaborator).
   * @param userId
   * @return List of accessible projects with roles.
   */
  async listAccessibleProjects(
    userId: number,
  ): Promise<AccessibleProjectDto[]> {
    // Get projects where user is collaborator
    const collaborations = await this.prisma.collaboration.findMany({
      where: { userId },
      include: {
        project: true,
        roles: true,
      },
    });

    // Prepare results
    const results: AccessibleProjectDto[] = [];

    // Collaborator projects
    for (const collab of collaborations) {
      const thumbnail = await this.s3Service.getThumbnail(collab.project.id);
      results.push({
        projectId: collab.project.id,
        projectName: collab.project.name,
        createdAt: collab.project.createdAt,
        lastSavedAt: collab.project.lastSavedAt,
        thumbnail,
        roles: collab.roles.map((r) => r.name),
      });
    }

    return results;
  }

  /**
   * List all projects owned by a user (as owner).
   * @param userId
   * @return List of owned projects with roles.
   */
  async listOwnedProjects(userId: number): Promise<AccessibleProjectDto[]> {
    // Get projects where user is collaborator
    const collaborations = await this.prisma.collaboration.findMany({
      where: {
        userId,
        roles: {
          some: {
            name: 'owner',
          },
        },
      },
      include: {
        project: true,
        roles: true,
      },
    });

    // Prepare results
    const results: AccessibleProjectDto[] = [];

    // Owned projects (role = owner)
    for (const collab of collaborations) {
      const thumbnail = await this.s3Service.getThumbnail(collab.project.id);
      results.push({
        projectId: collab.project.id,
        projectName: collab.project.name,
        createdAt: collab.project.createdAt,
        lastSavedAt: collab.project.lastSavedAt,
        thumbnail,
        roles: collab.roles.map((r) => r.name),
      });
    }

    return results;
  }
}
