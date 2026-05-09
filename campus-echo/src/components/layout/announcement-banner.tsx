export function AnnouncementBanner({ title, content }: { title: string; content: string }) {
  return (
    <div className="glass-card border-indigo-500/30 p-4 mb-6 flex items-start gap-3 bg-indigo-500/5">
      <span className="text-xl flex-shrink-0">📢</span>
      <div className="min-w-0">
        <div className="font-semibold text-white text-sm">{title}</div>
        <div className="text-gray-400 text-sm mt-0.5 line-clamp-2">{content}</div>
      </div>
    </div>
  );
}
