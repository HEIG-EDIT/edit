import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for changing user email.
 * - Trims whitespace.
 * - Ensures the input is a valid email.
 * - Restricts max length to 255 characters.
 */
export class ChangeEmailDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : String(value ?? ''),
  )
  @IsEmail({}, { message: 'Invalid email format.' })
  @IsNotEmpty({ message: 'Email cannot be empty.' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters.' })
  email!: string;
}
