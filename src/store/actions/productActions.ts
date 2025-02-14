import { createAsyncThunk } from '@reduxjs/toolkit';
import { ProductFetchParams } from '@/types/product';
import { fetchProductsFromDB } from '@/utils/db';
import { setProducts, setLoading, setError, setPagination } from '../slices/productSlice';
import { getStorageFileUrl } from '@/lib/appwrite';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: ProductFetchParams, { dispatch }) => {
    dispatch(setLoading(true));
    
    try {
      const { documents, total, pageCount } = await fetchProductsFromDB(params);
      
      const mappedProducts = documents.map(product => ({
        $id: product.$id,
        name: product.name,
        description: product.description,
        category: product.category || [],
        weight: product.weight || [],
        image: getStorageFileUrl(product.image),
        additionalImages: (product.additionalImages || []).map((imgId: string) => getStorageFileUrl(imgId)),
        stock: product.stock || 0,
        product_collection: product.product_collection || [],
        local_price: product.local_price || [0],
        sale_price: product.sale_price || [0],
        slug: product.$id
      }));

      dispatch(setProducts(mappedProducts));
      dispatch(setPagination({ total, pageCount }));
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'An error occurred'));
      dispatch(setLoading(false));
    }
  }
);
