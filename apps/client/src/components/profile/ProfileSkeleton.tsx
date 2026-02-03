import { Skeleton } from '../ui/skeleton';

export const ProfileSkeleton = () => (
  <div className="mx-auto max-w-4xl px-4 py-8">
    {/* Profile Header */}
    <header className="flex flex-col gap-8 pb-8 md:flex-row md:items-start">
      {/* Avatar */}
      <Skeleton className="mx-auto h-20 w-20 rounded-full md:mx-0 md:h-36 md:w-36" />

      {/* Profile Info */}
      <div className="flex-1 text-center md:text-left">
        {/* Username + button */}
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>

        {/* Stats */}
        <div className="mt-4 flex justify-center gap-8 md:justify-start">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Bio */}
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    </header>

    {/* Divider */}
    <div className="border-t border-[#DBDBDB]" />

    {/* Posts Grid 3x3 */}
    <section className="py-4">
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-none" />
        ))}
      </div>
    </section>
  </div>
);
