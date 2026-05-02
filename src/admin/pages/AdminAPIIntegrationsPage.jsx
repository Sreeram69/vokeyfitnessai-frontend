import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Database,
  Search,
  Activity,
  Cpu,
  RefreshCw,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Fingerprint
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
  Legend,
  Cell
} from "recharts";
import { getAdminApiStats } from "../services/adminService";
import { notifyError, notifySuccess } from "../../utils/toast";

export const AdminAPIIntegrationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [apiStats, setApiStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApiStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await getAdminApiStats();
      setApiStats(data);
      if (isRefresh) notifySuccess("API and AI stats reloaded");
    } catch (err) {
      console.error(err);
      notifyError("Failed to fetch API stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApiStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-black/10 dark:bg-white/5 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-black/5 dark:bg-white/5 animate-pulse rounded-3xl" />
          <div className="h-32 bg-black/5 dark:bg-white/5 animate-pulse rounded-3xl" />
          <div className="h-32 bg-black/5 dark:bg-white/5 animate-pulse rounded-3xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-black/5 dark:bg-white/5 animate-pulse rounded-3xl" />
          <div className="h-96 bg-black/5 dark:bg-white/5 animate-pulse rounded-3xl" />
        </div>
      </div>
    );
  }

  const { googleApi, aiSearch } = apiStats;

  // Format AI breakdown for Recharts
  const aiBreakdownData = [
    { name: "Meal Analysis", value: aiSearch.breakdown.mealAnalysis, fill: "#8B5CF6" },
    { name: "Workout Planner", value: aiSearch.breakdown.workoutGeneration, fill: "#FFD600" },
    { name: "AI Coach Insights", value: aiSearch.breakdown.insight, fill: "#10B981" }
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2">
            API & AI Integrations
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] font-mono mt-1">
            Google Fit Sync payloads, AI Coach searches, and live integration logs.
          </p>
        </div>
        <button
          onClick={() => fetchApiStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 border border-black/10 dark:border-white/10 rounded-2xl bg-white dark:bg-[#0F1115] hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm font-semibold font-mono shadow-sm cursor-pointer"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "REFRESH ENDPOINTS"}
        </button>
      </div>

      {/* Stats Bento Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Google Fit Connection */}
        <div className="premium-card p-6 bg-white dark:bg-[#0F1115] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-[#64748B] dark:text-[#94A3B8] font-mono text-[10px] font-bold uppercase tracking-wider">
              <Globe size={14} className="text-secondary" />
              Google Fit Syncs
            </div>
            <h3 className="font-heading text-2xl font-black text-[#0F172A] dark:text-white mt-3">
              {googleApi.connectedUsers} Members
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono mt-1">
              Active OAuth synchronizations
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex justify-between items-center text-xs text-[#64748B] dark:text-[#94A3B8] font-mono">
            <span>Cumulative Requests:</span>
            <span className="font-bold text-[#0F172A] dark:text-white">{googleApi.totalRequestsAllTime.toLocaleString()}</span>
          </div>
        </div>

        {/* AI Active Members */}
        <div className="premium-card p-6 bg-white dark:bg-[#0F1115] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-[#64748B] dark:text-[#94A3B8] font-mono text-[10px] font-bold uppercase tracking-wider">
              <Fingerprint size={14} className="text-primary dark:text-[#FDBA74]" />
              AI Active Members
            </div>
            <h3 className="font-heading text-2xl font-black text-[#0F172A] dark:text-white mt-3">
              {aiSearch.uniqueUsersCount} Members
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono mt-1">
              Unique users invoking AI routines
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex justify-between items-center text-xs text-[#64748B] dark:text-[#94A3B8] font-mono">
            <span>AI adoption rate:</span>
            <span className="font-bold text-primary dark:text-[#FDBA74]">Active</span>
          </div>
        </div>

        {/* AI Total Requests */}
        <div className="premium-card p-6 bg-white dark:bg-[#0F1115] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-[#64748B] dark:text-[#94A3B8] font-mono text-[10px] font-bold uppercase tracking-wider">
              <Cpu size={14} className="text-emerald-500" />
              AI Prompts Run
            </div>
            <h3 className="font-heading text-2xl font-black text-[#0F172A] dark:text-white mt-3">
              {aiSearch.totalQueries.toLocaleString()} Prompts
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono mt-1">
              Workout, meal, & insight executions
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex justify-between items-center text-xs text-[#64748B] dark:text-[#94A3B8] font-mono">
            <span>Avg response speed:</span>
            <span className="font-bold text-emerald-500">1.8s</span>
          </div>
        </div>

      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Google Fit API request traffic */}
        <div className="premium-card p-6 bg-white dark:bg-[#0F1115]">
          <div>
            <h3 className="font-heading text-base font-bold text-[#0F172A] dark:text-white">
              Google Fit API syncs load
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono mt-0.5 mb-6">
              Daily background OAuth fit syncing payload requests (7 days)
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={googleApi.dailySyncs} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="fitSyncsColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD600" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FFD600" stopOpacity={0} />
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
                <Area type="monotone" dataKey="requests" name="Sync Requests" stroke="#FFD600" strokeWidth={2.5} fillOpacity={1} fill="url(#fitSyncsColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Searches requests load */}
        <div className="premium-card p-6 bg-white dark:bg-[#0F1115]">
          <div>
            <h3 className="font-heading text-base font-bold text-[#0F172A] dark:text-white">
              AI assistant queries load
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono mt-0.5 mb-6">
              Total prompt transactions executed in the past week (7 days)
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiSearch.dailyRequests} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
                <Bar dataKey="requests" name="AI Queries" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Search breakdown distribution */}
        <div className="premium-card p-6 bg-white dark:bg-[#0F1115] lg:col-span-2">
          <div>
            <h3 className="font-heading text-base font-bold text-[#0F172A] dark:text-white">
              AI Query Intent Breakdown
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono mt-0.5 mb-6">
              Distribution of AI prompt categories executed across the platform
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={aiBreakdownData}
                margin={{ top: 10, right: 10, left: 20, bottom: 10 }}
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
                <Bar dataKey="value" name="Prompts Run" radius={[0, 4, 4, 0]} barSize={25}>
                  {aiBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAPIIntegrationsPage;
