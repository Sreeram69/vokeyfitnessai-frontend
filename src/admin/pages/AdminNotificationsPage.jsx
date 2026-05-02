import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Send,
  Trash2,
  AlertTriangle,
  UserPlus,
  Info,
  Calendar,
  Layers,
  Flag,
  Globe,
  Mail,
  Server,
  Activity,
  Key
} from "lucide-react";
import {
  getAdminNotifications,
  createAdminNotification,
  deleteAdminNotification
} from "../services/adminService";
import { notifySuccess, notifyError } from "../../utils/toast";

export const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Composer Form state
  const [form, setForm] = useState({
    recipientType: "all", // "all", "specific"
    recipientEmail: "",
    title: "",
    message: "",
    type: "announcement",
    priority: "medium"
  });

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getAdminNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
      notifyError("Failed to fetch notification archives");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleComposeSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;

    setSending(true);
    try {
      const payload = {
        recipient: form.recipientType === "all" ? "all" : form.recipientEmail.trim(),
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        priority: form.priority
      };

      await createAdminNotification(payload);
      notifySuccess("Broadcast notification sent successfully!");
      setForm({
        recipientType: "all",
        recipientEmail: "",
        title: "",
        message: "",
        type: "announcement",
        priority: "medium"
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
      notifyError(err.response?.data?.message || "Failed to dispatch notification");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAdminNotification(id);
      notifySuccess("Notification permanently removed from buffer");
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
      notifyError("Failed to delete notification");
    }
  };

  // Group notifications
  // 1. Broadcast history: recipient = 'all' or specific user (anything not 'admin')
  const broadcasts = notifications.filter(n => n.recipient !== "admin");

  // 2. System Alerts: recipient = 'admin' or type = 'auth'/'system'
  const systemAlerts = notifications.filter(n => n.recipient === "admin");

  const getPriorityColor = (p) => {
    switch (p) {
      case "high": return "bg-red-500/10 border-red-500/20 text-red-500";
      case "medium": return "bg-amber-500/10 border-amber-500/20 text-amber-500";
      default: return "bg-blue-500/10 border-blue-500/20 text-blue-500";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "auth": return <Key size={14} className="text-purple-500" />;
      case "workout": return <Activity size={14} className="text-emerald-500" />;
      case "nutrition": return <Server size={14} className="text-orange-500" />;
      case "alert": return <AlertTriangle size={14} className="text-red-500" />;
      default: return <Info size={14} className="text-cyan-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2">
          Broadcast & System Alerts
        </h1>
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8] font-mono mt-1">
          Compose platform-wide broadcast announcements, target specific athletes, and view real-time host event triggers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Composer Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="premium-card p-6 bg-white dark:bg-[#0F1115]">
            <h3 className="font-heading text-lg font-bold text-[#0F172A] dark:text-white mb-6 flex items-center gap-2">
              <Send className="text-primary" size={18} />
              Compose Broadcast
            </h3>

            <form onSubmit={handleComposeSubmit} className="space-y-4 font-mono text-xs">
              
              {/* Recipient Selector */}
              <div>
                <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">RECIPIENT SCOPE</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, recipientType: "all" })}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.recipientType === "all"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-black/10 dark:border-white/5 bg-transparent text-[#64748B]"
                    }`}
                  >
                    <Globe size={14} /> ALL ATHLETES
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, recipientType: "specific" })}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      form.recipientType === "specific"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-black/10 dark:border-white/5 bg-transparent text-[#64748B]"
                    }`}
                  >
                    <Mail size={14} /> TARGETED
                  </button>
                </div>
              </div>

              {/* Specific Recipient Email Input */}
              {form.recipientType === "specific" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1"
                >
                  <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">RECIPIENT EMAIL</label>
                  <input
                    type="email"
                    required
                    placeholder="athlete@example.com"
                    value={form.recipientEmail}
                    onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white"
                  />
                </motion.div>
              )}

              {/* Title */}
              <div>
                <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">ANNOUNCEMENT TITLE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Scheduled System Calibration"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">MESSAGE PAYLOAD</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write the notification details..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white resize-none"
                />
              </div>

              {/* Type and Priority Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">TYPE</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white appearance-none"
                  >
                    <option value="announcement">BROADCAST</option>
                    <option value="alert">SECURITY ALERT</option>
                    <option value="workout">WORKOUT</option>
                    <option value="nutrition">NUTRITION</option>
                    <option value="system">SYSTEM EVENT</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 text-[#64748B] dark:text-[#94A3B8] font-bold">PRIORITY</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-black/10 dark:border-white/5 bg-black/5 dark:bg-[#030304] rounded-xl outline-none focus:border-primary/50 text-[#0F172A] dark:text-white appearance-none"
                  >
                    <option value="low">LOW</option>
                    <option value="medium">MEDIUM</option>
                    <option value="high">HIGH</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full btn-primary py-3 font-bold uppercase rounded-xl flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "DISPATCHING..." : "DISPATCH BROADCAST"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Historical Broadcasts & System alerts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Dispatched Broadcasts History */}
          <div className="premium-card p-6 bg-white dark:bg-[#0F1115]">
            <h3 className="font-heading text-lg font-bold text-[#0F172A] dark:text-white mb-6 flex items-center gap-2">
              <Bell className="text-primary" size={18} />
              Broadcast Registry
            </h3>

            {loading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="font-mono text-xs text-[#64748B] dark:text-[#94A3B8]">Requesting registry ledger...</p>
              </div>
            ) : broadcasts.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {broadcasts.map((notif) => (
                  <div
                    key={notif._id}
                    className="p-4 border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] rounded-2xl flex items-start gap-4 hover:border-black/15 dark:hover:border-white/10 transition group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getTypeIcon(notif.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-xs text-[#0F172A] dark:text-white">{notif.title}</span>
                        <span className={`px-2 py-0.5 border rounded-lg font-mono text-[9px] font-bold uppercase ${getPriorityColor(notif.priority)}`}>
                          {notif.priority}
                        </span>
                        <span className="px-2 py-0.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/5 rounded-lg font-mono text-[9px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase">
                          {notif.type}
                        </span>
                      </div>

                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed break-words">{notif.message}</p>

                      <div className="flex items-center gap-4 mt-2.5 font-mono text-[10px] text-[#94A3B8]">
                        <span className="flex items-center gap-1">
                          <Globe size={11} /> scope: {notif.recipient === "all" ? "GLOBAL" : "TARGETED"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={11} /> {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(notif._id)}
                      className="p-2 border border-red-500/20 bg-red-500/5 text-red-500 rounded-xl hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition flex-shrink-0 cursor-pointer"
                      title="Purge Broadcast"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center font-mono text-xs text-[#64748B] dark:text-[#94A3B8]">
                No broadcast announcements logged in database.
              </div>
            )}
          </div>

          {/* Section 2: Real-time System Alerts Timeline */}
          <div className="premium-card p-6 bg-white dark:bg-[#0F1115]">
            <h3 className="font-heading text-lg font-bold text-[#0F172A] dark:text-white mb-6 flex items-center gap-2">
              <UserPlus className="text-[#FDBA74] dark:text-[#F59E0B]" size={20} />
              Host Event Stream (System Alerts)
            </h3>

            {loading ? (
              <div className="py-10 text-center">
                <p className="font-mono text-xs text-[#64748B] dark:text-[#94A3B8]">Requesting event logs...</p>
              </div>
            ) : systemAlerts.length > 0 ? (
              <div className="relative border-l border-black/10 dark:border-white/5 pl-4 ml-2 space-y-6">
                {systemAlerts.map((alert) => (
                  <div key={alert._id} className="relative group">
                    {/* Event bullet point */}
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-primary bg-[#0F1115] shadow-sm shadow-primary/30 group-hover:scale-125 transition-transform" />

                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="font-mono font-bold text-xs text-[#0F172A] dark:text-white flex items-center gap-1.5">
                          {alert.title}
                          <span className="px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-md font-mono text-[8px] font-bold text-purple-500 uppercase">
                            SYSTEM
                          </span>
                        </span>
                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed">{alert.message}</p>
                        
                        <span className="text-[10px] text-[#94A3B8] font-mono mt-2 block flex items-center gap-1">
                          <Calendar size={10} /> {new Date(alert.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDelete(alert._id)}
                        className="p-1.5 border border-red-500/20 bg-red-500/5 text-red-500 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title="Dismiss alert"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center font-mono text-xs text-[#64748B] dark:text-[#94A3B8]">
                No system calibration alerts or events tracked in stream buffer.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminNotificationsPage;
