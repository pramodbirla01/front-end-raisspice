import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { ProductFetchParams } from '@/types/product';

export const fetchProductsFromDB = async (params: ProductFetchParams) => {
  const { page = 1, pageSize = 12, categorySlug, collection_id, sort } = params;
  const offset = (page - 1) * pageSize;

  let queries = [
    Query.limit(pageSize),
    Query.offset(offset)
  ];

  // Fix: Use contains() for array fields
  if (categorySlug) {
    queries.push(Query.contains('category', 
      Array.isArray(categorySlug) ? categorySlug[0] : categorySlug
    ));
  }

  if (collection_id) {
    queries.push(Query.contains('product_collection', 
      Array.isArray(collection_id) ? collection_id[0] : collection_id
    ));
  }

  if (sort) {
    queries.push(Query.orderDesc(sort));
  }

  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_PRODUCT_COLLECTION_ID!,
      queries
    );

    return {
      documents: response.documents,
      total: response.total,
      pageCount: Math.ceil(response.total / pageSize)
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};
