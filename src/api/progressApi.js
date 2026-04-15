import api from "./axios";

export const getDashboardData = async () => {
  const response = await api.get("/activities");
  return response.data;
};

export const logActivitySession = async (sessionData) => {
  const response = await api.post("/activities/log", sessionData);
  return response.data;
};

export const getWorkoutHistory = async (year, month) => {
  const query = new URLSearchParams();
  if (year) query.append("year", year);
  if (month) query.append("month", month);
  const response = await api.get(`/activities?${query.toString()}`);
  return response.data;
};