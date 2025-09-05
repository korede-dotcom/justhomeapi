import { Controller, Get, Post, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ProductAssignmentRequestService } from './product-assignment-request.service';
import { CreateProductAssignmentRequestDto, ReviewProductAssignmentRequestDto, ProductAssignmentRequestQueryDto } from '../user/dto/product-assignment-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('product-assignment-requests')
export class ProductAssignmentRequestController {
  constructor(private readonly requestService: ProductAssignmentRequestService) {}

  @Post()
  @Roles('WarehouseKeeper')
  createRequest(
    @Body() createRequestDto: CreateProductAssignmentRequestDto,
    @Request() req: any
  ) {
    const requestedBy = req.user?.userId || req.user?.id || req.user;
    return this.requestService.createRequest(createRequestDto, requestedBy);
  }

  @Get('pending')
  @Roles('CEO', 'Admin')
  getPendingRequests(@Query() query: ProductAssignmentRequestQueryDto) {
    return this.requestService.getPendingRequests(query);
  }

  @Post(':requestId/approve')
  @Roles('CEO', 'Admin')
  approveRequest(
    @Param('requestId') requestId: string,
    @Body() reviewDto: ReviewProductAssignmentRequestDto,
    @Request() req: any
  ) {
    const reviewedBy = req.user?.userId || req.user?.id || req.user;
    return this.requestService.approveRequest(requestId, reviewedBy, reviewDto.reviewNotes);
  }

  @Post(':requestId/reject')
  @Roles('CEO', 'Admin')
  rejectRequest(
    @Param('requestId') requestId: string,
    @Body() reviewDto: ReviewProductAssignmentRequestDto,
    @Request() req: any
  ) {
    const reviewedBy = req.user?.userId || req.user?.id || req.user;
    return this.requestService.rejectRequest(requestId, reviewedBy, reviewDto.reviewNotes);
  }

  @Get('my-requests')
  @Roles('WarehouseKeeper')
  getMyRequests(
    @Request() req: any,
    @Query() query: ProductAssignmentRequestQueryDto
  ) {
    const requestedBy = req.user?.userId || req.user?.id || req.user;
    return this.requestService.getPendingRequests({
      ...query,
      requestedBy
    });
  }
}
