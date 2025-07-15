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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var OrderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const common_2 = require("@nestjs/common");
let OrderService = OrderService_1 = class OrderService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(OrderService_1.name);
    }
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
    async getOrdersByAttendee(attendeeId) {
        return this.prisma.order.findMany({
            where: { attendeeId },
            include: {
                OrderItem: { include: { product: true } },
                products: true,
            },
        });
    }
    async getOrdersByReceptionist(receptionistId) {
        return this.prisma.order.findMany({
            where: { receptionistId },
            include: {
                OrderItem: { include: { product: true } },
                products: true,
            },
        });
    }
    async getOrdersByPackager(packagerId) {
        return this.prisma.order.findMany({
            where: { packagerId },
            include: {
                OrderItem: { include: { product: true } },
                products: true,
            },
        });
    }
    async getOrdersByStorekeeper(storekeeperId) {
        return this.prisma.order.findMany({
            where: {
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
    async create(data) {
        this.logger.log(`Creating order with data: ${JSON.stringify(data)}`);
        try {
            const { userId, attendeeId, receptionistId, packagerId, storekeeperId, products } = data, rest = __rest(data, ["userId", "attendeeId", "receptionistId", "packagerId", "storekeeperId", "products"]);
            const createdOrder = await this.prisma.order.create({
                data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, rest), (userId && { user: { connect: { id: userId } } })), (attendeeId && { attendee: { connect: { id: attendeeId } } })), (receptionistId && { receptionist: { connect: { id: receptionistId } } })), (packagerId && { packager: { connect: { id: packagerId } } })), (storekeeperId && { storekeeper: { connect: { id: storekeeperId } } })), { products: {
                        connect: products.map((p) => ({ id: p.id })),
                    }, OrderItem: {
                        create: products.map((p) => ({
                            product: { connect: { id: p.id } },
                            quantity: p.quantity || 1,
                        })),
                    } }),
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
        }
        catch (error) {
            this.logger.error('Error creating order:', error.message);
            this.logger.error(error.stack || error.message);
            throw new Error('Failed to create order');
        }
    }
    async update(id, data) {
        try {
            return this.prisma.order.update({ where: { id }, data });
        }
        catch (error) {
            this.logger.error('Error updating order:', error.message);
            this.logger.error('Error updating order:', error.stack || error.message);
            throw new Error('Failed to update order');
        }
    }
    async updatePayment(id, data) {
        try {
            const updateData = {
                status: data.status,
                paymentStatus: data.paymentStatus,
                paymentMethod: data.paymentMethod,
            };
            if (data.receptionistId) {
                updateData.receptionist = { connect: { id: data.receptionistId } };
            }
            return await this.prisma.order.update({
                where: { id },
                data: updateData,
            });
        }
        catch (error) {
            this.logger.error('Error updating order:', error.message);
            this.logger.error('Error updating order:', error.stack || error.message);
            throw new Error('Failed to update order');
        }
    }
    async updatePackager(id, data) {
        try {
            const updateData = {};
            if (data.packagerId) {
                updateData.packager = { connect: { id: data.packagerId } };
                updateData.status = "assigned_packager";
            }
            return await this.prisma.order.update({
                where: { id },
                data: updateData,
            });
        }
        catch (error) {
            this.logger.error('Error updating order:', error.message);
            throw new Error('Failed to update order');
        }
    }
    async updateRelease(id, data, userId) {
        try {
            const updateData = {
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
                throw new common_2.NotFoundException('Order not found');
            }
            for (const item of order.OrderItem) {
                const product = item.product;
                const quantity = item.quantity;
                if (product.availableStock < quantity) {
                    throw new common_2.BadRequestException(`Insufficient stock for product "${product.name}". Available: ${product.availableStock}, Needed: ${quantity}`);
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
        }
        catch (error) {
            this.logger.error('Error releasing order:', error.message);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_2.InternalServerErrorException(error.message || 'Failed to release order');
        }
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = OrderService_1 = __decorate([
    (0, common_2.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrderService);
//# sourceMappingURL=order.service.js.map