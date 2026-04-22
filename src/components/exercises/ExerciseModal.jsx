import { useNavigate } from "react-router-dom";
import useWorkoutPlanner from "../../hooks/useWorkoutPlanner";
import { getPersonalizedExerciseGif } from "../../utils/exerciseGifSelector";
import { notifySuccess } from "../../utils/toast";
import { Plus, X, Dumbbell, Target, CheckCircle2, Lightbulb } from "lucide-react";

const ExerciseModal = ({ exercise, onClose, hideAddButton = false }) => {
  const { addExercise } = useWorkoutPlanner();
  const navigate = useNavigate();

  if (!exercise) return null;

  const gifUrl = getPersonalizedExerciseGif(exercise);

  return (
    <div className="fixed inset-0 bg-bg/80 backdrop-blur-md flex justify-center items-center z-50 p-4 sm:p-6 overflow-y-auto">
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-5xl my-4 sm:my-auto flex flex-col lg:flex-row shadow-2xl overflow-hidden z-10">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-bg border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-border transition-all shadow-sm"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* Left Pane: Immersive Media */}
        <div className="w-full lg:w-1/2 h-[280px] lg:h-[580px] relative shrink-0 border-b lg:border-b-0 lg:border-r border-border overflow-hidden bg-bg">
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <div className="relative z-10 w-full h-full p-6 flex items-center justify-center">
              {gifUrl ? (
                <img
                  src={gifUrl}
                  alt={exercise.name}
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-lighten opacity-90 transition-all duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop"
                    alt="Fitness Placeholder"
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-lighten opacity-30"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute bottom-5 left-5 flex gap-2 z-30">
            <span className="px-2.5 py-1.5 rounded-lg bg-card/90 backdrop-blur-md border border-border text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
              <Target size={12} className="text-primary" /> {exercise.bodyPart}
            </span>
            <span className="px-2.5 py-1.5 rounded-lg bg-card/90 backdrop-blur-md border border-border text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
              <Dumbbell size={12} className="text-secondary" /> {exercise.equipment || "Bodyweight"}
            </span>
          </div>
        </div>

        {/* Right Pane: Premium Content */}
        <div className="flex-1 flex flex-col max-h-[50vh] lg:max-h-[580px]">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 relative z-10">

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary capitalize tracking-tight mb-3">
              {exercise.name}
            </h2>

            {/* Subtitle */}
            <p className="text-sm md:text-base text-text-secondary font-medium leading-relaxed max-w-2xl mb-8">
              Master your form, build strength, and dominate this core movement with precision and control.
            </p>

            <div className="space-y-6">
              {/* Execution Protocol */}
              {exercise.instructions && exercise.instructions.length > 0 && (
                <div className="bg-bg border border-border rounded-xl p-6">
                  <h3 className="text-text-primary text-sm font-extrabold mb-5 flex items-center gap-2.5 tracking-tight">
                    <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                      <CheckCircle2 size={14} strokeWidth={2.5} />
                    </span>
                    Execution Protocol
                  </h3>
                  <ol className="space-y-4">
                    {exercise.instructions.map((step, index) => (
                      <li key={index} className="flex gap-4">
                        <span className="text-text-secondary font-bold text-xs mt-0.5 min-w-[20px]">{String(index + 1).padStart(2, '0')}</span>
                        <span className="text-text-secondary text-sm font-medium leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Pro Tips */}
              {exercise.tips && exercise.tips.length > 0 && (
                <div className="bg-bg border border-border rounded-xl p-6">
                  <h3 className="text-text-primary text-sm font-extrabold mb-5 flex items-center gap-2.5 tracking-tight">
                    <span className="w-7 h-7 rounded-lg bg-warning/10 text-warning flex items-center justify-center border border-warning/20">
                      <Lightbulb size={14} strokeWidth={2.5} />
                    </span>
                    Pro Tips
                  </h3>
                  <ul className="space-y-4">
                    {exercise.tips.map((tip, index) => (
                      <li key={index} className="flex gap-4 items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-warning shrink-0 mt-1.5" />
                        <span className="text-text-secondary text-sm font-medium leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(!exercise.instructions || exercise.instructions.length === 0) && (
                <div className="p-6 text-center border border-dashed border-border rounded-xl bg-bg">
                  <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">Detailed execution protocol unavailable</p>
                </div>
              )}
            </div>
          </div>

          {/* Premium CTA Footer */}
          {!hideAddButton && (
            <div className="relative z-10 p-6 bg-card border-t border-border shrink-0">
              <button
                onClick={() => {
                  addExercise(exercise);
                  notifySuccess(`${exercise.name} added to Custom Plan`);
                  onClose();
                  setTimeout(() => {
                    navigate("/custom-plan");
                  }, 300);
                }}
                className="w-full py-4 rounded-xl btn-primary text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Plus size={18} strokeWidth={2.5} />
                <span>Integrate into Workout</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ExerciseModal;