import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class UserPaginationDto extends PaginationDto {
    search?: string;
    role?: string;
    shopId?: string;
    warehouseId?: string;
    isActive?: boolean;
    all?: boolean;
}
