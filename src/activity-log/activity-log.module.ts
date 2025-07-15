import { Module } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogController } from './activity-log.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ActivityLogController],
  providers: [ActivityLogService, PrismaService],
})
export class ActivityLogModule {}