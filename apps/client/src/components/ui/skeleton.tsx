import { cn } from '../../lib/utils';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <div
    className={cn('animate-pulse rounded-md bg-zinc-200', className)}
    {...props}
  />
);
