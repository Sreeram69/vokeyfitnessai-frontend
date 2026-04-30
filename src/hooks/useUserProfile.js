import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { saveUserProfile } from "../app/slices/profileSlice";

import {
  saveToLocalStorage,
  getFromLocalStorage,
} from "../utils/localStorage";

import { calculateBMI } from "../utils/bmiCalculator";

const USER_PROFILE_KEY =
  "fitforge_user_profile";

const DEFAULT_PROFILE = {
  name: "Athlete",
  email: "",
  age: "",
  gender: "",
  height: "",
  weight: "",
  goal: "Muscle Gain",
  level: "Beginner",
  targetWeight: "",
  workoutDays: 5,
  dailyWaterGoal: 4,
  dailyCalorieGoal: 2450,
  joinedDate: new Date().toISOString(),
  bmi: null,
  calories: {
    maintenanceCalories: null,
    targetCalories: 2450,
  },
  achievements: {
    streak: 0,
    workoutsCompleted: 0,
    plansCompleted: 0,
  },
  preferences: {
    theme: "dark",
    notifications: true,
    measurementUnit: "metric",
  },
};

const useUserProfile = () => {
  const dispatch = useDispatch();
  const reduxProfile = useSelector((state) => state.profile.profile);

  const [profile, setProfile] =
    useState(() => {
      const savedProfile =
        getFromLocalStorage(
          USER_PROFILE_KEY
        );

      return savedProfile
        ? {
            ...DEFAULT_PROFILE,
            ...savedProfile,
            achievements: {
              ...DEFAULT_PROFILE.achievements,
              ...(savedProfile.achievements || {}),
            }
          }
        : DEFAULT_PROFILE;
    });

  // Sync Redux profile with local state and localStorage
  useEffect(() => {
    if (reduxProfile) {
      setProfile({
        ...DEFAULT_PROFILE,
        ...reduxProfile,
        achievements: {
          ...DEFAULT_PROFILE.achievements,
          ...(reduxProfile.achievements || {}),
        }
      });
    }
  }, [reduxProfile]);

  // Calculate BMI + Calories
  const calculateProfileMetrics =
    (data) => {
      let bmiData = null;

      let calorieData = {
        maintenanceCalories: null,
        targetCalories:
          data.dailyCalorieGoal ||
          2450,
      };

      if (
        data.height &&
        data.weight
      ) {
        bmiData =
          calculateBMI(
            Number(
              data.weight
            ),
            Number(
              data.height
            )
          );

        // Basic maintenance calories estimate
        const weight =
          Number(
            data.weight
          );

        const height =
          Number(
            data.height
          );

        const age =
          Number(
            data.age || 25
          );

        let bmr =
          10 * weight +
          6.25 * height -
          5 * age +
          5;

        if (
          data.gender ===
          "Female"
        ) {
          bmr -= 161;
        }

        const maintenanceCalories =
          Math.round(
            bmr * 1.55
          );

        let targetCalories =
          maintenanceCalories;

        switch (
          data.goal
        ) {
          case "Muscle Gain":
            targetCalories += 300;
            break;

          case "Fat Loss":
            targetCalories -= 400;
            break;

          case "Strength":
            targetCalories += 200;
            break;

          case "Endurance":
            targetCalories += 150;
            break;

          default:
            break;
        }

        calorieData = {
          maintenanceCalories,
          targetCalories,
        };
      }

      return {
        bmi: bmiData,
        calories:
          calorieData,
      };
    };

  // Save Profile
  useEffect(() => {
    saveToLocalStorage(
      USER_PROFILE_KEY,
      profile
    );
  }, [profile]);

  // Update Profile
  const updateProfile = (
    newData
  ) => {
    setProfile(
      (prev) => {
        const updatedProfile =
          {
            ...prev,
            ...newData,
          };

        const metrics =
          calculateProfileMetrics(
            updatedProfile
          );

        const finalProfile = {
          ...updatedProfile,
          ...metrics,
        };

        dispatch(saveUserProfile(finalProfile));
        return finalProfile;
      }
    );
  };

  // Reset Profile
  const resetProfile =
    () => {
      setProfile(
        DEFAULT_PROFILE
      );

      saveToLocalStorage(
        USER_PROFILE_KEY,
        DEFAULT_PROFILE
      );
    };

  // Achievement Updates
  const incrementWorkoutStreak =
    () => {
      setProfile(
        (prev) => {
          const today = new Date().toLocaleDateString();
          if (prev.achievements?.lastStreakDate === today) {
            return prev; // Already incremented today
          }
          return {
            ...prev,
            achievements: {
              ...prev.achievements,
              streak: (prev.achievements?.streak || 0) + 1,
              lastStreakDate: today,
            },
          };
        }
      );
    };

  const incrementWorkoutsCompleted =
    () => {
      setProfile(
        (prev) => ({
          ...prev,
          achievements:
            {
              ...prev.achievements,
              workoutsCompleted:
                prev
                  .achievements
                  .workoutsCompleted +
                1,
            },
        })
      );
    };

  const incrementPlansCompleted =
    () => {
      setProfile(
        (prev) => ({
          ...prev,
          achievements:
            {
              ...prev.achievements,
              plansCompleted:
                prev
                  .achievements
                  .plansCompleted +
                1,
            },
        })
      );
    };

  // Preferences
  const updatePreferences =
    (
      newPreferences
    ) => {
      setProfile(
        (prev) => ({
          ...prev,
          preferences:
            {
              ...prev.preferences,
              ...newPreferences,
            },
        })
      );
    };

  return {
    profile,

    updateProfile,

    resetProfile,

    incrementWorkoutStreak,

    incrementWorkoutsCompleted,

    incrementPlansCompleted,

    updatePreferences,
  };
};

export default useUserProfile;