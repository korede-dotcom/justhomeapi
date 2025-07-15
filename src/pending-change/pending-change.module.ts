import { Module } from '@nestjs/common';
import { PendingChangeService } from './pending-change.service';
import { PendingChangeController } from './pending-change.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [PendingChangeController],
  providers: [PendingChangeService, PrismaService],
})
export class PendingChangeModule {}