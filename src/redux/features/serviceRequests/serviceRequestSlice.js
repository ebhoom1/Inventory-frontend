// src/redux/features/serviceRequests/serviceRequestSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createServiceRequestApi,
  getServiceRequestsApi,
  getAllServiceRequestsApi,
  getServiceRequestByIdApi,
  updateServiceRequestStatusApi,
  deleteServiceRequestApi,
  getServiceHistoryApi,
  getServiceRequestsByUserIdApi, // NEW
  getServiceDueApi,   markServiceRequestSeenApi           // NEW: /api/service-requests/due
} from "./serviceRequestService";

/* ----------------------------- Thunk Helpers ----------------------------- */
const rejectMsg = (e) => e?.message || "Something went wrong";

const asPaginated = (payload, fallbackPageSize = 20) => ({
  items: payload?.items || [],
  total: payload?.total || 0,
  page: payload?.page || 1,
  pageSize: payload?.pageSize || fallbackPageSize,
  totalPages: payload?.totalPages || 1,
  hasNextPage: !!payload?.hasNextPage,
  hasPrevPage: !!payload?.hasPrevPage,
});

const upsertById = (arr, item) => {
  if (!item) return arr;
  const id = item._id || item.id;
  if (!id) return arr;
  const idx = arr.findIndex((x) => (x._id || x.id) === id);
  if (idx >= 0) {
    const next = arr.slice();
    next[idx] = item;
    return next;
  }
  return [item, ...arr];
};

const removeById = (arr, id) => arr.filter((x) => (x._id || x.id) !== id);

/* --------------------------------- Thunks -------------------------------- */
// CREATE
export const createServiceRequest = createAsyncThunk(
  "serviceRequests/create",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const res = await createServiceRequestApi(payload, getState);
      return res; // { message, request }
    } catch (e) {
      return rejectWithValue(rejectMsg(e));
    }
  }
);

// LIST (generic /api/service-requests?...)
export const listServiceRequests = createAsyncThunk(
  "serviceRequests/list",
  async (params, { getState, rejectWithValue }) => {
    try {
      const res = await getServiceRequestsApi(params, getState);
      return res; // array OR {items,...}
    } catch (e) {
      return rejectWithValue(rejectMsg(e));
    }
  }
);

// LIST ALL (paginated /api/service-requests/all)
export const listAllServiceRequests = createAsyncThunk(
  "serviceRequests/listAll",
  async (params, { getState, rejectWithValue }) => {
    try {
      const res = await getAllServiceRequestsApi(params, getState);
      return res; // { items, total, page, pageSize, totalPages, ... }
    } catch (e) {
      return rejectWithValue(rejectMsg(e));
    }
  }
);

// NEW: LIST BY USER (/api/service-requests/user/:userId)
export const listServiceRequestsByUserId = createAsyncThunk(
  "serviceRequests/listByUser",
  async (args, { getState, rejectWithValue }) => {
    try {
      const res = await getServiceRequestsByUserIdApi(args, getState);
      return res; // { items, total, page, pageSize, totalPages, ... }
    } catch (e) {
      return rejectWithValue(rejectMsg(e));
    }
  }
);

// NEW: SERVICE DUE (/api/service-requests/due)
export const listServiceDue = createAsyncThunk(
  "serviceRequests/listDue",
  async (params, { getState, rejectWithValue }) => {
    try {
      const res = await getServiceDueApi(params, getState);
      return res; // array of history docs with nextServiceDate
    } catch (e) {
      return rejectWithValue(rejectMsg(e));
    }
  }
);

// GET BY ID
export const getServiceRequestById = createAsyncThunk(
  "serviceRequests/getById",
  async (id, { getState, rejectWithValue }) => {
    try {
      const res = await getServiceRequestByIdApi(id, getState);
      return res; // object
    } catch (e) {
      return rejectWithValue(rejectMsg(e));
    }
  }
);

// UPDATE STATUS
export const updateServiceRequestStatus = createAsyncThunk(
  "serviceRequests/updateStatus",
  async ({ id, updates }, { getState, rejectWithValue }) => {
    try {
      const res = await updateServiceRequestStatusApi({ id, updates }, getState);
      return res; // { message, request }
    } catch (e) {
      return rejectWithValue(rejectMsg(e));
    }
  }
);

// DELETE
export const deleteServiceRequest = createAsyncThunk(
  "serviceRequests/delete",
  async (id, { getState, rejectWithValue }) => {
    try {
      const res = await deleteServiceRequestApi(id, getState);
      return { id, ...res }; // { id, message }
    } catch (e) {
      return rejectWithValue(rejectMsg(e));
    }
  }
);

