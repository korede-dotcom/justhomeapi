import { PendingChangeService } from './pending-change.service';
export declare class PendingChangeController {
    private readonly pendingChangeService;
    constructor(pendingChangeService: PendingChangeService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        type: string;
        originalItem: import("@prisma/client/runtime/library").JsonValue;
        newItem: import("@prisma/client/runtime/library").JsonValue | null;
        submittedBy: string;
        submittedAt: Date;
        status: string;
    }[]>;
    create(data: any): import(".prisma/client").Prisma.Prisma__PendingChangeClient<{
        id: string;
        type: string;
        originalItem: import("@prisma/client/runtime/library").JsonValue;
        newItem: import("@prisma/client/runtime/library").JsonValue | null;
        submittedBy: string;
        submittedAt: Date;
        status: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    approve(id: string): import(".prisma/client").Prisma.Prisma__PendingChangeClient<{
        id: string;
        type: string;
        originalItem: import("@prisma/client/runtime/library").JsonValue;
        newItem: import("@prisma/client/runtime/library").JsonValue | null;
        submittedBy: string;
        submittedAt: Date;
        status: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    reject(id: string): import(".prisma/client").Prisma.Prisma__PendingChangeClient<{
        id: string;
        type: string;
        originalItem: import("@prisma/client/runtime/library").JsonValue;
        newItem: import("@prisma/client/runtime/library").JsonValue | null;
        submittedBy: string;
        submittedAt: Date;
        status: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
