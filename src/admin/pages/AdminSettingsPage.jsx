import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  ShieldAlert,
  Sliders,
  Settings,
  HardDrive,
  Cpu,
  Database,
  Lock,
  Globe,
  BellRing
} from "lucide-react";
import { notifySuccess, notifyInfo, notifyError } from "../../utils/toast";
import api from "../../api/axios";

export const AdminSettingsPage = () => {
  const [maintenance, setMaintenance] = useState(false);
  const [debugMode, setDebugMode] = useState(true);
  const [limitThreshold, setLimitThreshold] = useState(60);
  const [exporting, setExporting] = useState(false);
  const [purging, setPurging] = useState(false);

  const handleExportBackup = async () => {
    setExporting(true);
    try {
      // Fetch users and stats to assemble a backup package
      const usersRes = await api.get("/admin/users", { params: { limit: 1000 } });
      const statsRes = await api.get("/admin/stats");
      
      const backupData = {
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
        statsSummary: statsRes.data.data.metrics,
        systemHealth: statsRes.data.data.systemHealth,
        usersLedger: usersRes.data.data.users
      };

      // Create download link in browser
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `vokeyfitness_system_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      notifySuccess("Database backup snapshot exported successfully");
    } catch (err) {
      console.error(err);
      notifyError("Failed to export database backup snapshot");
    } finally {
      setExporting(false);
    }
  };

  const handleSystemPurge = () => {
    if (window.confirm("CRITICAL WARNING: This will purge all system caches, clear client-side localStorage, and trigger a reboot. Proceed?")) {
      setPurging(true);
      setTimeout(() => {
        localStorage.clear();
        notifySuccess("Client caches purged. Reloading application...");
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2">
          System Settings
        </h1>
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8] font-mono mt-1">
          Configure API rate limit flags, execute system-wide backup dumps, and toggle maintenance states.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Controls */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General API & Security Settings */}
          <div className="premium-card p-6 bg-white dark:bg-[#0F1115]">
            <h3 className="font-heading text-base font-bold text-[#0F172A] dark:text-white mb-6 flex items-center gap-2">
              <Sliders className="text-primary dark:text-[#FDBA74]" size={18} />
              API Engine Options
            </h3>

            <div className="space-y-6 font-mono text-xs">
              {/* Maintenance Toggle */}
              <div className="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5">
                <div>
                  <h4 className="text-[#0F172A] dark:text-white font-bold">MAINTENANCE GATEWAY</h4>
                  <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-1">Block standard clients from making API queries</p>
                </div>
                <button
                  onClick={() => {
                    setMaintenance(!maintenance);
                    notifyInfo(`Maintenance mode ${!maintenance ? "activated" : "deactivated"}`);
                  }}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                    maintenance ? "bg-primary" : "bg-black/20 dark:bg-white/10"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                      maintenance ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Debug Mode Toggle */}
              <div className="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5">
                <div>
                  <h4 className="text-[#0F172A] dark:text-white font-bold">VERBOSITY STACK TRACES</h4>
                  <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-1">Expose node error details in response body envelopes</p>
                </div>
                <button
                  onClick={() => {
                    setDebugMode(!debugMode);
                    notifyInfo(`Verbose debugging ${!debugMode ? "activated" : "deactivated"}`);
                  }}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                    debugMode ? "bg-primary" : "bg-black/20 dark:bg-white/10"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                      debugMode ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Rate Limit Slider */}
              <div className="space-y-3 py-2">
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-[#0F172A] dark:text-white font-bold">GENERAL RATE LIMIT THROTTLE</h4>
                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-1">Maximum API requests allowed per client window (15 mins)</p>
                  </div>
                  <span className="text-primary dark:text-[#FDBA74] font-bold text-sm">{limitThreshold} reqs</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={limitThreshold}
                  onChange={(e) => setLimitThreshold(e.target.value)}
                  className="w-full h-1.5 bg-black/5 dark:bg-black/50 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Backup & Recovery */}
          <div className="premium-card p-6 bg-white dark:bg-[#0F1115]">
            <h3 className="font-heading text-base font-bold text-[#0F172A] dark:text-white mb-6 flex items-center gap-2">
              <Database className="text-primary dark:text-[#FDBA74]" size={18} />
              Platform Database Dump
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mb-6 leading-relaxed">
              Export user schema definitions and session matrices to a JSON format. This allows local preservation of configurations.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleExportBackup}
                disabled={exporting}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 font-bold font-mono text-xs uppercase rounded-xl cursor-pointer disabled:opacity-50"
              >
                <Download size={14} />
                {exporting ? "EXPORTING..." : "EXPORT JSON SNAPSHOT"}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Danger Zone */}
        <div className="space-y-6">
          
          {/* Security Overview */}
          <div className="premium-card p-6 bg-white dark:bg-[#0F1115]">
            <h3 className="font-heading text-base font-bold text-[#0F172A] dark:text-white mb-4 flex items-center gap-2">
              <Lock className="text-primary dark:text-[#FDBA74]" size={18} />
              Access Policy
            </h3>
            
            <div className="space-y-3 font-mono text-[10px] text-[#64748B] dark:text-[#94A3B8]">
              <div className="flex justify-between items-center py-1.5 border-b border-black/5 dark:border-white/5">
                <span>Access Guards</span>
                <span className="text-emerald-500 font-bold uppercase">ROLE_BASED</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-black/5 dark:border-white/5">
                <span>Token Expiration</span>
                <span className="text-[#0F172A] dark:text-white font-bold">15m (Access) / 7d (Refresh)</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-black/5 dark:border-white/5">
                <span>API Throttler</span>
                <span className="text-emerald-500 font-bold uppercase">ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="premium-card p-6 border-red-500/20 bg-red-500/[0.01] dark:bg-red-950/[0.02]">
            <h3 className="font-heading text-base font-bold text-red-500 dark:text-red-400 mb-2 flex items-center gap-2">
              <ShieldAlert size={18} />
              Danger Operations
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mb-6 leading-relaxed">
              Caution: Actions executed in this interface immediately wipe local cookies, delete browser databases, and trigger absolute refreshes.
            </p>

            <button
              onClick={handleSystemPurge}
              disabled={purging}
              className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-bold font-mono text-xs uppercase transition disabled:opacity-50 cursor-pointer"
            >
              {purging ? "PURGING CACHES..." : "RESET & PURGE CONSOLE CACHES"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminSettingsPage;
