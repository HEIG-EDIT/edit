// src/auth/dto/signup.dto.ts
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

/*
 * Set up Check for email format
 * Set up Check for password policy (Length, content,..)
 * Ensures the format is correct before hitting the database.
 */

export class SignupDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(64)
    // at least one uppercase, one lowercase, one number, one symbol:
    @Matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).+/, {
        message:
            'Password too weak: must include upper, lower, number, and symbol',
    })
    password: string;
}
