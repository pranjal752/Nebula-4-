import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={twMerge(
        'bg-surface border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
