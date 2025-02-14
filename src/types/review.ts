import { Models } from 'appwrite';

export interface Review {
  $id: string;
  review: string[];    // Empty array by default
  rating: number[];    // Empty array by default
  user: string[];     // Empty array by default
  title: string[];    // Empty array by default
  product_id: string; // Product ID reference
}