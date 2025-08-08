import { Controller, Get, Post, Body, Param, Patch, Request, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAll() {
    return this.userService.findAll();
  }
  @Get("/packager")
  getAllPackager(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user;
    return this.userService.findAllPackager(userId);
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