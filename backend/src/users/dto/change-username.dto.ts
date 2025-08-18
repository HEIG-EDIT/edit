import { IsString, MaxLength } from 'class-validator';

export class ChangeUsernameDto {
  @IsString()
  @MaxLength(30, { message: 'Username must not exceed 30 characters.' })
  userName: string;
}