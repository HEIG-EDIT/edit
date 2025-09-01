import {
  Body,
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Delete,
  Req,
  UseGuards,
  Res,
  UsePipes,
  ValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ProjectService } from './project.service';
import { SaveProjectDto } from './dto/save-project.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { RenameProjectDto } from './dto/rename-project.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import * as authHelp from '../common/helpers/auth.helpers';
import * as http from '../common/helpers/responses/responses.helper';
import * as projectHelper from '../common/helpers/projects_collab.helper';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  /**
   * Create a new project.
   * POST /projects
   * @param {Request} req - The request object containing user information.
   * @param {Response} res - The response object to set headers and status.
   * @param {CreateProjectDto} createProjectDto - The project name.
   * @returns The created project.
   * @throws 201 with the created project on success.
   * @throws 422 if the request body is invalid.
   * @throws 401 if the user is not authenticated.
   * @throws 500 if there is an internal server error.
   */
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  )
  @Post()
  async createProject(
    @Req() req: Request & { user?: authHelp.AuthUserShape },
    @Res({ passthrough: true }) res: Response,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    const userId = Number(authHelp.resolveUserId(req.user));
    const project = await this.projectService.create(userId, createProjectDto);
    return http.created(res, project, `/projects/${project.id}`, {
      noStore: true,
    });
  }

  /**
   * Rename an existing project.
   * PATCH /projects/rename
   * @param {Request} req - The request object containing user information.
   * @param {Response} res - The response object to set headers and status.
   * @param {RenameProjectDto} dto - The project rename details (projectId and new name).
   * @returns void
   * @throws 204 on successful rename.
   * @throws 422 if the request body is invalid.
   * @throws 401 if the user is not authenticated.
   * @throws 403 if the user is not the owner of the project.
   * @throws 404 it the project or user does not exist.
   * @throws 500 if there is an internal server error.
   */
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  )
  @Patch('rename')
  async renameProject(
    @Req() req: Request & { user?: authHelp.AuthUserShape },
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RenameProjectDto,
  ) {
    if (req.user) {
      await this.projectService.renameProject(
        dto.projectId,
        dto.name,
        req.user.userId!,
      );
    }
    return http.noContent(res);
  }

  /**
   * Save project data.
   * PATCH /projects/save
   * @param {Request} req - The request object containing user information.
   * @param {Response} res - The response object to set headers and status.
   * @param {SaveProjectDto} dto - The project save details: projectId, JSONProject, thumbnail.
   * @returns void
   * @throws 204 on successful save.
   * @throws 422 if the request body is invalid.
   * @throws 401 if the user is not authenticated.
   * @throws 403 if the user is not a collaborator on the project.
   * @throws 404 it the project or user does not exist.
   * @throws 500 if there is an internal server error.
   */
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  )
  @Patch('save')
  async saveProject(
    @Req() req: Request & { user?: authHelp.AuthUserShape },
    @Res({ passthrough: true }) res: Response,
    @Body() dto: SaveProjectDto,
  ) {
    // TODO : ajouter check si owner sinon meme viewer peut modifier projet
    await this.projectService.saveProject(dto);
    return http.noContent(res);
  }

  /**
   * Get project data in JSON format.
   * GET /projects/:id/json
   * @param {Request} req - The request object containing user information.
   * @param {Response} res - The response object to set headers and status.
   * @param {string} id - The project ID.
   * @returns The project data in JSON format.
   * @throws 200 with the project data in JSON format on success.
   * @throws 401 if the user is not authenticated.
   * @throws 403 if the user is not a collaborator on the project.
   * @throws 404 it the project or user does not exist.
   * @throws 500 if there is an internal server error.
   */
  @Get(':id/json')
  async getJSONProject(
    @Req() req: Request & { user?: authHelp.AuthUserShape },
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
  ) {
    const pid = Number(id);
    const payload = await this.projectService.getJSONProject(pid); // { JSONProject: string | null }

    // 200 OK
    return http.ok(res, payload);
  }

  /**
   * Delete a project.
   * DELETE /projects/:id
   * @param {Request} req - The request object containing user information.
   * @param {Response} res - The response object to set headers and status.
   * @param {string} id - The project ID.
   * @returns void
   * @throws 204 on successful deletion.
   * @throws 401 if the user is not authenticated.
   * @throws 403 if the user is not the owner of the project.
   * @throws 404 it the project or user does not exist.
   * @throws 500 if there is an internal server error.
   */
  @Delete(':id')
  async deleteProject(
    @Req() req: Request & { user?: authHelp.AuthUserShape },
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string,
  ) {
    await this.projectService.deleteProject(Number(id));
    return http.noContent(res);
  }

  /**
   * List projects accessible to the authenticated user.
   * GET /projects/accessible
   * @param {Request} req - The request object containing user information.
   * @param {Response} res - The response object to set headers and status.
   * @returns A list of accessible projects.
   * @throws 200 with the list of accessible projects on success.
   * @throws 401 if the user is not authenticated.
   * @throws 500 if there is an internal server error.
   */
  @Get('accessible')
  async listAccessibleProjects(
    @Req() req: Request & { user?: authHelp.AuthUserShape },
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = authHelp.resolveUserId(req.user);
    const data = await this.projectService.listAccessibleProjects(
      Number(userId),
    );
    return http.ok(res, data, { noStore: true });
  }

  /**
   * List projects owned by a specific user.
   * GET /projects/owned
   * @param {Request} req - The request object containing user information.
   * @param {Response} res - The response object to set headers and status.
   * @returns A list of projects owned by the specified user.
   * @throws 200 with the list of owned projects on success.
   * @throws 401 if the user is not authenticated.
   * @throws 403 if the user is not the owner of the projects.
   * @throws 404 if the user does not exist.
   * @throws 500 if there is an internal server error.
   */
  @Get('owned')
  async listOwnedProjects(
    @Req() req: Request & { user?: authHelp.AuthUserShape },
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = authHelp.resolveUserId(req.user);
    const data = await this.projectService.listOwnedProjects(Number(userId));
    return http.ok(res, data, { noStore: true });
  }
}
