// src/redux/features/inventory/inventorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  addInventoryApi,
  listInventoryApi,
  logUsageApi,
  listSummaryApi,
} from './inventoryService';

// existing thunks
export const addInventory = createAsyncThunk('inventory/add', async (payload, thunkAPI) => {
  try {
    return await addInventoryApi(payload, thunkAPI.getState);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message || 'Add inventory failed');
  }
});

export const fetchInventory = createAsyncThunk('inventory/fetchAll', async (_, thunkAPI) => {
  try {
    return await listInventoryApi(thunkAPI.getState);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message || 'Fetch inventory failed');
  }
});

// NEW: log usage
export const logInventoryUsage = createAsyncThunk('inventory/logUsage', async (payload, thunkAPI) => {
  try {
    // payload: { skuName, userId, quantityUsed, date, notes? }
    return await logUsageApi(payload, thunkAPI.getState);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message || 'Usage logging failed');
  }
});

// NEW: fetch summary for list view
export const fetchInventorySummary = createAsyncThunk(
  'inventory/fetchSummary',
  async (userId = "all", thunkAPI) => {
    try {
      // Pass selected userId (or "all") to API
      return await listSummaryApi(thunkAPI.getState, userId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || 'Fetch summary failed');
    }
  }
);
const initialState = {
  items: [],                 // raw add records (if you still need them)
  summary: [],               // NEW: per-SKU summary
  loading: false,
  error: null,
  lastAdded: null,
  usageLoading: false,       // NEW
  usageError: null,          // NEW
  lastUsage: null,           // NEW
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    resetInventoryState: (state) => {
      state.loading = false;
      state.error = null;
      state.lastAdded = null;
      state.usageLoading = false;
      state.usageError = null;
      state.lastUsage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // add
      .addCase(addInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.lastAdded = action.payload?.inventory || null;
        if (action.payload?.inventory) {
          state.items.unshift(action.payload.inventory);
        }
      })
      .addCase(addInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Add inventory failed';
      })

      // fetch raw items
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Fetch inventory failed';
      })

      // NEW: log usage
      .addCase(logInventoryUsage.pending, (state) => {
        state.usageLoading = true;
        state.usageError = null;
        state.lastUsage = null;
      })
      .addCase(logInventoryUsage.fulfilled, (state, action) => {
        state.usageLoading = false;
        state.lastUsage = action.payload?.usage || null;
      })
      .addCase(logInventoryUsage.rejected, (state, action) => {
        state.usageLoading = false;
        state.usageError = action.payload || 'Usage logging failed';
      })

      // NEW: fetch summary
      .addCase(fetchInventorySummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventorySummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchInventorySummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Fetch summary failed';
      });
  },
});

export const { resetInventoryState } = inventorySlice.actions;
export default inventorySlice.reducer;
