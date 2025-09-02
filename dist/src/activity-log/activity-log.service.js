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
var ActivityLogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const common_2 = require("@nestjs/common");
let ActivityLogService = ActivityLogService_1 = class ActivityLogService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_2.Logger(ActivityLogService_1.name);
    }
    async findAll(query) {
        const page = (query === null || query === void 0 ? void 0 : query.page) || 1;
        const size = (query === null || query === void 0 ? void 0 : query.size) || (query === null || query === void 0 ? void 0 : query.limit) || 20;
        const pageSize = Math.min(size, 100);
        const userId = query === null || query === void 0 ? void 0 : query.userId;
        const search = query === null || query === void 0 ? void 0 : query.search;
        const whereClause = {};
        if (userId) {
            whereClause.userId = userId;
        }
        if (search) {
            whereClause.OR = [
                { action: { contains: search, mode: 'insensitive' } },
                { details: { contains: search, mode: 'insensitive' } },
                { user: {
                        OR: [
                            { username: { contains: search, mode: 'insensitive' } },
                            { fullName: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } }
                        ]
                    }
                }
            ];
        }
        const [activityLogs, total] = await Promise.all([
            this.prisma.activityLog.findMany({
                where: whereClause,
                orderBy: { timestamp: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                            email: true,
                            role: true
                        }
                    }
                },
                skip: (page - 1) * pageSize,
                take: pageSize
            }),
            this.prisma.activityLog.count({
                where: whereClause
            })
        ]);
        const totalPages = Math.ceil(total / pageSize);
        return {
            data: activityLogs,
            page,
            size: pageSize,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1,
            filters: {
                userId: userId || null,
                search: search || null
            }
        };
    }
    async create(data) {
        this.logger.log(`Creating activity log entry: ${JSON.stringify(data)}`);
        if (!data.action) {
            this.logger.warn('No action provided for activity log entry.', JSON.stringify(data));
            throw new common_1.BadRequestException('Action is required for activity log entry.');
        }
        data.timestamp = new Date();
        try {
            this.logger.log(`Creating activity log entry: ${data.action}`);
            return await this.prisma.activityLog.create({ data });
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.error('Failed to create activity log', err.stack || err.message);
            throw new common_1.BadRequestException('Failed to create activity log');
        }
    }
    update(id, data) {
        return this.prisma.activityLog.update({ where: { id }, data });
    }
};
exports.ActivityLogService = ActivityLogService;
exports.ActivityLogService = ActivityLogService = ActivityLogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivityLogService);
//# sourceMappingURL=activity-log.service.js.map