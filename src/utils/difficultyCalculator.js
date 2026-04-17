/**
 * Shared utility for calculating the difficulty level of an exercise.
 * Standardizes calculation logic across FavoritesPage and ExercisePageV2.
 * 
 * @param {Object} exercise - The exercise details
 * @returns {String} "Beginner" | "Intermediate" | "Advanced"
 */
export const getDifficultyLevel = (exercise) => {
  const bodyPart = exercise?.bodyPart?.toLowerCase() || "";
  const equipment = exercise?.equipment?.toLowerCase() || "";
  
  if (equipment.includes("body weight") || equipment.includes("bodyweight")) {
    return "Beginner";
  }
  if (bodyPart === "cardio") {
    return "Intermediate";
  }
  if (equipment.includes("dumbbell") || equipment.includes("band")) {
    return "Intermediate";
  }
  if (bodyPart === "legs") {
    return "Advanced";
  }
  return "Advanced";
};
