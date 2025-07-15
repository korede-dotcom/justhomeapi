import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { PendingChangeService } from './pending-change.service';

@Controller('pending-changes')
export class PendingChangeController {
  constructor(private readonly pendingChangeService: PendingChangeService) {}

  @Get()
  findAll() {
    return this.pendingChangeService.findAll();
  }

  @Post()
  create(@Body() data: any) {
    return this.pendingChangeService.create(data);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.pendingChangeService.updateStatus(id, 'approved');
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.pendingChangeService.updateStatus(id, 'rejected');
  }
}
