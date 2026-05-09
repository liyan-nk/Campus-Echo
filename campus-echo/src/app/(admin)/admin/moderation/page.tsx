import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getReports } from "@/actions/admin";
import { AdminModerationClient } from "@/components/admin/admin-moderation-client";

export default async function AdminModerationPage({
  searchParams,
}: {
  searchParams: { page?: string; resolved?: string };
}) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "MODERATOR"].includes(session.user.role)) redirect("/dashboard");

  const resolved = searchParams.resolved === "true";
  const { reports, total, page } = await getReports(parseInt(searchParams.page || "1"), resolved);

  return (
    <div className="px-4 lg:px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Moderation Queue</h1>
          <p className="text-gray-500 text-sm mt-1">{total} {resolved ? "resolved" : "open"} reports</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/admin/moderation"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              !resolved
                ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/30"
                : "bg-white/5 text-gray-500 border-white/10 hover:border-white/20"
            }`}
          >
            Open
          </a>
          <a
            href="/admin/moderation?resolved=true"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              resolved
                ? "bg-green-600/20 text-green-300 border-green-500/30"
                : "bg-white/5 text-gray-500 border-white/10 hover:border-white/20"
            }`}
          >
            Resolved
          </a>
        </div>
      </div>
      <AdminModerationClient reports={reports as any} total={total} page={page} resolved={resolved} />
    </div>
  );
}
