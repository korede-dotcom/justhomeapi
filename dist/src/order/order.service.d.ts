import { PrismaService } from '../../prisma/prisma.service';
export declare class OrderService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
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
    getOrdersByAttendee(attendeeId: string): Promise<({
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
    getOrdersByReceptionist(receptionistId: string): Promise<({
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
    getOrdersByPackager(packagerId: string): Promise<({
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
    getOrdersByStorekeeper(storekeeperId: string): Promise<({
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
    updatePackager(id: string, data: any): Promise<{
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
    updateRelease(id: string, data: any, userId: string): Promise<{
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
    getOrdersForUser(userId: string): Promise<({
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
    getOrdersByShop(shopId: string): Promise<({
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
    recordPayment(orderId: string, paymentData: any, userId: string): Promise<{
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
    getPaymentStatus(orderId: string): Promise<{
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
    getPaymentHistory(orderId: string): Promise<{
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
    private getNextAction;
}
