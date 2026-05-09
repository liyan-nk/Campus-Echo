import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { getPostById } from "@/actions/posts";
import { getComments } from "@/actions/comments";
import { PostActions } from "@/components/posts/post-actions";
import { CommentSection } from "@/components/comments/comment-section";
import { StatusBadge } from "@/components/posts/status-badge";
import { AdminResponseCard } from "@/components/posts/admin-response-card";
import { Eye, Tag } from "lucide-react";

export default async function PostPage({ params }: { params: { id: string } }) {
  const [post, comments] = await Promise.all([
    getPostById(params.id),
    getComments(params.id),
  ]);

  if (!post) notFound();

  const colors = ["#6366f1","#8b5cf6","#ec4899","#ef4444","#f97316","#22c55e"];
  let hash = 0;
  for (let i = 0; i < post.author.anonymousAlias.length; i++) hash = post.author.anonymousAlias.charCodeAt(i) + ((hash << 5) - hash);
  const avatarColor = colors[Math.abs(hash) % colors.length];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-6">
      <article className="glass-card p-6 mb-6">
        {/* Author & Meta */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}88)` }}
          >
            {post.author.anonymousAlias.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium text-white">{post.author.anonymousAlias}</div>
            <div className="text-xs text-gray-600">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <span
              className="text-xs px-2.5 py-1 rounded-md"
              style={{
                background: `${post.category.color}20`,
                color: post.category.color,
                border: `1px solid ${post.category.color}30`,
              }}
            >
              {post.category.name}
            </span>
            <StatusBadge status={post.status} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-display font-bold text-white mb-3 leading-snug">{post.title}</h1>

        {/* Content */}
        <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-5">{post.content}</div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            <Tag className="w-3.5 h-3.5 text-gray-600 mt-0.5" />
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-gray-500 border border-white/5">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Attachments */}
        {post.attachments.length > 0 && (
          <div className="mb-5">
            <p className="text-xs text-gray-600 mb-2">Attachments</p>
            <div className="flex flex-wrap gap-2">
              {post.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:border-indigo-500/40 transition-colors"
                >
                  {att.mimeType.startsWith("image/") ? "🖼️" : "📄"}
                  <span className="truncate max-w-[120px]">{att.filename}</span>
                </a>
              ))}
            </div>

            {/* Image previews */}
            <div className="flex flex-wrap gap-2 mt-3">
              {post.attachments
                .filter((a) => a.mimeType.startsWith("image/"))
                .map((att) => (
                  <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={att.url}
                      alt="Attachment"
                      className="w-24 h-24 object-cover rounded-lg border border-white/10 hover:opacity-90 transition-opacity"
                    />
                  </a>
                ))}
            </div>
          </div>
        )}

        {/* Poll */}
        {post.pollOptions && post.pollOptions.length > 0 && (
          <div className="mb-5 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm font-semibold text-white mb-3">📊 Poll</p>
            <div className="space-y-2">
              {post.pollOptions.map((option) => {
                const total = post.pollOptions!.reduce((s, o) => s + o.votes, 0);
                const pct = total > 0 ? Math.round((option.votes / total) * 100) : 0;
                return (
                  <div key={option.id} className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{option.text}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-gray-600 mt-2">
                {post.pollOptions.reduce((s, o) => s + o.votes, 0)} total votes
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-600 pt-3 border-t border-white/5">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {post.viewCount} views
          </span>
          <span>{post._count.comments} comments</span>
          <span>{post.upvoteCount} upvotes</span>
        </div>

        {/* Post Actions (vote, bookmark, report) */}
        <PostActions post={post} />
      </article>

      {/* Admin Responses */}
      {post.adminResponses && post.adminResponses.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Official Responses</h3>
          {post.adminResponses.map((response: any) => (
            <AdminResponseCard key={response.id} response={response} />
          ))}
        </div>
      )}

      {/* Comments */}
      <CommentSection postId={post.id} initialComments={comments} />
    </div>
  );
}
