import { Injectable, BadRequestException, NotFoundException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { SaveProjectDto } from './dto/save-project.dto';
import { DeleteProjectDto } from './dto/delete-project.dto';
import { S3Service } from '../s3/s3.service';

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
      throw new BadRequestException(
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

    return project;
  }

  async renameProject(id: number, name: string): Promise<void> {
    // Check if project exists
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
        throw new Error(`Project with id ${id} does not exist`);
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

  async deleteProject(dto: DeleteProjectDto): Promise<void> {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundException(`Project ${dto.projectId} not found`);

    await this.s3Service.deleteProjectFiles(dto.projectId);
    await this.prisma.project.delete({ where: { id: dto.projectId } });
  }
}
