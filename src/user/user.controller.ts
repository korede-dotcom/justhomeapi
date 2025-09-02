import { Controller, Get, Post, Body, Param, Patch, Request, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserPaginationDto } from './dto/user-pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
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
  create(@Body() data: any) {
    return this.userService.createUser(data);
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
}