import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany(
       { orderBy: { createdAt: 'desc' }}
    );
  }
async findAllPackager() {
  return this.prisma.user.findMany({
    where: { role: 'Packager' },
    select: {
      id: true,
      fullName: true,
      username: true,
      email: true,
      role: true,
    },
  });
}


 async create(data:  any) {
    this.logger.log(`Creating user: ${data.email}`);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      this.logger.warn(`User with email ${data.email} already exists.`);
      throw new BadRequestException('User with this email already exists.');
    }

    const passwordToHash = data.password || 'fileopen';
    if (!data.password) {
      this.logger.warn(`No password provided for ${data.email}, using default password.`);
    }

    data.password = await bcrypt.hash(passwordToHash, 10);

    const user = await this.prisma.user.create({ data });
    this.logger.log(`User created: ${user.id}`);

    return user;
  }

  update(id: string, data: any) {
    return this.prisma.user.update({ where: { id }, data });
  }
}