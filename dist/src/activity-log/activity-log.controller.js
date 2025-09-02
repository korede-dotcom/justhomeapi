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
exports.ActivityLogController = void 0;
const common_1 = require("@nestjs/common");
const activity_log_service_1 = require("./activity-log.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let ActivityLogController = class ActivityLogController {
    constructor(activityLogService) {
        this.activityLogService = activityLogService;
    }
    findAll(query) {
        return this.activityLogService.findAll(query);
    }
    create(data, req, user) {
        return this.activityLogService.create(data);
    }
};
exports.ActivityLogController = ActivityLogController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.ActivityLogPaginationDto]),
    __metadata("design:returntype", void 0)
], ActivityLogController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], ActivityLogController.prototype, "create", null);
exports.ActivityLogController = ActivityLogController = __decorate([
    (0, common_1.Controller)('activity-logs'),
    __metadata("design:paramtypes", [activity_log_service_1.ActivityLogService])
], ActivityLogController);
//# sourceMappingURL=activity-log.controller.js.map