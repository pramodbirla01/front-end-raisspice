import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CollectionState, Collection } from '@/types/collection';
import { databases } from '@/lib/appwrite';
import { Query, Models } from 'appwrite';

const initialState: CollectionState = {
  collections: [],
  loading: false,
  error: null,
  pagination: {
    limit: 25,
    currentPage: 1,
    count: 0
  }
};

export const fetchCollections = createAsyncThunk(
  'collections/fetchAll',
  async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COLLECTION_ID!,
        [
          Query.limit(100)
        ]
      );
      
      const collections: Collection[] = response.documents.map(doc => ({
        id: doc.$id, // Use string ID instead of parsing to number
        documentId: doc.$id,
        name: doc.name,
        description: doc.description,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
        publishedAt: doc.$createdAt
      }));

      return {
        collections,
        count: response.total
      };
    } catch (error) {
      throw new Error('Failed to fetch collections');
    }
  }
);

const collectionSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = action.payload.collections;
        state.pagination.count = action.payload.count;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch collections';
      });
  }
});

export const { setCurrentPage } = collectionSlice.actions;
export default collectionSlice.reducer;
