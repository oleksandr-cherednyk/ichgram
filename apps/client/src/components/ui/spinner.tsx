import { cn } from '../../lib/utils';

type SpinnerProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
};

export const Spinner = ({ className, size = 'md' }: SpinnerProps) => (
  <div
    className={cn(
      'animate-spin rounded-full border-zinc-300 border-t-zinc-600',
      sizeClasses[size],
      className,
    )}
  />
);
