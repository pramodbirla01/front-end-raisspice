import { Order } from './order';

export interface CustomerAddress {
  id?: string;
  full_name: string;
  mobile: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  type: 'home' | 'office';
  is_default: boolean;
  user?: number;
}

export interface Address {
  id: string;
  type: 'home' | 'office';
  full_name: string;
  mobile: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export interface AddressData {
  houseNo: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  role: boolean;
  email_verified: boolean;
  created_at: string | Date;  // Allow both string and Date type
  $createdAt?: string;
  last_login?: string;
  address: string[];
  orders?: any[];
}
