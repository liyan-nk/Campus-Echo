import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getNotifications } from "@/actions/notifications";
import { NotificationsClient } from "@/components/notifications/notifications-client";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { notifications, total, unreadCount } = await getNotifications();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-display font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-indigo-400 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
      </div>
      <NotificationsClient notifications={notifications as any} unreadCount={unreadCount} />
    </div>
  );
}
