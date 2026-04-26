import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { cn } from "../../utils/cn";

export const FloatingActionButton = ({
  actions = [], // Array of { icon, label, onClick }
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className={cn("fixed bottom-24 right-6 z-40 lg:hidden flex flex-col items-end gap-3", className)}>
      {/* Expanded Quick Actions list */}
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-2.5">
            {actions.map((act, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 25, delay: idx * 0.05 }}
                onClick={() => {
                  act.onClick();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2.5 bg-[#0F121D] border border-white/10 text-white pl-4 pr-3.5 py-2.5 rounded-full shadow-lg hover:bg-[#131825] transition"
              >
                <span className="text-xs font-semibold tracking-wide font-mono uppercase text-white/80">{act.label}</span>
                {act.icon && <act.icon size={16} className="text-primary-light" />}
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleOpen}
        className="w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/30 z-10 cursor-pointer"
      >
        <motion.div
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {isOpen ? <X size={24} /> : <Plus size={24} />}
        </motion.div>
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;
