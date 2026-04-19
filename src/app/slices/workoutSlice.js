import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  plans: [],
  selectedPlan: null,
  exercises: [],
  schedule: [],
  loading: false,
  error: null,
};

const workoutSlice = createSlice({
  name: "workout",
  initialState,
  reducers: {
    workoutStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    workoutSuccess: (state, action) => {
      state.loading = false;
      state.plans = action.payload.plans || [];
      state.selectedPlan = action.payload.selectedPlan || null;
      state.exercises = action.payload.exercises || [];
      state.schedule = action.payload.schedule || [];
    },
    workoutFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearWorkout: (state) => {
      state.plans = [];
      state.selectedPlan = null;
      state.exercises = [];
      state.schedule = [];
    },
  },
});

export const {
  workoutStart,
  workoutSuccess,
  workoutFailure,
  clearWorkout,
} = workoutSlice.actions;

export default workoutSlice.reducer;