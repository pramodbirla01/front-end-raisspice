import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { CartState, CartItem, Cart } from '../../types/cart'
import { Product, Weight } from '../../types/product'
import Cookies from 'js-cookie'
import { v4 as uuidv4 } from 'uuid'

const CART_COOKIE_NAME = 'cart_data';
const CART_EXPIRY_HOURS = 1;

const getExpirationTime = () => {
  return new Date(Date.now() + CART_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
};

const isCartExpired = (expiresAt: string) => {
  return new Date(expiresAt) <= new Date();
};

const getCartFromCookie = (): Cart | null => {
  const cartData = Cookies.get(CART_COOKIE_NAME);
  if (!cartData) return null;
  
  const cart = JSON.parse(cartData);
  if (isCartExpired(cart.expires_at)) {
    Cookies.remove(CART_COOKIE_NAME);
    return null;
  }
  return cart;
};

const setCartInCookie = (cart: Cart) => {
  Cookies.set(CART_COOKIE_NAME, JSON.stringify(cart), {
    expires: CART_EXPIRY_HOURS/24, // Convert hours to days for cookie expiry
    sameSite: 'strict'
  });
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => 
    sum + (item.weight.sale_Price * item.quantity), 0
  );
};

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
  isCartOpen: false, // Initialize the new state
};

export const createCart = createAsyncThunk(
  'cart/create',
  async () => {
    const newCart: Cart = {
      id: `cart_${uuidv4()}`, // Add prefix
      items: [],
      total: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: getExpirationTime()
    };
    setCartInCookie(newCart);
    return newCart;
  }
);

export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async () => {
    const cart = getCartFromCookie();
    if (!cart) {
      throw new Error('No valid cart found');
    }
    return cart;
  }
);

export const addToCart = createAsyncThunk(
  'cart/addItem',
  async ({ product, weightIndex, quantity }: { 
    product: Product & { weights: Weight[] }, 
    weightIndex: number, 
    quantity: number 
  }) => {
    let cart = getCartFromCookie();
    if (!cart) {
      // Generate a new unique cart ID
      cart = {
        id: `cart_${uuidv4()}`, // Add prefix to make it more unique
        items: [],
        total: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        expires_at: getExpirationTime()
      };
    }

    const selectedWeight = product.weights[weightIndex];
    const existingItemIndex = cart.items.findIndex(
      item => item.documentId === product.$id && 
              item.weight.weight_Value === selectedWeight.weight_Value
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item with unique ID
      cart.items.push({
        id: `item_${uuidv4()}`, // Add prefix to make it more unique
        documentId: product.$id,
        name: product.name,
        quantity,
        weight: {
          weight_Value: selectedWeight.weight_Value,
          original_Price: selectedWeight.original_Price,
          sale_Price: selectedWeight.sale_Price,
        },
        thumbnail: product.image,
        category: { 
          $id: product.category[0],
          name: 'Unknown' // You might want to fetch the actual category name
        }
      });
    }

    cart.total = calculateTotal(cart.items);
    cart.updated_at = new Date().toISOString();
    cart.expires_at = getExpirationTime();
    
    setCartInCookie(cart);
    return cart;
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ lineId, quantity }: { lineId: string; quantity: number }) => {
    const cart = getCartFromCookie();
    if (!cart) throw new Error('No cart found');

    const updatedCart = {
      ...cart,
      items: cart.items.map((item: CartItem) => 
        item.id === lineId ? { ...item, quantity } : item
      ),
      updated_at: new Date().toISOString(),
      expires_at: getExpirationTime()
    };
    updatedCart.total = calculateTotal(updatedCart.items);
    setCartInCookie(updatedCart);
    return updatedCart;
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async ({ lineId }: { lineId: string }) => {
    const cart = getCartFromCookie();
    if (!cart) throw new Error('No cart found');

    const updatedCart = {
      ...cart,
      items: cart.items.filter((item: any) => item.id !== lineId),
      updated_at: new Date().toISOString(),
      expires_at: getExpirationTime()
    };
    setCartInCookie(updatedCart);
    if (updatedCart.items.length === 0) {
      Cookies.remove(CART_COOKIE_NAME);
    }
    return updatedCart;
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cart = null;
      state.loading = false;
      state.error = null;
      Cookies.remove(CART_COOKIE_NAME);
    },
    refreshCartExpiry: (state) => {
      if (state.cart) {
        state.cart.expires_at = getExpirationTime();
        setCartInCookie(state.cart);
      }
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isCartOpen = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCart.fulfilled, (state, action) => {
        state.loading = false
        state.cart = action.payload
      })
      .addCase(createCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create cart'
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false
        state.cart = action.payload
        state.isCartOpen = true; // Automatically open cart when item is added
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to add item to cart'
      })
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cart';
        Cookies.remove(CART_COOKIE_NAME);
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
        if (!action.payload?.items?.length) {
          Cookies.remove(CART_COOKIE_NAME);
        }
      });
  },
})

export const { clearCart, refreshCartExpiry, setCartOpen } = cartSlice.actions
export default cartSlice.reducer



