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
    async findAllPackager() {
        return this.prisma.user.findMany({
            where: { role: 'Packager' },
            select: {
                id: true,
                fullName: true,
                username: true,
                email: true,
                role: true,
            },
        });
    }
    async create(data) {
        this.logger.log(`Creating user: ${data.email}`);
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            this.logger.warn(`User with email ${data.email} already exists.`);
            throw new common_1.BadRequestException('User with this email already exists.');
        }
        const passwordToHash = data.password || 'fileopen';
        if (!data.password) {
            this.logger.warn(`No password provided for ${data.email}, using default password.`);
        }
        data.password = await bcrypt.hash(passwordToHash, 10);
        const user = await this.prisma.user.create({ data });
        this.logger.log(`User created: ${user.id}`);
        return user;
    }
    update(id, data) {
        return this.prisma.user.update({ where: { id }, data });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map