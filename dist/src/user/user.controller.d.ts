import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getAll(): import(".prisma/client").Prisma.PrismaPromise<{
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
    getAllPackager(req: any): Promise<{
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
    create(data: any): Promise<{
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
    getAllActivityLogs(limit?: string, userId?: string): Promise<({
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
    getUserActivityLogs(userId: string, limit?: string): Promise<({
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
