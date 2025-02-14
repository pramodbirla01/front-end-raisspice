import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProductCategory, ProductCategoryState } from '@/types/product-category';
import { databases } from '@/lib/appwrite';
import { Query, Models } from 'appwrite';
import { getStorageFileUrl } from '@/lib/appwrite';

interface CategoryDocument extends Models.Document {
  name: string;
  description: string;
  sub_text: string;
  slug: string;
  image?: string;
}

const initialState: ProductCategoryState = {
  categories: [],
  loading: false,
  error: null
};

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
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
      
      console.log('Raw response from API:', response);

      return response.documents.map(doc => ({
        $id: doc.$id,
        name: doc.name || '',
        description: doc.description || '',
        sub_text: doc.sub_text || '',
        // slug: doc.slug || doc.name?.toLowerCase().replace(/\s+/g, '-') || '',
        // image: doc.image ? getStorageFileUrl(doc.image) : '/images/category-placeholder.jpg'
      }));
    } catch (error: any) {
      console.error('Error in fetchCategories:', error);
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
