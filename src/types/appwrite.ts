import { Models } from 'node-appwrite';
import { AddressData } from './customer';

export interface UserDocument extends Models.Document {
  id: string;
  full_name: string;
  email: string;
  email_verified: boolean;
  resetToken?: string;
  resetTokenExpiry?: string;
  last_login?: string;
  created_at: string;
  password: string;
  phone?: number;
  updated_at?: string;
  role: boolean;
  address: string[];
  orders: string[];
}
