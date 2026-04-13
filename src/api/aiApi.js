import api from "./axios";

export const chatWithAICoach = async (message) => {
  const response = await api.post("/ai/chat", { message });
  return response.data;
};

export const suggestWorkoutPlanWithAI = async (formData) => {
  const response = await api.post("/ai/plan", formData);
  return response.data;
};
