import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Request } from 'express';
import { ActivityLogPaginationDto } from '../common/dto/pagination.dto';

@Controller('activity-logs')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  findAll(@Query() query: ActivityLogPaginationDto) {
    return this.activityLogService.findAll(query);
  }

  @Post()
  create(@Body() data: any,req:Request,@CurrentUser() user: { userId: string ,fullName:string}) {
    return this.activityLogService.create(data);
  }
}