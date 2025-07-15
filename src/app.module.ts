// src/app.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module'; // ✅ import here
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { PendingChangeModule } from './pending-change/pending-change.module';
import { ProductModule } from './product/product.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    OrderModule,
    ProductModule,
    ActivityLogModule,
    PendingChangeModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
