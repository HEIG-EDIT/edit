// src/email/email.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendVerificationEmail(email: string, url: string) {}
  async sendExistingAccountEmail(email: string) {}
  async sendForgotPasswordEmail() {}
}
