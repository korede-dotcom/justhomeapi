import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

export enum PaymentStatusEnum {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  OVERPAID = 'overpaid',
  CONFIRMED = 'confirmed'
}

export enum OrderStatusEnum {
  PENDING_PAYMENT = 'pending_payment',
  PARTIAL_PAYMENT = 'partial_payment',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentMethodEnum {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
  POS = 'pos'
}

export class CeoOrderUpdateDto {
  @IsEnum(PaymentStatusEnum)
  paymentStatus!: PaymentStatusEnum;

  @IsEnum(OrderStatusEnum)
  status!: OrderStatusEnum;

  @IsEnum(PaymentMethodEnum)
  paymentMethod!: PaymentMethodEnum;

  @IsNumber()
  @Min(0)
  paidAmount!: number;

  @IsNumber()
  @Min(0)
  balanceAmount!: number;

  @IsString()
  updatedBy!: string;

  @IsNumber()
  @Min(0)
  paymentAmount!: number;

  @IsString()
  paymentReference!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
