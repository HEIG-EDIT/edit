// collaboration.controller.ts
import { Controller, Post, Get, Patch, Delete, Body, Param } from '@nestjs/common';
import { CollaborationService } from './collaboration.service';
import { EditCollaborationDto } from './dto/edit-collaboration.dto';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';
import { ListCollaborationsDto } from './dto/list-collaborations.dto';
import { RemoveCollaborationDto } from './dto/remove-collaboration.dto';

@Controller('collaborations')
export class CollaborationController {
  constructor(private readonly collaborationService: CollaborationService) {}

  @Post()
  addPrjCollaboration(@Body() dto: CreateCollaborationDto) {
    return this.collaborationService.addPrjCollaboration(dto);
  }

  @Get(':projectId')
  listPrjCollaborations(@Body() dto: ListCollaborationsDto) {
    return this.collaborationService.listPrjCollaborations(dto);
  }

  @Patch()
  editCollaborationRole(@Body() dto: EditCollaborationDto) {
    return this.collaborationService.editCollaborationRole(dto);
  }

  @Delete(':collaborationId')
  removeCollaboration(@Body() dto: RemoveCollaborationDto) {
    return this.collaborationService.removeCollaboration(dto);
  }
}
