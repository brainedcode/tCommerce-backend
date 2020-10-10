import { Expose } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ClientProductListItemDto } from '../client/product-list-item.dto';
import { TrimString } from '../../decorators/trim-string.decorator';

export class OrderItemDto {
  @Expose()
  @IsString()
  @TrimString()
  name: string;

  @Expose()
  @IsNumber()
  productId: number;

  @Expose()
  @IsString()
  @TrimString()
  variantId: string;

  @Expose()
  @IsString()
  @TrimString()
  sku: string;

  @Expose()
  @IsOptional()
  @IsString()
  @TrimString()
  vendorCode: string;

  @Expose()
  @IsNumber()
  price: number;

  @Expose()
  @IsNumber()
  qty: number;

  @Expose()
  @IsNumber()
  cost: number;

  @Expose()
  @IsOptional()
  @IsString()
  @TrimString()
  imageUrl: string;

  @Expose()
  @IsOptional()
  @IsString()
  @TrimString()
  slug: string;

  @Expose()
  crossSellProducts: ClientProductListItemDto[];
}
