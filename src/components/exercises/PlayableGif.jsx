import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

const PlayableGif = ({ gifUrl, name, containerClassName = "" }) => {
  const [hasError, setHasError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  // Upgrade http → https to avoid mixed-content blocks
  const safeGifUrl = typeof gifUrl === "string" && gifUrl.trim() !== "" 
    ? gifUrl.replace("http://", "https://") 
    : null;

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setHasError(!safeGifUrl);
    setFallbackError(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [safeGifUrl]);

  if (hasError) {
    return (
      <div className={`relative rounded-2xl overflow-hidden bg-[#030304] border border-white/10 flex items-center justify-center ${containerClassName}`}>
        {!fallbackError ? (
          <img
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop"
            alt="Exercise preview fallback"
            className="w-full h-full object-cover mix-blend-luminosity opacity-40"
            onError={() => setFallbackError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[#94A3B8] w-full h-full">
            <AlertCircle size={48} />
            <p className="mt-2 text-sm">Preview Unavailable</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-[#030304] border border-white/10 flex items-center justify-center ${containerClassName}`}>
      <img
        src={safeGifUrl}
        alt={name}
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain mix-blend-luminosity opacity-90"
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export default PlayableGif;