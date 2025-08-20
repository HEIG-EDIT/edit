import { IsOptional, IsString, IsIn } from 'class-validator';

/**
 * DTO for changing 2FA method.
 * - Allows setting a method (e.g., 'totp', 'email', 'sms') or disabling it by sending null.
 */
export class ChangeTwoFaDto {
  @IsString()
  @IsIn(['enable2fa', 'disable2fa'], {
    message: "action must be 'enable2fa' or 'disable2fa'",
  })
  action!: 'enable2fa' | 'disable2fa';

  @IsOptional()
  @IsString()
  @IsIn(['totp', 'email'], {
    message: "method must be one of: 'totp' or 'email'",
  })
  method?: 'totp' | 'email';
}
