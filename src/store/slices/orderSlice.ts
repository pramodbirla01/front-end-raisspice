import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { OrderState, Address } from '../../types/order';

const initialState: OrderState = {
  loading: false,
  error: null,
  order: null,
  shippingOptions: [],
  paymentProviders: [],
};

export const updateCartEmail = createAsyncThunk(
  'order/updateEmail',
  async ({ cartId, email }: { cartId: string; email: string }) => {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
    const response = await fetch(`${backendUrl}/store/carts/${cartId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'temp',
      },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    return data.cart;
  }
);

export const updateCartAddresses = createAsyncThunk(
  'order/updateAddresses',
  async ({ cartId, address }: { cartId: string; address: Address }) => {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
    const response = await fetch(`${backendUrl}/store/carts/${cartId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'temp',
      },
      body: JSON.stringify({
        shipping_address: address,
        billing_address: address,
      }),
    });
    const data = await response.json();
    return data.cart;
  }
);

export const fetchShippingOptions = createAsyncThunk(
  'order/fetchShippingOptions',
  async (cartId: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
    const response = await fetch(`${backendUrl}/store/shipping-options?cart_id=${cartId}`, {
      credentials: 'include',
      headers: {
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'temp',
      },
    });
    const data = await response.json();
    return data.shipping_options;
  }
);

export const addShippingMethod = createAsyncThunk(
  'order/addShippingMethod',
  async ({ cartId, optionId }: { cartId: string; optionId: string }) => {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
    const response = await fetch(`${backendUrl}/store/carts/${cartId}/shipping-methods`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'temp',
      },
      body: JSON.stringify({ option_id: optionId }),
    });
    const data = await response.json();
    return data.cart;
  }
);

export const completeCart = createAsyncThunk(
  'order/complete',
  async (cartId: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
    const response = await fetch(`${backendUrl}/store/carts/${cartId}/complete`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'temp',
      },
    });
    const data = await response.json();
    
    if (data.type === 'order') {
      localStorage.removeItem('cart_id');
      return data.order;
    }
    
    throw new Error(data.error?.message || 'Failed to complete order');
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add cases for all async thunks
      .addCase(updateCartEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartEmail.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateCartEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update email';
      })
      // ...similar patterns for other thunks...
      .addCase(completeCart.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      });
  },
});

export default orderSlice.reducer;
