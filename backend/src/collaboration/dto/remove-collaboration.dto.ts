import { IsInt } from 'class-validator';

export class RemoveCollaborationDto {
  @IsInt()
  collaborationId: number;
}
