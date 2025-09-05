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
var DashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DashboardService = DashboardService_1 = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DashboardService_1.name);
    }
    async getUserDashboard() {
        try {
            this.logger.debug('Fetching user dashboard data');
            const [totalUsers, activeUsers, adminUsers, staffUsers, usersByRole] = await Promise.all([
                this.prisma.user.count(),
                this.prisma.user.count({
                    where: { isActive: true }
                }),
                this.prisma.user.count({
                    where: {
                        role: { in: ['CEO', 'Admin'] },
                        isActive: true
                    }
                }),
                this.prisma.user.count({
                    where: {
                        role: { notIn: ['CEO', 'Admin', 'Customer'] },
                        isActive: true
                    }
                }),
                this.prisma.user.groupBy({
                    by: ['role'],
                    _count: { role: true },
                    where: { isActive: true }
                })
            ]);
            const roleBreakdown = usersByRole.reduce((acc, item) => {
                acc[item.role] = item._count.role;
                return acc;
            }, {});
            return {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers,
                adminUsers,
                staffUsers,
                customerUsers: roleBreakdown['Customer'] || 0,
                roleBreakdown
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch user dashboard: ${error.message}`);
            throw error;
        }
    }
    async getActivityDashboard() {
        try {
            this.logger.debug('Fetching activity dashboard data');
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            const [totalActivities, todayActivities, weekActivities, activeUsersToday, activeUsersThisWeek] = await Promise.all([
                this.prisma.activityLog.count(),
                this.prisma.activityLog.count({
                    where: {
                        timestamp: { gte: today }
                    }
                }),
                this.prisma.activityLog.count({
                    where: {
                        timestamp: { gte: weekAgo }
                    }
                }),
                this.prisma.activityLog.findMany({
                    where: {
                        timestamp: { gte: today }
                    },
                    select: { userId: true },
                    distinct: ['userId']
                }),
                this.prisma.activityLog.findMany({
                    where: {
                        timestamp: { gte: weekAgo }
                    },
                    select: { userId: true },
                    distinct: ['userId']
                })
            ]);
            return {
                totalActivities,
                todayActivities,
                weekActivities,
                activeUsersToday: activeUsersToday.length,
                activeUsersThisWeek: activeUsersThisWeek.length
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch activity dashboard: ${error.message}`);
            throw error;
        }
    }
    async getWarehouseDashboard() {
        try {
            this.logger.debug('Fetching warehouse dashboard data');
            const [totalWarehouses, activeWarehouses, warehousesWithManagers, totalWarehouseStaff, warehouseStats] = await Promise.all([
                this.prisma.warehouse.count(),
                this.prisma.warehouse.count({
                    where: { isActive: true }
                }),
                this.prisma.warehouse.count({
                    where: {
                        managerId: { not: null },
                        isActive: true
                    }
                }),
                this.prisma.user.count({
                    where: {
                        warehouseId: { not: null },
                        isActive: true
                    }
                }),
                this.prisma.warehouse.findMany({
                    where: { isActive: true },
                    select: {
                        _count: {
                            select: {
                                products: true,
                                users: true,
                                productAssignments: true
                            }
                        }
                    }
                })
            ]);
            const totalProducts = warehouseStats.reduce((sum, w) => sum + w._count.products, 0);
            const totalAssignments = warehouseStats.reduce((sum, w) => sum + w._count.productAssignments, 0);
            return {
                totalWarehouses,
                activeWarehouses,
                inactiveWarehouses: totalWarehouses - activeWarehouses,
                warehousesWithManagers,
                warehousesWithoutManagers: activeWarehouses - warehousesWithManagers,
                totalWarehouseStaff,
                totalProductsInWarehouses: totalProducts,
                totalProductAssignments: totalAssignments
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch warehouse dashboard: ${error.message}`);
            throw error;
        }
    }
    async getShopDashboard() {
        try {
            this.logger.debug('Fetching shop dashboard data');
            const [totalShops, activeShops, shopsWithManagers, totalShopStaff, shopStats] = await Promise.all([
                this.prisma.shop.count(),
                this.prisma.shop.count({
                    where: { isActive: true }
                }),
                this.prisma.shop.count({
                    where: {
                        managerId: { not: null },
                        isActive: true
                    }
                }),
                this.prisma.user.count({
                    where: {
                        shopId: { not: null },
                        isActive: true
                    }
                }),
                this.prisma.shop.findMany({
                    where: { isActive: true },
                    select: {
                        _count: {
                            select: {
                                users: true,
                                productAssignments: true,
                                orders: true
                            }
                        }
                    }
                })
            ]);
            const totalOrders = shopStats.reduce((sum, s) => sum + s._count.orders, 0);
            const totalAssignments = shopStats.reduce((sum, s) => sum + s._count.productAssignments, 0);
            return {
                totalShops,
                activeShops,
                inactiveShops: totalShops - activeShops,
                shopsWithManagers,
                shopsWithoutManagers: activeShops - shopsWithManagers,
                totalShopStaff,
                totalOrdersFromShops: totalOrders,
                totalProductAssignments: totalAssignments
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch shop dashboard: ${error.message}`);
            throw error;
        }
    }
    async getProductDashboard() {
        try {
            this.logger.debug('Fetching product dashboard data');
            const [totalProducts, totalCategories, productStats, stockStats, warehouseCount] = await Promise.all([
                this.prisma.product.count(),
                this.prisma.category.count(),
                this.prisma.product.aggregate({
                    _sum: {
                        totalStock: true,
                        availableStock: true
                    },
                    _avg: {
                        price: true
                    }
                }),
                this.prisma.product.groupBy({
                    by: ['warehouseId'],
                    _count: { id: true },
                    _sum: {
                        totalStock: true,
                        availableStock: true
                    }
                }),
                this.prisma.warehouse.count({
                    where: {
                        products: {
                            some: {}
                        }
                    }
                })
            ]);
            return {
                totalProducts,
                totalCategories,
                totalStock: productStats._sum.totalStock || 0,
                totalAvailableStock: productStats._sum.availableStock || 0,
                averagePrice: productStats._avg.price || 0,
                totalWarehouses: warehouseCount,
                stockByWarehouse: stockStats.length,
                outOfStockProducts: await this.prisma.product.count({
                    where: { availableStock: 0 }
                }),
                lowStockProducts: await this.prisma.product.count({
                    where: {
                        availableStock: { gt: 0, lte: 10 }
                    }
                })
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch product dashboard: ${error.message}`);
            throw error;
        }
    }
    async getOrderDashboard() {
        try {
            this.logger.debug('Fetching order dashboard data');
            const [totalOrders, ordersByStatus, orderStats, recentOrders] = await Promise.all([
                this.prisma.order.count(),
                this.prisma.order.groupBy({
                    by: ['status'],
                    _count: { status: true }
                }),
                this.prisma.order.aggregate({
                    _sum: {
                        totalAmount: true
                    },
                    _avg: {
                        totalAmount: true
                    }
                }),
                this.prisma.order.count({
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        }
                    }
                })
            ]);
            const statusBreakdown = ordersByStatus.reduce((acc, item) => {
                acc[item.status] = item._count.status;
                return acc;
            }, {});
            return {
                totalOrders,
                recentOrders,
                totalRevenue: orderStats._sum.totalAmount || 0,
                averageOrderValue: orderStats._avg.totalAmount || 0,
                statusBreakdown,
                pendingOrders: statusBreakdown['pending_payment'] || 0,
                completedOrders: statusBreakdown['delivered'] || 0,
                cancelledOrders: statusBreakdown['cancelled'] || 0
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch order dashboard: ${error.message}`);
            throw error;
        }
    }
    async getProductAssignmentDashboard() {
        try {
            this.logger.debug('Fetching product assignment dashboard data');
            const [totalAssignments, activeShopsWithAssignments, assignmentStats, recentAssignments] = await Promise.all([
                this.prisma.productAssignment.count(),
                this.prisma.productAssignment.findMany({
                    select: { shopId: true },
                    distinct: ['shopId'],
                    where: {
                        shop: { isActive: true }
                    }
                }),
                this.prisma.productAssignment.aggregate({
                    _sum: {
                        quantity: true,
                        availableQuantity: true,
                        soldQuantity: true
                    }
                }),
                this.prisma.productAssignment.count({
                    where: {
                        assignedAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        }
                    }
                })
            ]);
            return {
                totalAssignments,
                activeShopsWithAssignments: activeShopsWithAssignments.length,
                totalQuantityAssigned: assignmentStats._sum.quantity || 0,
                totalAvailableQuantity: assignmentStats._sum.availableQuantity || 0,
                totalSoldQuantity: assignmentStats._sum.soldQuantity || 0,
                recentAssignments,
                utilizationRate: assignmentStats._sum.quantity
                    ? ((assignmentStats._sum.soldQuantity || 0) / assignmentStats._sum.quantity * 100).toFixed(2)
                    : 0
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch product assignment dashboard: ${error.message}`);
            throw error;
        }
    }
    async getCompleteDashboard() {
        try {
            this.logger.debug('Fetching complete dashboard data');
            const [userDashboard, activityDashboard, warehouseDashboard, shopDashboard, productDashboard, orderDashboard, assignmentDashboard] = await Promise.all([
                this.getUserDashboard(),
                this.getActivityDashboard(),
                this.getWarehouseDashboard(),
                this.getShopDashboard(),
                this.getProductDashboard(),
                this.getOrderDashboard(),
                this.getProductAssignmentDashboard()
            ]);
            return {
                users: userDashboard,
                activities: activityDashboard,
                warehouses: warehouseDashboard,
                shops: shopDashboard,
                products: productDashboard,
                orders: orderDashboard,
                assignments: assignmentDashboard,
                generatedAt: new Date().toISOString()
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch complete dashboard: ${error.message}`);
            throw error;
        }
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = DashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map