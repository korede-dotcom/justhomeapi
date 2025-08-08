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
var WarehouseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let WarehouseService = WarehouseService_1 = class WarehouseService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(WarehouseService_1.name);
    }
    async create(data) {
        try {
            this.logger.debug(`Creating warehouse: ${JSON.stringify(data)}`);
            const validData = {
                name: data.name,
                location: data.location,
                description: data.description,
                managerId: data.managerId,
                isActive: data.isActive !== undefined ? data.isActive : true
            };
            Object.keys(validData).forEach(key => {
                if (validData[key] === undefined) {
                    delete validData[key];
                }
            });
            this.logger.debug(`Filtered warehouse data: ${JSON.stringify(validData)}`);
            if (validData.managerId) {
                const manager = await this.prisma.user.findUnique({
                    where: { id: validData.managerId }
                });
                if (!manager) {
                    this.logger.error(`Manager with ID ${validData.managerId} not found`);
                    throw new common_1.BadRequestException(`Manager with ID ${validData.managerId} not found`);
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
        }
        catch (error) {
            this.logger.error(`Failed to create warehouse: ${error.message}`);
            this.logger.error(`Error details: ${JSON.stringify(error)}`);
            if (error.code === 'P2002') {
                throw new common_1.BadRequestException('A warehouse with this name already exists');
            }
            else if (error.code === 'P2003') {
                throw new common_1.BadRequestException('Invalid manager ID provided');
            }
            else if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            else {
                throw new common_1.BadRequestException(`Failed to create warehouse: ${error.message}`);
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
    async findOne(id) {
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
        if (!warehouse)
            throw new common_1.NotFoundException('Warehouse not found');
        return warehouse;
    }
    async update(id, data) {
        return this.prisma.warehouse.update({ where: { id }, data });
    }
    async remove(id) {
        return this.prisma.warehouse.delete({ where: { id } });
    }
    async assignProductToShop(data) {
        try {
            this.logger.debug(`Assigning product to shop: ${JSON.stringify(data)}`);
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
                throw new common_1.NotFoundException(`Product with ID ${data.productId} not found`);
            }
            if (product.availableStock < data.quantity) {
                throw new common_1.BadRequestException(`Insufficient warehouse stock. Available: ${product.availableStock}, Requested: ${data.quantity}`);
            }
            let assignment;
            let activityAction;
            let activityDetails;
            if (existingAssignment) {
                const previousQuantity = existingAssignment.quantity;
                const previousAvailable = existingAssignment.availableQuantity;
                assignment = await this.prisma.productAssignment.update({
                    where: { id: existingAssignment.id },
                    data: {
                        quantity: { increment: data.quantity },
                        availableQuantity: { increment: data.quantity },
                        warehouseId: data.warehouseId,
                        assignedBy: data.assignedBy,
                        assignedAt: new Date()
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
            }
            else {
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
            await this.prisma.product.update({
                where: { id: data.productId },
                data: {
                    availableStock: { decrement: data.quantity }
                }
            });
            await this.prisma.activityLog.create({
                data: {
                    userId: data.assignedBy,
                    action: activityAction,
                    details: activityDetails,
                    ipAddress: null,
                    userAgent: null
                }
            });
            this.logger.debug(`Warehouse stock decremented by ${data.quantity} for product ${product.name}`);
            return Object.assign(Object.assign({}, assignment), { isRestock: !!existingAssignment, warehouseStockAfter: product.availableStock - data.quantity, message: existingAssignment
                    ? `Successfully restocked ${data.quantity} units`
                    : `Successfully assigned ${data.quantity} units` });
        }
        catch (error) {
            this.logger.error(`Failed to assign product to shop: ${error.message}`);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to assign product to shop: ${error.message}`);
        }
    }
    async getWarehouseReport(warehouseId) {
        var _a, _b, _c;
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
        if (!warehouse)
            throw new common_1.NotFoundException('Warehouse not found');
        return {
            warehouse,
            totalProducts: ((_a = warehouse.products) === null || _a === void 0 ? void 0 : _a.length) || 0,
            totalAssignments: ((_b = warehouse.productAssignments) === null || _b === void 0 ? void 0 : _b.length) || 0,
            totalUsers: ((_c = warehouse.users) === null || _c === void 0 ? void 0 : _c.length) || 0
        };
    }
    async getProductsAssignedToShop(shopId) {
        try {
            this.logger.debug(`Getting products assigned to shop: ${shopId}`);
            const shop = await this.prisma.shop.findUnique({
                where: { id: shopId },
                select: { id: true, name: true, location: true, isActive: true }
            });
            if (!shop) {
                throw new common_1.NotFoundException(`Shop with ID ${shopId} not found`);
            }
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
        }
        catch (error) {
            this.logger.error(`Failed to get products for shop ${shopId}: ${error.message}`);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to get shop products: ${error.message}`);
        }
    }
    async getAllProductsForNonAdmins(userId) {
        try {
            this.logger.debug(`Getting products for non-admin user: ${userId}`);
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    shop: {
                        select: { id: true, name: true, location: true }
                    }
                }
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
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
            const productMap = new Map();
            productAssignments.forEach(assignment => {
                const productId = assignment.product.id;
                if (productMap.has(productId)) {
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
                }
                else {
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
        }
        catch (error) {
            this.logger.error(`Failed to get products for non-admin user ${userId}: ${error.message}`);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to get products: ${error.message}`);
        }
    }
    async updateShopInventory(data) {
        try {
            this.logger.debug(`Updating shop inventory: ${JSON.stringify(data)}`);
            const assignment = await this.prisma.productAssignment.findUnique({
                where: { id: data.assignmentId },
                include: {
                    product: { select: { id: true, name: true } },
                    shop: { select: { id: true, name: true } }
                }
            });
            if (!assignment) {
                throw new common_1.NotFoundException(`Product assignment with ID ${data.assignmentId} not found`);
            }
            let newSoldQuantity = assignment.soldQuantity;
            let newAvailableQuantity = assignment.availableQuantity;
            switch (data.action) {
                case 'sale':
                    if (data.soldQuantity > assignment.availableQuantity) {
                        throw new common_1.BadRequestException(`Cannot sell ${data.soldQuantity} items. Only ${assignment.availableQuantity} available.`);
                    }
                    newSoldQuantity += data.soldQuantity;
                    newAvailableQuantity -= data.soldQuantity;
                    break;
                case 'return':
                    if (data.soldQuantity > assignment.soldQuantity) {
                        throw new common_1.BadRequestException(`Cannot return ${data.soldQuantity} items. Only ${assignment.soldQuantity} were sold.`);
                    }
                    newSoldQuantity -= data.soldQuantity;
                    newAvailableQuantity += data.soldQuantity;
                    break;
                case 'adjustment':
                    if (data.soldQuantity < 0 || data.soldQuantity > assignment.quantity) {
                        throw new common_1.BadRequestException(`Invalid sold quantity. Must be between 0 and ${assignment.quantity}.`);
                    }
                    newSoldQuantity = data.soldQuantity;
                    newAvailableQuantity = assignment.quantity - data.soldQuantity;
                    break;
            }
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
        }
        catch (error) {
            this.logger.error(`Failed to update shop inventory: ${error.message}`);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to update shop inventory: ${error.message}`);
        }
    }
};
exports.WarehouseService = WarehouseService;
exports.WarehouseService = WarehouseService = WarehouseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WarehouseService);
//# sourceMappingURL=warehouse.service.js.map