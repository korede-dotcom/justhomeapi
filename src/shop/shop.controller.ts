import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('shops')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  @Roles('CEO', 'Admin')
  create(@Body() data: any) {
    return this.shopService.create(data);
  }

  @Get()
  @Roles('CEO', 'Admin', 'Storekeeper', 'Receptionist', 'Packager', 'Attendee','WarehouseKeeper')
  findAll() {
    return this.shopService.findAll();
  }

  @Get(':id')
  @Roles('CEO', 'Admin', 'Storekeeper', 'Receptionist', 'Packager', 'Attendee','WarehouseKeeper')
  findOne(@Param('id') id: string) {
    return this.shopService.findOne(id);
  }

  @Patch(':id')
  @Roles('CEO', 'Admin')
  update(@Param('id') id: string, @Body() data: any) {
    return this.shopService.update(id, data);
  }

  @Delete(':id')
  @Roles('CEO', 'Admin')
  remove(@Param('id') id: string) {
    return this.shopService.remove(id);
  }

  @Get(':id/report')
  @Roles('CEO', 'Admin')
  getReport(@Param('id') id: string) {
    return this.shopService.getShopReport(id);
  }
}
