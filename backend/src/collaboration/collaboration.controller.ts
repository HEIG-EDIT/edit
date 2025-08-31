// collaboration.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import * as authHelp from '../common/helpers/auth.helpers';
import * as http from '../common/helpers/responses/responses.helper';

import { CollaborationService } from './collaboration.service';
import { EditCollaborationDto } from './dto/edit-collaboration.dto';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';

@UseGuards(JwtAuthGuard)
@Controller('collaborations')
export class CollaborationController {
  constructor(private readonly collaborationService: CollaborationService) {}

  //-------------------Add Collaboration to Project-----------------------
  /**
   * POST /collaborations
   * Adds a collaboration to a project.
   * - Requires JWT authentication.
   * - Accepts userEmail, projectId, and role in the request body.
   * - Returns the created collaboration details.
   *
   * @param {Request} req - Express request containing authenticated user payload.
   * @param {Response} res - Express response to set headers and status codes.
   * @param {CreateCollaborationDto} dto - Data transfer object containing userEmail, projectId, and role.
   * @returns The created collaboration details or appropriate error response.
   * @throws 200 OK with collaboration details + no-store header.
   * @throws 422 Unprocessable Entity if validation fails.
   * @throws 401 Unauthorized if user is not authenticated or token is invalid.
   * @throws 403 Forbidden if user lacks permission to add collaborations.
   * @throws 404 Not Found if the specified project or user does not exist.
   * @throws 409 Conflict if the user is already a collaborator on the project.
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
  async addPrjCollaboration(
    @Req() req: Request & { user?: authHelp.AuthUserShape },
    @Res({ passthrough: true }) res: Response,
    @Body() dto: CreateCollaborationDto,
  ) {
    const userId = authHelp.resolveUserId(req.user);
    const result = await this.collaborationService.addPrjCollaboration(
      Number(userId),
      dto,
    );
    return http.ok(res, result, { noStore: true });
  }

  //-------------------List Collaborations of a Project-----------------------
  /**
   * GET /collaborations/:projectId
   * Lists all collaborations for a specific project.
   * - Requires JWT authentication.
   * - Accepts projectId as a URL parameter.
   * - Returns a list of collaborations associated with the project.
   *
   * @param {Request} req - Express request containing authenticated user payload.
   * @param {Response} res - Express response to set headers and status codes.
   * @param {string} projectId - The ID of the project to list collaborations for.
   * @returns A list of collaborations or appropriate error response.
   * @throws 200 OK with list of collaborations + no-store header.
   * @throws 401 Unauthorized if user is not authenticated or token is invalid.
   * @throws 403 Forbidden if user lacks permission to view collaborations for the project.
   * @throws 404 Not Found if the specified project does not exist.
   */
  @Get(':projectId')
  async listPrjCollaborations(
    @Req() req: Request & { user?: authHelp.AuthUserShape },
    @Res({ passthrough: true }) res: Response,
    @Param('projectId') projectId: string,
  ) {
    const userId = authHelp.resolveUserId(req.user);
    const data = await this.collaborationService.listPrjCollaborations(
      Number(userId),
      Number(projectId),
    );
    return http.ok(res, data, { noStore: true });
  }

  //-------------------Edit Collaboration Role-----------------------
  /**
   * PATCH /collaborations
   * Edits the role of an existing collaboration.
   * - Requires JWT authentication.
   * - Accepts collaborationId and new role in the request body.
   * - Returns the updated collaboration details.
   *
   * @param {Request} req - Express request containing authenticated user payload.
   * @param {Response} res - Express response to set headers and status codes.
   * @param {EditCollaborationDto} dto - Data transfer object containing collaborationId and new role.
   * @returns The updated collaboration details or appropriate error response.
   * @throws 200 OK with updated collaboration details + no-store header.
   * @throws 422 Unprocessable Entity if validation fails.
   * @throws 401 Unauthorized if user is not authenticated or token is invalid.
   * @throws 403 Forbidden if user lacks permission to edit the collaboration.
   * @throws 404 Not Found if the specified collaboration does not exist.
   */
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  )
  @Patch()
  async editCollaborationRole(
    @Req() req: Request & { user?: authHelp.AuthUserShape },
    @Res({ passthrough: true }) res: Response,
    @Body() dto: EditCollaborationDto,
  ) {
    const userId = authHelp.resolveUserId(req.user);
    const result = await this.collaborationService.editCollaborationRole(
      Number(userId),
      dto,
    );
    return http.ok(res, result, { noStore: true });
  }

  //-------------------Remove Collaboration-----------------------
  /**
   * DELETE /collaborations/:collaborationId
   * Removes a collaboration from a project.
   * - Requires JWT authentication.
   * - Accepts collaborationId as a URL parameter.
   * - Returns no content on successful deletion.
   *
   * @param {Request} req - Express request containing authenticated user payload.
   * @param {Response} res - Express response to set headers and status codes.
   * @param {string} id - The ID of the collaboration to be removed.
   * @returns No content or appropriate error response.
   * @throws 204 No Content on successful deletion.
   * @throws 401 Unauthorized if user is not authenticated or token is invalid.
   * @throws 403 Forbidden if user lacks permission to remove the collaboration.
   * @throws 404 Not Found if the specified collaboration does not exist.
   */
  @Delete(':collaborationId')
  async removeCollaboration(
    @Req() req: Request & { user?: authHelp.AuthUserShape },
    @Res({ passthrough: true }) res: Response,
    @Param('collaborationId') id: string,
  ) {
    const userId = authHelp.resolveUserId(req.user);
    await this.collaborationService.removeCollaboration(
      Number(userId),
      Number(id),
    );
    return http.noContent(res);
  }
}
