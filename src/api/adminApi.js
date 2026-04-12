import api from "./axios";

export const getAllUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const getAdminAnalytics = async () => {
  const response = await api.get("/admin/analytics");
  return response.data;
};

export const createExercise = async (exerciseData) => {
  const response = await api.post("/admin/exercises", exerciseData);
  return response.data;
};

export const updateExercise = async (id, exerciseData) => {
  const response = await api.put(`/admin/exercises/${id}`, exerciseData);
  return response.data;
};

export const deleteExercise = async (id) => {
  const response = await api.delete(`/admin/exercises/${id}`);
  return response.data;
};