import { useEffect } from "react";
import { updateWorkoutProgress } from "../api/workoutApi";

export const useWorkoutSync = (completedExercises, sessionTime, activeExercises) => {
  useEffect(() => {
    if (!activeExercises || activeExercises.length === 0) return;
    
    const caloriesBurnedEstimate = completedExercises.length * 45;
    const durationSeconds = Math.round(sessionTime / 1000) || 0;
    
    const progressData = {
      duration: durationSeconds,
      caloriesBurned: caloriesBurnedEstimate,
      exercisesCompleted: activeExercises.filter(ex => completedExercises.includes(ex.id)).map(ex => ({
        exerciseId: ex.id,
        name: ex.name,
        sets: Number(ex.sets) || 3,
        reps: Number(ex.reps) || 12
      }))
    };
    
    updateWorkoutProgress(progressData).catch(e => console.warn("Failed to sync live workout progress:", e));
  }, [completedExercises, sessionTime, activeExercises]);
};

export default useWorkoutSync;
