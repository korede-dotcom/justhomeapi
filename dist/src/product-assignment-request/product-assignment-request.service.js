"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ProductAssignmentRequestService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductAssignmentRequestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ProductAssignmentRequestService = ProductAssignmentRequestService_1 = class ProductAssignmentRequestService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ProductAssignmentRequestService_1.name);
    }
    async createRequest(requestData, requestedBy) {
        try {
            this.logger.debug(`Creating product assignment request by ${requestedBy}: ${JSON.stringify(requestData)}`);
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
                throw new common_1.BadRequestException(`User with ID ${requestedBy} not found`);
            }
            if (requestingUser.role !== 'WarehouseKeeper') {
                throw new common_1.BadRequestException(`Only WarehouseKeepers can create product assignment requests. Current role: ${requestingUser.role}`);
            }
            const managedWarehouseIds = requestingUser.managedWarehouses.map(w => w.id);
            if (!managedWarehouseIds.includes(requestData.warehouseId)) {
                throw new common_1.BadRequestException(`Access denied. You do not manage warehouse ${requestData.warehouseId}`);
            }
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
                throw new common_1.BadRequestException(`Product with ID ${requestData.productId} not found`);
            }
            if (product.warehouseId !== requestData.warehouseId) {
                throw new common_1.BadRequestException(`Product ${product.name} is not in warehouse ${requestData.warehouseId}`);
            }
            const shop = await this.prisma.shop.findUnique({
                where: { id: requestData.shopId },
                select: { id: true, name: true, location: true, isActive: true }
            });
            if (!shop) {
                throw new common_1.BadRequestException(`Shop with ID ${requestData.shopId} not found`);
            }
            if (!shop.isActive) {
                throw new common_1.BadRequestException(`Cannot assign products to inactive shop: ${shop.name}`);
            }
            if (requestData.quantity > product.availableStock) {
                throw new common_1.BadRequestException(`Insufficient quantity. Requested: ${requestData.quantity}, Available: ${product.availableStock}`);
            }
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
        }
        catch (error) {
            this.logger.error(`Failed to create product assignment request: ${error.message}`);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to create assignment request: ${error.message}`);
        }
    }
    async getPendingRequests(query) {
        const page = (query === null || query === void 0 ? void 0 : query.page) || 1;
        const size = Math.min((query === null || query === void 0 ? void 0 : query.size) || 20, 100);
        try {
            const whereClause = {
                status: 'PENDING'
            };
            if (query === null || query === void 0 ? void 0 : query.warehouseId) {
                whereClause.warehouseId = query.warehouseId;
            }
            if (query === null || query === void 0 ? void 0 : query.shopId) {
                whereClause.shopId = query.shopId;
            }
            if (query === null || query === void 0 ? void 0 : query.requestedBy) {
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
        }
        catch (error) {
            this.logger.error(`Failed to fetch pending requests: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to fetch pending requests: ${error.message}`);
        }
    }
    async approveRequest(requestId, reviewedBy, reviewNotes) {
        try {
            this.logger.debug(`Approving request ${requestId} by ${reviewedBy}`);
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
                throw new common_1.BadRequestException(`Request with ID ${requestId} not found`);
            }
            if (request.status !== 'PENDING') {
                throw new common_1.BadRequestException(`Request has already been ${request.status.toLowerCase()}`);
            }
            if (request.quantity > request.product.availableStock) {
                throw new common_1.BadRequestException(`Insufficient stock. Requested: ${request.quantity}, Available: ${request.product.availableStock}`);
            }
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
            await this.prisma.product.update({
                where: { id: request.productId },
                data: {
                    availableStock: {
                        decrement: request.quantity
                    }
                }
            });
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
        }
        catch (error) {
            this.logger.error(`Failed to approve request: ${error.message}`);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to approve request: ${error.message}`);
        }
    }
    async rejectRequest(requestId, reviewedBy, reviewNotes) {
        try {
            this.logger.debug(`Rejecting request ${requestId} by ${reviewedBy}`);
            const request = await this.prisma.productAssignmentRequest.findUnique({
                where: { id: requestId }
            });
            if (!request) {
                throw new common_1.BadRequestException(`Request with ID ${requestId} not found`);
            }
            if (request.status !== 'PENDING') {
                throw new common_1.BadRequestException(`Request has already been ${request.status.toLowerCase()}`);
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
        }
        catch (error) {
            this.logger.error(`Failed to reject request: ${error.message}`);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to reject request: ${error.message}`);
        }
    }
};
exports.ProductAssignmentRequestService = ProductAssignmentRequestService;
exports.ProductAssignmentRequestService = ProductAssignmentRequestService = ProductAssignmentRequestService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductAssignmentRequestService);
//# sourceMappingURL=product-assignment-request.service.js.map