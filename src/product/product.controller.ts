import { Controller, Get, Post, Body, Param, Patch, UploadedFile, UseInterceptors, Logger, UseGuards, Request, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import {Express} from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductController {
    private readonly logger = new Logger(ProductController.name);
  constructor(private readonly productService: ProductService) {}

  @Get()
  @Roles('CEO', 'Admin', 'WarehouseKeeper', 'Storekeeper', 'Attendee', 'Receptionist', 'Packager')
  async findAll(@Request() req: any, @Query('page') page?: string, @Query('size') size?: string, @Query('search') search?: string, @Query('warehouseId') warehouseId?: string) {
    this.logger.debug(`Controller received user data: ${JSON.stringify(req.user)}`);

    // Extract user ID from the request - handle different JWT payload structures
    let userId: string;

    if (typeof req.user === 'string') {
      userId = req.user;
    } else if (req.user?.userId) {
      userId = req.user.userId;
    } else if (req.user?.id) {
      userId = req.user.id;
    } else if (req.user?.sub) {
      userId = req.user.sub;
    } else {
      this.logger.error('No user ID found in request');
      throw new Error('Authentication failed - no user ID');
    }

    this.logger.debug(`Extracted user ID: ${userId}`);

    if (!userId || typeof userId !== 'string') {
      this.logger.error(`Invalid user ID format: ${typeof userId}`);
      throw new Error('Authentication failed - invalid user ID format');
    }

    const parsedPage = Math.max(1, parseInt(page || '1', 10) || 1);
    const parsedSize = Math.min(100, Math.max(1, parseInt(size || '20', 10) || 20));

    const trimmedSearch = (search || '').trim();
    const trimmedWarehouseId = (warehouseId || '').trim();
    return this.productService.findAllByUserId(userId, parsedPage, parsedSize, trimmedSearch || undefined, trimmedWarehouseId || undefined);
  }


  @Post('/category')
  @Roles('CEO', 'Admin')
  async createCategory(@Body() data: any) {
    try {
      return await this.productService.createCategory(data);
    } catch (error: any) {
      this.logger.error('Error creating category:', error);
      throw new Error('Failed to create category');

    }
  }

  @Get('/category')
  @Roles('CEO', 'Admin', 'WarehouseKeeper', 'Storekeeper', 'Attendee', 'Receptionist', 'Packager')
  async getCategories() {
    return this.productService.findAllCategories();
  }

  @Post('upload')
  @Roles('CEO', 'Admin', 'WarehouseKeeper')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    return this.productService.uploadForUrl(body, file);
  }

  @Post()
  @Roles('CEO', 'Admin', 'WarehouseKeeper')
  create( @Body() data: any) {
    return this.productService.create(data);
  }

  @Patch(':id')
  @Roles('CEO', 'Admin', 'WarehouseKeeper')
  update(@Param('id') id: string, @Body() data: any) {
    return this.productService.update(id, data);
  }

  @Post('upload-csv')
  @UseInterceptors(FileInterceptor('file'))
  @Roles('CEO', 'Admin', 'WarehouseKeeper')
  async uploadCSV(
    @UploadedFile() file: Express.Multer.File,
    @Body('warehouseId') warehouseId: string
  ) {
    return this.productService.uploadCSV(file, warehouseId);
  }

  @Post('bulk-upload')
  @UseInterceptors(FileInterceptor('file'))
  @Roles('CEO', 'Admin', 'WarehouseKeeper')
  async bulkUpload(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any
  ) {
    const userId = req.user?.userId || req.user?.id || req.user;
    this.logger.log(`Bulk upload initiated by user: ${userId}`);
    return this.productService.bulkUploadProducts(file, userId);
  }

  @Post('upload-xlsx')
  @UseInterceptors(FileInterceptor('file'))
  @Roles('CEO', 'Admin', 'WarehouseKeeper')
  async uploadXlsx(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any
  ) {
    const userId = req.user?.userId || req.user?.id || req.user;
    this.logger.log(`XLSX upload initiated by user: ${userId}`);
    return this.productService.uploadAndReadXlsx(file, userId);
  }
}
