import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Match } from '../../common/decorators/match.decorator';

/**
 * DTO for changing a user's password.
 * - currentPassword: required, no strength validation (just correctness).
 * - newPassword: validated for strength (length, complexity).
 * - repeatPassword: must match newPassword.
 */
export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(10, {
    message: 'Password too short: must be at least 10 characters',
  })
  @MaxLength(64, {
    message: 'Password too long: must be at most 64 characters',
  })
  @Matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*[\W_]).+/, {
    message: 'Password too weak: must include upper, lower, and symbol',
  })
  newPassword: string;

  @IsString()
  @Match('newPassword', { message: 'Passwords do not match' })
  repeatPassword: string;
}
