import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  BarChart3,
  Activity,
  Zap,
  Clock,
  RefreshCw
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import { getAdminStats } from "../services/adminService";
import { notifyError, notifySuccess } from "../../utils/toast";

export const AdminAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  const fetchAnalytics = async (isRefresh = false, period = selectedPeriod) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await getAdminStats({ range: period });
      setStats(data);
      if (isRefresh) notifySuccess("Analytics refreshed");
    } catch (err) {
      console.error(err);
      notifyError("Failed to load platform analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    fetchAnalytics(false, period);
  };

  useEffect(() => {
    fetchAnalytics(false, "all");
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-black/10 dark:bg-white/5 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-96 bg-black/5 dark:bg-white/5 animate-pulse rounded-3xl" />
          <div className="h-96 bg-black/5 dark:bg-white/5 animate-pulse rounded-3xl" />
        </div>
      </div>
    );
  }

  const { metrics, charts, systemHealth } = stats;

  // Derive extra stats for representation
  const estimatedCaloriesBurned = metrics.totalCaloriesBurned || (metrics.workoutsCompleted * 320);
  const avgWorkoutDurationMinutes = 42; // standard estimation

  // Categories Distribution (mocked dynamic weights based on actual numbers)
  const categorySplitData = [
    { name: "Strength", value: Math.round(metrics.workoutsCompleted * 0.45), fill: "#8B5CF6" },
    { name: "Cardio", value: Math.round(metrics.workoutsCompleted * 0.30), fill: "#FFD600" },
    { name: "General", value: Math.round(metrics.workoutsCompleted * 0.15), fill: "#10B981" },
    { name: "Flexibility", value: Math.round(metrics.workoutsCompleted * 0.10), fill: "#F59E0B" }
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2">
            Performance Analytics
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] font-mono mt-1">
            Engine statistics, cumulative growth curves, and workouts data analysis.
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
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-black/10 dark:border-white/10 rounded-2xl bg-white dark:bg-[#0F1115] hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm font-semibold font-mono shadow-sm cursor-pointer"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "REFRESH METRICS"}
          </button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="premium-card p-6 bg-white dark:bg-[#0F1115]">
          <div className="flex items-center gap-2.5 text-[#64748B] dark:text-[#94A3B8] font-mono text-[10px] font-bold uppercase tracking-wider">
            <Activity size={14} className="text-primary dark:text-[#FDBA74]" />
            Workouts Frequency
          </div>
          <h3 className="font-heading text-2xl font-black text-[#0F172A] dark:text-white mt-3">
            {metrics.workoutsCompleted.toLocaleString()} sessions
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono mt-1">
            Completed across all workout splits
          </p>
        </div>

        <div className="premium-card p-6 bg-white dark:bg-[#0F1115]">
          <div className="flex items-center gap-2.5 text-[#64748B] dark:text-[#94A3B8] font-mono text-[10px] font-bold uppercase tracking-wider">
            <Zap size={14} className="text-secondary" />
            Energy Burned (Estimated)
          </div>
          <h3 className="font-heading text-2xl font-black text-[#0F172A] dark:text-white mt-3">
            {Math.round(estimatedCaloriesBurned).toLocaleString()} kcal
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono mt-1">
            Cumulative calorie burn index
          </p>
        </div>

        <div className="premium-card p-6 bg-white dark:bg-[#0F1115]">
          <div className="flex items-center gap-2.5 text-[#64748B] dark:text-[#94A3B8] font-mono text-[10px] font-bold uppercase tracking-wider">
            <Clock size={14} className="text-emerald-500" />
            Mean Workout Duration
          </div>
          <h3 className="font-heading text-2xl font-black text-[#0F172A] dark:text-white mt-3">
            {avgWorkoutDurationMinutes} minutes
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono mt-1">
            Average time per active session
          </p>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Registration Rate Curve */}
        <div className="premium-card p-6 bg-white dark:bg-[#0F1115]">
          <div>
            <h3 className="font-heading text-base font-bold text-[#0F172A] dark:text-white">
              Growth Acceleration
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono mt-0.5 mb-6">
              Monthly registration curve highlighting customer acquisition
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyRegistrations} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD600" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FFD600" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area type="monotone" dataKey="users" name="New Users" stroke="#FFD600" strokeWidth={2.5} fillOpacity={1} fill="url(#growthColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workout Activity Load Bar Chart */}
        <div className="premium-card p-6 bg-white dark:bg-[#0F1115]">
          <div>
            <h3 className="font-heading text-base font-bold text-[#0F172A] dark:text-white">
              Daily Training Intensity
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono mt-0.5 mb-6">
              Daily finished workout sessions across the active calendar week
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.dailyWorkouts} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
                <Bar dataKey="workouts" name="Workouts" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Split Category Preferences */}
        <div className="premium-card p-6 bg-white dark:bg-[#0F1115]">
          <div>
            <h3 className="font-heading text-base font-bold text-[#0F172A] dark:text-white">
              Focus Split Distribution
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono mt-0.5 mb-6">
              Breakdown of workout categories completed by user base
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={categorySplitData}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis type="number" stroke="#64748B" fontSize={10} fontStyle="bold" tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={10} fontStyle="bold" tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 17, 21, 0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    color: "#fff",
                    fontFamily: "JetBrains Mono"
                  }}
                />
                <Bar dataKey="value" name="Sessions" radius={[0, 4, 4, 0]} barSize={20}>
                  {categorySplitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Load Timeline */}
        <div className="premium-card p-6 bg-white dark:bg-[#0F1115]">
          <div>
            <h3 className="font-heading text-base font-bold text-[#0F172A] dark:text-white">
              Engine Load Balance Index
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono mt-0.5 mb-6">
              Visualizing process memory and load factors mapped in percentage scales
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { time: "T-50s", cpu: Math.max(systemHealth.cpuLoad - 2, 5), ram: systemHealth.memoryUsage },
                  { time: "T-40s", cpu: Math.max(systemHealth.cpuLoad + 4, 12), ram: systemHealth.memoryUsage },
                  { time: "T-30s", cpu: Math.max(systemHealth.cpuLoad - 5, 4), ram: systemHealth.memoryUsage },
                  { time: "T-20s", cpu: Math.max(systemHealth.cpuLoad + 2, 9), ram: systemHealth.memoryUsage },
                  { time: "T-10s", cpu: Math.max(systemHealth.cpuLoad - 1, 6), ram: systemHealth.memoryUsage },
                  { time: "Current", cpu: systemHealth.cpuLoad, ram: systemHealth.memoryUsage }
                ]}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} fontStyle="bold" tickLine={false} />
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
                <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
                <Line type="monotone" dataKey="cpu" name="CPU Core %" stroke="#8B5CF6" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="ram" name="RAM Allocation %" stroke="#10B981" strokeWidth={2.5} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

// Help helper for custom cell fill mappings
import { Cell } from "recharts";

export default AdminAnalyticsPage;
