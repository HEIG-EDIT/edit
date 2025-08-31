import {
  IsInt,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class RenameProjectDto {
  @IsInt()
  @IsNotEmpty()
  projectId: number;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  name: string;
}
