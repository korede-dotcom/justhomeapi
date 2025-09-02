import { HttpException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
@Injectable()
export class OrderService {
    private readonly logger = new Logger(OrderService.name);
  constructor(private prisma: PrismaService) {}

  async findAll() {
  return this.prisma.order.findMany({
    include: {
      OrderItem: {
        include: {
          product: true,
        },
      },
      products: true,
      shop: { select: { id: true, name: true, location: true } },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          username: true,
          // exclude password
        },
      },
      attendee: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          username: true,
        },
      },
      receptionist: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          username: true,
        },
      },
      packager: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          username: true,
        },
      },
      storekeeper: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          username: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' }
  });
  }

  async getOrdersByAttendee(attendeeId: string) {
  // Get attendee's shop to filter orders
  const attendee = await this.prisma.user.findUnique({
    where: { id: attendeeId },
    select: { shopId: true }
  });

  return this.prisma.order.findMany({
    where: {
      AND: [
        { attendeeId },
        ...(attendee?.shopId ? [{ shopId: attendee.shopId }] : [])
      ]
    },
    include: {
      OrderItem: { include: { product: true } },
      products: true,
      shop: { select: { id: true, name: true, location: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  }

  async getOrdersByReceptionist(receptionistId: string) {
  // Get receptionist's shop to filter orders
  const receptionist = await this.prisma.user.findUnique({
    where: { id: receptionistId },
    select: { shopId: true }
  });

  return this.prisma.order.findMany({
    where: {
      AND: [
        { receptionistId },
        ...(receptionist?.shopId ? [{ shopId: receptionist.shopId }] : [])
      ]
    },
    include: {
      OrderItem: { include: { product: true } },
      products: true,
      shop: { select: { id: true, name: true, location: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  }

  async getOrdersByPackager(packagerId: string) {
  // Get packager's shop to filter orders
  const packager = await this.prisma.user.findUnique({
    where: { id: packagerId },
    select: { shopId: true }
  });

  return this.prisma.order.findMany({
    where: {
      AND: [
        { packagerId },
        ...(packager?.shopId ? [{ shopId: packager.shopId }] : [])
      ]
    },
    include: {
      OrderItem: { include: { product: true } },
      products: true,
      shop: { select: { id: true, name: true, location: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  }

  async getOrdersByStorekeeper(storekeeperId: string) {
  // Get storekeeper's shop to filter orders
  const storekeeper = await this.prisma.user.findUnique({
    where: { id: storekeeperId },
    select: { shopId: true }
  });

  return this.prisma.order.findMany({
    where: {
      AND: [
        {
          status: {
            in: ['paid', 'assigned_packager', 'packaged', 'picked_up'],
          },
        },
        ...(storekeeper?.shopId ? [{ shopId: storekeeper.shopId }] : [])
      ]
    },
    include: {
      OrderItem: {
        include: {
          product: true,
        },
      },
      products: true,
      shop: { select: { id: true, name: true, location: true } },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          username: true,
        },
      },
      attendee: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          username: true,
        },
      },
      receptionist: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          username: true,
        },
      },
      packager: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          username: true,
        },
      },
      storekeeper: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          username: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' }
  });
}






  async create(data: any) {
  this.logger.log(`Creating order with data: ${JSON.stringify(data)}`);

  try {
    // Destructure user role IDs and products
    const {
      userId,
      attendeeId,
      receptionistId,
      packagerId,
      storekeeperId,
      products,
      ...rest
    } = data;

    // Get attendee's shop information for inventory validation
    let attendeeShopId = null;
    if (attendeeId) {
      const attendee = await this.prisma.user.findUnique({
        where: { id: attendeeId },
        select: { shopId: true, shop: { select: { id: true, name: true } } }
      });

      if (!attendee?.shopId) {
        throw new BadRequestException('Attendee is not assigned to any shop');
      }

      attendeeShopId = attendee.shopId;
      this.logger.debug(`Order being created for shop: ${attendee.shop?.name} (${attendeeShopId})`);
    }

    // Validate shop inventory and prepare inventory updates
    const inventoryUpdates = [];

    for (const product of products) {
      const requestedQuantity = product.quantity || 1;

      if (attendeeShopId) {
        // Find the product assignment for this shop
        const assignment = await this.prisma.productAssignment.findFirst({
          where: {
            productId: product.id,
            shopId: attendeeShopId
          },
          include: {
            product: { select: { name: true } },
            shop: { select: { name: true } }
          }
        });

        if (!assignment) {
          throw new BadRequestException(
            `Product "${product.name}" is not assigned to this shop`
          );
        }

        if (assignment.availableQuantity < requestedQuantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}". Available: ${assignment.availableQuantity}, Requested: ${requestedQuantity}`
          );
        }

        // Prepare inventory update
        inventoryUpdates.push({
          assignmentId: assignment.id,
          soldQuantity: requestedQuantity,
          productName: assignment.product.name
        });
      }
    }

    // Create the order
    const createdOrder = await this.prisma.order.create({
      data: {
        // Only include valid Order model fields
        customerName: rest.customerName,
        customerPhone: rest.customerPhone || null,
        status: rest.status || 'pending_payment',
        paymentMethod: rest.paymentMethod || data.paymentMethod,
        paymentStatus: rest.paymentStatus || 'pending',
        totalAmount: rest.totalAmount,
        paidAmount: rest.paidAmount || 0,
        receiptId: rest.receiptId,

        // Connect shop if attendee is provided
        ...(attendeeShopId && { shop: { connect: { id: attendeeShopId } } }),

        // Connect each user role if provided
        ...(userId && { user: { connect: { id: userId } } }),
        ...(attendeeId && { attendee: { connect: { id: attendeeId } } }),
        ...(receptionistId && { receptionist: { connect: { id: receptionistId } } }),
        ...(packagerId && { packager: { connect: { id: packagerId } } }),
        ...(storekeeperId && { storekeeper: { connect: { id: storekeeperId } } }),

        // Connect products to order
        products: {
          connect: products.map((p: { id: string }) => ({ id: p.id })),
        },

        // Create order items with quantity
        OrderItem: {
          create: products.map((p: { id: string; quantity?: number }) => ({
            product: { connect: { id: p.id } },
            quantity: p.quantity || 1,
          })),
        },
      },
      include: {
        OrderItem: {
          include: {
            product: true,
          },
        },
        products: true,
      },
    });

    // Update shop inventory (decrement available, increment sold)
    for (const update of inventoryUpdates) {
      await this.prisma.productAssignment.update({
        where: { id: update.assignmentId },
        data: {
          availableQuantity: { decrement: update.soldQuantity },
          soldQuantity: { increment: update.soldQuantity }
        }
      });

      this.logger.debug(`Updated shop inventory for ${update.productName}: sold +${update.soldQuantity}`);
    }

    // Log order creation activity
    if (attendeeId) {
      const productNames = products.map((p: any) => p.name || 'Unknown Product').join(', ');
      const totalQuantity = products.reduce((sum: number, p: any) => sum + (p.quantity || 1), 0);

      await this.prisma.activityLog.create({
        data: {
          userId: attendeeId,
          action: 'ORDER_CREATED',
          details: `Created order ${createdOrder.id} for customer "${rest.customerName || 'Unknown'}". Products: ${productNames} (${totalQuantity} units total). Total amount: ${rest.totalAmount || 0}. Shop inventory updated accordingly.`,
          ipAddress: null,
          userAgent: null
        }
      });

      this.logger.debug(`Order creation activity logged for user ${attendeeId}`);
    }

    this.logger.log(`Order created successfully: ${createdOrder.id}`);
    return createdOrder;

  } catch (error: any) {
    this.logger.error('Error creating order:', error.message);
    this.logger.error(error.stack || error.message);

    // Re-throw known exceptions
    if (error instanceof BadRequestException) {
      throw error;
    }

    throw new InternalServerErrorException('Failed to create order');
  }
}

 async update(id: string, data: any) {
   try {
       return this.prisma.order.update({ where: { id }, data });
   } catch (error: any) {
       this.logger.error('Error updating order:', error.message);
       this.logger.error('Error updating order:', error.stack || error.message);
       throw new Error('Failed to update order');
   }
  }

  async updatePayment(id: string, data: any) {
  try {
    const updateData: any = {
      status: data.status,
      paymentStatus: data.paymentStatus,
      paymentMethod: data.paymentMethod,
    };

    // Handle receptionist relation if provided
    if (data.receptionistId) {
      updateData.receptionist = { connect: { id: data.receptionistId } };
    }

    return await this.prisma.order.update({
      where: { id },
      data: updateData,
    });
  } catch (error: any) {
    this.logger.error('Error updating order:', error.message);
    this.logger.error('Error updating order:', error.stack || error.message);
    throw new Error('Failed to update order');
  }
  }

  async updatePackager(id: string, data: any) {
    this.logger.debug(`Updating packager for order ${id}: ${JSON.stringify(data)}`);

    try {
      // Validate input data
      if (!data.packagerId) {
        throw new BadRequestException('Packager ID is required');
      }

      // Check if order exists
      const existingOrder = await this.prisma.order.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          customerName: true,
          shopId: true,
          shop: { select: { name: true } }
        }
      });

      if (!existingOrder) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      // Validate that the packager exists and has the correct role
      const packager = await this.prisma.user.findUnique({
        where: { id: data.packagerId },
        select: {
          id: true,
          role: true,
          fullName: true,
          isActive: true,
          shopId: true,
          shop: { select: { name: true } }
        }
      });

      if (!packager) {
        throw new NotFoundException(`Packager with ID ${data.packagerId} not found`);
      }

      if (packager.role !== 'Packager') {
        throw new BadRequestException(`User ${packager.fullName} is not a packager. Current role: ${packager.role}`);
      }

      if (!packager.isActive) {
        throw new BadRequestException(`Packager ${packager.fullName} is not active`);
      }

      // Check if packager is assigned to the same shop as the order (if order has a shop)
      if (existingOrder.shopId && packager.shopId !== existingOrder.shopId) {
        throw new BadRequestException(
          `Packager ${packager.fullName} (${packager.shop?.name || 'No shop'}) cannot be assigned to order from ${existingOrder.shop?.name || 'Unknown shop'}`
        );
      }

      this.logger.debug(`Order validation - Status: ${existingOrder.status}, PaymentStatus: ${existingOrder.paymentStatus}`);

      // Validate payment status - only certain payment statuses can have packagers assigned
      const validPaymentStatuses = ['paid', 'partial'];
      if (!validPaymentStatuses.includes(existingOrder.paymentStatus)) {
        throw new BadRequestException(
          `Cannot assign packager to order with payment status '${existingOrder.paymentStatus}'. Order payment must be 'paid' or 'partial'. Current payment status: ${existingOrder.paymentStatus}`
        );
      }

      // For orders with 'partial' payment, we can still assign packager if payment is sufficient
      // For 'paid' orders, we can definitely assign packager
      this.logger.debug(`Payment status validation passed for order ${id}`);

      // Validate that order status is not in a final state that prevents packager assignment
      const invalidOrderStatuses = ['delivered', 'picked_up', 'cancelled'];
      if (invalidOrderStatuses.includes(existingOrder.status)) {
        throw new BadRequestException(
          `Cannot assign packager to order with status '${existingOrder.status}'. Order is already in a final state.`
        );
      }

      // Update the order with packager assignment
      const updatedOrder = await this.prisma.order.update({
        where: { id },
        data: {
          packager: { connect: { id: data.packagerId } },
          status: "assigned_packager"
        },
        include: {
          packager: {
            select: { id: true, fullName: true, username: true, role: true }
          },
          shop: {
            select: { id: true, name: true, location: true }
          }
        }
      });

      this.logger.log(`Successfully assigned packager ${packager.fullName} to order ${id} for customer ${existingOrder.customerName}`);

      return {
        ...updatedOrder,
        message: `Packager ${packager.fullName} successfully assigned to order`
      };

    } catch (error: any) {
      this.logger.error(`Error updating packager for order ${id}:`, error.message);

      // Re-throw known exceptions
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      // Handle Prisma-specific errors
      if (error.code === 'P2025') {
        throw new NotFoundException('Order or packager not found');
      }

      if (error.code === 'P2002') {
        throw new BadRequestException('Constraint violation - this assignment may already exist');
      }

      // Generic error for unexpected issues
      throw new BadRequestException(`Failed to assign packager: ${error.message}`);
    }
  }

  async updateRelease(id: string, data: any, userId: string) {
  try {
    const updateData: any = {
      storekeeper: { connect: { id: userId } },
      status: "delivered",
    };

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        OrderItem: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    for (const item of order.OrderItem) {
      const product = item.product;
      const quantity = item.quantity;

      if (product.availableStock < quantity) {
        throw new BadRequestException(
          `Insufficient stock for product "${product.name}". Available: ${product.availableStock}, Needed: ${quantity}`
        );
      }

      await this.prisma.product.update({
        where: { id: product.id },
        data: {
          availableStock: {
            decrement: quantity,
          },
        },
      });
    }

    return await this.prisma.order.update({
      where: { id },
      data: updateData,
    });
  } catch (error: any) {
    this.logger.error('Error releasing order:', error.message);
    // Re-throw known exceptions
    if (error instanceof HttpException) {
      throw error;
    }
    throw new InternalServerErrorException(error.message || 'Failed to release order');
  }
  }

  // Get orders for current user based on their role and shop
  async getOrdersForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, shopId: true, shop: { select: { name: true } } }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.logger.debug(`Fetching orders for user ${userId} (${user.role}) in shop ${user.shop?.name} (${user.shopId})`);

    // Admin and CEO get all orders from all shops
    if (user.role === 'CEO' || user.role === 'Admin') {
      this.logger.debug('User is admin/CEO, returning all orders');
      return this.findAll();
    }

    // Other roles get orders from their shop only
    if (!user.shopId) {
      this.logger.warn(`User ${userId} has no shop assignment`);
      return [];
    }

    // Return all orders from the user's shop
    return this.getOrdersByShop(user.shopId);
  }

  // Enhanced method with pagination, search, and filtering
  async getOrdersForUserWithPagination(
    userId: string,
    page: number = 1,
    size: number = 20,
    search?: string,
    status?: string,
    paymentStatus?: string,
    startDate?: Date,
    endDate?: Date,
    shopId?: string
  ) {
    this.logger.debug(`Fetching orders with pagination for user ${userId}: page=${page}, size=${size}, search="${search}", status="${status}", paymentStatus="${paymentStatus}"`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, shopId: true, shop: { select: { name: true } } }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Build where conditions
    const whereConditions: any = {};

    // Role-based filtering
    if (user.role !== 'CEO' && user.role !== 'Admin') {
      // Non-admin users can only see orders from their shop
      if (!user.shopId) {
        this.logger.warn(`User ${userId} has no shop assignment`);
        return {
          data: [],
          page,
          size,
          total: 0,
          totalPages: 0
        };
      }
      whereConditions.shopId = user.shopId;
    } else if (shopId) {
      // Admin/CEO can filter by specific shop
      whereConditions.shopId = shopId;
    }

    // Search functionality
    if (search) {
      whereConditions.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { receiptId: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Status filtering
    if (status) {
      whereConditions.status = status;
    }

    // Payment status filtering
    if (paymentStatus) {
      whereConditions.paymentStatus = paymentStatus;
    }

    // Date range filtering
    if (startDate || endDate) {
      whereConditions.createdAt = {};
      if (startDate) {
        whereConditions.createdAt.gte = startDate;
      }
      if (endDate) {
        whereConditions.createdAt.lte = endDate;
      }
    }

    this.logger.debug(`Where conditions: ${JSON.stringify(whereConditions)}`);

    // Calculate offset
    const offset = (page - 1) * size;

    // Execute queries in parallel for better performance
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: whereConditions,
        include: {
          OrderItem: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  image: true,
                  category: {
                    select: { name: true }
                  }
                }
              }
            }
          },
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              category: {
                select: { name: true }
              }
            }
          },
          shop: {
            select: {
              id: true,
              name: true,
              location: true
            }
          },
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              username: true
            }
          },
          attendee: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              username: true
            }
          },
          receptionist: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              username: true
            }
          },
          packager: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              username: true
            }
          },
          storekeeper: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              username: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: size
      }),
      this.prisma.order.count({
        where: whereConditions
      })
    ]);

    this.logger.debug(`Found ${orders.length} orders out of ${total} total`);

    // Transform orders to include calculated fields
    const transformedOrders = orders.map(order => ({
      ...order,
      // Calculate remaining balance
      remainingBalance: Math.max(0, order.totalAmount - (order.paidAmount || 0)),
      // Calculate payment percentage
      paymentPercentage: order.totalAmount > 0 ? ((order.paidAmount || 0) / order.totalAmount) * 100 : 0,
      // Add order summary
      orderSummary: {
        totalItems: order.OrderItem.reduce((sum, item) => sum + item.quantity, 0),
        totalProducts: order.OrderItem.length,
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount || 0,
        remainingBalance: Math.max(0, order.totalAmount - (order.paidAmount || 0))
      }
    }));

    return {
      data: transformedOrders,
      page,
      size,
      total,
      totalPages: Math.max(1, Math.ceil(total / size)),
      filters: {
        search: search || null,
        status: status || null,
        paymentStatus: paymentStatus || null,
        startDate: startDate?.toISOString() || null,
        endDate: endDate?.toISOString() || null,
        shopId: shopId || null
      }
    };
  }

  // Get all orders from a specific shop
  async getOrdersByShop(shopId: string) {
    this.logger.debug(`Fetching all orders for shop: ${shopId}`);

    return this.prisma.order.findMany({
      where: { shopId },
      include: {
        OrderItem: { include: { product: true } },
        products: true,
        shop: { select: { id: true, name: true, location: true } },
        attendee: {
          select: { id: true, fullName: true, email: true, role: true, username: true }
        },
        receptionist: {
          select: { id: true, fullName: true, email: true, role: true, username: true }
        },
        packager: {
          select: { id: true, fullName: true, email: true, role: true, username: true }
        },
        storekeeper: {
          select: { id: true, fullName: true, email: true, role: true, username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Payment management methods
  async recordPayment(orderId: string, paymentData: any, userId: string) {
    try {
      this.logger.debug(`Recording payment for order ${orderId}: ${JSON.stringify(paymentData)}`);

      // Get the current order
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          totalAmount: true,
          paidAmount: true,
          paymentStatus: true,
          status: true,
          customerName: true
        }
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      const paymentAmount = parseFloat(paymentData.paymentAmount);
      if (paymentAmount <= 0) {
        throw new BadRequestException('Payment amount must be greater than 0');
      }

      const currentPaidAmount = order.paidAmount || 0;
      const newPaidAmount = currentPaidAmount + paymentAmount;
      const balanceAmount = order.totalAmount - newPaidAmount;

      // Determine new payment status
      let newPaymentStatus: 'pending' | 'partial' | 'paid' | 'overpaid' | 'confirmed';
      let newOrderStatus: 'pending_payment' | 'partial_payment' | 'paid' | 'assigned_packager' | 'packaged' | 'picked_up' | 'delivered' = order.status as any;

      if (newPaidAmount >= order.totalAmount) {
        newPaymentStatus = newPaidAmount > order.totalAmount ? 'overpaid' : 'paid';
        newOrderStatus = 'paid';
      } else {
        newPaymentStatus = 'partial';
        newOrderStatus = 'partial_payment';
      }

      // Update the order
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paidAmount: newPaidAmount,
          paymentStatus: newPaymentStatus,
          status: newOrderStatus,
          paymentMethod: paymentData.paymentMethod || null
        },
        include: {
          OrderItem: { include: { product: true } },
          shop: { select: { id: true, name: true, location: true } }
        }
      });

      // Log payment activity
      await this.prisma.activityLog.create({
        data: {
          userId: userId,
          action: 'PAYMENT_RECORDED',
          details: `Recorded payment of ₦${paymentAmount.toLocaleString()} for order ${orderId} (${order.customerName}). Payment method: ${paymentData.paymentMethod || 'Not specified'}. New total paid: ₦${newPaidAmount.toLocaleString()}, Balance: ₦${Math.max(0, balanceAmount).toLocaleString()}. Status: ${newPaymentStatus}`,
          ipAddress: null,
          userAgent: null
        }
      });

      this.logger.debug(`Payment recorded successfully for order ${orderId}`);

      return {
        success: true,
        message: 'Payment recorded successfully',
        order: updatedOrder,
        payment: {
          amount: paymentAmount,
          method: paymentData.paymentMethod,
          reference: paymentData.paymentReference,
          notes: paymentData.notes,
          recordedAt: new Date(),
          recordedBy: userId
        },
        summary: {
          totalAmount: order.totalAmount,
          paidAmount: newPaidAmount,
          balanceAmount: Math.max(0, balanceAmount),
          paymentStatus: newPaymentStatus,
          paymentPercentage: Math.round((newPaidAmount / order.totalAmount) * 100),
          canProceed: (newPaidAmount / order.totalAmount) >= 0.7 // 70% threshold
        }
      };

    } catch (error: any) {
      this.logger.error(`Failed to record payment for order ${orderId}: ${error.message}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to record payment: ${error.message}`);
    }
  }

  async getPaymentStatus(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        totalAmount: true,
        paidAmount: true,
        paymentStatus: true,
        status: true,
        customerName: true
      }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const paidAmount = order.paidAmount || 0;
    const balanceAmount = Math.max(0, order.totalAmount - paidAmount);
    const paymentPercentage = Math.round((paidAmount / order.totalAmount) * 100);

    return {
      orderId: order.id,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      paidAmount: paidAmount,
      balanceAmount: balanceAmount,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      paymentPercentage: paymentPercentage,
      canProceed: paymentPercentage >= 70,
      nextAction: this.getNextAction(paymentPercentage, order.status)
    };
  }

  async getPaymentHistory(orderId: string) {
    // For now, return payment summary since we don't have a separate payments table
    // In a full implementation, you'd have a separate PaymentTransaction table
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        totalAmount: true,
        paidAmount: true,
        paymentStatus: true,
        customerName: true,
        createdAt: true
      }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Get payment-related activity logs
    const paymentActivities = await this.prisma.activityLog.findMany({
      where: {
        action: 'PAYMENT_RECORDED',
        details: { contains: orderId }
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, role: true }
        }
      },
      orderBy: { timestamp: 'asc' }
    });

    return {
      orderId: order.id,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      paidAmount: order.paidAmount || 0,
      balanceAmount: Math.max(0, order.totalAmount - (order.paidAmount || 0)),
      paymentStatus: order.paymentStatus,
      paymentActivities: paymentActivities.map(activity => ({
        id: activity.id,
        details: activity.details,
        timestamp: activity.timestamp,
        recordedBy: activity.user
      }))
    };
  }

  private getNextAction(paymentPercentage: number, currentStatus: string): string {
    if (paymentPercentage >= 100) {
      if (currentStatus === 'paid') return 'Can assign to packager';
      if (currentStatus === 'assigned_packager') return 'Ready for packaging';
      if (currentStatus === 'packaged') return 'Ready for pickup/delivery';
      return 'Order fully paid';
    } else if (paymentPercentage >= 70) {
      return 'Can proceed to packaging with partial payment';
    } else {
      return `Need ${70 - paymentPercentage}% more payment to proceed`;
    }
  }
}