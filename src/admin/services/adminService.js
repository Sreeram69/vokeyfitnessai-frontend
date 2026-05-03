import api from "../../api/axios";

/**
 * Admin Panel Dashboard & Management Services
 */
export const getAdminStats = async (params = {}) => {
  const response = await api.get("/admin/stats", { params });
  return response.data.data;
};

export const getAdminApiStats = async () => {
  const response = await api.get("/admin/api-stats");
  return response.data.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await api.get("/admin/users", { params });
  return response.data.data;
};

export const updateAdminUser = async (id, userData) => {
  const response = await api.put(`/admin/users/${id}`, userData);
  return response.data.data;
};

export const toggleSuspendUser = async (id, status) => {
  const response = await api.put(`/admin/users/${id}/suspend`, { status });
  return response.data.data;
};

export const deleteAdminUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data.data;
};

// Exercise Management
export const createAdminExercise = async (exerciseData) => {
  const response = await api.post("/exercises", exerciseData);
  return response.data.data;
};

export const updateAdminExercise = async (id, exerciseData) => {
  const response = await api.put(`/exercises/${id}`, exerciseData);
  return response.data.data;
};

export const deleteAdminExercise = async (id) => {
  const response = await api.delete(`/exercises/${id}`);
  return response.data.data;
};

// Food/Nutrition Management
export const getAdminFoods = async (params = {}) => {
  const response = await api.get("/nutrition/foods", { params });
  return response.data;
};

export const createAdminFood = async (foodData) => {
  const response = await api.post("/nutrition/foods", foodData);
  return response.data.data;
};

export const updateAdminFood = async (name, foodData) => {
  const response = await api.put(`/nutrition/foods/${encodeURIComponent(name)}`, foodData);
  return response.data.data;
};

export const deleteAdminFood = async (name) => {
  const response = await api.delete(`/nutrition/foods/${encodeURIComponent(name)}`);
  return response.data.data;
};

// Notifications & Broadcasts Management
export const getAdminNotifications = async () => {
  const response = await api.get("/notifications");
  return response.data.data;
};

export const createAdminNotification = async (notifData) => {
  const response = await api.post("/notifications", notifData);
  return response.data.data;
};

export const deleteAdminNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data.data;
};

// Active gym floor sessions
export const getActiveSessions = async () => {
  const response = await api.get("/admin/active-sessions");
  return response.data.data;
};
