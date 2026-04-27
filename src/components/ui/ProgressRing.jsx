import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export const ProgressRing = ({
  size = 120,
  strokeWidth = 10,
  percentage = 0,
  color = "primary", // primary | secondary | orange | green
  children,
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    primary: "stroke-primary dark:stroke-[#FDBA74]",
    secondary: "stroke-secondary dark:stroke-[#FFD600]",
    orange: "stroke-[#EA580C] dark:stroke-[#FB923C]",
    green: "stroke-[#10B981] dark:stroke-[#34D399]",
  };

  const ringColor = colorClasses[color] || colorClasses.primary;

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full" viewBox={`0 0 ${size} ${size}`}>
        {/* Track Ring */}
        <circle
          className="stroke-[#0F172A]/5 dark:stroke-white/5"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Ring */}
        <motion.circle
          className={cn("transition-all duration-500 ease-out", ringColor)}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || (
          <span className="text-xl font-extrabold text-[#0F172A] dark:text-white font-heading">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressRing;
