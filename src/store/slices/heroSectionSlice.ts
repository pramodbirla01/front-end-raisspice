import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { databases } from '@/lib/appwrite';
import { Query, Models } from 'appwrite';

interface HeroSection extends Models.Document {
  heading: string;
  sub_text: string;
  button: string;
  image: string;
  slug: string;
}

interface HeroSectionState {
  heroSections: HeroSection[];
  loading: boolean;
  error: string | null;
}

const initialState: HeroSectionState = {
  heroSections: [],
  loading: false,
  error: null,
};

export const fetchHeroSections = createAsyncThunk(
  'heroSection/fetchAll',
  async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_HERO_COLLECTION_ID!,
        [
          Query.orderDesc('$createdAt'),
          Query.limit(10)
        ]
      );
      return response.documents as unknown as HeroSection[];
    } catch (error) {
      throw new Error('Failed to fetch hero sections');
    }
  }
);

const heroSectionSlice = createSlice({
  name: 'heroSection',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHeroSections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHeroSections.fulfilled, (state, action) => {
        state.loading = false;
        state.heroSections = action.payload;
        state.error = null;
      })
      .addCase(fetchHeroSections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch hero sections';
      });
  },
});

export default heroSectionSlice.reducer;
