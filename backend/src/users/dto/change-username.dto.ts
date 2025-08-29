import { IsNotEmpty, IsString, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for changing user username.
 * - Trims whitespace.
 * - Ensures the input is a valid string type.
 * - Restricts max length to 30 characters.
 * - Validates against a regex pattern allowing only alphanumeric characters, dots, underscores, and hyphens.
 */
export class ChangeUsernameDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : String(value ?? ''),
  )
  @IsString()
  @IsNotEmpty({ message: 'Username cannot be empty.' })
  @MaxLength(30, { message: 'Username must not exceed 30 characters.' })
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'Username may only contain letters, numbers, dot (.), underscore (_) and hyphen (-).',
  })
  userName!: string;
}
