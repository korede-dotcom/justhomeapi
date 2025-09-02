export declare class PaginationDto {
    page?: number;
    size?: number;
    search?: string;
}
export declare class PaginationResponseDto<T> {
    data: T[];
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    constructor(data: T[], page: number, size: number, total: number);
}
export declare class ActivityLogPaginationDto {
    page?: number;
    size?: number;
    limit?: number;
    userId?: string;
    search?: string;
}
