// collaboration.controller.ts
import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { CollaborationService } from './collaboration.service';
import { EditCollaborationDto } from './dto/edit-collaboration.dto';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';

@Controller('collaborations')
export class CollaborationController {
  constructor(private readonly collaborationService: CollaborationService) {}

  @Post()
  addPrjCollaboration(@Body() dto: CreateCollaborationDto) {
    return this.collaborationService.addPrjCollaboration(dto);
  }

  @Get(':projectId')
  listPrjCollaborations(@Param('projectId') projectId: string) {
    return this.collaborationService.listPrjCollaborations(Number(projectId));
  }

  @Patch()
  editCollaborationRole(@Body() dto: EditCollaborationDto) {
    return this.collaborationService.editCollaborationRole(dto);
  }

  @Delete(':collaborationId')
  removeCollaboration(@Param('collaborationId') id: string) {
    return this.collaborationService.removeCollaboration(Number(id));
  }
}
