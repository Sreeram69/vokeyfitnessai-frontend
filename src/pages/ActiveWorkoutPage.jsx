import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, PlayCircle, CheckCircle2, Dumbbell, Trophy, ChevronRight, Activity, SkipForward, Play, Pause, X } from "lucide-react";
import ExerciseModal from "../components/exercises/ExerciseModal";
import { notifySuccess, notifyInfo } from "../utils/toast";
import { addNotification } from "../utils/notifications";
import useUserProfile from "../hooks/useUserProfile";
import { getAllExercises } from "../api/services/exerciseService";
import { logActivitySession } from "../api/progressApi";
import { useDispatch } from "react-redux";
import { saveUserProfile } from "../app/slices/profileSlice";
import { startWorkoutSession, endWorkoutSession } from "../api/workoutApi";
import { getExerciseThumbnail } from "../utils/exerciseGifSelector";
import { useStopwatch } from "../hooks/useStopwatch";
import { useWorkoutSync } from "../hooks/useWorkoutSync";

const ActiveWorkoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profile, incrementWorkoutStreak, incrementWorkoutsCompleted } = useUserProfile();
  
  const [activePlan, setActivePlan] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [activeExercises, setActiveExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayFocus, setTodayFocus] = useState("");
  const [showProcessing, setShowProcessing] = useState(false);

  // Consume stopwatch and layout timer hooks
  const {
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
    skipExercise,
    clearTimerLocalStorage
  } = useStopwatch(activeExercises);

  // Consume real-time sync hook
  useWorkoutSync(completedExercises, sessionTime, activeExercises);

  const pad = (num) => num.toString().padStart(2, "0");

  useEffect(() => {
    const loadWorkout = async () => {
      try {
        const todayStr = new Date().toLocaleDateString();
        const storedDate = localStorage.getItem("fitforge_workout_date");
        if (storedDate !== todayStr) {
          localStorage.removeItem("fitforge_completed_exercises");
          localStorage.removeItem("fitforge_skipped_exercises");
          localStorage.removeItem("fitforge_session_time");
          localStorage.removeItem("fitforge_current_exercise_index");
          localStorage.setItem("fitforge_workout_date", todayStr);
          
          setCompletedExercises([]);
          setSkippedExercises([]);
          setSessionTime(0);
          setCurrentExerciseIndex(0);
        }

        const plan = JSON.parse(localStorage.getItem("fitforge_selected_plan"));
        const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

        let finalExercises = [];
        let focusStr = "Workout";

        if (plan) {
          setActivePlan(plan);
          const scheduleEntry = plan.weeklySchedule?.find(s => s.startsWith(today));
          focusStr = scheduleEntry ? (scheduleEntry.split(": ")[1] || "Rest") : "Rest";
          
          const isRestDay = today === "Sunday" || focusStr.toLowerCase() === "recovery" || focusStr.toLowerCase() === "rest" || focusStr.toLowerCase().includes("home");
          
          if (isRestDay) {
            setTodayFocus("Home Workout");
            focusStr = "Home Workout";
          } else {
            setTodayFocus(focusStr);
          }

          const allExercises = await getAllExercises() || [];

          if (isRestDay) {
            let homeExs = allExercises.filter(ex => String(ex.id).startsWith("home-")).slice(0, 10);
            if (homeExs.length < 10) {
                const extraBodyWeight = allExercises.filter(ex => ex.equipment === "body weight" && !homeExs.some(h => h.id === ex.id));
                homeExs = [...homeExs, ...extraBodyWeight].slice(0, 10);
            }
            if (homeExs.length < 10) {
              const staticRecovery = [
                { id: "home-01", name: "Bodyweight Squat", bodyPart: "legs", target: "quads", equipment: "body weight" },
                { id: "home-02", name: "Push-Up", bodyPart: "chest", target: "pectoral", equipment: "body weight" },
                { id: "home-03", name: "Plank Hold", bodyPart: "waist", target: "core", equipment: "body weight" },
                { id: "home-04", name: "Jumping Jacks", bodyPart: "cardio", target: "heart", equipment: "body weight" },
                { id: "home-05", name: "Burpees", bodyPart: "cardio", target: "heart", equipment: "body weight" },
                { id: "home-06", name: "Mountain Climbers", bodyPart: "cardio", target: "heart", equipment: "body weight" },
                { id: "home-07", name: "Leg Raise", bodyPart: "waist", target: "abs", equipment: "body weight" },
                { id: "home-08", name: "Lunges", bodyPart: "legs", target: "quads", equipment: "body weight" },
                { id: "home-09", name: "Glute Bridge", bodyPart: "legs", target: "glutes", equipment: "body weight" },
                { id: "home-10", name: "Crunches", bodyPart: "waist", target: "abs", equipment: "body weight" }
              ];
              homeExs = [...homeExs, ...staticRecovery.filter(sr => !homeExs.some(h => h.id === sr.id))].slice(0, 10);
            }
            finalExercises = homeExs.map(ex => ({ ...ex, sets: "3", reps: "15" }));
          } else {
            // Clean up punctuation (parentheses) and extract keywords
            let keywords = focusStr.toLowerCase()
              .replace(/[()]/g, " ")
              .split(/\+|,|\/|and| /)
              .map(s => s.trim())
              .filter(Boolean);

            const normalizedKeywords = keywords.map(k => {
              if (k === "bicep") return "biceps";
              if (k === "tricep") return "triceps";
              if (k === "leg") return "legs";
              if (k === "shoulder") return "shoulders";
              if (k === "fat burn" || k === "hiit") return "cardio";
              if (k === "core") return "waist";
              return k;
            });

            // Pool both global exercises and the plan's custom exercises
            const pool = [];
            const seen = new Set();
            
            allExercises.forEach(ex => {
              const key = String(ex.id || ex.name).toLowerCase();
              if (!seen.has(key)) {
                seen.add(key);
                pool.push(ex);
              }
            });

            if (plan.exercises && Array.isArray(plan.exercises)) {
              plan.exercises.forEach(ex => {
                const key = String(ex.id || ex.name).toLowerCase();
                if (!seen.has(key)) {
                  seen.add(key);
                  pool.push({
                    ...ex,
                    id: ex.id || `plan-${ex.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`
                  });
                }
              });
            }

            // Filter matching exercises
            let filtered = [];
            const isFullBody = normalizedKeywords.some(k => k === "full" || k === "body" || k === "conditioning" || k === "strength");
            if (isFullBody) {
              // For full body routines, load a varied set of movements
              filtered = pool.filter(ex => 
                ["chest", "back", "legs", "shoulders", "arms"].includes(ex.bodyPart?.toLowerCase())
              );
            } else {
              filtered = pool.filter(ex => {
                const searchString = `${ex.name} ${ex.bodyPart} ${ex.target} ${ex.equipment}`.toLowerCase();
                return normalizedKeywords.some(keyword => searchString.includes(keyword));
              });
            }

            // Fallback if no matching exercises are found but it's not a rest day
            if (filtered.length === 0) {
              if (focusStr.toLowerCase().includes("hiit") || focusStr.toLowerCase().includes("cardio")) {
                filtered = pool.filter(ex => 
                  ex.bodyPart?.toLowerCase() === "cardio" || 
                  ex.equipment?.toLowerCase() === "body weight" ||
                  ex.name?.toLowerCase().includes("push-up") ||
                  ex.name?.toLowerCase().includes("plank") ||
                  ex.name?.toLowerCase().includes("squat")
                );
              }
              
              if (filtered.length === 0 && plan.exercises && plan.exercises.length > 0) {
                filtered = plan.exercises.map(ex => ({
                  ...ex,
                  id: ex.id || `plan-${ex.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`
                }));
              }

              if (filtered.length === 0) {
                filtered = pool.slice(0, 5);
              }
            }

            // Assign proper sets and reps
            finalExercises = filtered.map(ex => {
              const planExercise = plan.exercises?.find(
                pEx => pEx.name?.toLowerCase() === ex.name?.toLowerCase() || pEx.id === ex.id
              );
              
              const exerciseMeta = plan.exercises?.find(
                pEx => typeof pEx === 'object' && pEx?.name?.trim()?.toLowerCase() === focusStr.trim().toLowerCase()
              );

              return {
                ...ex,
                sets: planExercise?.sets || exerciseMeta?.sets || ex.sets || "3",
                reps: planExercise?.reps || exerciseMeta?.reps || ex.reps || "12"
              };
            });
          }
        }

        const customPlan = JSON.parse(localStorage.getItem("fitforge_custom_workout")) || [];
        const dayAssignments = JSON.parse(localStorage.getItem("fitforge_day_assignments")) || {};
        const exerciseConfig = JSON.parse(localStorage.getItem("fitforge_exercise_config")) || {};
        
        const customExercisesForToday = customPlan.filter(ex => dayAssignments[ex.id] === today).map(ex => ({
            ...ex,
            sets: exerciseConfig[ex.id]?.sets || "3",
            reps: exerciseConfig[ex.id]?.reps || "12",
            isCustom: true
        }));

        // Upgraded Cap: At least 10, max 13 exercises per day
        const combinedExercises = [...finalExercises, ...customExercisesForToday].slice(0, 13);
        
        if (combinedExercises.length > 0) {
            if (!plan) {
               setActivePlan({ title: "Custom Plan", level: "Personalized" });
               setTodayFocus("Extra Workout");
            } else if (customExercisesForToday.length > 0 && finalExercises.length > 0) {
               setTodayFocus(focusStr + " + Custom");
            } else if (customExercisesForToday.length > 0) {
               setTodayFocus("Extra Workout");
            }
        }

        setActiveExercises(combinedExercises);

        // Stateful backend synchronization
        if (combinedExercises.length > 0) {
          startWorkoutSession(plan?.title || "Custom Plan").catch((e) => console.error("Session start error:", e));
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadWorkout();
  }, []);

  const handleSetCurrentExerciseIndex = (e, index) => {
    e.preventDefault();
    setCurrentExerciseIndex(index);
  };

  const finishWorkout = async (e) => {
    if (e) e.preventDefault();
    if (completedExercises.length === 0) {
      notifyInfo("Complete at least one exercise to save the session.");
      return;
    }

    const caloriesBurnedEstimate = completedExercises.length * 45;
    const completionPercentage = Math.round((completedExercises.length / activeExercises.length) * 100) || 0;
    
    const currentWater = Number(localStorage.getItem("fitforge_water")) || 0;
    const currentSteps = Number(localStorage.getItem("fitforge_steps")) || 0;

    const todayObj = new Date();
    const todayPart = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

    const sessionData = {
      date: todayPart,
      exercisesCompleted: activeExercises.filter(ex => completedExercises.includes(ex.id)).map(ex => ({
        exerciseId: ex.id,
        name: ex.name,
        bodyPart: ex.bodyPart
      })),
      totalExercises: activeExercises.length,
      completionPercentage: completionPercentage,
      caloriesBurned: caloriesBurnedEstimate,
      timeTaken: sessionTime,
      waterIntake: currentWater,
      steps: currentSteps
    };

    try {
      setShowProcessing(true);
      await logActivitySession(sessionData);

      // End stateful server session
      await endWorkoutSession({
        duration: sessionTime,
        caloriesBurned: caloriesBurnedEstimate,
        exercisesCompleted: sessionData.exercisesCompleted
      }).catch((e) => console.error("Session end error:", e));

      localStorage.removeItem("fitforge_stopwatch_time");
      localStorage.removeItem("fitforge_stopwatch_running");
      localStorage.removeItem("fitforge_stopwatch_lastTick");
      localStorage.removeItem("fitforge_completed_exercises");
      localStorage.removeItem("fitforge_skipped_exercises");
      localStorage.removeItem("fitforge_session_time");
      localStorage.removeItem("fitforge_current_exercise_index");

      const today = new Date().toLocaleDateString();
      const updatedAchievements = {
        ...(profile?.achievements || {}),
        workoutsCompleted: (profile?.achievements?.workoutsCompleted || 0) + 1,
      };

      if (profile?.achievements?.lastStreakDate !== today) {
        updatedAchievements.streak = (profile?.achievements?.streak || 0) + 1;
        updatedAchievements.lastStreakDate = today;
      }

      dispatch(saveUserProfile({ achievements: updatedAchievements }));

      const currentProgress = Math.round(((completedExercises.length + skippedExercises.length) / Math.max(activeExercises.length, 1)) * 100) || 0;
      if (currentProgress < 100) {
        incrementWorkoutStreak();
        incrementWorkoutsCompleted();
        addNotification("Partial Workout Saved", `You completed ${completedExercises.length} out of ${activeExercises.length} exercises today.`, "workout", "medium");
      } else {
        incrementWorkoutStreak();
        incrementWorkoutsCompleted();
        addNotification("Workout Completed!", `You crushed today's ${activePlan.title} session!`, "achievement", "high");
      }
      
      const currentHistory = JSON.parse(localStorage.getItem("fitforge_session_history") || "[]");
      currentHistory.push(sessionData);
      localStorage.setItem("fitforge_session_history", JSON.stringify(currentHistory));

      setTimeout(() => { 
        notifySuccess("Workout data synced successfully!");
        navigate("/dashboard"); 
      }, 3500);
    } catch (error) {
      console.error(error);
      notifyInfo("Failed to save session to backend.");
      setShowProcessing(false);
    }
  };

  if (showProcessing) {
    return (
      <div className="fixed inset-0 z-50 bg-white/95 dark:bg-[#030304]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="relative z-10 text-center max-w-2xl animate-in zoom-in-95 duration-1000 delay-300 fill-mode-both flex flex-col items-center">
          <div className="w-24 h-24 bg-white dark:bg-[#0F1115] border border-primary/20 rounded-full flex items-center justify-center mb-8 shadow-md shadow-primary/10">
            <Activity size={40} className="text-primary animate-pulse" />
          </div>
          
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-text-primary mb-4 tracking-tight">
            Syncing <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Data</span>.
          </h1>
          
          <p className="text-lg text-text-secondary font-semibold mb-12">
            Logging your <span className="text-primary font-bold">{completedExercises.length}</span> exercises and updating your streak.
          </p>

          <div className="flex justify-center gap-3">
             <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></div>
             <div className="h-2.5 w-2.5 rounded-full bg-secondary animate-pulse delay-75"></div>
             <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!activePlan) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-6 w-full">
        <div className="w-24 h-24 bg-black/5 dark:bg-[#0F1115] rounded-full flex items-center justify-center border border-black/10 dark:border-white/10 shadow-sm">
           <Dumbbell size={40} className="text-text-secondary" />
        </div>
        <h2 className="font-heading text-3xl font-bold text-text-primary tracking-tight">No Active Plan</h2>
        <p className="text-text-secondary font-semibold">You need to select a workout plan from the dashboard first.</p>
        <Link to="/plans" className="btn-primary mt-4 px-8 py-3 rounded-full">
          Browse Plans
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const sessionProgress = Math.round(((completedExercises.length + skippedExercises.length) / Math.max(activeExercises.length, 1)) * 100) || 0;
  const currentExercise = activeExercises[currentExerciseIndex];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 pb-32 w-full">
      
      <motion.section variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-black/5 dark:border-white/10">
        <div>
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 font-mono text-sm text-text-secondary hover:text-text-primary font-semibold transition mb-4">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h2 className="font-heading text-3xl font-bold text-text-primary tracking-tight flex items-center gap-3">
             <Activity className="text-primary" size={28} /> {todayFocus}
          </h2>
          <p className="font-mono text-text-secondary text-sm font-semibold tracking-wide mt-2 uppercase">
            {activePlan.title} • {activePlan.level}
          </p>
        </div>
      </motion.section>

      {activeExercises.length > 0 ? (
        <motion.section variants={itemVariants} className="premium-card p-0 overflow-hidden group bg-white dark:bg-[#0F1115]">
           <div className="grid grid-cols-1 lg:grid-cols-2">
             <div className="relative w-full h-64 lg:h-auto min-h-[320px] lg:min-h-[450px] overflow-hidden rounded-t-3xl lg:rounded-tr-none lg:rounded-l-3xl bg-black/5 dark:bg-[#030304] flex items-center justify-center">
                <img
                  src={getExerciseThumbnail(currentExercise)}
                  alt={currentExercise?.name}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-45 group-hover:opacity-65 transition-opacity duration-500"
                />
                
                <button 
                  onClick={(e) => { e.preventDefault(); setSelectedExercise(currentExercise); }} 
                  className="absolute bottom-6 left-6 z-25 flex items-center gap-2 bg-white/80 dark:bg-black/50 backdrop-blur px-4 py-2 rounded-xl font-mono text-sm font-semibold border border-black/10 dark:border-white/10 hover:border-primary/50 transition shadow-sm text-text-primary"
                >
                  <PlayCircle size={18} className="text-primary" /> View Form
                </button>
             </div>

             <div className="p-8 lg:p-12 flex flex-col justify-center relative bg-white dark:bg-[#0F1115] border-t lg:border-t-0 lg:border-l border-black/5 dark:border-white/10 z-10">
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-text-secondary font-mono text-xs font-semibold uppercase tracking-wider mb-4 border border-black/5 dark:border-white/10">
                     Exercise {currentExerciseIndex + 1} of {activeExercises.length}
                  </span>
                  <h3 className="font-heading text-3xl lg:text-4xl font-bold text-text-primary capitalize tracking-tight leading-tight mb-4">
                    {currentExercise?.name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    <span className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 font-mono text-xs font-semibold border border-black/5 dark:border-white/10 text-text-secondary capitalize">{currentExercise?.bodyPart}</span>
                    <span className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 font-mono text-xs font-semibold border border-black/5 dark:border-white/10 text-text-secondary capitalize">{currentExercise?.equipment || "Bodyweight"}</span>
                    {currentExercise?.isCustom && <span className="px-3 py-1.5 rounded-lg bg-primary/10 font-mono text-xs font-semibold border border-primary/20 text-primary">Custom Addition</span>}
                  </div>
                </div>

                <div className="flex gap-4 mb-10">
                  <div className="flex-1 bg-black/5 dark:bg-black/50 border border-black/5 dark:border-white/10 rounded-2xl p-5 text-center">
                    <p className="font-mono text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Target Sets</p>
                    <p className="font-heading text-4xl font-bold text-text-primary">{currentExercise?.sets}</p>
                  </div>
                  <div className="flex-1 bg-black/5 dark:bg-black/50 border border-black/5 dark:border-white/10 rounded-2xl p-5 text-center">
                    <p className="font-mono text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Target Reps</p>
                    <p className="font-heading text-4xl font-bold text-text-primary">{currentExercise?.reps}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={(e) => skipExercise(e, currentExercise?.id)}
                    className={`flex-1 py-4 rounded-xl font-mono text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                      skippedExercises.includes(currentExercise?.id)
                        ? "bg-[#FFD600]/10 text-[#FFD600] border border-[#FFD600]/30"
                        : "bg-black/5 dark:bg-white/5 text-text-primary hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10"
                    }`}
                  >
                    <SkipForward size={20} /> {skippedExercises.includes(currentExercise?.id) ? "Skipped" : "Skip"}
                  </button>

                  <button 
                    onClick={(e) => handleOpenOverlay(e, currentExercise?.id)}
                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-base flex items-center justify-center gap-2 shadow-md shadow-primary/10 hover:scale-102 transition-all"
                  >
                    <Play size={20} /> Start Timer
                  </button>
                </div>
             </div>
           </div>
        </motion.section>
      ) : (
        <motion.div variants={itemVariants} className="text-center py-20 premium-card bg-white dark:bg-[#0F1115]">
          <h3 className="font-heading text-2xl font-bold text-text-primary mb-3">Rest Day</h3>
          <p className="text-text-secondary font-semibold">Take some time to recover and prepare for your next session!</p>
        </motion.div>
      )}

      {activeExercises.length > 0 && (
        <motion.section variants={itemVariants} className="premium-card p-6 md:p-8 bg-white dark:bg-[#0F1115]">
          <div className="flex justify-between items-end mb-4">
            <p className="font-mono text-text-secondary text-xs font-semibold uppercase tracking-wider">Session Progress</p>
            <span className="font-heading text-2xl font-bold text-primary">{sessionProgress}%</span>
          </div>
          <div className="w-full h-3 bg-black/5 dark:bg-black/50 border border-black/5 dark:border-white/10 rounded-full overflow-hidden mb-10">
            <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 rounded-full" style={{ width: `${sessionProgress}%` }} />
          </div>

          <h4 className="font-heading text-xl font-bold text-text-primary mb-6 tracking-tight">Workout Sequence</h4>
          <div className="space-y-3">
            {activeExercises.map((exercise, index) => {
              const isCompleted = completedExercises.includes(exercise.id);
              const isCurrent = currentExerciseIndex === index;
              
              return (
                <div 
                  key={exercise.id} 
                  onClick={(e) => handleSetCurrentExerciseIndex(e, index)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center gap-4 ${
                    isCurrent 
                      ? "bg-white dark:bg-[#0F1115] border-primary shadow-sm scale-[1.01]" 
                      : isCompleted 
                        ? "bg-black/5 dark:bg-black/30 border-black/5 dark:border-white/10 opacity-60"
                        : "bg-white dark:bg-[#0F1115] border-black/5 dark:border-white/10 hover:border-primary/30"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isCompleted ? "bg-success text-white" : skippedExercises.includes(exercise.id) ? "bg-[#FFD600]/20 text-[#FFD600]" : "border-2 border-black/20 dark:border-white/20 text-transparent"
                  }`}>
                    {isCompleted ? <CheckCircle2 size={14} strokeWidth={3} /> : skippedExercises.includes(exercise.id) ? <SkipForward size={12} strokeWidth={3} /> : <CheckCircle2 size={12} />}
                  </div>
                  
                  <div className="flex-1">
                    <h5 className={`font-mono text-sm font-semibold capitalize transition-colors ${isCompleted ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                      {exercise.name} 
                      {exercise.isCustom && <span className="ml-2 px-1.5 py-0.5 rounded font-mono text-[9px] font-semibold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide">Custom</span>}
                    </h5>
                    <p className="font-mono text-xs text-text-secondary font-semibold tracking-wide mt-0.5">{exercise.sets} Sets × {exercise.reps} Reps</p>
                  </div>

                  {isCurrent && <ChevronRight className="text-primary" size={18} />}
                </div>
              );
            })}
          </div>
          {/* Completion overlay moved to root */}
        </motion.section>
      )}

      {activeOverlayId && (
        <div className="fixed inset-0 z-50 bg-card/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
          <button onClick={(e) => { e.preventDefault(); setOverlayRunning(false); setActiveOverlayId(null); }} className="absolute top-6 right-6 p-3 bg-bg hover:bg-border text-text-secondary hover:text-text-primary rounded-full transition-all border border-border shadow-sm">
            <X size={20} />
          </button>

          <h2 className="text-2xl md:text-4xl font-extrabold text-text-primary mb-2 text-center px-4 tracking-tight">
            {activeExercises.find(e => e.id === activeOverlayId)?.name}
          </h2>
          <p className="text-primary font-bold uppercase tracking-widest mb-10 text-xs">Active Exercise</p>

          <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center mb-16 z-10">
            {/* Glowing blur behind */}
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Custom progress circle */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="88"
                className="stroke-black/5 dark:stroke-white/5 fill-transparent"
                strokeWidth="3"
              />
              <motion.circle
                cx="100"
                cy="100"
                r="88"
                className="stroke-primary fill-transparent"
                strokeWidth="3"
                strokeDasharray="553"
                animate={{
                  strokeDashoffset: overlayRunning ? [553, 0] : 553
                }}
                transition={{
                  duration: 60,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </svg>
            
            <div className="text-center flex flex-col items-center justify-center">
              <div className="font-mono text-5xl md:text-6xl leading-none font-black text-text-primary tracking-tighter flex items-end drop-shadow-sm">
                {pad(Math.floor((overlayTime / 60000) % 60))}:
                {pad(Math.floor((overlayTime / 1000) % 60))}
                <span className="text-2xl md:text-3xl text-text-secondary ml-0.5 mb-1 font-bold">.{pad(Math.floor((overlayTime / 10) % 100))}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 w-full max-w-sm px-4">
            <button onClick={(e) => { e.preventDefault(); setOverlayRunning(!overlayRunning); }} className={`flex-1 py-4 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 border ${overlayRunning ? "bg-bg text-danger border-border hover:bg-card" : "btn-primary"}`}>
              {overlayRunning ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Resume</>}
            </button>
            <button onClick={handleCompleteOverlay} className="flex-1 py-4 bg-primary text-white font-bold text-sm rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
              <CheckCircle2 size={18} /> Done
            </button>
          </div>
        </div>
      )}

      {sessionProgress === 100 && (
        <div className="fixed inset-0 z-50 bg-card/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 p-6">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 blur-[150px] rounded-full pointer-events-none" />
          
          <button 
            onClick={(e) => { e.preventDefault(); navigate("/dashboard"); }}
            className="absolute top-6 right-6 p-3 bg-bg hover:bg-border text-text-secondary hover:text-text-primary rounded-full transition-all border border-border shadow-sm flex items-center gap-2 font-mono text-xs font-semibold"
          >
            <X size={16} /> Exit to Dashboard
          </button>

          <div className="relative z-10 flex flex-col items-center justify-center max-w-xl mx-auto text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl shadow-primary/30 mb-8 animate-bounce">
              <Trophy size={36} className="text-white animate-pulse" />
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl font-black text-text-primary mb-4 tracking-tight">
              Session Completed!
            </h1>
            <p className="text-text-secondary text-base font-semibold leading-relaxed mb-10 max-w-lg">
              {completedExercises.length === 0 ? (
                "You skipped all exercises today. Please complete at least one exercise to sync with the AI Coach and update metrics."
              ) : (
                `You completed ${completedExercises.length} out of ${activeExercises.length} exercises successfully! Tap the button below to lock in your metrics, update your streak, and sync with the AI Coach.`
              )}
            </p>
            
            {completedExercises.length > 0 ? (
              <button 
                onClick={finishWorkout} 
                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/25 flex items-center justify-center gap-3 cursor-pointer"
              >
                <Trophy size={20} /> Finish Workout & Lock Progress
              </button>
            ) : (
              <button 
                onClick={() => {
                  localStorage.removeItem("fitforge_stopwatch_time");
                  localStorage.removeItem("fitforge_stopwatch_running");
                  localStorage.removeItem("fitforge_stopwatch_lastTick");
                  localStorage.removeItem("fitforge_completed_exercises");
                  localStorage.removeItem("fitforge_skipped_exercises");
                  localStorage.removeItem("fitforge_session_time");
                  localStorage.removeItem("fitforge_current_exercise_index");
                  navigate("/dashboard");
                }} 
                className="w-full sm:w-auto px-10 py-5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-text-primary font-bold text-lg rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                Return to Dashboard
              </button>
            )}
          </div>
        </div>
      )}

      {selectedExercise && <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />}
    </motion.div>
  );
};

export default ActiveWorkoutPage;