import { Module } from '@nestjs/common';
import { CollaborationService } from './collaboration.service';
import { CollaborationController } from './collaboration.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CollaborationController],
  providers: [CollaborationService, PrismaService],
  exports: [CollaborationService],
})
export class CollaborationModule {}
