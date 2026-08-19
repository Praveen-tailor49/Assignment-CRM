import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import leadReducer from './slices/leadSlice';
import userReducer from './slices/userSlice';
import roleReducer from './slices/roleSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    leads: leadReducer,
    users: userReducer,
    roles: roleReducer,
  },
});

export default store;
