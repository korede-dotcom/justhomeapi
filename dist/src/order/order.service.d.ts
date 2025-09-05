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
        shop: {
            id: string;
            name: string;
            location: string;
        } | null;
        products: {
            id: string;
            createdAt: Date;
            warehouseId: string;
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
                createdAt: Date;
                warehouseId: string;
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
            quantity: number;
            productId: string;
            orderId: string;
        })[];
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
        shopId: string | null;
        userId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        customerName: string;
        customerPhone: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        paidAmount: number;
        receiptId: string;
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
            warehouseId: string;
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
                createdAt: Date;
                warehouseId: string;
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
            quantity: number;
            productId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        shopId: string | null;
        userId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        customerName: string;
        customerPhone: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        paidAmount: number;
        receiptId: string;
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
            warehouseId: string;
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
                createdAt: Date;
                warehouseId: string;
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
            quantity: number;
            productId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        shopId: string | null;
        userId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        customerName: string;
        customerPhone: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        paidAmount: number;
        receiptId: string;
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
            warehouseId: string;
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
                createdAt: Date;
                warehouseId: string;
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
            quantity: number;
            productId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        shopId: string | null;
        userId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        customerName: string;
        customerPhone: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        paidAmount: number;
        receiptId: string;
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
        shop: {
            id: string;
            name: string;
            location: string;
        } | null;
        products: {
            id: string;
            createdAt: Date;
            warehouseId: string;
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
                createdAt: Date;
                warehouseId: string;
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
            quantity: number;
            productId: string;
            orderId: string;
        })[];
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
        shopId: string | null;
        userId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        customerName: string;
        customerPhone: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        paidAmount: number;
        receiptId: string;
        updatedAt: Date;
    })[]>;
    create(data: any): Promise<{
        products: {
            id: string;
            createdAt: Date;
            warehouseId: string;
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
                createdAt: Date;
                warehouseId: string;
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
            quantity: number;
            productId: string;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        shopId: string | null;
        userId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        customerName: string;
        customerPhone: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        paidAmount: number;
        receiptId: string;
        updatedAt: Date;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        shopId: string | null;
        userId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        customerName: string;
        customerPhone: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        paidAmount: number;
        receiptId: string;
        updatedAt: Date;
    }>;
    updatePayment(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        shopId: string | null;
        userId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        customerName: string;
        customerPhone: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        paidAmount: number;
        receiptId: string;
        updatedAt: Date;
    }>;
    updatePackager(id: string, data: any): Promise<{
        message: string;
        shop: {
            id: string;
            name: string;
            location: string;
        } | null;
        packager: {
            id: string;
            username: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
        } | null;
        id: string;
        createdAt: Date;
        shopId: string | null;
        userId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        customerName: string;
        customerPhone: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        paidAmount: number;
        receiptId: string;
        updatedAt: Date;
    }>;
    updateRelease(id: string, data: any, userId: string): Promise<{
        id: string;
        createdAt: Date;
        shopId: string | null;
        userId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        customerName: string;
        customerPhone: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        paidAmount: number;
        receiptId: string;
        updatedAt: Date;
    }>;
    getOrdersForUser(userId: string): Promise<({
        shop: {
            id: string;
            name: string;
            location: string;
        } | null;
        products: {
            id: string;
            createdAt: Date;
            warehouseId: string;
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
                createdAt: Date;
                warehouseId: string;
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
            quantity: number;
            productId: string;
            orderId: string;
        })[];
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
        shopId: string | null;
        userId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        customerName: string;
        customerPhone: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        paidAmount: number;
        receiptId: string;
        updatedAt: Date;
    })[]>;
    getOrdersForUserWithPagination(userId: string, page?: number, size?: number, search?: string, status?: string, paymentStatus?: string, startDate?: Date, endDate?: Date, shopId?: string): Promise<{
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
            shop: {
                id: string;
                name: string;
                location: string;
            } | null;
            products: {
                category: {
                    name: string;
                };
                id: string;
                name: string;
                price: number;
                image: string | null;
            }[];
            OrderItem: ({
                product: {
                    category: {
                        name: string;
                    };
                    id: string;
                    name: string;
                    price: number;
                    image: string | null;
                };
            } & {
                id: string;
                quantity: number;
                productId: string;
                orderId: string;
            })[];
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
            id: string;
            createdAt: Date;
            shopId: string | null;
            userId: string | null;
            status: import(".prisma/client").$Enums.OrderStatus;
            attendeeId: string | null;
            receptionistId: string | null;
            packagerId: string | null;
            storekeeperId: string | null;
            customerName: string;
            customerPhone: string | null;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            totalAmount: number;
            paidAmount: number;
            receiptId: string;
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
    getOrdersByShop(shopId: string): Promise<({
        shop: {
            id: string;
            name: string;
            location: string;
        } | null;
        products: {
            id: string;
            createdAt: Date;
            warehouseId: string;
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
                createdAt: Date;
                warehouseId: string;
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
            quantity: number;
            productId: string;
            orderId: string;
        })[];
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
        shopId: string | null;
        userId: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        attendeeId: string | null;
        receptionistId: string | null;
        packagerId: string | null;
        storekeeperId: string | null;
        customerName: string;
        customerPhone: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalAmount: number;
        paidAmount: number;
        receiptId: string;
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
                    warehouseId: string;
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
                quantity: number;
                productId: string;
                orderId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            shopId: string | null;
            userId: string | null;
            status: import(".prisma/client").$Enums.OrderStatus;
            attendeeId: string | null;
            receptionistId: string | null;
            packagerId: string | null;
            storekeeperId: string | null;
            customerName: string;
            customerPhone: string | null;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            totalAmount: number;
            paidAmount: number;
            receiptId: string;
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
