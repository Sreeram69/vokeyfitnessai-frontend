import api from "./axios";

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/profile");
  return response.data;
};

export const logoutUser = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Logout API call failed:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("isOtpPending");
  }
  return true;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put("/auth/profile", profileData);
  return response.data;
};

export const verifyOtp = async (code, email, purpose = "email_verification") => {
  const endpoint = purpose === "email_verification" ? "/auth/verify-login-otp" : "/auth/verify-otp";
  const response = await api.post(endpoint, { code, email, purpose });
  return response.data;
};

export const resendOtp = async (email, purpose = "email_verification") => {
  const endpoint = purpose === "email_verification" ? "/auth/resend-login-otp" : "/auth/resend-otp";
  const response = await api.post(endpoint, { email, purpose });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (email, code, newPassword) => {
  const response = await api.post("/auth/reset-password", { email, code, newPassword });
  return response.data;
};

export const getGoogleLoginUrl = async () => {
  const response = await api.get("/auth/google/url");
  return response.data;
};

export const handleGoogleLoginCallback = async (code) => {
  const response = await api.post("/auth/google/callback", { code });
  return response.data;
};