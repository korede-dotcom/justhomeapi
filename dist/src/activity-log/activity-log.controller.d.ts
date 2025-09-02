import { ActivityLogService } from './activity-log.service';
import { Request } from 'express';
import { ActivityLogPaginationDto } from '../common/dto/pagination.dto';
export declare class ActivityLogController {
    private readonly activityLogService;
    constructor(activityLogService: ActivityLogService);
    findAll(query: ActivityLogPaginationDto): Promise<{
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
