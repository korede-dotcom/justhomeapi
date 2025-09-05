import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private prisma: PrismaService) {}

  async getUserDashboard() {
    try {
      this.logger.debug('Fetching user dashboard data');

      const [
        totalUsers,
        activeUsers,
        adminUsers,
        staffUsers,
        usersByRole
      ] = await Promise.all([
        // Total users
        this.prisma.user.count(),
        
        // Active users
        this.prisma.user.count({
          where: { isActive: true }
        }),
        
        // Admin users (CEO + Admin)
        this.prisma.user.count({
          where: { 
            role: { in: ['CEO', 'Admin'] },
            isActive: true
          }
        }),
        
        // Staff users (non-admin roles)
        this.prisma.user.count({
          where: { 
            role: { notIn: ['CEO', 'Admin', 'Customer'] },
            isActive: true
          }
        }),
        
        // Users by role breakdown
        this.prisma.user.groupBy({
          by: ['role'],
          _count: { role: true },
          where: { isActive: true }
        })
      ]);

      const roleBreakdown = usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count.role;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        adminUsers,
        staffUsers,
        customerUsers: roleBreakdown['Customer'] || 0,
        roleBreakdown
      };

    } catch (error: any) {
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

      const [
        totalActivities,
        todayActivities,
        weekActivities,
        activeUsersToday,
        activeUsersThisWeek
      ] = await Promise.all([
        // Total activities
        this.prisma.activityLog.count(),
        
        // Today's activities
        this.prisma.activityLog.count({
          where: {
            timestamp: { gte: today }
          }
        }),
        
        // This week's activities
        this.prisma.activityLog.count({
          where: {
            timestamp: { gte: weekAgo }
          }
        }),
        
        // Active users today (users who performed actions today)
        this.prisma.activityLog.findMany({
          where: {
            timestamp: { gte: today }
          },
          select: { userId: true },
          distinct: ['userId']
        }),
        
        // Active users this week
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

    } catch (error: any) {
      this.logger.error(`Failed to fetch activity dashboard: ${error.message}`);
      throw error;
    }
  }

  async getWarehouseDashboard() {
    try {
      this.logger.debug('Fetching warehouse dashboard data');

      const [
        totalWarehouses,
        activeWarehouses,
        warehousesWithManagers,
        totalWarehouseStaff,
        warehouseStats
      ] = await Promise.all([
        // Total warehouses
        this.prisma.warehouse.count(),
        
        // Active warehouses
        this.prisma.warehouse.count({
          where: { isActive: true }
        }),
        
        // Warehouses with managers
        this.prisma.warehouse.count({
          where: { 
            managerId: { not: null },
            isActive: true
          }
        }),
        
        // Total warehouse staff (users assigned to warehouses)
        this.prisma.user.count({
          where: { 
            warehouseId: { not: null },
            isActive: true
          }
        }),
        
        // Warehouse statistics
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

    } catch (error: any) {
      this.logger.error(`Failed to fetch warehouse dashboard: ${error.message}`);
      throw error;
    }
  }

  async getShopDashboard() {
    try {
      this.logger.debug('Fetching shop dashboard data');

      const [
        totalShops,
        activeShops,
        shopsWithManagers,
        totalShopStaff,
        shopStats
      ] = await Promise.all([
        // Total shops
        this.prisma.shop.count(),
        
        // Active shops
        this.prisma.shop.count({
          where: { isActive: true }
        }),
        
        // Shops with managers
        this.prisma.shop.count({
          where: { 
            managerId: { not: null },
            isActive: true
          }
        }),
        
        // Total shop staff (users assigned to shops)
        this.prisma.user.count({
          where: { 
            shopId: { not: null },
            isActive: true
          }
        }),
        
        // Shop statistics
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

    } catch (error: any) {
      this.logger.error(`Failed to fetch shop dashboard: ${error.message}`);
      throw error;
    }
  }

  async getProductDashboard() {
    try {
      this.logger.debug('Fetching product dashboard data');

      const [
        totalProducts,
        totalCategories,
        productStats,
        stockStats,
        warehouseCount
      ] = await Promise.all([
        // Total products
        this.prisma.product.count(),
        
        // Total categories
        this.prisma.category.count(),
        
        // Product statistics
        this.prisma.product.aggregate({
          _sum: {
            totalStock: true,
            availableStock: true
          },
          _avg: {
            price: true
          }
        }),
        
        // Stock distribution
        this.prisma.product.groupBy({
          by: ['warehouseId'],
          _count: { id: true },
          _sum: {
            totalStock: true,
            availableStock: true
          }
        }),
        
        // Total warehouses with products
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

    } catch (error: any) {
      this.logger.error(`Failed to fetch product dashboard: ${error.message}`);
      throw error;
    }
  }

  async getOrderDashboard() {
    try {
      this.logger.debug('Fetching order dashboard data');

      const [
        totalOrders,
        ordersByStatus,
        orderStats,
        recentOrders
      ] = await Promise.all([
        // Total orders
        this.prisma.order.count(),
        
        // Orders by status
        this.prisma.order.groupBy({
          by: ['status'],
          _count: { status: true }
        }),
        
        // Order statistics
        this.prisma.order.aggregate({
          _sum: {
            totalAmount: true
          },
          _avg: {
            totalAmount: true
          }
        }),
        
        // Recent orders (last 7 days)
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
      }, {} as Record<string, number>);

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

    } catch (error: any) {
      this.logger.error(`Failed to fetch order dashboard: ${error.message}`);
      throw error;
    }
  }

  async getProductAssignmentDashboard() {
    try {
      this.logger.debug('Fetching product assignment dashboard data');

      const [
        totalAssignments,
        activeShopsWithAssignments,
        assignmentStats,
        recentAssignments
      ] = await Promise.all([
        // Total product assignments
        this.prisma.productAssignment.count(),
        
        // Active shops with assignments
        this.prisma.productAssignment.findMany({
          select: { shopId: true },
          distinct: ['shopId'],
          where: {
            shop: { isActive: true }
          }
        }),
        
        // Assignment statistics
        this.prisma.productAssignment.aggregate({
          _sum: {
            quantity: true,
            availableQuantity: true,
            soldQuantity: true
          }
        }),
        
        // Recent assignments (last 7 days)
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

    } catch (error: any) {
      this.logger.error(`Failed to fetch product assignment dashboard: ${error.message}`);
      throw error;
    }
  }

  async getCompleteDashboard() {
    try {
      this.logger.debug('Fetching complete dashboard data');

      const [
        userDashboard,
        activityDashboard,
        warehouseDashboard,
        shopDashboard,
        productDashboard,
        orderDashboard,
        assignmentDashboard
      ] = await Promise.all([
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

    } catch (error: any) {
      this.logger.error(`Failed to fetch complete dashboard: ${error.message}`);
      throw error;
    }
  }
}
