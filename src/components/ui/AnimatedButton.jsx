import { motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { Loader2 } from "lucide-react";

export const AnimatedButton = ({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  isDisabled = false,
  icon: Icon,
  iconPosition = "left",
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-[#EA580C] text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30",
    secondary: "bg-white/10 dark:bg-white/10 text-[#0F172A] dark:text-white border border-[#0F172A]/10 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/15",
    accent: "bg-gradient-to-r from-[#EA580C] to-[#FFD600] text-white shadow-md shadow-secondary/20 hover:shadow-lg hover:shadow-secondary/30",
    danger: "bg-danger text-white shadow-md shadow-danger/20 hover:bg-red-600",
    ghost: "bg-transparent text-[#0F172A] dark:text-white hover:bg-[#0F172A]/5 dark:hover:bg-white/5",
    outline: "bg-transparent text-primary dark:text-primary-light border border-primary/30 hover:bg-primary/5",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <motion.button
      whileHover={!isDisabled && !isLoading ? { scale: 1.03 } : {}}
      whileTap={!isDisabled && !isLoading ? { scale: 0.97 } : {}}
      disabled={isDisabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin mr-2" />
      ) : Icon && iconPosition === "left" ? (
        <Icon size={16} className="mr-2" />
      ) : null}

      <span>{children}</span>

      {!isLoading && Icon && iconPosition === "right" ? (
        <Icon size={16} className="ml-2" />
      ) : null}
    </motion.button>
  );
};

export default AnimatedButton;
