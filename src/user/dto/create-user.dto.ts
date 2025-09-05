import { IsString, IsEmail, IsBoolean, IsOptional, IsArray, IsUUID, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  fullName!: string;

  @IsString()
  @IsIn(['CEO', 'Admin', 'Attendee', 'Receptionist', 'Cashier', 'Packager', 'Storekeeper', 'Customer', 'Warehouse', 'WarehouseKeeper'])
  role!: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsUUID()
  shopId?: string;

  @IsOptional()
  @IsUUID()
  warehouseId?: string; // Single warehouse assignment

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  warehouseIds?: string[]; // Multiple warehouse assignment (for WarehouseKeeper)

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsString()
  createdBy!: string;
}
