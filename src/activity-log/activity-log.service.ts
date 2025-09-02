import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(private prisma: PrismaService) {}
    
async findAll(query?: { page?: number; size?: number; limit?: number; userId?: string; search?: string }) {
  const page = query?.page || 1;
  // Use size if provided, otherwise fall back to limit, with default of 20
  const size = query?.size || query?.limit || 20;
  const pageSize = Math.min(size, 100); // Cap at 100
  const userId = query?.userId;
  const search = query?.search;

  const whereClause: any = {};

  // Filter by user ID if provided
  if (userId) {
    whereClause.userId = userId;
  }

  // Add search functionality across action and details
  if (search) {
    whereClause.OR = [
      { action: { contains: search, mode: 'insensitive' } },
      { details: { contains: search, mode: 'insensitive' } },
      { user: {
          OR: [
            { username: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      }
    ];
  }

  const [activityLogs, total] = await Promise.all([
    this.prisma.activityLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            role: true
          }
        }
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    this.prisma.activityLog.count({
      where: whereClause
    })
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data: activityLogs,
    page,
    size: pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
    filters: {
      userId: userId || null,
      search: search || null
    }
  };
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