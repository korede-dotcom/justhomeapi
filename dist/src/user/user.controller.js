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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const user_pagination_dto_1 = require("./dto/user-pagination.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    debugToken(req) {
        var _a, _b, _c, _d;
        return {
            rawUser: req.user,
            extractedUserId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || req.user,
            extractedRole: (_c = req.user) === null || _c === void 0 ? void 0 : _c.role,
            extractedShopId: (_d = req.user) === null || _d === void 0 ? void 0 : _d.shopId,
            message: 'JWT token debug information'
        };
    }
    getAll(query, req) {
        var _a, _b, _c, _d;
        const requestingUserId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || req.user;
        const requestingUserInfo = {
            role: (_c = req.user) === null || _c === void 0 ? void 0 : _c.role,
            shopId: (_d = req.user) === null || _d === void 0 ? void 0 : _d.shopId
        };
        console.log('JWT User Object:', JSON.stringify(req.user, null, 2));
        console.log('Extracted User ID:', requestingUserId);
        console.log('Extracted User Info:', requestingUserInfo);
        return this.userService.findAll(query, requestingUserId, requestingUserInfo);
    }
    getAllPackager(req, query) {
        var _a, _b;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || req.user;
        return this.userService.findAllPackager(userId, query);
    }
    create(data) {
        return this.userService.createUser(data);
    }
    update(id, data) {
        return this.userService.update(id, data);
    }
    getAllActivityLogs(limit, userId) {
        const limitNum = limit ? parseInt(limit) : 50;
        return this.userService.getActivityLogs(limitNum, userId);
    }
    getUserActivityLogs(userId, limit) {
        const limitNum = limit ? parseInt(limit) : 50;
        return this.userService.getActivityLogs(limitNum, userId);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)('debug-token'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "debugToken", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_pagination_dto_1.UserPaginationDto, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)("/packager"),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_pagination_dto_1.UserPaginationDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getAllPackager", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('activity-logs'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getAllActivityLogs", null);
__decorate([
    (0, common_1.Get)(':id/activity-logs'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getUserActivityLogs", null);
exports.UserController = UserController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map