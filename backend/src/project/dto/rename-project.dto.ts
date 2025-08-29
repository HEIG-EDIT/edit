import { IsInt, IsString, MinLength } from 'class-validator';

export class RenameProjectDto {
  @IsInt()
  id: number;

  @IsString()
  @MinLength(1)
  name: string;
}
