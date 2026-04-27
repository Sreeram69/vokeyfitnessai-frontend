import { cn } from "../../utils/cn";

export const SectionTitle = ({
  title,
  subtitle,
  action,
  className,
}) => {
  return (
    <div className={cn("flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8", className)}>
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight font-heading">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm font-semibold text-[#64748B] dark:text-[#94A3B8] mt-1 font-sans">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-3">
          {action}
        </div>
      )}
    </div>
  );
};

export default SectionTitle;
