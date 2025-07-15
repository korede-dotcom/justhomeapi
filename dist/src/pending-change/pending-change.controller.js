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
exports.PendingChangeController = void 0;
const common_1 = require("@nestjs/common");
const pending_change_service_1 = require("./pending-change.service");
let PendingChangeController = class PendingChangeController {
    constructor(pendingChangeService) {
        this.pendingChangeService = pendingChangeService;
    }
    findAll() {
        return this.pendingChangeService.findAll();
    }
    create(data) {
        return this.pendingChangeService.create(data);
    }
    approve(id) {
        return this.pendingChangeService.updateStatus(id, 'approved');
    }
    reject(id) {
        return this.pendingChangeService.updateStatus(id, 'rejected');
    }
};
exports.PendingChangeController = PendingChangeController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PendingChangeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PendingChangeController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PendingChangeController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PendingChangeController.prototype, "reject", null);
exports.PendingChangeController = PendingChangeController = __decorate([
    (0, common_1.Controller)('pending-changes'),
    __metadata("design:paramtypes", [pending_change_service_1.PendingChangeService])
], PendingChangeController);
//# sourceMappingURL=pending-change.controller.js.map