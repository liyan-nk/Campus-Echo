export function PostCardSkeleton() {
  return (
    <div className="glass-card p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-full bg-white/10" />
        <div className="h-3 w-24 bg-white/10 rounded" />
        <div className="h-3 w-16 bg-white/10 rounded" />
        <div className="h-5 w-20 bg-white/10 rounded-full ml-auto" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-3 bg-white/5 rounded w-2/3" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-16 bg-white/10 rounded-md" />
        <div className="h-5 w-16 bg-white/10 rounded-md" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex gap-3">
          <div className="h-6 w-16 bg-white/10 rounded-md" />
          <div className="h-6 w-12 bg-white/10 rounded-md" />
        </div>
        <div className="flex gap-1">
          <div className="h-6 w-6 bg-white/10 rounded-md" />
          <div className="h-6 w-6 bg-white/10 rounded-md" />
        </div>
      </div>
    </div>
  );
}
