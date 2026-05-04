import { useEffect, useState, useCallback } from "react";
import { Search, Dumbbell, Heart, Library } from "lucide-react";
import { getAllExercises, getExercisesByBodyPart } from "../api/services/exerciseService";
import { getDifficultyLevel } from "../utils/difficultyCalculator";
import ErrorState from "../components/feedback/ErrorState";
import ExerciseModal from "../components/exercises/ExerciseModal";
import ExerciseCardV2 from "../components/exercises/ExerciseCardV2";
import { saveToLocalStorage, getFromLocalStorage } from "../utils/localStorage";
import { notifySuccess, notifyError } from "../utils/toast";
import { addNotification } from "../utils/notifications";
import { SectionTitle } from "../components/ui/SectionTitle";
import { SkeletonLoader } from "../components/ui/SkeletonLoader";
import { PremiumCard } from "../components/ui/PremiumCard";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "../animations/stagger";

export const ExercisePageV2 = () => {
  const [search, setSearch] = useState("");
  const [focusFilter, setFocusFilter] = useState("All Focus");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [equipmentFilter, setEquipmentFilter] = useState("All");

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(null);

  const [favorites, setFavorites] = useState(getFromLocalStorage("fitforge_favorites") || []);

  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllExercises();
      setExercises(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load exercises.");
      notifyError("Failed to load exercises");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExercises();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchExercises]);

  useEffect(() => {
    saveToLocalStorage("fitforge_favorites", favorites);
  }, [favorites]);

  const handleFocusFilter = async (focus) => {
    setFocusFilter(focus);
    try {
      setLoading(true);
      setError("");
      if (focus === "All Focus") {
        const data = await getAllExercises();
        setExercises(data);
      } else {
        const data = await getExercisesByBodyPart(focus.toLowerCase().replace(" ", "_"));
        setExercises(data);
      }
    } catch (error) {
      console.error(error);
      setError("Failed to filter exercises.");
      notifyError("Failed to filter exercises");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (exercise) => {
    const exists = favorites.find((fav) => fav.id === exercise.id);
    if (exists) {
      setFavorites(favorites.filter((fav) => fav.id !== exercise.id));
      notifyError("Removed from favorites");
      addNotification("Favorite Removed", `${exercise.name} was removed from favorites.`, "workout", "low");
    } else {
      setFavorites([...favorites, exercise]);
      notifySuccess("Added to favorites");
      addNotification("Favorite Added", `${exercise.name} was added to favorites.`, "workout", "low");
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name?.toLowerCase().includes(search.toLowerCase());
    const difficulty = getDifficultyLevel(exercise);
    const matchesDifficulty = difficultyFilter === "All" || difficulty === difficultyFilter;
    const matchesEquipment = equipmentFilter === "All" || (exercise.equipment || "Bodyweight") === equipmentFilter;
    return matchesSearch && matchesDifficulty && matchesEquipment;
  });

  if (error) return <ErrorState message={error} />;

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-24 w-full"
    >
      {/* Title & Stats */}
      <SectionTitle 
        title="Movement Vault" 
        subtitle="Browse and filter high fidelity training instructions." 
        action={
          <div className="flex gap-3 shrink-0">
            <PremiumCard className="px-4 py-2.5 flex items-center gap-2.5 bg-white/50 dark:bg-[#0B0F19]/50 border-black/8 dark:border-white/5 shadow-sm">
              <Library size={14} className="text-primary" />
              <span className="font-mono text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                {filteredExercises.length} <span className="font-bold text-[#0F172A] dark:text-white">Exercises</span>
              </span>
            </PremiumCard>
            <PremiumCard className="px-4 py-2.5 flex items-center gap-2.5 bg-white/50 dark:bg-[#0B0F19]/50 border-black/8 dark:border-white/5 shadow-sm">
              <Heart size={14} className="text-danger" />
              <span className="font-mono text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                {favorites.length} <span className="font-bold text-[#0F172A] dark:text-white">Favorites</span>
              </span>
            </PremiumCard>
          </div>
        }
      />

      {/* Sticky Filters Header Wrapper */}
      <div className="sticky top-[-1rem] md:top-[-1.5rem] lg:top-[-2rem] z-30 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 pt-4 md:pt-6 lg:pt-8 pb-3 bg-[#FCFBF7] dark:bg-[#030304] border-b border-black/5 dark:border-white/5 transition-all">
        <motion.section 
          variants={staggerItem} 
          className="p-2.5 rounded-2xl bg-white/70 dark:bg-[#0F1115]/85 backdrop-blur-xl border border-black dark:border-white/20 shadow-sm flex flex-col md:flex-row items-center gap-3 transition-all"
        >
          {/* Shorter Search Input Container */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" size={14} />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-black/5 dark:bg-[#0F1115] border border-black/10 dark:border-white/10 rounded-xl text-[#0F172A] dark:text-white font-mono text-xs focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 transition-all placeholder:text-black/30 dark:placeholder:text-white/30"
            />
          </div>
          
          {/* Filters dropdown list */}
          <div className="flex flex-wrap md:flex-nowrap gap-2 flex-grow justify-end w-full">
            <select 
              value={focusFilter} 
              onChange={(e) => handleFocusFilter(e.target.value)} 
              className="px-3 py-2 rounded-xl bg-black/5 dark:bg-[#0F1115] border border-black/10 dark:border-white/10 text-[#0F172A] dark:text-white font-mono text-xs focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 transition-all appearance-none cursor-pointer min-w-[120px]"
            >
              <option value="All Focus">All Target Focus</option>
              <option value="Chest">Chest</option>
              <option value="Back">Back</option>
              <option value="Legs">Legs</option>
              <option value="Shoulders">Shoulders</option>
              <option value="Arms">Arms</option>
              <option value="Bicep">Bicep</option>
              <option value="Tricep">Tricep</option>
              <option value="Home">Home Workouts</option>
            </select>
            <select 
              value={difficultyFilter} 
              onChange={(e) => setDifficultyFilter(e.target.value)} 
              className="px-3 py-2 rounded-xl bg-black/5 dark:bg-[#0F1115] border border-black/10 dark:border-white/10 text-[#0F172A] dark:text-white font-mono text-xs focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 transition-all appearance-none cursor-pointer min-w-[100px]"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select 
              value={equipmentFilter} 
              onChange={(e) => setEquipmentFilter(e.target.value)} 
              className="px-3 py-2 rounded-xl bg-black/5 dark:bg-[#0F1115] border border-black/10 dark:border-white/10 text-[#0F172A] dark:text-white font-mono text-xs focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 transition-all appearance-none cursor-pointer min-w-[120px]"
            >
              <option value="All">All Equipment</option>
              <option value="barbell">Barbell</option>
              <option value="dumbbell">Dumbbell</option>
              <option value="body weight">Bodyweight</option>
              <option value="cable">Cable</option>
            </select>
          </div>
        </motion.section>
      </div>

      {/* Grid of Exercises */}
      {loading ? (
        <motion.div variants={staggerItem} className="w-full">
          <SkeletonLoader variant="card" count={6} />
        </motion.div>
      ) : (
        <motion.section 
          variants={staggerItem}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredExercises.length > 0 ? (
            filteredExercises.slice(0, 48).map((exercise, index) => {
              const isFav = favorites.some((fav) => fav.id === exercise.id);
              return (
                <ExerciseCardV2
                  key={exercise.id || index}
                  exercise={exercise}
                  isFavorite={isFav}
                  onToggleFavorite={toggleFavorite}
                  onSelect={() => setSelectedExercise(exercise)}
                />
              );
            })
          ) : (
            <div className="col-span-full py-12 flex flex-col items-center justify-center">
              <PremiumCard className="p-8 text-center bg-white/50 dark:bg-[#0B0F19]/50 border-black/8 dark:border-white/5 w-full max-w-md">
                <Dumbbell className="mx-auto w-10 h-10 text-[#64748B] dark:text-[#94A3B8] mb-4" />
                <h4 className="font-heading font-extrabold text-[#0F172A] dark:text-white text-base">No movements matched query</h4>
                <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] mt-2">Try clearing tags, adjusting keywords or changing muscle targets.</p>
              </PremiumCard>
            </div>
          )}
        </motion.section>
      )}

      {!loading && filteredExercises.length > 48 && (
        <motion.div variants={staggerItem} className="text-center pt-8">
          <p className="inline-block px-5 py-2.5 bg-white/55 dark:bg-[#0B0F19]/50 border border-black/5 dark:border-white/5 rounded-2xl font-mono text-[#64748B] dark:text-[#94A3B8] text-xs font-bold uppercase tracking-wider">
            Showing top 48 results
          </p>
        </motion.div>
      )}

      {selectedExercise && (
        <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
      )}
    </motion.div>
  );
};

export default ExercisePageV2;
