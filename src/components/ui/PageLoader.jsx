import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export const PageLoader = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 transition-colors duration-300">
      <div className="relative flex items-center justify-center mb-10">
        {/* Outer glowing ambient aura */}
        <div className="absolute w-28 h-28 rounded-full bg-gradient-to-tr from-primary to-secondary opacity-20 blur-xl animate-pulse" />

        {/* Outer Ring - Rotating */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-full border-2 border-transparent border-t-primary border-r-primary opacity-80"
        />

        {/* Inner Ring - Rotating Reverse */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute w-18 h-18 rounded-full border-2 border-transparent border-b-secondary border-l-secondary opacity-80"
        />

        {/* Glowing Center Hub with Pulse Icon */}
        <motion.div
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-12 h-12 rounded-full bg-white dark:bg-[#0B0F19] border border-black/5 dark:border-white/10 flex items-center justify-center shadow-lg shadow-primary/10"
        >
          <Activity size={20} className="text-primary dark:text-[#FDBA74]" />
        </motion.div>
      </div>

      {/* Typography */}
      <h2 className="text-xl sm:text-2xl font-black text-text-primary mb-3 tracking-tight font-heading">
        Initializing <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Vokey Fitness AI</span>
      </h2>

      <p className="text-text-secondary text-xs sm:text-sm font-semibold max-w-xs leading-relaxed">
        Syncing intelligence engine and preparing your personalized fitness experience...
      </p>
    </div>
  );
};

export default PageLoader;
