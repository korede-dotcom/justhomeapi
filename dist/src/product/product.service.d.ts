import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from './cloudinary.service';
export declare class ProductService {
    private prisma;
    private cloudinary;
    private readonly logger;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    findAll(user?: {
        id: string;
        role: string;
        shopId?: string;
    }): Promise<{
        id: string;
        name: string;
        description: string;
        price: number;
        image: string | null;
        totalStock: number;
        availableStock: number;
        category: string;
    }[]>;
    findAllByUserId(userId: string, page?: number, size?: number, search?: string, warehouseId?: string): Promise<never[] | {
        data: {
            id: string;
            name: string;
            description: string;
            price: number;
            image: string | null;
            totalStock: number;
            availableStock: number;
            category: string;
            warehouse: {
                id: string;
                name: string;
                location: string;
            };
        }[];
        page: number;
        size: number;
        total: number;
        totalPages: number;
    } | {
        data: {
            id: string;
            name: string;
            description: string;
            price: number;
            image: string | null;
            totalStock: number;
            availableStock: number;
            category: string;
            assignedQuantity: number;
            shopAvailableQuantity: number;
            shopSoldQuantity: number;
            assignedAt: Date;
            assignmentWarehouse: {
                id: string;
                name: string;
                location: string;
            };
            productWarehouse: {
                id: string;
                name: string;
                location: string;
            };
        }[];
        page: number;
        size: number;
        total: number;
        totalPages: number;
    }>;
    createCategory(data: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        description: string;
    }>;
    findAllCategories(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        description: string;
    }[]>;
    findCategoryById(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        description: string;
    } | null>;
    findCategoryByName(name: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        description: string;
    }[]>;
    uploadForUrl(data: any, file: Express.Multer.File): Promise<any>;
    create(data: any): Promise<{
        warehouse: {
            id: string;
            isActive: boolean;
            name: string;
            location: string;
            description: string | null;
            managerId: string | null;
        };
        category: {
            id: string;
            createdAt: Date;
            name: string;
            description: string;
        };
    } & {
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
    }>;
    findOne(id: string): Promise<{
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
    } | null>;
    findByName(name: string): Promise<{
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
    }[]>;
    findByPriceRange(min: number, max: number): Promise<{
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
    }[]>;
    update(id: string, data: any): Prisma.Prisma__ProductClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    uploadCSV(file: Express.Multer.File, warehouseId: string): Promise<{
        success: boolean;
        count: number;
        total: number;
        products: ({
            warehouse: {
                id: string;
                isActive: boolean;
                name: string;
                location: string;
                description: string | null;
                managerId: string | null;
            };
            category: {
                id: string;
                createdAt: Date;
                name: string;
                description: string;
            };
        } & {
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
        })[];
        errors: string[] | undefined;
    }>;
    bulkUploadProducts(file: Express.Multer.File, userId: string): Promise<{
        success: boolean;
        message: string;
        totalProcessed: number;
        successCount: number;
        errorCount: number;
        products: ({
            warehouse: {
                id: string;
                isActive: boolean;
                name: string;
                location: string;
                description: string | null;
                managerId: string | null;
            };
            category: {
                id: string;
                createdAt: Date;
                name: string;
                description: string;
            };
        } & {
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
        })[];
        errors: string[] | undefined;
        warehousesProcessed: number;
    }>;
    uploadAndReadXlsx(file: Express.Multer.File, userId: string): Promise<any>;
    private processStockCountSheet;
    private findColumnIndex;
    private ensureDefaultCategory;
    private processWarehouseSheet;
    private processProductSheet;
    getWarehouseProducts(warehouseId: string, query?: {
        page?: number;
        size?: number;
        search?: string;
        category?: string;
    }, userId?: string, userInfo?: {
        role?: string;
    }): Promise<{
        data: ({
            warehouse: {
                id: string;
                name: string;
                location: string;
            };
            _count: {
                assignments: number;
            };
            category: {
                id: string;
                name: string;
                description: string;
            };
        } & {
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
        })[];
        warehouse: {
            id: string;
            isActive: boolean;
            name: string;
            location: string;
        };
        pagination: {
            page: number;
            size: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrevious: boolean;
        };
        summary: {
            totalProducts: number;
            productsOnPage: number;
            stockStats: {
                totalStock: number;
                availableStock: number;
                assignedStock: number;
            };
            outOfStockProducts: number;
            lowStockProducts: number;
        };
        filters: {
            search: string | null;
            category: string | null;
        };
    }>;
    getAvailableProducts(query?: {
        page?: number;
        size?: number;
        search?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
    }): Promise<{
        data: any[];
        pagination: {
            page: number;
            size: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrevious: boolean;
        };
        summary: {
            totalAvailableProducts: number;
            productsOnPage: number;
            totalStock: number;
            priceRange: {
                min: number;
                max: number;
            };
            shopFilter: {
                enabled: boolean;
                shopId: string;
                note: string;
            } | {
                enabled: boolean;
                note: string;
                shopId?: undefined;
            };
        };
        filters: {
            search: string | null;
            category: string | null;
            minPrice: number | null;
            maxPrice: number | null;
            defaultShop: string | null;
        };
    }>;
    createCustomerOrder(orderData: any): Promise<{
        success: boolean;
        message: string;
        order: {
            id: string;
            orderNumber: string;
            receiptId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            totalAmount: number;
            deliveryAddress: any;
            customerNotes: any;
            createdAt: Date;
            estimatedDelivery: Date;
            customer: {
                id: string;
                name: string;
                phone: string | null;
                email: string;
            };
            items: {
                id: any;
                quantity: any;
                unitPrice: any;
                totalPrice: any;
                product: any;
            }[];
            summary: {
                totalItems: number;
                totalQuantity: any;
                totalAmount: number;
            };
        };
    }>;
    clearPendingOrders(): Promise<{
        success: boolean;
        message: string;
        deletedCount: number;
        deletedOrders: never[];
        deletedOrderItems?: undefined;
    } | {
        success: boolean;
        message: string;
        deletedCount: number;
        deletedOrderItems: number;
        deletedOrders: {
            id: string;
            customerName: string;
            customerPhone: string | null;
            totalAmount: number;
            createdAt: Date;
            itemCount: number;
        }[];
    }>;
    ceoUpdateOrder(orderId: string, updateData: any, ceoId: string): Promise<{
        success: boolean;
        message: string;
        order: {
            id: string;
            orderNumber: string;
            receiptId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            totalAmount: number;
            paidAmount: number;
            balanceAmount: any;
            createdAt: Date;
            updatedAt: Date;
            customer: {
                id: string | null;
                name: string;
                phone: string | null;
                email: string | null;
            };
            items: {
                id: any;
                quantity: any;
                product: any;
            }[];
            updateInfo: {
                updatedBy: string;
                paymentAmount: any;
                paymentReference: any;
                notes: any;
                updatedAt: Date;
            };
        };
    }>;
}
