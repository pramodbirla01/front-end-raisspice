import { Category as ProductCategory } from './product';

export interface CartItemWeight {
  weight_Value: number;
  original_Price: number;
  sale_Price: number;
}

export interface CartItem {
  id: string;
  documentId: string;
  name: string;
  quantity: number;
  weight: CartItemWeight;
  thumbnail: string;
  category: ProductCategory;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  created_at: string;
  updated_at: string;
  expires_at: string; // New field for expiration tracking
}

export interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  isCartOpen: boolean;  // Add this new property
}
