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
    async getOrdersByAttendee(attendeeId) {
        const attendee = await this.prisma.user.findUnique({
            where: { id: attendeeId },
            select: { shopId: true }
        });
        return this.prisma.order.findMany({
            where: {
                AND: [
                    { attendeeId },
                    ...((attendee === null || attendee === void 0 ? void 0 : attendee.shopId) ? [{ shopId: attendee.shopId }] : [])
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
    async getOrdersByReceptionist(receptionistId) {
        const receptionist = await this.prisma.user.findUnique({
            where: { id: receptionistId },
            select: { shopId: true }
        });
        return this.prisma.order.findMany({
            where: {
                AND: [
                    { receptionistId },
                    ...((receptionist === null || receptionist === void 0 ? void 0 : receptionist.shopId) ? [{ shopId: receptionist.shopId }] : [])
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
    async getOrdersByPackager(packagerId) {
        const packager = await this.prisma.user.findUnique({
            where: { id: packagerId },
            select: { shopId: true }
        });
        return this.prisma.order.findMany({
            where: {
                AND: [
                    { packagerId },
                    ...((packager === null || packager === void 0 ? void 0 : packager.shopId) ? [{ shopId: packager.shopId }] : [])
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
    async getOrdersByStorekeeper(storekeeperId) {
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
                    ...((storekeeper === null || storekeeper === void 0 ? void 0 : storekeeper.shopId) ? [{ shopId: storekeeper.shopId }] : [])
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
    async create(data) {
        var _a;
        this.logger.log(`Creating order with data: ${JSON.stringify(data)}`);
        try {
            const { userId, attendeeId, receptionistId, packagerId, storekeeperId, products } = data, rest = __rest(data, ["userId", "attendeeId", "receptionistId", "packagerId", "storekeeperId", "products"]);
            let attendeeShopId = null;
            if (attendeeId) {
                const attendee = await this.prisma.user.findUnique({
                    where: { id: attendeeId },
                    select: { shopId: true, shop: { select: { id: true, name: true } } }
                });
                if (!(attendee === null || attendee === void 0 ? void 0 : attendee.shopId)) {
                    throw new common_2.BadRequestException('Attendee is not assigned to any shop');
                }
                attendeeShopId = attendee.shopId;
                this.logger.debug(`Order being created for shop: ${(_a = attendee.shop) === null || _a === void 0 ? void 0 : _a.name} (${attendeeShopId})`);
            }
            const inventoryUpdates = [];
            for (const product of products) {
                const requestedQuantity = product.quantity || 1;
                if (attendeeShopId) {
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
                        throw new common_2.BadRequestException(`Product "${product.name}" is not assigned to this shop`);
                    }
                    if (assignment.availableQuantity < requestedQuantity) {
                        throw new common_2.BadRequestException(`Insufficient stock for "${product.name}". Available: ${assignment.availableQuantity}, Requested: ${requestedQuantity}`);
                    }
                    inventoryUpdates.push({
                        assignmentId: assignment.id,
                        soldQuantity: requestedQuantity,
                        productName: assignment.product.name
                    });
                }
            }
            const createdOrder = await this.prisma.order.create({
                data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ customerName: rest.customerName, customerPhone: rest.customerPhone || null, status: rest.status || 'pending_payment', paymentMethod: rest.paymentMethod || null, paymentStatus: rest.paymentStatus || 'pending', totalAmount: rest.totalAmount, paidAmount: rest.paidAmount || 0, receiptId: rest.receiptId }, (attendeeShopId && { shop: { connect: { id: attendeeShopId } } })), (userId && { user: { connect: { id: userId } } })), (attendeeId && { attendee: { connect: { id: attendeeId } } })), (receptionistId && { receptionist: { connect: { id: receptionistId } } })), (packagerId && { packager: { connect: { id: packagerId } } })), (storekeeperId && { storekeeper: { connect: { id: storekeeperId } } })), { products: {
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
            if (attendeeId) {
                const productNames = products.map((p) => p.name || 'Unknown Product').join(', ');
                const totalQuantity = products.reduce((sum, p) => sum + (p.quantity || 1), 0);
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
        }
        catch (error) {
            this.logger.error('Error creating order:', error.message);
            this.logger.error(error.stack || error.message);
            if (error instanceof common_2.BadRequestException) {
                throw error;
            }
            throw new common_2.InternalServerErrorException('Failed to create order');
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
        this.logger.debug(`Updating packager for order ${id}: ${JSON.stringify(data)}`);
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
    async getOrdersForUser(userId) {
        var _a;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, shopId: true, shop: { select: { name: true } } }
        });
        if (!user) {
            throw new common_2.NotFoundException('User not found');
        }
        this.logger.debug(`Fetching orders for user ${userId} (${user.role}) in shop ${(_a = user.shop) === null || _a === void 0 ? void 0 : _a.name} (${user.shopId})`);
        if (user.role === 'CEO' || user.role === 'Admin') {
            this.logger.debug('User is admin/CEO, returning all orders');
            return this.findAll();
        }
        if (!user.shopId) {
            this.logger.warn(`User ${userId} has no shop assignment`);
            return [];
        }
        return this.getOrdersByShop(user.shopId);
    }
    async getOrdersByShop(shopId) {
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
    async recordPayment(orderId, paymentData, userId) {
        try {
            this.logger.debug(`Recording payment for order ${orderId}: ${JSON.stringify(paymentData)}`);
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
                throw new common_2.NotFoundException(`Order with ID ${orderId} not found`);
            }
            const paymentAmount = parseFloat(paymentData.paymentAmount);
            if (paymentAmount <= 0) {
                throw new common_2.BadRequestException('Payment amount must be greater than 0');
            }
            const currentPaidAmount = order.paidAmount || 0;
            const newPaidAmount = currentPaidAmount + paymentAmount;
            const balanceAmount = order.totalAmount - newPaidAmount;
            let newPaymentStatus;
            let newOrderStatus = order.status;
            if (newPaidAmount >= order.totalAmount) {
                newPaymentStatus = newPaidAmount > order.totalAmount ? 'overpaid' : 'paid';
                newOrderStatus = 'paid';
            }
            else {
                newPaymentStatus = 'partial';
                newOrderStatus = 'partial_payment';
            }
            const updatedOrder = await this.prisma.order.update({
                where: { id: orderId },
                data: {
                    paidAmount: newPaidAmount,
                    paymentStatus: newPaymentStatus,
                    status: newOrderStatus
                },
                include: {
                    OrderItem: { include: { product: true } },
                    shop: { select: { id: true, name: true, location: true } }
                }
            });
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
                    canProceed: (newPaidAmount / order.totalAmount) >= 0.7
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to record payment for order ${orderId}: ${error.message}`);
            if (error instanceof common_2.NotFoundException || error instanceof common_2.BadRequestException) {
                throw error;
            }
            throw new common_2.InternalServerErrorException(`Failed to record payment: ${error.message}`);
        }
    }
    async getPaymentStatus(orderId) {
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
            throw new common_2.NotFoundException(`Order with ID ${orderId} not found`);
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
    async getPaymentHistory(orderId) {
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
            throw new common_2.NotFoundException(`Order with ID ${orderId} not found`);
        }
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
    getNextAction(paymentPercentage, currentStatus) {
        if (paymentPercentage >= 100) {
            if (currentStatus === 'paid')
                return 'Can assign to packager';
            if (currentStatus === 'assigned_packager')
                return 'Ready for packaging';
            if (currentStatus === 'packaged')
                return 'Ready for pickup/delivery';
            return 'Order fully paid';
        }
        else if (paymentPercentage >= 70) {
            return 'Can proceed to packaging with partial payment';
        }
        else {
            return `Need ${70 - paymentPercentage}% more payment to proceed`;
        }
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = OrderService_1 = __decorate([
    (0, common_2.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrderService);
//# sourceMappingURL=order.service.js.map