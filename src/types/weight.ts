import { BaseEntity } from './common';

export interface ProductWeight extends BaseEntity {
  Weight_Value: number;
  Original_Price: number;
  Sale_Price: number;
}

export interface Inventory extends BaseEntity {
  Stock: number;
  warehouse: string;
  Reorder_Level: number;
}
