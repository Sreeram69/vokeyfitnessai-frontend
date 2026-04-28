import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../utils/cn";

const ThemeToggle = ({ className }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:scale-105 transition-all duration-300 flex items-center justify-center cursor-pointer",
        className
      )}
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="text-primary dark:text-[#A78BFA]" size={18} />
      ) : (
        <Moon className="text-primary dark:text-[#A78BFA]" size={18} />
      )}
    </button>
  );
};

export default ThemeToggle;