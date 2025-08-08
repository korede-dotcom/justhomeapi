"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var ProductService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const cloudinary_service_1 = require("./cloudinary.service");
let ProductService = ProductService_1 = class ProductService {
    constructor(prisma, cloudinary) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
        this.logger = new common_1.Logger(ProductService_1.name);
    }
    async findAll(user) {
        var _a;
        this.logger.log(`Fetching products for user: ${(user === null || user === void 0 ? void 0 : user.id) || 'unknown'} with role: ${(user === null || user === void 0 ? void 0 : user.role) || 'unknown'}`);
        try {
            if (!user) {
                this.logger.warn('No user data provided, returning all products (fallback)');
                return await this.prisma.$queryRaw `
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
            if (user.role === 'CEO' || user.role === 'Admin') {
                this.logger.debug(`Fetching all products for admin/CEO user: ${user.id}`);
                return await this.prisma.$queryRaw `
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
                this.logger.debug(`Found shop assignment for user ${user.id}: ${(_a = userWithShop.shop) === null || _a === void 0 ? void 0 : _a.name} (${shopId})`);
            }
            this.logger.debug(`Fetching products assigned to shop: ${shopId} for user: ${user.id}`);
            return await this.prisma.$queryRaw `
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
        }
        catch (error) {
            this.logger.error(`Failed to fetch products: ${error.message || 'Unknown error'}`);
            throw new common_1.BadRequestException(`Failed to fetch products: ${error.message || 'Unknown error'}`);
        }
    }
    async findAllByUserId(userId) {
        var _a, _b, _c;
        this.logger.log(`Fetching products for user ID: ${userId}`);
        try {
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
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            this.logger.debug(`Found user: ${user.id}, role: ${user.role}, shopId: ${user.shopId}, shop: ${JSON.stringify(user.shop)}`);
            if (user.role === 'CEO' || user.role === 'Admin') {
                this.logger.debug(`Fetching all products for admin/CEO user: ${user.id}`);
                const products = await this.prisma.$queryRaw `
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
            if (!user.shopId) {
                this.logger.warn(`User ${user.id} (${user.role}) has no shop assignment`);
                return [];
            }
            this.logger.debug(`Fetching products assigned to shop: ${(_a = user.shop) === null || _a === void 0 ? void 0 : _a.name} (${user.shopId}) for user: ${user.id}`);
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
            this.logger.debug(`Found ${productAssignments.length} product assignments for shop ${user.shopId} (${(_b = user.shop) === null || _b === void 0 ? void 0 : _b.name})`);
            if (productAssignments.length === 0) {
                this.logger.warn(`No product assignments found for shop ${user.shopId} (${(_c = user.shop) === null || _c === void 0 ? void 0 : _c.name})`);
                return [];
            }
            const products = productAssignments.map(assignment => {
                var _a, _b, _c, _d, _e;
                return ({
                    id: assignment.product.id,
                    name: assignment.product.name,
                    description: assignment.product.description,
                    price: assignment.product.price,
                    image: assignment.product.image,
                    totalStock: assignment.product.totalStock,
                    availableStock: assignment.product.availableStock,
                    category: assignment.product.category.name,
                    assignedQuantity: assignment.quantity,
                    shopAvailableQuantity: assignment.availableQuantity,
                    shopSoldQuantity: assignment.soldQuantity,
                    assignedAt: assignment.assignedAt,
                    assignmentWarehouse: {
                        id: ((_a = assignment.warehouse) === null || _a === void 0 ? void 0 : _a.id) || '',
                        name: ((_b = assignment.warehouse) === null || _b === void 0 ? void 0 : _b.name) || 'Unknown Warehouse',
                        location: ((_c = assignment.warehouse) === null || _c === void 0 ? void 0 : _c.location) || 'Unknown Location'
                    },
                    productWarehouse: {
                        id: assignment.product.warehouseId,
                        name: ((_d = assignment.product.warehouse) === null || _d === void 0 ? void 0 : _d.name) || 'Unknown Warehouse',
                        location: ((_e = assignment.product.warehouse) === null || _e === void 0 ? void 0 : _e.location) || 'Unknown Location'
                    }
                });
            });
            this.logger.debug(`Transformed ${products.length} products for shop ${user.shopId}`);
            this.logger.debug(`Product details: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, assignedQuantity: p.assignedQuantity })))}`);
            return products;
        }
        catch (error) {
            this.logger.error(`Failed to fetch products for user ${userId}: ${error.message || 'Unknown error'}`);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to fetch products: ${error.message || 'Unknown error'}`);
        }
    }
    async createCategory(data) {
        return this.prisma.category.create({ data });
    }
    async findAllCategories() {
        return this.prisma.category.findMany();
    }
    async findCategoryById(id) {
        return this.prisma.category.findUnique({ where: { id } });
    }
    async findCategoryByName(name) {
        return this.prisma.category.findMany({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive',
                },
            },
        });
    }
    async uploadForUrl(data, file) {
        if (!file) {
            throw new Error('File is required for upload');
        }
        try {
            const upload = await this.cloudinary.uploadImage(file);
            data.image = upload.secure_url;
            return upload.secure_url;
        }
        catch (error) {
            this.logger.error(`Failed to upload image: ${error.message || 'Unknown error'}`);
            throw new Error(`Failed to upload image: ${error.message || 'Unknown error'}`);
        }
    }
    async create(data) {
        try {
            const { totalStock, warehouseId } = data, rest = __rest(data, ["totalStock", "warehouseId"]);
            if (!warehouseId) {
                throw new Error('Warehouse ID is required');
            }
            const numericStock = Number(totalStock);
            if (isNaN(numericStock)) {
                throw new Error('Invalid totalStock value');
            }
            const payload = Object.assign(Object.assign({}, rest), { totalStock: numericStock, availableStock: numericStock, warehouseId });
            return await this.prisma.product.create({
                data: payload,
                include: {
                    category: true,
                    warehouse: true
                }
            });
        }
        catch (error) {
            this.logger.error(`Failed to create product: ${error.message || 'Unknown error'}`);
            throw new common_1.BadRequestException(`Failed to create product: ${error.message || 'Unknown error'}`);
        }
    }
    async findOne(id) {
        return this.prisma.product.findUnique({ where: { id } });
    }
    async findByName(name) {
        return this.prisma.product.findMany({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive',
                },
            },
        });
    }
    async findByPriceRange(min, max) {
        return this.prisma.product.findMany({
            where: {
                price: {
                    gte: min,
                    lte: max,
                },
            },
        });
    }
    update(id, data) {
        return this.prisma.product.update({ where: { id }, data });
    }
    async uploadCSV(file, warehouseId) {
        if (!file) {
            throw new common_1.BadRequestException('CSV file is required');
        }
        try {
            this.logger.debug(`Processing CSV upload for warehouse: ${warehouseId}`);
            const csvData = file.buffer.toString();
            const lines = csvData.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
                throw new common_1.BadRequestException('CSV file must contain at least a header and one data row');
            }
            const headers = lines[0].split(',').map(h => h.trim());
            this.logger.debug(`CSV headers: ${headers.join(', ')}`);
            const requiredHeaders = ['name', 'description', 'price', 'categoryId', 'warehouseId', 'totalStock'];
            const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
            if (missingHeaders.length > 0) {
                throw new common_1.BadRequestException(`Missing required headers: ${missingHeaders.join(', ')}`);
            }
            const products = [];
            const errors = [];
            for (let i = 1; i < lines.length; i++) {
                try {
                    const values = lines[i].split(',').map(v => v.trim());
                    const productData = {};
                    headers.forEach((header, index) => {
                        productData[header] = values[index];
                    });
                    const product = {
                        name: productData.name,
                        description: productData.description,
                        price: parseFloat(productData.price),
                        categoryId: productData.categoryId,
                        warehouseId: productData.warehouseId || warehouseId,
                        totalStock: parseInt(productData.totalStock),
                        availableStock: productData.availableStock ? parseInt(productData.availableStock) : parseInt(productData.totalStock),
                        image: productData.image || null
                    };
                    if (!product.name || !product.description || isNaN(product.price) || !product.categoryId || !product.warehouseId || isNaN(product.totalStock)) {
                        errors.push(`Row ${i + 1}: Missing or invalid required fields`);
                        continue;
                    }
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
                }
                catch (error) {
                    errors.push(`Row ${i + 1}: ${error.message}`);
                }
            }
            if (errors.length > 0) {
                this.logger.warn(`CSV upload errors: ${errors.join('; ')}`);
            }
            if (products.length === 0) {
                throw new common_1.BadRequestException(`No valid products found in CSV. Errors: ${errors.join('; ')}`);
            }
            this.logger.debug(`Creating ${products.length} products from CSV`);
            const createdProducts = await Promise.all(products.map(async (product, index) => {
                try {
                    return await this.create(product);
                }
                catch (error) {
                    errors.push(`Product ${index + 1} (${product.name}): ${error.message}`);
                    return null;
                }
            }));
            const successfulProducts = createdProducts.filter(p => p !== null);
            return {
                success: true,
                count: successfulProducts.length,
                total: products.length,
                products: successfulProducts,
                errors: errors.length > 0 ? errors : undefined
            };
        }
        catch (error) {
            this.logger.error(`Failed to upload CSV: ${error.message}`);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to upload CSV: ${error.message}`);
        }
    }
    async bulkUploadProducts(file, userId) {
        if (!file) {
            throw new common_1.BadRequestException('CSV file is required');
        }
        try {
            this.logger.log(`Processing bulk upload for user: ${userId}`);
            const csvData = file.buffer.toString();
            const lines = csvData.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
                throw new common_1.BadRequestException('CSV file must contain at least a header and one data row');
            }
            const headers = lines[0].split(',').map(h => h.trim());
            this.logger.debug(`CSV headers: ${headers.join(', ')}`);
            const requiredHeaders = ['name', 'description', 'price', 'categoryId', 'warehouseId', 'totalStock'];
            const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
            if (missingHeaders.length > 0) {
                throw new common_1.BadRequestException(`Missing required headers: ${missingHeaders.join(', ')}`);
            }
            const parsedRows = [];
            const warehouseIds = new Set();
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                if (values.every(v => !v))
                    continue;
                const productData = {};
                headers.forEach((header, index) => {
                    productData[header] = values[index];
                });
                if (!productData.name || !productData.description || !productData.price ||
                    !productData.categoryId || !productData.warehouseId || !productData.totalStock) {
                    throw new common_1.BadRequestException(`Row ${i + 1}: Missing required fields (name, description, price, categoryId, warehouseId, totalStock)`);
                }
                warehouseIds.add(productData.warehouseId);
                parsedRows.push({ rowIndex: i + 1, data: productData });
            }
            if (parsedRows.length === 0) {
                throw new common_1.BadRequestException('No valid product rows found in CSV');
            }
            this.logger.debug(`Found ${warehouseIds.size} unique warehouse IDs: ${Array.from(warehouseIds).join(', ')}`);
            const existingWarehouses = await this.prisma.warehouse.findMany({
                where: { id: { in: Array.from(warehouseIds) } },
                select: { id: true, name: true }
            });
            const existingWarehouseIds = new Set(existingWarehouses.map(w => w.id));
            const missingWarehouseIds = Array.from(warehouseIds).filter(id => !existingWarehouseIds.has(id));
            if (missingWarehouseIds.length > 0) {
                throw new common_1.BadRequestException(`The following warehouse IDs do not exist: ${missingWarehouseIds.join(', ')}. Please ensure all warehouses exist before uploading.`);
            }
            this.logger.debug(`All warehouses validated successfully`);
            const categoryIds = new Set(parsedRows.map(row => row.data.categoryId));
            const existingCategories = await this.prisma.category.findMany({
                where: { id: { in: Array.from(categoryIds) } },
                select: { id: true, name: true }
            });
            const existingCategoryIds = new Set(existingCategories.map(c => c.id));
            const missingCategoryIds = Array.from(categoryIds).filter(id => !existingCategoryIds.has(id));
            if (missingCategoryIds.length > 0) {
                throw new common_1.BadRequestException(`The following category IDs do not exist: ${missingCategoryIds.join(', ')}. Please ensure all categories exist before uploading.`);
            }
            this.logger.debug(`All categories validated successfully`);
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
                        availableStock: parseInt(productData.totalStock),
                        image: productData.image || null
                    };
                    if (isNaN(product.price) || product.price <= 0) {
                        errors.push(`Row ${row.rowIndex}: Invalid price value`);
                        continue;
                    }
                    if (isNaN(product.totalStock) || product.totalStock < 0) {
                        errors.push(`Row ${row.rowIndex}: Invalid totalStock value`);
                        continue;
                    }
                    products.push(product);
                }
                catch (error) {
                    errors.push(`Row ${row.rowIndex}: ${error.message}`);
                }
            }
            if (errors.length > 0) {
                throw new common_1.BadRequestException(`Validation errors found: ${errors.join('; ')}`);
            }
            this.logger.debug(`Creating ${products.length} products from bulk upload`);
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
                }
                catch (error) {
                    creationErrors.push(`Product ${i + 1} (${products[i].name}): ${error.message}`);
                }
            }
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
        }
        catch (error) {
            this.logger.error(`Failed to process bulk upload: ${error.message}`);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to process bulk upload: ${error.message}`);
        }
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = ProductService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, cloudinary_service_1.CloudinaryService])
], ProductService);
//# sourceMappingURL=product.service.js.map