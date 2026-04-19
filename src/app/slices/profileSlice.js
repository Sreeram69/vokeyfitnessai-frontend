import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { updateUserProfile } from "../../api/authApi";
import api from "../../api/axios";

export const fetchUserProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/profile");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch profile");
    }
  }
);

export const saveUserProfile = createAsyncThunk(
  "profile/saveProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await updateUserProfile(profileData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update profile");
    }
  }
);

const initialState = {
  profile: null,
  bmi: null,
  calories: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    profileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    profileSuccess: (state, action) => {
      state.loading = false;
      state.profile = action.payload.profile;
      state.bmi = action.payload.bmi;
      state.calories = action.payload.calories;
    },
    profileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.bmi = null;
      state.calories = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile || action.payload.data?.profile || null;
        // Bmi and calories can be computed in components or derived from profile
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile || action.payload.data?.profile || null;
      })
      .addCase(saveUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  profileStart,
  profileSuccess,
  profileFailure,
  clearProfile,
} = profileSlice.actions;

export default profileSlice.reducer;