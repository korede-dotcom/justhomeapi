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
var ShopService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ShopService = ShopService_1 = class ShopService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ShopService_1.name);
    }
    async create(data) {
        try {
            this.logger.debug(`Creating shop: ${JSON.stringify(data)}`);
            const validData = {
                name: data.name,
                location: data.location,
                description: data.description,
                managerId: data.managerId,
                isActive: data.isActive !== undefined ? data.isActive : true
            };
            Object.keys(validData).forEach(key => {
                if (validData[key] === undefined) {
                    delete validData[key];
                }
            });
            this.logger.debug(`Filtered shop data: ${JSON.stringify(validData)}`);
            return this.prisma.shop.create({
                data: validData,
                include: {
                    manager: {
                        select: { id: true, username: true, fullName: true, role: true }
                    },
                    users: {
                        select: { id: true, username: true, fullName: true, role: true }
                    }
                }
            });
        }
        catch (error) {
            this.logger.error(`Failed to create shop: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to create shop: ${error.message}`);
        }
    }
    async findAll() {
        return this.prisma.shop.findMany({
            include: {
                manager: {
                    select: { id: true, username: true, fullName: true, role: true }
                },
                users: {
                    select: { id: true, username: true, fullName: true, role: true }
                },
                productAssignments: {
                    include: {
                        product: {
                            include: { category: true }
                        }
                    }
                },
                _count: {
                    select: { users: true, productAssignments: true }
                }
            }
        });
    }
    async findOne(id) {
        const shop = await this.prisma.shop.findUnique({
            where: { id },
            include: {
                manager: {
                    select: { id: true, username: true, fullName: true, role: true }
                },
                users: {
                    select: { id: true, username: true, fullName: true, role: true }
                },
                productAssignments: {
                    include: {
                        product: {
                            include: { category: true }
                        }
                    }
                }
            }
        });
        if (!shop)
            throw new common_1.NotFoundException('Shop not found');
        return shop;
    }
    async update(id, data) {
        return this.prisma.shop.update({ where: { id }, data });
    }
    async remove(id) {
        return this.prisma.shop.delete({ where: { id } });
    }
    async getShopReport(shopId) {
        var _a, _b;
        const shop = await this.prisma.shop.findUnique({
            where: { id: shopId },
            include: {
                users: true,
                productAssignments: {
                    include: {
                        product: {
                            include: { category: true }
                        }
                    }
                }
            }
        });
        if (!shop)
            throw new common_1.NotFoundException('Shop not found');
        return {
            shop,
            totalUsers: ((_a = shop.users) === null || _a === void 0 ? void 0 : _a.length) || 0,
            totalProductAssignments: ((_b = shop.productAssignments) === null || _b === void 0 ? void 0 : _b.length) || 0
        };
    }
};
exports.ShopService = ShopService;
exports.ShopService = ShopService = ShopService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShopService);
//# sourceMappingURL=shop.service.js.map