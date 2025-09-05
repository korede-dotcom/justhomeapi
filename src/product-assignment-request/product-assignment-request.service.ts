import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductAssignmentRequestService {
  private readonly logger = new Logger(ProductAssignmentRequestService.name);

  constructor(private prisma: PrismaService) {}

  async createRequest(requestData: {
    productId: string;
    shopId: string;
    warehouseId: string;
    quantity: number;
    reason?: string;
  }, requestedBy: string) {
    try {
      this.logger.debug(`Creating product assignment request by ${requestedBy}: ${JSON.stringify(requestData)}`);

      // Validate requesting user is a WarehouseKeeper
      const requestingUser = await this.prisma.user.findUnique({
        where: { id: requestedBy },
        select: { 
          id: true, 
          username: true, 
          fullName: true, 
          role: true,
          managedWarehouses: {
            select: { id: true }
          }
        }
      });

      if (!requestingUser) {
        throw new BadRequestException(`User with ID ${requestedBy} not found`);
      }

      if (requestingUser.role !== 'WarehouseKeeper') {
        throw new BadRequestException(`Only WarehouseKeepers can create product assignment requests. Current role: ${requestingUser.role}`);
      }

      // Validate WarehouseKeeper manages the specified warehouse
      const managedWarehouseIds = requestingUser.managedWarehouses.map(w => w.id);
      if (!managedWarehouseIds.includes(requestData.warehouseId)) {
        throw new BadRequestException(`Access denied. You do not manage warehouse ${requestData.warehouseId}`);
      }

      // Validate product exists and is in the specified warehouse
      const product = await this.prisma.product.findUnique({
        where: { id: requestData.productId },
        select: { 
          id: true, 
          name: true, 
          price: true, 
          totalStock: true,
          availableStock: true,
          warehouseId: true,
          warehouse: {
            select: { id: true, name: true, location: true }
          }
        }
      });

      if (!product) {
        throw new BadRequestException(`Product with ID ${requestData.productId} not found`);
      }

      if (product.warehouseId !== requestData.warehouseId) {
        throw new BadRequestException(`Product ${product.name} is not in warehouse ${requestData.warehouseId}`);
      }

      // Validate shop exists
      const shop = await this.prisma.shop.findUnique({
        where: { id: requestData.shopId },
        select: { id: true, name: true, location: true, isActive: true }
      });

      if (!shop) {
        throw new BadRequestException(`Shop with ID ${requestData.shopId} not found`);
      }

      if (!shop.isActive) {
        throw new BadRequestException(`Cannot assign products to inactive shop: ${shop.name}`);
      }

      // Check if there's enough quantity available
      if (requestData.quantity > product.availableStock) {
        throw new BadRequestException(`Insufficient quantity. Requested: ${requestData.quantity}, Available: ${product.availableStock}`);
      }

      // Create the assignment request
      const assignmentRequest = await this.prisma.productAssignmentRequest.create({
        data: {
          productId: requestData.productId,
          shopId: requestData.shopId,
          warehouseId: requestData.warehouseId,
          quantity: requestData.quantity,
          reason: requestData.reason,
          requestedBy: requestedBy
        },
        include: {
          product: {
            select: { id: true, name: true, price: true, totalStock: true, availableStock: true }
          },
          shop: {
            select: { id: true, name: true, location: true }
          },
          warehouse: {
            select: { id: true, name: true, location: true }
          },
          requestedByUser: {
            select: { id: true, username: true, fullName: true, role: true }
          }
        }
      });

      this.logger.log(`Product assignment request created: ${assignmentRequest.id} by ${requestingUser.username}`);

      return {
        success: true,
        message: `Product assignment request created successfully. Awaiting admin approval.`,
        request: {
          id: assignmentRequest.id,
          quantity: assignmentRequest.quantity,
          reason: assignmentRequest.reason,
          status: assignmentRequest.status,
          requestedAt: assignmentRequest.requestedAt,
          product: assignmentRequest.product,
          shop: assignmentRequest.shop,
          warehouse: assignmentRequest.warehouse,
          requestedBy: assignmentRequest.requestedByUser
        }
      };

    } catch (error: any) {
      this.logger.error(`Failed to create product assignment request: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create assignment request: ${error.message}`);
    }
  }

  async getPendingRequests(query?: { 
    page?: number; 
    size?: number; 
    warehouseId?: string; 
    shopId?: string; 
    requestedBy?: string;
  }) {
    const page = query?.page || 1;
    const size = Math.min(query?.size || 20, 100);

    try {
      const whereClause: any = {
        status: 'PENDING'
      };

      if (query?.warehouseId) {
        whereClause.warehouseId = query.warehouseId;
      }

      if (query?.shopId) {
        whereClause.shopId = query.shopId;
      }

      if (query?.requestedBy) {
        whereClause.requestedBy = query.requestedBy;
      }

      const [requests, total] = await Promise.all([
        this.prisma.productAssignmentRequest.findMany({
          where: whereClause,
          include: {
            product: {
              select: { id: true, name: true, price: true, totalStock: true, availableStock: true }
            },
            shop: {
              select: { id: true, name: true, location: true }
            },
            warehouse: {
              select: { id: true, name: true, location: true }
            },
            requestedByUser: {
              select: { id: true, username: true, fullName: true, role: true }
            }
          },
          orderBy: { requestedAt: 'desc' },
          skip: (page - 1) * size,
          take: size
        }),
        this.prisma.productAssignmentRequest.count({
          where: whereClause
        })
      ]);

      const totalPages = Math.ceil(total / size);

      return {
        data: requests,
        page,
        size,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      };

    } catch (error: any) {
      this.logger.error(`Failed to fetch pending requests: ${error.message}`);
      throw new BadRequestException(`Failed to fetch pending requests: ${error.message}`);
    }
  }

  async approveRequest(requestId: string, reviewedBy: string, reviewNotes?: string) {
    try {
      this.logger.debug(`Approving request ${requestId} by ${reviewedBy}`);

      // Get the request details
      const request = await this.prisma.productAssignmentRequest.findUnique({
        where: { id: requestId },
        include: {
          product: true,
          shop: true,
          warehouse: true,
          requestedByUser: {
            select: { id: true, username: true, fullName: true }
          }
        }
      });

      if (!request) {
        throw new BadRequestException(`Request with ID ${requestId} not found`);
      }

      if (request.status !== 'PENDING') {
        throw new BadRequestException(`Request has already been ${request.status.toLowerCase()}`);
      }

      // Check if there's still enough stock
      if (request.quantity > request.product.availableStock) {
        throw new BadRequestException(`Insufficient stock. Requested: ${request.quantity}, Available: ${request.product.availableStock}`);
      }

      // Create the actual product assignment (using existing system)
      const assignment = await this.prisma.productAssignment.create({
        data: {
          productId: request.productId,
          shopId: request.shopId,
          warehouseId: request.warehouseId,
          quantity: request.quantity,
          availableQuantity: request.quantity,
          assignedBy: reviewedBy
        }
      });

      // Update product stock
      await this.prisma.product.update({
        where: { id: request.productId },
        data: {
          availableStock: {
            decrement: request.quantity
          }
        }
      });

      // Update request status
      const updatedRequest = await this.prisma.productAssignmentRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          reviewedBy: reviewedBy,
          reviewedAt: new Date(),
          reviewNotes: reviewNotes
        },
        include: {
          product: {
            select: { id: true, name: true, price: true }
          },
          shop: {
            select: { id: true, name: true, location: true }
          },
          warehouse: {
            select: { id: true, name: true, location: true }
          },
          requestedByUser: {
            select: { id: true, username: true, fullName: true }
          },
          reviewedByUser: {
            select: { id: true, username: true, fullName: true }
          }
        }
      });

      this.logger.log(`Request ${requestId} approved and product assigned to shop`);

      return {
        success: true,
        message: `Request approved and ${request.quantity} units of ${request.product.name} assigned to ${request.shop.name}`,
        assignment: {
          id: assignment.id,
          quantity: assignment.quantity,
          availableQuantity: assignment.availableQuantity,
          assignedAt: assignment.assignedAt
        },
        request: updatedRequest
      };

    } catch (error: any) {
      this.logger.error(`Failed to approve request: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to approve request: ${error.message}`);
    }
  }

  async rejectRequest(requestId: string, reviewedBy: string, reviewNotes?: string) {
    try {
      this.logger.debug(`Rejecting request ${requestId} by ${reviewedBy}`);

      const request = await this.prisma.productAssignmentRequest.findUnique({
        where: { id: requestId }
      });

      if (!request) {
        throw new BadRequestException(`Request with ID ${requestId} not found`);
      }

      if (request.status !== 'PENDING') {
        throw new BadRequestException(`Request has already been ${request.status.toLowerCase()}`);
      }

      const updatedRequest = await this.prisma.productAssignmentRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          reviewedBy: reviewedBy,
          reviewedAt: new Date(),
          reviewNotes: reviewNotes
        },
        include: {
          product: {
            select: { id: true, name: true, price: true }
          },
          shop: {
            select: { id: true, name: true, location: true }
          },
          warehouse: {
            select: { id: true, name: true, location: true }
          },
          requestedByUser: {
            select: { id: true, username: true, fullName: true }
          },
          reviewedByUser: {
            select: { id: true, username: true, fullName: true }
          }
        }
      });

      this.logger.log(`Request ${requestId} rejected`);

      return {
        success: true,
        message: `Request rejected`,
        request: updatedRequest
      };

    } catch (error: any) {
      this.logger.error(`Failed to reject request: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to reject request: ${error.message}`);
    }
  }
}
