import { ProductAssignmentRequestService } from './product-assignment-request.service';
import { CreateProductAssignmentRequestDto, ReviewProductAssignmentRequestDto, ProductAssignmentRequestQueryDto } from '../user/dto/product-assignment-request.dto';
export declare class ProductAssignmentRequestController {
    private readonly requestService;
    constructor(requestService: ProductAssignmentRequestService);
    createRequest(createRequestDto: CreateProductAssignmentRequestDto, req: any): Promise<{
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
    getPendingRequests(query: ProductAssignmentRequestQueryDto): Promise<{
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
    approveRequest(requestId: string, reviewDto: ReviewProductAssignmentRequestDto, req: any): Promise<{
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
    rejectRequest(requestId: string, reviewDto: ReviewProductAssignmentRequestDto, req: any): Promise<{
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
    getMyRequests(req: any, query: ProductAssignmentRequestQueryDto): Promise<{
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
}
