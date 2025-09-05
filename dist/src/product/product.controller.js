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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ProductController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const product_service_1 = require("./product.service");
const roles_decorator_1 = require("../auth/roles.decorator");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
let ProductController = ProductController_1 = class ProductController {
    constructor(productService) {
        this.productService = productService;
        this.logger = new common_1.Logger(ProductController_1.name);
    }
    async findAll(req, page, size, search, warehouseId) {
        var _a, _b, _c;
        this.logger.debug(`Controller received user data: ${JSON.stringify(req.user)}`);
        let userId;
        if (typeof req.user === 'string') {
            userId = req.user;
        }
        else if ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) {
            userId = req.user.userId;
        }
        else if ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) {
            userId = req.user.id;
        }
        else if ((_c = req.user) === null || _c === void 0 ? void 0 : _c.sub) {
            userId = req.user.sub;
        }
        else {
            this.logger.error('No user ID found in request');
            throw new Error('Authentication failed - no user ID');
        }
        this.logger.debug(`Extracted user ID: ${userId}`);
        if (!userId || typeof userId !== 'string') {
            this.logger.error(`Invalid user ID format: ${typeof userId}`);
            throw new Error('Authentication failed - invalid user ID format');
        }
        const parsedPage = Math.max(1, parseInt(page || '1', 10) || 1);
        const parsedSize = Math.min(100, Math.max(1, parseInt(size || '20', 10) || 20));
        const trimmedSearch = (search || '').trim();
        const trimmedWarehouseId = (warehouseId || '').trim();
        return this.productService.findAllByUserId(userId, parsedPage, parsedSize, trimmedSearch || undefined, trimmedWarehouseId || undefined);
    }
    async createCategory(data) {
        try {
            return await this.productService.createCategory(data);
        }
        catch (error) {
            this.logger.error('Error creating category:', error);
            throw new Error('Failed to create category');
        }
    }
    async getCategories() {
        return this.productService.findAllCategories();
    }
    async getWarehouseProducts(warehouseId, req, page, size, search, category) {
        var _a, _b, _c;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || req.user;
        const userRole = (_c = req.user) === null || _c === void 0 ? void 0 : _c.role;
        const parsedPage = Math.max(1, parseInt(page || '1', 10) || 1);
        const parsedSize = Math.min(100, Math.max(1, parseInt(size || '25', 10) || 25));
        return this.productService.getWarehouseProducts(warehouseId, {
            page: parsedPage,
            size: parsedSize,
            search: search === null || search === void 0 ? void 0 : search.trim(),
            category: category === null || category === void 0 ? void 0 : category.trim()
        }, userId, { role: userRole });
    }
    async uploadImage(file, body) {
        return this.productService.uploadForUrl(body, file);
    }
    create(data) {
        return this.productService.create(data);
    }
    update(id, data) {
        return this.productService.update(id, data);
    }
    async uploadCSV(file, warehouseId) {
        return this.productService.uploadCSV(file, warehouseId);
    }
    async bulkUpload(file, req) {
        var _a, _b;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || req.user;
        this.logger.log(`Bulk upload initiated by user: ${userId}`);
        return this.productService.bulkUploadProducts(file, userId);
    }
    async uploadXlsx(file, req) {
        var _a, _b;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || req.user;
        this.logger.log(`XLSX upload initiated by user: ${userId}`);
        return this.productService.uploadAndReadXlsx(file, userId);
    }
};
exports.ProductController = ProductController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'WarehouseKeeper', 'Storekeeper', 'Attendee', 'Receptionist', 'Packager'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('size')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('warehouseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('/category'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('/category'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'WarehouseKeeper', 'Storekeeper', 'Attendee', 'Receptionist', 'Packager'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('warehouse/:warehouseId'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'WarehouseKeeper'),
    __param(0, (0, common_1.Param)('warehouseId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('size')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getWarehouseProducts", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'WarehouseKeeper'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'WarehouseKeeper'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'WarehouseKeeper'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('upload-csv'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'WarehouseKeeper'),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('warehouseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "uploadCSV", null);
__decorate([
    (0, common_1.Post)('bulk-upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'WarehouseKeeper'),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "bulkUpload", null);
__decorate([
    (0, common_1.Post)('upload-xlsx'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'WarehouseKeeper'),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "uploadXlsx", null);
exports.ProductController = ProductController = ProductController_1 = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [product_service_1.ProductService])
], ProductController);
//# sourceMappingURL=product.controller.js.map