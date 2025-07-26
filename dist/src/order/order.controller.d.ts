import { OrderService } from './order.service';
import { Request } from 'express';
export declare class OrderController {
    private readonly orderService;
    private readonly logger;
    constructor(orderService: OrderService);
    findAll(): Promise<({
        products: {
            id: string;
            name: string;
            description: string;
            price: number;
            image: string | null;
            totalStock: number;
            availableStock: number;
            categoryId: string;
        }[];
        OrderItem: ({
            product: {
                id: string;
                name: string;
                description: string;
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
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        userId: string | null;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        customerName: string;
        customerPhone: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        receiptId: string;
        updatedAt: Date;
    })[]>;
    findAllForStoreKeeper(req: Request): Promise<({
        products: {
            id: string;
            name: string;
            description: string;
            price: number;
            image: string | null;
            totalStock: number;
            availableStock: number;
            categoryId: string;
        }[];
        OrderItem: ({
            product: {
                id: string;
                name: string;
                description: string;
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
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        userId: string | null;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        customerName: string;
        customerPhone: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        receiptId: string;
        updatedAt: Date;
    })[]>;
    create(data: any): Promise<{
        products: {
            id: string;
            name: string;
            description: string;
            price: number;
            image: string | null;
            totalStock: number;
            availableStock: number;
            categoryId: string;
        }[];
        OrderItem: ({
            product: {
                id: string;
                name: string;
                description: string;
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
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        userId: string | null;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        customerName: string;
        customerPhone: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        receiptId: string;
        updatedAt: Date;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        userId: string | null;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        customerName: string;
        customerPhone: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        receiptId: string;
        updatedAt: Date;
    }>;
    updatePayment(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        userId: string | null;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        customerName: string;
        customerPhone: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        receiptId: string;
        updatedAt: Date;
    }>;
    updatePackager(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        userId: string | null;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        customerName: string;
        customerPhone: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        receiptId: string;
        updatedAt: Date;
    }>;
    updateReleaseItem(id: string, data: any, req: Request, user: {
        userId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        userId: string | null;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        customerName: string;
        customerPhone: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        receiptId: string;
        updatedAt: Date;
    }>;
}
