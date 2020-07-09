import { arrayProp, prop } from '@typegoose/typegoose';
import { Media } from '../../shared/models/media.model';
import { MetaTags } from '../../shared/models/meta-tags.model';
import { ProductSelectedAttribute } from './product-selected-attribute.model';
import { Types } from 'mongoose';
import { CurrencyCodeEnum } from '../../shared/enums/currency.enum';
import { LinkedProduct } from './linked-product.model';

export class ProductVariant {
  @prop({ index: true })
  _id: Types.ObjectId;

  get id() { return this._id; }
  set id(id) { this._id = id || new Types.ObjectId(); }

  @prop({ required: true })
  name: string;

  @prop({ required: true, index: true, unique: true })
  sku: string;

  @prop({ index: true })
  vendorCode: string;

  @prop({ index: true })
  gtin: string;

  @prop({ required: true, index: true, unique: true })
  slug: string;

  @arrayProp({ items: ProductSelectedAttribute, _id: false })
  attributes: ProductSelectedAttribute[];

  @prop({ default: true })
  isEnabled: boolean;

  @prop({ default: 0 })
  price: number;

  @prop({ default: null })
  oldPrice: number;

  @prop({ default: CurrencyCodeEnum.UAH })
  currency: CurrencyCodeEnum;

  @prop({ default: 0 })
  priceInDefaultCurrency: number;

  @prop({ default: null })
  oldPriceInDefaultCurrency: number;

  @arrayProp({ items: Media, default: [] })
  medias: Media[];

  @prop()
  fullDescription: string;

  @prop()
  shortDescription: string;

  @prop()
  metaTags: MetaTags;

  @prop({ default: true })
  isDiscountApplicable: boolean;

  @prop({ default: 0 })
  salesCount: number;

  @prop({ default: true })
  isIncludedInShoppingFeed: boolean;

  @prop()
  googleAdsProductTitle: string;

  @arrayProp({ items: LinkedProduct, default: [] })
  relatedProducts: LinkedProduct[];

  @arrayProp({ items: LinkedProduct, default: [] })
  crossSellProducts: LinkedProduct[];
}
