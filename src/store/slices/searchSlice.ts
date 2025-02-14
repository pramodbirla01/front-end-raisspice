import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { databases, Models } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { getStorageFileUrl } from '@/lib/appwrite';

interface ProductDocument extends Models.Document {
  name: string;
  description: string;
  category: string[];
  weight: number[];
  image: string;
  additionalImages?: string[];
  stock: number;
  product_collection: string[];
  local_price: number[];
  sale_price: number[];
}

interface SearchState {
  searchResults: ProductDocument[];
  loading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  searchResults: [],
  loading: false,
  error: null
};

export const searchProducts = createAsyncThunk(
  'search/performSearch',
  async (query: string) => {
    try {
      if (!query.trim()) return [];

      // Using string matching instead of fulltext index
      const response = await (databases.listDocuments as (
        databaseId: string,
        collectionId: string,
        queries?: string[]
      ) => Promise<Models.DocumentList<ProductDocument>>)(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_PRODUCT_COLLECTION_ID!,
        [
          Query.startsWith('name', query), // Changed from search to startsWith
          Query.orderDesc('$createdAt'),
          Query.limit(6)
        ]
      );

      // Also check for partial matches in the name
      const results = response.documents.filter(doc => 
        doc.name.toLowerCase().includes(query.toLowerCase())
      );

      return results.map(doc => ({
        ...doc,
        image: doc.image ? getStorageFileUrl(doc.image) : '/placeholder-image.jpg'
      }));
    } catch (error: any) {
      console.error('Search error:', error);
      throw new Error(error.message || 'Failed to search products');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearSearch: (state) => {
      state.searchResults = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Search failed';
      });
  }
});

export const { clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
