import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllUsers } from "@/actions/admin";
import { AdminUsersClient } from "@/components/admin/admin-users-client";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "MODERATOR"].includes(session.user.role)) redirect("/dashboard");

  const { users, total, page, hasMore } = await getAllUsers(
    parseInt(searchParams.page || "1"),
    searchParams.search
  );

  return (
    <div className="px-4 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Manage Users</h1>
        <p className="text-gray-500 text-sm mt-1">{total} registered students</p>
      </div>
      <AdminUsersClient users={users as any} total={total} page={page} hasMore={hasMore} />
    </div>
  );
}
