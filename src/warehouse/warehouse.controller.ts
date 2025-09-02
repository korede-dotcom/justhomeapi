import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { WarehouseProductsQueryDto, SingleWarehouseProductQueryDto } from './dto/warehouse-products.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('warehouses')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  @Roles('CEO', 'Admin')
  create(@Body() data: any) {
    return this.warehouseService.create(data);
  }

  @Get()
  @Roles('CEO', 'Admin', 'WarehouseKeeper','Storekeeper','Attendee','Receptionist','Packager')
  findAll() {
    return this.warehouseService.findAll();
  }

  @Get('dashboard')
  @Roles('CEO', 'Admin', 'WarehouseKeeper','Storekeeper','Attendee','Receptionist','Packager')
  async getDashboardStats(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user;
    const userInfo = {
      role: req.user?.role,
      shopId: req.user?.shopId
    };
    return this.warehouseService.getDashboardStats(userId, userInfo);
  }

  @Get(':id')
  @Roles('CEO', 'Admin', 'WarehouseKeeper')
  findOne(@Param('id') id: string) {
    return this.warehouseService.findOne(id);
  }

  @Patch(':id')
  @Roles('CEO', 'Admin')
  update(@Param('id') id: string, @Body() data: any) {
    return this.warehouseService.update(id, data);
  }

  @Delete(':id')
  @Roles('CEO', 'Admin')
  remove(@Param('id') id: string) {
    return this.warehouseService.remove(id);
  }

  @Post('assign-product')
  @Roles('CEO', 'Admin', 'WarehouseKeeper')
  assignProduct(@Body() data: any) {
    return this.warehouseService.assignProductToShop(data);
  }

  @Get(':id/report')
  @Roles('CEO', 'Admin')
  getReport(@Param('id') id: string) {
    return this.warehouseService.getWarehouseReport(id);
  }

  @Get('shop/:shopId/products')
  @Roles('CEO', 'Admin', 'Storekeeper', 'Attendee', 'Receptionist', 'Packager')
  getShopProducts(@Param('shopId') shopId: string) {
    return this.warehouseService.getProductsAssignedToShop(shopId);
  }

  @Get('products')
  @Roles('WarehouseKeeper', 'Storekeeper', 'Attendee', 'Receptionist', 'Packager')
  getAllProductsForNonAdmins(
    @Request() req: any,
    @Query() query: WarehouseProductsQueryDto
  ) {
    const userId = req.user?.userId || req.user?.id || req.user;
    return this.warehouseService.getAllProductsForNonAdmins(userId, query);
  }

  @Get(':warehouseId/products')
  @Roles('CEO', 'Admin', 'WarehouseKeeper', 'Storekeeper', 'Attendee', 'Receptionist', 'Packager')
  getWarehouseProducts(
    @Param('warehouseId') warehouseId: string,
    @Query() query: WarehouseProductsQueryDto
  ) {
    return this.warehouseService.getWarehouseProducts(warehouseId, query);
  }

  @Get(':warehouseId/products/:productId')
  @Roles('CEO', 'Admin', 'WarehouseKeeper', 'Storekeeper', 'Attendee', 'Receptionist', 'Packager')
  getWarehouseProduct(
    @Param('warehouseId') warehouseId: string,
    @Param('productId') productId: string,
    @Query() query: SingleWarehouseProductQueryDto
  ) {
    return this.warehouseService.getWarehouseProduct(warehouseId, productId, query);
  }

  @Post('update-shop-inventory')
  @Roles('CEO', 'Admin', 'Storekeeper', 'Attendee')
  updateShopInventory(@Body() data: any, @Request() req: any) {
    // Extract user ID from JWT token for activity logging
    const userId = req.user?.userId || req.user?.id || req.user;
    return this.warehouseService.updateShopInventory({ ...data, userId });
  }
}