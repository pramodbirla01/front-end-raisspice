import { BaseEntity } from './common';

export interface ImageFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  size: number;
  width: number;
  height: number;
}

export interface ProductImage {
  id: number;
  documentId: string;
  name: string;
  formats: {
    large: ImageFormat;
    small: ImageFormat;
    medium: ImageFormat;
    thumbnail: ImageFormat;
  };
  url: string;
}

export interface Inventory {
  id: number;
  documentId: string;
  Stock: number;
  warehouse: string;
  Reorder_Level: number;
}

export interface Weight {
  id: number;
  documentId: string;
  weight_Value: number;
  original_Price: number;
  sale_Price: number;
  inventory: any[];
}

export interface Category {
  $id: string;
  name: string;
  description?: string;  // Made optional since it might not always be present
}

export interface ProductVariant {
  id: string;
  title: number;
  price: number;
  original_price: number;
  sale_price: number;
  inventory: number;
}

export interface Product {
  $id: string;
  name: string;
  description: string;
  category: string[];
  weight: number[];
  image: string;
  additionalImages: string[];
  stock: number;
  product_collection: string[];
  local_price: number[];
  sale_price: number[];
  slug?: string;
  variants?: ProductVariant[]; // Add this optional property
}

export interface Collection {
  $id: string;
  name: string;  // Changed from collection_name to name
}

export interface AppwriteCollection extends Collection {
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
}

export interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  filters: {
    categorySlug?: string;  // Change from category to categorySlug
    search?: string;
    sort?: string;
    collection_id?: string;
  };
  selectedProduct: Product | null;
  singleProductLoading: boolean;
  singleProductError?: string;
}

export interface ProductFetchParams {
  page?: number;
  pageSize?: number;
  categorySlug?: string | string[]; // Updated to handle array
  search?: string;
  weight?: number;
  sort?: string;
  collection_id?: string | string[]; // Updated to handle array
}

export interface ProductFetchBySlugParams {
  slug: string;
}
