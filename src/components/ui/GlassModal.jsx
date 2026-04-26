import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

export const GlassModal = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#030304]/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={cn(
              "relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl flex flex-col max-h-[85vh]",
              // Light Mode
              "bg-white/80 backdrop-blur-xl border-[#0F172A]/10 text-[#0F172A]",
              // Dark Mode
              "dark:bg-[#0F121D]/80 dark:backdrop-blur-xl dark:border-white/10 dark:text-white",
              className
            )}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-[#0F172A]/5 dark:border-white/5">
              {title && (
                <h3 className="text-lg font-bold tracking-tight font-heading">
                  {title}
                </h3>
              )}
              <button
                onClick={onClose}
                className="p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white rounded-full bg-white/5 hover:bg-[#0F172A]/5 dark:hover:bg-white/5 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GlassModal;
