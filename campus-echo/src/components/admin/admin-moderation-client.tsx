"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { resolveReport } from "@/actions/admin";
import { CheckCircle, ExternalLink, AlertTriangle } from "lucide-react";

interface Report {
  id: string;
  reason: string;
  description: string | null;
  isResolved: boolean;
  createdAt: Date;
  reporter: { anonymousAlias: string };
  post: { id: string; title: string } | null;
  comment: { id: string; content: string } | null;
}

export function AdminModerationClient({
  reports: initialReports,
  total,
  page,
  resolved,
}: {
  reports: Report[];
  total: number;
  page: number;
  resolved: boolean;
}) {
  const [reports, setReports] = useState(initialReports);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  async function handleResolve(reportId: string) {
    setResolvingId(reportId);
    const result = await resolveReport(reportId);
    if (result.success) {
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    }
    setResolvingId(null);
  }

  const REASON_LABELS: Record<string, string> = {
    SPAM: "Spam",
    HARASSMENT: "Harassment",
    HATE_SPEECH: "Hate Speech",
    INAPPROPRIATE: "Inappropriate",
    FALSE_INFO: "False Information",
    OTHER: "Other",
  };

  const REASON_COLORS: Record<string, string> = {
    SPAM: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    HARASSMENT: "text-red-400 bg-red-500/10 border-red-500/20",
    HATE_SPEECH: "text-red-400 bg-red-500/10 border-red-500/20",
    INAPPROPRIATE: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    FALSE_INFO: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    OTHER: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  };

  if (reports.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-white font-semibold mb-2">All clear!</h3>
        <p className="text-gray-500 text-sm">
          {resolved ? "No resolved reports to show." : "No open reports. Great moderation!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div key={report.id} className="glass-card p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                  REASON_COLORS[report.reason] || REASON_COLORS.OTHER
                }`}
              >
                {REASON_LABELS[report.reason] || report.reason}
              </span>
              <span className="text-xs text-gray-600">
                Reported by <span className="text-gray-400">{report.reporter.anonymousAlias}</span>
              </span>
              <span className="text-xs text-gray-700">
                {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
              </span>
            </div>
            {!resolved && (
              <button
                onClick={() => handleResolve(report.id)}
                disabled={resolvingId === report.id}
                className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 border border-green-500/20 bg-green-500/10 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {resolvingId === report.id ? "Resolving..." : "Resolve"}
              </button>
            )}
          </div>

          {/* Reported content */}
          {report.post && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 mb-3">
              <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Reported Post:</p>
                <p className="text-sm text-white truncate">{report.post.title}</p>
              </div>
              <Link
                href={`/post/${report.post.id}`}
                className="text-indigo-400 hover:text-indigo-300 flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          )}

          {report.comment && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 mb-3">
              <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Reported Comment:</p>
                <p className="text-sm text-gray-300 line-clamp-2">{report.comment.content}</p>
              </div>
            </div>
          )}

          {report.description && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-1">Additional context:</p>
              <p className="text-sm text-gray-400 italic">&quot;{report.description}&quot;</p>
            </div>
          )}
        </div>
      ))}

      {/* Pagination */}
      <div className="flex justify-between items-center pt-2">
        <p className="text-xs text-gray-600">{total} total reports</p>
        <div className="flex gap-2">
          {page > 1 && (
            <a
              href={`?page=${page - 1}${resolved ? "&resolved=true" : ""}`}
              className="px-3 py-1.5 rounded-lg glass border border-white/10 text-xs text-gray-300"
            >
              Previous
            </a>
          )}
          {reports.length === 20 && (
            <a
              href={`?page=${page + 1}${resolved ? "&resolved=true" : ""}`}
              className="px-3 py-1.5 rounded-lg glass border border-white/10 text-xs text-gray-300"
            >
              Next
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
