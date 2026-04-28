import { useEffect, useState } from "react";
import PremiumCard from "./PremiumCard";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "../../utils/cn";

export const StatCard = ({
  title,
  value,
  targetValue,
  unit = "",
  icon: Icon,
  trend, // e.g. { value: 12, type: 'up' | 'down' }
  color = "purple", // purple | cyan | orange | green
  action,
  footer,
  className,
}) => {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value) || 0;
    if (end === 0) {
      setTimeout(() => setDisplayVal(0), 0);
      return;
    }

    const duration = 1000; // 1s
    const stepTime = 16; // ~60fps
    const totalSteps = duration / stepTime;
    const increment = end / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayVal(end);
        clearInterval(timer);
      } else {
        setDisplayVal(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  const colorThemes = {
    purple: {
      glow: "bg-primary/10 border-primary/20",
      text: "text-primary dark:text-[#FDBA74]",
      gradient: "from-primary/20 to-primary/0",
    },
    cyan: {
      glow: "bg-secondary/10 border-secondary/20",
      text: "text-[#D97706] dark:text-[#FFD600]",
      gradient: "from-secondary/20 to-secondary/0",
    },
    orange: {
      glow: "bg-[#EA580C]/10 border-[#EA580C]/20",
      text: "text-[#EA580C] dark:text-[#FB923C]",
      gradient: "from-[#EA580C]/20 to-[#EA580C]/0",
    },
    green: {
      glow: "bg-[#10B981]/10 border-[#10B981]/20",
      text: "text-[#10B981] dark:text-[#34D399]",
      gradient: "from-[#10B981]/20 to-[#10B981]/0",
    },
  };

  const theme = colorThemes[color] || colorThemes.purple;

  return (
    <PremiumCard className={cn("p-5 flex flex-col justify-between h-[160px] bg-white/50 dark:bg-[#0B0F19]/50 border-black/8 dark:border-white/5", className)}>
      <div className="flex justify-between items-start gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider truncate block w-full" title={title}>
            {title}
          </p>
          <div className="flex items-baseline gap-1 mt-1 flex-wrap">
            <h4 className="text-3xl font-black text-[#0F172A] dark:text-white font-heading tracking-tight">
              {displayVal.toLocaleString()}
            </h4>
            {unit && (
              <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] ml-0.5">
                {unit}
              </span>
            )}
            {targetValue && (
              <span className="text-[11px] font-mono text-[#64748B]/70 dark:text-[#94A3B8]/60 ml-0.5">
                / {targetValue}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {action && (
            <div className="inline-flex items-center">
              {action}
            </div>
          )}
          {Icon && (
            <div className={cn("p-2.5 rounded-2xl border", theme.glow)}>
              <Icon className={cn("w-4 h-4", theme.text)} />
            </div>
          )}
        </div>
      </div>

      {/* Unified footer to preserve identical heights across all cards */}
      <div className="h-6 flex items-center mt-2 border-t border-black/5 dark:border-white/5 pt-2">
        {footer ? (
          <div className="w-full truncate block">
            {footer}
          </div>
        ) : trend ? (
          <div className="flex items-center gap-1.5 min-w-0 w-full">
            <span
              className={cn(
                "inline-flex items-center text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg border shrink-0",
                trend.type === "up"
                  ? "bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]"
                  : "bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]"
              )}
            >
              {trend.type === "up" ? (
                <ArrowUpRight size={10} className="mr-0.5" />
              ) : (
                <ArrowDownRight size={10} className="mr-0.5" />
              )}
              {trend.value}%
            </span>
            <span className="text-[9px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider truncate">
              {trend.value === 14 ? "vs last week" : "target trend"}
            </span>
          </div>
        ) : (
          <span className="text-[9px] font-bold text-[#64748B]/60 dark:text-[#94A3B8]/40 uppercase tracking-wider font-semibold truncate block">
            Optimal Target
          </span>
        )}
      </div>
    </PremiumCard>
  );
};

export default StatCard;
