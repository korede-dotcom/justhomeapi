import { ProductService } from './product.service';
export declare class ProductController {
    private readonly productService;
    private readonly logger;
    constructor(productService: ProductService);
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
    getCategories(): Promise<{
        id: string;
        name: string;
        description: string;
        createdAt: Date;
    }[]>;
    uploadImage(file: Express.Multer.File, body: any): Promise<any>;
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
