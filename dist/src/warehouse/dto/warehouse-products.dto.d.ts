import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class WarehouseProductsQueryDto extends PaginationDto {
    search?: string;
    warehouseId?: string;
    category?: string;
    all?: boolean;
}
export declare class SingleWarehouseProductQueryDto extends PaginationDto {
    search?: string;
}
