import { Models } from 'appwrite';

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
  name: string;
  price: number;
  quantity: number;
  variant: {
    id: string;
    title: number;
    price: number;
  };
}

export interface Order extends Models.Document {
  address: string;
  status: string;
  user_id: string;
  email: string;
  state: string;
  city: string;
  country: string;
  phone_number: string;
  payment_type: string;
  payment_status: string;
  shipping_status: string;
  payment_amount: number;
  total_price: number;
  pincode: number;
  first_name: string;
  last_name: string;
  order_items: string | number;
  product_ids: string[];
  coupon_code?: string;
  coupon_discount?: number;
  discount_price?: number;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  shiprocket_order_id?: string;
  shiprocket_shipment_id?: string;
  tracking_id?: string;
  refund_id?: string;
  refund_status?: string;
  refund_due?: string;
  cancellation_fee?: number;
  refund_amount?: number;
  label_url?: string;
  manifest_url?: string;
  idempotency_key: string;
  created_at: string;
}

export interface OrdersState {
  orders: Order[];
  allOrders: Order[]; // Add this line
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalOrders: number;
}
