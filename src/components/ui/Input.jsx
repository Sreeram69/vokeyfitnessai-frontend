import { clsx } from 'clsx';

const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  className = '',
  variant = 'default',
  disabled = false,
  error,
  ...props
}) => {
  const baseClasses = 'w-full px-4 py-3 text-white bg-black/50 border-0 border-b-2 border-white/20 transition-all duration-200 focus:outline-none dark:text-white dark:placeholder:text-white/30';

  const variantClasses = {
    default: 'focus:border-[#F7931A] focus:shadow-[0_10px_20px_-10px_rgba(247,147,26,0.3)]',
    outlined: 'rounded-xl border border-white/20 bg-black/50 focus:border-[#F7931A] focus:shadow-[0_0_15px_rgba(247,147,26,0.2)]',
  };

  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        error && 'border-[#EF4444] focus:border-[#EF4444]',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    />
  );
};

export default Input;