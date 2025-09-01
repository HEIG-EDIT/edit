import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(10, {
    message: 'Password too short: must be at least 10 characters',
  })
  password: string;
}
