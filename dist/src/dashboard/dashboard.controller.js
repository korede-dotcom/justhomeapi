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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    getUserDashboard() {
        return this.dashboardService.getUserDashboard();
    }
    getActivityDashboard() {
        return this.dashboardService.getActivityDashboard();
    }
    getWarehouseDashboard() {
        return this.dashboardService.getWarehouseDashboard();
    }
    getShopDashboard() {
        return this.dashboardService.getShopDashboard();
    }
    getProductDashboard() {
        return this.dashboardService.getProductDashboard();
    }
    getOrderDashboard() {
        return this.dashboardService.getOrderDashboard();
    }
    getProductAssignmentDashboard() {
        return this.dashboardService.getProductAssignmentDashboard();
    }
    getCompleteDashboard() {
        return this.dashboardService.getCompleteDashboard();
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('users'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getUserDashboard", null);
__decorate([
    (0, common_1.Get)('activities'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getActivityDashboard", null);
__decorate([
    (0, common_1.Get)('warehouses'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'WarehouseKeeper'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getWarehouseDashboard", null);
__decorate([
    (0, common_1.Get)('shops'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'Storekeeper', 'Attendee', 'Receptionist', 'Packager'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getShopDashboard", null);
__decorate([
    (0, common_1.Get)('products'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'WarehouseKeeper', 'Storekeeper'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getProductDashboard", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'Storekeeper', 'Attendee', 'Receptionist', 'Packager'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getOrderDashboard", null);
__decorate([
    (0, common_1.Get)('assignments'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin', 'WarehouseKeeper', 'Storekeeper'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getProductAssignmentDashboard", null);
__decorate([
    (0, common_1.Get)('complete'),
    (0, roles_decorator_1.Roles)('CEO', 'Admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getCompleteDashboard", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map