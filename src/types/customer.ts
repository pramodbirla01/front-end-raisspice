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
  full_name: string;
  mobile: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  type: 'home' | 'office' | 'other';
  is_default: boolean;
  id: string;
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
  $id: string;
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  role: boolean;
  email_verified: boolean;
  last_login?: string;
  address?: string[];
}
