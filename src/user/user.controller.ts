import { Controller, Get, Post, Body, Param, Patch, Request, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserPaginationDto } from './dto/user-pagination.dto';
import { AssignWarehouseDto, AssignWarehouseToMultipleUsersDto, AssignMultipleWarehousesToUserDto, AddWarehousesToKeeperDto, RemoveWarehousesFromKeeperDto } from './dto/warehouse-assignment.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('debug-token')
  debugToken(@Request() req: any) {
    return {
      rawUser: req.user,
      extractedUserId: req.user?.userId || req.user?.id || req.user,
      extractedRole: req.user?.role,
      extractedShopId: req.user?.shopId,
      message: 'JWT token debug information'
    };
  }

  @Get()
  getAll(@Query() query: UserPaginationDto, @Request() req: any) {
    const requestingUserId = req.user?.userId || req.user?.id || req.user;
    const requestingUserInfo = {
      role: req.user?.role,
      shopId: req.user?.shopId
    };

    // Debug logging
    console.log('JWT User Object:', JSON.stringify(req.user, null, 2));
    console.log('Extracted User ID:', requestingUserId);
    console.log('Extracted User Info:', requestingUserInfo);

    return this.userService.findAll(query, requestingUserId, requestingUserInfo);
  }
  @Get("/packager")
  getAllPackager(@Request() req: any, @Query() query: UserPaginationDto) {
    const userId = req.user?.userId || req.user?.id || req.user;
    return this.userService.findAllPackager(userId, query);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.userService.update(id, data);
  }

  @Get('activity-logs')
  getAllActivityLogs(@Query('limit') limit?: string, @Query('userId') userId?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.userService.getActivityLogs(limitNum, userId);
  }

  @Get(':id/activity-logs')
  getUserActivityLogs(@Param('id') userId: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.userService.getActivityLogs(limitNum, userId);
  }

  @Post(':id/assign-warehouse')
  @Roles('CEO', 'Admin', 'WarehouseKeeper')
  assignWarehouseToUser(
    @Param('id') userId: string,
    @Body() assignWarehouseDto: AssignWarehouseDto
  ) {
    return this.userService.assignWarehouseToUser(userId, assignWarehouseDto.warehouseId || "none");
  }

  @Post(':id/assign-multiple-warehouses')
  @Roles('CEO', 'Admin', 'WarehouseKeeper')
  assignMultipleWarehousesToUser(
    @Param('id') userId: string,
    @Body() assignWarehousesDto: AssignMultipleWarehousesToUserDto
  ) {
    return this.userService.assignMultipleWarehousesToUser(userId, assignWarehousesDto.warehouseIds);
  }

  @Post('assign-warehouse-multiple')
  @Roles('CEO', 'Admin', 'WarehouseKeeper')
  assignWarehouseToMultipleUsers(
    @Body() assignWarehouseDto: AssignWarehouseToMultipleUsersDto
  ) {
    return this.userService.assignWarehousesToMultipleUsers(
      assignWarehouseDto.warehouseId || "none",
      assignWarehouseDto.userIds
    );
  }

  @Post(':keeperId/add-warehouses')
  @Roles('CEO', 'Admin')
  addWarehousesToKeeper(
    @Param('keeperId') keeperId: string,
    @Body() addWarehousesDto: AddWarehousesToKeeperDto
  ) {
    return this.userService.addWarehousesToKeeper(keeperId, addWarehousesDto.warehouseIds);
  }

  @Post(':keeperId/remove-warehouses')
  @Roles('CEO', 'Admin')
  removeWarehousesFromKeeper(
    @Param('keeperId') keeperId: string,
    @Body() removeWarehousesDto: RemoveWarehousesFromKeeperDto
  ) {
    return this.userService.removeWarehousesFromKeeper(keeperId, removeWarehousesDto.warehouseIds);
  }

  @Get(':keeperId/managed-warehouses')
  @Roles('CEO', 'Admin', 'WarehouseKeeper')
  getManagedWarehouses(
    @Param('keeperId') keeperId: string,
    @Request() req: any
  ) {
    const requestingUserId = req.user?.userId || req.user?.id || req.user;
    const requestingUserRole = req.user?.role;
    return this.userService.getManagedWarehouses(keeperId, requestingUserId, requestingUserRole);
  }
}