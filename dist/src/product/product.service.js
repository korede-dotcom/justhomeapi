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
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const cloudinary_service_1 = require("./cloudinary.service");
const XLSX = require("xlsx");
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
    async findAllByUserId(userId, page = 1, size = 20, search, warehouseId) {
        var _a, _b, _c, _d;
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
                const offset = (page - 1) * size;
                let whereConditions = [];
                if (search) {
                    whereConditions.push(client_1.Prisma.sql `(p.name ILIKE ${'%' + search + '%'} OR p.description ILIKE ${'%' + search + '%'} OR c.name ILIKE ${'%' + search + '%'})`);
                }
                if (warehouseId) {
                    whereConditions.push(client_1.Prisma.sql `p."warehouseId" = ${warehouseId}`);
                }
                const whereSql = whereConditions.length > 0
                    ? client_1.Prisma.sql `WHERE ${client_1.Prisma.join(whereConditions, ' AND ')}`
                    : client_1.Prisma.sql ``;
                const products = await this.prisma.$queryRaw(client_1.Prisma.sql `
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
        ${whereSql}
        ORDER BY p.name ASC
        LIMIT ${size} OFFSET ${offset}
      `);
                const totalResult = await this.prisma.$queryRaw(client_1.Prisma.sql `
        SELECT COUNT(*)::bigint as count
        FROM "Product" p
        JOIN "Category" c ON p."categoryId" = c.id
        JOIN "Warehouse" w ON p."warehouseId" = w.id
        ${whereSql}
      `);
                const total = Number(((_a = totalResult === null || totalResult === void 0 ? void 0 : totalResult[0]) === null || _a === void 0 ? void 0 : _a.count) || 0);
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
                return {
                    data: transformedProducts,
                    page,
                    size,
                    total,
                    totalPages: Math.max(1, Math.ceil(total / size)),
                };
            }
            if (!user.shopId) {
                this.logger.warn(`User ${user.id} (${user.role}) has no shop assignment`);
                return [];
            }
            this.logger.debug(`Fetching products assigned to shop: ${(_b = user.shop) === null || _b === void 0 ? void 0 : _b.name} (${user.shopId}) for user: ${user.id}`);
            const [productAssignments, total] = await Promise.all([
                this.prisma.productAssignment.findMany({
                    where: {
                        shopId: user.shopId,
                        product: Object.assign(Object.assign({}, (search ? {
                            OR: [
                                { name: { contains: search, mode: 'insensitive' } },
                                { description: { contains: search, mode: 'insensitive' } },
                                { category: { name: { contains: search, mode: 'insensitive' } } },
                            ]
                        } : {})), (warehouseId ? { warehouseId } : {}))
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
                    ],
                    skip: (page - 1) * size,
                    take: size
                }),
                this.prisma.productAssignment.count({
                    where: {
                        shopId: user.shopId,
                        product: Object.assign(Object.assign({}, (search ? {
                            OR: [
                                { name: { contains: search, mode: 'insensitive' } },
                                { description: { contains: search, mode: 'insensitive' } },
                                { category: { name: { contains: search, mode: 'insensitive' } } },
                            ]
                        } : {})), (warehouseId ? { warehouseId } : {}))
                    }
                })
            ]);
            this.logger.debug(`Found ${productAssignments.length} product assignments for shop ${user.shopId} (${(_c = user.shop) === null || _c === void 0 ? void 0 : _c.name})`);
            if (productAssignments.length === 0) {
                this.logger.warn(`No product assignments found for shop ${user.shopId} (${(_d = user.shop) === null || _d === void 0 ? void 0 : _d.name})`);
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
            return {
                data: products,
                page,
                size,
                total,
                totalPages: Math.max(1, Math.ceil(total / size)),
            };
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
    async uploadAndReadXlsx(file, userId) {
        if (!file) {
            throw new common_1.BadRequestException('XLSX file is required');
        }
        try {
            this.logger.log(`Processing XLSX upload for user: ${userId}`);
            this.logger.log(`File details: name=${file.originalname}, size=${file.size}, mimetype=${file.mimetype}`);
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            this.logger.log(`XLSX workbook loaded with ${workbook.SheetNames.length} sheets: ${workbook.SheetNames.join(', ')}`);
            const result = {
                success: true,
                fileName: file.originalname,
                fileSize: file.size,
                sheetsCount: workbook.SheetNames.length,
                sheets: {},
                warehouses: [],
                products: [],
                summary: {
                    warehousesCreated: 0,
                    productsCreated: 0,
                    errors: []
                }
            };
            for (const sheetName of workbook.SheetNames) {
                this.logger.log(`Processing stock count sheet: ${sheetName}`);
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    raw: false,
                    defval: ''
                });
                const filteredData = jsonData.filter((row) => Array.isArray(row) && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && cell !== ''));
                this.logger.log(`Sheet "${sheetName}" contains ${filteredData.length} non-empty rows`);
                this.logger.log(`Sheet "${sheetName}" first 3 rows: ${JSON.stringify(filteredData.slice(0, 3))}`);
                result.sheets[sheetName] = {
                    rowCount: filteredData.length,
                    data: filteredData
                };
                if (filteredData.length === 0) {
                    this.logger.log(`Sheet "${sheetName}" contains no valid data. Skipping...`);
                    continue;
                }
                await this.processStockCountSheet(sheetName, filteredData, result, userId);
            }
            await this.prisma.activityLog.create({
                data: {
                    userId: userId,
                    action: 'XLSX_UPLOAD_PROCESSED',
                    details: `Processed XLSX file "${file.originalname}" with ${workbook.SheetNames.length} sheets. Created ${result.summary.warehousesCreated} warehouses and ${result.summary.productsCreated} products. ${result.summary.errors.length > 0 ? `Errors: ${result.summary.errors.length}` : 'All successful'}`,
                    ipAddress: null,
                    userAgent: null
                }
            });
            this.logger.log(`XLSX processing completed: ${result.summary.warehousesCreated} warehouses, ${result.summary.productsCreated} products created`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to process XLSX upload: ${error.message}`);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to process XLSX upload: ${error.message}`);
        }
    }
    async processStockCountSheet(sheetName, jsonData, result, userId) {
        var _a, _b, _c, _d, _e;
        try {
            this.logger.log(`Processing stock count sheet: ${sheetName}`);
            const warehouseName = sheetName.trim();
            const warehouseLocation = `Location for ${warehouseName}`;
            this.logger.log(`Creating warehouse: ${warehouseName} at ${warehouseLocation}`);
            let warehouse;
            try {
                warehouse = await this.prisma.warehouse.findFirst({
                    where: { name: warehouseName }
                });
                if (!warehouse) {
                    warehouse = await this.prisma.warehouse.create({
                        data: {
                            name: warehouseName,
                            location: warehouseLocation,
                            description: `Auto-created from stock count sheet: ${sheetName}`
                        }
                    });
                    result.warehouses.push(warehouse);
                    result.summary.warehousesCreated++;
                    this.logger.log(`Created new warehouse: ${warehouse.name} (${warehouse.id})`);
                }
                else {
                    this.logger.log(`Using existing warehouse: ${warehouse.name} (${warehouse.id})`);
                }
            }
            catch (error) {
                result.summary.errors.push(`Failed to create warehouse "${warehouseName}": ${error.message}`);
                return;
            }
            let headerRowIndex = -1;
            for (let i = 0; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (Array.isArray(row) && row.length >= 2) {
                    const firstCell = ((_a = row[0]) === null || _a === void 0 ? void 0 : _a.toString().toLowerCase()) || '';
                    const secondCell = ((_b = row[1]) === null || _b === void 0 ? void 0 : _b.toString().toLowerCase()) || '';
                    const thirdCell = ((_c = row[2]) === null || _c === void 0 ? void 0 : _c.toString().toLowerCase()) || '';
                    if (firstCell.includes('s/n') ||
                        secondCell.includes('name') || secondCell.includes('description') ||
                        thirdCell.includes('name') || thirdCell.includes('description') ||
                        firstCell.includes('no') || firstCell.includes('number')) {
                        headerRowIndex = i;
                        this.logger.log(`Found header row at index ${i}: [${row.slice(0, 5).join(', ')}...]`);
                        break;
                    }
                }
            }
            if (headerRowIndex === -1) {
                result.summary.errors.push(`No header row found in sheet "${sheetName}"`);
                return;
            }
            this.logger.log(`Found header row at index ${headerRowIndex}`);
            const headers = jsonData[headerRowIndex];
            this.logger.log(`Headers found: ${JSON.stringify(headers)}`);
            const nameIndex = this.findColumnIndex(headers, ['name /description of stock item(s)', 'name', 'description']);
            const unitIndex = this.findColumnIndex(headers, ['unit', 'measure']);
            const stockIndex = this.findColumnIndex(headers, ['stock take']);
            if (nameIndex === -1 || stockIndex === -1) {
                result.summary.errors.push(`Required columns not found in sheet "${sheetName}". Need "Name /Description of stock item(s)" and "Stock take" columns.`);
                return;
            }
            this.logger.log(`Column indices - Name: ${nameIndex}, Unit: ${unitIndex}, Stock: ${stockIndex}`);
            this.logger.log(`Processing sheet "${sheetName}" as warehouse "${warehouseName}"`);
            this.logger.log(`Total rows to process: ${jsonData.length - headerRowIndex - 1}`);
            if (jsonData.length > headerRowIndex + 1) {
                const sampleRow = jsonData[headerRowIndex + 1];
                this.logger.log(`Sample row data: Name="${sampleRow[nameIndex]}", Stock="${sampleRow[stockIndex]}"`);
                this.logger.log(`Full sample row: ${JSON.stringify(sampleRow)}`);
                for (let i = 1; i <= Math.min(3, jsonData.length - headerRowIndex - 1); i++) {
                    const row = jsonData[headerRowIndex + i];
                    this.logger.log(`Row ${i}: [${row.map((cell, idx) => `${idx}:"${cell}"`).join(', ')}]`);
                }
            }
            let processedCount = 0;
            let skippedCount = 0;
            for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!Array.isArray(row) || row.length <= Math.max(nameIndex, stockIndex)) {
                    this.logger.debug(`Row ${i + 1}: Skipped - insufficient data. Row length: ${row === null || row === void 0 ? void 0 : row.length}, Required: ${Math.max(nameIndex, stockIndex) + 1}`);
                    skippedCount++;
                    continue;
                }
                const productName = (_d = row[nameIndex]) === null || _d === void 0 ? void 0 : _d.toString().trim();
                const stockTakeRaw = row[stockIndex];
                let stockTake = 0;
                if (stockTakeRaw !== null && stockTakeRaw !== undefined && stockTakeRaw !== '') {
                    if (typeof stockTakeRaw === 'number') {
                        stockTake = Math.floor(Math.abs(stockTakeRaw));
                    }
                    else if (typeof stockTakeRaw === 'string') {
                        const cleanedStock = stockTakeRaw.replace(/[^\d.-]/g, '');
                        if (cleanedStock) {
                            const parsed = parseFloat(cleanedStock);
                            stockTake = isNaN(parsed) ? 0 : Math.floor(Math.abs(parsed));
                        }
                    }
                    else {
                        const stringValue = String(stockTakeRaw);
                        const cleanedStock = stringValue.replace(/[^\d.-]/g, '');
                        if (cleanedStock) {
                            const parsed = parseFloat(cleanedStock);
                            stockTake = isNaN(parsed) ? 0 : Math.floor(Math.abs(parsed));
                        }
                    }
                }
                const unit = unitIndex >= 0 ? (_e = row[unitIndex]) === null || _e === void 0 ? void 0 : _e.toString().trim() : 'Pcs';
                this.logger.log(`Row ${i + 1}: Name="${productName}", Stock Raw="${stockTakeRaw}" (type: ${typeof stockTakeRaw}), Parsed: ${stockTake}`);
                if (!productName || productName.length < 2) {
                    this.logger.debug(`Row ${i + 1}: Skipped - invalid product name. Name: "${productName}"`);
                    skippedCount++;
                    continue;
                }
                const finalStock = Math.max(0, stockTake);
                try {
                    const existingProduct = await this.prisma.product.findFirst({
                        where: {
                            name: productName,
                            warehouseId: warehouse.id
                        }
                    });
                    if (existingProduct) {
                        this.logger.debug(`Row ${i + 1}: Product "${productName}" already exists in warehouse ${warehouse.name}. Skipping.`);
                        skippedCount++;
                        continue;
                    }
                    const defaultCategory = await this.ensureDefaultCategory();
                    const productData = {
                        name: productName,
                        description: `${productName} - Imported from ${warehouseName}`,
                        price: 0,
                        categoryId: defaultCategory.id,
                        warehouseId: warehouse.id,
                        totalStock: finalStock,
                        availableStock: finalStock,
                        image: null
                    };
                    this.logger.log(`Creating product with data: ${JSON.stringify({
                        name: productData.name,
                        totalStock: productData.totalStock,
                        availableStock: productData.availableStock,
                        warehouseName: warehouseName
                    })}`);
                    const createdProduct = await this.prisma.product.create({
                        data: productData,
                        include: {
                            category: true,
                            warehouse: true
                        }
                    });
                    result.products.push(createdProduct);
                    result.summary.productsCreated++;
                    processedCount++;
                    this.logger.log(`Created product: ${createdProduct.name} with stock ${finalStock} in warehouse ${warehouse.name}`);
                }
                catch (error) {
                    result.summary.errors.push(`Row ${i + 1} in sheet "${sheetName}": Failed to create product "${productName}": ${error.message}`);
                    this.logger.error(`Failed to create product "${productName}": ${error.message}`);
                }
            }
            this.logger.log(`Sheet "${sheetName}" processing complete: ${processedCount} products created, ${skippedCount} rows skipped`);
        }
        catch (error) {
            result.summary.errors.push(`Failed to process sheet "${sheetName}": ${error.message}`);
            this.logger.error(`Failed to process sheet "${sheetName}": ${error.message}`);
        }
    }
    findColumnIndex(headers, searchTerms) {
        var _a;
        this.logger.log(`Looking for columns in headers: ${JSON.stringify(headers)}`);
        this.logger.log(`Search terms: ${JSON.stringify(searchTerms)}`);
        for (let i = 0; i < headers.length; i++) {
            const header = ((_a = headers[i]) === null || _a === void 0 ? void 0 : _a.toString().toLowerCase().trim()) || '';
            for (const term of searchTerms) {
                const searchTerm = term.toLowerCase().trim();
                if (searchTerm === 'stock take') {
                    if (header === 'stock take' || header === 'stocktake' || header.includes('stock take')) {
                        this.logger.log(`Found exact stock take match: "${header}" at index ${i}`);
                        return i;
                    }
                }
                else if (header.includes(searchTerm)) {
                    this.logger.log(`Found match: "${header}" contains "${searchTerm}" at index ${i}`);
                    return i;
                }
            }
        }
        this.logger.log(`No matching column found for terms: ${JSON.stringify(searchTerms)}`);
        return -1;
    }
    async ensureDefaultCategory() {
        let category = await this.prisma.category.findFirst({
            where: { name: 'Stock Count Items' }
        });
        if (!category) {
            category = await this.prisma.category.create({
                data: {
                    name: 'Stock Count Items',
                    description: 'Default category for items imported from stock count sheets'
                }
            });
            this.logger.log(`Created default category: ${category.name} (${category.id})`);
        }
        return category;
    }
    async processWarehouseSheet(jsonData, result, userId) {
        var _a, _b, _c;
        if (jsonData.length < 2) {
            result.summary.errors.push('Warehouse sheet must contain at least a header and one data row');
            return;
        }
        const headers = jsonData[0];
        this.logger.log(`Warehouse sheet headers: ${headers.join(', ')}`);
        const requiredHeaders = ['name', 'location'];
        const missingHeaders = requiredHeaders.filter(header => !headers.some(h => h && h.toLowerCase().includes(header.toLowerCase())));
        if (missingHeaders.length > 0) {
            result.summary.errors.push(`Warehouse sheet missing required headers: ${missingHeaders.join(', ')}`);
            return;
        }
        const nameIndex = headers.findIndex(h => h && h.toLowerCase().includes('name'));
        const locationIndex = headers.findIndex(h => h && h.toLowerCase().includes('location'));
        const descriptionIndex = headers.findIndex(h => h && h.toLowerCase().includes('description'));
        for (let i = 1; i < jsonData.length; i++) {
            try {
                const row = jsonData[i];
                if (!row || row.every(cell => !cell))
                    continue;
                const warehouseData = {
                    name: (_a = row[nameIndex]) === null || _a === void 0 ? void 0 : _a.toString().trim(),
                    location: (_b = row[locationIndex]) === null || _b === void 0 ? void 0 : _b.toString().trim(),
                    description: descriptionIndex >= 0 ? (_c = row[descriptionIndex]) === null || _c === void 0 ? void 0 : _c.toString().trim() : null
                };
                if (!warehouseData.name || !warehouseData.location) {
                    result.summary.errors.push(`Warehouse row ${i + 1}: Missing name or location`);
                    continue;
                }
                const createdWarehouse = await this.prisma.warehouse.create({
                    data: warehouseData
                });
                result.warehouses.push(createdWarehouse);
                result.summary.warehousesCreated++;
                this.logger.log(`Created warehouse: ${createdWarehouse.name} (${createdWarehouse.id})`);
            }
            catch (error) {
                result.summary.errors.push(`Warehouse row ${i + 1}: ${error.message}`);
                this.logger.error(`Failed to create warehouse from row ${i + 1}: ${error.message}`);
            }
        }
    }
    async processProductSheet(jsonData, result, userId) {
        var _a, _b, _c, _d, _e;
        if (jsonData.length < 2) {
            result.summary.errors.push('Product sheet must contain at least a header and one data row');
            return;
        }
        const headers = jsonData[0];
        this.logger.log(`Product sheet headers: ${headers.join(', ')}`);
        const requiredHeaders = ['name', 'description', 'price', 'categoryId', 'warehouseId', 'totalStock'];
        const headerMap = {};
        requiredHeaders.forEach(reqHeader => {
            const index = headers.findIndex(h => h && h.toLowerCase().includes(reqHeader.toLowerCase()));
            if (index >= 0) {
                headerMap[reqHeader] = index;
            }
        });
        const missingHeaders = requiredHeaders.filter(header => headerMap[header] === undefined);
        if (missingHeaders.length > 0) {
            result.summary.errors.push(`Product sheet missing required headers: ${missingHeaders.join(', ')}`);
            return;
        }
        const imageIndex = headers.findIndex(h => h && h.toLowerCase().includes('image'));
        for (let i = 1; i < jsonData.length; i++) {
            try {
                const row = jsonData[i];
                if (!row || row.every(cell => !cell))
                    continue;
                const productData = {
                    name: (_a = row[headerMap.name]) === null || _a === void 0 ? void 0 : _a.toString().trim(),
                    description: (_b = row[headerMap.description]) === null || _b === void 0 ? void 0 : _b.toString().trim(),
                    price: parseFloat(row[headerMap.price]),
                    categoryId: (_c = row[headerMap.categoryId]) === null || _c === void 0 ? void 0 : _c.toString().trim(),
                    warehouseId: (_d = row[headerMap.warehouseId]) === null || _d === void 0 ? void 0 : _d.toString().trim(),
                    totalStock: parseInt(row[headerMap.totalStock]),
                    availableStock: parseInt(row[headerMap.totalStock]),
                    image: imageIndex >= 0 ? (_e = row[imageIndex]) === null || _e === void 0 ? void 0 : _e.toString().trim() : null
                };
                if (!productData.name || !productData.description || isNaN(productData.price) ||
                    !productData.categoryId || !productData.warehouseId || isNaN(productData.totalStock)) {
                    result.summary.errors.push(`Product row ${i + 1}: Missing or invalid required fields`);
                    continue;
                }
                const category = await this.prisma.category.findUnique({ where: { id: productData.categoryId } });
                if (!category) {
                    result.summary.errors.push(`Product row ${i + 1}: Category with ID ${productData.categoryId} not found`);
                    continue;
                }
                const warehouse = await this.prisma.warehouse.findUnique({ where: { id: productData.warehouseId } });
                if (!warehouse) {
                    result.summary.errors.push(`Product row ${i + 1}: Warehouse with ID ${productData.warehouseId} not found`);
                    continue;
                }
                const createdProduct = await this.prisma.product.create({
                    data: productData,
                    include: {
                        category: true,
                        warehouse: true
                    }
                });
                result.products.push(createdProduct);
                result.summary.productsCreated++;
                this.logger.log(`Created product: ${createdProduct.name} (${createdProduct.id})`);
            }
            catch (error) {
                result.summary.errors.push(`Product row ${i + 1}: ${error.message}`);
                this.logger.error(`Failed to create product from row ${i + 1}: ${error.message}`);
            }
        }
    }
    async getWarehouseProducts(warehouseId, query, userId, userInfo) {
        try {
            this.logger.debug(`Fetching products from warehouse ${warehouseId} for user ${userId} with role ${userInfo === null || userInfo === void 0 ? void 0 : userInfo.role}`);
            const page = (query === null || query === void 0 ? void 0 : query.page) || 1;
            const size = Math.min((query === null || query === void 0 ? void 0 : query.size) || 25, 100);
            const search = query === null || query === void 0 ? void 0 : query.search;
            const category = query === null || query === void 0 ? void 0 : query.category;
            const warehouse = await this.prisma.warehouse.findUnique({
                where: { id: warehouseId },
                select: { id: true, name: true, location: true, isActive: true }
            });
            if (!warehouse) {
                throw new common_1.NotFoundException(`Warehouse with ID ${warehouseId} not found`);
            }
            if (userId && (userInfo === null || userInfo === void 0 ? void 0 : userInfo.role) === 'WarehouseKeeper') {
                const user = await this.prisma.user.findUnique({
                    where: { id: userId },
                    select: {
                        managedWarehouses: {
                            select: { id: true }
                        }
                    }
                });
                if (!user) {
                    throw new common_1.BadRequestException(`User with ID ${userId} not found`);
                }
                const managedWarehouseIds = user.managedWarehouses.map(w => w.id);
                if (!managedWarehouseIds.includes(warehouseId)) {
                    throw new common_1.BadRequestException(`Access denied. WarehouseKeeper ${userId} does not manage warehouse ${warehouseId}`);
                }
                this.logger.debug(`WarehouseKeeper ${userId} has access to warehouse ${warehouseId}`);
            }
            const whereClause = {
                warehouseId: warehouseId
            };
            if (search) {
                whereClause.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (category) {
                whereClause.category = {
                    name: { contains: category, mode: 'insensitive' }
                };
            }
            const [products, total] = await Promise.all([
                this.prisma.product.findMany({
                    where: whereClause,
                    include: {
                        category: {
                            select: { id: true, name: true, description: true }
                        },
                        warehouse: {
                            select: { id: true, name: true, location: true }
                        },
                        _count: {
                            select: {
                                assignments: true
                            }
                        }
                    },
                    orderBy: { name: 'asc' },
                    skip: (page - 1) * size,
                    take: size
                }),
                this.prisma.product.count({
                    where: whereClause
                })
            ]);
            const totalPages = Math.ceil(total / size);
            const stockStats = products.reduce((acc, product) => {
                acc.totalStock += product.totalStock;
                acc.availableStock += product.availableStock;
                acc.assignedStock += (product.totalStock - product.availableStock);
                return acc;
            }, { totalStock: 0, availableStock: 0, assignedStock: 0 });
            this.logger.log(`Retrieved ${products.length} products from warehouse ${warehouse.name}`);
            return {
                data: products,
                warehouse: warehouse,
                pagination: {
                    page,
                    size,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrevious: page > 1
                },
                summary: {
                    totalProducts: total,
                    productsOnPage: products.length,
                    stockStats,
                    outOfStockProducts: products.filter(p => p.availableStock === 0).length,
                    lowStockProducts: products.filter(p => p.availableStock > 0 && p.availableStock <= 10).length
                },
                filters: {
                    search: search || null,
                    category: category || null
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch products from warehouse ${warehouseId}: ${error.message}`);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to fetch warehouse products: ${error.message}`);
        }
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = ProductService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, cloudinary_service_1.CloudinaryService])
], ProductService);
//# sourceMappingURL=product.service.js.map