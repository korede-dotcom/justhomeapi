import { Module } from '@nestjs/common';
import { ProductAssignmentRequestController } from './product-assignment-request.controller';
import { ProductAssignmentRequestService } from './product-assignment-request.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductAssignmentRequestController],
  providers: [ProductAssignmentRequestService],
  exports: [ProductAssignmentRequestService]
})
export class ProductAssignmentRequestModule {}
