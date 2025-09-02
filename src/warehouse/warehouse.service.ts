import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WarehouseService {
  private readonly logger = new Logger(WarehouseService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    try {
      this.logger.debug(`Creating warehouse: ${JSON.stringify(data)}`);

      // Filter out invalid fields that don't exist in the Warehouse model
      const validData: any = {
        name: data.name,
        location: data.location,
        description: data.description,
        managerId: data.managerId,
        isActive: data.isActive !== undefined ? data.isActive : true
      };

      // Remove undefined fields
      Object.keys(validData).forEach(key => {
        if (validData[key] === undefined) {
          delete validData[key];
        }
      });

      this.logger.debug(`Filtered warehouse data: ${JSON.stringify(validData)}`);

      // If managerId is provided, verify the user exists
      if (validData.managerId) {
        const manager = await this.prisma.user.findUnique({
          where: { id: validData.managerId }
        });
        if (!manager) {
          this.logger.error(`Manager with ID ${validData.managerId} not found`);
          throw new BadRequestException(`Manager with ID ${validData.managerId} not found`);
        }
        this.logger.debug(`Manager found: ${manager.username} (${manager.role})`);
      }

      const warehouse = await this.prisma.warehouse.create({
        data: validData,
        include: {
          manager: {
            select: { id: true, username: true, fullName: true, role: true }
          }
        }
      });

      this.logger.debug(`Warehouse created successfully: ${warehouse.id}`);
      return warehouse;
    } catch (error: any) {
      this.logger.error(`Failed to create warehouse: ${error.message}`);
      this.logger.error(`Error details: ${JSON.stringify(error)}`);

      if (error.code === 'P2002') {
        throw new BadRequestException('A warehouse with this name already exists');
      } else if (error.code === 'P2003') {
        throw new BadRequestException('Invalid manager ID provided');
      } else if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new BadRequestException(`Failed to create warehouse: ${error.message}`);
      }
    }
  }

  async findAll() {
    return this.prisma.warehouse.findMany({
      include: {
        manager: {
          select: { id: true, username: true, fullName: true, role: true, email: true }
        },
        users: {
          select: { id: true, username: true, fullName: true, role: true, email: true }
        },
        products: {
          include: {
            category: {
              select: { id: true, name: true, description: true }
            }
          }
        },
        productAssignments: {
          include: {
            product: {
              select: { id: true, name: true, price: true }
            },
            shop: {
              select: { id: true, name: true, location: true }
            },
            assignedByUser: {
              select: { id: true, username: true, fullName: true }
            }
          }
        },
        _count: {
          select: {
            products: true,
            users: true,
            productAssignments: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  async findOne(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        manager: {
          select: { id: true, username: true, fullName: true, role: true, email: true }
        },
        users: {
          select: { id: true, username: true, fullName: true, role: true, email: true }
        },
        products: {
          include: {
            category: {
              select: { id: true, name: true, description: true }
            }
          },
          orderBy: {
            name: 'asc'
          }
        },
        productAssignments: {
          include: {
            product: {
              select: { id: true, name: true, price: true, totalStock: true, availableStock: true }
            },
            shop: {
              select: { id: true, name: true, location: true, isActive: true }
            },
            assignedByUser: {
              select: { id: true, username: true, fullName: true, role: true }
            }
          },
          orderBy: {
            assignedAt: 'desc'
          }
        },
        _count: {
          select: {
            products: true,
            users: true,
            productAssignments: true
          }
        }
      }
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    return warehouse;
  }

  async update(id: string, data: Prisma.WarehouseUpdateInput) {
    return this.prisma.warehouse.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.warehouse.delete({ where: { id } });
  }

  async assignProductToShop(data: {
    productId: string;
    shopId: string;
    warehouseId: string;
    quantity: number;
    assignedBy: string;
  }) {
    try {
      this.logger.debug(`Assigning product to shop: ${JSON.stringify(data)}`);

      // Check if there's an existing assignment for this product and shop
      const existingAssignment = await this.prisma.productAssignment.findFirst({
        where: {
          productId: data.productId,
          shopId: data.shopId
        },
        include: {
          product: { select: { id: true, name: true, price: true } },
          shop: { select: { id: true, name: true, location: true } },
          warehouse: { select: { id: true, name: true, location: true } }
        }
      });

      // Check warehouse stock before assignment
      const product = await this.prisma.product.findUnique({
        where: { id: data.productId },
        select: {
          id: true,
          name: true,
          availableStock: true,
          warehouseId: true,
          warehouse: { select: { name: true } }
        }
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${data.productId} not found`);
      }

      if (product.availableStock < data.quantity) {
        throw new BadRequestException(
          `Insufficient warehouse stock. Available: ${product.availableStock}, Requested: ${data.quantity}`
        );
      }

      let assignment;
      let activityAction;
      let activityDetails;

      if (existingAssignment) {
        // Update existing assignment (restock scenario)
        const previousQuantity = existingAssignment.quantity;
        const previousAvailable = existingAssignment.availableQuantity;

        assignment = await this.prisma.productAssignment.update({
          where: { id: existingAssignment.id },
          data: {
            quantity: { increment: data.quantity },
            availableQuantity: { increment: data.quantity },
            warehouseId: data.warehouseId, // Update warehouse if different
            assignedBy: data.assignedBy,
            assignedAt: new Date() // Update assignment timestamp
          },
          include: {
            product: { select: { id: true, name: true, price: true } },
            shop: { select: { id: true, name: true, location: true } },
            warehouse: { select: { id: true, name: true, location: true } },
            assignedByUser: { select: { id: true, username: true, fullName: true } }
          }
        });

        activityAction = 'PRODUCT_RESTOCK';
        activityDetails = `Restocked ${data.quantity} units of "${product.name}" to "${assignment.shop.name}" shop. Previous: ${previousQuantity} (${previousAvailable} available), New: ${assignment.quantity} (${assignment.availableQuantity} available). From warehouse: ${assignment.warehouse.name}`;

        this.logger.debug(`Product restocked: ${assignment.id}, added ${data.quantity} units`);
      } else {
        // Create new assignment
        const assignmentData = {
          productId: data.productId,
          shopId: data.shopId,
          warehouseId: data.warehouseId,
          assignedBy: data.assignedBy,
          quantity: data.quantity,
          availableQuantity: data.quantity,
          soldQuantity: 0
        };

        assignment = await this.prisma.productAssignment.create({
          data: assignmentData,
          include: {
            product: { select: { id: true, name: true, price: true } },
            shop: { select: { id: true, name: true, location: true } },
            warehouse: { select: { id: true, name: true, location: true } },
            assignedByUser: { select: { id: true, username: true, fullName: true } }
          }
        });

        activityAction = 'PRODUCT_ASSIGNMENT';
        activityDetails = `Assigned ${data.quantity} units of "${product.name}" to "${assignment.shop.name}" shop from warehouse: ${assignment.warehouse.name}`;

        this.logger.debug(`New product assignment created: ${assignment.id}`);
      }

      // Decrement warehouse stock
      await this.prisma.product.update({
        where: { id: data.productId },
        data: {
          availableStock: { decrement: data.quantity }
        }
      });

      // Log activity
      await this.prisma.activityLog.create({
        data: {
          userId: data.assignedBy,
          action: activityAction,
          details: activityDetails,
          ipAddress: null, // Can be passed from controller if needed
          userAgent: null  // Can be passed from controller if needed
        }
      });

      this.logger.debug(`Warehouse stock decremented by ${data.quantity} for product ${product.name}`);

      return {
        ...assignment,
        isRestock: !!existingAssignment,
        warehouseStockAfter: product.availableStock - data.quantity,
        message: existingAssignment
          ? `Successfully restocked ${data.quantity} units`
          : `Successfully assigned ${data.quantity} units`
      };

    } catch (error: any) {
      this.logger.error(`Failed to assign product to shop: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to assign product to shop: ${error.message}`);
    }
  }

  async getWarehouseReport(warehouseId: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: warehouseId },
      include: {
        products: {
          include: { category: true }
        },
        productAssignments: {
          include: {
            product: true,
            shop: true
          }
        },
        users: true
      }
    });

    if (!warehouse) throw new NotFoundException('Warehouse not found');

    return {
      warehouse,
      totalProducts: warehouse.products?.length || 0,
      totalAssignments: warehouse.productAssignments?.length || 0,
      totalUsers: warehouse.users?.length || 0
    };
  }

  async getProductsAssignedToShop(shopId: string) {
    try {
      this.logger.debug(`Getting products assigned to shop: ${shopId}`);

      // Verify shop exists
      const shop = await this.prisma.shop.findUnique({
        where: { id: shopId },
        select: { id: true, name: true, location: true, isActive: true }
      });

      if (!shop) {
        throw new NotFoundException(`Shop with ID ${shopId} not found`);
      }

      // Get all product assignments for this shop
      const assignments = await this.prisma.productAssignment.findMany({
        where: { shopId },
        include: {
          product: {
            include: {
              category: {
                select: { id: true, name: true, description: true }
              }
            }
          },
          warehouse: {
            select: { id: true, name: true, location: true }
          },
          assignedByUser: {
            select: { id: true, username: true, fullName: true, role: true }
          }
        },
        orderBy: {
          assignedAt: 'desc'
        }
      });

      return {
        shop,
        totalAssignments: assignments.length,
        assignments: assignments.map(assignment => ({
          id: assignment.id,
          quantity: assignment.quantity,
          assignedAt: assignment.assignedAt,
          product: {
            id: assignment.product.id,
            name: assignment.product.name,
            description: assignment.product.description,
            price: assignment.product.price,
            totalStock: assignment.product.totalStock,
            availableStock: assignment.product.availableStock,
            image: assignment.product.image,
            category: assignment.product.category
          },
          warehouse: assignment.warehouse,
          assignedBy: assignment.assignedByUser
        }))
      };
    } catch (error: any) {
      this.logger.error(`Failed to get products for shop ${shopId}: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to get shop products: ${error.message}`);
    }
  }

  async getAllProductsForNonAdmins(userId: string, query?: { page?: number; size?: number; search?: string; warehouseId?: string; category?: string }) {
    this.logger.debug(`Fetching products for non-admin user: ${userId}`);

    // Set default pagination values
    const page = query?.page || 1;
    const size = Math.min(query?.size || 20, 100); // Cap at 100
    const search = query?.search;
    const warehouseId = query?.warehouseId;
    const category = query?.category;

    try {
      // Get user with shop assignment
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          role: true,
          shopId: true,
          shop: {
            select: { id: true, name: true, location: true }
          }
        }
      });

      if (!user) {
        this.logger.error(`User with ID ${userId} not found`);
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      if (!user.shopId) {
        this.logger.warn(`User ${userId} has no shop assignment`);
        return {
          data: [],
          page,
          size,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false
        };
      }

      this.logger.debug(`Fetching products for shop: ${user.shop?.name} (${user.shopId})`);

      // Build where clause for filtering
      const whereClause: any = {
        shopId: user.shopId,
        ...(warehouseId && { warehouseId }),
        ...(search && {
          product: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { category: { name: { contains: search, mode: 'insensitive' } } }
            ]
          }
        }),
        ...(category && {
          product: {
            category: { name: { contains: category, mode: 'insensitive' } }
          }
        })
      };

      // Get total count and paginated results in parallel
      const [productAssignments, total] = await Promise.all([
        this.prisma.productAssignment.findMany({
          where: whereClause,
          include: {
            product: {
              include: {
                category: true,
                warehouse: {
                  select: { id: true, name: true, location: true }
                }
              }
            },
            warehouse: {
              select: { id: true, name: true, location: true }
            }
          },
          orderBy: [
            { product: { name: 'asc' } },
            { assignedAt: 'desc' }
          ],
          skip: (page - 1) * size,
          take: size
        }),
        this.prisma.productAssignment.count({
          where: whereClause
        })
      ]);

      this.logger.debug(`Found ${productAssignments.length} product assignments out of ${total} total for shop ${user.shopId}`);

      const transformedData = productAssignments.map(assignment => ({
        id: assignment.product.id,
        name: assignment.product.name,
        description: assignment.product.description,
        price: assignment.product.price,
        image: assignment.product.image,
        totalStock: assignment.product.totalStock,
        availableStock: assignment.product.availableStock,
        category: assignment.product.category.name,
        assignedQuantity: assignment.quantity,
        shopAvailableQuantity: assignment.availableQuantity,
        shopSoldQuantity: assignment.soldQuantity,
        assignedAt: assignment.assignedAt,
        assignmentWarehouse: {
          id: assignment.warehouse?.id || '',
          name: assignment.warehouse?.name || 'Unknown Warehouse',
          location: assignment.warehouse?.location || 'Unknown Location'
        },
        productWarehouse: {
          id: assignment.product.warehouseId,
          name: assignment.product.warehouse?.name || 'Unknown Warehouse',
          location: assignment.product.warehouse?.location || 'Unknown Location'
        }
      }));

      const totalPages = Math.ceil(total / size);

      return {
        data: transformedData,
        page,
        size,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
        filters: {
          search: search || null,
          warehouseId: warehouseId || null,
          category: category || null
        }
      };
    } catch (error: any) {
      this.logger.error(`Failed to fetch products for user ${userId}: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to fetch products: ${error.message}`);
    }
  }

  async getWarehouseProducts(warehouseId: string, query?: { page?: number; size?: number; search?: string; category?: string; all?: boolean }) {
    this.logger.debug(`Fetching products from warehouse ${warehouseId}`);

    const page = query?.page || 1;
    const size = Math.min(query?.size || 20, 100);
    const search = query?.search;
    const category = query?.category;
    const fetchAll = query?.all || false;

    try {
      // Verify warehouse exists
      const warehouse = await this.prisma.warehouse.findUnique({
        where: { id: warehouseId },
        select: { id: true, name: true, location: true, isActive: true }
      });

      if (!warehouse) {
        throw new NotFoundException(`Warehouse with ID ${warehouseId} not found`);
      }

      // Build where clause for filtering
      const whereClause: any = {
        warehouseId: warehouseId,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { category: { name: { contains: search, mode: 'insensitive' } } }
          ]
        }),
        ...(category && {
          category: { name: { contains: category, mode: 'insensitive' } }
        })
      };

      // Get products with or without pagination
      const [products, totalProducts] = await Promise.all([
        this.prisma.product.findMany({
          where: whereClause,
          include: {
            category: {
              select: { id: true, name: true, description: true }
            },
            assignments: {
              include: {
                shop: {
                  select: { id: true, name: true, location: true, isActive: true }
                }
              }
            },
            _count: {
              select: {
                assignments: true
              }
            }
          },
          orderBy: [
            { name: 'asc' },
            { createdAt: 'desc' }
          ],
          ...(fetchAll ? {} : {
            skip: (page - 1) * size,
            take: size
          })
        }),
        this.prisma.product.count({
          where: whereClause
        })
      ]);

      const totalPages = fetchAll ? 1 : Math.ceil(totalProducts / size);

      // Transform products data
      const transformedProducts = products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        totalStock: product.totalStock,
        availableStock: product.availableStock,
        createdAt: product.createdAt,
        category: product.category,
        assignmentSummary: {
          totalAssignments: product._count.assignments,
          totalQuantityAssigned: product.assignments.reduce((sum, a) => sum + a.quantity, 0),
          totalQuantityAvailable: product.assignments.reduce((sum, a) => sum + a.availableQuantity, 0),
          totalQuantitySold: product.assignments.reduce((sum, a) => sum + a.soldQuantity, 0),
          assignedShops: product.assignments.length
        },
        recentAssignments: product.assignments
          .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime())
          .slice(0, 3)
          .map(assignment => ({
            id: assignment.id,
            quantity: assignment.quantity,
            availableQuantity: assignment.availableQuantity,
            soldQuantity: assignment.soldQuantity,
            assignedAt: assignment.assignedAt,
            shop: assignment.shop
          }))
      }));

      // Return different structure based on fetchAll parameter
      if (fetchAll) {
        return {
          warehouse,
          products: transformedProducts,
          summary: {
            totalProducts,
            totalStock: products.reduce((sum, p) => sum + p.totalStock, 0),
            totalAvailableStock: products.reduce((sum, p) => sum + p.availableStock, 0),
            totalAssignments: products.reduce((sum, p) => sum + p._count.assignments, 0),
            categories: [...new Set(products.map(p => p.category.name))].length
          },
          filters: {
            search: search || null,
            category: category || null
          }
        };
      }

      return {
        warehouse,
        products: {
          data: transformedProducts,
          page,
          size,
          total: totalProducts,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1
        },
        summary: {
          totalProducts,
          totalStock: products.reduce((sum, p) => sum + p.totalStock, 0),
          totalAvailableStock: products.reduce((sum, p) => sum + p.availableStock, 0),
          totalAssignments: products.reduce((sum, p) => sum + p._count.assignments, 0),
          categories: [...new Set(products.map(p => p.category.name))].length
        },
        filters: {
          search: search || null,
          category: category || null
        }
      };
    } catch (error: any) {
      this.logger.error(`Failed to get warehouse products ${warehouseId}: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to get warehouse products: ${error.message}`);
    }
  }

  async getWarehouseProduct(warehouseId: string, productId: string, query?: { page?: number; size?: number; search?: string }) {
    this.logger.debug(`Fetching product ${productId} from warehouse ${warehouseId}`);

    const page = query?.page || 1;
    const size = Math.min(query?.size || 20, 100);
    const search = query?.search;

    try {
      // Verify warehouse exists
      const warehouse = await this.prisma.warehouse.findUnique({
        where: { id: warehouseId },
        select: { id: true, name: true, location: true, isActive: true }
      });

      if (!warehouse) {
        throw new NotFoundException(`Warehouse with ID ${warehouseId} not found`);
      }

      // Get the product with its details
      const product = await this.prisma.product.findFirst({
        where: {
          id: productId,
          warehouseId: warehouseId
        },
        include: {
          category: {
            select: { id: true, name: true, description: true }
          },
          warehouse: {
            select: { id: true, name: true, location: true }
          }
        }
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found in warehouse ${warehouseId}`);
      }

      // Build where clause for product assignments
      const whereClause: any = {
        productId: productId,
        warehouseId: warehouseId,
        ...(search && {
          shop: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { location: { contains: search, mode: 'insensitive' } }
            ]
          }
        })
      };

      // Get product assignments with pagination
      const [assignments, totalAssignments] = await Promise.all([
        this.prisma.productAssignment.findMany({
          where: whereClause,
          include: {
            shop: {
              select: { id: true, name: true, location: true, isActive: true }
            },
            assignedByUser: {
              select: { id: true, username: true, fullName: true, role: true }
            }
          },
          orderBy: {
            assignedAt: 'desc'
          },
          skip: (page - 1) * size,
          take: size
        }),
        this.prisma.productAssignment.count({
          where: whereClause
        })
      ]);

      const totalPages = Math.ceil(totalAssignments / size);

      return {
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          totalStock: product.totalStock,
          availableStock: product.availableStock,
          category: product.category,
          warehouse: product.warehouse
        },
        assignments: {
          data: assignments.map(assignment => ({
            id: assignment.id,
            quantity: assignment.quantity,
            availableQuantity: assignment.availableQuantity,
            soldQuantity: assignment.soldQuantity,
            assignedAt: assignment.assignedAt,
            shop: assignment.shop,
            assignedBy: assignment.assignedByUser
          })),
          page,
          size,
          total: totalAssignments,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1
        },
        summary: {
          totalAssignments,
          totalQuantityAssigned: assignments.reduce((sum, a) => sum + a.quantity, 0),
          totalQuantityAvailable: assignments.reduce((sum, a) => sum + a.availableQuantity, 0),
          totalQuantitySold: assignments.reduce((sum, a) => sum + a.soldQuantity, 0)
        },
        filters: {
          search: search || null
        }
      };
    } catch (error: any) {
      this.logger.error(`Failed to get warehouse product ${productId}: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to get warehouse product: ${error.message}`);
    }
  }

  async getDashboardStats(userId?: string, userInfo?: { role?: string; shopId?: string }) {
    this.logger.debug(`Fetching dashboard statistics for user ${userId} with role ${userInfo?.role} and shopId ${userInfo?.shopId}`);

    try {
      // Determine if user should see global stats or shop-specific stats
      const isGlobalUser = userInfo?.role && ['CEO', 'Admin', 'WarehouseKeeper'].includes(userInfo.role);
      const shopId = !isGlobalUser ? userInfo?.shopId : null;

      this.logger.debug(`Dashboard access level: ${isGlobalUser ? 'Global' : 'Shop-specific'}, shopId: ${shopId}`);
      // Execute all queries in parallel for better performance
      const [
        totalProducts,
        totalCategories,
        totalStock,
        totalWarehouses,
        totalAssignments,
        activeShops,
        activeAssignments,
        totalRevenue,
        totalCollected,
        partialPayments,
        outstandingPayments,
        totalOrders,
        completedOrders,
        pendingPaymentOrders,
        readyForPickupOrders,
        completedOrdersDetailed
      ] = await Promise.all([
        // Total Products
        this.prisma.product.count(),
        
        // Categories
        this.prisma.category.count(),
        
        // Total Stock (sum of all product stocks)
        this.prisma.product.aggregate({
          _sum: {
            totalStock: true
          }
        }),
        
        // Total Warehouses
        this.prisma.warehouse.count(),
        
        // Total Assignments
        this.prisma.productAssignment.count({
          ...(shopId && { where: { shopId } })
        }),

        // Active Shops (for shop users, just check if their shop is active)
        shopId
          ? this.prisma.shop.count({
              where: { id: shopId, isActive: true }
            })
          : this.prisma.shop.count({
              where: { isActive: true }
            }),

        // Active Assignments (assignments with available quantity > 0)
        this.prisma.productAssignment.count({
          where: {
            availableQuantity: {
              gt: 0
            },
            ...(shopId && { shopId })
          }
        }),
        
        // Total Revenue (sum of all order total amounts)
        this.prisma.order.aggregate({
          _sum: {
            totalAmount: true
          },
          ...(shopId && { where: { shopId } })
        }),

        // Total Collected (sum of all paid amounts)
        this.prisma.order.aggregate({
          _sum: {
            paidAmount: true
          },
          ...(shopId && { where: { shopId } })
        }),

        // Partial Payments (orders with partial payment status)
        this.prisma.order.aggregate({
          _sum: {
            paidAmount: true
          },
          where: {
            paymentStatus: 'partial',
            ...(shopId && { shopId })
          }
        }),

        // Outstanding Payments (total amount - paid amount for all orders)
        shopId
          ? this.prisma.$queryRaw<Array<{ outstanding: number }>>`
              SELECT COALESCE(SUM("totalAmount" - "paidAmount"), 0) as outstanding
              FROM "Order"
              WHERE "shopId" = ${shopId}
            `
          : this.prisma.$queryRaw<Array<{ outstanding: number }>>`
              SELECT COALESCE(SUM("totalAmount" - "paidAmount"), 0) as outstanding
              FROM "Order"
            `,

        // Total Orders
        this.prisma.order.count({
          ...(shopId && { where: { shopId } })
        }),

        // Completed Orders (delivered status)
        this.prisma.order.count({
          where: {
            status: 'delivered',
            ...(shopId && { shopId })
          }
        }),

        // Pending Payment Orders
        this.prisma.order.count({
          where: {
            status: 'pending_payment',
            ...(shopId && { shopId })
          }
        }),

        // Ready for Pickup Orders
        this.prisma.order.count({
          where: {
            status: 'picked_up',
            ...(shopId && { shopId })
          }
        }),

        // Completed Orders (detailed breakdown)
        this.prisma.order.groupBy({
          by: ['status'],
          _count: {
            status: true
          },
          ...(shopId && { where: { shopId } })
        })
      ]);

      // Format the response
      const dashboardStats = {
        // Product Statistics
        totalProducts: totalProducts,
        categories: totalCategories,
        totalStock: totalStock._sum.totalStock || 0,

        // Warehouse & Assignment Statistics
        warehouses: totalWarehouses,
        totalAssignments: totalAssignments,
        activeShops: activeShops,
        activeAssignments: activeAssignments,

        // Revenue Statistics
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalCollected: totalCollected._sum.paidAmount || 0,
        partialPayments: partialPayments._sum.paidAmount || 0,
        outstandingPayments: Number(outstandingPayments[0]?.outstanding || 0),

        // Order Statistics
        totalOrders: totalOrders,
        completedOrders: completedOrders,
        pendingPayment: pendingPaymentOrders,
        readyForPickup: readyForPickupOrders,

        // Detailed Order Status Breakdown
        orderStatusBreakdown: completedOrdersDetailed.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {} as Record<string, number>),

        // Access Information
        accessInfo: {
          scope: isGlobalUser ? 'global' : 'shop',
          shopId: shopId || null,
          userRole: userInfo?.role || 'Unknown',
          isFiltered: !isGlobalUser
        }
      };

      this.logger.debug(`Dashboard stats calculated successfully for ${isGlobalUser ? 'global' : 'shop'} scope: ${JSON.stringify(dashboardStats)}`);
      return dashboardStats;

    } catch (error: any) {
      this.logger.error(`Failed to fetch dashboard statistics: ${error.message}`);
      throw new BadRequestException(`Failed to fetch dashboard statistics: ${error.message}`);
    }
  }

  async updateShopInventory(data: {
    assignmentId: string;
    soldQuantity: number;
    action: 'sale' | 'return' | 'adjustment';
    notes?: string;
    userId?: string; // User performing the action
  }) {
    try {
      this.logger.debug(`Updating shop inventory: ${JSON.stringify(data)}`);

      // Get the current assignment
      const assignment = await this.prisma.productAssignment.findUnique({
        where: { id: data.assignmentId },
        include: {
          product: { select: { id: true, name: true } },
          shop: { select: { id: true, name: true } }
        }
      });

      if (!assignment) {
        throw new NotFoundException(`Product assignment with ID ${data.assignmentId} not found`);
      }

      let newSoldQuantity = assignment.soldQuantity;
      let newAvailableQuantity = assignment.availableQuantity;

      switch (data.action) {
        case 'sale':
          // Increase sold quantity, decrease available quantity
          if (data.soldQuantity > assignment.availableQuantity) {
            throw new BadRequestException(`Cannot sell ${data.soldQuantity} items. Only ${assignment.availableQuantity} available.`);
          }
          newSoldQuantity += data.soldQuantity;
          newAvailableQuantity -= data.soldQuantity;
          break;

        case 'return':
          // Decrease sold quantity, increase available quantity
          if (data.soldQuantity > assignment.soldQuantity) {
            throw new BadRequestException(`Cannot return ${data.soldQuantity} items. Only ${assignment.soldQuantity} were sold.`);
          }
          newSoldQuantity -= data.soldQuantity;
          newAvailableQuantity += data.soldQuantity;
          break;

        case 'adjustment':
          // Direct adjustment of sold quantity
          if (data.soldQuantity < 0 || data.soldQuantity > assignment.quantity) {
            throw new BadRequestException(`Invalid sold quantity. Must be between 0 and ${assignment.quantity}.`);
          }
          newSoldQuantity = data.soldQuantity;
          newAvailableQuantity = assignment.quantity - data.soldQuantity;
          break;
      }

      // Update the assignment
      const updatedAssignment = await this.prisma.productAssignment.update({
        where: { id: data.assignmentId },
        data: {
          soldQuantity: newSoldQuantity,
          availableQuantity: newAvailableQuantity
        },
        include: {
          product: { select: { id: true, name: true, price: true } },
          shop: { select: { id: true, name: true, location: true } },
          warehouse: { select: { id: true, name: true } }
        }
      });

      this.logger.debug(`Shop inventory updated: ${updatedAssignment.id}`);

      // Log activity for inventory updates
      if (data.userId) {
        let activityAction = '';
        let activityDetails = '';

        switch (data.action) {
          case 'sale':
            activityAction = 'INVENTORY_SALE';
            activityDetails = `Recorded sale of ${data.soldQuantity} units of "${assignment.product.name}" from "${assignment.shop.name}" shop. Available: ${assignment.availableQuantity} → ${newAvailableQuantity}, Sold: ${assignment.soldQuantity} → ${newSoldQuantity}`;
            break;
          case 'return':
            activityAction = 'INVENTORY_RETURN';
            activityDetails = `Processed return of ${data.soldQuantity} units of "${assignment.product.name}" to "${assignment.shop.name}" shop. Available: ${assignment.availableQuantity} → ${newAvailableQuantity}, Sold: ${assignment.soldQuantity} → ${newSoldQuantity}`;
            break;
          case 'adjustment':
            activityAction = 'INVENTORY_ADJUSTMENT';
            activityDetails = `Adjusted inventory for "${assignment.product.name}" in "${assignment.shop.name}" shop. Sold quantity set to ${newSoldQuantity}, Available: ${assignment.availableQuantity} → ${newAvailableQuantity}`;
            break;
        }

        if (data.notes) {
          activityDetails += `. Notes: ${data.notes}`;
        }

        await this.prisma.activityLog.create({
          data: {
            userId: data.userId,
            action: activityAction,
            details: activityDetails,
            ipAddress: null,
            userAgent: null
          }
        });

        this.logger.debug(`Activity logged: ${activityAction} for user ${data.userId}`);
      }

      return {
        success: true,
        message: `Inventory updated successfully`,
        assignment: updatedAssignment,
        changes: {
          action: data.action,
          quantity: data.soldQuantity,
          previousSold: assignment.soldQuantity,
          newSold: newSoldQuantity,
          previousAvailable: assignment.availableQuantity,
          newAvailable: newAvailableQuantity
        }
      };
    } catch (error: any) {
      this.logger.error(`Failed to update shop inventory: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update shop inventory: ${error.message}`);
    }
  }
}