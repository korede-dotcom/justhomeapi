export declare class CreateProductAssignmentRequestDto {
    productId: string;
    shopId: string;
    warehouseId: string;
    quantity: number;
    reason?: string;
}
export declare class ReviewProductAssignmentRequestDto {
    status: 'APPROVED' | 'REJECTED';
    reviewNotes?: string;
}
export declare class ProductAssignmentRequestQueryDto {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    warehouseId?: string;
    shopId?: string;
    productId?: string;
    requestedBy?: string;
    page?: number;
    size?: number;
}
