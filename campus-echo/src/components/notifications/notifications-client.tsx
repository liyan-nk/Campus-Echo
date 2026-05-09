"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { markNotificationRead, markAllNotificationsRead } from "@/actions/notifications";
import { Bell, CheckCheck, Shield, MessageSquare, TrendingUp, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  post: { id: string; title: string } | null;
}

const TYPE_ICONS: Record<string, any> = {
  STATUS_CHANGE: TrendingUp,
  COMMENT_REPLY: MessageSquare,
  ANNOUNCEMENT: Megaphone,
  MODERATION_ACTION: Shield,
  ADMIN_RESPONSE: Shield,
  VOTE_MILESTONE: TrendingUp,
};

const TYPE_COLORS: Record<string, string> = {
  STATUS_CHANGE: "text-blue-400 bg-blue-500/10",
  COMMENT_REPLY: "text-purple-400 bg-purple-500/10",
  ANNOUNCEMENT: "text-indigo-400 bg-indigo-500/10",
  MODERATION_ACTION: "text-red-400 bg-red-500/10",
  ADMIN_RESPONSE: "text-green-400 bg-green-500/10",
  VOTE_MILESTONE: "text-yellow-400 bg-yellow-500/10",
};

export function NotificationsClient({
  notifications: initial,
  unreadCount: initialUnread,
}: {
  notifications: Notification[];
  unreadCount: number;
}) {
  const [notifications, setNotifications] = useState(initial);
  const [unreadCount, setUnreadCount] = useState(initialUnread);

  async function handleRead(id: string) {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }

  async function handleMarkAll() {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  if (notifications.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-white font-semibold mb-2">No notifications</h3>
        <p className="text-gray-500 text-sm">You&apos;re all caught up!</p>
      </div>
    );
  }

  return (
    <div>
      {unreadCount > 0 && (
        <div className="flex justify-end mb-3">
          <button
            onClick={handleMarkAll}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-400 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all as read
          </button>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((notification) => {
          const Icon = TYPE_ICONS[notification.type] || Bell;
          const colorClass = TYPE_COLORS[notification.type] || "text-gray-400 bg-gray-500/10";

          return (
            <div
              key={notification.id}
              className={cn(
                "glass-card p-4 transition-all cursor-pointer",
                !notification.isRead && "border-indigo-500/20 bg-indigo-500/5"
              )}
              onClick={() => !notification.isRead && handleRead(notification.id)}
            >
              <div className="flex items-start gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", colorClass)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-white">{notification.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-600">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notification.message}</p>
                  {notification.post && (
                    <Link
                      href={`/post/${notification.post.id}`}
                      className="text-xs text-indigo-400 hover:text-indigo-300 mt-1.5 inline-block transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View post →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
