import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchActivities } from "../app/slices/progressSlice";
import { fetchUserProfile } from "../app/slices/profileSlice";
import { getNutrition } from "../api/nutritionApi";
import { getWeeklyAnalytics } from "../api/analyticsApi";
import { logActivitySession } from "../api/progressApi";
import { getGoogleAuthUrl, forceStepsSync, fetchTodaySteps, disconnectGoogleFit } from "../api/fitnessApi";
import {
  Droplets,
  Flame,
  Activity,
  PlayCircle,
  Apple,
  Plus,
  CheckCircle2,
  Footprints,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  PlusCircle,
  RefreshCw,
  Heart,
  Moon,
  Dumbbell,
  Calendar
} from "lucide-react";

import YearStreakCalendar from "../components/dashboard/YearStreakCalendar";
import CompletionProgressChart from "../components/charts/CompletionProgressChart";
import useUserProfile from "../hooks/useUserProfile";
import DashboardSkeleton from "../components/skeletons/DashboardSkeleton";
import { addNotification } from "../utils/notifications";
import { PremiumCard } from "../components/ui/PremiumCard";
import { StatCard } from "../components/ui/StatCard";
import { ProgressRing } from "../components/ui/ProgressRing";
import { SectionTitle } from "../components/ui/SectionTitle";
import { staggerContainer, staggerItem } from "../animations/stagger";
import { cn } from "../utils/cn";
import { notifySuccess, notifyInfo, notifyError } from "../utils/toast";
const getCurrentTime = () => Date.now();
const createDate = (val) => val ? new Date(val) : new Date();

const getTodayDatePart = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

