import { useState, useEffect } from "react";
import {
  saveToLocalStorage,
  getFromLocalStorage,
} from "../utils/localStorage";

const PROGRESS_KEY = "fitforge_progress";

const useProgressTracker = () => {
  const [progressData, setProgressData] = useState(
    getFromLocalStorage(PROGRESS_KEY) || []
  );

  useEffect(() => {
    saveToLocalStorage(PROGRESS_KEY, progressData);
  }, [progressData]);

  const addProgressEntry = (entry) => {
    setProgressData((prev) => [
      ...prev,
      {
        ...entry,
        date: new Date().toLocaleDateString(),
      },
    ]);
  };

  const clearProgress = () => {
    setProgressData([]);
  };

  return {
    progressData,
    addProgressEntry,
    clearProgress,
  };
};

export default useProgressTracker;