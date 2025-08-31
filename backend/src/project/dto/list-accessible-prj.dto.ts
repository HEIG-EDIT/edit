// src/project/dto/list-accessible-prj.dto.ts
import {
  IsInt,
  IsString,
  IsDate,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AccessibleProjectDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  projectId: number;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  projectName: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastSavedAt: Date | null;

  @IsString()
  @IsNotEmpty()
  thumbnail: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(30, { each: true })
  roles: string[];
}
