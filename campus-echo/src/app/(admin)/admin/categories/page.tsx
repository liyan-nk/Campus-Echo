import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminCategoriesClient } from "@/components/admin/admin-categories-client";

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "MODERATOR"].includes(session.user.role)) redirect("/dashboard");

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div className="px-4 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Categories</h1>
        <p className="text-gray-500 text-sm mt-1">Manage post categories</p>
      </div>
      <AdminCategoriesClient categories={categories as any} />
    </div>
  );
}
