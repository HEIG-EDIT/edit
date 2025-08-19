import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(14, { message: 'Password too short: must be at least 14 characters' })
  password: string;
}
