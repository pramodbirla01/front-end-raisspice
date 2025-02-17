import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { OrderState, OrdersState, Order } from '@/types/order';
import { databases } from '@/lib/appwrite';
import { Query, Models } from 'appwrite';

const ordersInitialState: OrdersState = {
  orders: [],
  allOrders: [], // Now TypeScript knows about this property
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalOrders: 0
};

const ORDERS_PER_PAGE = 10;

interface OrderDocument extends Models.Document {
  user_id: string;
  status: string;
  total_price: number;
  payment_type: string;
  email: string;
  address: string;
  city: string;
  state: string;
  phone_number: string;
  $createdAt: string;
}

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async ({ userId, page = 1 }: { userId: string; page?: number }) => {
    try {
      // Get all orders in a single query to get accurate count
      const response = await (databases.listDocuments as any)(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID!,
        [
          Query.equal('user_id', userId),
          Query.orderDesc('$createdAt'),
          Query.limit(100) // Increase limit to get all orders
        ]
      );

      console.log('Total orders found:', response.documents.length);

      // Process all orders
      const allOrders = response.documents.map((doc: Models.Document) => ({
        $id: doc.$id,
        user_id: doc.user_id,
        status: doc.status || 'pending',
        total_price: Number(doc.total_price) || 0,
        payment_type: doc.payment_type || 'N/A',
        created_at: doc.$createdAt,
        email: doc.email,
        address: doc.address,
        city: doc.city,
        state: doc.state,
        phone_number: doc.phone_number,
        first_name: doc.first_name,
        last_name: doc.last_name,
        payment_status: doc.payment_status,
        shipping_status: doc.shipping_status,
        order_items: doc.order_items
      }));

      // Calculate pagination
      const totalOrders = allOrders.length;
      const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE);
      const offset = (page - 1) * ORDERS_PER_PAGE;

      // Get paginated orders from the full list
      const paginatedOrders = allOrders.slice(offset, offset + ORDERS_PER_PAGE);

      console.log('Pagination details:', {
        totalOrders,
        totalPages,
        currentPage: page,
        ordersPerPage: ORDERS_PER_PAGE,
        paginatedOrdersCount: paginatedOrders.length
      });

      return {
        orders: paginatedOrders,
        allOrders: allOrders,
        totalOrders,
        currentPage: page,
        totalPages
      };
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      throw new Error(error.message || 'Failed to fetch orders');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: ordersInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.allOrders = action.payload.allOrders; // Store all orders
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalOrders = action.payload.totalOrders;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      });
  },
});

export default orderSlice.reducer;
