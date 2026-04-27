import { motion } from "framer-motion";
import { cn } from "../../utils/cn"; // If cn helper doesn't exist, we can use simple template literals or create a small helper. Wait! We saw 'clsx' in package.json. Let's see if a cn utility exists.

export const PremiumCard = ({
  children,
  className,
  hoverGlow = true,
  animateBorder = false,
  ...props
}) => {
  return (
    <motion.div
      whileHover={hoverGlow ? { y: -4 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-[border-color,box-shadow,background-color] duration-200 ease-out",
        // Light Mode styling
        "bg-white/90 backdrop-blur-md border-[var(--border)] shadow-[0_8px_30px_rgba(247,147,26,0.04)]",
        // Dark Mode styling
        "dark:bg-[#0F1115]/75 dark:backdrop-blur-md dark:border-white/8 dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)]",
        // Hover Glow options
        hoverGlow && "hover:shadow-[0_15px_35px_rgba(247,147,26,0.12)] hover:border-primary/35 dark:hover:shadow-[0_8px_30px_rgba(247,147,26,0.12)] dark:hover:border-primary/40",
        className
      )}
      {...props}
    >
      {animateBorder && (
        <span className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary to-secondary animate-pulse" />
      )}
      
      {/* Glow Ambient Effect */}
      {hoverGlow && (
        <div className="absolute -inset-px bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10" />
      )}
      
      {children}
    </motion.div>
  );
};

export default PremiumCard;
