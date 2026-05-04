import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Download, Upload, Trash2, PlayCircle, FolderPlus, FolderHeart } from "lucide-react";
import ExerciseModal from "../components/exercises/ExerciseModal";
import FavoriteButton from "../components/exercises/FavoriteButton";
import { getFromLocalStorage, saveToLocalStorage } from "../utils/localStorage";
import { notifyError, notifyInfo, notifySuccess } from "../utils/toast";
import { addNotification } from "../utils/notifications";
import { SectionTitle } from "../components/ui/SectionTitle";
import { staggerContainer, staggerItem } from "../animations/stagger";
import { getDifficultyLevel } from "../utils/difficultyCalculator";
import { getExerciseThumbnail } from "../utils/exerciseGifSelector";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState(getFromLocalStorage("fitforge_favorites") || []);
  const [collections] = useState(getFromLocalStorage("fitforge_favorite_collections") || []);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("exercises");

  const toggleFavorite = (exercise) => {
    const updatedFavorites = favorites.filter((fav) => fav.id !== exercise.id);
    setFavorites(updatedFavorites);
    saveToLocalStorage("fitforge_favorites", updatedFavorites);
    notifyError("Removed from favorites");
    addNotification("Favorite Removed", `${exercise.name} was removed from favorites.`, "workout", "low");
  };

  const clearAllFavorites = () => {
    if (window.confirm("Are you sure you want to clear all favorites?")) {
      setFavorites([]);
      saveToLocalStorage("fitforge_favorites", []);
      notifyInfo("All favorites cleared");
    }
  };

  const exportFavorites = () => {
    if (!favorites.length) { notifyInfo("No favorites to export"); return; }
    const dataStr = JSON.stringify(favorites, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "fitforge-favorites.json";
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
    notifyInfo("Favorites exported successfully");
  };

  const importFavorites = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedFavorites = JSON.parse(e.target.result);
        if (!Array.isArray(importedFavorites)) throw new Error();
        setFavorites(importedFavorites);
        saveToLocalStorage("fitforge_favorites", importedFavorites);
        notifySuccess("Favorites imported successfully");
      } catch {
        notifyError("Invalid favorites backup file");
      }
    };
    reader.readAsText(file);
  };

  const filteredFavorites = favorites.filter(ex => ex.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div 
      variants={staggerContainer} 
      initial="hidden" 
      animate="visible" 
      className="space-y-6 pb-24 w-full"
    >
      <SectionTitle 
        title="My Arsenal" 
        subtitle="Your elite collection of saved movements and routines."
        action={
          <div className="flex gap-3">
            <label className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-text-primary font-mono text-sm rounded-xl transition cursor-pointer border border-black/10 dark:border-white/10 hover:border-primary/50">
              <Upload size={16} /> Import
              <input type="file" accept=".json" onChange={importFavorites} className="hidden" />
            </label>
            <button onClick={exportFavorites} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-text-primary font-mono text-sm rounded-xl transition border border-black/10 dark:border-white/10 hover:border-primary/50">
              <Download size={16} /> Export
            </button>
            {favorites.length > 0 && (
              <button onClick={clearAllFavorites} className="flex items-center gap-2 px-5 py-2.5 bg-danger/10 border border-danger/20 text-danger hover:bg-danger/20 font-mono text-sm rounded-xl transition hover:border-danger/50">
                <Trash2 size={16} /> Clear
              </button>
            )}
          </div>
        }
      />

      <section className="flex gap-4">
        <button onClick={() => setActiveTab("exercises")} className={`px-6 py-3 rounded-xl font-mono text-sm font-medium transition-all ${activeTab === "exercises" ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary/10" : "bg-white dark:bg-white/5 text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10"}`}>
          Saved Exercises ({favorites.length})
        </button>
        <button onClick={() => setActiveTab("collections")} className={`px-6 py-3 rounded-xl font-mono text-sm font-medium transition-all ${activeTab === "collections" ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary/10" : "bg-white dark:bg-white/5 text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10"}`}>
          Custom Collections ({collections.length})
        </button>
      </section>

      {activeTab === "exercises" ? (
        <div className="space-y-6">
          {favorites.length > 0 && (
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input type="text" placeholder="Search your arsenal..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#0F1115] border border-black/10 dark:border-white/10 rounded-2xl font-mono text-sm focus:outline-none focus:border-primary transition text-text-primary placeholder:text-text-secondary/40" />
            </div>
          )}

          {favorites.length === 0 ? (
            <div className="text-center py-24 bg-white/50 dark:bg-[#0F1115]/50 backdrop-blur-sm rounded-[2rem] border-2 border-black/10 dark:border-white/10 border-dashed relative overflow-hidden group">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000" />
              <div className="relative z-10">
                <div className="w-24 h-24 bg-white dark:bg-[#0F1115] border-2 border-black/10 dark:border-white/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                  <FolderHeart size={40} className="text-text-secondary/30 group-hover:text-primary transition-colors duration-500" />
                </div>
                <h3 className="font-heading text-3xl font-bold text-text-primary mb-3 tracking-tight">Your Arsenal is Empty</h3>
                <p className="text-text-secondary font-medium mb-10 max-w-sm mx-auto">Browse the Exercise Library and click the heart icon to save movements here.</p>
                <Link to="/exercises" className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-md shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition inline-block">
                  Explore Library
                </Link>
              </div>
            </div>
          ) : filteredFavorites.length > 0 ? (
            <motion.section variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFavorites.map((exercise, index) => {
                const difficulty = getDifficultyLevel(exercise);
                return (
                  <div key={exercise.id || index} onClick={() => setSelectedExercise(exercise)} className="group bg-white/50 dark:bg-[#0B0F19]/50 backdrop-blur border border-black/8 dark:border-white/5 rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(124,58,237,0.1)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    
                    <div className="h-32 w-full relative overflow-hidden bg-black/5 dark:bg-[#030304]">
                      <div className="absolute inset-0 bg-gradient-to-t from-white/90 dark:from-[#0F1115] via-white/40 dark:via-[#0F1115]/40 to-transparent z-10" />
                      <img src={getExerciseThumbnail(exercise)} alt={exercise.name} loading="lazy" className="w-full h-full object-cover mix-blend-luminosity opacity-45 group-hover:opacity-65 transition-opacity duration-500 group-hover:scale-105" />
                      <div className="absolute top-3 right-3 z-20" onClick={(e) => { e.stopPropagation(); toggleFavorite(exercise); }}>
                        <FavoriteButton isFavorite={true} onToggle={() => {}} />
                      </div>
                      <div className="absolute bottom-3 left-4 z-20 pr-4">
                        <h3 className="font-heading text-sm font-bold text-text-primary capitalize leading-tight group-hover:text-primary transition-colors line-clamp-2">{exercise.name}</h3>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1 bg-gradient-to-b from-white dark:from-[#0B0F19]/50 to-white/80 dark:to-[#030304]">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="px-2 py-0.5 rounded bg-success/10 text-success font-mono text-[9px] font-semibold uppercase tracking-wider">{exercise.bodyPart}</span>
                        <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary font-mono text-[9px] font-semibold uppercase tracking-wider">{exercise.equipment || "Bodyweight"}</span>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <span className={`font-mono text-[9px] font-semibold uppercase tracking-widest ${difficulty === 'Beginner' ? 'text-success' : difficulty === 'Intermediate' ? 'text-primary' : 'text-danger'}`}>{difficulty}</span>
                        <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary group-hover:text-primary transition-colors">
                          View <PlayCircle className="text-text-secondary group-hover:text-primary transition-colors" size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.section>
          ) : (
            <div className="text-center py-10 bg-white dark:bg-white/5 rounded-3xl border border-black/10 dark:border-white/10">
              <p className="text-text-secondary">No favorites match "{search}".</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/50 dark:bg-white/5 rounded-3xl border border-black/10 dark:border-white/10 border-dashed">
          <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <FolderPlus size={32} className="text-text-secondary/30" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-text-primary mb-2">Collections Coming Soon</h3>
          <p className="text-text-secondary mb-8 max-w-sm mx-auto">Soon you'll be able to group your favorite exercises into custom collections for easy access.</p>
        </div>
      )}

      {selectedExercise && <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />}
    </motion.div>
  );
};

export default FavoritesPage;