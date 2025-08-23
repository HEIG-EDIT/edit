import { Body, Controller, Post, Patch , Get, Param, Delete } from '@nestjs/common';
import { ProjectService } from './project.service';
import { SaveProjectDto } from './dto/save-project.dto';
import { DeleteProjectDto } from './dto/delete-project.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { RenameProjectDto } from './dto/rename-project.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async createProject(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @Patch('rename')
  async renameProject(@Body() dto: RenameProjectDto) {
    await this.projectService.renameProject(dto.id, dto.name);
    return; // no output required
  }

  @Patch('save')
  async saveProject(@Body() dto: SaveProjectDto) {
    await this.projectService.saveProject(dto);
    return;
  }

  @Get(':id/json')
  async getJSONProject(@Param('id') id: string) {
    return this.projectService.getJSONProject(Number(id));
  }

  @Delete()
  async deleteProject(@Body() dto: DeleteProjectDto) {
    await this.projectService.deleteProject(dto);
    return;
  }

  @Get('accessible/:userId')
    async listAccessibleProjects(@Param('userId') userId: string) {
    return this.projectService.listAccessibleProjects(Number(userId));
  }

}
