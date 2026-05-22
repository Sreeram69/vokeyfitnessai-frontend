import { configureStore } from "@reduxjs/toolkit";
import favoritesReducer from "./slices/favoritesSlice";
import authReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice";
import workoutReducer from "./slices/workoutSlice";
import dashboardReducer from "./slices/dashboardSlice";
import progressReducer from "./slices/progressSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    workout: workoutReducer,
    dashboard: dashboardReducer,
    progress: progressReducer,
    favorites: favoritesReducer,
  },
});