import { cn } from "../../utils/cn";

export const SkeletonLoader = ({
  variant = "card", // card | text | list | circle
  className,
  count = 1,
}) => {
  const baseClass = "bg-[#0F172A]/5 dark:bg-white/5 animate-pulse rounded-2xl relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

  const renderSkeleton = () => {
    switch (variant) {
      case "text":
        return (
          <div className="space-y-2.5 w-full">
            <div className={cn(baseClass, "h-4 w-3/4", className)} />
            <div className={cn(baseClass, "h-3 w-1/2", className)} />
          </div>
        );
      case "list":
        return (
          <div className="space-y-3 w-full">
            {Array.from({ length: count }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl border border-black/5 dark:border-white/5">
                <div className={cn(baseClass, "w-10 h-10 rounded-xl")} />
                <div className="flex-1 space-y-1.5">
                  <div className={cn(baseClass, "h-3.5 w-1/3")} />
                  <div className={cn(baseClass, "h-3 w-1/4")} />
                </div>
              </div>
            ))}
          </div>
        );
      case "circle":
        return <div className={cn(baseClass, "rounded-full", className)} />;
      case "card":
      default:
        return (
          <div className={cn("p-6 border border-black/5 dark:border-white/5 rounded-2xl space-y-4", className)}>
            <div className="flex justify-between items-start">
              <div className="space-y-2 w-1/2">
                <div className={cn(baseClass, "h-3 w-3/4")} />
                <div className={cn(baseClass, "h-6 w-1/2")} />
              </div>
              <div className={cn(baseClass, "w-10 h-10 rounded-xl")} />
            </div>
            <div className="space-y-2 pt-2">
              <div className={cn(baseClass, "h-3 w-full")} />
              <div className={cn(baseClass, "h-3 w-5/6")} />
            </div>
          </div>
        );
    }
  };

  if (variant === "list" || count === 1) {
    return renderSkeleton();
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
