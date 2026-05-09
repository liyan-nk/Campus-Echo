"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChevronUp, ChevronDown, Reply, Trash2, Flag, Loader2, Send } from "lucide-react";
import { createComment, voteOnComment, deleteComment } from "@/actions/comments";
import { cn } from "@/lib/utils";
import type { CommentWithReplies } from "@/types";
import { Button } from "@/components/ui/button";

interface CommentSectionProps {
  postId: string;
  initialComments: CommentWithReplies[];
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  async function handleSubmitComment(parentId?: string) {
    const content = newComment.trim();
    if (!content) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("postId", postId);
    formData.append("content", content);
    formData.append("isAnonymous", String(isAnonymous));
    if (parentId) formData.append("parentId", parentId);

    const result = await createComment(formData);
    if (result.success) {
      setNewComment("");
      setReplyingTo(null);
      // Refresh comments
      window.location.reload();
    }
    setIsSubmitting(false);
  }

  return (
    <div id="comments">
      <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
        {comments.length} Comment{comments.length !== 1 ? "s" : ""}
      </h3>

      {/* New comment form */}
      <div className="glass-card p-4 mb-6">
        <textarea
          placeholder="Share your thoughts anonymously..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          className="w-full bg-transparent border-none text-sm text-white placeholder:text-gray-600 focus:outline-none resize-none"
        />
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAnonymous((prev) => !prev)}
              className={cn(
                "relative w-8 h-4 rounded-full transition-colors",
                isAnonymous ? "bg-indigo-600" : "bg-gray-700"
              )}
            >
              <span className={cn("absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform", isAnonymous && "translate-x-4")} />
            </button>
            <span className="text-xs text-gray-500">Anonymous</span>
          </div>
          <Button
            onClick={() => handleSubmitComment()}
            disabled={isSubmitting || !newComment.trim()}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span className="ml-1.5">Comment</span>
          </Button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 text-sm">No comments yet. Be the first to comment anonymously.</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onReply={() => setReplyingTo(comment.id)}
              replyingTo={replyingTo}
              replyContent={replyingTo === comment.id ? newComment : ""}
              onReplyContentChange={setNewComment}
              onSubmitReply={() => handleSubmitComment(comment.id)}
              isSubmitting={isSubmitting}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: CommentWithReplies;
  postId: string;
  onReply: () => void;
  replyingTo: string | null;
  replyContent: string;
  onReplyContentChange: (v: string) => void;
  onSubmitReply: () => void;
  isSubmitting: boolean;
  isReply?: boolean;
}

function CommentItem({
  comment, postId, onReply, replyingTo, replyContent,
  onReplyContentChange, onSubmitReply, isSubmitting, isReply
}: CommentItemProps) {
  const [votes, setVotes] = useState({ likes: comment.likeCount, dislikes: comment.dislikeCount, userVote: comment.userVote });
  const [deleted, setDeleted] = useState(false);

  const colors = ["#6366f1","#8b5cf6","#ec4899","#ef4444","#f97316","#22c55e"];
  let hash = 0;
  for (let i = 0; i < comment.author.anonymousAlias.length; i++) hash = comment.author.anonymousAlias.charCodeAt(i) + ((hash << 5) - hash);
  const avatarColor = colors[Math.abs(hash) % colors.length];

  if (deleted) return <div className="text-xs text-gray-700 italic pl-4 border-l border-white/5">[deleted]</div>;

  return (
    <div className={cn("", isReply && "ml-6 pl-4 border-l border-white/10")}>
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
            style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}88)` }}
          >
            {comment.author.anonymousAlias.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-xs font-medium text-gray-400">{comment.author.anonymousAlias}</span>
          <span className="text-xs text-gray-700">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>

        <p className="text-sm text-gray-300 leading-relaxed mb-3">{comment.content}</p>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={async () => {
                setVotes((p) => ({ ...p, likes: p.userVote === 1 ? p.likes - 1 : p.likes + 1, userVote: p.userVote === 1 ? null : 1 }));
                await voteOnComment(comment.id, 1);
              }}
              className={cn("flex items-center gap-1 text-xs px-1.5 py-1 rounded transition-colors",
                votes.userVote === 1 ? "text-indigo-400" : "text-gray-600 hover:text-gray-400")}
            >
              <ChevronUp className="w-3 h-3" />
              <span>{votes.likes}</span>
            </button>
            <button
              onClick={async () => {
                setVotes((p) => ({ ...p, dislikes: p.userVote === -1 ? p.dislikes - 1 : p.dislikes + 1, userVote: p.userVote === -1 ? null : -1 }));
                await voteOnComment(comment.id, -1);
              }}
              className={cn("flex items-center gap-1 text-xs px-1.5 py-1 rounded transition-colors",
                votes.userVote === -1 ? "text-red-400" : "text-gray-600 hover:text-gray-400")}
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          {!isReply && (
            <button onClick={onReply} className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-300 transition-colors">
              <Reply className="w-3 h-3" />
              Reply
            </button>
          )}
          <button
            onClick={async () => {
              const result = await deleteComment(comment.id);
              if (result.success) setDeleted(true);
            }}
            className="flex items-center gap-1 text-xs text-gray-700 hover:text-red-400 transition-colors ml-auto"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {/* Reply form */}
        {replyingTo === comment.id && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => onReplyContentChange(e.target.value)}
              rows={2}
              className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none border border-white/10"
            />
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={onSubmitReply} disabled={isSubmitting || !replyContent.trim()} className="bg-indigo-600 text-white h-7 text-xs">
                Reply
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onReplyContentChange("")} className="text-gray-500 h-7 text-xs">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onReply={onReply}
              replyingTo={replyingTo}
              replyContent={replyContent}
              onReplyContentChange={onReplyContentChange}
              onSubmitReply={onSubmitReply}
              isSubmitting={isSubmitting}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}
