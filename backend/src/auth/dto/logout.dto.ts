import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class LogoutDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : String(value ?? ''),
  )
  deviceId: string;
}
