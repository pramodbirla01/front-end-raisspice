export interface Address {
  first_name: string;
  last_name: string;
  address_1: string;
  company?: string;
  postal_code: string;
  city: string;
  country_code: string;
  province?: string;
  phone?: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  amount: number;
  price_type: 'flat' | 'calculated';
}

export interface OrderState {
  loading: boolean;
  error: string | null;
  order: any | null;
  shippingOptions: ShippingOption[];
  paymentProviders: any[];
}

export interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  name: string;
}

export interface Order {
  $id: string; // Document ID from Appwrite
  user_id: string;
  email: string;
  status: string;
  address: string;
  state: string;
  city: string;
  pincode: number;
  phone_number: string;
  payment_type: string;
  total_price: number;
  payment_status: string;
  shipping_status: string;
  created_at: string;
  order_items: OrderItem[];
}
