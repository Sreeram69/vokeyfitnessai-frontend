import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Search,
  Trophy,
  Dumbbell,
  Apple,
  Droplets,
  CalendarDays,
  Menu,
  ShieldAlert,
  Zap,
  X
} from "lucide-react";
import useUserProfile from "../../hooks/useUserProfile";
import { getFromLocalStorage, saveToLocalStorage } from "../../utils/localStorage";
import { cn } from "../../utils/cn";
import ThemeToggle from "../ui/ThemeToggle";
import api from "../../api/axios";

export const TopbarV2 = ({ onMenuClick }) => {
  const { profile } = useUserProfile();
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeMotivationAlert, setActiveMotivationAlert] = useState(null);

  const [notifications, setNotifications] = useState(() => {
    const local = getFromLocalStorage("fitforge_notifications");
    if (local && local.length > 0) return local;
    const generatedNotifications = [
      { id: 1, title: "Workout Reminder", message: "Time to complete today's scheduled workout.", type: "workout", priority: "high", read: false, date: "Just now" },
      { id: 2, title: "Meal Reminder", message: "Log your daily protein intake.", type: "nutrition", priority: "medium", read: false, date: "2 hours ago" },
      { id: 3, title: "Hydration Alert", message: "You need 4L water today.", type: "hydration", priority: "medium", read: false, date: "5 hours ago" },
      { id: 4, title: "Goal Progress", message: "You are making strong transformation progress.", type: "achievement", priority: "low", read: false, date: "Yesterday" }
    ];
    saveToLocalStorage("fitforge_notifications", generatedNotifications);
    return generatedNotifications;
  });

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

        // Check for new unread high-priority coach motivation alert
        const highPriorityAlert = dbNotifs.find(n => !n.read && n.priority === "high" && n.type === "admin");
        if (highPriorityAlert) {
          setActiveMotivationAlert({ id: highPriorityAlert.id, message: highPriorityAlert.message });
          
          // Instantly mark read in the database
          api.put(`/notifications/${highPriorityAlert.id}/read`).catch(e => console.warn(e));
          
          // Mark as read in our current state list
          highPriorityAlert.read = true;
        }
        
        setNotifications(prev => {
          const merged = [...prev];
          dbNotifs.forEach(dbN => {
            const exists = merged.some(m => m.id === dbN.id || (m.title === dbN.title && m.message === dbN.message));
            if (!exists) {
              merged.unshift(dbN);
            } else {
              // Sync read status if it changed
              const idx = merged.findIndex(m => m.id === dbN.id);
              if (idx !== -1) {
                merged[idx].read = dbN.read;
              }
            }
          });
          return merged;
        });
      }
    } catch (e) {
      console.error("Failed to fetch database notifications:", e);
    }
  };

  useEffect(() => {
    fetchDbNotifications();

    const handleNewNotification = () => {
      const updated = getFromLocalStorage("fitforge_notifications") || [];
      setNotifications(updated);
      fetchDbNotifications();
    };

    window.addEventListener("fitforge_new_notification", handleNewNotification);

    // Setup native EventSource connection for real-time notification streams
    const token = localStorage.getItem("token");
    let eventSource;

    if (token) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
      const sseUrl = `${baseUrl}/stream?token=${encodeURIComponent(token)}`;

      eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (event) => {
        try {
          const notif = JSON.parse(event.data);

          // Display the floating notification modal if it's a high priority alert from admin
          if (notif.priority === "high" && notif.type === "admin") {
            setActiveMotivationAlert({ id: notif.id, message: notif.message });
            
            // Instantly mark read in the database
            api.put(`/notifications/${notif.id}/read`).catch(e => console.warn(e));

            // Mark read locally
            notif.read = true;
          }

          setNotifications(prev => {
            const merged = [...prev];
            const exists = merged.some(m => m.id === notif.id);
            if (!exists) {
              merged.unshift(notif);
            } else {
              // Sync state if read status changes
              const idx = merged.findIndex(m => m.id === notif.id);
              if (idx !== -1) {
                merged[idx].read = notif.read;
              }
            }
            return merged;
          });
        } catch (err) {
          console.error("Failed to parse incoming real-time alert:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.warn("EventSource encountered connection interruption. Reconnecting...", err);
      };
    }

    return () => {
      window.removeEventListener("fitforge_new_notification", handleNewNotification);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  useEffect(() => {
    saveToLocalStorage("fitforge_notifications", notifications);
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

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

  const iconMap = {
    workout: Dumbbell,
    nutrition: Apple,
    hydration: Droplets,
    achievement: Trophy,
    planner: CalendarDays,
    admin: ShieldAlert,
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "high": return "bg-red-500/10 text-danger border-red-500/20";
      case "medium": return "bg-[#F59E0B]/10 text-amber-500 border-amber-500/20";
      default: return "bg-green-500/10 text-green-500 border-green-500/20";
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/70 dark:bg-[#030304]/70 backdrop-blur-xl border-b border-black/5 dark:border-white/5 h-20 flex items-center justify-between px-4 sm:px-8 mb-6 transition-colors">
      <div className="flex items-center gap-4 w-full max-w-md">
        <button onClick={onMenuClick} className="lg:hidden p-2.5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl hover:border-primary/30">
          <Menu size={18} />
        </button>

        {/* Modern Search bar */}
        <div className="hidden sm:flex items-center w-full bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-2xl px-4 py-2.5 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <Search size={16} className="text-[#64748B] dark:text-[#94A3B8] mr-3 shrink-0" strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Search exercises, nutrition, custom plans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-[#0F172A] dark:text-white text-xs w-full font-mono placeholder:text-black/30 dark:placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications dropdown trigger */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all"
          >
            <Bell size={18} strokeWidth={2.5} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/40 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              
              <div className="absolute right-0 mt-3 w-80 sm:w-[400px] bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-3xl z-50 overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-transparent">
                  <h3 className="font-heading font-bold text-xs text-[#0F172A] dark:text-white tracking-wide">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary hover:text-primary-light transition-colors">
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-3 border border-black/5 dark:border-white/5">
                        <Bell size={18} className="text-[#64748B]/50 dark:text-[#94A3B8]/50" />
                      </div>
                      <p className="font-mono text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {notifications.map((notif) => {
                        const Icon = iconMap[notif.type] || Bell;
                        return (
                          <div 
                            key={notif.id} 
                            onClick={() => markAsRead(notif.id)}
                            className={cn(
                              "p-4 border-b border-black/5 dark:border-white/5 cursor-pointer transition-colors flex gap-4",
                              notif.read ? "bg-black/5 dark:bg-black/20 opacity-60" : "bg-transparent hover:bg-black/5 dark:hover:bg-white/5"
                            )}
                          >
                            <div className={cn("w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center border", getPriorityStyle(notif.priority))}>
                              <Icon size={16} strokeWidth={2} />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className={cn("text-xs font-bold truncate pr-2", notif.read ? "text-[#64748B] dark:text-[#94A3B8]" : "text-[#0F172A] dark:text-white")}>{notif.title}</h4>
                                {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1 shadow-sm shadow-primary/30" />}
                              </div>
                              <p className="font-sans text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-2 mb-2 leading-relaxed">{notif.message}</p>
                              <span className="font-mono text-[9px] font-semibold text-[#64748B]/60 dark:text-[#94A3B8]/60 uppercase tracking-widest">{notif.date}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-black/5 dark:border-white/5 bg-transparent">
                  <Link 
                    to="/notifications" 
                    onClick={() => setShowNotifications(false)}
                    className="block w-full py-2.5 text-center font-mono text-[10px] font-semibold uppercase tracking-wider text-[#0F172A] dark:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-2xl transition-colors"
                  >
                    View All Activity
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile indicator */}
        <Link to="/settings" className="flex items-center gap-3 pl-4 border-l border-black/10 dark:border-white/10 hover:opacity-80 transition-opacity">
          <div className="hidden md:flex flex-col items-end text-right">
            <p className="font-heading text-sm font-bold text-[#0F172A] dark:text-white leading-none mb-1">{profile?.name || "Athlete"}</p>
            <p className="font-mono text-[9px] text-primary dark:text-[#FDBA74] font-semibold uppercase tracking-widest leading-none">{profile?.goal ? profile.goal.replace('_', ' ') : 'Free Plan'}</p>
          </div>
          <div className="w-9 h-9 rounded-full border border-primary/20 bg-black/5 dark:bg-[#0B0F19] p-0.5 shadow-sm">
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center overflow-hidden text-primary dark:text-[#FDBA74]">
               {profile?.avatar ? (
                 <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <span className="font-heading font-bold text-xs uppercase">{(profile?.name || "U")[0]}</span>
               )}
            </div>
          </div>
        </Link>
      </div>

      {/* Motivation alert popup overlay */}
      <AnimatePresence>
        {activeMotivationAlert && (
          <div className="fixed inset-x-0 top-6 z-[100] flex justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="pointer-events-auto w-full max-w-md overflow-hidden rounded-[24px] border border-[#F7931A]/35 bg-white/85 dark:bg-[#030304]/85 backdrop-blur-2xl p-5 shadow-2xl flex gap-4 relative"
              style={{ boxShadow: "0 20px 40px -15px rgba(247, 147, 26, 0.3)" }}
            >
              {/* Left Accent indicator glow */}
              <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-b from-[#F7931A] to-[#FFD600]" />

              <div className="w-10 h-10 rounded-2xl bg-[#F7931A]/10 border border-[#F7931A]/20 flex items-center justify-center text-[#F7931A] shrink-0 mt-0.5 animate-bounce" style={{ animationDuration: "3s" }}>
                <Zap size={18} fill="currentColor" />
              </div>
              
              <div className="flex-1 min-w-0 pl-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F7931A]">
                    Coach's Live Advice ⚡
                  </h4>
                  <button 
                    onClick={() => setActiveMotivationAlert(null)}
                    className="p-1 -mr-1.5 -mt-1 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="font-heading font-extrabold text-[#0F172A] dark:text-white text-sm leading-snug">
                  "{activeMotivationAlert.message}"
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[9px] font-semibold text-[#64748B]/60 dark:text-[#94A3B8]/60 uppercase tracking-widest">
                    Pushed in Real-Time
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default TopbarV2;
