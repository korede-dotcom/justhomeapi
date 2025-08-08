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
  findAll(@Req() req: Request) {
    // Extract user ID from JWT token
    const userId = (req.user as any)?.userId || (req.user as any)?.id || req.user;
    this.logger.log(`Fetching orders for user: ${userId}`);

    // Use the role-based filtering method that considers user's shop
    return this.orderService.getOrdersForUser(userId);
  }

  @Get("storekeeper")
  findAllForStoreKeeper(@Req() req:Request) {
    const userId = (req.user as any)?.userId || (req.user as any)?.id || req.user;
    this.logger.log(`Storekeeper orders for user: ${userId}`);
    return this.orderService.getOrdersForUser(userId);
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

    @Patch(':id/payment')
    recordPayment(@Param('id') id: string, @Body() paymentData: any, @Req() req: Request) {
      const userId = (req.user as any)?.userId || (req.user as any)?.id || req.user;
      this.logger.log(`Recording payment for order ${id} by user ${userId}`);
      return this.orderService.recordPayment(id, paymentData, userId);
    }

  @Get(':id/payment-status')
  getPaymentStatus(@Param('id') id: string) {
    return this.orderService.getPaymentStatus(id);
  }

  @Get(':id/payments')
  getPaymentHistory(@Param('id') id: string) {
    return this.orderService.getPaymentHistory(id);
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