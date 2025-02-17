import { configureStore } from '@reduxjs/toolkit'
import productCategoryReducer from './slices/productCategorySlice'
import productReducer from './slices/productSlice'
import cartReducer from './slices/cartSlice'
import orderReducer from './slices/orderSlice'
import collectionReducer from './slices/collectionSlice'
import customerReducer from './slices/customerSlice'
import searchReducer from './slices/searchSlice'
import heroSectionReducer from './slices/heroSectionSlice'
import categoryReducer from './slices/categorySlice'
import ordersReducer from './slices/orderSlice'

export const store = configureStore({
  reducer: {
    productCategories: productCategoryReducer,
    categories: categoryReducer,
    products: productReducer,
    cart: cartReducer,
    order: orderReducer,
    collections: collectionReducer,
    customer: customerReducer,
    search: searchReducer,
    heroSection: heroSectionReducer,
    orders: ordersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Add this if you get serialization errors
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
