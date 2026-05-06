import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getUserPlans } from "../api/planApi";
import { saveUserProfile } from "../app/slices/profileSlice";
import { notifySuccess, notifyInfo } from "../utils/toast";
import {
  Target,
  Clock,
  Flame,
  Zap,
  Dumbbell,
  CheckCircle2,
  ChevronDown,
  X,
} from "lucide-react";

const levelColor = {
  Beginner: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
  Intermediate: "bg-[#F7931A]/10 text-[#F7931A] border-[#F7931A]/20",
  Advanced: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
};

const goalColor = {
  "Muscle Gain": "bg-gradient-to-r from-[#EA580C]/10 to-[#F7931A]/10 text-[#F7931A] border-[#F7931A]/20",
  "Fat Loss": "bg-[#FFD600]/10 text-[#FFD600] border-[#FFD600]/20",
  Strength: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
  Endurance: "bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20",
};

const WorkoutPlansPage = () => {
  const dispatch = useDispatch();
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedGoal, setSelectedGoal] = useState("All");

  const [activePlan, setActivePlan] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fitforge_selected_plan") || "null");
    } catch {
      return null;
    }
  });

  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserPlans()
      .then((data) => {
        setWorkoutPlans(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredPlans = workoutPlans.filter(
    (plan) =>
      (selectedLevel === "All" || plan.level === selectedLevel) &&
      (selectedGoal === "All" || plan.goal === selectedGoal)
  );

  const handleSelectPlan = (plan) => {
    localStorage.setItem("fitforge_selected_plan", JSON.stringify(plan));
    setActivePlan(plan);
    dispatch(saveUserProfile({ selectedPlan: plan }));
    notifySuccess(`${plan.title} activated`);
  };

  const clearActivePlan = () => {
    localStorage.removeItem("fitforge_selected_plan");
    setActivePlan(null);
    dispatch(saveUserProfile({ selectedPlan: null }));
    notifyInfo("Active plan cleared");
  };

  return (
    <div className="space-y-8 pb-12 w-full">
      <section>
        <p className="font-mono text-xs font-medium text-[#F7931A] uppercase tracking-widest mb-2">
          AI-Powered Training
        </p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">
          Workout Plans
        </h2>
        <p className="text-[#94A3B8] text-lg mt-2">
          Pre-built plans for every level and goal.
        </p>
      </section>

      {activePlan && (
        <section className="premium-card p-6 md:p-10 relative overflow-hidden group bg-white/70 dark:bg-[#0B0F19]/45 border-black/5 dark:border-white/5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Zap size={28} className="text-primary" />
              </div>
              <div>
                <p className="font-mono text-[10px] text-primary font-semibold uppercase tracking-widest mb-1">Active Plan</p>
                <h3 className="font-heading text-3xl font-bold text-text-primary tracking-tight">{activePlan.title}</h3>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="flex items-center gap-2 bg-black/5 dark:bg-black/40 px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/5">
                    <Target size={14} className="text-primary" />
                    <span className="font-mono text-xs font-medium text-text-secondary uppercase tracking-wider">{activePlan.goal}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/5 dark:bg-black/40 px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/5">
                     <Clock size={14} className="text-secondary" />
                    <span className="font-mono text-xs font-medium text-text-secondary uppercase tracking-wider">{activePlan.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/5 dark:bg-black/40 px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/5">
                    <Flame size={14} className="text-danger" />
                    <span className="font-mono text-xs font-medium text-text-secondary uppercase tracking-wider">{activePlan.calories}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button onClick={clearActivePlan} className="p-3 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-xl transition-all border border-danger/20 flex-shrink-0 hover:shadow-sm">
              <X size={20} />
            </button>
          </div>

          <details className="mt-8 relative z-10">
            <summary className="font-mono text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary transition outline-none select-none flex items-center gap-2">
              View Weekly Schedule
              <ChevronDown size={14} className="inline group-open:rotate-180 transition-transform" />
            </summary>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {activePlan.weeklySchedule?.map((day, i) => (
                <div key={i} className="font-mono text-sm font-medium text-text-secondary px-5 py-4 rounded-xl bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 shadow-sm">
                  {day}
                </div>
              ))}
            </div>
          </details>
        </section>
      )}

      <section className="flex flex-wrap gap-4">
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="px-5 py-3.5 rounded-xl bg-white dark:bg-[#0F1115] border border-black/10 dark:border-white/10 text-text-primary font-mono text-sm focus:outline-none focus:border-primary transition cursor-pointer"
        >
          <option value="All" className="bg-card">All Levels</option>
          <option value="Beginner" className="bg-card">Beginner</option>
          <option value="Intermediate" className="bg-card">Intermediate</option>
          <option value="Advanced" className="bg-card">Advanced</option>
        </select>

        <select
          value={selectedGoal}
          onChange={(e) => setSelectedGoal(e.target.value)}
          className="px-5 py-3.5 rounded-xl bg-white dark:bg-[#0F1115] border border-black/10 dark:border-white/10 text-text-primary font-mono text-sm focus:outline-none focus:border-primary transition cursor-pointer"
        >
          <option value="All" className="bg-card">All Goals</option>
          <option value="Muscle Gain" className="bg-card">Muscle Gain</option>
          <option value="Fat Loss" className="bg-card">Fat Loss</option>
          <option value="Strength" className="bg-card">Strength</option>
          <option value="Endurance" className="bg-card">Endurance</option>
        </select>

        <span className="flex items-center font-mono text-xs font-medium text-text-secondary ml-auto uppercase tracking-wider bg-white/70 dark:bg-[#0F1115]/50 px-4 py-2 rounded-xl border border-black/5 dark:border-white/10">
          {filteredPlans.length} plan{filteredPlans.length !== 1 ? "s" : ""}
        </span>
      </section>

      <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
           <div className="col-span-full text-center py-16">
             <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto"></div>
           </div>
        ) : filteredPlans.length > 0 ? (
          filteredPlans.map((plan, index) => {
            const isActive = activePlan?.title === plan.title;

              return (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden group relative flex flex-col ${
                    isActive
                      ? "bg-white dark:bg-[#0F1115] border-primary shadow-lg shadow-primary/5 scale-[1.01]"
                      : "premium-card bg-white/70 dark:bg-[#0F1115]/50 border-black/5 dark:border-white/5 hover:border-primary/45 dark:hover:border-primary/45 hover:shadow-md"
                  }`}
                >
                  
                  <div className="p-5 md:p-6 relative z-10 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="font-heading text-lg md:text-xl font-bold text-text-primary leading-tight tracking-tight pr-2">{plan.title}</h3>
                      {isActive && (
                        <span className="flex-shrink-0 px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-mono text-[9px] font-semibold uppercase tracking-widest shadow-sm shadow-primary/5">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-bold uppercase tracking-wider border ${levelColor[plan.level] || ""}`}>
                        {plan.level}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-bold uppercase tracking-wider border ${goalColor[plan.goal] || "bg-black/5 dark:bg-white/5 text-text-secondary border-black/5 dark:border-white/5"}`}>
                        {plan.goal}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[9px] font-bold text-text-secondary bg-black/5 dark:bg-black/30 px-2 py-0.5 rounded-md border border-black/5 dark:border-white/5">
                         <Clock size={11} className="text-secondary" />
                        {plan.duration}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[9px] font-bold text-text-secondary bg-black/5 dark:bg-black/30 px-2 py-0.5 rounded-md border border-black/5 dark:border-white/5">
                        <Flame size={11} className="text-danger" />
                        {plan.calories}
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-6 flex-1 border-t border-black/5 dark:border-white/5 pt-4">
                      {plan.exercises.slice(0, 3).map((exercise, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all group/item">
                          <div className="flex items-center gap-2 truncate pr-2">
                            <Dumbbell size={12} className="text-text-secondary group-hover/item:text-primary transition-colors shrink-0" />
                            <span className="truncate capitalize font-mono text-xs font-semibold text-text-primary">{exercise.name}</span>
                          </div>
                          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 bg-black/5 dark:bg-black/40 text-text-secondary uppercase tracking-wider rounded border border-black/5 dark:border-white/5">
                            {exercise.sets}×{exercise.reps}
                          </span>
                        </div>
                      ))}
                      {plan.exercises.length > 3 && (
                        <div className="font-mono text-[9px] text-text-secondary font-bold uppercase tracking-wider pt-1 pl-2.5">
                          + {plan.exercises.length - 3} more exercises
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isActive}
                      className={`w-full py-3 rounded-full font-semibold transition-all mt-auto text-sm cursor-pointer ${
                        isActive
                          ? "bg-primary/10 text-primary border border-primary/20 cursor-default"
                          : "bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary/10 hover:scale-[1.02] active:scale-[0.98]"
                      }`}
                    >
                      {isActive ? (
                        <><CheckCircle2 size={16} className="inline mr-1.5 -mt-0.5" />Currently Active</>
                      ) : (
                        "Select Plan"
                      )}
                    </button>
                  </div>
                </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-16 bg-white/50 dark:bg-[#0F1115]/50 rounded-3xl border border-black/5 dark:border-white/5 border-dashed">
            <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Dumbbell size={24} className="text-text-secondary" />
            </div>
            <h3 className="font-heading text-xl font-bold text-text-primary mb-2">No Plans Found</h3>
            <p className="text-text-secondary text-sm">Adjust filters to discover more plans.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default WorkoutPlansPage;