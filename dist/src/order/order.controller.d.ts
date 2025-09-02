import { OrderService } from './order.service';
import { Request } from 'express';
export declare class OrderController {
    private readonly orderService;
    private readonly logger;
    constructor(orderService: OrderService);
    findAll(req: Request, page?: string, size?: string, search?: string, status?: string, paymentStatus?: string, startDate?: string, endDate?: string, shopId?: string): Promise<{
        data: never[];
        page: number;
        size: number;
        total: number;
        totalPages: number;
        filters?: undefined;
    } | {
        data: {
            remainingBalance: number;
            paymentPercentage: number;
            orderSummary: {
                totalItems: number;
                totalProducts: number;
                totalAmount: number;
                paidAmount: number;
                remainingBalance: number;
            };
            user: {
                id: string;
                username: string;
                email: string;
                fullName: string;
                role: import(".prisma/client").$Enums.UserRole;
            } | null;
            attendee: {
                id: string;
                username: string;
                email: string;
                fullName: string;
                role: import(".prisma/client").$Enums.UserRole;
            } | null;
            receptionist: {
                id: string;
                username: string;
                email: string;
                fullName: string;
                role: import(".prisma/client").$Enums.UserRole;
            } | null;
            packager: {
                id: string;
                username: string;
                email: string;
                fullName: string;
                role: import(".prisma/client").$Enums.UserRole;
            } | null;
            storekeeper: {
                id: string;
                username: string;
                email: string;
                fullName: string;
                role: import(".prisma/client").$Enums.UserRole;
            } | null;
            shop: {
                id: string;
                name: string;
                location: string;
            } | null;
            products: {
                id: string;
                name: string;
                price: number;
                image: string | null;
                category: {
                    name: string;
                };
            }[];
            OrderItem: ({
                product: {
                    id: string;
                    name: string;
                    price: number;
                    image: string | null;
                    category: {
                        name: string;
                    };
                };
            } & {
                id: string;
                orderId: string;
                productId: string;
                quantity: number;
            })[];
            id: string;
            userId: string | null;
            attendeeId: string | null;
            receptionistId: string | null;
            packagerId: string | null;
            storekeeperId: string | null;
            shopId: string | null;
            customerName: string;
            customerPhone: string | null;
            status: import(".prisma/client").$Enums.OrderStatus;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            totalAmount: number;
            paidAmount: number;
            receiptId: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        page: number;
        size: number;
        total: number;
        totalPages: number;
        filters: {
            search: string | null;
            status: string | null;
            paymentStatus: string | null;
            startDate: string | null;
            endDate: string | null;
            shopId: string | null;
        };
    }>;
    findAllForStoreKeeper(req: Request): Promise<({
        attendee: {
            id: string;
            username: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        } | null;
        receptionist: {
            id: string;
            username: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        } | null;
        packager: {
            id: string;
            username: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        } | null;
        storekeeper: {
            id: string;
            username: string;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        } | null;
        shop: {
            id: string;
            name: string;
            location: string;
        } | null;
        products: {
            id: string;
            createdAt: Date;
            name: string;
            description: string;
            warehouseId: string;
            price: number;
            image: string | null;
            totalStock: number;
            availableStock: number;
            categoryId: string;
        }[];
        OrderItem: ({
            product: {
                id: string;
                createdAt: Date;
                name: string;
                description: string;
                warehouseId: string;
                price: number;
                image: string | null;
                totalStock: number;
                availableStock: number;
                categoryId: string;
            };
        } & {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
        })[];
    } & {
        id: string;
        userId: string | null;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        shopId: string | null;
        customerName: string;
        customerPhone: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        paidAmount: number;
        receiptId: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    create(data: any): Promise<{
        products: {
            id: string;
            createdAt: Date;
            name: string;
            description: string;
            warehouseId: string;
            price: number;
            image: string | null;
            totalStock: number;
            availableStock: number;
            categoryId: string;
        }[];
        OrderItem: ({
            product: {
                id: string;
                createdAt: Date;
                name: string;
                description: string;
                warehouseId: string;
                price: number;
                image: string | null;
                totalStock: number;
                availableStock: number;
                categoryId: string;
            };
        } & {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
        })[];
    } & {
        id: string;
        userId: string | null;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        shopId: string | null;
        customerName: string;
        customerPhone: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        paidAmount: number;
        receiptId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        userId: string | null;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        shopId: string | null;
        customerName: string;
        customerPhone: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        paidAmount: number;
        receiptId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updatePayment(id: string, data: any): Promise<{
        id: string;
        userId: string | null;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        shopId: string | null;
        customerName: string;
        customerPhone: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        paidAmount: number;
        receiptId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    recordPayment(id: string, paymentData: any, req: Request): Promise<{
        success: boolean;
        message: string;
        order: {
            shop: {
                id: string;
                name: string;
                location: string;
            } | null;
            OrderItem: ({
                product: {
                    id: string;
                    createdAt: Date;
                    name: string;
                    description: string;
                    warehouseId: string;
                    price: number;
                    image: string | null;
                    totalStock: number;
                    availableStock: number;
                    categoryId: string;
                };
            } & {
                id: string;
                orderId: string;
                productId: string;
                quantity: number;
            })[];
        } & {
            id: string;
            userId: string | null;
            attendeeId: string | null;
            receptionistId: string | null;
            packagerId: string | null;
            storekeeperId: string | null;
            shopId: string | null;
            customerName: string;
            customerPhone: string | null;
            status: import(".prisma/client").$Enums.OrderStatus;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            totalAmount: number;
            paidAmount: number;
            receiptId: string;
            createdAt: Date;
            updatedAt: Date;
        };
        payment: {
            amount: number;
            method: any;
            reference: any;
            notes: any;
            recordedAt: Date;
            recordedBy: string;
        };
        summary: {
            totalAmount: number;
            paidAmount: number;
            balanceAmount: number;
            paymentStatus: "paid" | "partial" | "overpaid";
            paymentPercentage: number;
            canProceed: boolean;
        };
    }>;
    getPaymentStatus(id: string): Promise<{
        orderId: string;
        customerName: string;
        totalAmount: number;
        paidAmount: number;
        balanceAmount: number;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        orderStatus: import(".prisma/client").$Enums.OrderStatus;
        paymentPercentage: number;
        canProceed: boolean;
        nextAction: string;
    }>;
    getPaymentHistory(id: string): Promise<{
        orderId: string;
        customerName: string;
        totalAmount: number;
        paidAmount: number;
        balanceAmount: number;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        paymentActivities: {
            id: string;
            details: string;
            timestamp: Date;
            recordedBy: {
                id: string;
                username: string;
                fullName: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        }[];
    }>;
    updatePackager(id: string, data: any): Promise<{
        message: string;
        packager: {
            id: string;
            username: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        } | null;
        shop: {
            id: string;
            name: string;
            location: string;
        } | null;
        id: string;
        userId: string | null;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        shopId: string | null;
        customerName: string;
        customerPhone: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        paidAmount: number;
        receiptId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateReleaseItem(id: string, data: any, req: Request, user: {
        userId: string;
    }): Promise<{
        id: string;
        userId: string | null;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        shopId: string | null;
        customerName: string;
        customerPhone: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        paidAmount: number;
        receiptId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
