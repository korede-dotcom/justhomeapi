export declare class CreateUserDto {
    username: string;
    email: string;
    fullName: string;
    role: string;
    password?: string;
    shopId?: string;
    warehouseId?: string;
    warehouseIds?: string[];
    isActive?: boolean;
    createdBy: string;
}
