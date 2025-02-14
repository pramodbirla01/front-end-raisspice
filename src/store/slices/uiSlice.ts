import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isCartOpen: boolean;
}

const initialState: UiState = {
  isCartOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleCart: (state, action: PayloadAction<boolean>) => {
      state.isCartOpen = action.payload;
    },
  },
});

export const { toggleCart } = uiSlice.actions;
export default uiSlice.reducer;
