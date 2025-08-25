import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class SaveProjectDto {
  @IsInt()
  projectId: number;

  @IsString()
  @IsNotEmpty()
  jsonProject: string;

  @IsString()
  @IsNotEmpty()
  thumbnailBase64: string; // client sends a base64-encoded PNG
}
