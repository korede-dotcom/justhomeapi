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
exports.ProductAssignmentRequestController = void 0;
const common_1 = require("@nestjs/common");
const product_assignment_request_service_1 = require("./product-assignment-request.service");
const product_assignment_request_dto_1 = require("../user/dto/product-assignment-request.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
let ProductAssignmentRequestController = class ProductAssignmentRequestController {
    constructor(requestService) {
        this.requestService = requestService;
    }
    createRequest(createRequestDto, req) {
        var _a, _b;
        const requestedBy = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || req.user;
        return this.requestService.createRequest(createRequestDto, requestedBy);
    }
    getPendingRequests(query) {
        return this.requestService.getPendingRequests(query);
    }
    approveRequest(requestId, reviewDto, req) {
        var _a, _b;
        const reviewedBy = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || req.user;
        return this.requestService.approveRequest(requestId, reviewedBy, reviewDto.reviewNotes);
    }
    rejectRequest(requestId, reviewDto, req) {
        var _a, _b;
        const reviewedBy = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || req.user;
        return this.requestService.rejectRequest(requestId, reviewedBy, reviewDto.reviewNotes);
    }
    getMyRequests(req, query) {
        var _a, _b;
        const requestedBy = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || req.user;
        return this.requestService.getPendingRequests(Object.assign(Object.assign({}, query), { requestedBy }));
    }
};
exports.ProductAssignmentRequestController = ProductAssignmentRequestController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('WarehouseKeeper'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_assignment_request_dto_1.CreateProductAssignmentRequestDto, Object]),
    __metadata("design:returntype", void 0)
], ProductAssignmentRequestController.prototype, "createRequest", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_assignment_request_dto_1.ProductAssignmentRequestQueryDto]),
    __metadata("design:returntype", void 0)
], ProductAssignmentRequestController.prototype, "getPendingRequests", null);
__decorate([
    (0, common_1.Post)(':requestId/approve'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_assignment_request_dto_1.ReviewProductAssignmentRequestDto, Object]),
    __metadata("design:returntype", void 0)
], ProductAssignmentRequestController.prototype, "approveRequest", null);
__decorate([
    (0, common_1.Post)(':requestId/reject'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_assignment_request_dto_1.ReviewProductAssignmentRequestDto, Object]),
    __metadata("design:returntype", void 0)
], ProductAssignmentRequestController.prototype, "rejectRequest", null);
__decorate([
    (0, common_1.Get)('my-requests'),
    (0, roles_decorator_1.Roles)('WarehouseKeeper'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, product_assignment_request_dto_1.ProductAssignmentRequestQueryDto]),
    __metadata("design:returntype", void 0)
], ProductAssignmentRequestController.prototype, "getMyRequests", null);
exports.ProductAssignmentRequestController = ProductAssignmentRequestController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('product-assignment-requests'),
    __metadata("design:paramtypes", [product_assignment_request_service_1.ProductAssignmentRequestService])
], ProductAssignmentRequestController);
//# sourceMappingURL=product-assignment-request.controller.js.map