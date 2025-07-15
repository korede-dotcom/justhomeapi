import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class ProductService {
    private readonly logger = new Logger(ProductService.name);
  constructor(private prisma: PrismaService, private cloudinary: CloudinaryService) {}

async findAll() {
  this.logger.log('Fetching all products with categories using raw SQL');

  try {
    return await this.prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        description: string;
        price: number;
        image: string | null;
        totalStock: number;
        availableStock: number;
        category: string;
      }>
    >`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.image,
        p."totalStock",
        p."availableStock",
        c.name as category
      FROM "Product" p
      JOIN "Category" c ON p."categoryId" = c.id
    `;
  } catch (error: any) {
    this.logger.error(`Failed to fetch products: ${error.message || 'Unknown error'}`);
    throw new BadRequestException(`Failed to fetch products: ${error.message || 'Unknown error'}`);
  }
}


  async createCategory(data: any) {
    return this.prisma.category.create({ data });
  }

    async findAllCategories() {
        return this.prisma.category.findMany();
    }

    async findCategoryById(id: string) {
        return this.prisma.category.findUnique({ where: { id } });
    }
    async findCategoryByName(name: string) {
            return this.prisma.category.findMany({
                where: {
                    name: {
                        contains: name,
                        mode: 'insensitive',
                    },
                },
            });
        }

async uploadForUrl(data: any, file: Express.Multer.File) {
  if (!file) {
    throw new Error('File is required for upload');
  }

  try {
    const upload = await this.cloudinary.uploadImage(file);
    data.image = upload.secure_url;
    return upload.secure_url
  } catch (error: any) {
    this.logger.error(`Failed to upload image: ${error.message || 'Unknown error'}`);
    throw new Error(`Failed to upload image: ${error.message || 'Unknown error'}`);
  }
}


async create(data: any) {
  try {
    const {
      totalStock,
      ...rest
    } = data;

    const numericStock = Number(totalStock);
    if (isNaN(numericStock)) {
      throw new Error('Invalid totalStock value');
    }

    const payload = {
      ...rest,
      totalStock: numericStock,
      availableStock: numericStock, // 👈 ensure both are equal on creation
    };

    return await this.prisma.product.create({ data: payload });
  } catch (error: any) {
    this.logger.error(`Failed to create product: ${error.message || 'Unknown error'}`);
    throw new BadRequestException(`Failed to create product: ${error.message || 'Unknown error'}`);
  }
}


    async findOne(id: string) {
        return this.prisma.product.findUnique({ where: { id } });
    }
    // async findByCategory(category: string) {
    //     return this.prisma.product.findMany({ where: { category } });
    // }
    async findByName(name: string) {
        return this.prisma.product.findMany({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive',
                },
            },
        });
    }
    async findByPriceRange(min: number, max: number) {
        return this.prisma.product.findMany({
            where: {
                price: {
                    gte: min,
                    lte: max,
                },
            },
        });
    }

  update(id: string, data: any) {
    return this.prisma.product.update({ where: { id }, data });
  }
}