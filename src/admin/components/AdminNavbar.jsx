import { Menu, User as UserIcon, Calendar, ShieldCheck } from "lucide-react";
import ThemeToggle from "../../components/ui/ThemeToggle";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

export const AdminNavbar = ({ onMenuClick }) => {
  const user = useSelector((state) => state.auth.user);
  const userProfile = JSON.parse(localStorage.getItem("fitforge_user_profile") || "null");
  const location = useLocation();

  const adminName = user?.username || userProfile?.name || "Administrator";
  const adminEmail = user?.email || userProfile?.email || "admin@vokeyfitness.com";

  // Determine current page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/users")) return "User Directory";
    if (path.includes("/analytics")) return "Performance Analytics";
    if (path.includes("/connections")) return "API & AI Connections";
    if (path.includes("/exercises")) return "Exercises Library";
    if (path.includes("/settings")) return "System Settings";
    return "Admin Console";
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <header className="h-20 px-6 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/40 dark:bg-[#030304]/40 backdrop-blur-md relative z-40 transition-colors duration-300">
      {/* Left side: title and breadcrumb / greeting */}
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white rounded-xl bg-black/5 dark:bg-white/5 transition"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:block">
          <h2 className="font-heading text-xl font-bold tracking-tight text-[#0F172A] dark:text-white">
            {getPageTitle()}
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5 mt-0.5 font-mono uppercase tracking-wider">
            <ShieldCheck size={12} className="text-primary dark:text-[#FDBA74]" />
            Security Context: Active Admin Session
          </p>
        </div>
      </div>

      {/* Right side: stats, theme toggle, and admin credentials */}
      <div className="flex items-center gap-4">
        {/* Today's Date */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[#64748B] dark:text-[#94A3B8] font-mono text-[11px] font-semibold uppercase tracking-wider">
          <Calendar size={14} className="text-primary dark:text-[#FDBA74]" />
          {getTodayDate()}
        </div>

        {/* Theme Switcher */}
        <ThemeToggle />

        {/* Admin Profile Details */}
        <div className="flex items-center gap-3 pl-3 border-l border-black/10 dark:border-white/10">
          <div className="hidden lg:block text-right">
            <p className="font-mono text-xs font-bold text-[#0F172A] dark:text-white leading-none">
              {adminName}
            </p>
            <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono mt-1 leading-none">
              {adminEmail}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary dark:text-[#FDBA74]">
            <UserIcon size={18} />
          </div>
        </div>
      </div>
    </header>
  );
};
