import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsNotEmpty()
  name: string;
}
