import { IsEmail, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCollaborationDto {
  @IsEmail()
  userEmail: string;

  @IsInt()
  projectId: number;

  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  roles: string[];
}
