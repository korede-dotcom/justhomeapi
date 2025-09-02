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
    async findAll(query, requestingUserId, requestingUserInfo) {
        var _a, _b, _c, _d;
        const page = (query === null || query === void 0 ? void 0 : query.page) || 1;
        const size = Math.min((query === null || query === void 0 ? void 0 : query.size) || 20, 100);
        const search = query === null || query === void 0 ? void 0 : query.search;
        const role = query === null || query === void 0 ? void 0 : query.role;
        const shopId = query === null || query === void 0 ? void 0 : query.shopId;
        const warehouseId = query === null || query === void 0 ? void 0 : query.warehouseId;
        const isActive = query === null || query === void 0 ? void 0 : query.isActive;
        const fetchAll = (query === null || query === void 0 ? void 0 : query.all) || false;
        try {
            let requestingUser = null;
            if (requestingUserId) {
                if ((requestingUserInfo === null || requestingUserInfo === void 0 ? void 0 : requestingUserInfo.role) && (requestingUserInfo === null || requestingUserInfo === void 0 ? void 0 : requestingUserInfo.shopId) !== undefined) {
                    requestingUser = {
                        id: requestingUserId,
                        role: requestingUserInfo.role,
                        shopId: requestingUserInfo.shopId,
                        shop: null,
                        warehouse: null
                    };
                    this.logger.debug(`Using JWT token info for user ${requestingUserId}: role=${requestingUserInfo.role}, shopId=${requestingUserInfo.shopId}`);
                }
                else {
                    requestingUser = await this.prisma.user.findUnique({
                        where: { id: requestingUserId },
                        select: {
                            id: true,
                            role: true,
                            shopId: true,
                            warehouseId: true,
                            shop: { select: { name: true } },
                            warehouse: { select: { name: true } }
                        }
                    });
                    if (!requestingUser) {
                        throw new common_1.BadRequestException('Requesting user not found');
                    }
                    this.logger.debug(`Using database lookup for user ${requestingUserId}: role=${requestingUser.role}, shopId=${requestingUser.shopId}`);
                }
            }
            const whereClause = {};
            if (requestingUser) {
                const { role: userRole, shopId: userShopId } = requestingUser;
                this.logger.debug(`Applying access control for user ${requestingUserId}: role=${userRole}, shopId=${userShopId}`);
                if (!['CEO', 'Admin', 'WarehouseKeeper'].includes(userRole)) {
                    if (userShopId) {
                        whereClause.shopId = userShopId;
                        this.logger.debug(`Non-admin user ${requestingUserId} restricted to shop: ${userShopId}`);
                    }
                    else {
                        whereClause.id = requestingUserId;
                        this.logger.debug(`User ${requestingUserId} has no shop assignment, can only see themselves`);
                    }
                }
                else {
                    this.logger.debug(`Admin/CEO/WarehouseKeeper user ${requestingUserId} can access all users`);
                }
            }
            if (role) {
                whereClause.role = role;
            }
            if (shopId && requestingUser && ['CEO', 'Admin', 'WarehouseKeeper'].includes(requestingUser.role)) {
                whereClause.shopId = shopId;
            }
            if (warehouseId && requestingUser && ['CEO', 'Admin', 'WarehouseKeeper'].includes(requestingUser.role)) {
                whereClause.warehouseId = warehouseId;
            }
            if (isActive !== undefined) {
                whereClause.isActive = isActive;
            }
            if (search) {
                whereClause.OR = [
                    { username: { contains: search, mode: 'insensitive' } },
                    { fullName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
                ];
            }
            const [users, totalUsers] = await Promise.all([
                this.prisma.user.findMany(Object.assign({ where: whereClause, select: {
                        id: true,
                        username: true,
                        email: true,
                        fullName: true,
                        role: true,
                        isActive: true,
                        createdAt: true,
                        lastLogin: true,
                        shopId: true,
                        warehouseId: true,
                        shop: {
                            select: { id: true, name: true, location: true, isActive: true }
                        },
                        warehouse: {
                            select: { id: true, name: true, location: true, isActive: true }
                        }
                    }, orderBy: { createdAt: 'desc' } }, (fetchAll ? {} : {
                    skip: (page - 1) * size,
                    take: size
                }))),
                this.prisma.user.count({
                    where: whereClause
                })
            ]);
            if (fetchAll) {
                return {
                    users,
                    summary: {
                        totalUsers,
                        activeUsers: users.filter(u => u.isActive).length,
                        inactiveUsers: users.filter(u => !u.isActive).length,
                        roles: [...new Set(users.map(u => u.role))].length,
                        usersWithShops: users.filter(u => u.shopId).length,
                        usersWithWarehouses: users.filter(u => u.warehouseId).length
                    },
                    accessInfo: {
                        requestingUserRole: (requestingUser === null || requestingUser === void 0 ? void 0 : requestingUser.role) || 'Unknown',
                        requestingUserShop: ((_a = requestingUser === null || requestingUser === void 0 ? void 0 : requestingUser.shop) === null || _a === void 0 ? void 0 : _a.name) || null,
                        requestingUserWarehouse: ((_b = requestingUser === null || requestingUser === void 0 ? void 0 : requestingUser.warehouse) === null || _b === void 0 ? void 0 : _b.name) || null,
                        hasFullAccess: requestingUser ? ['CEO', 'Admin', 'WarehouseKeeper'].includes(requestingUser.role) : false,
                        scopeRestriction: requestingUser && !['CEO', 'Admin', 'WarehouseKeeper'].includes(requestingUser.role)
                            ? (requestingUser.shopId ? 'shop' : 'self')
                            : 'none'
                    },
                    filters: {
                        search: search || null,
                        role: role || null,
                        shopId: requestingUser && ['CEO', 'Admin', 'WarehouseKeeper'].includes(requestingUser.role) ? (shopId || null) : ((requestingUser === null || requestingUser === void 0 ? void 0 : requestingUser.shopId) || null),
                        warehouseId: requestingUser && ['CEO', 'Admin', 'WarehouseKeeper'].includes(requestingUser.role) ? (warehouseId || null) : null,
                        isActive: isActive !== undefined ? isActive : null
                    }
                };
            }
            const totalPages = Math.ceil(totalUsers / size);
            return {
                data: users,
                page,
                size,
                total: totalUsers,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1,
                summary: {
                    totalUsers,
                    activeUsers: users.filter(u => u.isActive).length,
                    inactiveUsers: users.filter(u => !u.isActive).length,
                    roles: [...new Set(users.map(u => u.role))].length,
                    usersWithShops: users.filter(u => u.shopId).length,
                    usersWithWarehouses: users.filter(u => u.warehouseId).length
                },
                accessInfo: {
                    requestingUserRole: (requestingUser === null || requestingUser === void 0 ? void 0 : requestingUser.role) || 'Unknown',
                    requestingUserShop: ((_c = requestingUser === null || requestingUser === void 0 ? void 0 : requestingUser.shop) === null || _c === void 0 ? void 0 : _c.name) || null,
                    requestingUserWarehouse: ((_d = requestingUser === null || requestingUser === void 0 ? void 0 : requestingUser.warehouse) === null || _d === void 0 ? void 0 : _d.name) || null,
                    hasFullAccess: requestingUser ? ['CEO', 'Admin', 'WarehouseKeeper'].includes(requestingUser.role) : false,
                    scopeRestriction: requestingUser && !['CEO', 'Admin', 'WarehouseKeeper'].includes(requestingUser.role)
                        ? (requestingUser.shopId ? 'shop' : 'self')
                        : 'none'
                },
                filters: {
                    search: search || null,
                    role: role || null,
                    shopId: requestingUser && ['CEO', 'Admin', 'WarehouseKeeper'].includes(requestingUser.role) ? (shopId || null) : ((requestingUser === null || requestingUser === void 0 ? void 0 : requestingUser.shopId) || null),
                    warehouseId: requestingUser && ['CEO', 'Admin', 'WarehouseKeeper'].includes(requestingUser.role) ? (warehouseId || null) : null,
                    isActive: isActive !== undefined ? isActive : null
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch users: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to fetch users: ${error.message}`);
        }
    }
    async findAllPackager(userId, query) {
        var _a, _b;
        const page = (query === null || query === void 0 ? void 0 : query.page) || 1;
        const size = Math.min((query === null || query === void 0 ? void 0 : query.size) || 20, 100);
        const search = query === null || query === void 0 ? void 0 : query.search;
        const shopIdFilter = query === null || query === void 0 ? void 0 : query.shopId;
        const isActive = query === null || query === void 0 ? void 0 : query.isActive;
        const fetchAll = (query === null || query === void 0 ? void 0 : query.all) || false;
        try {
            const baseWhereClause = Object.assign({ role: 'Packager' }, (isActive !== undefined && { isActive }));
            if (search) {
                baseWhereClause.OR = [
                    { username: { contains: search, mode: 'insensitive' } },
                    { fullName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (!userId) {
                const whereClause = Object.assign(Object.assign({}, baseWhereClause), (shopIdFilter && { shopId: shopIdFilter }));
                if (fetchAll) {
                    const packagers = await this.prisma.user.findMany({
                        where: whereClause,
                        select: {
                            id: true,
                            fullName: true,
                            username: true,
                            email: true,
                            role: true,
                            isActive: true,
                            shopId: true,
                            shop: { select: { id: true, name: true, location: true, isActive: true } }
                        },
                        orderBy: { fullName: 'asc' }
                    });
                    return {
                        packagers,
                        summary: {
                            totalPackagers: packagers.length,
                            activePackagers: packagers.filter(p => p.isActive).length,
                            inactivePackagers: packagers.filter(p => !p.isActive).length,
                            packagersWithShops: packagers.filter(p => p.shopId).length
                        }
                    };
                }
                const [packagers, total] = await Promise.all([
                    this.prisma.user.findMany({
                        where: whereClause,
                        select: {
                            id: true,
                            fullName: true,
                            username: true,
                            email: true,
                            role: true,
                            isActive: true,
                            shopId: true,
                            shop: { select: { id: true, name: true, location: true, isActive: true } }
                        },
                        orderBy: { fullName: 'asc' },
                        skip: (page - 1) * size,
                        take: size
                    }),
                    this.prisma.user.count({ where: whereClause })
                ]);
                const totalPages = Math.ceil(total / size);
                return {
                    data: packagers,
                    page,
                    size,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrevious: page > 1,
                    summary: {
                        totalPackagers: total,
                        activePackagers: packagers.filter(p => p.isActive).length,
                        inactivePackagers: packagers.filter(p => !p.isActive).length,
                        packagersWithShops: packagers.filter(p => p.shopId).length
                    }
                };
            }
            const requestingUser = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { role: true, shopId: true, shop: { select: { name: true } } }
            });
            if (!requestingUser) {
                throw new common_1.BadRequestException('User not found');
            }
            this.logger.debug(`Fetching packagers for user role: ${requestingUser.role}, shopId: ${requestingUser.shopId}`);
            let finalShopFilter = shopIdFilter;
            if (requestingUser.role === 'Admin' || requestingUser.role === 'CEO') {
                this.logger.debug('Admin/CEO user - can access all packagers');
            }
            else {
                if (!requestingUser.shopId) {
                    this.logger.warn(`User ${userId} has no shop assignment`);
                    return fetchAll ? { packagers: [], summary: { totalPackagers: 0, activePackagers: 0, inactivePackagers: 0, packagersWithShops: 0 } } : { data: [], page, size, total: 0, totalPages: 0, hasNext: false, hasPrevious: false, summary: { totalPackagers: 0, activePackagers: 0, inactivePackagers: 0, packagersWithShops: 0 } };
                }
                finalShopFilter = requestingUser.shopId;
                this.logger.debug(`Non-admin user - restricting to shop: ${requestingUser.shopId}`);
            }
            const whereClause = Object.assign(Object.assign({}, baseWhereClause), (finalShopFilter && { shopId: finalShopFilter }));
            if (fetchAll) {
                const packagers = await this.prisma.user.findMany({
                    where: whereClause,
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        email: true,
                        role: true,
                        isActive: true,
                        shopId: true,
                        shop: { select: { id: true, name: true, location: true, isActive: true } }
                    },
                    orderBy: { fullName: 'asc' }
                });
                return {
                    packagers,
                    summary: {
                        totalPackagers: packagers.length,
                        activePackagers: packagers.filter(p => p.isActive).length,
                        inactivePackagers: packagers.filter(p => !p.isActive).length,
                        packagersWithShops: packagers.filter(p => p.shopId).length
                    },
                    requestingUserShop: ((_a = requestingUser.shop) === null || _a === void 0 ? void 0 : _a.name) || null
                };
            }
            const [packagers, total] = await Promise.all([
                this.prisma.user.findMany({
                    where: whereClause,
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        email: true,
                        role: true,
                        isActive: true,
                        shopId: true,
                        shop: { select: { id: true, name: true, location: true, isActive: true } }
                    },
                    orderBy: { fullName: 'asc' },
                    skip: (page - 1) * size,
                    take: size
                }),
                this.prisma.user.count({ where: whereClause })
            ]);
            const totalPages = Math.ceil(total / size);
            return {
                data: packagers,
                page,
                size,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1,
                summary: {
                    totalPackagers: total,
                    activePackagers: packagers.filter(p => p.isActive).length,
                    inactivePackagers: packagers.filter(p => !p.isActive).length,
                    packagersWithShops: packagers.filter(p => p.shopId).length
                },
                requestingUserShop: ((_b = requestingUser.shop) === null || _b === void 0 ? void 0 : _b.name) || null,
                filters: {
                    search: search || null,
                    shopId: finalShopFilter || null,
                    isActive: isActive !== undefined ? isActive : null
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch packagers: ${error.message}`);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to fetch packagers: ${error.message}`);
        }
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