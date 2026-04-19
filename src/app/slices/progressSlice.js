import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const fetchActivities = createAsyncThunk(
  "progress/fetchActivities",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/activities");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch activities");
    }
  }
);

const initialState = {
  weightLogs: [],
  bmiHistory: [],
  caloriesHistory: [],
  strengthProgress: [],
  activities: [],
  loading: false,
  error: null,
};

const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {
    progressStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    progressSuccess: (state, action) => {
      state.loading = false;
      state.weightLogs = action.payload.weightLogs || [];
      state.bmiHistory = action.payload.bmiHistory || [];
      state.caloriesHistory = action.payload.caloriesHistory || [];
      state.strengthProgress = action.payload.strengthProgress || [];
    },
    progressFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearProgress: (state) => {
      state.weightLogs = [];
      state.bmiHistory = [];
      state.caloriesHistory = [];
      state.strengthProgress = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  progressStart,
  progressSuccess,
  progressFailure,
  clearProgress,
} = progressSlice.actions;

export default progressSlice.reducer;