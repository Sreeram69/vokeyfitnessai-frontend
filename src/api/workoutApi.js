import api from "./axios";

export const startWorkoutSession = async (category) => {
  const response = await api.post("/workout/start", { category });
  return response.data;
};

export const pauseWorkoutSession = async () => {
  const response = await api.post("/workout/pause");
  return response.data;
};

export const resumeWorkoutSession = async () => {
  const response = await api.post("/workout/resume");
  return response.data;
};

export const endWorkoutSession = async (sessionData) => {
  const response = await api.post("/workout/end", sessionData);
  return response.data;
};

export const updateWorkoutProgress = async (progressData) => {
  const response = await api.put("/workout/progress", progressData);
  return response.data;
};
