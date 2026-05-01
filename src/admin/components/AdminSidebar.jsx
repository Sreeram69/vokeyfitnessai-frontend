import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Dumbbell,
  Settings,
  Shield,
  Activity,
  LogOut,
  X,
  Link2,
  Bell
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../app/slices/authSlice";

export const AdminSidebar = ({ mobileOpen, setMobileOpen }) => {
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    window.location.href = "/login";
  };

  const navItems = [
    { name: "Console", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "User Directory", path: "/admin/users", icon: Users },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "API Connections", path: "/admin/connections", icon: Link2 },
    { name: "Exercises", path: "/admin/exercises", icon: Dumbbell },
    { name: "Nutrition", path: "/admin/nutrition", icon: Activity },
    { name: "Broadcasts", path: "/admin/notifications", icon: Bell },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const sidebarVariants = {
    collapsed: { width: 80 },
    expanded: { width: 260 }
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <motion.aside
        initial="collapsed"
        animate={isHovered ? "expanded" : "collapsed"}
        variants={sidebarVariants}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "hidden lg:flex fixed top-4 left-4 bottom-4 flex-col rounded-3xl border z-50 overflow-hidden shadow-2xl transition-colors duration-300",
          "bg-white/90 border-[#F7931A]/10 backdrop-blur-xl text-[#0F172A]",
          "dark:bg-[#080B11]/90 dark:border-white/5 dark:backdrop-blur-xl dark:text-white"
        )}
      >
        {/* Top Branding */}
        <div className="h-20 px-4 flex-shrink-0 flex items-center border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="min-w-[48px] w-12 h-12 flex items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                <Shield size={20} className="text-white" />
              </div>
            </div>

            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  <h1 className="font-heading font-bold text-base tracking-tight mb-0.5 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Admin Portal
                  </h1>
                  <p className="font-mono text-[#94A3B8] text-[9px] font-medium uppercase tracking-widest leading-none">
                    Control Center
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "relative flex items-center gap-4 px-3 py-2.5 rounded-2xl transition-all duration-200 overflow-hidden group/item border",
                      isActive
                        ? "bg-gradient-to-r from-primary/10 to-secondary/5 border-primary/20 text-primary dark:text-[#FDBA74] shadow-sm"
                        : "text-[#64748B] dark:text-[#94A3B8] border-transparent hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0F172A] dark:hover:text-white"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={cn(
                        "relative min-w-[32px] w-8 h-8 flex items-center justify-center transition-colors",
                        isActive ? "text-primary dark:text-[#FDBA74]" : "text-[#64748B] dark:text-[#94A3B8] group-hover/item:text-primary dark:group-hover/item:text-white"
                      )}>
                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      </div>

                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="relative flex-1 whitespace-nowrap overflow-hidden"
                          >
                            <p className="font-mono text-[11px] font-semibold uppercase tracking-wider">
                              {item.name}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 flex-shrink-0 border-t border-black/5 dark:border-white/5">
          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-2.5 py-2.5 rounded-2xl text-[#64748B] dark:text-[#94A3B8] hover:bg-red-500/5 hover:text-red-500 dark:hover:text-red-400 transition-all overflow-hidden group border border-transparent cursor-pointer"
          >
            <div className="min-w-[32px] w-8 h-8 flex items-center justify-center">
              <LogOut size={18} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 whitespace-nowrap text-left"
                >
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider">Sign Out</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-[#030304]/60 backdrop-blur-md"
            />

            {/* Sidebar drawer content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className={cn(
                "relative z-10 w-72 h-full flex flex-col border-r border-[#F7931A]/10 dark:border-white/10",
                "bg-white/95 dark:bg-[#080B11]/95 backdrop-blur-xl text-[#0F172A] dark:text-white"
              )}
            >
              <div className="h-20 px-6 flex justify-between items-center border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Shield size={18} className="text-white" />
                  </div>
                  <h2 className="font-heading font-bold text-base tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Admin Portal</h2>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white rounded-full bg-white/5 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 border",
                            isActive
                              ? "bg-gradient-to-r from-primary/10 to-secondary/5 border-primary/20 text-primary dark:text-[#FDBA74] shadow-sm"
                              : "text-[#64748B] dark:text-[#94A3B8] border-transparent hover:bg-black/5 dark:hover:bg-white/5"
                          )
                        }
                      >
                        <Icon size={18} />
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider">{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </nav>

              <div className="p-4 border-t border-black/5 dark:border-white/5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[#64748B] dark:text-[#94A3B8] hover:bg-red-500/5 hover:text-red-500 transition-all cursor-pointer"
                >
                  <LogOut size={18} />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
