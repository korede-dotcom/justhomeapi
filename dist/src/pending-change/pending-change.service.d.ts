import { PrismaService } from '../../prisma/prisma.service';
export declare class PendingChangeService {
    private prisma;
    constructor(prisma: PrismaService);
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
    updateStatus(id: string, status: 'approved' | 'rejected'): import(".prisma/client").Prisma.Prisma__PendingChangeClient<{
        id: string;
        type: string;
        originalItem: import("@prisma/client/runtime/library").JsonValue;
        newItem: import("@prisma/client/runtime/library").JsonValue | null;
        submittedBy: string;
        submittedAt: Date;
        status: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
