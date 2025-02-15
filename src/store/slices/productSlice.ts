import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProductsState, ProductFetchParams, Product } from '@/types/product';
import { Databases, Query, Client, Models } from 'appwrite';
import { getStorageFileUrl } from '@/lib/appwrite'; // Add this import

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

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 12, // Keep this consistent
    pageCount: 0,
    total: 0
  },
  filters: {},
  selectedProduct: null,
  singleProductLoading: false
};

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params: ProductFetchParams = {}) => {
    try {
      const pageSize = params.pageSize || 12;
      const page = params.page || 1;

      const queries = [
        Query.limit(pageSize),
        Query.offset((page - 1) * pageSize)
      ];

      // For array fields, we'll fetch all and filter in memory
      const response = await (databases.listDocuments as (
        databaseId: string,
        collectionId: string,
        queries?: string[]
      ) => Promise<Models.DocumentList<ProductDocument>>)(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_PRODUCT_COLLECTION_ID!,
        queries
      );

      // Filter results in memory based on category and collection
      let filteredDocs = response.documents;

      if (params.categorySlug) {
        const categoryId = Array.isArray(params.categorySlug) 
          ? params.categorySlug[0] 
          : params.categorySlug;
        filteredDocs = filteredDocs.filter(doc => 
          doc.category.includes(categoryId)
        );
      }

      if (params.collection_id) {
        const collectionId = Array.isArray(params.collection_id) 
          ? params.collection_id[0] 
          : params.collection_id;
        filteredDocs = filteredDocs.filter(doc => 
          doc.product_collection.includes(collectionId)
        );
      }

      const products = filteredDocs.map((doc) => ({
        $id: doc.$id,
        name: doc.name,
        description: doc.description,
        category: doc.category || [],
        weight: doc.weight || [],
        image: doc.image ? getStorageFileUrl(doc.image) : '/placeholder-image.jpg',
        additionalImages: Array.isArray(doc.additionalImages) 
          ? doc.additionalImages.map((imgId: string) => getStorageFileUrl(imgId))
          : [],
        stock: doc.stock || 0,
        product_collection: doc.product_collection || [],
        local_price: Array.isArray(doc.local_price) ? doc.local_price : [doc.local_price],
        sale_price: Array.isArray(doc.sale_price) ? doc.sale_price : [doc.sale_price],
      }));

      return {
        data: products,
        meta: {
          pagination: {
            page: page,
            pageSize: pageSize,
            pageCount: Math.ceil(filteredDocs.length / pageSize),
            total: filteredDocs.length
          }
        }
      };
    } catch (error) {
      console.error('Fetch products detailed error:', error);
      throw error;
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
      state.loading = false;
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.pagination = action.payload.meta.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      });
  }
});

export const { 
  setProducts, 
  setFilters, 
  setPage, 
  setLoading, 
  setError, 
  setPagination 
} = productSlice.actions;
export default productSlice.reducer;
