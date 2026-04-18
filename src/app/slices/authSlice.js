import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser as loginApi, registerUser as registerApi, logoutUser as logoutApi } from "../../api/authApi";
import { fetchUserProfile } from "./profileSlice";

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Redux logout failed:", error);
    }
    dispatch(logout());
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await loginApi(credentials);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const data = await registerApi(userData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  isOtpPending: localStorage.getItem("isOtpPending") === "true",
  tempUser: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isOtpPending = false;
      state.tempUser = null;
      
      const theme = localStorage.getItem("fitforge_theme");
      localStorage.clear();
      if (theme) {
        localStorage.setItem("fitforge_theme", theme);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    otpVerifiedSuccess: (state, action) => {
      state.user = {
        _id: action.payload._id,
        username: action.payload.username,
        email: action.payload.email,
        role: action.payload.role,
      };
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isOtpPending = false;
      state.tempUser = null;
      localStorage.setItem("token", action.payload.token);
      localStorage.removeItem("isOtpPending");
      
      if (action.payload.profile) {
        const profileToSave = {
          ...action.payload.profile,
          name: action.payload.profile.name || action.payload.username || "Athlete",
          role: action.payload.role
        };
        localStorage.setItem("fitforge_user_profile", JSON.stringify(profileToSave));
        if (profileToSave.selectedPlan) {
          localStorage.setItem("fitforge_selected_plan", JSON.stringify(profileToSave.selectedPlan));
        } else if (profileToSave.activePlan) {
          localStorage.setItem("fitforge_selected_plan", JSON.stringify(profileToSave.activePlan));
        }
      } else {
        localStorage.setItem("fitforge_user_profile", JSON.stringify({
          name: action.payload.username || "Athlete",
          email: action.payload.email,
          role: action.payload.role
        }));
      }
    },
    setOtpPending: (state, action) => {
      state.isOtpPending = true;
      state.tempUser = { email: action.payload.email };
      localStorage.setItem("isOtpPending", "true");
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.needsVerification) {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.isOtpPending = true;
          state.tempUser = {
            email: action.payload.email,
            userId: action.payload.userId,
          };
          localStorage.setItem("isOtpPending", "true");
        } else {
          state.user = {
            _id: action.payload._id,
            username: action.payload.username,
            email: action.payload.email,
            role: action.payload.role,
          };
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.isOtpPending = false;
          localStorage.setItem("token", action.payload.token);
          localStorage.removeItem("isOtpPending");
 
          if (action.payload.profile) {
            const profileToSave = {
              ...action.payload.profile,
              name: action.payload.profile.name || action.payload.username || "Athlete",
              role: action.payload.role
            };
            localStorage.setItem("fitforge_user_profile", JSON.stringify(profileToSave));
            if (profileToSave.selectedPlan) {
              localStorage.setItem("fitforge_selected_plan", JSON.stringify(profileToSave.selectedPlan));
            } else if (profileToSave.activePlan) {
              localStorage.setItem("fitforge_selected_plan", JSON.stringify(profileToSave.activePlan));
            }
          } else {
            localStorage.setItem("fitforge_user_profile", JSON.stringify({
              name: action.payload.username || "Athlete",
              email: action.payload.email,
              role: action.payload.role
            }));
          }
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.needsVerification) {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.isOtpPending = true;
          state.tempUser = {
            email: action.payload.email,
            userId: action.payload.userId,
          };
          localStorage.setItem("isOtpPending", "true");
        } else {
          state.user = {
            _id: action.payload._id,
            username: action.payload.username,
            email: action.payload.email,
            role: action.payload.role,
          };
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.isOtpPending = false;
          localStorage.setItem("token", action.payload.token);
          localStorage.removeItem("isOtpPending");

          // Ensure clean slate for brand new user
          localStorage.removeItem("fitforge_user_profile");
          localStorage.removeItem("fitforge_session_history");
          localStorage.removeItem("fitforge_nutrition");
          localStorage.removeItem("fitforge_water");
          localStorage.removeItem("fitforge_selected_plan");
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        if (action.payload) {
          const userData = action.payload.data || action.payload;
          state.user = {
            _id: userData._id,
            username: userData.username,
            email: userData.email,
            role: userData.role,
          };
          state.isAuthenticated = true;
          
          // Sync profile role
          if (userData.profile) {
            const profileToSave = {
              ...userData.profile,
              name: userData.profile.name || userData.username || "Athlete",
              role: userData.role
            };
            localStorage.setItem("fitforge_user_profile", JSON.stringify(profileToSave));
            if (profileToSave.selectedPlan) {
              localStorage.setItem("fitforge_selected_plan", JSON.stringify(profileToSave.selectedPlan));
            } else if (profileToSave.activePlan) {
              localStorage.setItem("fitforge_selected_plan", JSON.stringify(profileToSave.activePlan));
            }
          }
        }
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem("token");
      });
  },
});

export const { logout, clearError, otpVerifiedSuccess, setOtpPending } = authSlice.actions;

export default authSlice.reducer;
