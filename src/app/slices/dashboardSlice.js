import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stats: null,
  recentWorkouts: [],
  streak: 0,
  progressSummary: null,
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    dashboardStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    dashboardSuccess: (state, action) => {
      state.loading = false;
      state.stats = action.payload.stats || null;
      state.recentWorkouts = action.payload.recentWorkouts || [];
      state.streak = action.payload.streak || 0;
      state.progressSummary = action.payload.progressSummary || null;
    },
    dashboardFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearDashboard: (state) => {
      state.stats = null;
      state.recentWorkouts = [];
      state.streak = 0;
      state.progressSummary = null;
    },
  },
});

export const {
  dashboardStart,
  dashboardSuccess,
  dashboardFailure,
  clearDashboard,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;