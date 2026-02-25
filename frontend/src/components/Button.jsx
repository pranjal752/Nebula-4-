import { twMerge } from 'tailwind-merge';

export function Button({ className, variant = 'primary', size = 'default', ...props }) {
  const variants = {
    primary: 'bg-primary text-background hover:bg-primaryHover font-medium',
    secondary: 'bg-surface hover:bg-surfaceHover text-text border border-border',
    outline: 'bg-transparent border border-border hover:border-primary hover:text-primary text-textMuted',
    ghost: 'bg-transparent hover:bg-surfaceHover text-text',
    danger: 'bg-error text-white hover:bg-red-600',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2',
  };

  return (
    <button
      className={twMerge(
        'rounded-md transition-colors duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
