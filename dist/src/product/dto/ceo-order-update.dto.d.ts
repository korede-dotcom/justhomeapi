export declare enum PaymentStatusEnum {
    PENDING = "pending",
    PARTIAL = "partial",
    PAID = "paid",
    OVERPAID = "overpaid",
    CONFIRMED = "confirmed"
}
export declare enum OrderStatusEnum {
    PENDING_PAYMENT = "pending_payment",
    PARTIAL_PAYMENT = "partial_payment",
    PAID = "paid",
    PROCESSING = "processing",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare enum PaymentMethodEnum {
    CASH = "cash",
    CARD = "card",
    TRANSFER = "transfer",
    POS = "pos"
}
export declare class CeoOrderUpdateDto {
    paymentStatus: PaymentStatusEnum;
    status: OrderStatusEnum;
    paymentMethod: PaymentMethodEnum;
    paidAmount: number;
    balanceAmount: number;
    updatedBy: string;
    paymentAmount: number;
    paymentReference: string;
    notes?: string;
}
