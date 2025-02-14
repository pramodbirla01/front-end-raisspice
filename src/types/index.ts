export interface CustomerAddress {
  id: string;
  address: string;
  city: string;
  country: string;
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  addresses: CustomerAddress[];
}

export * from './customer';
export * from './cart';
// Export other type modules as needed