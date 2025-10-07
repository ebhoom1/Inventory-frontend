// src/redux/features/equipment/equipmentSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createEquipmentApi,
  getEquipmentsApi,
  getEquipmentByIdApi,
  updateEquipmentApi,
  deleteEquipmentApi,
} from "./equipmentService";

// CREATE
export const createEquipment = createAsyncThunk(
  "equipment/create",
  async (formData, { getState, rejectWithValue }) => {
    try {
      const res = await createEquipmentApi(formData, getState);
      return res; // { message, equipment }
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create equipment");
    }
  }
);

// LIST
export const getEquipments = createAsyncThunk(
  "equipment/list",
  async (_payload, { getState, rejectWithValue }) => {
    try {
      const list = await getEquipmentsApi(getState);
      return list; // array
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch equipments");
    }
  }
);

// GET BY ID
export const getEquipmentById = createAsyncThunk(
  "equipment/getById",
  async (id, { getState, rejectWithValue }) => {
    try {
      const eq = await getEquipmentByIdApi(id, getState);
      return eq; // object
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch equipment");
    }
  }
);

// UPDATE
export const updateEquipment = createAsyncThunk(
  "equipment/update",
  async ({ id, updates }, { getState, rejectWithValue }) => {
    try {
      const res = await updateEquipmentApi({ id, updates }, getState);
      return res; // { message, equipment }
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update equipment");
    }
  }
);

// DELETE
export const deleteEquipment = createAsyncThunk(
  "equipment/delete",
  async (id, { getState, rejectWithValue }) => {
    try {
      const res = await deleteEquipmentApi(id, getState);
      return { id, ...res }; // { id, message }
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete equipment");
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  successMessage: null,

  list: [],
  selected: null, // equipment fetched by id
};

const equipmentSlice = createSlice({
  name: "equipment",
  initialState,
  reducers: {
    resetEquipmentState: (state) => {
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
    clearSelectedEquipment: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || "Equipment created";
        if (action.payload?.equipment) {
          state.list = [action.payload.equipment, ...state.list]; // optimistic add
        }
      })
      .addCase(createEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // LIST
      .addCase(getEquipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEquipments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getEquipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET BY ID
      .addCase(getEquipmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selected = null;
      })
      .addCase(getEquipmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload || null;
      })
      .addCase(getEquipmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || "Equipment updated";
        const updated = action.payload?.equipment;
        if (updated) {
          state.list = state.list.map((e) =>
            (e._id || e.id) === (updated._id || updated.id) ? updated : e
          );
          // keep selected in sync if it’s the same one
          if (state.selected && (state.selected._id || state.selected.id) === (updated._id || updated.id)) {
            state.selected = updated;
          }
        }
      })
      .addCase(updateEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || "Equipment deleted";
        const deletedId = action.payload?.id;
        if (deletedId) {
          state.list = state.list.filter(
            (e) => (e._id || e.id) !== deletedId
          );
          if (state.selected && (state.selected._id || state.selected.id) === deletedId) {
            state.selected = null;
          }
        }
      })
      .addCase(deleteEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetEquipmentState, clearSelectedEquipment } = equipmentSlice.actions;
export default equipmentSlice.reducer;
