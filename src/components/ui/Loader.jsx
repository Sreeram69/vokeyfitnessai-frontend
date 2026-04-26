import { cn } from "../../utils/cn";

export const Loader = ({ variant = "dots", className, width, height, circle }) => {
  if (variant === "skeleton") {
    return (
      <div
        className={cn(
          "animate-shimmer rounded-xl bg-black/5 dark:bg-white/5",
          circle && "rounded-full",
          className
        )}
        style={{
          width: width || "100%",
          height: height || "1rem",
        }}
      />
    );
  }

  return (
    <div className={cn("flex justify-center items-center py-10", className)}>
      <div className="flex justify-center gap-2">
         <div className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
         <div className="h-2.5 w-2.5 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '150ms' }}></div>
         <div className="h-2.5 w-2.5 rounded-full bg-[#EA580C] animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default Loader;