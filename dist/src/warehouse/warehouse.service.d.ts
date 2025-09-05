import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class WarehouseService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        manager: {
            id: string;
            username: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        } | null;
    } & {
        id: string;
        isActive: boolean;
        name: string;
        location: string;
        description: string | null;
        managerId: string | null;
    }>;
    findAll(userId?: string, userInfo?: {
        role?: string;
        shopId?: string;
    }): Promise<({
        _count: {
            users: number;
            productAssignments: number;
            products: number;
        };
        manager: {
            id: string;
            username: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        } | null;
        users: {
            id: string;
            username: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
        productAssignments: ({
            shop: {
                id: string;
                name: string;
                location: string;
            };
            product: {
                id: string;
                name: string;
                price: number;
            };
            assignedByUser: {
                id: string;
                username: string;
                fullName: string;
            };
        } & {
            id: string;
            shopId: string;
            warehouseId: string;
            quantity: number;
            productId: string;
            availableQuantity: number;
            soldQuantity: number;
            assignedAt: Date;
            assignedBy: string;
        })[];
        products: ({
            category: {
                id: string;
                name: string;
                description: string;
            };
        } & {
            id: string;
            createdAt: Date;
            warehouseId: string;
            name: string;
            description: string;
            price: number;
            image: string | null;
            totalStock: number;
            availableStock: number;
            categoryId: string;
        })[];
    } & {
        id: string;
        isActive: boolean;
        name: string;
        location: string;
        description: string | null;
        managerId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            users: number;
            productAssignments: number;
            products: number;
        };
        manager: {
            id: string;
            username: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        } | null;
        users: {
            id: string;
            username: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
        productAssignments: ({
            shop: {
                id: string;
                isActive: boolean;
                name: string;
                location: string;
            };
            product: {
                id: string;
                name: string;
                price: number;
                totalStock: number;
                availableStock: number;
            };
            assignedByUser: {
                id: string;
                username: string;
                fullName: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            shopId: string;
            warehouseId: string;
            quantity: number;
            productId: string;
            availableQuantity: number;
            soldQuantity: number;
            assignedAt: Date;
            assignedBy: string;
        })[];
        products: ({
            category: {
                id: string;
                name: string;
                description: string;
            };
        } & {
            id: string;
            createdAt: Date;
            warehouseId: string;
            name: string;
            description: string;
            price: number;
            image: string | null;
            totalStock: number;
            availableStock: number;
            categoryId: string;
        })[];
    } & {
        id: string;
        isActive: boolean;
        name: string;
        location: string;
        description: string | null;
        managerId: string | null;
    }>;
    update(id: string, data: Prisma.WarehouseUpdateInput): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        location: string;
        description: string | null;
        managerId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        location: string;
        description: string | null;
        managerId: string | null;
    }>;
    assignProductToShop(data: {
        productId: string;
        shopId: string;
        warehouseId: string;
        quantity: number;
        assignedBy: string;
    }): Promise<{
        isRestock: boolean;
        warehouseStockAfter: number;
        message: string;
        shop: {
            id: string;
            name: string;
            location: string;
        };
        warehouse: {
            id: string;
            name: string;
            location: string;
        };
        product: {
            id: string;
            name: string;
            price: number;
        };
        assignedByUser: {
            id: string;
            username: string;
            fullName: string;
        };
        id: string;
        shopId: string;
        warehouseId: string;
        quantity: number;
        productId: string;
        availableQuantity: number;
        soldQuantity: number;
        assignedAt: Date;
        assignedBy: string;
    }>;
    getWarehouseReport(warehouseId: string): Promise<{
        warehouse: {
            users: {
                id: string;
                username: string;
                email: string;
                password: string;
                fullName: string;
                role: import(".prisma/client").$Enums.UserRole;
                isActive: boolean;
                createdAt: Date;
                lastLogin: Date | null;
                createdBy: string;
                shopId: string | null;
                warehouseId: string | null;
            }[];
            productAssignments: ({
                shop: {
                    id: string;
                    isActive: boolean;
                    name: string;
                    location: string;
                    description: string | null;
                    managerId: string | null;
                };
                product: {
                    id: string;
                    createdAt: Date;
                    warehouseId: string;
                    name: string;
                    description: string;
                    price: number;
                    image: string | null;
                    totalStock: number;
                    availableStock: number;
                    categoryId: string;
                };
            } & {
                id: string;
                shopId: string;
                warehouseId: string;
                quantity: number;
                productId: string;
                availableQuantity: number;
                soldQuantity: number;
                assignedAt: Date;
                assignedBy: string;
            })[];
            products: ({
                category: {
                    id: string;
                    createdAt: Date;
                    name: string;
                    description: string;
                };
            } & {
                id: string;
                createdAt: Date;
                warehouseId: string;
                name: string;
                description: string;
                price: number;
                image: string | null;
                totalStock: number;
                availableStock: number;
                categoryId: string;
            })[];
        } & {
            id: string;
            isActive: boolean;
            name: string;
            location: string;
            description: string | null;
            managerId: string | null;
        };
        totalProducts: number;
        totalAssignments: number;
        totalUsers: number;
    }>;
    getProductsAssignedToShop(shopId: string): Promise<{
        shop: {
            id: string;
            isActive: boolean;
            name: string;
            location: string;
        };
        totalAssignments: number;
        assignments: {
            id: string;
            quantity: number;
            assignedAt: Date;
            product: {
                id: string;
                name: string;
                description: string;
                price: number;
                totalStock: number;
                availableStock: number;
                image: string | null;
                category: {
                    id: string;
                    name: string;
                    description: string;
                };
            };
            warehouse: {
                id: string;
                name: string;
                location: string;
            };
            assignedBy: {
                id: string;
                username: string;
                fullName: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        }[];
    }>;
    getAllProductsForNonAdmins(userId: string, query?: {
        page?: number;
        size?: number;
        search?: string;
        warehouseId?: string;
        category?: string;
    }): Promise<{
        data: never[];
        page: number;
        size: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
        filters?: undefined;
    } | {
        data: {
            id: string;
            name: string;
            description: string;
            price: number;
            image: string | null;
            totalStock: number;
            availableStock: number;
            category: string;
            assignedQuantity: number;
            shopAvailableQuantity: number;
            shopSoldQuantity: number;
            assignedAt: Date;
            assignmentWarehouse: {
                id: string;
                name: string;
                location: string;
            };
            productWarehouse: {
                id: string;
                name: string;
                location: string;
            };
        }[];
        page: number;
        size: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
        filters: {
            search: string | null;
            warehouseId: string | null;
            category: string | null;
        };
    }>;
    getWarehouseProducts(warehouseId: string, query?: {
        page?: number;
        size?: number;
        search?: string;
        category?: string;
        all?: boolean;
    }, userId?: string, userInfo?: {
        role?: string;
        shopId?: string;
    }): Promise<{
        warehouse: {
            id: string;
            isActive: boolean;
            name: string;
            location: string;
        };
        products: {
            id: string;
            name: string;
            description: string;
            price: number;
            image: string | null;
            totalStock: number;
            availableStock: number;
            createdAt: Date;
            category: {
                id: string;
                name: string;
                description: string;
            };
            assignmentSummary: {
                totalAssignments: number;
                totalQuantityAssigned: number;
                totalQuantityAvailable: number;
                totalQuantitySold: number;
                assignedShops: number;
            };
            recentAssignments: {
                id: string;
                quantity: number;
                availableQuantity: number;
                soldQuantity: number;
                assignedAt: Date;
                shop: {
                    id: string;
                    isActive: boolean;
                    name: string;
                    location: string;
                };
            }[];
        }[];
        summary: {
            totalProducts: number;
            totalStock: number;
            totalAvailableStock: number;
            totalAssignments: number;
            categories: number;
        };
        filters: {
            search: string | null;
            category: string | null;
        };
    } | {
        warehouse: {
            id: string;
            isActive: boolean;
            name: string;
            location: string;
        };
        products: {
            data: {
                id: string;
                name: string;
                description: string;
                price: number;
                image: string | null;
                totalStock: number;
                availableStock: number;
                createdAt: Date;
                category: {
                    id: string;
                    name: string;
                    description: string;
                };
                assignmentSummary: {
                    totalAssignments: number;
                    totalQuantityAssigned: number;
                    totalQuantityAvailable: number;
                    totalQuantitySold: number;
                    assignedShops: number;
                };
                recentAssignments: {
                    id: string;
                    quantity: number;
                    availableQuantity: number;
                    soldQuantity: number;
                    assignedAt: Date;
                    shop: {
                        id: string;
                        isActive: boolean;
                        name: string;
                        location: string;
                    };
                }[];
            }[];
            page: number;
            size: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrevious: boolean;
        };
        summary: {
            totalProducts: number;
            totalStock: number;
            totalAvailableStock: number;
            totalAssignments: number;
            categories: number;
        };
        filters: {
            search: string | null;
            category: string | null;
        };
    }>;
    getWarehouseProduct(warehouseId: string, productId: string, query?: {
        page?: number;
        size?: number;
        search?: string;
    }): Promise<{
        product: {
            id: string;
            name: string;
            description: string;
            price: number;
            image: string | null;
            totalStock: number;
            availableStock: number;
            category: {
                id: string;
                name: string;
                description: string;
            };
            warehouse: {
                id: string;
                name: string;
                location: string;
            };
        };
        assignments: {
            data: {
                id: string;
                quantity: number;
                availableQuantity: number;
                soldQuantity: number;
                assignedAt: Date;
                shop: {
                    id: string;
                    isActive: boolean;
                    name: string;
                    location: string;
                };
                assignedBy: {
                    id: string;
                    username: string;
                    fullName: string;
                    role: import(".prisma/client").$Enums.UserRole;
                };
            }[];
            page: number;
            size: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrevious: boolean;
        };
        summary: {
            totalAssignments: number;
            totalQuantityAssigned: number;
            totalQuantityAvailable: number;
            totalQuantitySold: number;
        };
        filters: {
            search: string | null;
        };
    }>;
    getDashboardStats(userId?: string, userInfo?: {
        role?: string;
        shopId?: string;
    }): Promise<{
        totalProducts: number;
        categories: number;
        totalStock: number;
        warehouses: number;
        totalAssignments: number;
        activeShops: number;
        activeAssignments: number;
        totalRevenue: number;
        totalCollected: number;
        partialPayments: number;
        outstandingPayments: number;
        totalOrders: number;
        completedOrders: number;
        pendingPayment: number;
        readyForPickup: number;
        orderStatusBreakdown: Record<string, number>;
        accessInfo: {
            scope: string;
            shopId: string | null;
            userRole: string;
            isFiltered: boolean;
        };
    }>;
    updateShopInventory(data: {
        assignmentId: string;
        soldQuantity: number;
        action: 'sale' | 'return' | 'adjustment';
        notes?: string;
        userId?: string;
    }): Promise<{
        success: boolean;
        message: string;
        assignment: {
            shop: {
                id: string;
                name: string;
                location: string;
            };
            warehouse: {
                id: string;
                name: string;
            };
            product: {
                id: string;
                name: string;
                price: number;
            };
        } & {
            id: string;
            shopId: string;
            warehouseId: string;
            quantity: number;
            productId: string;
            availableQuantity: number;
            soldQuantity: number;
            assignedAt: Date;
            assignedBy: string;
        };
        changes: {
            action: "sale" | "return" | "adjustment";
            quantity: number;
            previousSold: number;
            newSold: number;
            previousAvailable: number;
            newAvailable: number;
        };
    }>;
}
