import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/posts/post-card";
import { Bookmark } from "lucide-react";

export default async function BookmarksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        include: {
          category: true,
          author: { select: { anonymousAlias: true, id: true } },
          attachments: true,
          adminResponses: true,
          _count: { select: { comments: true, votes: true } },
        },
      },
    },
  });

  const posts = bookmarks.map((b) => ({
    ...b.post,
    isBookmarked: true,
    userVote: null,
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-6">
      <div className="mb-6">
        <h1 className="text-xl font-display font-bold text-white">Bookmarks</h1>
        <p className="text-gray-500 text-sm mt-1">{posts.length} saved posts</p>
      </div>

      {posts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-white font-semibold mb-2">No bookmarks yet</h3>
          <p className="text-gray-500 text-sm">Posts you bookmark will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post as any} />
          ))}
        </div>
      )}
    </div>
  );
}
