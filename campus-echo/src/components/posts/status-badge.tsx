import { Clock, Loader, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { style: string; icon: any; label: string }> = {
  PENDING: { style: "bg-gray-500/15 text-gray-400 border-gray-500/20", icon: Clock, label: "Pending" },
  UNDER_REVIEW: { style: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20", icon: Loader, label: "Under Review" },
  IN_PROGRESS: { style: "bg-blue-500/15 text-blue-400 border-blue-500/20", icon: AlertCircle, label: "In Progress" },
  RESOLVED: { style: "bg-green-500/15 text-green-400 border-green-500/20", icon: CheckCircle, label: "Resolved" },
  REJECTED: { style: "bg-red-500/15 text-red-400 border-red-500/20", icon: XCircle, label: "Rejected" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border", config.style)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
