import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(private prisma: PrismaService) {}
    
findAll() {
  return this.prisma.activityLog.findMany({
    orderBy: { timestamp: 'desc' },
    include: {
      user: true, // ✅ This will pull user details
    },
  });
}

async create(data: any) {
    this.logger.log(`Creating activity log entry: ${JSON.stringify(data)}`);
    
    if (!data.action) {
      this.logger.warn('No action provided for activity log entry.', JSON.stringify(data));
      throw new BadRequestException('Action is required for activity log entry.');
    }

    data.timestamp = new Date();

    try {
      this.logger.log(`Creating activity log entry: ${data.action}`);
      return await this.prisma.activityLog.create({ data });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Failed to create activity log', err.stack || err.message);
      throw new BadRequestException('Failed to create activity log');
    }
  }
    update(id: string, data: any) {
        return this.prisma.activityLog.update({ where: { id }, data });
    }
}