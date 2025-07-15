import { Controller, Get, Post, Body } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Request } from 'express';

@Controller('activity-logs')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  findAll() {
    return this.activityLogService.findAll();
  }

  @Post()
  create(@Body() data: any,req:Request,@CurrentUser() user: { userId: string ,fullName:string}) {
    return this.activityLogService.create(data);
  }
}