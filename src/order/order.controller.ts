import { Controller, Get, Post, Patch, Body, Param,Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { UseGuards,Logger } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';





@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
   private readonly logger = new Logger(OrderService.name);
  constructor(private readonly orderService: OrderService) {}

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get("storekeeper")
  findAllForStoreKeeper(@Req() req:Request) {
    const user = req.user;
    this.logger.log(`${JSON.stringify(user)}`)
    return this.orderService.getOrdersByStorekeeper("");
  }

  @Post()
  create(@Body() data: any) {
    return this.orderService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.orderService.update(id, data);
  }
  
  @Patch("payment/:id")
  updatePayment(@Param('id') id: string, @Body() data: any) {
    return this.orderService.updatePayment(id, data);
  }
 @Patch("packager/:id")
updatePackager(@Param('id') id: string, @Body() data: any) {
  return this.orderService.updatePackager(id, data);
}

 @Post("store/release/:id")
updateReleaseItem(@Param('id') id: string, @Body() data: any,@Req() req:Request,@CurrentUser() user: { userId: string }) {
   
  return this.orderService.updateRelease(id, data,user.userId);
}

}