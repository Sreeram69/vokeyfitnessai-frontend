import { PlayCircle } from "lucide-react";
import FavoriteButton from "./FavoriteButton";
import { PremiumCard } from "../ui/PremiumCard";
import { cn } from "../../utils/cn";

import { getDifficultyLevel } from "../../utils/difficultyCalculator";
import { getExerciseThumbnail } from "../../utils/exerciseGifSelector";

export const ExerciseCardV2 = ({
  exercise,
  isFavorite,
  onToggleFavorite,
  onSelect,
}) => {
  const difficulty = getDifficultyLevel(exercise);
  const thumbnail = getExerciseThumbnail(exercise);

  return (
    <PremiumCard
      hoverGlow={true}
      onClick={onSelect}
      className="group glass-premium rounded-3xl overflow-hidden hover:border-primary/50 hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col relative h-full"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Exercise Image / Placeholder */}
      <div className="h-48 w-full relative overflow-hidden bg-black/5 dark:bg-[#030304]">
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 dark:from-[#0F1115] via-white/40 dark:via-[#0F1115]/40 to-transparent z-10" />
        
        <img
          src={thumbnail}
          alt={exercise.name}
          loading="lazy"
          className="w-full h-full object-cover mix-blend-luminosity opacity-45 group-hover:opacity-65 transition-opacity duration-500 group-hover:scale-105"
        />


        {/* Play Button Overlay on Hover */}
        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-15 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 backdrop-blur-md flex items-center justify-center shadow-lg shadow-primary/30 text-white transform scale-90 group-hover:scale-100 transition-all duration-300">
            <PlayCircle size={22} className="text-white fill-white/10" />
          </div>
        </div>

        {/* Favorite Quick Action Toggle */}
        <div
          className="absolute top-4 right-4 z-20"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(exercise);
          }}
        >
          <FavoriteButton isFavorite={isFavorite} onToggle={() => {}} />
        </div>

        {/* Dynamic Title overlay on top of image gradient */}
        <div className="absolute bottom-4 left-5 z-20 pr-4">
          <h3 className="font-heading text-xl font-bold text-text-primary capitalize leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {exercise.name}
          </h3>
        </div>
      </div>

      {/* Info panel */}
      <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-white dark:from-[#0F1115] to-white/80 dark:to-[#030304] relative z-10 justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-success/10 text-success font-mono text-[10px] font-semibold uppercase tracking-wider">
            {exercise.bodyPart}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-secondary/10 text-secondary font-mono text-[10px] font-semibold uppercase tracking-wider">
            {exercise.equipment || "Bodyweight"}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-4">
          <span
            className={cn(
              "font-mono text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border",
              difficulty === 'Beginner' 
                ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                : difficulty === 'Intermediate' 
                  ? 'bg-primary/10 border-primary/20 text-primary dark:text-[#A78BFA]' 
                  : 'bg-red-500/10 border-red-500/20 text-danger'
            )}
          >
            {difficulty}
          </span>
          <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-text-secondary group-hover:text-primary transition-colors">
            View <PlayCircle className="text-text-secondary group-hover:text-primary transition-colors" size={20} />
          </div>
        </div>
      </div>
    </PremiumCard>
  );
};

export default ExerciseCardV2;
