import { PrismaService } from '../../prisma/prisma.service';
export declare class UserService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    findAllPackager(userId?: string): Promise<{
        id: string;
        username: string;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.UserRole;
        shopId: string | null;
        shop: {
            name: string;
            location: string;
        } | null;
    }[]>;
    createUser(data: any): Promise<{
        shop: {
            id: string;
            isActive: boolean;
            name: string;
            location: string;
            description: string | null;
            managerId: string | null;
        } | null;
        warehouse: {
            id: string;
            isActive: boolean;
            name: string;
            location: string;
            description: string | null;
            managerId: string | null;
        } | null;
        id: string;
        username: string;
        email: string;
        fullName: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        createdAt: Date;
        lastLogin: Date | null;
        createdBy: string;
        shopId: string | null;
        warehouseId: string | null;
    }>;
    update(id: string, data: any): import(".prisma/client").Prisma.Prisma__UserClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getActivityLogs(limit?: number, userId?: string): Promise<({
        user: {
            id: string;
            username: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        userId: string;
        action: string;
        details: string;
        timestamp: Date;
        ipAddress: string | null;
        userAgent: string | null;
    })[]>;
}
