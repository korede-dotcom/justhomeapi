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
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const order_service_1 = require("./order.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const common_2 = require("@nestjs/common");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let OrderController = class OrderController {
    constructor(orderService) {
        this.orderService = orderService;
        this.logger = new common_2.Logger(order_service_1.OrderService.name);
    }
    findAll(req, page, size, search, status, paymentStatus, startDate, endDate, shopId) {
        var _a, _b;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || req.user;
        this.logger.log(`Fetching orders for user: ${userId}`);
        const parsedPage = Math.max(1, parseInt(page || '1', 10) || 1);
        const parsedSize = Math.min(100, Math.max(1, parseInt(size || '20', 10) || 20));
        let parsedStartDate;
        let parsedEndDate;
        if (startDate) {
            parsedStartDate = new Date(startDate);
            if (isNaN(parsedStartDate.getTime())) {
                throw new Error('Invalid startDate format. Use ISO 8601 format (YYYY-MM-DD)');
            }
        }
        if (endDate) {
            parsedEndDate = new Date(endDate);
            if (isNaN(parsedEndDate.getTime())) {
                throw new Error('Invalid endDate format. Use ISO 8601 format (YYYY-MM-DD)');
            }
            parsedEndDate.setHours(23, 59, 59, 999);
        }
        const trimmedSearch = (search || '').trim();
        const trimmedStatus = (status || '').trim();
        const trimmedPaymentStatus = (paymentStatus || '').trim();
        const trimmedShopId = (shopId || '').trim();
        return this.orderService.getOrdersForUserWithPagination(userId, parsedPage, parsedSize, trimmedSearch || undefined, trimmedStatus || undefined, trimmedPaymentStatus || undefined, parsedStartDate, parsedEndDate, trimmedShopId || undefined);
    }
    findAllForStoreKeeper(req) {
        var _a, _b;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || req.user;
        this.logger.log(`Storekeeper orders for user: ${userId}`);
        return this.orderService.getOrdersForUser(userId);
    }
    create(data) {
        return this.orderService.create(data);
    }
    update(id, data) {
        return this.orderService.update(id, data);
    }
    updatePayment(id, data) {
        return this.orderService.updatePayment(id, data);
    }
    recordPayment(id, paymentData, req) {
        var _a, _b;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || req.user;
        this.logger.log(`Recording payment for order ${id} by user ${userId}`);
        return this.orderService.recordPayment(id, paymentData, userId);
    }
    getPaymentStatus(id) {
        return this.orderService.getPaymentStatus(id);
    }
    getPaymentHistory(id) {
        return this.orderService.getPaymentHistory(id);
    }
    updatePackager(id, data) {
        return this.orderService.updatePackager(id, data);
    }
    updateReleaseItem(id, data, req, user) {
        return this.orderService.updateRelease(id, data, user.userId);
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('size')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('paymentStatus')),
    __param(6, (0, common_1.Query)('startDate')),
    __param(7, (0, common_1.Query)('endDate')),
    __param(8, (0, common_1.Query)('shopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("storekeeper"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "findAllForStoreKeeper", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)("payment/:id"),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "updatePayment", null);
__decorate([
    (0, common_1.Patch)(':id/payment'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Get)(':id/payment-status'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "getPaymentStatus", null);
__decorate([
    (0, common_1.Get)(':id/payments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "getPaymentHistory", null);
__decorate([
    (0, common_1.Patch)("packager/:id"),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "updatePackager", null);
__decorate([
    (0, common_1.Post)("store/release/:id"),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], OrderController.prototype, "updateReleaseItem", null);
exports.OrderController = OrderController = __decorate([
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], OrderController);
//# sourceMappingURL=order.controller.js.map