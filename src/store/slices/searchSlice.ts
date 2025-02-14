import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { Product } from '@/types/product';
import { Product } from '@/src/types/product';
interface SearchState {
  searchResults: Product[];
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
  async ({ query }: { query: string }) => {
    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_BACKEND_URL;
    if (!baseUrl) throw new Error('NEXT_PUBLIC_STRAPI_BACKEND_URL is not defined');

    const response = await fetch(
      `${baseUrl}/api/products?filters[name][$containsi]=${query}&populate[Images]=true&populate[category]=true&populate[weights][populate][inventory]=true`
    );

    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();
    return data.data;
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
