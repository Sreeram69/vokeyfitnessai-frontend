import { Inbox, History, BarChart2, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "../../utils/cn";

const IconMap = {
  inbox: Inbox,
  history: History,
  analytics: BarChart2,
  error: AlertCircle,
  sparkles: Sparkles,
};

export const EmptyState = ({
  title = "No Data Found",
  message = "Nothing available right now.",
  icon = "inbox", // inbox | history | analytics | error | sparkles
  actionText,
  onActionClick,
  children,
  className
}) => {
  const IconComponent = IconMap[icon] || Inbox;

  return (
    <div className={cn("text-center py-16 px-6 w-full col-span-full flex flex-col items-center justify-center relative overflow-hidden group", className)}>
      {/* Dynamic Glow and Gradients under the hood */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/5 dark:bg-primary/10 blur-[100px] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
      
      {/* Curved Glassmorphic Card Container */}
      <div className="relative z-10 glass-premium border border-black/5 dark:border-white/5 rounded-3xl p-8 max-w-md w-full flex flex-col items-center shadow-lg shadow-black/5 dark:shadow-black/20 hover:border-primary/20 transition-all duration-300">
        
        {/* Curated Icon Holder with Premium HSL Colors */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 flex items-center justify-center mb-6 shadow-inner text-primary dark:text-[#A78BFA] group-hover:scale-105 transition-transform duration-300">
          <IconComponent size={28} className="stroke-[1.75]" />
        </div>

        {/* Title */}
        <h3 className="font-heading text-lg font-bold text-text-primary mb-2.5 leading-snug tracking-tight">
          {title}
        </h3>

        {/* Message */}
        <p className="text-text-secondary text-xs leading-relaxed max-w-sm mb-6 font-medium">
          {message}
        </p>

        {/* Optional Action Button */}
        {actionText && onActionClick && (
          <button
            onClick={onActionClick}
            className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-semibold uppercase tracking-widest text-[10px] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/10 hover:shadow-primary/25 cursor-pointer font-sans"
          >
            {actionText}
          </button>
        )}

        {children}
      </div>
    </div>
  );
};

export default EmptyState;
