export declare class OrderItemDto {
    productId: string;
    quantity: number;
}
export declare class CreateCustomerOrderDto {
    items: OrderItemDto[];
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    customerNotes?: string;
}
export declare class AvailableProductsQueryDto {
    page?: number;
    size?: number;
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
}
