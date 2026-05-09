export function PostSkeleton() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full shimmer bg-white/5" />
        <div className="flex gap-2">
          <div className="h-3 w-20 rounded shimmer bg-white/5" />
          <div className="h-3 w-16 rounded shimmer bg-white/5" />
        </div>
      </div>
      <div className="h-4 w-3/4 rounded shimmer bg-white/5" />
      <div className="h-3 w-full rounded shimmer bg-white/5" />
      <div className="h-3 w-2/3 rounded shimmer bg-white/5" />
    </div>
  );
}
