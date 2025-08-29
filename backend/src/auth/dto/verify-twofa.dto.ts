import { IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Verifies a 2FA challenge.
 * - twofaToken: opaque token returned by /me/2fa/start
 * - code: the code user typed (TOTP or 6-digit email/SMS)
 */
export class VerifyTwoFaDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : String(value ?? ''),
  )
  @IsString()
  twofaToken!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : String(value ?? ''),
  )
  @IsString()
  @Length(1, 64) // TOTP or short numeric code
  code!: string;
}
