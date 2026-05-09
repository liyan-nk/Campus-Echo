import { MessageSquare, Users, CheckCircle, AlertTriangle, TrendingUp, Clock, BarChart3, Activity } from "lucide-react";
import type { DashboardStats } from "@/types";

interface AdminStatsCardsProps {
  stats: DashboardStats;
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const cards = [
    {
      title: "Total Posts",
      value: stats.totalPosts.toLocaleString(),
      icon: MessageSquare,
      color: "from-indigo-500 to-purple-600",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      title: "Pending Review",
      value: stats.pendingPosts.toLocaleString(),
      icon: Clock,
      color: "from-yellow-500 to-orange-600",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
    {
      title: "Resolved",
      value: stats.resolvedPosts.toLocaleString(),
      icon: CheckCircle,
      color: "from-green-500 to-emerald-600",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
    {
      title: "Total Students",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "from-blue-500 to-cyan-600",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "Active Students",
      value: stats.activeUsers.toLocaleString(),
      subtitle: "Last 30 days",
      icon: Activity,
      color: "from-purple-500 to-pink-600",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      title: "Total Comments",
      value: stats.totalComments.toLocaleString(),
      icon: MessageSquare,
      color: "from-cyan-500 to-blue-600",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    {
      title: "Open Reports",
      value: stats.reportsPending.toLocaleString(),
      icon: AlertTriangle,
      color: "from-red-500 to-orange-600",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
    {
      title: "Resolution Rate",
      value: `${stats.resolutionRate}%`,
      icon: TrendingUp,
      color: "from-green-400 to-teal-600",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.title} className={`glass-card p-4 border ${card.border}`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-display font-bold text-white mb-1">{card.value}</div>
          <div className="text-xs text-gray-500">{card.title}</div>
          {card.subtitle && <div className="text-xs text-gray-700 mt-0.5">{card.subtitle}</div>}
        </div>
      ))}
    </div>
  );
}
