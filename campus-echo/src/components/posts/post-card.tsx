"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, ThumbsDown, MessageSquare, Bookmark, BookmarkCheck, MoreHorizontal, Flag, Trash2, Paperclip } from "lucide-react";
import { voteOnPost, toggleBookmark, deletePost, reportPost } from "@/actions/posts";
import { cn } from "@/lib/utils";
import type { PostWithRelations } from "@/types";

const TYPE_STYLES: Record<string, string> = {
  COMPLAINT: "badge-complaint",
  SUGGESTION: "badge-suggestion",
  FEEDBACK: "badge-feedback",
  CONFESSION: "badge-confession",
  POLL: "badge-poll",
  URGENT: "badge-urgent",
};
const STATUS_STYLES: Record<string, string> = {
  PENDING: "status-pending",
  UNDER_REVIEW: "status-under-review",
  IN_PROGRESS: "status-in-progress",
  RESOLVED: "status-resolved",
  REJECTED: "status-rejected",
};

export function PostCard({ post, currentUserId }: { post: PostWithRelations; currentUserId?: string }) {
  const [isPending, startTransition] = useTransition();
  const [vote, setVote] = useState(post.userVote ?? null);
  const [upvotes, setUpvotes] = useState(post.upvoteCount);
  const [downvotes, setDownvotes] = useState(post.downvoteCount);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked ?? false);
  const [showMenu, setShowMenu] = useState(false);
  const [toast, setToast] = useState("");

  const COLORS = ["#6366f1","#8b5cf6","#ec4899","#ef4444","#f97316","#22c55e","#14b8a6","#3b82f6"];
  const alias = post.author?.anonymousAlias || "Echo#0000";
  let h = 0;
  for (let i = 0; i < alias.length; i++) h = alias.charCodeAt(i) + ((h << 5) - h);
  const avatarColor = COLORS[Math.abs(h) % COLORS.length];

  function handleVote(val: 1 | -1) {
    const prev = { vote, upvotes, downvotes };
    if (vote === val) {
      setVote(null);
      val === 1 ? setUpvotes(v => v-1) : setDownvotes(v => v-1);
    } else {
      if (vote !== null) { vote === 1 ? setUpvotes(v => v-1) : setDownvotes(v => v-1); }
      setVote(val);
      val === 1 ? setUpvotes(v => v+1) : setDownvotes(v => v+1);
    }
    startTransition(async () => {
      const r = await voteOnPost(post.id, val);
      if (!r.success) { setVote(prev.vote); setUpvotes(prev.upvotes); setDownvotes(prev.downvotes); }
    });
  }

  function handleBookmark() {
    setBookmarked(b => !b);
    startTransition(async () => { await toggleBookmark(post.id); });
  }

  function handleDelete() {
    if (!confirm("Delete this post?")) return;
    startTransition(async () => { await deletePost(post.id); });
  }

  function handleReport() {
    startTransition(async () => { await reportPost(post.id, "INAPPROPRIATE"); });
    setShowMenu(false);
    setToast("Reported. Thank you.");
    setTimeout(() => setToast(""), 3000);
  }

  return (
    <article className="glass-card p-5 hover:border-white/12 transition-all duration-300 group relative">
      {toast && <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full z-10">{toast}</div>}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
          style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}99)` }}>
          {alias.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-300">{alias}</span>
            <span className="text-gray-600 text-xs">·</span>
            <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", TYPE_STYLES[post.type] || "badge-feedback")}>{post.type}</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full", STATUS_STYLES[post.status] || "status-pending")}>{post.status.replace(/_/g, " ")}</span>
          </div>
          <span className="text-xs font-medium px-1.5 py-0.5 rounded mt-0.5 inline-block"
            style={{ color: post.category.color, background: `${post.category.color}15` }}>{post.category.name}</span>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="text-gray-600 hover:text-gray-300 opacity-0 group-hover:opacity-100 p-1 rounded">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-7 z-10 glass-card border border-white/10 w-40 py-1 shadow-xl">
              {currentUserId === post.author?.id && (
                <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 w-full">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
              <button onClick={handleReport} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:bg-white/5 w-full">
                <Flag className="w-3.5 h-3.5" /> Report
              </button>
            </div>
          )}
        </div>
      </div>

      <Link href={`/post/${post.id}`} className="block">
        <h2 className="text-white font-semibold text-base mb-2 hover:text-indigo-300 transition-colors line-clamp-2">{post.title}</h2>
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{post.content}</p>
      </Link>

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.tags.slice(0, 4).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500">#{tag}</span>
          ))}
        </div>
      )}
      {post.attachments.length > 0 && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
          <Paperclip className="w-3 h-3" />{post.attachments.length} attachment{post.attachments.length > 1 ? "s" : ""}
        </div>
      )}

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
        <button onClick={() => handleVote(1)} disabled={isPending}
          className={cn("flex items-center gap-1.5 text-sm transition-colors", vote === 1 ? "text-indigo-400" : "text-gray-500 hover:text-indigo-400")}>
          <ThumbsUp className="w-4 h-4" />{upvotes}
        </button>
        <button onClick={() => handleVote(-1)} disabled={isPending}
          className={cn("flex items-center gap-1.5 text-sm transition-colors", vote === -1 ? "text-red-400" : "text-gray-500 hover:text-red-400")}>
          <ThumbsDown className="w-4 h-4" />{downvotes}
        </button>
        <Link href={`/post/${post.id}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors">
          <MessageSquare className="w-4 h-4" />{post._count.comments}
        </Link>
        <div className="flex-1" />
        <button onClick={handleBookmark} disabled={isPending}
          className={cn("transition-colors", bookmarked ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400")}>
          {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>
    </article>
  );
}
