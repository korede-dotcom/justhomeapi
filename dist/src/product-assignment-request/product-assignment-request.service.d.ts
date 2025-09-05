import { PrismaService } from '../../prisma/prisma.service';
export declare class ProductAssignmentRequestService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createRequest(requestData: {
        productId: string;
        shopId: string;
        warehouseId: string;
        quantity: number;
        reason?: string;
    }, requestedBy: string): Promise<{
        success: boolean;
        message: string;
        request: {
            id: string;
            quantity: number;
            reason: string | null;
            status: import(".prisma/client").$Enums.AssignmentRequestStatus;
            requestedAt: Date;
            product: {
                id: string;
                name: string;
                price: number;
                totalStock: number;
                availableStock: number;
            };
            shop: {
                id: string;
                name: string;
                location: string;
            };
            warehouse: {
                id: string;
                name: string;
                location: string;
            };
            requestedBy: {
                id: string;
                username: string;
                fullName: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        };
    }>;
    getPendingRequests(query?: {
        page?: number;
        size?: number;
        warehouseId?: string;
        shopId?: string;
        requestedBy?: string;
    }): Promise<{
        data: ({
            product: {
                id: string;
                name: string;
                price: number;
                totalStock: number;
                availableStock: number;
            };
            shop: {
                id: string;
                name: string;
                location: string;
            };
            warehouse: {
                id: string;
                name: string;
                location: string;
            };
            requestedByUser: {
                id: string;
                username: string;
                fullName: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            quantity: number;
            reason: string | null;
            status: import(".prisma/client").$Enums.AssignmentRequestStatus;
            requestedAt: Date;
            reviewedAt: Date | null;
            reviewNotes: string | null;
            productId: string;
            shopId: string;
            warehouseId: string;
            requestedBy: string;
            reviewedBy: string | null;
        })[];
        page: number;
        size: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    }>;
    approveRequest(requestId: string, reviewedBy: string, reviewNotes?: string): Promise<{
        success: boolean;
        message: string;
        assignment: {
            id: string;
            quantity: number;
            availableQuantity: number;
            assignedAt: Date;
        };
        request: {
            product: {
                id: string;
                name: string;
                price: number;
            };
            shop: {
                id: string;
                name: string;
                location: string;
            };
            warehouse: {
                id: string;
                name: string;
                location: string;
            };
            requestedByUser: {
                id: string;
                username: string;
                fullName: string;
            };
            reviewedByUser: {
                id: string;
                username: string;
                fullName: string;
            } | null;
        } & {
            id: string;
            quantity: number;
            reason: string | null;
            status: import(".prisma/client").$Enums.AssignmentRequestStatus;
            requestedAt: Date;
            reviewedAt: Date | null;
            reviewNotes: string | null;
            productId: string;
            shopId: string;
            warehouseId: string;
            requestedBy: string;
            reviewedBy: string | null;
        };
    }>;
    rejectRequest(requestId: string, reviewedBy: string, reviewNotes?: string): Promise<{
        success: boolean;
        message: string;
        request: {
            product: {
                id: string;
                name: string;
                price: number;
            };
            shop: {
                id: string;
                name: string;
                location: string;
            };
            warehouse: {
                id: string;
                name: string;
                location: string;
            };
            requestedByUser: {
                id: string;
                username: string;
                fullName: string;
            };
            reviewedByUser: {
                id: string;
                username: string;
                fullName: string;
            } | null;
        } & {
            id: string;
            quantity: number;
            reason: string | null;
            status: import(".prisma/client").$Enums.AssignmentRequestStatus;
            requestedAt: Date;
            reviewedAt: Date | null;
            reviewNotes: string | null;
            productId: string;
            shopId: string;
            warehouseId: string;
            requestedBy: string;
            reviewedBy: string | null;
        };
    }>;
}
