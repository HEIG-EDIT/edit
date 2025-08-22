import { IsInt } from 'class-validator';

export class DeleteProjectDto {
  @IsInt()
  projectId: number;
}
