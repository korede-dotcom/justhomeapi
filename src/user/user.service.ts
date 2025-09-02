import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(query?: { page?: number; size?: number; search?: string; role?: string; shopId?: string; warehouseId?: string; isActive?: boolean; all?: boolean }, requestingUserId?: string, requestingUserInfo?: { role?: string; shopId?: string }) {
    const page = query?.page || 1;
    const size = Math.min(query?.size || 20, 100);
    const search = query?.search;
    const role = query?.role;
    const shopId = query?.shopId;
    const warehouseId = query?.warehouseId;
    const isActive = query?.isActive;
    const fetchAll = query?.all || false;

    try {
      // Use JWT token information if available, otherwise fall back to database lookup
      let requestingUser = null;
      if (requestingUserId) {
        if (requestingUserInfo?.role && requestingUserInfo?.shopId !== undefined) {
          // Use information from JWT token (more efficient)
          requestingUser = {
            id: requestingUserId,
            role: requestingUserInfo.role,
            shopId: requestingUserInfo.shopId,
            shop: null, // Will be populated later if needed
            warehouse: null
          };
          this.logger.debug(`Using JWT token info for user ${requestingUserId}: role=${requestingUserInfo.role}, shopId=${requestingUserInfo.shopId}`);
        } else {
          // Fall back to database lookup
          requestingUser = await this.prisma.user.findUnique({
            where: { id: requestingUserId },
            select: {
              id: true,
              role: true,
              shopId: true,
              warehouseId: true,
              shop: { select: { name: true } },
              warehouse: { select: { name: true } }
            }
          });

          if (!requestingUser) {
            throw new BadRequestException('Requesting user not found');
          }
          this.logger.debug(`Using database lookup for user ${requestingUserId}: role=${requestingUser.role}, shopId=${requestingUser.shopId}`);
        }
      }

      // Build where clause for filtering
      const whereClause: any = {};

      // Apply role-based filtering
      if (requestingUser) {
        const { role: userRole, shopId: userShopId } = requestingUser;

        this.logger.debug(`Applying access control for user ${requestingUserId}: role=${userRole}, shopId=${userShopId}`);

        // CEO, Admin, and WarehouseKeeper can see all users (no additional restrictions)
        if (!['CEO', 'Admin', 'WarehouseKeeper'].includes(userRole)) {
          // For other roles, restrict to their shop
          if (userShopId) {
            whereClause.shopId = userShopId;
            this.logger.debug(`Non-admin user ${requestingUserId} restricted to shop: ${userShopId}`);
          } else {
            // If user has no shop assignment, they can only see themselves
            whereClause.id = requestingUserId;
            this.logger.debug(`User ${requestingUserId} has no shop assignment, can only see themselves`);
          }
        } else {
          this.logger.debug(`Admin/CEO/WarehouseKeeper user ${requestingUserId} can access all users`);
        }
      }

      // Apply additional filters (these can override or combine with role-based restrictions)
      // For admin users, these filters work as expected
      // For non-admin users, these filters work within their shop scope
      if (role) {
        whereClause.role = role;
      }

      // Only allow shopId override for admin users
      if (shopId && requestingUser && ['CEO', 'Admin', 'WarehouseKeeper'].includes(requestingUser.role)) {
        whereClause.shopId = shopId;
      }

      // Only allow warehouseId override for admin users
      if (warehouseId && requestingUser && ['CEO', 'Admin', 'WarehouseKeeper'].includes(requestingUser.role)) {
        whereClause.warehouseId = warehouseId;
      }

      // Filter by active status if provided
      if (isActive !== undefined) {
        whereClause.isActive = isActive;
      }

      // Add search functionality across multiple fields
      if (search) {
        whereClause.OR = [
          { username: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get users with or without pagination
      const [users, totalUsers] = await Promise.all([
        this.prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            role: true,
            isActive: true,
            createdAt: true,
            lastLogin: true,
            shopId: true,
            warehouseId: true,
            shop: {
              select: { id: true, name: true, location: true, isActive: true }
            },
            warehouse: {
              select: { id: true, name: true, location: true, isActive: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          ...(fetchAll ? {} : {
            skip: (page - 1) * size,
            take: size
          })
        }),
        this.prisma.user.count({
          where: whereClause
        })
      ]);

      // Return different structure based on fetchAll parameter
      if (fetchAll) {
        return {
          users,
          summary: {
            totalUsers,
            activeUsers: users.filter(u => u.isActive).length,
            inactiveUsers: users.filter(u => !u.isActive).length,
            roles: [...new Set(users.map(u => u.role))].length,
            usersWithShops: users.filter(u => u.shopId).length,
            usersWithWarehouses: users.filter(u => u.warehouseId).length
          },
          accessInfo: {
            requestingUserRole: requestingUser?.role || 'Unknown',
            requestingUserShop: requestingUser?.shop?.name || null,
            requestingUserWarehouse: requestingUser?.warehouse?.name || null,
            hasFullAccess: requestingUser ? ['CEO', 'Admin', 'WarehouseKeeper'].includes(requestingUser.role) : false,
            scopeRestriction: requestingUser && !['CEO', 'Admin', 'WarehouseKeeper'].includes(requestingUser.role)
              ? (requestingUser.shopId ? 'shop' : 'self')
              : 'none'
          },
          filters: {
            search: search || null,
            role: role || null,
            shopId: requestingUser && ['CEO', 'Admin', 'WarehouseKeeper'].includes(requestingUser.role) ? (shopId || null) : (requestingUser?.shopId || null),
            warehouseId: requestingUser && ['CEO', 'Admin', 'WarehouseKeeper'].includes(requestingUser.role) ? (warehouseId || null) : null,
            isActive: isActive !== undefined ? isActive : null
          }
        };
      }

      const totalPages = Math.ceil(totalUsers / size);

      return {
        data: users,
        page,
        size,
        total: totalUsers,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
        summary: {
          totalUsers,
          activeUsers: users.filter(u => u.isActive).length,
          inactiveUsers: users.filter(u => !u.isActive).length,
          roles: [...new Set(users.map(u => u.role))].length,
          usersWithShops: users.filter(u => u.shopId).length,
          usersWithWarehouses: users.filter(u => u.warehouseId).length
        },
        accessInfo: {
          requestingUserRole: requestingUser?.role || 'Unknown',
          requestingUserShop: requestingUser?.shop?.name || null,
          requestingUserWarehouse: requestingUser?.warehouse?.name || null,
          hasFullAccess: requestingUser ? ['CEO', 'Admin', 'WarehouseKeeper'].includes(requestingUser.role) : false,
          scopeRestriction: requestingUser && !['CEO', 'Admin', 'WarehouseKeeper'].includes(requestingUser.role)
            ? (requestingUser.shopId ? 'shop' : 'self')
            : 'none'
        },
        filters: {
          search: search || null,
          role: role || null,
          shopId: requestingUser && ['CEO', 'Admin', 'WarehouseKeeper'].includes(requestingUser.role) ? (shopId || null) : (requestingUser?.shopId || null),
          warehouseId: requestingUser && ['CEO', 'Admin', 'WarehouseKeeper'].includes(requestingUser.role) ? (warehouseId || null) : null,
          isActive: isActive !== undefined ? isActive : null
        }
      };
    } catch (error: any) {
      this.logger.error(`Failed to fetch users: ${error.message}`);
      throw new BadRequestException(`Failed to fetch users: ${error.message}`);
    }
  }
  
async findAllPackager(userId?: string, query?: { page?: number; size?: number; search?: string; shopId?: string; isActive?: boolean; all?: boolean }) {
  const page = query?.page || 1;
  const size = Math.min(query?.size || 20, 100);
  const search = query?.search;
  const shopIdFilter = query?.shopId;
  const isActive = query?.isActive;
  const fetchAll = query?.all || false;

  try {
    // Build base where clause for packagers
    const baseWhereClause: any = {
      role: 'Packager',
      ...(isActive !== undefined && { isActive })
    };

    // Add search functionality
    if (search) {
      baseWhereClause.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // If no userId provided, return all packagers (for backward compatibility)
    if (!userId) {
      const whereClause = {
        ...baseWhereClause,
        ...(shopIdFilter && { shopId: shopIdFilter })
      };

      if (fetchAll) {
        const packagers = await this.prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
            shopId: true,
            shop: { select: { id: true, name: true, location: true, isActive: true } }
          },
          orderBy: { fullName: 'asc' }
        });

        return {
          packagers,
          summary: {
            totalPackagers: packagers.length,
            activePackagers: packagers.filter(p => p.isActive).length,
            inactivePackagers: packagers.filter(p => !p.isActive).length,
            packagersWithShops: packagers.filter(p => p.shopId).length
          }
        };
      }

      const [packagers, total] = await Promise.all([
        this.prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
            shopId: true,
            shop: { select: { id: true, name: true, location: true, isActive: true } }
          },
          orderBy: { fullName: 'asc' },
          skip: (page - 1) * size,
          take: size
        }),
        this.prisma.user.count({ where: whereClause })
      ]);

      const totalPages = Math.ceil(total / size);

      return {
        data: packagers,
        page,
        size,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
        summary: {
          totalPackagers: total,
          activePackagers: packagers.filter(p => p.isActive).length,
          inactivePackagers: packagers.filter(p => !p.isActive).length,
          packagersWithShops: packagers.filter(p => p.shopId).length
        }
      };
    }

    // Get the requesting user's details
    const requestingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, shopId: true, shop: { select: { name: true } } }
    });

    if (!requestingUser) {
      throw new BadRequestException('User not found');
    }

    this.logger.debug(`Fetching packagers for user role: ${requestingUser.role}, shopId: ${requestingUser.shopId}`);

    // Determine shop filter based on user role and permissions
    let finalShopFilter = shopIdFilter;

    // Admin and CEO can see all packagers or filter by specific shop
    if (requestingUser.role === 'Admin' || requestingUser.role === 'CEO') {
      this.logger.debug('Admin/CEO user - can access all packagers');
      // Use shopIdFilter if provided, otherwise no shop restriction
    } else {
      // Other roles can only see packagers from their shop
      if (!requestingUser.shopId) {
        this.logger.warn(`User ${userId} has no shop assignment`);
        return fetchAll ? { packagers: [], summary: { totalPackagers: 0, activePackagers: 0, inactivePackagers: 0, packagersWithShops: 0 } } : { data: [], page, size, total: 0, totalPages: 0, hasNext: false, hasPrevious: false, summary: { totalPackagers: 0, activePackagers: 0, inactivePackagers: 0, packagersWithShops: 0 } };
      }

      // Override shop filter to user's shop for non-admin users
      finalShopFilter = requestingUser.shopId;
      this.logger.debug(`Non-admin user - restricting to shop: ${requestingUser.shopId}`);
    }

    const whereClause = {
      ...baseWhereClause,
      ...(finalShopFilter && { shopId: finalShopFilter })
    };

    if (fetchAll) {
      const packagers = await this.prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          fullName: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
          shopId: true,
          shop: { select: { id: true, name: true, location: true, isActive: true } }
        },
        orderBy: { fullName: 'asc' }
      });

      return {
        packagers,
        summary: {
          totalPackagers: packagers.length,
          activePackagers: packagers.filter(p => p.isActive).length,
          inactivePackagers: packagers.filter(p => !p.isActive).length,
          packagersWithShops: packagers.filter(p => p.shopId).length
        },
        requestingUserShop: requestingUser.shop?.name || null
      };
    }

    const [packagers, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          fullName: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
          shopId: true,
          shop: { select: { id: true, name: true, location: true, isActive: true } }
        },
        orderBy: { fullName: 'asc' },
        skip: (page - 1) * size,
        take: size
      }),
      this.prisma.user.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(total / size);

    return {
      data: packagers,
      page,
      size,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      summary: {
        totalPackagers: total,
        activePackagers: packagers.filter(p => p.isActive).length,
        inactivePackagers: packagers.filter(p => !p.isActive).length,
        packagersWithShops: packagers.filter(p => p.shopId).length
      },
      requestingUserShop: requestingUser.shop?.name || null,
      filters: {
        search: search || null,
        shopId: finalShopFilter || null,
        isActive: isActive !== undefined ? isActive : null
      }
    };

  } catch (error: any) {
    this.logger.error(`Failed to fetch packagers: ${error.message}`);
    if (error instanceof BadRequestException) {
      throw error;
    }
    throw new BadRequestException(`Failed to fetch packagers: ${error.message}`);
  }
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
