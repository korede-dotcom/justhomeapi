import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

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
  @Roles('CEO', 'Admin', 'WarehouseKeeper')
  findAll() {
    return this.warehouseService.findAll();
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
  getAllProductsForNonAdmins(@Request() req: any) {
    return this.warehouseService.getAllProductsForNonAdmins(req.user.id);
  }

  @Post('update-shop-inventory')
  @Roles('CEO', 'Admin', 'Storekeeper', 'Attendee')
  updateShopInventory(@Body() data: any, @Request() req: any) {
    // Extract user ID from JWT token for activity logging
    const userId = req.user?.userId || req.user?.id || req.user;
    return this.warehouseService.updateShopInventory({ ...data, userId });
  }
}