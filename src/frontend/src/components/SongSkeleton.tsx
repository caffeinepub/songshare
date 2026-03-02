import { Skeleton } from "@/components/ui/skeleton";

export function SongSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-3/4 rounded" />
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Skeleton className="h-3 w-12 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-14 rounded-lg" />
          <Skeleton className="h-7 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SongsLoadingGrid() {
  return (
    <div
      data-ocid="songs.loading_state"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
        <SongSkeleton key={i} />
      ))}
    </div>
  );
}
