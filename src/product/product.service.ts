import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class ProductService {
    private readonly logger = new Logger(ProductService.name);
  constructor(private prisma: PrismaService, private cloudinary: CloudinaryService) {}

async findAll(user?: { id: string; role: string; shopId?: string }) {
  this.logger.log(`Fetching products for user: ${user?.id || 'unknown'} with role: ${user?.role || 'unknown'}`);

  try {
    // If no user data, fetch user from database using the ID
    if (!user) {
      this.logger.warn('No user data provided, returning all products (fallback)');
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
        ORDER BY p.name ASC
      `;
    }

    // Admin and CEO get all products
    if (user.role === 'CEO' || user.role === 'Admin') {
      this.logger.debug(`Fetching all products for admin/CEO user: ${user.id}`);
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
        ORDER BY p.name ASC
      `;
    }

    // For other roles, get the user's shop assignment from database if not provided
    let shopId = user.shopId;
    if (!shopId) {
      this.logger.debug(`No shopId in user data, fetching from database for user: ${user.id}`);
      const userWithShop = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { shopId: true, shop: { select: { id: true, name: true } } }
      });

      if (!userWithShop || !userWithShop.shopId) {
        this.logger.warn(`User ${user.id} has no shop assignment`);
        return [];
      }

      shopId = userWithShop.shopId;
      this.logger.debug(`Found shop assignment for user ${user.id}: ${userWithShop.shop?.name} (${shopId})`);
    }

    this.logger.debug(`Fetching products assigned to shop: ${shopId} for user: ${user.id}`);
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
        assignedQuantity: number;
        assignedAt: Date;
        warehouseName: string;
      }>
    >`
      SELECT DISTINCT
        p.id,
        p.name,
        p.description,
        p.price,
        p.image,
        p."totalStock",
        p."availableStock",
        c.name as category,
        pa.quantity as "assignedQuantity",
        pa."assignedAt",
        w.name as "warehouseName"
      FROM "Product" p
      JOIN "Category" c ON p."categoryId" = c.id
      INNER JOIN "ProductAssignment" pa ON p.id = pa."productId"
      LEFT JOIN "Warehouse" w ON pa."warehouseId" = w.id
      WHERE pa."shopId" = '${shopId}'
      ORDER BY p.name ASC, pa."assignedAt" DESC
    `;
  } catch (error: any) {
    this.logger.error(`Failed to fetch products: ${error.message || 'Unknown error'}`);
    throw new BadRequestException(`Failed to fetch products: ${error.message || 'Unknown error'}`);
  }
}

