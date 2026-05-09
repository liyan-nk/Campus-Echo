"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Bookmark, Flag, Share2 } from "lucide-react";
import { voteOnPost, toggleBookmark, reportPost } from "@/actions/posts";
import { cn } from "@/lib/utils";
import type { PostWithRelations } from "@/types";

export function PostActions({ post }: { post: PostWithRelations }) {
  const [votes, setVotes] = useState({
    upvotes: post.upvoteCount,
    downvotes: post.downvoteCount,
    userVote: post.userVote ?? null,
  });
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked ?? false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reported, setReported] = useState(false);

  async function handleVote(value: 1 | -1) {
    setVotes((prev) => {
      const removing = prev.userVote === value;
      return {
        upvotes: value === 1 ? (removing ? prev.upvotes - 1 : prev.upvotes + 1) : prev.userVote === 1 ? prev.upvotes - 1 : prev.upvotes,
        downvotes: value === -1 ? (removing ? prev.downvotes - 1 : prev.downvotes + 1) : prev.userVote === -1 ? prev.downvotes - 1 : prev.downvotes,
        userVote: removing ? null : value,
      };
    });
    await voteOnPost(post.id, value);
  }

  async function handleBookmark() {
    setIsBookmarked((prev) => !prev);
    await toggleBookmark(post.id);
  }

  async function handleReport() {
    if (!reportReason) return;
    await reportPost(post.id, reportReason);
    setReported(true);
    setShowReport(false);
  }

  return (
    <div className="mt-4 pt-4 border-t border-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Votes */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
            <button
              onClick={() => handleVote(1)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all",
                votes.userVote === 1 ? "bg-indigo-500/20 text-indigo-400" : "text-gray-500 hover:text-white"
              )}
            >
              <ChevronUp className="w-4 h-4" />
              <span className="font-medium">{votes.upvotes}</span>
            </button>
            <div className="w-px h-5 bg-white/10" />
            <button
              onClick={() => handleVote(-1)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all",
                votes.userVote === -1 ? "bg-red-500/20 text-red-400" : "text-gray-500 hover:text-white"
              )}
            >
              <ChevronDown className="w-4 h-4" />
              <span className="font-medium">{votes.downvotes}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBookmark}
            className={cn(
              "p-2 rounded-lg border transition-all",
              isBookmarked
                ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400"
                : "bg-white/5 border-white/10 text-gray-500 hover:text-white"
            )}
          >
            <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
          </button>

          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-500 hover:text-white transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {!reported ? (
            <button
              onClick={() => setShowReport(!showReport)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-500 hover:text-red-400 transition-colors"
            >
              <Flag className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-xs text-gray-600 px-2">Reported</span>
          )}
        </div>
      </div>

      {showReport && (
        <div className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
          <p className="text-xs text-red-400 font-medium mb-2">Report this post</p>
          <select
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-md text-xs text-gray-300 mb-2 focus:outline-none"
          >
            <option value="" className="bg-gray-900">Select reason...</option>
            <option value="SPAM" className="bg-gray-900">Spam</option>
            <option value="HARASSMENT" className="bg-gray-900">Harassment</option>
            <option value="HATE_SPEECH" className="bg-gray-900">Hate Speech</option>
            <option value="INAPPROPRIATE" className="bg-gray-900">Inappropriate</option>
            <option value="FALSE_INFO" className="bg-gray-900">False Information</option>
            <option value="OTHER" className="bg-gray-900">Other</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleReport} className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700">
              Submit
            </button>
            <button onClick={() => setShowReport(false)} className="px-3 py-1 text-gray-500 text-xs hover:text-gray-300">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
