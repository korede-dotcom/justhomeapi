import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getUserDashboard(): Promise<{
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        adminUsers: number;
        staffUsers: number;
        customerUsers: number;
        roleBreakdown: Record<string, number>;
    }>;
    getActivityDashboard(): Promise<{
        totalActivities: number;
        todayActivities: number;
        weekActivities: number;
        activeUsersToday: number;
        activeUsersThisWeek: number;
    }>;
    getWarehouseDashboard(): Promise<{
        totalWarehouses: number;
        activeWarehouses: number;
        inactiveWarehouses: number;
        warehousesWithManagers: number;
        warehousesWithoutManagers: number;
        totalWarehouseStaff: number;
        totalProductsInWarehouses: number;
        totalProductAssignments: number;
    }>;
    getShopDashboard(): Promise<{
        totalShops: number;
        activeShops: number;
        inactiveShops: number;
        shopsWithManagers: number;
        shopsWithoutManagers: number;
        totalShopStaff: number;
        totalOrdersFromShops: number;
        totalProductAssignments: number;
    }>;
    getProductDashboard(): Promise<{
        totalProducts: number;
        totalCategories: number;
        totalStock: number;
        totalAvailableStock: number;
        averagePrice: number;
        totalWarehouses: number;
        stockByWarehouse: number;
        outOfStockProducts: number;
        lowStockProducts: number;
    }>;
    getOrderDashboard(): Promise<{
        totalOrders: number;
        recentOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
        statusBreakdown: Record<string, number>;
        pendingOrders: number;
        completedOrders: number;
        cancelledOrders: number;
    }>;
    getProductAssignmentDashboard(): Promise<{
        totalAssignments: number;
        activeShopsWithAssignments: number;
        totalQuantityAssigned: number;
        totalAvailableQuantity: number;
        totalSoldQuantity: number;
        recentAssignments: number;
        utilizationRate: string | number;
    }>;
    getCompleteDashboard(): Promise<{
        users: {
            totalUsers: number;
            activeUsers: number;
            inactiveUsers: number;
            adminUsers: number;
            staffUsers: number;
            customerUsers: number;
            roleBreakdown: Record<string, number>;
        };
        activities: {
            totalActivities: number;
            todayActivities: number;
            weekActivities: number;
            activeUsersToday: number;
            activeUsersThisWeek: number;
        };
        warehouses: {
            totalWarehouses: number;
            activeWarehouses: number;
            inactiveWarehouses: number;
            warehousesWithManagers: number;
            warehousesWithoutManagers: number;
            totalWarehouseStaff: number;
            totalProductsInWarehouses: number;
            totalProductAssignments: number;
        };
        shops: {
            totalShops: number;
            activeShops: number;
            inactiveShops: number;
            shopsWithManagers: number;
            shopsWithoutManagers: number;
            totalShopStaff: number;
            totalOrdersFromShops: number;
            totalProductAssignments: number;
        };
        products: {
            totalProducts: number;
            totalCategories: number;
            totalStock: number;
            totalAvailableStock: number;
            averagePrice: number;
            totalWarehouses: number;
            stockByWarehouse: number;
            outOfStockProducts: number;
            lowStockProducts: number;
        };
        orders: {
            totalOrders: number;
            recentOrders: number;
            totalRevenue: number;
            averageOrderValue: number;
            statusBreakdown: Record<string, number>;
            pendingOrders: number;
            completedOrders: number;
            cancelledOrders: number;
        };
        assignments: {
            totalAssignments: number;
            activeShopsWithAssignments: number;
            totalQuantityAssigned: number;
            totalAvailableQuantity: number;
            totalSoldQuantity: number;
            recentAssignments: number;
            utilizationRate: string | number;
        };
        generatedAt: string;
    }>;
}
