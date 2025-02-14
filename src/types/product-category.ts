import { Models } from 'appwrite';

export interface ProductCategory extends Models.Document {
  name: string;
  sub_text: string;
  description: string;
}

export interface ProductCategoryState {
  categories: ProductCategory[];
  loading: boolean;
  error: string | null;
}
