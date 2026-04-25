import { clsx } from 'clsx';

const Card = ({
  children,
  className = '',
  variant = 'default',
  hoverable = true,
  ...props
}) => {
  const baseClasses = 'rounded-2xl border border-white/10 bg-[#0F1115] p-8 transition-[transform,border-color,box-shadow,background-color] duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] [will-change:transform]';

  const variantClasses = {
    default: 'dark:hover:-translate-y-1 dark:hover:border-[#F7931A]/50 dark:hover:shadow-[0_0_30px_-10px_rgba(247,147,26,0.2)]',
    glass: 'glass dark:bg-black/40 dark:backdrop-blur-lg',
    elevated: 'dark:shadow-[0_0_50px_-10px_rgba(247,147,26,0.1)] dark:hover:shadow-[0_0_60px_-10px_rgba(247,147,26,0.2)]',
  };

  return (
    <div
      className={clsx(
        baseClasses,
        hoverable && variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;