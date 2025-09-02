import { IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Transform } from 'class-transformer';

export class WarehouseProductsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  all?: boolean;
}

export class SingleWarehouseProductQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;
}
