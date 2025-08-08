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
var UserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = require("bcrypt");
let UserService = UserService_1 = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UserService_1.name);
    }
    findAll() {
        return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async findAllPackager(userId) {
        if (!userId) {
            return this.prisma.user.findMany({
                where: { role: 'Packager' },
                select: {
                    id: true,
                    fullName: true,
                    username: true,
                    email: true,
                    role: true,
                    shopId: true,
                    shop: { select: { name: true, location: true } }
                },
            });
        }
        const requestingUser = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, shopId: true }
        });
        if (!requestingUser) {
            throw new common_1.BadRequestException('User not found');
        }
        this.logger.debug(`Fetching packagers for user role: ${requestingUser.role}, shopId: ${requestingUser.shopId}`);
        if (requestingUser.role === 'Admin' || requestingUser.role === 'CEO') {
            this.logger.debug('Admin/CEO user - returning all packagers');
            return this.prisma.user.findMany({
                where: { role: 'Packager' },
                select: {
                    id: true,
                    fullName: true,
                    username: true,
                    email: true,
                    role: true,
                    shopId: true,
                    shop: { select: { name: true, location: true } }
                },
                orderBy: { fullName: 'asc' }
            });
        }
        if (!requestingUser.shopId) {
            this.logger.warn(`User ${userId} has no shop assignment`);
            return [];
        }
        this.logger.debug(`Returning packagers for shop: ${requestingUser.shopId}`);
        return this.prisma.user.findMany({
            where: {
                role: 'Packager',
                shopId: requestingUser.shopId
            },
            select: {
                id: true,
                fullName: true,
                username: true,
                email: true,
                role: true,
                shopId: true,
                shop: { select: { name: true, location: true } }
            },
            orderBy: { fullName: 'asc' }
        });
    }
    async createUser(data) {
        var _a, _b;
        const { role, shopId, warehouseId, password } = data, userData = __rest(data, ["role", "shopId", "warehouseId", "password"]);
        if (['Storekeeper', 'Receptionist', 'Packager', 'Attendee'].includes(role)) {
            if (!shopId) {
                throw new common_1.BadRequestException('Shop ID is required for this role');
            }
        }
        if (role === 'WarehouseKeeper') {
            if (!warehouseId) {
                throw new common_1.BadRequestException('Warehouse ID is required for WarehouseKeeper role');
            }
        }
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }
        else {
            const defaultPassword = `${userData.username}123`;
            hashedPassword = await bcrypt.hash(defaultPassword, 10);
            this.logger.log(`Generated default password for user ${userData.username}: ${defaultPassword}`);
        }
        const payload = Object.assign(Object.assign(Object.assign(Object.assign({}, userData), { password: hashedPassword, role }), (shopId && { shopId })), (warehouseId && { warehouseId }));
        try {
            const createdUser = await this.prisma.user.create({
                data: payload,
                include: {
                    shop: true,
                    warehouse: true
                }
            });
            this.logger.log(`User created successfully: ${createdUser.username} (${createdUser.role})`);
            const { password: _ } = createdUser, userWithoutPassword = __rest(createdUser, ["password"]);
            return userWithoutPassword;
        }
        catch (error) {
            this.logger.error(`Failed to create user: ${error.message}`);
            if (error.code === 'P2002') {
                const field = (_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b[0];
                throw new common_1.BadRequestException(`${field} already exists`);
            }
            throw new common_1.BadRequestException(`Failed to create user: ${error.message}`);
        }
    }
    update(id, data) {
        return this.prisma.user.update({ where: { id }, data });
    }
    async getActivityLogs(limit = 50, userId) {
        const where = userId ? { userId } : {};
        return this.prisma.activityLog.findMany({
            where,
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
            orderBy: { timestamp: 'desc' },
            take: limit
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map