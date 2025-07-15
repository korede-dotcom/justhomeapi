import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PendingChangeService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.pendingChange.findMany({ orderBy: { submittedAt: 'desc' } });
  }

  create(data: any) {
    return this.prisma.pendingChange.create({
      data: {
        ...data,
        submittedAt: new Date(),
        status: 'pending',
      },
    });
  }

  updateStatus(id: string, status: 'approved' | 'rejected') {
    return this.prisma.pendingChange.update({
      where: { id },
      data: { status },
    });
  }
}