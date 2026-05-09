import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/posts/post-card";
import { StatusBadge } from "@/components/posts/status-badge";
import { User, MessageSquare, TrendingUp, CheckCircle } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, posts, stats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        _count: {
          select: { posts: true, comments: true, bookmarks: true },
        },
      },
    }),
    prisma.post.findMany({
      where: { authorId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        author: { select: { anonymousAlias: true, id: true } },
        attachments: true,
        adminResponses: true,
        _count: { select: { comments: true, votes: true } },
      },
    }),
    prisma.post.groupBy({
      by: ["status"],
      where: { authorId: session.user.id },
      _count: true,
    }),
  ]);

  const statusCounts = stats.reduce(
    (acc, s) => ({ ...acc, [s.status]: s._count }),
    {} as Record<string, number>
  );

  const totalVotes = await prisma.vote.count({
    where: { postRef: { authorId: session.user.id }, value: 1 },
  });

  const colors = ["#6366f1","#8b5cf6","#ec4899","#ef4444","#f97316","#22c55e"];
  let hash = 0;
  for (let i = 0; i < session.user.anonymousAlias.length; i++) hash = session.user.anonymousAlias.charCodeAt(i) + ((hash << 5) - hash);
  const avatarColor = colors[Math.abs(hash) % colors.length];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-6">
      {/* Profile header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
            style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}88)` }}
          >
            {session.user.anonymousAlias.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">{session.user.anonymousAlias}</h1>
            <p className="text-sm text-gray-500 capitalize">{session.user.role.toLowerCase()} · Anonymous</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-green-400">Active</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Posts", value: user?._count.posts || 0, icon: MessageSquare },
            { label: "Comments", value: user?._count.comments || 0, icon: MessageSquare },
            { label: "Upvotes", value: totalVotes, icon: TrendingUp },
            { label: "Saved", value: user?._count.bookmarks || 0, icon: CheckCircle },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-lg font-display font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Status breakdown */}
      {posts.length > 0 && (
        <div className="glass-card p-4 mb-6">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Post Status Breakdown</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <StatusBadge status={status} />
                <span className="text-xs text-gray-500">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">My Posts</h2>

      {posts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <User className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">You haven&apos;t posted anything yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={{ ...post, userVote: null, isBookmarked: false } as any} />
          ))}
        </div>
      )}
    </div>
  );
}
