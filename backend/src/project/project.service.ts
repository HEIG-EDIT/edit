import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { SaveProjectDto } from './dto/save-project.dto';
import { S3Service } from '../s3/s3.service';
import { AccessibleProjectDto } from './dto/list-accessible-prj.dto';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  /**
   * Create a new project.
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
   */
  async renameProject(id: number, name: string): Promise<void> {
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
  async saveProject(dto: SaveProjectDto): Promise<void> {
    const { projectId, jsonProject } = dto;
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project)
      throw new NotFoundException(`Project ${dto.projectId} not found`);

    //TODO: Diana Check
    // validate JSON string is actually JSON --> optional but good to have
    try {
      JSON.parse(jsonProject);
    } catch {
      throw new BadRequestException('jsonProject must be valid JSON');
    }

    //TODO: Diana Check
    // run uploads in parallel so we don’t partially write on failure and it’s faster
    await Promise.all([
      this.s3Service.uploadJson(projectId, jsonProject),
      this.s3Service.uploadThumbnail(dto.projectId, dto.thumbnailBase64),
    ]);

    //TODO: Diana Check
    // This one is not used, I don't know if we will need it in the future
    //const url = `s3://${process.env.AWS_S3_BUCKET}/${dto.projectId}/`;

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

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);

    const json = await this.s3Service.getJson(projectId);
    if(!json){
      throw new NotFoundException('Json fro project ${projectId} not found');
    }
    return { JSONProject: json! };
  }

  /**
   * Delete a project and its files from S3.
   * @param id
   */
  async deleteProject(id: number): Promise<void> {
    const project = await this.prisma.project.findUnique({ where: { id: id } });
    if (!project) throw new NotFoundException(`Project ${id} not found`);

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
