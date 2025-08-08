import { PrismaService } from '../../prisma/prisma.service';
export declare class ActivityLogService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        user: {
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
    create(data: any): Promise<{
        id: string;
        userId: string;
        action: string;
        details: string;
        timestamp: Date;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
    update(id: string, data: any): import(".prisma/client").Prisma.Prisma__ActivityLogClient<{
        id: string;
        userId: string;
        action: string;
        details: string;
        timestamp: Date;
        ipAddress: string | null;
        userAgent: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
