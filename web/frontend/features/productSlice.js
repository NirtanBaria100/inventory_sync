import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [],
  loading: false,
  Query: {
    searchQuery: "",
    FilterCriteria: "",
  },
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      return { ...state, value: action.payload };
    },
    setLoading: (state, action) => {
      return { ...state, loading: action.payload };
    },
    setQuery: (state, action) => {
      return { ...state, Query: action.payload };
    },
  },
});

// Action creators are generated for each case reducer function
export const { setProducts, setLoading,setQuery } = productSlice.actions;

export default productSlice.reducer;
