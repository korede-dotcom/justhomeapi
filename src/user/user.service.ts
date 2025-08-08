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
  
async findAllPackager(userId?: string) {
  // If no userId provided, return all packagers (for backward compatibility)
  if (!userId) {
    return this.prisma.user.findMany({
      where: { role: 'Packager' },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        role: true,
        shopId: true,
        shop: { select: { name: true, location: true } }
      },
    });
  }

  // Get the requesting user's details
  const requestingUser = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, shopId: true }
  });

  if (!requestingUser) {
    throw new BadRequestException('User not found');
  }

  this.logger.debug(`Fetching packagers for user role: ${requestingUser.role}, shopId: ${requestingUser.shopId}`);

  // Admin and CEO can see all packagers
  if (requestingUser.role === 'Admin' || requestingUser.role === 'CEO') {
    this.logger.debug('Admin/CEO user - returning all packagers');
    return this.prisma.user.findMany({
      where: { role: 'Packager' },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        role: true,
        shopId: true,
        shop: { select: { name: true, location: true } }
      },
      orderBy: { fullName: 'asc' }
    });
  }

  // Other roles can only see packagers from their shop
  if (!requestingUser.shopId) {
    this.logger.warn(`User ${userId} has no shop assignment`);
    return [];
  }

  this.logger.debug(`Returning packagers for shop: ${requestingUser.shopId}`);
  return this.prisma.user.findMany({
    where: {
      role: 'Packager',
      shopId: requestingUser.shopId
    },
    select: {
      id: true,
      fullName: true,
      username: true,
      email: true,
      role: true,
      shopId: true,
      shop: { select: { name: true, location: true } }
    },
    orderBy: { fullName: 'asc' }
  });
}


 async createUser(data: any) {
  const { role, shopId, warehouseId, password, ...userData } = data;

  // Validate required fields based on role
  if (['Storekeeper', 'Receptionist', 'Packager', 'Attendee'].includes(role)) {
    if (!shopId) {
      throw new BadRequestException('Shop ID is required for this role');
    }
  }

  if (role === 'WarehouseKeeper') {
    if (!warehouseId) {
      throw new BadRequestException('Warehouse ID is required for WarehouseKeeper role');
    }
  }

  // Handle password - use provided password or generate default
  let hashedPassword: string;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  } else {
    // Generate default password: username + "123"
    const defaultPassword = `${userData.username}123`;
    hashedPassword = await bcrypt.hash(defaultPassword, 10);
    this.logger.log(`Generated default password for user ${userData.username}: ${defaultPassword}`);
  }

  const payload = {
    ...userData,
    password: hashedPassword,
    role,
    ...(shopId && { shopId }),
    ...(warehouseId && { warehouseId })
  };

  try {
    const createdUser = await this.prisma.user.create({
      data: payload,
      include: {
        shop: true,
        warehouse: true
      }
    });

    this.logger.log(`User created successfully: ${createdUser.username} (${createdUser.role})`);

    // Return user without password
    const { password: _, ...userWithoutPassword } = createdUser;
    return userWithoutPassword;

  } catch (error: any) {
    this.logger.error(`Failed to create user: ${error.message}`);

    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      throw new BadRequestException(`${field} already exists`);
    }

    throw new BadRequestException(`Failed to create user: ${error.message}`);
  }
}

  update(id: string, data: any) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async getActivityLogs(limit: number = 50, userId?: string) {
    const where = userId ? { userId } : {};

    return this.prisma.activityLog.findMany({
      where,
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
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }
}
