import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Input({ className, ...props }) {
  return (
    <input
      className={twMerge(
        'w-full bg-surface border border-border rounded-md px-3 py-2 text-text placeholder-textMuted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200',
        className
      )}
      {...props}
    />
  );
}
