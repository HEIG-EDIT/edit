// src/auth/dto/register.dto.ts
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

/*
 * Set up Check for email format
 * Set up Check for password policy (Length, content,..)
 * Ensures the format is correct before hitting the database.
 */

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(10, {
    message: 'Password too short: must be at least 10 characters',
  })
  @MaxLength(64, {
    message: 'Password too long: must be at most 64 characters',
  })
  // at least one uppercase, one lowercase, one number, one symbol:
  @Matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*[\W_]).+/, {
    message: 'Password too weak: must include upper, lower, and symbol',
  })
  password: string;
}
