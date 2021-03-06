import { ReservedInventory } from './reserved-inventory.model';
import { arrayProp, getModelForClass, prop } from '@typegoose/typegoose';

export class Inventory {
  @prop({ index: true, unique: true })
  sku: string;

  @prop({ index: true })
  productId: number;

  @prop({ min: 0 })
  qtyInStock: number;

  @arrayProp({ items: ReservedInventory, default: [], _id: false })
  reserved: ReservedInventory[];

  static collectionName: string = 'inventory';
}

export const InventoryModel = getModelForClass(Inventory, {
  schemaOptions: {
    toJSON: {
      virtuals: true
    },
    timestamps: true
  }
});