export const DashboardV2 = () => {
  const { profile } = useUserProfile();
  const dispatch = useDispatch();
  
  const [nutritionData, setNutritionData] = useState([]);
  const sessions = useSelector((state) => state.progress.activities || []);
  const isLoading = useSelector((state) => state.progress.loading);

  const [weeklyStats, setWeeklyStats] = useState(null);

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchActivities());
    getNutrition().then(data => setNutritionData(data.meals || [])).catch(console.error);
    getWeeklyAnalytics().then(res => {
      if (res?.success) setWeeklyStats(res.data);
    }).catch(console.error);
  }, [dispatch]);

  const [waterIntake, setWaterIntake] = useState(() => {
    const savedDate = localStorage.getItem("fitforge_water_date");
    const todayPart = getTodayDatePart();
    if (savedDate === todayPart) {
      return Number(localStorage.getItem("fitforge_water")) || 0;
    } else {
      localStorage.setItem("fitforge_water_date", todayPart);
      localStorage.setItem("fitforge_water", 0);
      return 0;
    }
  });
  const [steps, setSteps] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [activeMinutes, setActiveMinutes] = useState(0);
  const [distance, setDistance] = useState(0);
  const [heartPoints, setHeartPoints] = useState(0);
  const [averageHeartRate, setAverageHeartRate] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  const [showGreetingPopup, setShowGreetingPopup] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [waterLoaded, setWaterLoaded] = useState(false);

  // Sync steps state to localStorage for CompletionProgressChart live rendering
  useEffect(() => {
    localStorage.setItem("fitforge_steps", steps);
  }, [steps]);

  // Show day greeting popup on mount if it hasn't been shown today yet
  useEffect(() => {
    const todayPart = getTodayDatePart();
    const lastGreetingDate = localStorage.getItem("fitforge_last_greeting_date");
    const forceShow = localStorage.getItem("show_day_greeting") === "true";
    
    if (lastGreetingDate !== todayPart || forceShow) {
      setShowGreetingPopup(true);
      localStorage.setItem("fitforge_last_greeting_date", todayPart);
      localStorage.removeItem("show_day_greeting");
    }
  }, []);

  // Recover water intake from backend activity logs if today's activity is already initialized (only once on initial load)
  useEffect(() => {
    if (!waterLoaded && sessions && sessions.length > 0) {
      const todayPart = getTodayDatePart();
      const todayActivity = sessions.find(s => {
        const dbDate = s.date;
        const dbDatePart = typeof dbDate === "string" ? dbDate.substring(0, 10) : new Date(dbDate).toISOString().substring(0, 10);
        return dbDatePart === todayPart;
      });
      if (todayActivity && todayActivity.waterIntake !== undefined) {
        setWaterIntake(todayActivity.waterIntake);
        localStorage.setItem("fitforge_water", todayActivity.waterIntake);
        localStorage.setItem("fitforge_water_date", todayPart);
        setWaterLoaded(true);
      }
    }
  }, [sessions, waterLoaded]);

  // Fetch initial telemetry on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const todayPart = getTodayDatePart();
    fetchTodaySteps(todayPart).then(res => {
      if (res?.success) {
        setSteps(res.steps || 0);
        setCaloriesBurned(res.caloriesBurned || 0);
        setActiveMinutes(res.activeMinutes || 0);
        setDistance(res.distance || 0);
        setHeartPoints(res.heartPoints || 0);
        setAverageHeartRate(res.averageHeartRate || 0);
        setSleepHours(res.sleepHours || 0);
        localStorage.setItem("fitforge_steps", res.steps || 0);
        setIsGoogleConnected(res.isConnected);
      }
    }).catch(console.error);
  }, []);

  // Background polling sync every 10 minutes
  useEffect(() => {
    if (!isGoogleConnected) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const interval = setInterval(async () => {
      try {
        const todayPart = getTodayDatePart();
        const res = await forceStepsSync(todayPart);
        if (res?.success) {
          const d = res.data || res;
          setSteps(d.steps || 0);
          setCaloriesBurned(d.caloriesBurned || 0);
          setActiveMinutes(d.activeMinutes || 0);
          setDistance(d.distance || 0);
          setHeartPoints(d.heartPoints || 0);
          setAverageHeartRate(d.averageHeartRate || 0);
          setSleepHours(d.sleepHours || 0);
          setLastSynced(new Date());
        }
      } catch (e) {
        console.error("Auto steps sync error:", e);
      }
    }, 600000); // 10 minutes

    return () => clearInterval(interval);
  }, [isGoogleConnected]);

  const handleGoogleStepsSync = async (e) => {
    e.preventDefault();
    if (isSyncing) return;

    const token = localStorage.getItem("token");
    if (!token) {
      notifyError("Authentication required. Please log in first.");
      return;
    }

    if (!isGoogleConnected) {
      notifyInfo("Redirecting to secure Google Auth screen...");
      try {
        const res = await getGoogleAuthUrl();
        if (res?.success && res?.url) {
          window.location.href = res.url;
        } else {
          throw new Error("Missing auth redirect URL");
        }
      } catch (err) {
        console.error("OAuth redirection generation failed:", err);
        notifyError("Unable to connect. Google Fit credentials or configuration is missing on the server.");
      }
      return;
    }

    setIsSyncing(true);
    notifyInfo("Syncing steps and health telemetry from Google Fit API...");
    try {
      const todayPart = getTodayDatePart();
      const res = await forceStepsSync(todayPart);
      if (res?.success) {
        const d = res.data || res;
        setSteps(d.steps || 0);
        setCaloriesBurned(d.caloriesBurned || 0);
        setActiveMinutes(d.activeMinutes || 0);
        setDistance(d.distance || 0);
        setHeartPoints(d.heartPoints || 0);
        setAverageHeartRate(d.averageHeartRate || 0);
        setSleepHours(d.sleepHours || 0);
        setLastSynced(new Date());
        notifySuccess(`Synced! Imported ${d.steps.toLocaleString()} steps, ${d.sleepHours || 0} hrs sleep, & ${d.averageHeartRate || 0} bpm HR.`);
        addNotification("Google Fit Synced", `Fit telemetry synced perfectly. Steps: ${d.steps.toLocaleString()}`, "workout", "low");
      } else {
        throw new Error(res?.message || "Unable to sync Google Fit telemetry.");
      }
    } catch (err) {
      console.error("Google Fit synchronization failed:", err);
      const errMsg = err.response?.data?.message || err.message || "Unable to sync Google Fit data.";
      notifyError(`Unable to sync Google Fit telemetry. ${errMsg}`);
      
      // Auto-disconnect frontend state if the backend reports integration is missing or credentials revoked
      if (errMsg.toLowerCase().includes("not integrated") || errMsg.toLowerCase().includes("missing") || errMsg.toLowerCase().includes("reconnect")) {
        setIsGoogleConnected(false);
      }
      
      addNotification("Step Sync Failed", "Unable to sync steps. Please reconnect Google Fit.", "workout", "high");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleDisconnect = async (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to disconnect Google Fit? Your telemetry will no longer automatically sync until you reconnect.")) {
      notifyInfo("Disconnecting Google Fit...");
      try {
        const res = await disconnectGoogleFit();
        if (res?.success) {
          setIsGoogleConnected(false);
          setSteps(0);
          setCaloriesBurned(0);
          setActiveMinutes(0);
          setDistance(0);
          setHeartPoints(0);
          setAverageHeartRate(0);
          setSleepHours(0);
          notifySuccess("Successfully disconnected Google Fit!");
          addNotification("Google Fit Disconnected", "Google Fit integration has been successfully removed.", "workout", "medium");
        } else {
          throw new Error(res?.message || "Failed to disconnect Google Fit");
        }
      } catch (err) {
        console.error("Disconnect Google Fit error:", err);
        notifyError(err.message || "Unable to disconnect Google Fit.");
      }
    }
  };
  
  const handleAddWater = async (e) => {
    e.preventDefault();
    const newWater = waterIntake + 1;
    const todayPart = getTodayDatePart();
    setWaterIntake(newWater);
    localStorage.setItem("fitforge_water", newWater);
    localStorage.setItem("fitforge_water_date", todayPart);
    addNotification("Hydration Logged", `You added a glass of water. Total: ${newWater}`, "hydration", "low");

    try {
      await logActivitySession({ waterIntake: newWater, date: todayPart });
      dispatch(fetchActivities());
      getWeeklyAnalytics().then(res => {
        if (res?.success) setWeeklyStats(res.data);
      }).catch(console.error);
    } catch (err) {
      console.error("Failed to sync water intake with backend:", err);
    }
  };

  const todayPart = getTodayDatePart();
  const isWorkoutCompletedToday = sessions.some(s => {
    const dbDate = s.date;
    const dbDatePart = typeof dbDate === "string" ? dbDate.substring(0, 10) : new Date(dbDate).toISOString().substring(0, 10);
    return dbDatePart === todayPart && s.exercisesCompleted && s.exercisesCompleted.length > 0;
  });

  const caloriesIntakeToday = nutritionData
    .reduce((sum, meal) => sum + (meal.calories || 0), 0);

  const caloriesBurnedToday = Math.max(
    sessions
      .filter(s => {
        const dbDate = s.date;
        const dbDatePart = typeof dbDate === "string" ? dbDate.substring(0, 10) : new Date(dbDate).toISOString().substring(0, 10);
        return dbDatePart === todayPart;
      })
      .reduce((sum, s) => sum + (s.caloriesBurned || 0), 0),
    caloriesBurned || 0
  );

  const activeMinutesToday = Math.max(
    Math.round(
      sessions
        .filter(s => {
          const dbDate = s.date;
          const dbDatePart = typeof dbDate === "string" ? dbDate.substring(0, 10) : new Date(dbDate).toISOString().substring(0, 10);
          return dbDatePart === todayPart;
        })
        .reduce((sum, s) => sum + (s.timeTaken || 0), 0) / 60000
    ),
    activeMinutes || 0
  );

  const goal = profile.goal || "Muscle Gain";

  const weeklyBurn = weeklyStats ? weeklyStats.reduce((sum, s) => sum + (s.totalCaloriesBurned || 0), 0) : 0;
  const weeklySteps = weeklyStats ? weeklyStats.reduce((sum, s) => sum + (s.totalSteps || 0), 0) : 0;
  const weeklyWater = weeklyStats ? weeklyStats.reduce((sum, s) => sum + (s.totalWater || 0), 0) : 0;

  const getTodayWorkout = () => {
    try {
      const activePlan = JSON.parse(localStorage.getItem("fitforge_selected_plan"));
      if (activePlan && activePlan.weeklySchedule) {
        const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
        const scheduleEntry = activePlan.weeklySchedule.find(s => s.startsWith(today));
        
        if (scheduleEntry) {
          const focus = scheduleEntry.split(": ")[1] || "Workout";
          
          if (focus.toLowerCase() === "recovery" || focus.toLowerCase() === "rest") {
             return { name: "Recovery Day", isRest: true };
          }

          const exerciseMeta = activePlan.exercises?.find(
            ex => typeof ex === 'object' && ex?.name?.trim()?.toLowerCase() === focus.trim().toLowerCase()
          );

          return {
            name: focus,
            sets: exerciseMeta?.sets ? exerciseMeta.sets : "3",
            reps: exerciseMeta?.reps ? exerciseMeta.reps : "10-15",
            isRest: false,
            planName: activePlan.title,
          };
        }
      }
    } catch {
      // Ignore parse error
    }
    return null;
  };

  const todaysWorkout = getTodayWorkout();
  const streak = profile?.achievements?.streak || 0;

  const getPersonalizedGreeting = () => {
    const time = new Date().getHours();
    let greetingPrefix = "Welcome back";
    if (time < 12) greetingPrefix = "Good morning";
    else if (time < 18) greetingPrefix = "Good afternoon";
    else greetingPrefix = "Good evening";

    const name = profile?.name || "Athlete";
    const goalText = profile?.goal || "fitness";
    
    let activePlanTitle = "Custom Routine";
    try {
      const activePlan = JSON.parse(localStorage.getItem("fitforge_selected_plan"));
      if (activePlan?.title) {
        activePlanTitle = activePlan.title;
      }
    } catch (e) {
      // Ignore
    }

    // Determine workout split info for today
    const workout = getTodayWorkout();
    let workoutFocus = "Recovery & Rest";
    let workoutDetails = "Focus on active recovery, hydration, and nutrition.";
    let workoutQuote = "Your muscles grow when you rest! Today is a dedicated recovery day. Focus on hydration, dynamic stretching, and feeding your body the macros it needs to rebuild.";
    let isRest = true;

    if (workout && !workout.isRest) {
      workoutFocus = workout.name;
      workoutDetails = `${workout.sets} Sets × ${workout.reps} Reps`;
      workoutQuote = `Today's Split: ${workout.name} (${workoutDetails}). Prepare your mind, prime your central nervous system, and let's conquer this session!`;
      isRest = false;
    }

    return {
      title: `${greetingPrefix}, ${name}!`,
      plan: activePlanTitle,
      goal: goalText,
      quote: workoutQuote,
      workoutFocus,
      workoutDetails,
      isRest
    };
  };

  // Diet template configurations aligned with actual meal protocols
  const dietTemplates = {
    "Vegetarian": [350, 220, 650, 320, 550],
    "Non-Vegetarian": [400, 250, 550, 120, 500],
    "Vegan": [380, 200, 580, 130, 450],
    "High Protein": [350, 110, 600, 200, 450]
  };
  const pref = profile?.nutritionPreference || "Vegetarian";
  const dailyCalories = dietTemplates[pref] || dietTemplates["Vegetarian"];
  const targetCalories = dailyCalories.reduce((sum, cal) => sum + cal, 0);

  // AI recommendations based on metrics
  const getAIRecommendations = () => {
    const recs = [];
    if (caloriesIntakeToday < targetCalories * 0.5) {
      recs.push({ text: "Protein intake is below target. Log an afternoon high-protein snack.", highlight: "high-protein" });
    }
    if (waterIntake < (profile?.dailyWaterGoal || 8) * 0.6) {
      recs.push({ text: "Hydration levels are low today. Drink 2 more glasses to match your goal.", highlight: "Drink 2 more glasses" });
    }
    if (!isWorkoutCompletedToday && todaysWorkout && !todaysWorkout.isRest) {
      recs.push({ text: `Next workout: ${todaysWorkout.name}. Prepare for a heavy chest day!`, highlight: todaysWorkout.name });
    }
    if (recs.length === 0) {
      recs.push({ text: "Awesome job staying consistent! You are matching all your daily targets.", highlight: "consistent" });
    }
    return recs;
  };

  const aiRecs = getAIRecommendations();

  // Aggregate multi-source activities into a unified timeline
  const timelineEvents = useMemo(() => {
    const events = [];

    // 1. Completed workouts from database session logs
    sessions.forEach(sess => {
      events.push({
        type: "workout",
        title: `${sess.exercisesCompleted?.length || 1} Exercises Completed`,
        subtitle: sess.planName || "Workout Routine Completed",
        date: new Date(sess.date || sess.createdAt),
        badge: `+${sess.caloriesBurned || 0} kcal`,
        badgeColor: "bg-green-500/10 border-green-500/20 text-[#10B981]"
      });
    });

    // 2. Added Favorited Exercises from local storage
    try {
      const favs = JSON.parse(localStorage.getItem("fitforge_favorites")) || [];
      favs.forEach((fav, index) => {
        events.push({
          type: "favorite",
          title: `Favorited "${fav.name}"`,
          subtitle: `Added to exercise favorites library`,
          date: createDate(getCurrentTime() - index * 3600000 * 2 - 60000), // Offset slightly
          badge: "Hearted",
          badgeColor: "bg-red-500/10 border-red-500/20 text-red-500"
        });
      });
    } catch {
      // Ignore parsing or history loading error
    }

    // 3. Custom plans configured
    try {
      const customPlan = JSON.parse(localStorage.getItem("fitforge_custom_workout")) || [];
      if (customPlan.length > 0) {
        events.push({
          type: "custom_plan",
          title: "Custom Plan Completed",
          subtitle: `Personalized sequence completed successfully`,
          date: createDate(getCurrentTime() - 3600000 * 24), // Show as yesterday
          badge: "Finished",
          badgeColor: "bg-primary/10 border-primary/20 text-[#FDBA74]"
        });
      }
    } catch {
      // Ignore parsing or custom plan error
    }

    // 4. Logged meals from nutrition logs
    nutritionData.forEach(meal => {
      const cleanName = meal.name.includes("]") ? meal.name.split("] ")[1] : meal.name;
      const slot = meal.name.includes("[") ? meal.name.split("[")[1].split("]")[0] : "Meal";
      events.push({
        type: "nutrition",
        title: `Logged ${slot}`,
        subtitle: `${cleanName} (${meal.calories} kcal)`,
        date: createDate(meal.createdAt || getCurrentTime()),
        badge: `${meal.protein}g Protein`,
        badgeColor: "bg-[#FFD600]/10 border-[#FFD600]/20 text-[#FFD600]"
      });
    });

    // Sort by date descending and display top 4 logs
    return events.sort((a, b) => b.date - a.date).slice(0, 4);
  }, [sessions, nutritionData]);

  // Progress calculations aligned with daily protocol template totals
  const caloriePercentage = Math.min(((caloriesIntakeToday / targetCalories) * 100) || 0, 100);

  if (isLoading && sessions.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div 
      variants={staggerContainer} 
      initial="hidden" 
      animate="visible" 
      className="space-y-6 pb-24 w-full"
    >
      {/* SECTION TITLE & ACTIONS */}
      <SectionTitle 
        title="Workout Hub" 
        subtitle="Transforming data into real daily consistency."
        action={
          <div className="flex gap-2">
            <Link to="/active-workout" className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 text-xs font-semibold uppercase tracking-wider font-mono">
              <PlayCircle size={14} className="text-primary" /> Active Timer
            </Link>
          </div>
        }
      />

      {/* HERO GREETING SECTION */}
      <motion.div variants={staggerItem}>
        <PremiumCard className="p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 dark:bg-[#0B0F19]/50 border-black/8 dark:border-white/5">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary dark:text-[#FDBA74] mb-4">
              <Sparkles size={12} />
              <span>AI Coach Sync Enabled</span>
            </div>
            
            <p className="font-mono text-[#64748B] dark:text-[#94A3B8] text-xs uppercase tracking-widest mb-2 font-semibold">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{profile?.name || "Athlete"}</span>
            </h1>
            <p className="text-[#64748B] dark:text-[#94A3B8] mt-3 text-sm md:text-base leading-relaxed">
              Stay locked in on your <span className="text-primary dark:text-[#FDBA74] font-bold">{goal.toLowerCase()}</span> goal. Your progress toward the target weight of <span className="font-bold text-[#0F172A] dark:text-white">{profile?.targetWeight || "--"} kg</span> is currently ahead of baseline metrics.
            </p>
          </div>

          <div className="relative z-10 w-full md:w-auto shrink-0 flex items-center gap-4 bg-white/80 dark:bg-black/20 p-5 rounded-3xl border border-black/5 dark:border-white/5 backdrop-blur">
            <ProgressRing percentage={caloriePercentage} size={90} strokeWidth={8} color="primary">
              <div className="text-center">
                <span className="text-xs font-bold font-heading">{Math.round(caloriePercentage)}%</span>
                <p className="text-[8px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase">Nutr</p>
              </div>
            </ProgressRing>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">Consistency Score</span>
              <h3 className="text-2xl font-black font-heading text-primary dark:text-[#FDBA74] mt-0.5">A+</h3>
              <p className="text-[10px] text-green-500 font-semibold flex items-center gap-0.5 mt-0.5">
                <TrendingUp size={12} /> +2.4% vs prev.
              </p>
            </div>
          </div>
        </PremiumCard>
      </motion.div>

      {/* THREE COLUMN GRID: TODAY'S FOCUS, STATS GRID, AI INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Today's Focus Card */}
        <motion.div variants={staggerItem} className="lg:col-span-2">
          <PremiumCard className="p-8 md:p-10 h-full flex flex-col justify-between relative overflow-hidden bg-white/50 dark:bg-[#0B0F19]/50 border-black/8 dark:border-white/5">
            <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-secondary/10 text-secondary border border-secondary/20 shadow-sm">
                    <Activity size={18} />
                  </span>
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#64748B] dark:text-[#94A3B8]">Target Focus</span>
                </div>
                {todaysWorkout && !todaysWorkout.isRest && (
                  <span className="px-2.5 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-[10px] font-semibold text-secondary uppercase tracking-wider">
                    Today
                  </span>
                )}
              </div>

              {todaysWorkout ? (
                todaysWorkout.isRest ? (
                  <div className="py-6">
                    <h3 className="font-heading text-3xl md:text-4xl font-black text-[#0F172A] dark:text-white mb-3 tracking-tight">Recovery Protocol</h3>
                    <p className="text-[#64748B] dark:text-[#94A3B8] text-sm leading-relaxed max-w-md">No scheduled resistance exercises. Hydrate, focus on active stretching, and allow fibers to rebuild.</p>
                  </div>
                ) : (
                  <div>
                    <span className="font-mono text-primary dark:text-[#FDBA74] text-[10px] font-bold uppercase tracking-widest mb-1.5 block">{todaysWorkout.planName}</span>
                    <h3 className="font-heading text-3xl md:text-4xl font-black text-[#0F172A] dark:text-white mb-6 tracking-tight leading-tight">
                      {todaysWorkout.name}
                    </h3>
                    <div className="flex items-center gap-2.5 font-mono text-xs font-semibold">
                      <span className="px-3.5 py-2 rounded-xl bg-black/5 dark:bg-black/40 text-[#0F172A] dark:text-white border border-black/5 dark:border-white/5">
                        {todaysWorkout.sets} Sets
                      </span>
                      <span className="px-3.5 py-2 rounded-xl bg-black/5 dark:bg-black/40 text-[#0F172A] dark:text-white border border-black/5 dark:border-white/5">
                        {todaysWorkout.reps} Reps
                      </span>
                    </div>
                  </div>
                )
              ) : (
                <div className="py-6">
                  <h3 className="font-heading text-2xl font-bold text-[#0F172A] dark:text-white mb-3 tracking-tight">No Plan Initiated</h3>
                  <p className="text-[#64748B] dark:text-[#94A3B8] text-sm leading-relaxed max-w-md">Activate a tailored workout regime inside our workout plans catalog to initialize dynamic analytics.</p>
                </div>
              )}
            </div>

            <div className="relative z-10 mt-10 pt-6 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              {isWorkoutCompletedToday && !todaysWorkout?.isRest && (
                <div className="flex items-center gap-2.5 text-[#10B981] font-semibold bg-[#10B981]/10 px-4 py-2.5 rounded-2xl border border-[#10B981]/20">
                  <CheckCircle2 size={16} />
                  <span className="tracking-wide text-xs uppercase font-mono">Plan Completed</span>
                </div>
              )}
              {todaysWorkout && !todaysWorkout.isRest ? (
                <Link 
                  to="/active-workout" 
                  onClick={() => {
                    localStorage.removeItem("fitforge_stopwatch_time");
                    localStorage.removeItem("fitforge_stopwatch_running");
                    localStorage.removeItem("fitforge_stopwatch_lastTick");
                    localStorage.removeItem("fitforge_completed_exercises");
                    localStorage.removeItem("fitforge_skipped_exercises");
                    localStorage.removeItem("fitforge_session_time");
                    localStorage.removeItem("fitforge_current_exercise_index");
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-[#EA580C] text-white font-semibold text-sm rounded-full px-6 py-3 shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <PlayCircle size={16} />
                  {isWorkoutCompletedToday ? "Do it Again" : "Start Workout"}
                </Link>
              ) : !todaysWorkout ? (
                <Link 
                  to="/plans" 
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-primary/30 hover:bg-primary/5 text-primary text-sm font-semibold px-6 py-3 rounded-full transition-all"
                >
                  Select Plan
                </Link>
              ) : null}
            </div>
          </PremiumCard>
        </motion.div>

        {/* Column 2: AI Coach Recommendation Box */}
        <motion.div variants={staggerItem}>
          <PremiumCard className="p-6 md:p-8 h-full flex flex-col justify-between glass-premium border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2.5 text-primary dark:text-[#FDBA74]">
                  <BrainCircuit size={20} />
                  <h3 className="font-heading font-extrabold text-sm tracking-tight text-[#0F172A] dark:text-white uppercase">AI Coach Insights</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary dark:text-[#FDBA74] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Live
                </div>
              </div>

              <div className="space-y-4">
                {aiRecs.map((rec, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-white/45 dark:bg-white/5 border border-black/5 dark:border-white/5 relative overflow-hidden flex gap-3 items-start backdrop-blur-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <p className="text-xs leading-relaxed text-[#64748B] dark:text-[#94A3B8] font-medium">
                      {rec.text.split(rec.highlight).map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className="text-[#0F172A] dark:text-white font-bold">{rec.highlight}</span>
                          )}
                        </span>
                      ))}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/nutrition" className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-primary dark:text-[#FDBA74] font-bold group pt-6">
              <span>View nutrition logger</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </PremiumCard>
        </motion.div>
      </div>

      {/* STATS MATRIX SECTION */}
      <motion.section variants={staggerItem} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {/* Streak Stat */}
        <StatCard
          title="Day Streak"
          value={streak}
          icon={Flame}
          color="orange"
          trend={{ value: 14, type: "up" }}
        />

        {/* Steps Stat */}
        <StatCard
          title="Daily Steps"
          value={steps}
          targetValue={profile?.stepTarget || 5000}
          icon={Footprints}
          color="green"
          action={
            <button onClick={handleGoogleStepsSync} title="Sync Google Steps" className="p-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-black/10 transition shrink-0 cursor-pointer">
              <RefreshCw size={12} className={cn("text-success", isSyncing && "animate-spin")} />
            </button>
          }
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", isGoogleConnected ? "bg-[#10B981] animate-pulse" : "bg-[#EF4444]")} />
                <span className="text-[9px] font-mono text-[#64748B]/70 dark:text-[#94A3B8]/60 uppercase tracking-wider font-extrabold truncate">
                  {isSyncing ? "SYNCING..." : isGoogleConnected ? (lastSynced ? `SYNC: ${lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "CONNECTED") : "DISCONNECTED"}
                </span>
              </div>
              {isGoogleConnected && (
                <button 
                  onClick={handleGoogleDisconnect} 
                  className="text-[9px] font-mono text-red-500 hover:text-red-400 font-bold uppercase tracking-wider transition underline cursor-pointer bg-transparent border-0 p-0 ml-2 shrink-0 z-20 relative"
                  title="Disconnect Google Fit Integration"
                >
                  Disconnect
                </button>
              )}
            </div>
          }
        />

        {/* Water Intake Stat */}
        <StatCard
          title="Water Goal"
          value={waterIntake}
          targetValue={profile?.dailyWaterGoal || 8}
          unit="gl"
          icon={Droplets}
          color="cyan"
          action={
            <button onClick={handleAddWater} className="p-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-black/10 transition shrink-0 cursor-pointer">
              <Plus size={14} className="text-secondary" />
            </button>
          }
        />

        {/* Active Calorie Burn */}
        <StatCard
          title="Active Burn"
          value={caloriesBurnedToday}
          unit="kcal"
          icon={Flame}
          color="purple"
        />

        {/* Calorie Intake */}
        <StatCard
          title="Nutrition In"
          value={caloriesIntakeToday}
          unit="kcal"
          icon={Apple}
          color="orange"
        />

        {/* Active Time */}
        <StatCard
          title="Active Time"
          value={activeMinutesToday}
          unit="min"
          icon={Clock}
          color="cyan"
        />

        {/* Heart Rate Stat */}
        <StatCard
          title="Heart Rate"
          value={averageHeartRate || 0}
          unit={averageHeartRate ? "bpm" : ""}
          icon={Heart}
          color="orange"
          action={
            <button onClick={handleGoogleStepsSync} title="Sync Google Fit Telemetry" className="p-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-black/10 transition shrink-0 cursor-pointer">
              <RefreshCw size={12} className={cn("text-[#EA580C] dark:text-[#FB923C]", isSyncing && "animate-spin")} />
            </button>
          }
          footer={
            <span className="text-[9px] font-mono text-[#64748B]/70 dark:text-[#94A3B8]/60 uppercase tracking-wider font-extrabold">
              {isGoogleConnected ? (averageHeartRate ? "DYNAMIC PULSE ACTIVE" : "NO DATA RECORDED") : "CONNECT FIT"}
            </span>
          }
        />

        {/* Sleep Duration Stat */}
        <StatCard
          title="Sleep Hours"
          value={sleepHours || 0}
          unit={sleepHours ? "hrs" : ""}
          icon={Moon}
          color="purple"
          action={
            <button onClick={handleGoogleStepsSync} title="Sync Google Fit Telemetry" className="p-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-black/10 transition shrink-0 cursor-pointer">
              <RefreshCw size={12} className={cn("text-primary dark:text-[#FDBA74]", isSyncing && "animate-spin")} />
            </button>
          }
          footer={
            <span className="text-[9px] font-mono text-[#64748B]/70 dark:text-[#94A3B8]/60 uppercase tracking-wider font-extrabold">
              {isGoogleConnected ? (sleepHours ? "RECOVERY METRIC OK" : "NO DATA RECORDED") : "CONNECT FIT"}
            </span>
          }
        />
      </motion.section>

      {/* Live Weekly Summary Panel */}
      {weeklyStats && (
        <motion.div variants={staggerItem} className="p-5 rounded-3xl glass-premium border border-primary/10 flex flex-col md:flex-row justify-between items-center gap-6 mt-4 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <TrendingUp size={22} className="text-primary animate-pulse" />
            <div>
              <h4 className="font-heading font-extrabold text-xs text-[#0F172A] dark:text-white uppercase tracking-wider">Weekly Aggregate Stats</h4>
              <p className="text-[10px] text-text-secondary">Direct aggregation from live MongoDB session logs</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-8 justify-center">
            <div className="text-center">
              <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest block mb-0.5">Burned</span>
              <span className="font-heading font-extrabold text-base text-primary dark:text-[#FDBA74]">{weeklyBurn} kcal</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest block mb-0.5">Steps</span>
              <span className="font-heading font-extrabold text-base text-[#10B981]">{weeklySteps} steps</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest block mb-0.5">Hydration</span>
              <span className="font-heading font-extrabold text-base text-[#FFD600]">{weeklyWater} glasses</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* CHART SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        {/* Weekly Completion Progress Chart */}
        <motion.div variants={staggerItem} className="h-full min-w-0">
          <PremiumCard className="p-6 md:p-8 bg-white/50 dark:bg-[#0B0F19]/50 border-black/8 dark:border-white/5 h-full overflow-hidden">
            <CompletionProgressChart waterIntake={waterIntake} steps={steps} />
          </PremiumCard>
        </motion.div>

        {/* Yearly Consistency Streak Map */}
        <motion.div variants={staggerItem} className="h-full min-w-0">
          <PremiumCard className="p-6 md:p-8 bg-white/50 dark:bg-[#0B0F19]/50 border-black/8 dark:border-white/5 h-full overflow-hidden">
            <YearStreakCalendar sessions={sessions} />
          </PremiumCard>
        </motion.div>
      </div>

      {/* TIMELINE & QUICK ACTIONS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Recent Activity Timeline */}
        <motion.div variants={staggerItem} className="lg:col-span-2 h-full">
          <PremiumCard className="p-6 md:p-8 bg-white/50 dark:bg-[#0B0F19]/50 border-black/8 dark:border-white/5 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight font-heading mb-6 flex items-center gap-2">
                <Activity size={18} className="text-primary" /> Activity Log
              </h3>

              {timelineEvents.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">No workouts or nutrition logs registered today.</p>
                </div>
              ) : (
                <div className="relative pl-6 border-l border-black/5 dark:border-white/5 space-y-6">
                  {timelineEvents.map((evt, idx) => (
                    <div key={idx} className="relative">
                      {/* Circle Node */}
                      <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-4 border-[var(--bg)] dark:border-[#030304] box-content" />
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-[#0F172A] dark:text-white capitalize">
                            {evt.title}
                          </h4>
                          <p className="text-[10px] text-text-secondary mt-0.5 font-medium">
                            {evt.subtitle}
                          </p>
                          <span className="text-[9px] font-mono text-[#64748B] dark:text-[#94A3B8] block mt-1">
                            {evt.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <span className={`text-[9px] font-mono font-semibold border px-2 py-0.5 rounded-lg ${evt.badgeColor}`}>
                            {evt.badge}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PremiumCard>
        </motion.div>

        {/* Column 3: Quick Action shortcuts */}
        <motion.div variants={staggerItem} className="h-full">
          <PremiumCard className="p-6 md:p-8 bg-white/50 dark:bg-[#0B0F19]/50 border-black/8 dark:border-white/5 flex flex-col gap-4 h-full justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight font-heading mb-6">Quick Actions</h3>
              
              <div className="flex flex-col gap-4">
                <Link to="/active-workout" className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/80 dark:bg-[#131825]/40 border border-black/5 dark:border-white/5 hover:border-primary/20 transition group">
                  <PlayCircle size={18} className="text-primary group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <h4 className="text-xs font-bold">Launch Tracker</h4>
                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">Start logging exercise reps</p>
                  </div>
                </Link>

                <Link to="/nutrition" className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/80 dark:bg-[#131825]/40 border border-black/5 dark:border-white/5 hover:border-secondary/20 transition group">
                  <Apple size={18} className="text-secondary group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <h4 className="text-xs font-bold">Log Daily Meals</h4>
                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">Update protein and calorie macros</p>
                  </div>
                </Link>

                <Link to="/custom-plan" className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/80 dark:bg-[#131825]/40 border border-black/5 dark:border-white/5 hover:border-primary/20 transition group">
                  <PlusCircle size={18} className="text-primary-light group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <h4 className="text-xs font-bold">Build Custom Plan</h4>
                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">Tailor dynamic split sequences</p>
                  </div>
                </Link>
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      </div>

      {/* Personalized Day Greeting Popup */}
      <AnimatePresence>
        {showGreetingPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card/95 to-background/95 p-8 text-center shadow-2xl glass-premium"
            >
              {/* Ambient decoration */}
              <div className="absolute -top-12 -left-12 w-40 h-40 bg-primary/20 blur-[50px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-secondary/20 blur-[50px] rounded-full pointer-events-none" />

              <div className="relative z-10">
                {/* Heartbeat animated pulse logo icon */}
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center mb-5 text-primary animate-heartbeat">
                  <Activity size={30} />
                </div>

                <span className="font-mono text-[9px] font-extrabold uppercase tracking-widest text-primary mb-2 block">
                  Athlete Profile Loaded
                </span>

                <h2 className="font-heading text-2xl font-black tracking-tight text-text-primary mb-3">
                  {getPersonalizedGreeting().title}
                </h2>

                <p className="text-xs text-text-secondary leading-relaxed mb-6 font-semibold">
                  {getPersonalizedGreeting().quote}
                </p>

                {/* Grid for Goal and Active Plan info */}
                <div className="grid grid-cols-2 gap-4 mb-4 bg-black/5 dark:bg-black/25 p-4 rounded-2xl border border-black/5 dark:border-white/5 text-left">
                  <div>
                    <span className="text-[8px] font-mono text-text-secondary/70 uppercase tracking-wider block mb-0.5">Primary Goal</span>
                    <span className="text-xs font-bold text-primary dark:text-[#FDBA74] capitalize">
                      {getPersonalizedGreeting().goal}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-text-secondary/70 uppercase tracking-wider block mb-0.5">Active Split</span>
                    <span className="text-xs font-bold text-text-primary capitalize">
                      {getPersonalizedGreeting().plan}
                    </span>
                  </div>
                </div>

                {/* Workout Focus Highlight Card */}
                <div className="p-4 mb-6 rounded-2xl border border-primary/20 bg-primary/5 text-left flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    {getPersonalizedGreeting().isRest ? <Calendar size={18} /> : <Dumbbell size={18} />}
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-text-secondary/70 uppercase tracking-wider block mb-0.5">Today's Workout Target</span>
                    <span className="text-sm font-extrabold text-text-primary capitalize">
                      {getPersonalizedGreeting().workoutFocus}
                    </span>
                    {!getPersonalizedGreeting().isRest && (
                      <span className="text-[10px] text-text-secondary font-mono block mt-0.5">
                        {getPersonalizedGreeting().workoutDetails}
                      </span>
                    )}
                  </div>
                </div>

                {/* Close/CTA button */}
                <button
                  onClick={() => setShowGreetingPopup(false)}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-[#EA580C] hover:opacity-90 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all cursor-pointer border-0 outline-none uppercase tracking-widest font-heading"
                >
                  Conquer the Day
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default DashboardV2;
