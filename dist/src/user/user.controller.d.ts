import { UserService } from './user.service';
import { UserPaginationDto } from './dto/user-pagination.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    debugToken(req: any): {
        rawUser: any;
        extractedUserId: any;
        extractedRole: any;
        extractedShopId: any;
        message: string;
    };
    getAll(query: UserPaginationDto, req: any): Promise<{
        users: {
            id: string;
            username: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            createdAt: Date;
            lastLogin: Date | null;
            shopId: string | null;
            warehouseId: string | null;
            shop: {
                id: string;
                isActive: boolean;
                name: string;
                location: string;
            } | null;
            warehouse: {
                id: string;
                isActive: boolean;
                name: string;
                location: string;
            } | null;
        }[];
        summary: {
            totalUsers: number;
            activeUsers: number;
            inactiveUsers: number;
            roles: number;
            usersWithShops: number;
            usersWithWarehouses: number;
        };
        accessInfo: {
            requestingUserRole: string;
            requestingUserShop: string | null;
            requestingUserWarehouse: string | null;
            hasFullAccess: boolean;
            scopeRestriction: string;
        };
        filters: {
            search: string | null;
            role: string | null;
            shopId: string | null;
            warehouseId: string | null;
            isActive: boolean | null;
        };
        data?: undefined;
        page?: undefined;
        size?: undefined;
        total?: undefined;
        totalPages?: undefined;
        hasNext?: undefined;
        hasPrevious?: undefined;
    } | {
        data: {
            id: string;
            username: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            createdAt: Date;
            lastLogin: Date | null;
            shopId: string | null;
            warehouseId: string | null;
            shop: {
                id: string;
                isActive: boolean;
                name: string;
                location: string;
            } | null;
            warehouse: {
                id: string;
                isActive: boolean;
                name: string;
                location: string;
            } | null;
        }[];
        page: number;
        size: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
        summary: {
            totalUsers: number;
            activeUsers: number;
            inactiveUsers: number;
            roles: number;
            usersWithShops: number;
            usersWithWarehouses: number;
        };
        accessInfo: {
            requestingUserRole: string;
            requestingUserShop: string | null;
            requestingUserWarehouse: string | null;
            hasFullAccess: boolean;
            scopeRestriction: string;
        };
        filters: {
            search: string | null;
            role: string | null;
            shopId: string | null;
            warehouseId: string | null;
            isActive: boolean | null;
        };
        users?: undefined;
    }>;
    getAllPackager(req: any, query: UserPaginationDto): Promise<{
        packagers: {
            id: string;
            username: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            shopId: string | null;
            shop: {
                id: string;
                isActive: boolean;
                name: string;
                location: string;
            } | null;
        }[];
        summary: {
            totalPackagers: number;
            activePackagers: number;
            inactivePackagers: number;
            packagersWithShops: number;
        };
        data?: undefined;
        page?: undefined;
        size?: undefined;
        total?: undefined;
        totalPages?: undefined;
        hasNext?: undefined;
        hasPrevious?: undefined;
        requestingUserShop?: undefined;
        filters?: undefined;
    } | {
        data: {
            id: string;
            username: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            shopId: string | null;
            shop: {
                id: string;
                isActive: boolean;
                name: string;
                location: string;
            } | null;
        }[];
        page: number;
        size: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
        summary: {
            totalPackagers: number;
            activePackagers: number;
            inactivePackagers: number;
            packagersWithShops: number;
        };
        packagers?: undefined;
        requestingUserShop?: undefined;
        filters?: undefined;
    } | {
        packagers: {
            id: string;
            username: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            shopId: string | null;
            shop: {
                id: string;
                isActive: boolean;
                name: string;
                location: string;
            } | null;
        }[];
        summary: {
            totalPackagers: number;
            activePackagers: number;
            inactivePackagers: number;
            packagersWithShops: number;
        };
        requestingUserShop: string | null;
        data?: undefined;
        page?: undefined;
        size?: undefined;
        total?: undefined;
        totalPages?: undefined;
        hasNext?: undefined;
        hasPrevious?: undefined;
        filters?: undefined;
    } | {
        data: {
            id: string;
            username: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            shopId: string | null;
            shop: {
                id: string;
                isActive: boolean;
                name: string;
                location: string;
            } | null;
        }[];
        page: number;
        size: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
        summary: {
            totalPackagers: number;
            activePackagers: number;
            inactivePackagers: number;
            packagersWithShops: number;
        };
        requestingUserShop: string | null;
        filters: {
            search: string | null;
            shopId: string | null;
            isActive: boolean | null;
        };
        packagers?: undefined;
    }>;
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
