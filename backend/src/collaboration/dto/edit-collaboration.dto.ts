import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class EditCollaborationDto {
  @IsInt()
  collaborationId: number;

  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  roles: string[];
}