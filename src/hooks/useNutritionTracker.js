import { useState, useEffect } from "react";
import { getNutrition, logMeal as logMealApi } from "../api/nutritionApi";

const useNutritionTracker = () => {
  const [nutritionData, setNutritionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNutrition = async () => {
      try {
        const data = await getNutrition();
        setNutritionData(data.meals || []);
      } catch (error) {
        console.error("Failed to fetch nutrition data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNutrition();
  }, []);

  const addMeal = async (meal) => {
    try {
      const data = await logMealApi({ date: new Date().toISOString(), meal });
      setNutritionData(data.meals || []);
    } catch (error) {
      console.error("Failed to log meal", error);
    }
  };

  const clearNutrition = () => {
    setNutritionData([]);
  };

  return {
    nutritionData,
    loading,
    addMeal,
    clearNutrition,
  };
};

export default useNutritionTracker;