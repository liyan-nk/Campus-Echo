import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { StatusBadge } from "@/components/posts/status-badge";
import type { PostWithRelations } from "@/types";

export function RecentPostsTable({ posts }: { posts: PostWithRelations[] }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5">
        <h3 className="text-sm font-semibold text-white">Recent Posts</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs text-gray-600 font-medium px-5 py-3">Post</th>
              <th className="text-left text-xs text-gray-600 font-medium px-5 py-3 hidden md:table-cell">Category</th>
              <th className="text-left text-xs text-gray-600 font-medium px-5 py-3 hidden lg:table-cell">Author</th>
              <th className="text-left text-xs text-gray-600 font-medium px-5 py-3">Status</th>
              <th className="text-left text-xs text-gray-600 font-medium px-5 py-3 hidden md:table-cell">Time</th>
              <th className="text-left text-xs text-gray-600 font-medium px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-5 py-3">
                  <p className="text-sm text-white truncate max-w-[200px]">{post.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{post.type}</p>
                </td>
                <td className="px-5 py-3 hidden md:table-cell">
                  <span
                    className="text-xs px-2 py-1 rounded-md"
                    style={{
                      background: `${post.category.color}20`,
                      color: post.category.color,
                    }}
                  >
                    {post.category.name}
                  </span>
                </td>
                <td className="px-5 py-3 hidden lg:table-cell">
                  <span className="text-xs text-gray-500">{post.author.anonymousAlias}</span>
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={post.status} />
                </td>
                <td className="px-5 py-3 hidden md:table-cell">
                  <span className="text-xs text-gray-600">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <Link
                    href={`/post/${post.id}`}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && (
          <div className="text-center py-12 text-gray-600 text-sm">No posts yet</div>
        )}
      </div>
    </div>
  );
}
