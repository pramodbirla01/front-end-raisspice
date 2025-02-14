import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ProductCategory, ProductCategoryState } from '../../types/product-category'
import { databases } from '@/lib/appwrite';
import { Models } from 'appwrite';

const initialState: ProductCategoryState = {
  categories: [],
  loading: false,
  error: null as string | null,
}

export const fetchProductCategories = createAsyncThunk(
  'productCategories/fetch',
  async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CATEGORY_COLLECTION_ID!
      );
      
      return response.documents as unknown as ProductCategory[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch categories');
    }
  }
)

const productCategorySlice = createSlice({
  name: 'productCategories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchProductCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      });
  },
});

export default productCategorySlice.reducer;
