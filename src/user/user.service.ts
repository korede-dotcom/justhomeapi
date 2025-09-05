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
  const { role, shopId, warehouseId, warehouseIds, password, ...userData } = data;

  // Validate role is correct (case-sensitive)
  const validRoles = ['CEO', 'Admin', 'Attendee', 'Receptionist', 'Cashier', 'Packager', 'Storekeeper', 'Customer', 'Warehouse', 'WarehouseKeeper'];
  if (!validRoles.includes(role)) {
    // Check for common misspellings
    if (role.toLowerCase() === 'warehousekeeper') {
      throw new BadRequestException(`Invalid role '${role}'. Did you mean 'WarehouseKeeper' (with capital K)? Valid roles are: ${validRoles.join(', ')}`);
    }
    throw new BadRequestException(`Invalid role '${role}'. Valid roles are: ${validRoles.join(', ')}`);
  }

  // Validate required fields based on role
  if (['Storekeeper', 'Receptionist', 'Packager', 'Attendee'].includes(role)) {
    if (!shopId) {
      throw new BadRequestException('Shop ID is required for this role');
    }
  }

  // Handle warehouse assignment for WarehouseKeeper
  let primaryWarehouseId = warehouseId;
  let managedWarehouseIds: string[] = [];

  if (role === 'WarehouseKeeper'  ) {
    // Support both single warehouseId and multiple warehouseIds
    if (warehouseIds && Array.isArray(warehouseIds) && warehouseIds.length > 0) {
      // Multiple warehouses provided
      managedWarehouseIds = warehouseIds;
      primaryWarehouseId = warehouseIds[0]; // Use first warehouse as primary assignment
      this.logger.debug(`WarehouseKeeper will manage ${managedWarehouseIds.length} warehouses, primary: ${primaryWarehouseId}`);
    } else if (warehouseId) {
      // Single warehouse provided
      primaryWarehouseId = warehouseId;
      managedWarehouseIds = [warehouseId];
      this.logger.debug(`WarehouseKeeper will manage single warehouse: ${primaryWarehouseId}`);
    } else {
      throw new BadRequestException('Warehouse ID(s) required for WarehouseKeeper role. Provide either warehouseId or warehouseIds array');
    }

    // Validate all warehouses exist and are active
    const warehouses = await this.prisma.warehouse.findMany({
      where: { id: { in: managedWarehouseIds } },
      select: { id: true, name: true, isActive: true }
    });

    if (warehouses.length !== managedWarehouseIds.length) {
      const foundIds = warehouses.map(w => w.id);
      const missingIds = managedWarehouseIds.filter(id => !foundIds.includes(id));
      throw new BadRequestException(`Warehouses not found: ${missingIds.join(', ')}`);
    }

    const inactiveWarehouses = warehouses.filter(w => !w.isActive);
    if (inactiveWarehouses.length > 0) {
      throw new BadRequestException(`Cannot assign inactive warehouses: ${inactiveWarehouses.map(w => w.name).join(', ')}`);
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

  // Create payload without warehouseIds (not a valid Prisma field)
  const { warehouseIds: _, ...cleanUserData } = userData;
  const payload = {
    ...cleanUserData,
    password: hashedPassword,
    role,
    ...(shopId && { shopId }),
    ...(primaryWarehouseId && { warehouseId: primaryWarehouseId })
  };

  try {
    // Create user with primary warehouse assignment
    const createdUser = await this.prisma.user.create({
      data: payload,
      include: {
        shop: true,
        warehouse: true,
        managedWarehouses: true
      }
    });

    // If WarehouseKeeper with multiple warehouses, assign them as managed warehouses
    if (role === 'WarehouseKeeper' && managedWarehouseIds.length > 0) {
      await this.prisma.user.update({
        where: { id: createdUser.id },
        data: {
          managedWarehouses: {
            connect: managedWarehouseIds.map(id => ({ id }))
          }
        }
      });

      // Fetch updated user with managed warehouses
      const updatedUser = await this.prisma.user.findUnique({
        where: { id: createdUser.id },
        include: {
          shop: true,
          warehouse: true,
          managedWarehouses: {
            select: { id: true, name: true, location: true, isActive: true }
          }
        }
      });

      this.logger.log(`WarehouseKeeper created with ${managedWarehouseIds.length} managed warehouses: ${createdUser.username}`);

      // Return user without password
      const { password: _, ...userWithoutPassword } = updatedUser!;
      return userWithoutPassword;
    }

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
    this.logger.log(`${JSON.stringify(data)}`);
    return this.prisma.user.update({ where: { id }, data });
  }

  async assignWarehouseToUser(userId: string, warehouseId: string) {
    try {
      this.logger.debug(`Assigning warehouse ${warehouseId} to user ${userId}`);

      // Validate user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, fullName: true, role: true, warehouseId: true }
      });

      if (!user) {
        throw new BadRequestException(`User with ID ${userId} not found`);
      }

      // Validate warehouse exists if warehouseId is not "none" or null
      if (warehouseId && warehouseId !== "none") {
        const warehouse = await this.prisma.warehouse.findUnique({
          where: { id: warehouseId },
          select: { id: true, name: true, location: true, isActive: true }
        });

        if (!warehouse) {
          throw new BadRequestException(`Warehouse with ID ${warehouseId} not found`);
        }

        if (!warehouse.isActive) {
          throw new BadRequestException(`Cannot assign user to inactive warehouse: ${warehouse.name}`);
        }
      }

      // Update user's warehouse assignment
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          warehouseId: warehouseId === "none" ? null : warehouseId
        },
        include: {
          warehouse: {
            select: { id: true, name: true, location: true, isActive: true }
          },
          shop: {
            select: { id: true, name: true, location: true, isActive: true }
          }
        }
      });

      this.logger.log(`Successfully assigned warehouse to user ${user.username}`);

      return {
        success: true,
        message: warehouseId === "none"
          ? `Removed warehouse assignment from user ${user.fullName}`
          : `Assigned warehouse to user ${user.fullName}`,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          fullName: updatedUser.fullName,
          role: updatedUser.role,
          warehouse: updatedUser.warehouse,
          shop: updatedUser.shop
        }
      };

    } catch (error: any) {
      this.logger.error(`Failed to assign warehouse to user: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to assign warehouse: ${error.message}`);
    }
  }

  async assignWarehousesToMultipleUsers(warehouseId: string, userIds: string[]) {
    try {
      this.logger.debug(`Assigning warehouse ${warehouseId} to multiple users: ${userIds.join(', ')}`);

      // Validate warehouse exists if not "none"
      if (warehouseId && warehouseId !== "none") {
        const warehouse = await this.prisma.warehouse.findUnique({
          where: { id: warehouseId },
          select: { id: true, name: true, location: true, isActive: true }
        });

        if (!warehouse) {
          throw new BadRequestException(`Warehouse with ID ${warehouseId} not found`);
        }

        if (!warehouse.isActive) {
          throw new BadRequestException(`Cannot assign users to inactive warehouse: ${warehouse.name}`);
        }
      }

      // Validate all users exist
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, username: true, fullName: true, role: true }
      });

      if (users.length !== userIds.length) {
        const foundIds = users.map(u => u.id);
        const missingIds = userIds.filter(id => !foundIds.includes(id));
        throw new BadRequestException(`Users not found: ${missingIds.join(', ')}`);
      }

      // Update all users' warehouse assignments
      const updateResult = await this.prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: {
          warehouseId: warehouseId === "none" ? null : warehouseId
        }
      });

      // Get updated users for response
      const updatedUsers = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        include: {
          warehouse: {
            select: { id: true, name: true, location: true, isActive: true }
          },
          shop: {
            select: { id: true, name: true, location: true, isActive: true }
          }
        }
      });

      this.logger.log(`Successfully assigned warehouse to ${updateResult.count} users`);

      return {
        success: true,
        message: warehouseId === "none"
          ? `Removed warehouse assignment from ${updateResult.count} users`
          : `Assigned warehouse to ${updateResult.count} users`,
        updatedCount: updateResult.count,
        users: updatedUsers.map(user => ({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          warehouse: user.warehouse,
          shop: user.shop
        }))
      };

    } catch (error: any) {
      this.logger.error(`Failed to assign warehouse to multiple users: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to assign warehouse to users: ${error.message}`);
    }
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

  async assignMultipleWarehousesToUser(userId: string, warehouseIds: string[]) {
    try {
      this.logger.debug(`Assigning multiple warehouses to user ${userId}: ${warehouseIds.join(', ')}`);

      // Validate user exists and has appropriate role
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          managedWarehouses: {
            select: { id: true, name: true, location: true, isActive: true }
          }
        }
      });

      if (!user) {
        throw new BadRequestException(`User with ID ${userId} not found`);
      }

      // Check if user has appropriate role to manage warehouses
      const validRoles = ['CEO', 'Admin', 'WarehouseKeeper'];
      if (!validRoles.includes(user.role)) {
        throw new BadRequestException(`User ${user.fullName} with role '${user.role}' cannot manage warehouses. Valid roles: ${validRoles.join(', ')}`);
      }

      // Validate all warehouses exist and are active
      const warehouses = await this.prisma.warehouse.findMany({
        where: { id: { in: warehouseIds } },
        select: { id: true, name: true, location: true, isActive: true }
      });

      if (warehouses.length !== warehouseIds.length) {
        const foundIds = warehouses.map(w => w.id);
        const missingIds = warehouseIds.filter(id => !foundIds.includes(id));
        throw new BadRequestException(`Warehouses not found: ${missingIds.join(', ')}`);
      }

      // Check for inactive warehouses
      const inactiveWarehouses = warehouses.filter(w => !w.isActive);
      if (inactiveWarehouses.length > 0) {
        throw new BadRequestException(`Cannot assign inactive warehouses: ${inactiveWarehouses.map(w => w.name).join(', ')}`);
      }

      // Get current managed warehouses to avoid duplicates
      const currentWarehouseIds = user.managedWarehouses.map(w => w.id);
      const newWarehouseIds = warehouseIds.filter(id => !currentWarehouseIds.includes(id));

      if (newWarehouseIds.length === 0) {
        return {
          success: true,
          message: `User ${user.fullName} is already managing all specified warehouses`,
          user: {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            managedWarehouses: user.managedWarehouses
          },
          summary: {
            totalManagedWarehouses: user.managedWarehouses.length,
            newAssignments: 0,
            alreadyManaging: warehouseIds.length
          }
        };
      }

      // Update user to manage the new warehouses (connect additional warehouses)
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          managedWarehouses: {
            connect: newWarehouseIds.map(id => ({ id }))
          }
        },
        include: {
          managedWarehouses: {
            select: { id: true, name: true, location: true, isActive: true }
          },
          warehouse: {
            select: { id: true, name: true, location: true, isActive: true }
          },
          shop: {
            select: { id: true, name: true, location: true, isActive: true }
          }
        }
      });

      this.logger.log(`Successfully assigned ${newWarehouseIds.length} new warehouses to user ${user.username}`);

      return {
        success: true,
        message: `Assigned ${newWarehouseIds.length} new warehouses to ${user.fullName}. Total managed warehouses: ${updatedUser.managedWarehouses.length}`,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          fullName: updatedUser.fullName,
          role: updatedUser.role,
          managedWarehouses: updatedUser.managedWarehouses,
          assignedWarehouse: updatedUser.warehouse,
          assignedShop: updatedUser.shop
        },
        summary: {
          totalManagedWarehouses: updatedUser.managedWarehouses.length,
          newAssignments: newWarehouseIds.length,
          alreadyManaging: warehouseIds.length - newWarehouseIds.length,
          newlyAssignedWarehouses: warehouses.filter(w => newWarehouseIds.includes(w.id))
        }
      };

    } catch (error: any) {
      this.logger.error(`Failed to assign multiple warehouses to user: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to assign warehouses: ${error.message}`);
    }
  }

  async addWarehousesToKeeper(keeperId: string, warehouseIds: string[]) {
    try {
      this.logger.debug(`Adding warehouses to WarehouseKeeper ${keeperId}: ${warehouseIds.join(', ')}`);

      // Validate WarehouseKeeper exists and has correct role
      const keeper = await this.prisma.user.findUnique({
        where: { id: keeperId },
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          managedWarehouses: {
            select: { id: true, name: true, location: true, isActive: true }
          }
        }
      });

      if (!keeper) {
        throw new BadRequestException(`User with ID ${keeperId} not found`);
      }

      if (keeper.role !== 'WarehouseKeeper') {
        throw new BadRequestException(`User ${keeper.fullName} is not a WarehouseKeeper. Current role: ${keeper.role}`);
      }

      // Validate all warehouses exist and are active
      const warehouses = await this.prisma.warehouse.findMany({
        where: { id: { in: warehouseIds } },
        select: { id: true, name: true, location: true, isActive: true }
      });

      if (warehouses.length !== warehouseIds.length) {
        const foundIds = warehouses.map(w => w.id);
        const missingIds = warehouseIds.filter(id => !foundIds.includes(id));
        throw new BadRequestException(`Warehouses not found: ${missingIds.join(', ')}`);
      }

      // Check for inactive warehouses
      const inactiveWarehouses = warehouses.filter(w => !w.isActive);
      if (inactiveWarehouses.length > 0) {
        throw new BadRequestException(`Cannot assign inactive warehouses: ${inactiveWarehouses.map(w => w.name).join(', ')}`);
      }

      // Get current managed warehouses to avoid duplicates
      const currentWarehouseIds = keeper.managedWarehouses.map(w => w.id);
      const newWarehouseIds = warehouseIds.filter(id => !currentWarehouseIds.includes(id));

      if (newWarehouseIds.length === 0) {
        return {
          success: true,
          message: `WarehouseKeeper ${keeper.fullName} is already managing all specified warehouses`,
          keeper: {
            id: keeper.id,
            username: keeper.username,
            fullName: keeper.fullName,
            role: keeper.role,
            managedWarehouses: keeper.managedWarehouses
          },
          summary: {
            totalManagedWarehouses: keeper.managedWarehouses.length,
            newAssignments: 0,
            alreadyManaging: warehouseIds.length
          }
        };
      }

      // Add new warehouses to keeper's managed list
      const updatedKeeper = await this.prisma.user.update({
        where: { id: keeperId },
        data: {
          managedWarehouses: {
            connect: newWarehouseIds.map(id => ({ id }))
          }
        },
        include: {
          managedWarehouses: {
            select: { id: true, name: true, location: true, isActive: true }
          }
        }
      });

      this.logger.log(`Successfully added ${newWarehouseIds.length} warehouses to WarehouseKeeper ${keeper.username}`);

      return {
        success: true,
        message: `Added ${newWarehouseIds.length} new warehouses to ${keeper.fullName}. Total managed warehouses: ${updatedKeeper.managedWarehouses.length}`,
        keeper: {
          id: updatedKeeper.id,
          username: updatedKeeper.username,
          fullName: updatedKeeper.fullName,
          role: updatedKeeper.role,
          managedWarehouses: updatedKeeper.managedWarehouses
        },
        summary: {
          totalManagedWarehouses: updatedKeeper.managedWarehouses.length,
          newAssignments: newWarehouseIds.length,
          alreadyManaging: warehouseIds.length - newWarehouseIds.length,
          newlyAddedWarehouses: warehouses.filter(w => newWarehouseIds.includes(w.id))
        }
      };

    } catch (error: any) {
      this.logger.error(`Failed to add warehouses to WarehouseKeeper: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to add warehouses: ${error.message}`);
    }
  }

  async removeWarehousesFromKeeper(keeperId: string, warehouseIds: string[]) {
    try {
      this.logger.debug(`Removing warehouses from WarehouseKeeper ${keeperId}: ${warehouseIds.join(', ')}`);

      // Validate WarehouseKeeper exists and has correct role
      const keeper = await this.prisma.user.findUnique({
        where: { id: keeperId },
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          managedWarehouses: {
            select: { id: true, name: true, location: true, isActive: true }
          }
        }
      });

      if (!keeper) {
        throw new BadRequestException(`User with ID ${keeperId} not found`);
      }

      if (keeper.role !== 'WarehouseKeeper') {
        throw new BadRequestException(`User ${keeper.fullName} is not a WarehouseKeeper. Current role: ${keeper.role}`);
      }

      // Check which warehouses the keeper is currently managing
      const currentWarehouseIds = keeper.managedWarehouses.map(w => w.id);
      const warehousesToRemove = warehouseIds.filter(id => currentWarehouseIds.includes(id));

      if (warehousesToRemove.length === 0) {
        return {
          success: true,
          message: `WarehouseKeeper ${keeper.fullName} is not managing any of the specified warehouses`,
          keeper: {
            id: keeper.id,
            username: keeper.username,
            fullName: keeper.fullName,
            role: keeper.role,
            managedWarehouses: keeper.managedWarehouses
          },
          summary: {
            totalManagedWarehouses: keeper.managedWarehouses.length,
            removedAssignments: 0,
            notManaging: warehouseIds.length
          }
        };
      }

      // Remove warehouses from keeper's managed list
      const updatedKeeper = await this.prisma.user.update({
        where: { id: keeperId },
        data: {
          managedWarehouses: {
            disconnect: warehousesToRemove.map(id => ({ id }))
          }
        },
        include: {
          managedWarehouses: {
            select: { id: true, name: true, location: true, isActive: true }
          }
        }
      });

      // Get details of removed warehouses for response
      const removedWarehouses = await this.prisma.warehouse.findMany({
        where: { id: { in: warehousesToRemove } },
        select: { id: true, name: true, location: true, isActive: true }
      });

      this.logger.log(`Successfully removed ${warehousesToRemove.length} warehouses from WarehouseKeeper ${keeper.username}`);

      return {
        success: true,
        message: `Removed ${warehousesToRemove.length} warehouses from ${keeper.fullName}. Remaining managed warehouses: ${updatedKeeper.managedWarehouses.length}`,
        keeper: {
          id: updatedKeeper.id,
          username: updatedKeeper.username,
          fullName: updatedKeeper.fullName,
          role: updatedKeeper.role,
          managedWarehouses: updatedKeeper.managedWarehouses
        },
        summary: {
          totalManagedWarehouses: updatedKeeper.managedWarehouses.length,
          removedAssignments: warehousesToRemove.length,
          removedWarehouses: removedWarehouses
        }
      };

    } catch (error: any) {
      this.logger.error(`Failed to remove warehouses from WarehouseKeeper: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to remove warehouses: ${error.message}`);
    }
  }

  async getManagedWarehouses(keeperId: string, requestingUserId: string, requestingUserRole: string) {
    try {
      this.logger.debug(`Getting managed warehouses for keeper ${keeperId}, requested by ${requestingUserId} (${requestingUserRole})`);

      // Validate requesting user permissions
      const isAdmin = ['CEO', 'Admin'].includes(requestingUserRole);
      const isSelfRequest = keeperId === requestingUserId;

      if (!isAdmin && !isSelfRequest) {
        throw new BadRequestException('Access denied. You can only view your own managed warehouses or you must be an admin.');
      }

      // Get the WarehouseKeeper's details
      const keeper = await this.prisma.user.findUnique({
        where: { id: keeperId },
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          isActive: true,
          managedWarehouses: {
            select: {
              id: true,
              name: true,
              location: true,
              description: true,
              isActive: true,
              _count: {
                select: {
                  products: true,
                  users: true,
                  productAssignments: true
                }
              }
            },
            orderBy: { name: 'asc' }
          }
        }
      });

      if (!keeper) {
        throw new BadRequestException(`User with ID ${keeperId} not found`);
      }

      if (keeper.role !== 'WarehouseKeeper') {
        throw new BadRequestException(`User ${keeper.fullName} is not a WarehouseKeeper. Current role: ${keeper.role}`);
      }

      this.logger.log(`Retrieved ${keeper.managedWarehouses.length} managed warehouses for ${keeper.username}`);

      return {
        success: true,
        keeper: {
          id: keeper.id,
          username: keeper.username,
          fullName: keeper.fullName,
          role: keeper.role,
          isActive: keeper.isActive
        },
        managedWarehouses: keeper.managedWarehouses,
        summary: {
          totalManagedWarehouses: keeper.managedWarehouses.length,
          activeWarehouses: keeper.managedWarehouses.filter(w => w.isActive).length,
          inactiveWarehouses: keeper.managedWarehouses.filter(w => !w.isActive).length,
          totalProducts: keeper.managedWarehouses.reduce((sum, w) => sum + w._count.products, 0),
          totalUsers: keeper.managedWarehouses.reduce((sum, w) => sum + w._count.users, 0),
          totalAssignments: keeper.managedWarehouses.reduce((sum, w) => sum + w._count.productAssignments, 0)
        },
        accessInfo: {
          requestedBy: requestingUserId,
          requestingUserRole,
          isAdminRequest: isAdmin,
          isSelfRequest
        }
      };

    } catch (error: any) {
      this.logger.error(`Failed to get managed warehouses for keeper ${keeperId}: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to get managed warehouses: ${error.message}`);
    }
  }

}
