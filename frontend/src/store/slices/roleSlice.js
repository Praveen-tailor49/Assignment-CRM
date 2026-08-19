import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchRoles = createAsyncThunk('roles/fetchRoles', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/roles');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch roles');
  }
});

export const fetchPermissions = createAsyncThunk('roles/fetchPermissions', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/roles/permissions');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch permissions');
  }
});

export const createRole = createAsyncThunk('roles/createRole', async (roleData, { rejectWithValue }) => {
  try {
    const response = await api.post('/roles', roleData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create role');
  }
});

export const updateRolePermissions = createAsyncThunk('roles/updateRolePermissions', async ({ id, permissionIds }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/roles/${id}/permissions`, { permissionIds });
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to assign permissions');
  }
});

const roleSlice = createSlice({
  name: 'roles',
  initialState: { roles: [], permissions: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => { state.loading = true; })
      .addCase(fetchRoles.fulfilled, (state, action) => { state.loading = false; state.roles = action.payload; })
      .addCase(fetchRoles.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchPermissions.fulfilled, (state, action) => { state.permissions = action.payload; })
      .addCase(createRole.fulfilled, (state, action) => { state.roles.push(action.payload); })
      .addCase(updateRolePermissions.fulfilled, (state, action) => {
        const index = state.roles.findIndex(r => r.id === action.payload.id);
        if (index !== -1) state.roles[index] = action.payload;
      });
  },
});

export default roleSlice.reducer;
