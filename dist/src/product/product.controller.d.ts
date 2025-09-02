import { ProductService } from './product.service';
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
}
