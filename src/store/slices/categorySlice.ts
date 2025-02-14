import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProductCategory, ProductCategoryState } from '@/types/product-category';
import { databases } from '@/lib/appwrite';
import { Models } from 'appwrite';

const initialState: ProductCategoryState = {
  categories: [],
  loading: false,
  error: null
};

export const fetchCategories = createAsyncThunk<ProductCategory[], void>(
  'categories/fetchAll',
  async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CATEGORY_COLLECTION_ID!
      );
      
      // Properly type cast the documents
      return response.documents as unknown as ProductCategory[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch categories');
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      });
  }
});

export default categorySlice.reducer;
