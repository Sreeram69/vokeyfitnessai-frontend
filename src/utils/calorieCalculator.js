export const calculateCalories = ({
  weight,
  height,
  age,
  gender,
  activityLevel,
  goal,
}) => {
  if (!weight || !height || !age || !gender) return null;

  let bmr;
  const normalizedGender = gender?.toLowerCase();

  if (normalizedGender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };

  let maintenanceCalories =
    bmr * (activityMultipliers[activityLevel] || 1.2);

  let targetCalories = maintenanceCalories;

  const normalizedGoal = goal?.toLowerCase().replace(" ", "_");
  if (normalizedGoal === "fat_loss") targetCalories -= 400;
  if (normalizedGoal === "muscle_gain") targetCalories += 300;
  if (normalizedGoal === "strength") targetCalories += 200;
  if (normalizedGoal === "endurance") targetCalories += 150;

  return {
    bmr: Math.round(bmr),
    maintenanceCalories: Math.round(maintenanceCalories),
    targetCalories: Math.round(targetCalories),
  };
};