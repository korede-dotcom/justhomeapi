import { PrismaService } from '../../prisma/prisma.service';
export declare class ActivityLogService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(query?: {
        page?: number;
        size?: number;
        limit?: number;
        userId?: string;
        search?: string;
    }): Promise<{
        data: ({
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
        })[];
        page: number;
        size: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
        filters: {
            userId: string | null;
            search: string | null;
        };
    }>;
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
