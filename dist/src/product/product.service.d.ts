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
    findAllByUserId(userId: string): Promise<{
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
    }[] | {
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
    }[]>;
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
}
