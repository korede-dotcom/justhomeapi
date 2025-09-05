import { IsString, IsArray, IsUUID, IsOptional } from 'class-validator';

export class AssignWarehouseDto {
  @IsString()
  @IsOptional()
  warehouseId?: string; // Can be warehouse UUID or "none" to remove assignment
}

export class AssignMultipleWarehousesToUserDto {
  @IsArray()
  @IsUUID(4, { each: true })
  warehouseIds!: string[]; // Array of warehouse UUIDs to assign to the user
}

export class AssignWarehouseToMultipleUsersDto {
  @IsString()
  @IsOptional()
  warehouseId?: string; // Can be warehouse UUID or "none" to remove assignment

  @IsArray()
  @IsUUID(4, { each: true })
  userIds!: string[];
}

export class AddWarehousesToKeeperDto {
  @IsArray()
  @IsUUID(4, { each: true })
  warehouseIds!: string[]; // Array of warehouse UUIDs to add
}

export class RemoveWarehousesFromKeeperDto {
  @IsArray()
  @IsUUID(4, { each: true })
  warehouseIds!: string[]; // Array of warehouse UUIDs to remove
}
