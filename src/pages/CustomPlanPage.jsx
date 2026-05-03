import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, CheckCircle2, RotateCcw, Download, X, Plus, ChevronDown, ChevronUp, Target, Calendar, Play, Pause } from "lucide-react";
import { getFromLocalStorage, saveToLocalStorage } from "../utils/localStorage";
import { notifyInfo, notifySuccess } from "../utils/toast";
import { addNotification } from "../utils/notifications";
import useUserProfile from "../hooks/useUserProfile";
import { SectionTitle } from "../components/ui/SectionTitle";
import { staggerContainer, staggerItem } from "../animations/stagger";

const getCurrentTime = () => Date.now();

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const CustomPlanPage = () => {
  useUserProfile();

  const loadExercises = () => {
    const fromCustomPlan = getFromLocalStorage("fitforge_custom_plan") || [];
    const fromWorkout = getFromLocalStorage("fitforge_custom_workout") || [];
    const merged = [...fromCustomPlan];
    fromWorkout.forEach((ex) => {
      if (!merged.find((m) => m.id === ex.id)) merged.push(ex);
    });
    return merged;
  };

  const [exercises, setExercises] = useState(loadExercises);
  const [completedIds, setCompletedIds] = useState([]);
  const [activeDay, setActiveDay] = useState(() => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return DAYS.includes(today) ? today : "Monday";
  });

  const [dayAssignments, setDayAssignments] = useState(getFromLocalStorage("fitforge_day_assignments") || {});
  const [exerciseConfig, setExerciseConfig] = useState(getFromLocalStorage("fitforge_exercise_config") || {});

  const [sessions, setSessions] = useState(getFromLocalStorage("fitforge_session_history") || []);
  const [sessionTime, setSessionTime] = useState(0);
  const [activeOverlayId, setActiveOverlayId] = useState(null);
  const [overlayTime, setOverlayTime] = useState(0);
  const [overlayRunning, setOverlayRunning] = useState(false);

  const [expandedId, setExpandedId] = useState(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlayRunning, overlayTime]);

  const pad = (num) => num.toString().padStart(2, "0");

  useEffect(() => {
    setTimeout(() => {
      setDayAssignments((prev) => {
        let changed = false;
        const next = { ...prev };
        exercises.forEach((ex) => {
          if (!next[ex.id]) {
            next[ex.id] = activeDay;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 0);
  }, [exercises, activeDay]);

  useEffect(() => {
    saveToLocalStorage("fitforge_custom_plan", exercises);
    saveToLocalStorage("fitforge_custom_workout", exercises);
  }, [exercises]);

  useEffect(() => { saveToLocalStorage("fitforge_day_assignments", dayAssignments); }, [dayAssignments]);
  useEffect(() => { saveToLocalStorage("fitforge_exercise_config", exerciseConfig); }, [exerciseConfig]);

  // Upgraded Cap: At least 10, max 13 exercises per day
  const dayExercises = exercises.filter((ex) => dayAssignments[ex.id] === activeDay).slice(0, 13);
  const completedCount = dayExercises.filter((ex) => completedIds.includes(ex.id)).length;
  const progress = dayExercises.length > 0 ? Math.round((completedCount / dayExercises.length) * 100) : 0;

  const handleOpenOverlay = (e, id) => {
    e.preventDefault();
    if (completedIds.includes(id)) {
      setCompletedIds(completedIds.filter((cid) => cid !== id));
      return;
    }
    setActiveOverlayId(id);
    setOverlayTime(0);
    setOverlayRunning(true);
  };

  const handleCompleteOverlay = (e) => {
    e.preventDefault();
    const id = activeOverlayId;
    setOverlayRunning(false);
    setActiveOverlayId(null);

    setSessionTime(prev => prev + overlayTime);

    const newCompleted = [...completedIds, id];
    setCompletedIds(newCompleted);

    if (newCompleted.length === dayExercises.length && dayExercises.length > 0) {
      const session = {
        date: new Date().toISOString(),
        day: activeDay,
        exercisesCompleted: newCompleted.length,
        totalExercises: dayExercises.length,
        completionPercentage: Math.round((newCompleted.length / dayExercises.length) * 100) || 0,
        caloriesBurned: newCompleted.length * 45,
        timeTaken: sessionTime + overlayTime,
        isCustom: true
      };
      const updated = [session, ...sessions];
      setSessions(updated);
      saveToLocalStorage("fitforge_session_history", updated);
      notifySuccess("Workout completed! Session saved");
      addNotification("Custom Session Logged", `You completed a custom session.`, "workout", "medium");
    }
  };

  const removeExercise = (e, id) => {
    e.preventDefault();
    setExercises(exercises.filter((ex) => ex.id !== id));
    setCompletedIds(completedIds.filter((cid) => cid !== id));
    const newAssignments = { ...dayAssignments };
    delete newAssignments[id];
    setDayAssignments(newAssignments);
    notifyInfo("Exercise removed");
    addNotification("Removed from Plan", "Exercise was removed from your custom plan.", "planner", "low");
  };

  const assignDay = (e, exerciseId, day) => {
    e.preventDefault();
    setDayAssignments({ ...dayAssignments, [exerciseId]: day });
  };

  const updateConfig = (e, exerciseId, field, value) => {
    e.preventDefault();
    setExerciseConfig({
      ...exerciseConfig,
      [exerciseId]: {
        ...(exerciseConfig[exerciseId] || { sets: 3, reps: 12 }),
        [field]: Number(value) || 0,
      },
    });
  };

  const resetSession = (e) => {
    e.preventDefault();
    setCompletedIds([]);
    setOverlayRunning(false);
    setActiveOverlayId(null);
    setSessionTime(0);
    notifyInfo("Session reset for another round!");
  };

  const clearAllExercises = (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to clear the entire plan?")) {
      setExercises([]); setCompletedIds([]); setDayAssignments({}); setExerciseConfig({});
      saveToLocalStorage("fitforge_custom_plan", []); saveToLocalStorage("fitforge_custom_workout", []);
      notifyInfo("All exercises cleared");
    }
  };

  const exportPlan = (e) => {
    e.preventDefault();
    if (!exercises.length) return notifyInfo("Nothing to export");
    const data = { exercises, dayAssignments, exerciseConfig };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "fitforge-workout-plan.json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    notifySuccess("Plan exported");
  };

  const getDayCount = (day) => exercises.filter((ex) => dayAssignments[ex.id] === day).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <motion.div 
      variants={staggerContainer} 
      initial="hidden" 
      animate="visible" 
      className="space-y-6 pb-24 w-full"
    >
      <SectionTitle 
        title="Plan Builder" 
        subtitle="Design, track, and master your custom routines."
        action={
          <div className="flex gap-3 flex-wrap">
            <Link to="/exercises" className="flex items-center gap-2 px-5 py-2.5 btn-primary text-sm font-semibold rounded-xl transition shadow-sm active:scale-95">
              <Plus size={16} /> Add Exercises
            </Link>
            <button onClick={exportPlan} className="flex items-center gap-2 px-5 py-2.5 bg-card hover:bg-border text-text-primary text-sm font-semibold rounded-xl transition border border-border">
              <Download size={16} /> Export
            </button>
            {exercises.length > 0 && (
              <button onClick={clearAllExercises} className="flex items-center gap-2 px-5 py-2.5 bg-danger/10 border border-danger/20 text-danger hover:bg-danger/20 text-sm font-semibold rounded-xl transition hover:border-danger/50">
                <Trash2 size={16} /> Clear
              </button>
            )}
          </div>
        }
      />

      <motion.section variants={staggerItem} className="p-3 sm:p-4 bg-white/50 dark:bg-[#0B0F19]/50 border border-black/8 dark:border-white/5 rounded-2xl overflow-x-auto custom-scrollbar">
        <div className="flex min-w-max gap-3">
          {DAYS.map((day) => {
            const count = getDayCount(day);
            const isActive = day === activeDay;
            return (
              <button
                key={day}
                onClick={(e) => { e.preventDefault(); setActiveDay(day); }}
                className={`relative flex-1 min-w-[130px] px-4 py-4 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${isActive ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.01] border-none" : "bg-white/30 dark:bg-[#0B0F19]/20 border border-black/5 dark:border-white/5 hover:border-primary/30 text-text-secondary"}`}
              >
                <span className="text-sm font-bold uppercase tracking-widest">{day.slice(0, 3)}</span>
                <div className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg ${isActive ? 'bg-white/20' : 'bg-white/10 dark:bg-black/20 border border-black/5 dark:border-white/5'}`}>{count} Exercises</div>
              </button>
            );
          })}
        </div>
      </motion.section>

      <motion.section variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white/50 dark:bg-[#0B0F19]/50 border border-black/8 dark:border-white/5 p-6 rounded-2xl overflow-hidden relative flex-1">

            <div className="flex justify-between items-end mb-8 relative z-10 border-b border-black/5 dark:border-white/5 pb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-text-primary tracking-tight">{activeDay}'s Routine</h3>
                <p className="text-primary font-bold mt-2 uppercase tracking-widest text-[10px]">{dayExercises.length} Exercises Planned</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest mb-1">Completion</p>
                <p className="text-4xl font-extrabold text-primary tracking-tighter">{progress}%</p>
              </div>
            </div>

            {dayExercises.length > 0 && (
              <div className="w-full bg-border rounded-full h-3 mb-8 relative z-10 overflow-hidden shadow-inner">
                <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
              </div>
            )}


            {dayExercises.length > 0 ? (
              progress === 100 ? (
                <div className="relative z-10 p-8 bg-success/5 border border-success/20 rounded-2xl text-center shadow-sm">
                  <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-success" />
                  </div>
                  <h3 className="text-xl font-extrabold text-text-primary mb-1">Workout Completed!</h3>
                  <p className="text-text-secondary font-medium text-sm mb-6">You crushed all {dayExercises.length} exercises.</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-bg border border-border rounded-xl p-4">
                      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-1">Completion</p>
                      <p className="text-xl font-extrabold text-success">100%</p>
                    </div>
                    <div className="bg-bg border border-border rounded-xl p-4">
                      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-1">Time Taken</p>
                      <p className="text-xl font-extrabold text-text-primary">
                        {Math.floor(sessionTime / 60000)}m {Math.floor((sessionTime / 1000) % 60)}s
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={resetSession} className="flex-1 py-3 bg-card border border-border text-text-primary font-semibold text-sm rounded-xl hover:bg-bg transition-all flex items-center justify-center gap-2 shadow-sm">
                      <RotateCcw size={16} /> Do it again
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 relative z-10">
                  {dayExercises.map((exercise) => {
                    const isCompleted = completedIds.includes(exercise.id);
                    const isExpanded = expandedId === exercise.id;
                    const conf = exerciseConfig[exercise.id] || { sets: 3, reps: 12 };

                    return (
                      <div key={exercise.id} className={`rounded-xl border transition-all duration-300 overflow-hidden ${isCompleted ? 'bg-primary/5 border-primary/20 opacity-75' : 'bg-bg border-border hover:border-primary/20 shadow-sm'}`}>
                        <div className="p-4 flex items-center gap-4">
                          <button onClick={(e) => handleOpenOverlay(e, exercise.id)} className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-primary text-white' : 'border-2 border-border text-transparent hover:border-primary'}`}>
                            {isCompleted && <CheckCircle2 size={14} strokeWidth={3} />}
                          </button>

                          <div className="flex-1 cursor-pointer" onClick={(e) => { e.preventDefault(); setExpandedId(isExpanded ? null : exercise.id); }}>
                            <h4 className={`text-sm font-bold tracking-tight transition-colors ${isCompleted ? 'text-text-secondary line-through' : 'text-text-primary'}`}>{exercise.name}</h4>
                            <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase mt-1">{conf.sets} Sets × {conf.reps} Reps</p>
                          </div>

                          <button onClick={(e) => { e.preventDefault(); setExpandedId(isExpanded ? null : exercise.id); }} className="p-1.5 text-text-secondary hover:text-text-primary transition">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="p-4 bg-card border-t border-border">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-2 tracking-widest">Target Sets</label>
                                <div className="flex items-center bg-bg rounded-lg overflow-hidden border border-border shadow-sm">
                                  <button onClick={(e) => updateConfig(e, exercise.id, 'sets', Math.max(1, conf.sets - 1))} className="px-3 py-2 text-text-secondary hover:bg-card transition font-bold text-sm">-</button>
                                  <input type="number" value={conf.sets} onChange={(e) => updateConfig(e, exercise.id, 'sets', e.target.value)} className="w-full bg-transparent text-center text-text-primary text-sm font-bold outline-none" />
                                  <button onClick={(e) => updateConfig(e, exercise.id, 'sets', conf.sets + 1)} className="px-3 py-2 text-text-secondary hover:bg-card transition font-bold text-sm">+</button>
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-2 tracking-widest">Target Reps</label>
                                <div className="flex items-center bg-bg rounded-lg overflow-hidden border border-border shadow-sm">
                                  <button onClick={(e) => updateConfig(e, exercise.id, 'reps', Math.max(1, conf.reps - 1))} className="px-3 py-2 text-text-secondary hover:bg-card transition font-bold text-sm">-</button>
                                  <input type="number" value={conf.reps} onChange={(e) => updateConfig(e, exercise.id, 'reps', e.target.value)} className="w-full bg-transparent text-center text-text-primary text-sm font-bold outline-none" />
                                  <button onClick={(e) => updateConfig(e, exercise.id, 'reps', conf.reps + 1)} className="px-3 py-2 text-text-secondary hover:bg-card transition font-bold text-sm">+</button>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <select value={dayAssignments[exercise.id]} onChange={(e) => assignDay(e, exercise.id, e.target.value)} className="flex-1 bg-bg border border-border text-sm font-bold text-text-primary rounded-lg px-3 py-2.5 outline-none shadow-sm cursor-pointer">
                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                              <button onClick={(e) => removeExercise(e, exercise.id)} className="px-4 py-2.5 bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20 rounded-lg transition flex items-center justify-center shadow-sm">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="text-center py-12 bg-bg rounded-2xl border border-border border-dashed relative z-10">
                <div className="w-14 h-14 bg-card border border-border rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Calendar size={20} className="text-text-secondary" />
                </div>
                <h4 className="text-lg font-extrabold text-text-primary mb-1 tracking-tight">Rest Day</h4>
                <p className="text-text-secondary font-medium mb-6 max-w-xs mx-auto text-sm">No exercises scheduled. Browse the library to build your routine.</p>
                <Link to="/exercises" className="px-6 py-3 btn-primary text-sm font-semibold rounded-xl shadow-sm inline-block">
                  Browse Exercises
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">

          <div className="bg-white/50 dark:bg-[#0B0F19]/50 border border-black/8 dark:border-white/5 p-6 rounded-2xl flex-1">
            <div className="flex justify-between items-end mb-8 relative z-10 border-b border-black/5 dark:border-white/5 pb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-text-primary tracking-tight">Total Routine Specs</h3>
                <p className="text-transparent select-none font-bold mt-2 uppercase tracking-widest text-[10px]">Overview</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white/30 dark:bg-[#0B0F19]/30 p-5 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Total Exercises</span>
                <span className="text-2xl font-extrabold text-primary">{exercises.length}</span>
              </div>
              <div className="flex justify-between items-center bg-white/30 dark:bg-[#0B0F19]/30 p-5 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Active Days</span>
                <span className="text-2xl font-extrabold text-secondary">{DAYS.filter(d => getDayCount(d) > 0).length}/7</span>
              </div>
            </div>
          </div>
        </div>

      </motion.section>

      {activeOverlayId && (
        <div className="fixed inset-0 z-50 bg-card/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
          <button onClick={(e) => { e.preventDefault(); setOverlayRunning(false); setActiveOverlayId(null); }} className="absolute top-6 right-6 p-3 bg-bg hover:bg-border text-text-secondary hover:text-text-primary rounded-full transition-all border border-border shadow-sm">
            <X size={20} />
          </button>

          <h2 className="text-2xl md:text-4xl font-extrabold text-text-primary mb-2 text-center px-4 tracking-tight">
            {exercises.find(e => e.id === activeOverlayId)?.name}
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
    </motion.div>
  );
};

export default CustomPlanPage;