import api from "./axios";

export const getWeeklyAnalytics = async () => {
  const response = await api.get("/analytics/weekly");
  return response.data;
};

export const getMonthlyAnalytics = async () => {
  const response = await api.get("/analytics/monthly");
  return response.data;
};

export const getProgressStats = async () => {
  const response = await api.get("/analytics/progress");
  return response.data;
};
