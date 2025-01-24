import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [],
  loading: false,
  Query: {
    searchQuery: "",
    FilterCriteria: "",
  },
  vendors: [],
  startCursor: "",
  endCursor: "",
  hasNextPage: false,
  hasPreviousPage: false,
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
    updateProductStatus: (state, action) => {
      const products = state.value;
      let { productsIdsToUpdate, Status } = action.payload;
      let updatedProducts = products.map((product) => {
        return productsIdsToUpdate.includes(product.id)
          ? { ...product, status: Status }
          : product;
      });

      return { ...state, value: updatedProducts };
    },
    setLoading: (state, action) => {
      return { ...state, loading: action.payload };
    },
    setQuery: (state, action) => {
      return { ...state, Query: action.payload };
    },
    setVendors: (state, action) => {
      return { ...state, vendors: action.payload };
    },
    setEndCursor: (state, action) => {
      return { ...state, endCursor: action.payload };
    },
    setStartCursor: (state, action) => {
      return { ...state, startCursor: action.payload };
    },
    setHasNextPage: (state, action) => {
      return { ...state, hasNextPage: action.payload };
    },
    setHasPreviousPage: (state, action) => {
      return { ...state, hasPreviousPage: action.payload };
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setProducts,
  setLoading,
  setQuery,
  setVendors,
  setHasNextPage,
  setHasPreviousPage,
  setEndCursor,
  setStartCursor,
  updateProductStatus,
} = productSlice.actions;

export default productSlice.reducer;
