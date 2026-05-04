import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dumbbell,
  Apple,
  Droplets,
  Trophy,
  CalendarDays,
  ShieldAlert,
  CheckCircle2,
  Trash2,
  Bell,
  Search,
  Filter
} from "lucide-react";
import { getFromLocalStorage, saveToLocalStorage } from "../utils/localStorage";
import EmptyState from "../components/ui/EmptyState";
import { SectionTitle } from "../components/ui/SectionTitle";
import { StatCard } from "../components/ui/StatCard";
import { staggerContainer, staggerItem } from "../animations/stagger";
import api from "../api/axios";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  const [filterType, setFilterType] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [search, setSearch] = useState("");

  const fetchDbNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      if (response?.data?.success) {
        const dbNotifs = response.data.data.map(n => ({
          id: n._id,
          title: n.title,
          message: n.message,
          type: n.type || "announcement",
          priority: n.priority || "medium",
          read: n.read || false,
          date: new Date(n.createdAt).toLocaleDateString(),
          isDb: true
        }));
        
        const local = getFromLocalStorage("fitforge_notifications") || [];
        const merged = [...local];
        dbNotifs.forEach(dbN => {
          const exists = merged.some(m => m.id === dbN.id || (m.title === dbN.title && m.message === dbN.message));
          if (!exists) {
            merged.unshift(dbN);
          }
        });
        setNotifications(merged);
      } else {
        const local = getFromLocalStorage("fitforge_notifications") || [];
        setNotifications(local);
      }
    } catch (e) {
      console.error("Failed to fetch database notifications:", e);
      const local = getFromLocalStorage("fitforge_notifications") || [];
      setNotifications(local);
    }
  };

  useEffect(() => {
    fetchDbNotifications();
  }, []);

  useEffect(() => {
    saveToLocalStorage("fitforge_notifications", notifications);
  }, [notifications]);

  const iconMap = {
    workout: Dumbbell,
    nutrition: Apple,
    hydration: Droplets,
    achievement: Trophy,
    planner: CalendarDays,
    admin: ShieldAlert,
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      (notification?.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (notification?.message || "").toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "All" || notification.type === filterType;
    const matchesPriority = filterPriority === "All" || notification.priority === filterPriority;
    return matchesSearch && matchesType && matchesPriority;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const highPriorityCount = notifications.filter((n) => n.priority === "high").length;

  const markAsRead = async (id) => {
    const target = notifications.find(n => n.id === id);
    if (target && target.isDb) {
      try {
        await api.put(`/notifications/${id}/read`);
      } catch (e) {
        console.error("Failed to mark database notification as read:", e);
      }
    }
    setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    const unreadDb = notifications.filter(n => !n.read && n.isDb);
    for (const notif of unreadDb) {
      try {
        await api.put(`/notifications/${notif.id}/read`);
      } catch (e) {
        console.error("Failed to mark database notification read:", e);
      }
    }
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = async (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "text-danger bg-danger/10 border-danger/20";
      case "medium": return "text-[#FFD600] bg-[#FFD600]/10 border-[#FFD600]/20";
      default: return "text-success bg-success/10 border-success/20";
    }
  };

  return (
    <motion.div 
      variants={staggerContainer} 
      initial="hidden" 
      animate="visible" 
      className="space-y-6 pb-24 w-full"
    >
      <SectionTitle 
        title="Control Center" 
        subtitle="Monitor your smart alerts, training milestones, and system updates."
        action={
          <div className="flex flex-wrap gap-3">
             <button onClick={markAllAsRead} className="px-5 py-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-text-primary font-mono text-sm font-medium transition border border-black/10 dark:border-white/10 hover:border-primary/50 flex items-center gap-2">
               <CheckCircle2 size={16} className="text-success" /> Mark All Read
             </button>
             <button onClick={clearAllNotifications} className="px-5 py-2.5 rounded-xl bg-danger/10 hover:bg-danger/20 font-mono text-sm font-medium border border-danger/20 text-danger transition hover:border-danger/50 flex items-center gap-2">
               <Trash2 size={16} /> Clear All
             </button>
          </div>
        }
      />

      <motion.section variants={staggerItem} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Alerts"
          value={notifications.length}
          icon={Bell}
          color="purple"
        />
        <StatCard
          title="Action Required"
          value={unreadCount}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Critical Priority"
          value={highPriorityCount}
          icon={ShieldAlert}
          color="orange"
        />
      </motion.section>

      <motion.section variants={staggerItem} className="bg-white/50 dark:bg-[#0B0F19]/50 border border-black/8 dark:border-white/5 rounded-2xl p-4 flex flex-col lg:flex-row gap-4 justify-between items-center shadow-sm backdrop-blur">
         <div className="flex-1 w-full bg-white/35 dark:bg-[#030304]/40 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-primary/45 transition">
            <Search size={18} className="text-text-secondary" />
            <input type="text" placeholder="Search alerts..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-transparent border-none outline-none font-mono text-sm text-text-primary placeholder:text-text-secondary/40" />
         </div>

         <div className="flex w-full lg:w-auto gap-4">
            <div className="flex-1 lg:w-48 bg-white/35 dark:bg-[#030304]/40 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 flex items-center gap-2">
              <Filter size={16} className="text-text-secondary shrink-0" />
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full bg-transparent border-none outline-none font-mono text-sm text-text-primary appearance-none cursor-pointer">
                <option value="All" className="bg-card">All Types</option>
                <option value="workout" className="bg-card">Workout</option>
                <option value="nutrition" className="bg-card">Nutrition</option>
                <option value="hydration" className="bg-card">Hydration</option>
                <option value="achievement" className="bg-card">Achievement</option>
              </select>
            </div>
            
            <div className="flex-1 lg:w-48 bg-white/35 dark:bg-[#030304]/40 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 flex items-center gap-2">
              <Filter size={16} className="text-text-secondary shrink-0" />
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="w-full bg-transparent border-none outline-none font-mono text-sm text-text-primary appearance-none cursor-pointer">
                <option value="All" className="bg-card">All Priorities</option>
                <option value="high" className="bg-card">High</option>
                <option value="medium" className="bg-card">Medium</option>
                <option value="low" className="bg-card">Low</option>
              </select>
            </div>
         </div>
      </motion.section>

      <motion.section variants={staggerItem} className="space-y-4">
        {filteredNotifications.length === 0 ? (
           <EmptyState icon={Bell} title="No alerts found" message="You're completely caught up. Go crush a workout!" />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredNotifications.map((notif) => {
              const Icon = iconMap[notif.type] || Bell;
              const isUnread = !notif.read;

              return (
                <div key={notif.id} className={`group relative p-4 rounded-2xl border transition-all duration-300 ${isUnread ? 'bg-white dark:bg-gradient-to-r dark:from-[#0F1115] dark:to-[#030304] border-primary/20 shadow-md shadow-primary/5' : 'bg-white/50 dark:bg-[#0B0F19]/50 border-black/8 dark:border-white/5 opacity-70 hover:opacity-100'}`}>
                   {isUnread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary rounded-l-2xl shadow-sm shadow-primary/30" />}
                   
                   <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${getPriorityColor(notif.priority)}`}>
                        <Icon size={16} />
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 mb-2">
                          <h4 className="font-heading text-sm font-black text-[#0F172A] dark:text-white uppercase tracking-tight">{notif.title}</h4>
                          <span className="text-[9px] font-mono text-text-secondary uppercase tracking-widest font-semibold">{notif.date}</span>
                        </div>
                        <p className="text-xs font-medium text-text-secondary leading-relaxed mb-4">{notif.message}</p>

                        <div className="flex gap-2 mt-auto">
                          {isUnread && (
                            <button onClick={() => markAsRead(notif.id)} className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-[9px] font-bold uppercase tracking-widest transition border border-black/10 dark:border-white/10 flex items-center gap-1.5 text-text-primary">
                              <CheckCircle2 size={12} className="text-success" /> Mark Read
                            </button>
                          )}
                          <button onClick={() => deleteNotification(notif.id)} className="px-3 py-1.5 rounded-xl bg-danger/5 hover:bg-danger/10 border border-danger/10 text-danger text-[9px] font-bold uppercase tracking-widest transition flex items-center gap-1.5">
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.section>

    </motion.div>
  );
};

export default NotificationsPage;