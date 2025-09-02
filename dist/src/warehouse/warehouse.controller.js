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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseController = void 0;
const common_1 = require("@nestjs/common");
const warehouse_service_1 = require("./warehouse.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const warehouse_products_dto_1 = require("./dto/warehouse-products.dto");
let WarehouseController = class WarehouseController {
    constructor(warehouseService) {
        this.warehouseService = warehouseService;
    }
    create(data) {
        return this.warehouseService.create(data);
    }
    findAll() {
        return this.warehouseService.findAll();
    }
    async getDashboardStats(req) {
        var _a, _b, _c, _d;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || req.user;
        const userInfo = {
            role: (_c = req.user) === null || _c === void 0 ? void 0 : _c.role,
            shopId: (_d = req.user) === null || _d === void 0 ? void 0 : _d.shopId
        };
        return this.warehouseService.getDashboardStats(userId, userInfo);
    }
    findOne(id) {
        return this.warehouseService.findOne(id);
    }
    update(id, data) {
        return this.warehouseService.update(id, data);
    }
    remove(id) {
        return this.warehouseService.remove(id);
    }
    assignProduct(data) {
        return this.warehouseService.assignProductToShop(data);
    }
    getReport(id) {
        return this.warehouseService.getWarehouseReport(id);
    }
    getShopProducts(shopId) {
        return this.warehouseService.getProductsAssignedToShop(shopId);
    }
    getAllProductsForNonAdmins(req, query) {
        var _a, _b;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || req.user;
        return this.warehouseService.getAllProductsForNonAdmins(userId, query);
    }
    getWarehouseProducts(warehouseId, query) {
        return this.warehouseService.getWarehouseProducts(warehouseId, query);
    }
    getWarehouseProduct(warehouseId, productId, query) {
        return this.warehouseService.getWarehouseProduct(warehouseId, productId, query);
    }
    updateShopInventory(data, req) {
        var _a, _b;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || req.user;
        return this.warehouseService.updateShopInventory(Object.assign(Object.assign({}, data), { userId }));
    }
};
exports.WarehouseController = WarehouseController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('CEO', 'Admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WarehouseController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'WarehouseKeeper', 'Storekeeper', 'Attendee', 'Receptionist', 'Packager'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WarehouseController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'WarehouseKeeper', 'Storekeeper', 'Attendee', 'Receptionist', 'Packager'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'WarehouseKeeper'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WarehouseController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WarehouseController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WarehouseController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('assign-product'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'WarehouseKeeper'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WarehouseController.prototype, "assignProduct", null);
__decorate([
    (0, common_1.Get)(':id/report'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WarehouseController.prototype, "getReport", null);
__decorate([
    (0, common_1.Get)('shop/:shopId/products'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'Storekeeper', 'Attendee', 'Receptionist', 'Packager'),
    __param(0, (0, common_1.Param)('shopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WarehouseController.prototype, "getShopProducts", null);
__decorate([
    (0, common_1.Get)('products'),
    (0, roles_decorator_1.Roles)('WarehouseKeeper', 'Storekeeper', 'Attendee', 'Receptionist', 'Packager'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, warehouse_products_dto_1.WarehouseProductsQueryDto]),
    __metadata("design:returntype", void 0)
], WarehouseController.prototype, "getAllProductsForNonAdmins", null);
__decorate([
    (0, common_1.Get)(':warehouseId/products'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'WarehouseKeeper', 'Storekeeper', 'Attendee', 'Receptionist', 'Packager'),
    __param(0, (0, common_1.Param)('warehouseId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, warehouse_products_dto_1.WarehouseProductsQueryDto]),
    __metadata("design:returntype", void 0)
], WarehouseController.prototype, "getWarehouseProducts", null);
__decorate([
    (0, common_1.Get)(':warehouseId/products/:productId'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'WarehouseKeeper', 'Storekeeper', 'Attendee', 'Receptionist', 'Packager'),
    __param(0, (0, common_1.Param)('warehouseId')),
    __param(1, (0, common_1.Param)('productId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, warehouse_products_dto_1.SingleWarehouseProductQueryDto]),
    __metadata("design:returntype", void 0)
], WarehouseController.prototype, "getWarehouseProduct", null);
__decorate([
    (0, common_1.Post)('update-shop-inventory'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'Storekeeper', 'Attendee'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WarehouseController.prototype, "updateShopInventory", null);
exports.WarehouseController = WarehouseController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('warehouses'),
    __metadata("design:paramtypes", [warehouse_service_1.WarehouseService])
], WarehouseController);
//# sourceMappingURL=warehouse.controller.js.map