// src/email/email.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
    async sendVerification() {}
    async sendForgotPasswordEmail() {}
}
