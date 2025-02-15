import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { Customer } from '@/types/customer';
import { RootState } from '@/store/store';
import { databases } from '@/app/api/lib/appwrite';

export interface CustomerState {
  currentCustomer: Customer | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  orderLoading: boolean;
  orderError: string | null;
}

const TOKEN_COOKIE_NAME = 'auth_token';
const STORAGE_KEY = 'customer_data';

const setAuthToken = (token: string, rememberMe: boolean = false) => {
  const cookieOptions = {
    path: '/',
    sameSite: 'strict' as const,
    expires: rememberMe ? 30 : 1 // 30 days if remember me, session cookie if not
  };
  
  Cookies.set(TOKEN_COOKIE_NAME, token, cookieOptions);
};

const removeAuthToken = () => {
  Cookies.remove(TOKEN_COOKIE_NAME);
};

const loadFromStorage = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const token = Cookies.get(TOKEN_COOKIE_NAME);
    
    if (data && token) {
      const parsedData = JSON.parse(data);
      return {
        user: parsedData.user,
        token: token
      };
    }
  } catch (error) {
    console.error('Error loading from storage:', error);
    clearStorage();
    removeAuthToken();
  }
  return null;
};

const saveToStorage = (data: { user: Customer; token: string }) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

const clearStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
};

// Remove or comment out this export since we're not using it
// export const isAuthenticated = () => {
//   return !!Cookies.get('auth_token');
// };

const initialState: CustomerState = {
  currentCustomer: loadFromStorage()?.user || null,
  loading: false,
  error: null,
  token: loadFromStorage()?.token || null,
  orderLoading: false,
  orderError: null,
};

export const fetchCustomerOrders = createAsyncThunk(
  'customer/fetchOrders',
  async (token: string) => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      return data.orders;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch orders');
    }
  }
);

export const updateUserAddresses = createAsyncThunk(
  'customer/updateAddresses',
  async ({ userId, addresses }: { userId: string, addresses: string[] }) => {
    try {
      const response = await fetch(`/api/users/${userId}/addresses`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('auth_token')}`
        },
        body: JSON.stringify({ address: addresses }), // Note: using 'address' to match Appwrite field
      });

      if (!response.ok) {
        throw new Error('Failed to update addresses');
      }

      const data = await response.json();
      return data.user;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update addresses');
    }
  }
);

export const fetchUserAddresses = createAsyncThunk(
  'customer/fetchAddresses',
  async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/addresses`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('auth_token')}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }

      const data = await response.json();
      return data.addresses;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch addresses');
    }
  }
);

export const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setToken: (state: CustomerState, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    clearCustomerData: (state: CustomerState) => {
      state.currentCustomer = null
      state.token = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(registerCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(registerCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      .addCase(logoutCustomer.fulfilled, (state) => {
        state.currentCustomer = null;
        state.token = null;
        state.error = null;
      })
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.currentCustomer = null;
        state.token = null;
      })
      .addCase(fetchCustomerOrders.pending, (state) => {
        state.orderLoading = true;
        state.orderError = null;
      })
      .addCase(fetchCustomerOrders.fulfilled, (state, action) => {
        state.orderLoading = false;
        if (state.currentCustomer) {
          state.currentCustomer.orders = action.payload;
        }
      })
      .addCase(fetchCustomerOrders.rejected, (state, action) => {
        state.orderLoading = false;
        state.orderError = action.error.message || 'Failed to fetch orders';
      })
      .addCase(fetchUserAddresses.fulfilled, (state, action) => {
        if (state.currentCustomer) {
          state.currentCustomer.address = action.payload;
        }
      })
      .addCase(updateUserAddresses.fulfilled, (state, action) => {
        if (state.currentCustomer) {
          state.currentCustomer.address = action.payload.address;
        }
      });
  }
});

export const { setToken, clearCustomerData } = customerSlice.actions;

export const loginCustomer = createAsyncThunk(
  'customer/login',
  async (credentials: { email: string; password: string; rememberMe: boolean }) => {
    try {
      console.log('Attempting login for:', credentials.email);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Login failed:', data.message);
        throw new Error(data.message || 'Login failed');
      }

      console.log('Login successful!', data.user);
      setAuthToken(data.token, credentials.rememberMe);
      saveToStorage({ user: data.user, token: data.token });
      
      return {
        user: data.user,
        token: data.token
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }
);

export const registerCustomer = createAsyncThunk(
  'customer/register',
  async (userData: { 
    full_name: string; 
    email: string; 
    password: string;
  }) => {
    try {
      console.log('Attempting registration for:', userData.email);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userData,
          created_at: new Date().toISOString() // Ensure proper date format
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Registration failed:', data.message);
        throw new Error(data.message || 'Registration failed');
      }

      console.log('Registration successful!', data.user);
      setAuthToken(data.token);
      
      return {
        user: data.user,
        token: data.token
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  }
);

export const logoutCustomer = createAsyncThunk(
  'customer/logout',
  async (_, { dispatch }) => {
    removeAuthToken();
    clearStorage();
    dispatch(clearCustomerData());
  }
);

export const checkAuthStatus = createAsyncThunk(
  'customer/checkAuth',
  async (_, { rejectWithValue }) => {
    const stored = loadFromStorage();
    if (!stored?.token) {
      return rejectWithValue('No token found');
    }

    try {
      // First try to use stored data
      if (stored.user) {
        setAuthToken(stored.token); // Ensure token is set in cookies
        return stored;
      }

      // If no stored user data, verify with server
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${stored.token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        clearStorage();
        removeAuthToken();
        return rejectWithValue('Invalid token');
      }

      const data = await response.json();
      const result = { user: data.user, token: stored.token };
      saveToStorage(result);
      return result;
    } catch (error) {
      clearStorage();
      removeAuthToken();
      return rejectWithValue('Authentication failed');
    }
  }
);

export default customerSlice.reducer;
