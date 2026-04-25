import { clsx } from 'clsx';

const variants = {
  primary: 'btn-primary bg-gradient-to-r from-primary to-secondary text-white hover:scale-105 shadow-md shadow-primary/10',
  outline: 'border border-black/10 dark:border-white/10 text-text-primary hover:bg-black/5 dark:hover:bg-white/5',
  ghost: 'text-text-primary hover:bg-black/5 dark:hover:bg-white/5 hover:text-primary',
  link: 'text-primary hover:underline bg-transparent border-none',
};

const sizes = {
  sm: 'px-4 py-2 text-sm min-h-[36px]',
  md: 'px-6 py-3 text-base min-h-[44px]',
  lg: 'px-8 py-4 text-lg min-h-[52px]',
};

const Button = ({
  children,
  type = 'button',
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;