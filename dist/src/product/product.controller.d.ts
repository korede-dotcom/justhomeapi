import { ProductService } from './product.service';
import { CreateCustomerOrderDto } from './dto/customer-order.dto';
export declare class ProductController {
    private readonly productService;
    private readonly logger;
    constructor(productService: ProductService);
    findAll(req: any, page?: string, size?: string, search?: string, warehouseId?: string): Promise<never[] | {
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
    getCategories(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        description: string;
    }[]>;
    getWarehouseProducts(warehouseId: string, req: any, page?: string, size?: string, search?: string, category?: string): Promise<{
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
    uploadImage(file: Express.Multer.File, body: any): Promise<any>;
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
    update(id: string, data: any): import(".prisma/client").Prisma.Prisma__ProductClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
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
    bulkUpload(file: Express.Multer.File, req: any): Promise<{
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
    uploadXlsx(file: Express.Multer.File, req: any): Promise<any>;
    getAvailableProducts(page?: string, size?: string, search?: string, category?: string, minPrice?: string, maxPrice?: string): Promise<{
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
    createOrder(orderData: CreateCustomerOrderDto): Promise<{
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
}
