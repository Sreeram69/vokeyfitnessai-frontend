import api from "./axios";

export const generateWorkoutPlan = async (planData) => {
  const response = await api.post("/recommendations/generate", planData);
  return response.data;
};

export const suggestPlanWithAI = async (userData) => {
  const response = await api.post("/ai/plan", userData);
  return response.data;
};

export const getUserPlans = async () => {
  const response = await api.get("/plans");
  return response.data;
};

export const getPlanById = async (id) => {
  const response = await api.get(`/plans/${id}`);
  return response.data;
};

export const updatePlan = async (id, updatedData) => {
  const response = await api.put(`/plans/${id}`, updatedData);
  return response.data;
};

export const schedulePlan = async (id, scheduleData) => {
  const response = await api.post(`/plans/${id}/schedule`, scheduleData);
  return response.data;
};