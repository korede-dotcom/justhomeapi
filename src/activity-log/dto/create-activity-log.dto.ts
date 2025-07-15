// src/activity-log/dto/create-activity-log.dto.ts
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateActivityLogDto {
  @IsString()
  @IsNotEmpty()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  action?: string;

  @IsString()
  @IsNotEmpty()
  details?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}
