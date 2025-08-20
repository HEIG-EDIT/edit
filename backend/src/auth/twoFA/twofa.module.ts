// twofa.module.ts
import { Module } from '@nestjs/common';
import { TwoFaService } from './twofa.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [TwoFaService, PrismaService],
  exports: [TwoFaService],
})
export class TwoFaModule {}
