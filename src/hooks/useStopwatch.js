import { useState, useEffect, useRef } from "react";

const getCurrentTime = () => Date.now();

export const useStopwatch = (activeExercises) => {
  const [completedExercises, setCompletedExercises] = useState(() => {
    try {
      const stored = localStorage.getItem("fitforge_completed_exercises");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [skippedExercises, setSkippedExercises] = useState(() => {
    try {
      const stored = localStorage.getItem("fitforge_skipped_exercises");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(() => {
    try {
      const stored = localStorage.getItem("fitforge_current_exercise_index");
      return stored ? Number(stored) : 0;
    } catch {
      return 0;
    }
  });

  const [sessionTime, setSessionTime] = useState(() => {
    try {
      const stored = localStorage.getItem("fitforge_session_time");
      return stored ? Number(stored) : 0;
    } catch {
      return 0;
    }
  });

  const [activeOverlayId, setActiveOverlayId] = useState(null);
  const [overlayTime, setOverlayTime] = useState(0);
  const [overlayRunning, setOverlayRunning] = useState(false);

  // Sync state mutations to localStorage
  useEffect(() => {
    localStorage.setItem("fitforge_completed_exercises", JSON.stringify(completedExercises));
  }, [completedExercises]);

  useEffect(() => {
    localStorage.setItem("fitforge_skipped_exercises", JSON.stringify(skippedExercises));
  }, [skippedExercises]);

  useEffect(() => {
    localStorage.setItem("fitforge_current_exercise_index", currentExerciseIndex.toString());
  }, [currentExerciseIndex]);

  useEffect(() => {
    localStorage.setItem("fitforge_session_time", sessionTime.toString());
  }, [sessionTime]);

  const overlayStartRef = useRef(0);
  const overlayReqRef = useRef(null);

  const updateOverlayTime = () => {
    setOverlayTime(getCurrentTime() - overlayStartRef.current);
    overlayReqRef.current = requestAnimationFrame(updateOverlayTime);
  };

  useEffect(() => {
    if (overlayRunning) {
      overlayStartRef.current = getCurrentTime() - overlayTime;
      overlayReqRef.current = requestAnimationFrame(updateOverlayTime);
    } else {
      if (overlayReqRef.current) cancelAnimationFrame(overlayReqRef.current);
    }
    return () => {
      if (overlayReqRef.current) cancelAnimationFrame(overlayReqRef.current);
    };
  }, [overlayRunning, overlayTime]);

  const toggleComplete = (exerciseId, overlaySpentTime = 0) => {
    setSessionTime(prev => prev + overlaySpentTime);
    setCompletedExercises(prev => {
      if (prev.includes(exerciseId)) return prev;
      setSkippedExercises(skips => skips.filter(id => id !== exerciseId));
      const newCompleted = [...prev, exerciseId];
      if (newCompleted.length + skippedExercises.length < activeExercises.length) {
          const nextIdx = activeExercises.findIndex(ex => !newCompleted.includes(ex.id) && !skippedExercises.includes(ex.id));
          if (nextIdx !== -1) setCurrentExerciseIndex(nextIdx);
      }
      return newCompleted;
    });
  };

  const handleOpenOverlay = (e, exerciseId) => {
    e.preventDefault();
    if (completedExercises.includes(exerciseId)) return;
    setActiveOverlayId(exerciseId);
    setOverlayTime(0);
    setOverlayRunning(true);
  };

  const handleCompleteOverlay = (e) => {
    e.preventDefault();
    const id = activeOverlayId;
    const timeSpent = overlayTime;
    setOverlayRunning(false);
    setActiveOverlayId(null);
    toggleComplete(id, timeSpent);
  };

  const skipExercise = (e, exerciseId) => {
    e.preventDefault();
    setSkippedExercises(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      } else {
        setCompletedExercises(comps => comps.filter(id => id !== exerciseId));
        const newSkipped = [...prev, exerciseId];
        if (completedExercises.length + newSkipped.length < activeExercises.length) {
            const nextIdx = activeExercises.findIndex(ex => !completedExercises.includes(ex.id) && !newSkipped.includes(ex.id));
            if (nextIdx !== -1) setCurrentExerciseIndex(nextIdx);
        }
        return newSkipped;
      }
    });
  };

  const clearTimerLocalStorage = () => {
    localStorage.removeItem("fitforge_completed_exercises");
    localStorage.removeItem("fitforge_skipped_exercises");
    localStorage.removeItem("fitforge_session_time");
    localStorage.removeItem("fitforge_current_exercise_index");
  };

  return {
    completedExercises,
    setCompletedExercises,
    skippedExercises,
    setSkippedExercises,
    currentExerciseIndex,
    setCurrentExerciseIndex,
    sessionTime,
    setSessionTime,
    activeOverlayId,
    setActiveOverlayId,
    overlayTime,
    setOverlayTime,
    overlayRunning,
    setOverlayRunning,
    handleOpenOverlay,
    handleCompleteOverlay,
    toggleComplete,
    skipExercise,
    clearTimerLocalStorage
  };
};

export default useStopwatch;
