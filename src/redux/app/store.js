import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/users/userSlice';
import inventoryReducer from '../features/inventory/inventorySlice';
export const store = configureStore({
  reducer: {
    users: userReducer, // The key 'users' matches the slice name
    inventory: inventoryReducer,
  },
});