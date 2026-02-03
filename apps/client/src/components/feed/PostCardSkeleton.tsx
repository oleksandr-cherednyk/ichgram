import { Skeleton } from '../ui/skeleton';

export const PostCardSkeleton = () => (
  <article className="border-b border-[#DBDBDB] pb-4">
    {/* Header */}
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-3 w-24" />
    </div>

    {/* Image */}
    <Skeleton className="aspect-square w-full rounded-none" />

    {/* Actions */}
    <div className="flex items-center gap-4 px-4 py-3">
      <Skeleton className="h-6 w-6 rounded-full" />
      <Skeleton className="h-6 w-6 rounded-full" />
      <Skeleton className="h-6 w-6 rounded-full" />
    </div>

    {/* Likes */}
    <div className="px-4">
      <Skeleton className="h-3 w-20" />
    </div>

    {/* Caption */}
    <div className="px-4 pt-2">
      <Skeleton className="h-3 w-3/4" />
    </div>
  </article>
);