// HISTORY (/api/service-requests/history/list)
export const listServiceHistory = createAsyncThunk(
  "serviceRequests/history",
  async (params, { getState, rejectWithValue }) => {
    try {
      const res = await getServiceHistoryApi(params, getState);
      return res; // array
    } catch (e) {
      return rejectWithValue(rejectMsg(e));
    }
  }
);
export const markServiceRequestSeen = createAsyncThunk(
  "serviceRequests/markSeen",
  async ({ id, seenBy }, { getState, rejectWithValue }) => {
    try {
      const res = await markServiceRequestSeenApi({ id, seenBy }, getState);
      return res; // { message, request }
    } catch (e) {
      return rejectWithValue(e?.message || "Failed to mark as seen");
    }
  }
);
/* --------------------------------- State --------------------------------- */
const initialState = {
  loading: false,
  error: null,
  successMessage: null,

  // Result sets
  list: [], // generic list (array or first page)
  all: { items: [], total: 0, page: 1, pageSize: 20, totalPages: 1 }, // /all
  byUser: { items: [], total: 0, page: 1, pageSize: 20, totalPages: 1 }, // /user/:userId
  due: [],        // NEW: /due
  selected: null, // /:id
  history: [],    // /history/list
};

/* ---------------------------------- Slice -------------------------------- */
const serviceRequestSlice = createSlice({
  name: "serviceRequests",
  initialState,
  reducers: {
    resetServiceRequestState: (state) => {
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
    clearSelectedServiceRequest: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* CREATE */
      .addCase(createServiceRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createServiceRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || "Request submitted";
        const created = action.payload?.request;
        if (created) {
          state.list = upsertById(state.list, created);
          state.byUser.items = upsertById(state.byUser.items, created);
          state.all.items = upsertById(state.all.items, created);
        }
      })
      .addCase(createServiceRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //mark
.addCase(markServiceRequestSeen.fulfilled, (state, action) => {
  const updated = action.payload?.request;
  if (updated) {
    // update everywhere
    const upsert = (arr) => {
      const id = updated._id || updated.id;
      const idx = arr.findIndex((x) => (x._id || x.id) === id);
      if (idx >= 0) arr[idx] = updated;
      else arr.unshift(updated);
      return arr;
    };
    state.list = upsert([...state.list]);
    state.all.items = upsert([...state.all.items]);
    state.byUser.items = upsert([...state.byUser.items]);
    if (state.selected && (state.selected._id || state.selected.id) === (updated._id || updated.id)) {
      state.selected = updated;
    }
  }
})
      /* LIST (generic) */
      .addCase(listServiceRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listServiceRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.items || [];
      })
      .addCase(listServiceRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* LIST ALL (paginated) */
      .addCase(listAllServiceRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listAllServiceRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.all = asPaginated(action.payload, state.all.pageSize);
      })
      .addCase(listAllServiceRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* LIST BY USER (paginated) */
      .addCase(listServiceRequestsByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listServiceRequestsByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.byUser = asPaginated(action.payload, state.byUser.pageSize);
      })
      .addCase(listServiceRequestsByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* NEW: SERVICE DUE */
      .addCase(listServiceDue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listServiceDue.fulfilled, (state, action) => {
        state.loading = false;
        state.due = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(listServiceDue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* GET BY ID */
      .addCase(getServiceRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selected = null;
      })
      .addCase(getServiceRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload || null;
      })
      .addCase(getServiceRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* UPDATE STATUS */
      .addCase(updateServiceRequestStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateServiceRequestStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || "Request updated";
        const updated = action.payload?.request;
        if (updated) {
          state.list = upsertById(state.list, updated);
          state.all.items = upsertById(state.all.items, updated);
          state.byUser.items = upsertById(state.byUser.items, updated);
          if (state.selected && (state.selected._id || state.selected.id) === (updated._id || updated.id)) {
            state.selected = updated;
          }
        }
      })
      .addCase(updateServiceRequestStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* DELETE */
      .addCase(deleteServiceRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteServiceRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || "Request deleted";
        const id = action.payload?.id;
        if (id) {
          state.list = removeById(state.list, id);
          state.all.items = removeById(state.all.items, id);
          state.byUser.items = removeById(state.byUser.items, id);
          if (state.selected && (state.selected._id || state.selected.id) === id) {
            state.selected = null;
          }
        }
      })
      .addCase(deleteServiceRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* HISTORY */
      .addCase(listServiceHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listServiceHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(listServiceHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetServiceRequestState, clearSelectedServiceRequest } =
  serviceRequestSlice.actions;

export default serviceRequestSlice.reducer;

/* -------------------------------- Selectors ------------------------------- */
export const selectSRLoading = (s) => s.serviceRequests.loading;
export const selectSRError = (s) => s.serviceRequests.error;
export const selectSRSuccess = (s) => s.serviceRequests.successMessage;

export const selectSRList = (s) => s.serviceRequests.list;
export const selectSRAll = (s) => s.serviceRequests.all;
export const selectSRByUser = (s) => s.serviceRequests.byUser;
export const selectSRDue = (s) => s.serviceRequests.due;      // NEW
export const selectSRSelected = (s) => s.serviceRequests.selected;
export const selectSRHistory = (s) => s.serviceRequests.history;
