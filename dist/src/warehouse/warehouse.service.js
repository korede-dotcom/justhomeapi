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
var WarehouseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let WarehouseService = WarehouseService_1 = class WarehouseService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(WarehouseService_1.name);
    }
    async create(data) {
        try {
            this.logger.debug(`Creating warehouse: ${JSON.stringify(data)}`);
            const validData = {
                name: data.name,
                location: data.location,
                description: data.description,
                isActive: data.isActive !== undefined ? data.isActive : true
            };
            if (data.managerId && data.managerId !== "none" && data.managerId.trim() !== "") {
                validData.managerId = data.managerId;
            }
            Object.keys(validData).forEach(key => {
                if (validData[key] === undefined) {
                    delete validData[key];
                }
            });
            this.logger.debug(`Filtered warehouse data: ${JSON.stringify(validData)}`);
            if (validData.managerId) {
                const manager = await this.prisma.user.findUnique({
                    where: { id: validData.managerId }
                });
                if (!manager) {
                    this.logger.error(`Manager with ID ${validData.managerId} not found`);
                    throw new common_1.BadRequestException(`Manager with ID ${validData.managerId} not found`);
                }
                this.logger.debug(`Manager found: ${manager.username} (${manager.role})`);
            }
            const warehouse = await this.prisma.warehouse.create({
                data: validData,
                include: {
                    manager: {
                        select: { id: true, username: true, fullName: true, role: true }
                    }
                }
            });
            this.logger.debug(`Warehouse created successfully: ${warehouse.id}`);
            return warehouse;
        }
        catch (error) {
            this.logger.error(`Failed to create warehouse: ${error.message}`);
            this.logger.error(`Error details: ${JSON.stringify(error)}`);
            if (error.code === 'P2002') {
                throw new common_1.BadRequestException('A warehouse with this name already exists');
            }
            else if (error.code === 'P2003') {
                throw new common_1.BadRequestException('Invalid manager ID provided');
            }
            else if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            else {
                throw new common_1.BadRequestException(`Failed to create warehouse: ${error.message}`);
            }
        }
    }
    async findAll(userId, userInfo) {
        this.logger.debug(`Fetching warehouses for user ${userId} with role ${userInfo === null || userInfo === void 0 ? void 0 : userInfo.role}`);
        try {
            let whereClause = {};
            if (userId && (userInfo === null || userInfo === void 0 ? void 0 : userInfo.role)) {
                const isGlobalUser = ['CEO', 'Admin'].includes(userInfo.role);
                if (!isGlobalUser && userInfo.role === 'WarehouseKeeper') {
                    this.logger.debug(`Filtering warehouses for WarehouseKeeper ${userId}`);
                    const user = await this.prisma.user.findUnique({
                        where: { id: userId },
                        select: {
                            managedWarehouses: {
                                select: { id: true }
                            }
                        }
                    });
                    if (!user) {
                        throw new common_1.BadRequestException(`User with ID ${userId} not found`);
                    }
                    const managedWarehouseIds = user.managedWarehouses.map(w => w.id);
                    if (managedWarehouseIds.length === 0) {
                        this.logger.warn(`WarehouseKeeper ${userId} has no managed warehouses`);
                        return [];
                    }
                    whereClause = {
                        id: { in: managedWarehouseIds }
                    };
                    this.logger.debug(`WarehouseKeeper ${userId} can access ${managedWarehouseIds.length} warehouses: ${managedWarehouseIds.join(', ')}`);
                }
                else if (!isGlobalUser) {
                    if (userInfo.shopId) {
                        const shopAssignments = await this.prisma.productAssignment.findMany({
                            where: { shopId: userInfo.shopId },
                            select: { warehouseId: true },
                            distinct: ['warehouseId']
                        });
                        const accessibleWarehouseIds = shopAssignments.map(a => a.warehouseId);
                        if (accessibleWarehouseIds.length === 0) {
                            this.logger.warn(`User ${userId} from shop ${userInfo.shopId} has no accessible warehouses`);
                            return [];
                        }
                        whereClause = {
                            id: { in: accessibleWarehouseIds }
                        };
                        this.logger.debug(`Shop user ${userId} can access ${accessibleWarehouseIds.length} warehouses through product assignments`);
                    }
                    else {
                        this.logger.warn(`Non-admin user ${userId} has no shop assignment`);
                        return [];
                    }
                }
                else {
                    this.logger.debug(`Admin/CEO user ${userId} can access all warehouses`);
                }
            }
            return this.prisma.warehouse.findMany({
                where: whereClause,
                include: {
                    manager: {
                        select: { id: true, username: true, fullName: true, role: true, email: true }
                    },
                    users: {
                        select: { id: true, username: true, fullName: true, role: true, email: true }
                    },
                    products: {
                        include: {
                            category: {
                                select: { id: true, name: true, description: true }
                            }
                        }
                    },
                    productAssignments: {
                        include: {
                            product: {
                                select: { id: true, name: true, price: true }
                            },
                            shop: {
                                select: { id: true, name: true, location: true }
                            },
                            assignedByUser: {
                                select: { id: true, username: true, fullName: true }
                            }
                        }
                    },
                    _count: {
                        select: {
                            products: true,
                            users: true,
                            productAssignments: true
                        }
                    }
                },
                orderBy: {
                    name: 'asc'
                }
            });
        }
        catch (error) {
            this.logger.error(`Failed to fetch warehouses for user ${userId}: ${error.message}`);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to fetch warehouses: ${error.message}`);
        }
    }
    async findOne(id) {
        const warehouse = await this.prisma.warehouse.findUnique({
            where: { id },
            include: {
                manager: {
                    select: { id: true, username: true, fullName: true, role: true, email: true }
                },
                users: {
                    select: { id: true, username: true, fullName: true, role: true, email: true }
                },
                products: {
                    include: {
                        category: {
                            select: { id: true, name: true, description: true }
                        }
                    },
                    orderBy: {
                        name: 'asc'
                    }
                },
                productAssignments: {
                    include: {
                        product: {
                            select: { id: true, name: true, price: true, totalStock: true, availableStock: true }
                        },
                        shop: {
                            select: { id: true, name: true, location: true, isActive: true }
                        },
                        assignedByUser: {
                            select: { id: true, username: true, fullName: true, role: true }
                        }
                    },
                    orderBy: {
                        assignedAt: 'desc'
                    }
                },
                _count: {
                    select: {
                        products: true,
                        users: true,
                        productAssignments: true
                    }
                }
            }
        });
        if (!warehouse)
            throw new common_1.NotFoundException('Warehouse not found');
        return warehouse;
    }
    async update(id, data) {
        return this.prisma.warehouse.update({ where: { id }, data });
    }
    async remove(id) {
        return this.prisma.warehouse.delete({ where: { id } });
    }
    async assignProductToShop(data) {
        try {
            this.logger.debug(`Assigning product to shop: ${JSON.stringify(data)}`);
            const existingAssignment = await this.prisma.productAssignment.findFirst({
                where: {
                    productId: data.productId,
                    shopId: data.shopId
                },
                include: {
                    product: { select: { id: true, name: true, price: true } },
                    shop: { select: { id: true, name: true, location: true } },
                    warehouse: { select: { id: true, name: true, location: true } }
                }
            });
            const product = await this.prisma.product.findUnique({
                where: { id: data.productId },
                select: {
                    id: true,
                    name: true,
                    availableStock: true,
                    warehouseId: true,
                    warehouse: { select: { name: true } }
                }
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product with ID ${data.productId} not found`);
            }
            if (product.availableStock < data.quantity) {
                throw new common_1.BadRequestException(`Insufficient warehouse stock. Available: ${product.availableStock}, Requested: ${data.quantity}`);
            }
            let assignment;
            let activityAction;
            let activityDetails;
            if (existingAssignment) {
                const previousQuantity = existingAssignment.quantity;
                const previousAvailable = existingAssignment.availableQuantity;
                assignment = await this.prisma.productAssignment.update({
                    where: { id: existingAssignment.id },
                    data: {
                        quantity: { increment: data.quantity },
                        availableQuantity: { increment: data.quantity },
                        warehouseId: data.warehouseId,
                        assignedBy: data.assignedBy,
                        assignedAt: new Date()
                    },
                    include: {
                        product: { select: { id: true, name: true, price: true } },
                        shop: { select: { id: true, name: true, location: true } },
                        warehouse: { select: { id: true, name: true, location: true } },
                        assignedByUser: { select: { id: true, username: true, fullName: true } }
                    }
                });
                activityAction = 'PRODUCT_RESTOCK';
                activityDetails = `Restocked ${data.quantity} units of "${product.name}" to "${assignment.shop.name}" shop. Previous: ${previousQuantity} (${previousAvailable} available), New: ${assignment.quantity} (${assignment.availableQuantity} available). From warehouse: ${assignment.warehouse.name}`;
                this.logger.debug(`Product restocked: ${assignment.id}, added ${data.quantity} units`);
            }
            else {
                const assignmentData = {
                    productId: data.productId,
                    shopId: data.shopId,
                    warehouseId: data.warehouseId,
                    assignedBy: data.assignedBy,
                    quantity: data.quantity,
                    availableQuantity: data.quantity,
                    soldQuantity: 0
                };
                assignment = await this.prisma.productAssignment.create({
                    data: assignmentData,
                    include: {
                        product: { select: { id: true, name: true, price: true } },
                        shop: { select: { id: true, name: true, location: true } },
                        warehouse: { select: { id: true, name: true, location: true } },
                        assignedByUser: { select: { id: true, username: true, fullName: true } }
                    }
                });
                activityAction = 'PRODUCT_ASSIGNMENT';
                activityDetails = `Assigned ${data.quantity} units of "${product.name}" to "${assignment.shop.name}" shop from warehouse: ${assignment.warehouse.name}`;
                this.logger.debug(`New product assignment created: ${assignment.id}`);
            }
            await this.prisma.product.update({
                where: { id: data.productId },
                data: {
                    availableStock: { decrement: data.quantity }
                }
            });
            await this.prisma.activityLog.create({
                data: {
                    userId: data.assignedBy,
                    action: activityAction,
                    details: activityDetails,
                    ipAddress: null,
                    userAgent: null
                }
            });
            this.logger.debug(`Warehouse stock decremented by ${data.quantity} for product ${product.name}`);
            return Object.assign(Object.assign({}, assignment), { isRestock: !!existingAssignment, warehouseStockAfter: product.availableStock - data.quantity, message: existingAssignment
                    ? `Successfully restocked ${data.quantity} units`
                    : `Successfully assigned ${data.quantity} units` });
        }
        catch (error) {
            this.logger.error(`Failed to assign product to shop: ${error.message}`);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to assign product to shop: ${error.message}`);
        }
    }
    async getWarehouseReport(warehouseId) {
        var _a, _b, _c;
        const warehouse = await this.prisma.warehouse.findUnique({
            where: { id: warehouseId },
            include: {
                products: {
                    include: { category: true }
                },
                productAssignments: {
                    include: {
                        product: true,
                        shop: true
                    }
                },
                users: true
            }
        });
        if (!warehouse)
            throw new common_1.NotFoundException('Warehouse not found');
        return {
            warehouse,
            totalProducts: ((_a = warehouse.products) === null || _a === void 0 ? void 0 : _a.length) || 0,
            totalAssignments: ((_b = warehouse.productAssignments) === null || _b === void 0 ? void 0 : _b.length) || 0,
            totalUsers: ((_c = warehouse.users) === null || _c === void 0 ? void 0 : _c.length) || 0
        };
    }
    async getProductsAssignedToShop(shopId) {
        try {
            this.logger.debug(`Getting products assigned to shop: ${shopId}`);
            const shop = await this.prisma.shop.findUnique({
                where: { id: shopId },
                select: { id: true, name: true, location: true, isActive: true }
            });
            if (!shop) {
                throw new common_1.NotFoundException(`Shop with ID ${shopId} not found`);
            }
            const assignments = await this.prisma.productAssignment.findMany({
                where: { shopId },
                include: {
                    product: {
                        include: {
                            category: {
                                select: { id: true, name: true, description: true }
                            }
                        }
                    },
                    warehouse: {
                        select: { id: true, name: true, location: true }
                    },
                    assignedByUser: {
                        select: { id: true, username: true, fullName: true, role: true }
                    }
                },
                orderBy: {
                    assignedAt: 'desc'
                }
            });
            return {
                shop,
                totalAssignments: assignments.length,
                assignments: assignments.map(assignment => ({
                    id: assignment.id,
                    quantity: assignment.quantity,
                    assignedAt: assignment.assignedAt,
                    product: {
                        id: assignment.product.id,
                        name: assignment.product.name,
                        description: assignment.product.description,
                        price: assignment.product.price,
                        totalStock: assignment.product.totalStock,
                        availableStock: assignment.product.availableStock,
                        image: assignment.product.image,
                        category: assignment.product.category
                    },
                    warehouse: assignment.warehouse,
                    assignedBy: assignment.assignedByUser
                }))
            };
        }
        catch (error) {
            this.logger.error(`Failed to get products for shop ${shopId}: ${error.message}`);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to get shop products: ${error.message}`);
        }
    }
    async getAllProductsForNonAdmins(userId, query) {
        var _a;
        this.logger.debug(`Fetching products for non-admin user: ${userId}`);
        const page = (query === null || query === void 0 ? void 0 : query.page) || 1;
        const size = Math.min((query === null || query === void 0 ? void 0 : query.size) || 20, 100);
        const search = query === null || query === void 0 ? void 0 : query.search;
        const warehouseId = query === null || query === void 0 ? void 0 : query.warehouseId;
        const category = query === null || query === void 0 ? void 0 : query.category;
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    role: true,
                    shopId: true,
                    shop: {
                        select: { id: true, name: true, location: true }
                    }
                }
            });
            if (!user) {
                this.logger.error(`User with ID ${userId} not found`);
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            if (!user.shopId) {
                this.logger.warn(`User ${userId} has no shop assignment`);
                return {
                    data: [],
                    page,
                    size,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrevious: false
                };
            }
            this.logger.debug(`Fetching products for shop: ${(_a = user.shop) === null || _a === void 0 ? void 0 : _a.name} (${user.shopId})`);
            const whereClause = Object.assign(Object.assign(Object.assign({ shopId: user.shopId }, (warehouseId && { warehouseId })), (search && {
                product: {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                        { category: { name: { contains: search, mode: 'insensitive' } } }
                    ]
                }
            })), (category && {
                product: {
                    category: { name: { contains: category, mode: 'insensitive' } }
                }
            }));
            const [productAssignments, total] = await Promise.all([
                this.prisma.productAssignment.findMany({
                    where: whereClause,
                    include: {
                        product: {
                            include: {
                                category: true,
                                warehouse: {
                                    select: { id: true, name: true, location: true }
                                }
                            }
                        },
                        warehouse: {
                            select: { id: true, name: true, location: true }
                        }
                    },
                    orderBy: [
                        { product: { name: 'asc' } },
                        { assignedAt: 'desc' }
                    ],
                    skip: (page - 1) * size,
                    take: size
                }),
                this.prisma.productAssignment.count({
                    where: whereClause
                })
            ]);
            this.logger.debug(`Found ${productAssignments.length} product assignments out of ${total} total for shop ${user.shopId}`);
            const transformedData = productAssignments.map(assignment => {
                var _a, _b, _c, _d, _e;
                return ({
                    id: assignment.product.id,
                    name: assignment.product.name,
                    description: assignment.product.description,
                    price: assignment.product.price,
                    image: assignment.product.image,
                    totalStock: assignment.product.totalStock,
                    availableStock: assignment.product.availableStock,
                    category: assignment.product.category.name,
                    assignedQuantity: assignment.quantity,
                    shopAvailableQuantity: assignment.availableQuantity,
                    shopSoldQuantity: assignment.soldQuantity,
                    assignedAt: assignment.assignedAt,
                    assignmentWarehouse: {
                        id: ((_a = assignment.warehouse) === null || _a === void 0 ? void 0 : _a.id) || '',
                        name: ((_b = assignment.warehouse) === null || _b === void 0 ? void 0 : _b.name) || 'Unknown Warehouse',
                        location: ((_c = assignment.warehouse) === null || _c === void 0 ? void 0 : _c.location) || 'Unknown Location'
                    },
                    productWarehouse: {
                        id: assignment.product.warehouseId,
                        name: ((_d = assignment.product.warehouse) === null || _d === void 0 ? void 0 : _d.name) || 'Unknown Warehouse',
                        location: ((_e = assignment.product.warehouse) === null || _e === void 0 ? void 0 : _e.location) || 'Unknown Location'
                    }
                });
            });
            const totalPages = Math.ceil(total / size);
            return {
                data: transformedData,
                page,
                size,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1,
                filters: {
                    search: search || null,
                    warehouseId: warehouseId || null,
                    category: category || null
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch products for user ${userId}: ${error.message}`);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to fetch products: ${error.message}`);
        }
    }
    async getWarehouseProducts(warehouseId, query, userId, userInfo) {
        this.logger.debug(`Fetching products from warehouse ${warehouseId} for user ${userId} with role ${userInfo === null || userInfo === void 0 ? void 0 : userInfo.role}`);
        const page = (query === null || query === void 0 ? void 0 : query.page) || 1;
        const size = Math.min((query === null || query === void 0 ? void 0 : query.size) || 20, 100);
        const search = query === null || query === void 0 ? void 0 : query.search;
        const category = query === null || query === void 0 ? void 0 : query.category;
        const fetchAll = (query === null || query === void 0 ? void 0 : query.all) || false;
        try {
            const warehouse = await this.prisma.warehouse.findUnique({
                where: { id: warehouseId },
                select: { id: true, name: true, location: true, isActive: true }
            });
            if (!warehouse) {
                throw new common_1.NotFoundException(`Warehouse with ID ${warehouseId} not found`);
            }
            if (userId && (userInfo === null || userInfo === void 0 ? void 0 : userInfo.role) === 'WarehouseKeeper') {
                const user = await this.prisma.user.findUnique({
                    where: { id: userId },
                    select: {
                        managedWarehouses: {
                            select: { id: true }
                        }
                    }
                });
                if (!user) {
                    throw new common_1.BadRequestException(`User with ID ${userId} not found`);
                }
                const managedWarehouseIds = user.managedWarehouses.map(w => w.id);
                if (!managedWarehouseIds.includes(warehouseId)) {
                    throw new common_1.BadRequestException(`Access denied. WarehouseKeeper ${userId} does not manage warehouse ${warehouseId}`);
                }
                this.logger.debug(`WarehouseKeeper ${userId} has access to warehouse ${warehouseId}`);
            }
            const whereClause = Object.assign(Object.assign({ warehouseId: warehouseId }, (search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { category: { name: { contains: search, mode: 'insensitive' } } }
                ]
            })), (category && {
                category: { name: { contains: category, mode: 'insensitive' } }
            }));
            const [products, totalProducts] = await Promise.all([
                this.prisma.product.findMany(Object.assign({ where: whereClause, include: {
                        category: {
                            select: { id: true, name: true, description: true }
                        },
                        assignments: {
                            include: {
                                shop: {
                                    select: { id: true, name: true, location: true, isActive: true }
                                }
                            }
                        },
                        _count: {
                            select: {
                                assignments: true
                            }
                        }
                    }, orderBy: [
                        { name: 'asc' },
                        { createdAt: 'desc' }
                    ] }, (fetchAll ? {} : {
                    skip: (page - 1) * size,
                    take: size
                }))),
                this.prisma.product.count({
                    where: whereClause
                })
            ]);
            const totalPages = fetchAll ? 1 : Math.ceil(totalProducts / size);
            const transformedProducts = products.map(product => ({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                image: product.image,
                totalStock: product.totalStock,
                availableStock: product.availableStock,
                createdAt: product.createdAt,
                category: product.category,
                assignmentSummary: {
                    totalAssignments: product._count.assignments,
                    totalQuantityAssigned: product.assignments.reduce((sum, a) => sum + a.quantity, 0),
                    totalQuantityAvailable: product.assignments.reduce((sum, a) => sum + a.availableQuantity, 0),
                    totalQuantitySold: product.assignments.reduce((sum, a) => sum + a.soldQuantity, 0),
                    assignedShops: product.assignments.length
                },
                recentAssignments: product.assignments
                    .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime())
                    .slice(0, 3)
                    .map(assignment => ({
                    id: assignment.id,
                    quantity: assignment.quantity,
                    availableQuantity: assignment.availableQuantity,
                    soldQuantity: assignment.soldQuantity,
                    assignedAt: assignment.assignedAt,
                    shop: assignment.shop
                }))
            }));
            if (fetchAll) {
                return {
                    warehouse,
                    products: transformedProducts,
                    summary: {
                        totalProducts,
                        totalStock: products.reduce((sum, p) => sum + p.totalStock, 0),
                        totalAvailableStock: products.reduce((sum, p) => sum + p.availableStock, 0),
                        totalAssignments: products.reduce((sum, p) => sum + p._count.assignments, 0),
                        categories: [...new Set(products.map(p => p.category.name))].length
                    },
                    filters: {
                        search: search || null,
                        category: category || null
                    }
                };
            }
            return {
                warehouse,
                products: {
                    data: transformedProducts,
                    page,
                    size,
                    total: totalProducts,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrevious: page > 1
                },
                summary: {
                    totalProducts,
                    totalStock: products.reduce((sum, p) => sum + p.totalStock, 0),
                    totalAvailableStock: products.reduce((sum, p) => sum + p.availableStock, 0),
                    totalAssignments: products.reduce((sum, p) => sum + p._count.assignments, 0),
                    categories: [...new Set(products.map(p => p.category.name))].length
                },
                filters: {
                    search: search || null,
                    category: category || null
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to get warehouse products ${warehouseId}: ${error.message}`);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to get warehouse products: ${error.message}`);
        }
    }
    async getWarehouseProduct(warehouseId, productId, query) {
        this.logger.debug(`Fetching product ${productId} from warehouse ${warehouseId}`);
        const page = (query === null || query === void 0 ? void 0 : query.page) || 1;
        const size = Math.min((query === null || query === void 0 ? void 0 : query.size) || 20, 100);
        const search = query === null || query === void 0 ? void 0 : query.search;
        try {
            const warehouse = await this.prisma.warehouse.findUnique({
                where: { id: warehouseId },
                select: { id: true, name: true, location: true, isActive: true }
            });
            if (!warehouse) {
                throw new common_1.NotFoundException(`Warehouse with ID ${warehouseId} not found`);
            }
            const product = await this.prisma.product.findFirst({
                where: {
                    id: productId,
                    warehouseId: warehouseId
                },
                include: {
                    category: {
                        select: { id: true, name: true, description: true }
                    },
                    warehouse: {
                        select: { id: true, name: true, location: true }
                    }
                }
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product with ID ${productId} not found in warehouse ${warehouseId}`);
            }
            const whereClause = Object.assign({ productId: productId, warehouseId: warehouseId }, (search && {
                shop: {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { location: { contains: search, mode: 'insensitive' } }
                    ]
                }
            }));
            const [assignments, totalAssignments] = await Promise.all([
                this.prisma.productAssignment.findMany({
                    where: whereClause,
                    include: {
                        shop: {
                            select: { id: true, name: true, location: true, isActive: true }
                        },
                        assignedByUser: {
                            select: { id: true, username: true, fullName: true, role: true }
                        }
                    },
                    orderBy: {
                        assignedAt: 'desc'
                    },
                    skip: (page - 1) * size,
                    take: size
                }),
                this.prisma.productAssignment.count({
                    where: whereClause
                })
            ]);
            const totalPages = Math.ceil(totalAssignments / size);
            return {
                product: {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    image: product.image,
                    totalStock: product.totalStock,
                    availableStock: product.availableStock,
                    category: product.category,
                    warehouse: product.warehouse
                },
                assignments: {
                    data: assignments.map(assignment => ({
                        id: assignment.id,
                        quantity: assignment.quantity,
                        availableQuantity: assignment.availableQuantity,
                        soldQuantity: assignment.soldQuantity,
                        assignedAt: assignment.assignedAt,
                        shop: assignment.shop,
                        assignedBy: assignment.assignedByUser
                    })),
                    page,
                    size,
                    total: totalAssignments,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrevious: page > 1
                },
                summary: {
                    totalAssignments,
                    totalQuantityAssigned: assignments.reduce((sum, a) => sum + a.quantity, 0),
                    totalQuantityAvailable: assignments.reduce((sum, a) => sum + a.availableQuantity, 0),
                    totalQuantitySold: assignments.reduce((sum, a) => sum + a.soldQuantity, 0)
                },
                filters: {
                    search: search || null
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to get warehouse product ${productId}: ${error.message}`);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to get warehouse product: ${error.message}`);
        }
    }
    async getDashboardStats(userId, userInfo) {
        var _a;
        this.logger.debug(`Fetching dashboard statistics for user ${userId} with role ${userInfo === null || userInfo === void 0 ? void 0 : userInfo.role} and shopId ${userInfo === null || userInfo === void 0 ? void 0 : userInfo.shopId}`);
        try {
            const isGlobalUser = (userInfo === null || userInfo === void 0 ? void 0 : userInfo.role) && ['CEO', 'Admin', 'WarehouseKeeper'].includes(userInfo.role);
            const shopId = !isGlobalUser ? userInfo === null || userInfo === void 0 ? void 0 : userInfo.shopId : null;
            this.logger.debug(`Dashboard access level: ${isGlobalUser ? 'Global' : 'Shop-specific'}, shopId: ${shopId}`);
            const [totalProducts, totalCategories, totalStock, totalWarehouses, totalAssignments, activeShops, activeAssignments, totalRevenue, totalCollected, partialPayments, outstandingPayments, totalOrders, completedOrders, pendingPaymentOrders, readyForPickupOrders, completedOrdersDetailed] = await Promise.all([
                this.prisma.product.count(),
                this.prisma.category.count(),
                this.prisma.product.aggregate({
                    _sum: {
                        totalStock: true
                    }
                }),
                this.prisma.warehouse.count(),
                this.prisma.productAssignment.count(Object.assign({}, (shopId && { where: { shopId } }))),
                shopId
                    ? this.prisma.shop.count({
                        where: { id: shopId, isActive: true }
                    })
                    : this.prisma.shop.count({
                        where: { isActive: true }
                    }),
                this.prisma.productAssignment.count({
                    where: Object.assign({ availableQuantity: {
                            gt: 0
                        } }, (shopId && { shopId }))
                }),
                this.prisma.order.aggregate(Object.assign({ _sum: {
                        totalAmount: true
                    } }, (shopId && { where: { shopId } }))),
                this.prisma.order.aggregate(Object.assign({ _sum: {
                        paidAmount: true
                    } }, (shopId && { where: { shopId } }))),
                this.prisma.order.aggregate({
                    _sum: {
                        paidAmount: true
                    },
                    where: Object.assign({ paymentStatus: 'partial' }, (shopId && { shopId }))
                }),
                shopId
                    ? this.prisma.$queryRaw `
              SELECT COALESCE(SUM("totalAmount" - "paidAmount"), 0) as outstanding
              FROM "Order"
              WHERE "shopId" = ${shopId}
            `
                    : this.prisma.$queryRaw `
              SELECT COALESCE(SUM("totalAmount" - "paidAmount"), 0) as outstanding
              FROM "Order"
            `,
                this.prisma.order.count(Object.assign({}, (shopId && { where: { shopId } }))),
                this.prisma.order.count({
                    where: Object.assign({ status: 'delivered' }, (shopId && { shopId }))
                }),
                this.prisma.order.count({
                    where: Object.assign({ status: 'pending_payment' }, (shopId && { shopId }))
                }),
                this.prisma.order.count({
                    where: Object.assign({ status: 'picked_up' }, (shopId && { shopId }))
                }),
                this.prisma.order.groupBy(Object.assign({ by: ['status'], _count: {
                        status: true
                    } }, (shopId && { where: { shopId } })))
            ]);
            const dashboardStats = {
                totalProducts: totalProducts,
                categories: totalCategories,
                totalStock: totalStock._sum.totalStock || 0,
                warehouses: totalWarehouses,
                totalAssignments: totalAssignments,
                activeShops: activeShops,
                activeAssignments: activeAssignments,
                totalRevenue: totalRevenue._sum.totalAmount || 0,
                totalCollected: totalCollected._sum.paidAmount || 0,
                partialPayments: partialPayments._sum.paidAmount || 0,
                outstandingPayments: Number(((_a = outstandingPayments[0]) === null || _a === void 0 ? void 0 : _a.outstanding) || 0),
                totalOrders: totalOrders,
                completedOrders: completedOrders,
                pendingPayment: pendingPaymentOrders,
                readyForPickup: readyForPickupOrders,
                orderStatusBreakdown: completedOrdersDetailed.reduce((acc, item) => {
                    acc[item.status] = item._count.status;
                    return acc;
                }, {}),
                accessInfo: {
                    scope: isGlobalUser ? 'global' : 'shop',
                    shopId: shopId || null,
                    userRole: (userInfo === null || userInfo === void 0 ? void 0 : userInfo.role) || 'Unknown',
                    isFiltered: !isGlobalUser
                }
            };
            this.logger.debug(`Dashboard stats calculated successfully for ${isGlobalUser ? 'global' : 'shop'} scope: ${JSON.stringify(dashboardStats)}`);
            return dashboardStats;
        }
        catch (error) {
            this.logger.error(`Failed to fetch dashboard statistics: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to fetch dashboard statistics: ${error.message}`);
        }
    }
    async updateShopInventory(data) {
        try {
            this.logger.debug(`Updating shop inventory: ${JSON.stringify(data)}`);
            const assignment = await this.prisma.productAssignment.findUnique({
                where: { id: data.assignmentId },
                include: {
                    product: { select: { id: true, name: true } },
                    shop: { select: { id: true, name: true } }
                }
            });
            if (!assignment) {
                throw new common_1.NotFoundException(`Product assignment with ID ${data.assignmentId} not found`);
            }
            let newSoldQuantity = assignment.soldQuantity;
            let newAvailableQuantity = assignment.availableQuantity;
            switch (data.action) {
                case 'sale':
                    if (data.soldQuantity > assignment.availableQuantity) {
                        throw new common_1.BadRequestException(`Cannot sell ${data.soldQuantity} items. Only ${assignment.availableQuantity} available.`);
                    }
                    newSoldQuantity += data.soldQuantity;
                    newAvailableQuantity -= data.soldQuantity;
                    break;
                case 'return':
                    if (data.soldQuantity > assignment.soldQuantity) {
                        throw new common_1.BadRequestException(`Cannot return ${data.soldQuantity} items. Only ${assignment.soldQuantity} were sold.`);
                    }
                    newSoldQuantity -= data.soldQuantity;
                    newAvailableQuantity += data.soldQuantity;
                    break;
                case 'adjustment':
                    if (data.soldQuantity < 0 || data.soldQuantity > assignment.quantity) {
                        throw new common_1.BadRequestException(`Invalid sold quantity. Must be between 0 and ${assignment.quantity}.`);
                    }
                    newSoldQuantity = data.soldQuantity;
                    newAvailableQuantity = assignment.quantity - data.soldQuantity;
                    break;
            }
            const updatedAssignment = await this.prisma.productAssignment.update({
                where: { id: data.assignmentId },
                data: {
                    soldQuantity: newSoldQuantity,
                    availableQuantity: newAvailableQuantity
                },
                include: {
                    product: { select: { id: true, name: true, price: true } },
                    shop: { select: { id: true, name: true, location: true } },
                    warehouse: { select: { id: true, name: true } }
                }
            });
            this.logger.debug(`Shop inventory updated: ${updatedAssignment.id}`);
            if (data.userId) {
                let activityAction = '';
                let activityDetails = '';
                switch (data.action) {
                    case 'sale':
                        activityAction = 'INVENTORY_SALE';
                        activityDetails = `Recorded sale of ${data.soldQuantity} units of "${assignment.product.name}" from "${assignment.shop.name}" shop. Available: ${assignment.availableQuantity} → ${newAvailableQuantity}, Sold: ${assignment.soldQuantity} → ${newSoldQuantity}`;
                        break;
                    case 'return':
                        activityAction = 'INVENTORY_RETURN';
                        activityDetails = `Processed return of ${data.soldQuantity} units of "${assignment.product.name}" to "${assignment.shop.name}" shop. Available: ${assignment.availableQuantity} → ${newAvailableQuantity}, Sold: ${assignment.soldQuantity} → ${newSoldQuantity}`;
                        break;
                    case 'adjustment':
                        activityAction = 'INVENTORY_ADJUSTMENT';
                        activityDetails = `Adjusted inventory for "${assignment.product.name}" in "${assignment.shop.name}" shop. Sold quantity set to ${newSoldQuantity}, Available: ${assignment.availableQuantity} → ${newAvailableQuantity}`;
                        break;
                }
                if (data.notes) {
                    activityDetails += `. Notes: ${data.notes}`;
                }
                await this.prisma.activityLog.create({
                    data: {
                        userId: data.userId,
                        action: activityAction,
                        details: activityDetails,
                        ipAddress: null,
                        userAgent: null
                    }
                });
                this.logger.debug(`Activity logged: ${activityAction} for user ${data.userId}`);
            }
            return {
                success: true,
                message: `Inventory updated successfully`,
                assignment: updatedAssignment,
                changes: {
                    action: data.action,
                    quantity: data.soldQuantity,
                    previousSold: assignment.soldQuantity,
                    newSold: newSoldQuantity,
                    previousAvailable: assignment.availableQuantity,
                    newAvailable: newAvailableQuantity
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to update shop inventory: ${error.message}`);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to update shop inventory: ${error.message}`);
        }
    }
};
exports.WarehouseService = WarehouseService;
exports.WarehouseService = WarehouseService = WarehouseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WarehouseService);
//# sourceMappingURL=warehouse.service.js.map