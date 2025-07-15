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
    async findAll() {
        this.logger.log('Fetching all products with categories using raw SQL');
        try {
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
    `;
        }
        catch (error) {
            this.logger.error(`Failed to fetch products: ${error.message || 'Unknown error'}`);
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
            const { totalStock } = data, rest = __rest(data, ["totalStock"]);
            const numericStock = Number(totalStock);
            if (isNaN(numericStock)) {
                throw new Error('Invalid totalStock value');
            }
            const payload = Object.assign(Object.assign({}, rest), { totalStock: numericStock, availableStock: numericStock });
            return await this.prisma.product.create({ data: payload });
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
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = ProductService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, cloudinary_service_1.CloudinaryService])
], ProductService);
//# sourceMappingURL=product.service.js.map