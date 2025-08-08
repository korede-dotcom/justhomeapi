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

  async getAllProductsForNonAdmins(userId: string) {
    try {
      this.logger.debug(`Getting products for non-admin user: ${userId}`);

      // First, get the user and their assigned shop
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          shop: {
            select: { id: true, name: true, location: true }
          }
        }
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      if (!user.shop) {
        this.logger.warn(`User ${userId} is not assigned to any shop`);
        return {
          totalProducts: 0,
          products: [],
          userShop: null,
          message: 'No shop assigned to this user'
        };
      }

      const shopId = user.shop.id;
      this.logger.debug(`User ${userId} is assigned to shop: ${shopId}`);

      // Get all product assignments for the user's shop
      const productAssignments = await this.prisma.productAssignment.findMany({
        where: {
          shopId: shopId
        },
        include: {
          product: {
            include: {
              category: {
                select: { id: true, name: true, description: true }
              }
            }
          },
          shop: {
            select: { id: true, name: true, location: true }
          },
          warehouse: {
            select: { id: true, name: true, location: true }
          },
          assignedByUser: {
            select: { id: true, username: true, fullName: true, role: true }
          }
        },
        orderBy: [
          { product: { name: 'asc' } },
          { assignedAt: 'desc' }
        ]
      });

      // Group products by product ID to avoid duplicates and sum quantities
      const productMap = new Map();

      productAssignments.forEach(assignment => {
        const productId = assignment.product.id;

        if (productMap.has(productId)) {
          // Add quantity to existing product
          const existing = productMap.get(productId);
          existing.totalAssignedQuantity += assignment.quantity;
          existing.assignments.push({
            id: assignment.id,
            quantity: assignment.quantity,
            assignedAt: assignment.assignedAt,
            shop: assignment.shop,
            warehouse: assignment.warehouse,
            assignedBy: assignment.assignedByUser
          });
        } else {
          // Add new product
          productMap.set(productId, {
            id: assignment.product.id,
            name: assignment.product.name,
            description: assignment.product.description,
            price: assignment.product.price,
            totalStock: assignment.product.totalStock,
            availableStock: assignment.product.availableStock,
            image: assignment.product.image,
            category: assignment.product.category,
            totalAssignedQuantity: assignment.quantity,
            assignments: [{
              id: assignment.id,
              quantity: assignment.quantity,
              assignedAt: assignment.assignedAt,
              shop: assignment.shop,
              warehouse: assignment.warehouse,
              assignedBy: assignment.assignedByUser
            }]
          });
        }
      });

      const products = Array.from(productMap.values());

      return {
        totalProducts: products.length,
        userShop: user.shop,
        products: products
      };
    } catch (error: any) {
      this.logger.error(`Failed to get products for non-admin user ${userId}: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to get products: ${error.message}`);
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