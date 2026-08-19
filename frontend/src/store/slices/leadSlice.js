import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchLeads = createAsyncThunk('leads/fetchLeads', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/leads', { params });
    return response.data; // Includes data and pagination
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch leads');
  }
});

export const createLead = createAsyncThunk('leads/createLead', async (leadData, { rejectWithValue }) => {
  try {
    const response = await api.post('/leads', leadData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create lead');
  }
});

export const updateLead = createAsyncThunk('leads/updateLead', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/leads/${id}`, data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update lead');
  }
});

export const deleteLead = createAsyncThunk('leads/deleteLead', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/leads/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete lead');
  }
});

export const updateLeadStatus = createAsyncThunk('leads/updateLeadStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/leads/${id}/status`, { status });
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update status');
  }
});

const initialState = {
  leads: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  loading: false,
  error: null,
};

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.leads.unshift(action.payload);
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        const index = state.leads.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          // Keep populated relations if api doesn't return them full
          state.leads[index] = { ...state.leads[index], ...action.payload };
        }
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.leads = state.leads.filter(l => l.id !== action.payload);
      })
      .addCase(updateLeadStatus.fulfilled, (state, action) => {
        const index = state.leads.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.leads[index] = { ...state.leads[index], ...action.payload };
        }
      });
  },
});

export default leadSlice.reducer;
