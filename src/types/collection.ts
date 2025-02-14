import { BaseEntity } from './common';
import { Product } from './product';

export interface Collection extends BaseEntity {
  documentId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface CollectionState {
  collections: Collection[];
  loading: boolean;
  error: string | null;
  pagination: {
    limit: number;
    currentPage: number;
    count: number;
  };
}
