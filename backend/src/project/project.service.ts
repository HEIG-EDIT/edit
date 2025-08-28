import { Injectable, BadRequestException, NotFoundException} from '@nestjs/common';
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

  async create(createProjectDto: CreateProjectDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createProjectDto.creatorId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with id ${createProjectDto.creatorId} does not exist`,
      );
    }

    // Create the project
    const project = await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        creatorId: createProjectDto.creatorId,
      },
      select: {
        id: true, // return id
      },
    });

    // Ensure role owner exists or create it
    const ownerRole = await this.prisma.role.upsert({
      where: { name: "owner" },
      update: {},
      create: { name: "owner" },
    });

    // Create the collaboration for project creator = owner
    this.prisma.collaboration.create({
        data: {
        userId: createProjectDto.creatorId,
        projectId: project.id,
        roles: {
            connect: { id: ownerRole.id },
        },
        },
        include: { user: true, roles: true },
    });

    return project;
  }

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
  }

  async saveProject(dto: SaveProjectDto): Promise<void> {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundException(`Project ${dto.projectId} not found`);

    await this.s3Service.uploadJson(dto.projectId, dto.jsonProject);
    await this.s3Service.uploadThumbnail(dto.projectId, dto.thumbnailBase64);

    // Update DB with last saved date
    const url = `s3://${process.env.AWS_S3_BUCKET}/${dto.projectId}/`;
    await this.prisma.project.update({
      where: { id: dto.projectId },
      data: { lastSavedAt: new Date() },
    });
  }

  async getJSONProject(projectId: number): Promise<{ JSONProject: string }> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);

    const json = await this.s3Service.getJson(projectId);
    return { JSONProject: json };
  }

  async deleteProject(id: number): Promise<void> {
    const project = await this.prisma.project.findUnique({ where: { id: id } });
    if (!project) throw new NotFoundException(`Project ${id} not found`);

    await this.s3Service.deleteProjectFiles(id);
    await this.prisma.project.delete({ where: { id: id } });
  }

  async listAccessibleProjects(userId: number): Promise<AccessibleProjectDto[]> {
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
        roles: collab.roles.map(r => r.name),
      });
    }

    return results;
  }

  async listOwnedProjects(userId: number): Promise<AccessibleProjectDto[]> {
    // Get projects where user is collaborator
    const collaborations = await this.prisma.collaboration.findMany({
      where: {
        userId,
        roles: {
          some: {
            name: "owner",
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
        roles: collab.roles.map(r => r.name),
      });
    }

    return results;
  }
}
