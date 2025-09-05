import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('users')
  @Roles('CEO', 'Admin')
  getUserDashboard() {
    return this.dashboardService.getUserDashboard();
  }

  @Get('activities')
  @Roles('CEO', 'Admin')
  getActivityDashboard() {
    return this.dashboardService.getActivityDashboard();
  }

  @Get('warehouses')
  @Roles('CEO', 'Admin', 'WarehouseKeeper')
  getWarehouseDashboard() {
    return this.dashboardService.getWarehouseDashboard();
  }

  @Get('shops')
  @Roles('CEO', 'Admin', 'Storekeeper', 'Attendee', 'Receptionist', 'Packager')
  getShopDashboard() {
    return this.dashboardService.getShopDashboard();
  }

  @Get('products')
  @Roles('CEO', 'Admin', 'WarehouseKeeper', 'Storekeeper')
  getProductDashboard() {
    return this.dashboardService.getProductDashboard();
  }

  @Get('orders')
  @Roles('CEO', 'Admin', 'Storekeeper', 'Attendee', 'Receptionist', 'Packager')
  getOrderDashboard() {
    return this.dashboardService.getOrderDashboard();
  }

  @Get('assignments')
  @Roles('CEO', 'Admin', 'WarehouseKeeper', 'Storekeeper')
  getProductAssignmentDashboard() {
    return this.dashboardService.getProductAssignmentDashboard();
  }

  @Get('complete')
  @Roles('CEO', 'Admin')
  getCompleteDashboard() {
    return this.dashboardService.getCompleteDashboard();
  }
}
