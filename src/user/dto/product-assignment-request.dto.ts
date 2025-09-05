import { IsString, IsNumber, IsOptional, IsUUID, IsIn, IsPositive } from 'class-validator';

export class CreateProductAssignmentRequestDto {
  @IsUUID()
  productId!: string;

  @IsUUID()
  shopId!: string;

  @IsUUID()
  warehouseId!: string;

  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ReviewProductAssignmentRequestDto {
  @IsString()
  @IsIn(['APPROVED', 'REJECTED'])
  status!: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

export class ProductAssignmentRequestQueryDto {
  @IsOptional()
  @IsString()
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @IsOptional()
  @IsUUID()
  shopId?: string;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsString()
  requestedBy?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  size?: number;
}
