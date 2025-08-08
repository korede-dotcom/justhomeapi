import { ActivityLogService } from './activity-log.service';
import { Request } from 'express';
export declare class ActivityLogController {
    private readonly activityLogService;
    constructor(activityLogService: ActivityLogService);
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
    create(data: any, req: Request, user: {
        userId: string;
        fullName: string;
    }): Promise<{
        id: string;
        userId: string;
        action: string;
        details: string;
        timestamp: Date;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
}
