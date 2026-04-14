import api from "./axios";

export const getNutrition = async (date) => {
  const response = await api.get(`/nutrition${date ? `?date=${date}` : ""}`);
  return response.data;
};

export const logMeal = async (mealData) => {
  const response = await api.post("/nutrition", mealData);
  return response.data;
};

export const analyzeFoodWithAI = async (foodQuery) => {
  const response = await api.post("/ai/nutrition", { foodQuery });
  return response.data;
};

export const searchFood = async (query) => {
  const response = await api.get(`/nutrition/search?query=${encodeURIComponent(query)}`);
  return response.data;
};

export const lookupBarcode = async (upc) => {
  const response = await api.get(`/nutrition/barcode/${upc}`);
  return response.data;
};

export const getAiSuggestions = async () => {
  const response = await api.get("/nutrition/suggestions");
  return response.data;
};
