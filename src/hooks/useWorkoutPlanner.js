import { useState, useEffect } from "react";
import {
  saveToLocalStorage,
  getFromLocalStorage,
} from "../utils/localStorage";
import { addNotification } from "../utils/notifications";

const WORKOUT_KEY = "fitforge_custom_workout";

const useWorkoutPlanner = () => {
  const [workoutPlan, setWorkoutPlan] = useState(
    getFromLocalStorage(WORKOUT_KEY) || []
  );

  useEffect(() => {
    saveToLocalStorage(WORKOUT_KEY, workoutPlan);
  }, [workoutPlan]);

  const addExercise = (exercise) => {
    setWorkoutPlan((prev) => {
      const nextPlan = [...prev, exercise];
      saveToLocalStorage(WORKOUT_KEY, nextPlan);
      addNotification("Added to Plan", `${exercise.name} was added to your custom plan.`, "planner", "medium");
      return nextPlan;
    });
  };

  const removeExercise = (id) => {
    setWorkoutPlan((prev) => {
      const nextPlan = prev.filter((exercise, index) => index !== id);
      addNotification("Removed from Plan", "Exercise was removed from your custom plan.", "planner", "low");
      return nextPlan;
    });
  };

  const clearWorkout = () => {
    setWorkoutPlan([]);
  };

  return {
    workoutPlan,
    addExercise,
    removeExercise,
    clearWorkout,
  };
};

export default useWorkoutPlanner;