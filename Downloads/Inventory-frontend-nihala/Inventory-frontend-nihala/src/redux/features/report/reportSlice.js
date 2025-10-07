import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_URL } from '../../../../utils/apiConfig';

const initialState = {
  creating: false,
  listLoading: false,
  list: [],
  total: 0,
  page: 1,
  pages: 1,
  error: null,
};

export const createReport = createAsyncThunk(
  "report/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
     
      
    } catch (err) {
      return rejectWithValue(err.message || "Create failed");
    }
  }
);

export const fetchReportsByEquipment = createAsyncThunk(
  "report/fetchByEquipment",
  async ({ equipmentId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ equipmentId, page, limit });
      const res = await fetch(`${API_URL}/api/reports?${params.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message || "Fetch failed");
    }
  }
);

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    clearReports(state) {
      state.list = [];
      state.total = 0;
      state.page = 1;
      state.pages = 1;
      state.error = null;
    },
  },
  extraReducers: (b) => {
    
    b.addCase(createReport.pending, (s) => {
      s.creating = true;
      s.error = null;
    });
    b.addCase(createReport.fulfilled, (s, a) => {
      s.creating = false;
      // optionally prepend to list
      s.list = [a.payload, ...s.list];
    });
    b.addCase(createReport.rejected, (s, a) => {
      s.creating = false;
      s.error = a.payload;
    });

    b.addCase(fetchReportsByEquipment.pending, (s) => {
      s.listLoading = true;
      s.error = null;
    });
    b.addCase(fetchReportsByEquipment.fulfilled, (s, a) => {
      s.listLoading = false;
      s.list = a.payload.items;
      s.total = a.payload.total;
      s.page = a.payload.page;
      s.pages = a.payload.pages;
    });
    b.addCase(fetchReportsByEquipment.rejected, (s, a) => {
      s.listLoading = false;
      s.error = a.payload;
    });
  },
});

export const { clearReports } = reportSlice.actions;
export default reportSlice.reducer;
