"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPES = ["COMPLAINT","SUGGESTION","FEEDBACK","CONFESSION","POLL","URGENT"];
const STATUSES = ["PENDING","UNDER_REVIEW","IN_PROGRESS","RESOLVED","REJECTED"];
const SORTS = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "trending", label: "Trending" },
];

export function PostFiltersBar({ categories, currentFilters }: { categories: any[]; currentFilters: any }) {
  const router = useRouter();

  function updateFilter(key: string, value: string | undefined) {
    const params = new URLSearchParams(currentFilters);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  const hasFilters = currentFilters.category || currentFilters.type || currentFilters.status || currentFilters.search;

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search posts..."
          defaultValue={currentFilters.search || ""}
          onKeyDown={(e) => { if (e.key === "Enter") updateFilter("search", (e.target as HTMLInputElement).value || undefined); }}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Sort */}
        {SORTS.map(s => (
          <button key={s.value} onClick={() => updateFilter("sort", s.value)}
            className={cn("text-xs px-3 py-1.5 rounded-full border transition-all",
              (currentFilters.sort || "latest") === s.value
                ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                : "border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20")}>
            {s.label}
          </button>
        ))}

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Categories */}
        <select onChange={(e) => updateFilter("category", e.target.value || undefined)} value={currentFilters.category || ""}
          className="bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {/* Type */}
        <select onChange={(e) => updateFilter("type", e.target.value || undefined)} value={currentFilters.type || ""}
          className="bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer">
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Status */}
        <select onChange={(e) => updateFilter("status", e.target.value || undefined)} value={currentFilters.status || ""}
          className="bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer">
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
        </select>

        {hasFilters && (
          <button onClick={() => router.push("?")} className="text-xs px-3 py-1.5 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-1">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
