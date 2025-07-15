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
  });
}

async getOrdersByAttendee(attendeeId: string) {
  return this.prisma.order.findMany({
    where: { attendeeId },
    include: {
      OrderItem: { include: { product: true } },
      products: true,
    },
  });
}


async getOrdersByReceptionist(receptionistId: string) {
  return this.prisma.order.findMany({
    where: { receptionistId },
    include: {
      OrderItem: { include: { product: true } },
      products: true,
    },
  });
}

async getOrdersByPackager(packagerId: string) {
  return this.prisma.order.findMany({
    where: { packagerId },
    include: {
      OrderItem: { include: { product: true } },
      products: true,
    },
  });
}

async getOrdersByStorekeeper(storekeeperId: string) {
  return this.prisma.order.findMany({
    where: {
    //   storekeeperId, // ✅ uncommented to filter by storekeeper
      status: {
        in: ['paid', 'assigned_packager', 'packaged', 'picked_up'],
      },
    },
    include: {
      OrderItem: {
        include: {
          product: true,
        },
      },
      products: true,
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

    const createdOrder = await this.prisma.order.create({
      data: {
        ...rest,

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

    return createdOrder;
  } catch (error: any) {
    this.logger.error('Error creating order:', error.message);
    this.logger.error(error.stack || error.message);
    throw new Error('Failed to create order');
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
  try {
    const updateData: any = {};

    if (data.packagerId) {
      updateData.packager = { connect: { id: data.packagerId } };
      updateData.status = "assigned_packager"; // Update status to 'assigned_packager'
    }

    return await this.prisma.order.update({
      where: { id },
      data: updateData,
    });
  } catch (error: any) {
    this.logger.error('Error updating order:', error.message);
    throw new Error('Failed to update order');
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



}