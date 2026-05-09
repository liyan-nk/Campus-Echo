import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPosts } from "@/actions/posts";
import { prisma } from "@/lib/prisma";
import { AdminPostsClient } from "@/components/admin/admin-posts-client";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string; category?: string; search?: string };
}) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "MODERATOR"].includes(session.user.role)) redirect("/dashboard");

  const page = parseInt(searchParams.page || "1");
  const postsData = await getPosts({
    page,
    pageSize: 20,
    status: searchParams.status,
    categoryId: searchParams.category,
    search: searchParams.search,
    sortBy: "latest",
  });

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="px-4 lg:px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Manage Posts</h1>
          <p className="text-gray-500 text-sm mt-1">{postsData.total} total posts</p>
        </div>
      </div>
      <AdminPostsClient
        initialPosts={postsData.items}
        categories={categories}
        total={postsData.total}
        page={page}
        hasMore={postsData.hasMore}
      />
    </div>
  );
}
