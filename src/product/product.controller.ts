import { Controller, Get, Post, Body, Param, Patch, UploadedFile, UseInterceptors, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import {Express} from 'express';

@Controller('products')
export class ProductController {
    private readonly logger = new Logger(ProductController.name);
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll() {
    return this.productService.findAll();
  }


  @Post('/category')
    async createCategory(@Body() data: any) {
    try {
      return await this.productService.createCategory(data);
    } catch (error: any) {
      this.logger.error('Error creating category:', error);
      throw new Error('Failed to create category');
        
    }
  }

    @Get('/category')
    async getCategories() {
    return this.productService.findAllCategories();
    }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // <-- Ensure this matches the field name
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    return this.productService.uploadForUrl(body, file);
  }

  @Post()
  create( @Body() data: any) {
    return this.productService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.productService.update(id, data);
  }
}