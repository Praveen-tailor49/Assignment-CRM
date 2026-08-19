import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchUsers = createAsyncThunk('users/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/users');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
  }
});

export const createUser = createAsyncThunk('users/createUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('/users', userData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create user');
  }
});

export const updateUser = createAsyncThunk('users/updateUser', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/users/${id}`, data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update user');
  }
});

export const updateUserRoles = createAsyncThunk('users/updateUserRoles', async ({ id, roleIds }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/users/${id}/roles`, { roleIds });
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to assign roles');
  }
});

export const deleteUser = createAsyncThunk('users/deleteUser', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/users/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
  }
});

const userSlice = createSlice({
  name: 'users',
  initialState: { users: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchUsers.fulfilled, (state, action) => { state.loading = false; state.users = action.payload; })
      .addCase(fetchUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createUser.fulfilled, (state, action) => { state.users.push(action.payload); })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) state.users[index] = action.payload;
      })
      .addCase(updateUserRoles.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) state.users[index] = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload);
      });
  },
});

export default userSlice.reducer;
