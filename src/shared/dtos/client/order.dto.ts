import { ShippingAddressDto } from '../shared-dtos/shipping-address.dto';
import { ArrayMinSize, IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
import { OrderItemDto } from '../shared-dtos/order-item.dto';
import { Order } from '../../../order/models/order.model';
import { EOrderStatus } from '../../enums/order-status.enum';

export class ClientAddOrderDto {
  @Expose()
  @IsOptional()
  @IsString()
  email: string;

  @Expose()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  address: ShippingAddressDto;

  @Expose()
  @IsString()
  paymentMethodId: string;

  @Expose()
  @IsString()
  shippingMethodId: string;

  @Expose()
  @IsBoolean()
  isCallbackNeeded: boolean;

  @Expose()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @Expose()
  @Transform(((value, obj: Order) => value ? value : obj.clientNote))
  @IsOptional()
  @IsString()
  note: string;
}

export class ClientOrderDto extends ClientAddOrderDto {
  @Expose()
  @Transform(((value, obj: Order) => value ? value : obj.idForCustomer))
  id: string;

  @Expose()
  @Transform(((value, obj: Order) => value ? value : obj.shippingMethodClientName))
  shippingMethodName: string;

  @Expose()
  @Transform(((value, obj: Order) => value ? value : obj.paymentMethodClientName))
  paymentMethodName: string;

  @Expose()
  novaposhtaTrackingId: string;

  @Expose()
  status: EOrderStatus;

  @Expose()
  totalItemsCost: number;

  @Expose()
  discountPercent: number;

  @Expose()
  discountValue: number;

  @Expose()
  discountLabel: string;

  @Expose()
  totalCost: number;
}
