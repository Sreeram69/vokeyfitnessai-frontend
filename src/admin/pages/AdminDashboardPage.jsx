import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Activity,
  TrendingUp,
  DollarSign,
  Server,
  HardDrive,
  Cpu,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Zap,
  X
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { getAdminStats, getActiveSessions, createAdminNotification } from "../services/adminService";
import { notifyError, notifySuccess } from "../../utils/toast";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 25 } }
};

export const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  // Live Gym Floor states
  const [activeSessions, setActiveSessions] = useState([]);
  const [showMotivationModal, setShowMotivationModal] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [motivationMessage, setMotivationMessage] = useState("");
  const [pushing, setPushing] = useState(false);
  const [tick, setTick] = useState(0);

  const fetchStatsData = async (isRefresh = false, period = selectedPeriod) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await getAdminStats({ range: period });
      setStats(data);
      if (isRefresh) notifySuccess("Dashboard statistics reloaded");
    } catch (err) {
      console.error(err);
      notifyError("Failed to fetch dashboard statistics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    fetchStatsData(false, period);
  };

  const fetchActiveSessions = async () => {
    try {
      const data = await getActiveSessions();
      setActiveSessions(data || []);
    } catch (e) {
      console.error("Failed to fetch active gym floor sessions:", e);
    }
  };

  const handlePushMotivation = async (e) => {
    if (e) e.preventDefault();
    if (!targetUser || !motivationMessage.trim()) return;

    setPushing(true);
    try {
      await createAdminNotification({
        recipient: targetUser._id,
        title: "Coach's Advice ⚡",
        message: motivationMessage.trim(),
        type: "admin",
        priority: "high"
      });
      notifySuccess(`Motivation alert pushed to ${targetUser.username}!`);
      setShowMotivationModal(false);
      setMotivationMessage("");
    } catch (err) {
      console.error(err);
      notifyError("Failed to dispatch motivation alert");
    } finally {
      setPushing(false);
    }
  };

  useEffect(() => {
    fetchStatsData(false, "all");
    fetchActiveSessions();

    const statsInterval = setInterval(() => fetchActiveSessions(), 10000); // Poll active sessions every 10 seconds
    const timerInterval = setInterval(() => setTick((t) => t + 1), 1000); // Ticking timers live on screen

    return () => {
      clearInterval(statsInterval);
      clearInterval(timerInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-black/10 dark:bg-white/5 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 animate-pulse rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 animate-pulse rounded-3xl" />
          <div className="h-96 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 animate-pulse rounded-3xl" />
        </div>
      </div>
    );
  }

  const { metrics, charts, systemHealth, recentActivity } = stats || {
    metrics: { totalUsers: 0, activeUsers: 0, growthPercent: 0, workoutsCompleted: 0, totalCaloriesBurned: 0 },
    charts: { dailyWorkouts: [], monthlyRegistrations: [] },
    systemHealth: { cpuLoad: 0, memoryUsage: 0, osUptime: 0, platform: "unknown", totalMemoryGB: "0.0", usedMemoryGB: "0.0" },
    recentActivity: []
  };

  const metricCards = [
    {
      title: "Total Athletes",
      value: metrics.totalUsers,
      change: `+${metrics.growthPercent}% this month`,
      icon: Users,
      color: "from-primary to-indigo-600",
      glow: "rgba(147, 51, 234, 0.15)"
    },
    {
      title: "Active Athletes (7d)",
      value: metrics.activeUsers,
      change: `${metrics.totalUsers > 0 ? Math.round((metrics.activeUsers / metrics.totalUsers) * 100) : 0}% active rate`,
      icon: Activity,
      color: "from-cyan-500 to-blue-500",
      glow: "rgba(6, 182, 212, 0.15)"
    },
    {
      title: "Workouts Completed",
      value: metrics.workoutsCompleted,
      change: `Burned ${Math.round(metrics.totalCaloriesBurned).toLocaleString()} kcal`,
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-500",
      glow: "rgba(16, 185, 129, 0.15)"
    },
    {
      title: "Platform Revenue",
      value: `$${Math.round(metrics.totalUsers * 9.99).toLocaleString()}`,
      change: "Calculated ARR estimation",
      icon: DollarSign,
      color: "from-orange-500 to-amber-500",
      glow: "rgba(249, 115, 22, 0.15)"
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2">
            System Console
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] font-mono mt-1">
            Core operations, engine metrics, and database activity logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Period Filter */}
          <div className="flex p-1 bg-black/5 dark:bg-black/50 border border-black/5 dark:border-white/5 rounded-2xl">
            {[
              { id: "day", label: "TODAY" },
              { id: "month", label: "MONTH" },
              { id: "year", label: "YEAR" },
              { id: "all", label: "ALL TIME" }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePeriodChange(p.id)}
                className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
                  selectedPeriod === p.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchStatsData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-black/10 dark:border-white/10 rounded-2xl bg-white dark:bg-[#0F1115] hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm font-semibold font-mono shadow-sm cursor-pointer"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "REFRESH CONSOLE"}
          </button>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="premium-card relative overflow-hidden p-6 bg-white dark:bg-[#0F1115] flex flex-col justify-between"
              style={{ boxShadow: `0 10px 30px -10px ${card.glow}` }}
            >
              {/* Background gradient ring */}
              <div className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl rounded-full opacity-[0.03] dark:opacity-10 bg-gradient-to-br ${card.color}`} />
              
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                    {card.title}
                  </p>
                  <h3 className="font-heading text-3xl font-extrabold text-[#0F172A] dark:text-white mt-2">
                    {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
                  </h3>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} p-0.5 shadow-md shadow-primary/10`}>
                  <div className="w-full h-full bg-white dark:bg-[#0F1115] rounded-[10px] flex items-center justify-center">
                    <Icon size={18} className="text-[#F7931A] dark:text-[#FDBA74]" />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                <span className="font-mono text-xs text-[#64748B] dark:text-[#94A3B8] font-semibold">
                  {card.change}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* "Live Gym Floor" Coaching Dashboard */}
      <div className="premium-card p-6 bg-white dark:bg-[#0F1115] border border-black/5 dark:border-white/5 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#F7931A]/5 to-transparent blur-3xl pointer-events-none rounded-full" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F7931A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F7931A]"></span>
              </span>
              <h2 className="font-heading text-xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
                Live Gym Floor
              </h2>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono mt-1">
              Real-time feed of active athlete workouts. Push custom coach motivation instantly.
            </p>
          </div>
          <div className="px-3 py-1 font-mono text-[10px] font-bold uppercase border border-[#F7931A]/20 bg-[#F7931A]/10 text-[#F7931A] rounded-full">
            {activeSessions.length} Athlete{activeSessions.length !== 1 ? "s" : ""} Online
          </div>
        </div>

        {activeSessions.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center border border-dashed border-black/10 dark:border-white/5 rounded-3xl bg-black/[0.01] dark:bg-white/[0.01]">
            <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center mb-4">
              <Users size={24} className="text-[#64748B]/50 dark:text-[#94A3B8]/50" />
            </div>
            <p className="font-heading font-bold text-sm text-[#0F172A] dark:text-white">
              All Quiet on the Gym Floor
            </p>
            <p className="font-sans text-xs text-[#64748B] dark:text-[#94A3B8] text-center max-w-sm mt-1">
              No active athlete sessions detected at this moment. When athletes start a workout, they will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSessions.map((session) => {
              const userObj = session.userId || {};
              const avatar = userObj.profile?.avatar;
              const username = userObj.username || "Athlete";
              const goal = userObj.profile?.goal ? userObj.profile.goal.replace("_", " ") : "General Fitness";
              
              // Ticking dynamic duration
              const isPaused = session.status === "paused";
              let elapsedSec = session.duration || 0;
              if (!isPaused && session.startedAt) {
                const startTime = new Date(session.startedAt).getTime();
                elapsedSec = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
              }

              const formatTime = (totalSeconds) => {
                const h = Math.floor(totalSeconds / 3600);
                const m = Math.floor((totalSeconds % 3600) / 60);
                const s = totalSeconds % 60;
                return [
                  h > 0 ? h : null,
                  m.toString().padStart(2, "0"),
                  s.toString().padStart(2, "0")
                ].filter(Boolean).join(":");
              };

              return (
                <motion.div
                  key={session._id}
                  layout
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="relative p-5 rounded-3xl bg-white/50 dark:bg-black/35 backdrop-blur-md border border-black/5 dark:border-white/5 flex flex-col justify-between shadow-sm overflow-hidden"
                >
                  {/* Subtle top indicator bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isPaused ? "from-amber-400 to-amber-600" : "from-[#F7931A] to-[#FFD600]"}`} />

                  {/* Card Header */}
                  <div>
                    <div className="flex justify-between items-start gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-primary/20 bg-black/5 dark:bg-[#0B0F19] p-0.5 shadow-sm shrink-0">
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center overflow-hidden text-primary dark:text-[#FDBA74]">
                            {avatar ? (
                              <img src={avatar} alt={username} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-heading font-bold text-xs uppercase">{username[0]}</span>
                            )}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-heading text-sm font-extrabold text-[#0F172A] dark:text-white truncate">
                            {username}
                          </h3>
                          <span className="font-mono text-[9px] text-[#64748B] dark:text-[#94A3B8]/70 font-semibold uppercase tracking-wider block truncate">
                            {goal}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 font-mono text-[8px] font-bold uppercase rounded-full shrink-0 border ${
                        isPaused 
                          ? "border-amber-500/20 bg-amber-500/10 text-amber-500" 
                          : "border-[#F7931A]/20 bg-[#F7931A]/10 text-[#F7931A] animate-pulse"
                      }`}>
                        {session.status}
                      </span>
                    </div>

                    {/* Split Details */}
                    <div className="mb-4">
                      <p className="font-mono text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-wider">
                        Active split
                      </p>
                      <p className="font-heading font-bold text-md text-[#0F172A] dark:text-white mt-0.5">
                        {session.category || "General"}
                      </p>
                    </div>

                    {/* Stats & Timers */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-3 rounded-2xl bg-black/5 dark:bg-black/45 border border-black/5 dark:border-white/5">
                      <div>
                        <span className="font-mono text-[9px] text-[#64748B] dark:text-[#94A3B8] font-semibold uppercase tracking-wider block">
                          Workout Time
                        </span>
                        <span className="font-mono text-sm font-extrabold text-[#0F172A] dark:text-white mt-1 flex items-center gap-1">
                          <Clock size={12} className={isPaused ? "text-amber-500" : "text-[#F7931A] animate-spin"} style={{ animationDuration: "4s" }} />
                          {formatTime(elapsedSec)}
                        </span>
                      </div>
                      <div>
                        <span className="font-mono text-[9px] text-[#64748B] dark:text-[#94A3B8] font-semibold uppercase tracking-wider block">
                          Energy Burned
                        </span>
                        <span className="font-mono text-sm font-extrabold text-[#0F172A] dark:text-white mt-1 flex items-center gap-1">
                          <Zap size={12} className="text-[#FFD600]" />
                          {session.caloriesBurned || 0} kcal
                        </span>
                      </div>
                    </div>

                    {/* Exercises Completed List */}
                    <div className="mb-5">
                      <div className="flex justify-between items-center mb-2 font-mono text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-wider">
                        <span>Exercises Checked</span>
                        <span className="text-[#F7931A]">{session.exercisesCompleted?.length || 0} Completed</span>
                      </div>
                      
                      {session.exercisesCompleted && session.exercisesCompleted.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto custom-scrollbar pr-1">
                          {session.exercisesCompleted.map((ex, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 font-sans text-[10px] font-medium border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 text-[#0F172A] dark:text-white/80 rounded-xl flex items-center gap-1 hover:border-[#F7931A]/20 transition-all"
                            >
                              🏋️ {ex.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="font-mono text-[10px] text-[#64748B]/70 dark:text-[#94A3B8]/50 italic py-2">
                          Warm-up / starting workout...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => {
                      setTargetUser({ _id: userObj._id || session.userId, username });
                      setMotivationMessage("");
                      setShowMotivationModal(true);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-[#F7931A] to-[#FFD600] text-black font-semibold font-mono text-xs rounded-2xl flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-[#F7931A]/20 cursor-pointer"
                  >
                    <Zap size={13} fill="currentColor" />
                    PUSH MOTIVATION ⚡
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Charts & Logs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recharts diagrams */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Workout Performance Charts */}
          <div className="premium-card p-6 bg-white dark:bg-[#0F1115]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading text-lg font-bold text-[#0F172A] dark:text-white">
                  Active Workout Flow
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono mt-0.5">
                  Frequency of completed workout sessions in the past week
                </p>
              </div>
              <span className="px-2 py-0.5 font-mono text-[9px] font-bold uppercase border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 rounded-full animate-pulse">
                Live updates
              </span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.dailyWorkouts} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="workoutColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={10} fontStyle="bold" tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} fontStyle="bold" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 17, 21, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      color: "#fff",
                      fontFamily: "JetBrains Mono"
                    }}
                  />
                  <Area type="monotone" dataKey="workouts" stroke="#8B5CF6" strokeWidth={2.5} fillOpacity={1} fill="url(#workoutColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Signups Analytics */}
          <div className="premium-card p-6 bg-white dark:bg-[#0F1115]">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#0F172A] dark:text-white">
                Monthly Registration Pipeline
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono mt-0.5 mb-6">
                Cumulative check-ins and registrations across past 6 months
              </p>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthlyRegistrations} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={10} fontStyle="bold" tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} fontStyle="bold" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 17, 21, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      color: "#fff",
                      fontFamily: "JetBrains Mono"
                    }}
                  />
                  <Bar dataKey="users" fill="#FFD600" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: Health and Activities */}
        <div className="space-y-6">
          
          {/* System Health Card */}
          <div className="premium-card p-6 bg-gradient-to-br from-white to-primary/[0.01] dark:from-[#0F1115] dark:to-orange-950/[0.03] border border-black/5 dark:border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl rounded-full pointer-events-none" />
            <h3 className="font-heading text-lg font-bold text-[#0F172A] dark:text-white mb-6 flex items-center gap-2">
              <Server className="text-primary dark:text-[#FDBA74]" size={20} />
              Host Engine Health
            </h3>

            <div className="space-y-5">
              {/* CPU Load */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-[#64748B] dark:text-[#94A3B8] font-semibold flex items-center gap-1.5">
                    <Cpu size={12} /> CPU Engine Load
                  </span>
                  <span className="text-[#0F172A] dark:text-white font-bold">{systemHealth.cpuLoad}%</span>
                </div>
                <div className="w-full bg-black/5 dark:bg-black/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-1000"
                    style={{ width: `${systemHealth.cpuLoad}%` }}
                  />
                </div>
              </div>

              {/* Memory Usage */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-[#64748B] dark:text-[#94A3B8] font-semibold flex items-center gap-1.5">
                    <HardDrive size={12} /> RAM Memory Allocation
                  </span>
                  <span className="text-[#0F172A] dark:text-white font-bold">
                    {systemHealth.usedMemoryGB} / {systemHealth.totalMemoryGB} GB ({systemHealth.memoryUsage}%)
                  </span>
                </div>
                <div className="w-full bg-black/5 dark:bg-black/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${systemHealth.memoryUsage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5 space-y-3 font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              <div className="flex justify-between">
                <span>Kernel Node Host</span>
                <span className="text-[#0F172A] dark:text-white font-semibold uppercase">{systemHealth.platform}</span>
              </div>
              <div className="flex justify-between">
                <span>Process Uptime</span>
                <span className="text-[#0F172A] dark:text-white font-semibold">
                  {Math.floor(systemHealth.osUptime / 3600)}h {Math.floor((systemHealth.osUptime % 3600) / 60)}m
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="premium-card p-6 bg-white dark:bg-[#0F1115]">
            <h3 className="font-heading text-lg font-bold text-[#0F172A] dark:text-white mb-6 flex items-center gap-2">
              <Clock className="text-primary dark:text-[#FDBA74]" size={20} />
              Host Activity Stream
            </h3>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex gap-3 text-xs leading-normal">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${activity.type === 'signup' ? 'bg-secondary shadow-secondary/50' : 'bg-primary shadow-primary/50'} shadow-sm`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[#0F172A] dark:text-white/90">
                        {activity.description}
                      </p>
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono mt-1 block">
                        {new Date(activity.time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-[#64748B] dark:text-[#94A3B8] font-mono text-xs">
                  No activity logs in buffer stream.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Motivation Alert Modal */}
      <AnimatePresence>
        {showMotivationModal && targetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMotivationModal(false)}
              className="absolute inset-0 bg-[#030304]/80 backdrop-blur-md"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-white dark:bg-[#0B0F19] border border-black/5 dark:border-white/5 p-6 sm:p-8 shadow-2xl z-10"
            >
              {/* Top gradient blur */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-b from-[#F7931A]/10 to-transparent blur-xl pointer-events-none rounded-full" />

              {/* Close Button */}
              <button 
                onClick={() => setShowMotivationModal(false)}
                className="absolute top-4 right-4 p-2 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#F7931A]/10 border border-[#F7931A]/20 flex items-center justify-center text-[#F7931A]">
                  <Zap size={18} fill="currentColor" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-extrabold text-[#0F172A] dark:text-white">
                    Push Live Motivation Alert
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono mt-0.5">
                    Target athlete: <span className="text-[#F7931A] font-bold">@{targetUser.username}</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handlePushMotivation} className="space-y-5">
                <div>
                  <label className="block font-mono text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-wider mb-2">
                    Motivational Message
                  </label>
                  <textarea
                    rows={4}
                    value={motivationMessage}
                    onChange={(e) => setMotivationMessage(e.target.value)}
                    placeholder="Enter message to display on their active workout dashboard..."
                    className="w-full rounded-2xl bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 focus:border-[#F7931A]/40 focus:ring-2 focus:ring-[#F7931A]/10 p-4 font-sans text-sm text-[#0F172A] dark:text-white outline-none resize-none transition-all placeholder:text-black/30 dark:placeholder:text-white/30"
                    maxLength={140}
                  />
                  <div className="flex justify-between font-mono text-[9px] text-[#64748B] dark:text-[#94A3B8]/60 mt-1 font-semibold">
                    <span>Admin Command Console</span>
                    <span>{motivationMessage.length}/140</span>
                  </div>
                </div>

                {/* Templates list */}
                <div>
                  <label className="block font-mono text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-wider mb-2">
                    Quick Templates
                  </label>
                  <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                    {[
                      "Keep crushing it! Rest 60s before your next set! ⚡",
                      "Increase weight for your squats! You can do this! 💪",
                      "Form check: Keep your core tight on this exercise! 🎯",
                      "Almost done, finish strong! 🏆"
                    ].map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setMotivationMessage(tpl)}
                        className="w-full text-left p-2.5 rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-[#F7931A]/5 dark:hover:bg-[#F7931A]/5 hover:border-[#F7931A]/20 transition-all font-sans text-xs text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white font-medium"
                      >
                        {tpl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowMotivationModal(false)}
                    className="px-5 py-2.5 rounded-2xl font-mono text-xs font-semibold text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={pushing || !motivationMessage.trim()}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#F7931A] to-[#FFD600] text-black font-extrabold font-mono text-xs rounded-2xl flex items-center gap-1.5 hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-[#F7931A]/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    {pushing ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        PUSHING...
                      </>
                    ) : (
                      <>
                        <Zap size={13} fill="currentColor" />
                        PUSH ALERT ⚡
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboardPage;
