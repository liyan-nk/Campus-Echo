import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardStats, getCategoryStats, getDailyActivity } from "@/actions/admin";
import { prisma } from "@/lib/prisma";
import { AdminStatsCards } from "@/components/admin/admin-stats-cards";
import { AdminCharts } from "@/components/admin/admin-charts";
import { RecentPostsTable } from "@/components/admin/recent-posts-table";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "MODERATOR"].includes(session.user.role)) redirect("/dashboard");

  const [stats, categoryStats, dailyActivity, recentPosts] = await Promise.all([
    getDashboardStats(),
    getCategoryStats(),
    getDailyActivity(7),
    prisma.post.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        author: { select: { anonymousAlias: true } },
        _count: { select: { comments: true } },
      },
    }),
  ]);

  return (
    <div className="px-4 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of campus feedback activity</p>
      </div>

      <AdminStatsCards stats={stats} />

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <AdminCharts dailyActivity={dailyActivity} categoryStats={categoryStats} />
      </div>

      <div className="mt-6">
        <RecentPostsTable posts={recentPosts as any} />
      </div>
    </div>
  );
}
