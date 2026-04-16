export const calculateBMI = (weightKg, heightCm) => {
  const heightM = heightCm / 100;

  if (!weightKg || !heightCm) return null;

  const bmi = weightKg / (heightM * heightM);

  let category;

  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 24.9) category = "Normal weight";
  else if (bmi < 29.9) category = "Overweight";
  else category = "Obese";

  return {
    bmi: bmi.toFixed(1),
    category,
  };
};