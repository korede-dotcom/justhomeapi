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
    findAll(): Promise<({
        _count: {
            users: number;
            products: number;
            productAssignments: number;
        };
        users: {
            id: string;
            username: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
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
        manager: {
            id: string;
            username: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        } | null;
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
            availableQuantity: number;
            soldQuantity: number;
            assignedAt: Date;
            productId: string;
            assignedBy: string;
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
            products: number;
            productAssignments: number;
        };
        users: {
            id: string;
            username: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
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
        manager: {
            id: string;
            username: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        } | null;
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
            availableQuantity: number;
            soldQuantity: number;
            assignedAt: Date;
            productId: string;
            assignedBy: string;
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
        availableQuantity: number;
        soldQuantity: number;
        assignedAt: Date;
        productId: string;
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
                availableQuantity: number;
                soldQuantity: number;
                assignedAt: Date;
                productId: string;
                assignedBy: string;
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
    getAllProductsForNonAdmins(userId: string): Promise<{
        totalProducts: number;
        products: never[];
        userShop: null;
        message: string;
    } | {
        totalProducts: number;
        userShop: {
            id: string;
            name: string;
            location: string;
        };
        products: any[];
        message?: undefined;
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
            availableQuantity: number;
            soldQuantity: number;
            assignedAt: Date;
            productId: string;
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
