import { Suspense } from "react";
import { getPosts } from "@/actions/posts";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/posts/post-card";
import { PostFiltersBar } from "@/components/posts/post-filters-bar";
import { PostCardSkeleton } from "@/components/posts/post-card-skeleton";
import { AnnouncementBanner } from "@/components/layout/announcement-banner";

interface SearchParams {
  category?: string;
  type?: string;
  status?: string;
  search?: string;
  sort?: string;
  page?: string;
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const filters = {
    categoryId: params.category,
    type: params.type,
    status: params.status,
    search: params.search,
    sortBy: (params.sort as any) || "latest",
    page: parseInt(params.page || "1"),
    pageSize: 15,
  };

  const [postsData, categories, pinned] = await Promise.all([
    getPosts(filters),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.announcement.findFirst({
      where: { isPinned: true, isPublished: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 lg:pb-6">
      {/* Announcement temporarily disabled */}

      <PostFiltersBar
        categories={categories}
        currentFilters={filters}
      />

      <div className="space-y-4 mt-6">
        {postsData.items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔇</span>
            </div>

            <h3 className="text-white font-semibold mb-2">
              No posts yet
            </h3>

            <p className="text-gray-500 text-sm">
              {filters.search
                ? `No results for "${filters.search}"`
                : "Be the first to share something"}
            </p>
          </div>
        ) : (
          postsData.items.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>

      {/* Pagination */}
      {postsData.total > filters.pageSize && (
        <div className="flex justify-center gap-3 mt-8">
          {filters.page > 1 && (
            <a
              href={`?${new URLSearchParams({
                ...params,
                page: String(filters.page - 1),
              })}`}
              className="px-4 py-2 rounded-lg glass border border-white/10 text-sm text-gray-300 hover:border-indigo-500/40 transition-colors"
            >
              Previous
            </a>
          )}

          <span className="px-4 py-2 text-sm text-gray-500">
            Page {filters.page} of{" "}
            {Math.ceil(postsData.total / filters.pageSize)}
          </span>

          {postsData.hasMore && (
            <a
              href={`?${new URLSearchParams({
                ...params,
                page: String(filters.page + 1),
              })}`}
              className="px-4 py-2 rounded-lg glass border border-white/10 text-sm text-gray-300 hover:border-indigo-500/40 transition-colors"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}