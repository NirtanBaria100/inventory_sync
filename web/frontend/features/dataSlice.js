import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: '',
  storeName: '',
  key: '',
  type: '',
  newUser: true,
  intialLoading: true
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setStartStoreData: (state, action) => {
      const { id, storeName, key, type, newUser,  intialLoading} = action.payload;
      state.id = id;
      state.storeName = storeName;
      state.key = key;
      state.type = type;
      state.newUser = newUser,
      state.intialLoading = intialLoading
    },
  },
});

export const { setStartStoreData } = dataSlice.actions;

export default dataSlice.reducer;
