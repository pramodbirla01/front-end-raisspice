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
  full_name: string;
  mobile: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  type: string;
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
  $id: string;
  id: string; // Add this line
  email: string;
  full_name: string;
  created_at: string;
  // ...other properties...
}
