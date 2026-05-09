import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminAnnouncementsClient } from "@/components/admin/admin-announcements-client";

export default async function AdminAnnouncementsPage() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "MODERATOR"].includes(session.user.role)) redirect("/dashboard");

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="px-4 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Announcements</h1>
        <p className="text-gray-500 text-sm mt-1">Broadcast messages to all students</p>
      </div>
      <AdminAnnouncementsClient announcements={announcements as any} />
    </div>
  );
}
