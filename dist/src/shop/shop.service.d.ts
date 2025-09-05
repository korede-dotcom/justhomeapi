import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class ShopService {
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
        users: {
            id: string;
            username: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
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
            productAssignments: number;
        };
        manager: {
            id: string;
            username: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        } | null;
        users: {
            id: string;
            username: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
        productAssignments: ({
            product: {
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
    } & {
        id: string;
        isActive: boolean;
        name: string;
        location: string;
        description: string | null;
        managerId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        manager: {
            id: string;
            username: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        } | null;
        users: {
            id: string;
            username: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
        productAssignments: ({
            product: {
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
    } & {
        id: string;
        isActive: boolean;
        name: string;
        location: string;
        description: string | null;
        managerId: string | null;
    }>;
    update(id: string, data: Prisma.ShopUpdateInput): Promise<{
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
    getShopReport(shopId: string): Promise<{
        shop: {
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
                product: {
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
        } & {
            id: string;
            isActive: boolean;
            name: string;
            location: string;
            description: string | null;
            managerId: string | null;
        };
        totalUsers: number;
        totalProductAssignments: number;
    }>;
}
