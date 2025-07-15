import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from './cloudinary.service';
export declare class ProductService {
    private prisma;
    private cloudinary;
    private readonly logger;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    findAll(): Promise<{
        id: string;
        name: string;
        description: string;
        price: number;
        image: string | null;
        totalStock: number;
        availableStock: number;
        category: string;
    }[]>;
    createCategory(data: any): Promise<{
        id: string;
        name: string;
        description: string;
        createdAt: Date;
    }>;
    findAllCategories(): Promise<{
        id: string;
        name: string;
        description: string;
        createdAt: Date;
    }[]>;
    findCategoryById(id: string): Promise<{
        id: string;
        name: string;
        description: string;
        createdAt: Date;
    } | null>;
    findCategoryByName(name: string): Promise<{
        id: string;
        name: string;
        description: string;
        createdAt: Date;
    }[]>;
    uploadForUrl(data: any, file: Express.Multer.File): Promise<any>;
    create(data: any): Promise<{
        id: string;
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
        name: string;
        description: string;
        price: number;
        image: string | null;
        totalStock: number;
        availableStock: number;
        categoryId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
