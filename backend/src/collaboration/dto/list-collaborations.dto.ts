import { IsInt } from 'class-validator';

export class ListCollaborationsDto {
  @IsInt()
  projectId: number;
}