async findAllByUserId(userId: string) {
  this.logger.log(`Fetching products for user ID: ${userId}`);

  try {
    // First, get the user with their role and shop assignment
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        shopId: true,
        shop: {
          select: { id: true, name: true, location: true }
        }
      }
    });

    if (!user) {
      this.logger.error(`User with ID ${userId} not found`);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    this.logger.debug(`Found user: ${user.id}, role: ${user.role}, shopId: ${user.shopId}, shop: ${JSON.stringify(user.shop)}`);

    // Admin and CEO get all products with warehouse details
    if (user.role === 'CEO' || user.role === 'Admin') {
      this.logger.debug(`Fetching all products for admin/CEO user: ${user.id}`);
      const products = await this.prisma.$queryRaw<
        Array<{
          id: string;
          name: string;
          description: string;
          price: number;
          image: string | null;
          totalStock: number;
          availableStock: number;
          category: string;
          warehouseId: string;
          warehouseName: string;
          warehouseLocation: string;
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
          c.name as category,
          p."warehouseId",
          w.name as "warehouseName",
          w.location as "warehouseLocation"
        FROM "Product" p
        JOIN "Category" c ON p."categoryId" = c.id
        JOIN "Warehouse" w ON p."warehouseId" = w.id
        ORDER BY p.name ASC
      `;

      // Transform to include warehouse object
      const transformedProducts = products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        totalStock: product.totalStock,
        availableStock: product.availableStock,
        category: product.category,
        warehouse: {
          id: product.warehouseId,
          name: product.warehouseName,
          location: product.warehouseLocation
        }
      }));

      this.logger.debug(`Admin/CEO query returned ${transformedProducts.length} products`);
      return transformedProducts;
    }

    // Other roles need shop assignment
    if (!user.shopId) {
      this.logger.warn(`User ${user.id} (${user.role}) has no shop assignment`);
      return [];
    }

    this.logger.debug(`Fetching products assigned to shop: ${user.shop?.name} (${user.shopId}) for user: ${user.id}`);

    // Use Prisma ORM instead of raw SQL for better debugging
    const productAssignments = await this.prisma.productAssignment.findMany({
      where: {
        shopId: user.shopId
      },
      include: {
        product: {
          include: {
            category: true,
            warehouse: {
              select: { id: true, name: true, location: true }
            }
          }
        },
        warehouse: {
          select: { id: true, name: true, location: true }
        }
      },
      orderBy: [
        { product: { name: 'asc' } },
        { assignedAt: 'desc' }
      ]
    });

    this.logger.debug(`Found ${productAssignments.length} product assignments for shop ${user.shopId} (${user.shop?.name})`);

    if (productAssignments.length === 0) {
      this.logger.warn(`No product assignments found for shop ${user.shopId} (${user.shop?.name})`);
      return [];
    }

    // Transform the data to match the expected response format with inventory tracking
    const products = productAssignments.map(assignment => ({
      id: assignment.product.id,
      name: assignment.product.name,
      description: assignment.product.description,
      price: assignment.product.price,
      image: assignment.product.image,
      totalStock: assignment.product.totalStock,
      availableStock: assignment.product.availableStock,
      category: assignment.product.category.name,
      // Shop-level inventory tracking
      assignedQuantity: assignment.quantity,
      shopAvailableQuantity: assignment.availableQuantity,
      shopSoldQuantity: assignment.soldQuantity,
      assignedAt: assignment.assignedAt,
      // Warehouse details from assignment
      assignmentWarehouse: {
        id: assignment.warehouse?.id || '',
        name: assignment.warehouse?.name || 'Unknown Warehouse',
        location: assignment.warehouse?.location || 'Unknown Location'
      },
      // Product's original warehouse details
      productWarehouse: {
        id: assignment.product.warehouseId,
        name: assignment.product.warehouse?.name || 'Unknown Warehouse',
        location: assignment.product.warehouse?.location || 'Unknown Location'
      }
    }));

    this.logger.debug(`Transformed ${products.length} products for shop ${user.shopId}`);
    this.logger.debug(`Product details: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, assignedQuantity: p.assignedQuantity })))}`);

    return products;
  } catch (error: any) {
    this.logger.error(`Failed to fetch products for user ${userId}: ${error.message || 'Unknown error'}`);
    if (error instanceof NotFoundException) {
      throw error;
    }
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
    const { totalStock, warehouseId, ...rest } = data;

    if (!warehouseId) {
      throw new Error('Warehouse ID is required');
    }

    const numericStock = Number(totalStock);
    if (isNaN(numericStock)) {
      throw new Error('Invalid totalStock value');
    }

    const payload = {
      ...rest,
      totalStock: numericStock,
      availableStock: numericStock,
      warehouseId
    };

    return await this.prisma.product.create({ 
      data: payload,
      include: {
        category: true,
        warehouse: true
      }
    });
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

  async uploadCSV(file: Express.Multer.File, warehouseId: string) {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }

    try {
      this.logger.debug(`Processing CSV upload for warehouse: ${warehouseId}`);

      const csvData = file.buffer.toString();
      const lines = csvData.split('\n').filter(line => line.trim()); // Remove empty lines

      if (lines.length < 2) {
        throw new BadRequestException('CSV file must contain at least a header and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim());
      this.logger.debug(`CSV headers: ${headers.join(', ')}`);

      // Validate required headers
      const requiredHeaders = ['name', 'description', 'price', 'categoryId', 'warehouseId', 'totalStock'];
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      if (missingHeaders.length > 0) {
        throw new BadRequestException(`Missing required headers: ${missingHeaders.join(', ')}`);
      }

      const products = [];
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim());

          // Create object mapping headers to values
          const productData: any = {};
          headers.forEach((header, index) => {
            productData[header] = values[index];
          });

          // Parse and validate the product data
          const product = {
            name: productData.name,
            description: productData.description,
            price: parseFloat(productData.price),
            categoryId: productData.categoryId,
            warehouseId: productData.warehouseId || warehouseId, // Use CSV warehouseId or fallback to parameter
            totalStock: parseInt(productData.totalStock),
            availableStock: productData.availableStock ? parseInt(productData.availableStock) : parseInt(productData.totalStock),
            image: productData.image || null
          };

          // Validate required fields
          if (!product.name || !product.description || isNaN(product.price) || !product.categoryId || !product.warehouseId || isNaN(product.totalStock)) {
            errors.push(`Row ${i + 1}: Missing or invalid required fields`);
            continue;
          }

          // Validate that category and warehouse exist
          const category = await this.prisma.category.findUnique({ where: { id: product.categoryId } });
          if (!category) {
            errors.push(`Row ${i + 1}: Category with ID ${product.categoryId} not found`);
            continue;
          }

          const warehouse = await this.prisma.warehouse.findUnique({ where: { id: product.warehouseId } });
          if (!warehouse) {
            errors.push(`Row ${i + 1}: Warehouse with ID ${product.warehouseId} not found`);
            continue;
          }

          products.push(product);
        } catch (error: any) {
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      if (errors.length > 0) {
        this.logger.warn(`CSV upload errors: ${errors.join('; ')}`);
      }

      if (products.length === 0) {
        throw new BadRequestException(`No valid products found in CSV. Errors: ${errors.join('; ')}`);
      }

      this.logger.debug(`Creating ${products.length} products from CSV`);

      const createdProducts = await Promise.all(
        products.map(async (product, index) => {
          try {
            return await this.create(product);
          } catch (error: any) {
            errors.push(`Product ${index + 1} (${product.name}): ${error.message}`);
            return null;
          }
        })
      );

      const successfulProducts = createdProducts.filter(p => p !== null);

      return {
        success: true,
        count: successfulProducts.length,
        total: products.length,
        products: successfulProducts,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error: any) {
      this.logger.error(`Failed to upload CSV: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to upload CSV: ${error.message}`);
    }
  }

  async bulkUploadProducts(file: Express.Multer.File, userId: string) {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }

    try {
      this.logger.log(`Processing bulk upload for user: ${userId}`);

      const csvData = file.buffer.toString();
      const lines = csvData.split('\n').filter(line => line.trim()); // Remove empty lines

      if (lines.length < 2) {
        throw new BadRequestException('CSV file must contain at least a header and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim());
      this.logger.debug(`CSV headers: ${headers.join(', ')}`);

      // Validate required headers (image is not required)
      const requiredHeaders = ['name', 'description', 'price', 'categoryId', 'warehouseId', 'totalStock'];
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      if (missingHeaders.length > 0) {
        throw new BadRequestException(`Missing required headers: ${missingHeaders.join(', ')}`);
      }

      // Parse all rows first to extract warehouse IDs
      const parsedRows = [];
      const warehouseIds = new Set<string>();

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());

        // Skip empty rows
        if (values.every(v => !v)) continue;

        // Create object mapping headers to values
        const productData: any = {};
        headers.forEach((header, index) => {
          productData[header] = values[index];
        });

        // Validate required fields
        if (!productData.name || !productData.description || !productData.price ||
            !productData.categoryId || !productData.warehouseId || !productData.totalStock) {
          throw new BadRequestException(`Row ${i + 1}: Missing required fields (name, description, price, categoryId, warehouseId, totalStock)`);
        }

        warehouseIds.add(productData.warehouseId);
        parsedRows.push({ rowIndex: i + 1, data: productData });
      }

      if (parsedRows.length === 0) {
        throw new BadRequestException('No valid product rows found in CSV');
      }

      this.logger.debug(`Found ${warehouseIds.size} unique warehouse IDs: ${Array.from(warehouseIds).join(', ')}`);

      // Check if all warehouses exist
      const existingWarehouses = await this.prisma.warehouse.findMany({
        where: { id: { in: Array.from(warehouseIds) } },
        select: { id: true, name: true }
      });

      const existingWarehouseIds = new Set(existingWarehouses.map(w => w.id));
      const missingWarehouseIds = Array.from(warehouseIds).filter(id => !existingWarehouseIds.has(id));

      if (missingWarehouseIds.length > 0) {
        throw new BadRequestException(`The following warehouse IDs do not exist: ${missingWarehouseIds.join(', ')}. Please ensure all warehouses exist before uploading.`);
      }

      this.logger.debug(`All warehouses validated successfully`);

      // Check if all categories exist
      const categoryIds = new Set(parsedRows.map(row => row.data.categoryId));
      const existingCategories = await this.prisma.category.findMany({
        where: { id: { in: Array.from(categoryIds) } },
        select: { id: true, name: true }
      });

      const existingCategoryIds = new Set(existingCategories.map(c => c.id));
      const missingCategoryIds = Array.from(categoryIds).filter(id => !existingCategoryIds.has(id));

      if (missingCategoryIds.length > 0) {
        throw new BadRequestException(`The following category IDs do not exist: ${missingCategoryIds.join(', ')}. Please ensure all categories exist before uploading.`);
      }

      this.logger.debug(`All categories validated successfully`);

      // Process all products
      const products = [];
      const errors = [];

      for (const row of parsedRows) {
        try {
          const productData = row.data;

          const product = {
            name: productData.name,
            description: productData.description,
            price: parseFloat(productData.price),
            categoryId: productData.categoryId,
            warehouseId: productData.warehouseId,
            totalStock: parseInt(productData.totalStock),
            availableStock: parseInt(productData.totalStock), // Initially all stock is available
            image: productData.image || null // Image is optional
          };

          // Validate numeric fields
          if (isNaN(product.price) || product.price <= 0) {
            errors.push(`Row ${row.rowIndex}: Invalid price value`);
            continue;
          }

          if (isNaN(product.totalStock) || product.totalStock < 0) {
            errors.push(`Row ${row.rowIndex}: Invalid totalStock value`);
            continue;
          }

          products.push(product);
        } catch (error: any) {
          errors.push(`Row ${row.rowIndex}: ${error.message}`);
        }
      }

      if (errors.length > 0) {
        throw new BadRequestException(`Validation errors found: ${errors.join('; ')}`);
      }

      this.logger.debug(`Creating ${products.length} products from bulk upload`);

      // Create all products
      const createdProducts = [];
      const creationErrors = [];

      for (let i = 0; i < products.length; i++) {
        try {
          const createdProduct = await this.prisma.product.create({
            data: products[i],
            include: {
              category: true,
              warehouse: true
            }
          });
          createdProducts.push(createdProduct);
        } catch (error: any) {
          creationErrors.push(`Product ${i + 1} (${products[i].name}): ${error.message}`);
        }
      }

      // Log activity
      await this.prisma.activityLog.create({
        data: {
          userId: userId,
          action: 'BULK_PRODUCT_UPLOAD',
          details: `Bulk uploaded ${createdProducts.length} products from CSV. Warehouses: ${Array.from(warehouseIds).join(', ')}. ${creationErrors.length > 0 ? `Errors: ${creationErrors.length}` : 'All successful'}`,
          ipAddress: null,
          userAgent: null
        }
      });

      this.logger.log(`Bulk upload completed: ${createdProducts.length} products created, ${creationErrors.length} errors`);

      return {
        success: true,
        message: `Successfully created ${createdProducts.length} products`,
        totalProcessed: products.length,
        successCount: createdProducts.length,
        errorCount: creationErrors.length,
        products: createdProducts,
        errors: creationErrors.length > 0 ? creationErrors : undefined,
        warehousesProcessed: Array.from(warehouseIds).length
      };

    } catch (error: any) {
      this.logger.error(`Failed to process bulk upload: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to process bulk upload: ${error.message}`);
    }
  }
}
