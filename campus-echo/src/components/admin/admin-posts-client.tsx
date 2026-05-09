"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { updatePostStatus, deletePost } from "@/actions/posts";
import { StatusBadge } from "@/components/posts/status-badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Loader, AlertCircle, Trash2, Eye, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostWithRelations } from "@/types";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending", icon: Clock },
  { value: "UNDER_REVIEW", label: "Under Review", icon: Loader },
  { value: "IN_PROGRESS", label: "In Progress", icon: AlertCircle },
  { value: "RESOLVED", label: "Resolved", icon: CheckCircle },
  { value: "REJECTED", label: "Rejected", icon: XCircle },
];

interface AdminPostsClientProps {
  initialPosts: PostWithRelations[];
  categories: { id: string; name: string; color: string }[];
  total: number;
  page: number;
  hasMore: boolean;
}

export function AdminPostsClient({ initialPosts, categories, total, page, hasMore }: AdminPostsClientProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showResponseModal, setShowResponseModal] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  async function handleStatusChange(postId: string, status: string, note?: string) {
    setUpdatingId(postId);
    const result = await updatePostStatus(postId, status, note);
    if (result.success) {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, status: status as any } : p))
      );
    }
    setUpdatingId(null);
    setShowResponseModal(null);
    setAdminNote("");
  }

  async function handleDelete(postId: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const result = await deletePost(postId);
    if (result.success) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {["", "PENDING", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"].map((s) => (
          <a
            key={s}
            href={s ? `?status=${s}` : "?"}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border",
              !s && "bg-indigo-600/20 text-indigo-300 border-indigo-500/30"
            )}
            style={!s ? {} : {}}
          >
            {s || "All Posts"}
          </a>
        ))}
      </div>

      {/* Posts table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-gray-600 px-5 py-3 font-medium">Post</th>
                <th className="text-left text-xs text-gray-600 px-5 py-3 font-medium hidden md:table-cell">Category</th>
                <th className="text-left text-xs text-gray-600 px-5 py-3 font-medium">Status</th>
                <th className="text-left text-xs text-gray-600 px-5 py-3 font-medium hidden lg:table-cell">Votes</th>
                <th className="text-left text-xs text-gray-600 px-5 py-3 font-medium hidden md:table-cell">Date</th>
                <th className="text-left text-xs text-gray-600 px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/post/${post.id}`} className="group">
                      <p className="text-sm text-white group-hover:text-indigo-300 transition-colors truncate max-w-[180px]">
                        {post.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">{post.author?.anonymousAlias}</p>
                    </Link>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span
                      className="text-xs px-2 py-1 rounded-md"
                      style={{ background: `${post.category.color}20`, color: post.category.color }}
                    >
                      {post.category.name}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={post.status}
                      onChange={(e) => {
                        if (e.target.value === "RESOLVED" || e.target.value === "REJECTED") {
                          setShowResponseModal(post.id);
                          setSelectedStatus(e.target.value);
                        } else {
                          handleStatusChange(post.id, e.target.value);
                        }
                      }}
                      disabled={updatingId === post.id}
                      className="text-xs bg-transparent border border-white/10 rounded-md px-2 py-1 text-gray-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value} className="bg-gray-900">
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <span className="text-xs text-gray-500">↑{post.upvoteCount} ↓{post.downvoteCount}</span>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className="text-xs text-gray-600">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/post/${post.id}`}>
                        <button className="p-1.5 rounded-md text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 rounded-md text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {posts.length === 0 && (
            <div className="text-center py-12 text-gray-600 text-sm">No posts found</div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-xs text-gray-600">{total} total posts</p>
        <div className="flex gap-2">
          {page > 1 && (
            <a href={`?page=${page - 1}`} className="px-3 py-1.5 rounded-lg glass border border-white/10 text-xs text-gray-300">
              Previous
            </a>
          )}
          {hasMore && (
            <a href={`?page=${page + 1}`} className="px-3 py-1.5 rounded-lg glass border border-white/10 text-xs text-gray-300">
              Next
            </a>
          )}
        </div>
      </div>

      {/* Response modal */}
      {showResponseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card p-6 w-full max-w-md">
            <h3 className="text-lg font-display font-bold text-white mb-4">
              {selectedStatus === "RESOLVED" ? "Mark as Resolved" : "Reject Post"}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Add an optional message for the student:
            </p>
            <textarea
              rows={4}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Explain the decision (optional but recommended)..."
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 resize-none mb-4"
            />
            <div className="flex gap-3">
              <Button
                onClick={() => handleStatusChange(showResponseModal, selectedStatus, adminNote)}
                className={`flex-1 ${selectedStatus === "RESOLVED" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white`}
              >
                Confirm
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowResponseModal(null); setAdminNote(""); }}
                className="border-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
