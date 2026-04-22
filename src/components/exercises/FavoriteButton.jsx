import { Heart } from "lucide-react";

const FavoriteButton = ({
  isFavorite,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      className={`p-3 rounded-full backdrop-blur-xl border transition-all duration-300 shadow-lg ${
        isFavorite
          ? "bg-[#EF4444] border-[#EF4444] text-white scale-110 shadow-lg shadow-red-500/20"
          : "bg-white/40 dark:bg-[#0F1115]/80 border-black/5 dark:border-white/10 text-[#64748B] dark:text-[#94A3B8] hover:bg-red-500/10 hover:text-[#EF4444] hover:border-red-500/20 hover:scale-105"
      }`}
    >
      <Heart
        size={22}
        className={`transition-all duration-300 ${
          isFavorite
            ? "fill-white"
            : ""
        }`}
      />
    </button>
  );
};

export default FavoriteButton;