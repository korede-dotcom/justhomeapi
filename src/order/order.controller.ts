import { Controller, Get, Post, Patch, Body, Param, Req, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { UseGuards, Logger } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';





@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
   private readonly logger = new Logger(OrderService.name);
  constructor(private readonly orderService: OrderService) {}

  @Get()
  findAll(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('shopId') shopId?: string
  ) {
    // Extract user ID from JWT token
    const userId = (req.user as any)?.userId || (req.user as any)?.id || req.user;
    this.logger.log(`Fetching orders for user: ${userId}`);

    // Parse pagination parameters
    const parsedPage = Math.max(1, parseInt(page || '1', 10) || 1);
    const parsedSize = Math.min(100, Math.max(1, parseInt(size || '20', 10) || 20));

    // Parse and validate date parameters
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;

    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        throw new Error('Invalid startDate format. Use ISO 8601 format (YYYY-MM-DD)');
      }
    }

    if (endDate) {
      parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        throw new Error('Invalid endDate format. Use ISO 8601 format (YYYY-MM-DD)');
      }
      // Set end date to end of day
      parsedEndDate.setHours(23, 59, 59, 999);
    }

    // Trim search parameters
    const trimmedSearch = (search || '').trim();
    const trimmedStatus = (status || '').trim();
    const trimmedPaymentStatus = (paymentStatus || '').trim();
    const trimmedShopId = (shopId || '').trim();

    // Use the enhanced method with pagination and search
    return this.orderService.getOrdersForUserWithPagination(
      userId,
      parsedPage,
      parsedSize,
      trimmedSearch || undefined,
      trimmedStatus || undefined,
      trimmedPaymentStatus || undefined,
      parsedStartDate,
      parsedEndDate,
      trimmedShopId || undefined
    );
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