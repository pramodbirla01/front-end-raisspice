import { Models } from 'appwrite';

export interface ProductCategory {
  $id: string;
  name: string;
  sub_text: string;
  description: string;
  slug?: string;
}

export interface ProductCategoryState {
  categories: ProductCategory[];
  loading: boolean;
  error: string | null;
}
