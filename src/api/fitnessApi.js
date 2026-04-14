import api from "./axios";

// Generate Google auth URL
export const getGoogleAuthUrl = async () => {
  const res = await api.get("/fitness/oauth");
  return res.data;
};

// Handle callback authorization code exchange
export const syncOAuthCallback = async (code) => {
  const res = await api.post("/fitness/oauth/callback", { code });
  return res.data;
};

// Force steps sync from Google Fitness aggregate REST API
export const forceStepsSync = async (date) => {
  const res = await api.post("/fitness/sync", { date });
  return res.data;
};

// Get today's steps count
export const fetchTodaySteps = async (date) => {
  const res = await api.get("/fitness/steps/today", { params: { date } });
  return res.data;
};

// Get weekly historical walking steps
export const fetchWeeklySteps = async () => {
  const res = await api.get("/fitness/steps/weekly");
  return res.data;
};

// Disconnect Google Fit connection
export const disconnectGoogleFit = async () => {
  const res = await api.post("/fitness/disconnect");
  return res.data;
};
