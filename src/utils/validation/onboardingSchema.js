import { z } from "zod";

export const onboardingSchema = z.object({
  age: z.number().min(13).max(80),
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(300),
  gender: z.enum(["male", "female"]),
  activityLevel: z.enum([
    "sedentary",
    "light",
    "moderate",
    "active",
  ]),
  goal: z.enum([
    "muscle_gain",
    "fat_loss",
    "strength",
    "endurance",
  ]),
  experienceLevel: z.enum([
    "beginner",
    "intermediate",
    "advanced",
  ]),
  workoutFocus: z.enum([
    "chest",
    "back",
    "legs",
    "shoulders",
    "arms",
    "full_body",
  ]),
});