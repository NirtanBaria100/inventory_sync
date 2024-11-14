import { configureStore } from '@reduxjs/toolkit';
import dataReducer from '../features/dataSlice'

export const store = configureStore({
  reducer: {
    data: dataReducer,
  },
});


// import { configureStore } from '@reduxjs/toolkit';
// import { persistStore, persistReducer } from 'redux-persist';
// // import storage from 'redux-persist/lib/storage'; 
// import storage from 'redux-persist/lib/storage/session'; 
// import { combineReducers } from 'redux'; // Import combineReducers
// import dataReducer from '../features/dataSlice';

// // Persist config
// const persistConfig = {
//   key: 'root',
//   storage,
// };

// // Combine reducers
// const rootReducer = combineReducers({
//   data: dataReducer,
// });

// // Create a persisted reducer
// const persistedReducer = persistReducer(persistConfig, rootReducer);

// // Configure the store
// export const store = configureStore({
//   reducer: persistedReducer,
// });

// // Create a persistor
// export const persistor = persistStore(store);
