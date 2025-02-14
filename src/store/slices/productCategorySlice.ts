import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProductCategory, ProductCategoryState } from '@/types/product-category';
import { databases } from '@/lib/appwrite';
import { Query, Models } from 'appwrite';

interface CategoryDocument extends Models.Document {
  name: string;
  description: string;
  sub_text: string;
}

const initialState: ProductCategoryState = {
  categories: [],
  loading: false,
  error: null
};

export const fetchProductCategories = createAsyncThunk(
  'productCategories/fetchAll',
  async () => {
    try {
      const response = await (databases.listDocuments as (
        databaseId: string,
        collectionId: string,
        queries?: string[]
      ) => Promise<Models.DocumentList<CategoryDocument>>)(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CATEGORY_COLLECTION_ID!,
        [Query.limit(100)]
      );

      console.log('Raw category data:', response.documents);

      return response.documents.map(doc => ({
        $id: doc.$id,
        name: doc.name,
        description: doc.description,
        sub_text: doc.sub_text,
        slug: doc.name.toLowerCase().replace(/\s+/g, '-')
      }));
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      throw new Error(error.message || 'Failed to fetch categories');
    }
  }
);

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
  }
});

export default productCategorySlice.reducer;
