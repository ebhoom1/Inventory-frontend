// src/redux/features/inventory/inventorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  addInventoryApi,
  listInventoryApi,
  logUsageApi,
  listSummaryApi,
  updateInventoryApi,
} from './inventoryService';

// ✅ IMPORT: Import the assignment action from the equipment slice
import { assignEquipment } from '../equipment/equipmentSlice';

// --- Thunks ---

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

export const logInventoryUsage = createAsyncThunk('inventory/logUsage', async (payload, thunkAPI) => {
  try {
    return await logUsageApi(payload, thunkAPI.getState);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message || 'Usage logging failed');
  }
});

export const fetchInventorySummary = createAsyncThunk(
  'inventory/fetchSummary',
  async (userId = "all", thunkAPI) => {
    try {
      return await listSummaryApi(thunkAPI.getState, userId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || 'Fetch summary failed');
    }
  }
);

export const updateInventory = createAsyncThunk(
  'inventory/update',
  async ({ id, ...payload }, thunkAPI) => {
    try {
      return await updateInventoryApi(id, payload, thunkAPI.getState);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || 'Update inventory failed');
    }
  }
);

const initialState = {
  items: [],                 
  summary: [],               
  loading: false,
  error: null,
  lastAdded: null,
  usageLoading: false,       
  usageError: null,          
  lastUsage: null,           
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

      // log usage
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

      // fetch summary
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
      })

      // update inventory
      .addCase(updateInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInventory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item._id === action.meta.arg.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload.inventory };
        }
      })
      .addCase(updateInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Update failed';
      })

      // ✅ ADDED: Listen for successful assignments and update stock locally
      .addCase(assignEquipment.fulfilled, (state, action) => {
        const { skuName, assigned } = action.payload; 
        const itemIndex = state.items.findIndex(item => item.skuName === skuName);
        
        if (itemIndex !== -1) {
          // 1. Reduce the quantity in the local state
          state.items[itemIndex].quantity -= assigned;
          
          // 2. Filter out the assigned serial numbers from the available list
          if (state.items[itemIndex].serialNumbers && action.payload.serialNumbers) {
            state.items[itemIndex].serialNumbers = state.items[itemIndex].serialNumbers.filter(
              sn => !action.payload.serialNumbers.includes(sn)
            );
          }
          
          // 3. Remove item from list if stock reaches zero
          if (state.items[itemIndex].quantity <= 0) {
            state.items.splice(itemIndex, 1);
          }
        }
         const summaryIndex = state.summary.findIndex(s => s.skuName === skuName);
  if (summaryIndex !== -1) {
    state.summary[summaryIndex].left -= assigned;
    if (state.summary[summaryIndex].left <= 0) {
      state.summary.splice(summaryIndex, 1);
    }
  }
      });
  },
});

export const { resetInventoryState } = inventorySlice.actions;
export default inventorySlice.reducer;