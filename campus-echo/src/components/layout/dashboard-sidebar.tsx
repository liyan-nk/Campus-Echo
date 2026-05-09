"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home, PlusSquare, Bell, Bookmark, User, Settings,
  MessageSquare, Shield, BarChart3, Users, Tag, Megaphone,
  AlertTriangle, LogOut, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAvatarColor } from "@/utils/anonymous";

interface SidebarProps {
  user: {
    id: string;
    email: string;
    role: string;
    anonymousAlias: string;
  };
}

const studentNav = [
  { href: "/dashboard", label: "Feed", icon: Home },
  { href: "/dashboard/create", label: "New Post", icon: PlusSquare },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/dashboard/profile", label: "My Posts", icon: User },
];

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/posts", label: "Posts", icon: MessageSquare },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/moderation", label: "Reports", icon: AlertTriangle },
];

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = ["ADMIN", "MODERATOR"].includes(user.role);

  const navItems = isAdmin ? adminNav : studentNav;

  // Get color from alias
  const colors = ["#6366f1","#8b5cf6","#ec4899","#ef4444","#f97316","#22c55e","#14b8a6","#3b82f6"];
  let hash = 0;
  for (let i = 0; i < user.anonymousAlias.length; i++) hash = user.anonymousAlias.charCodeAt(i) + ((hash << 5) - hash);
  const avatarColor = colors[Math.abs(hash) % colors.length];
  const initials = user.anonymousAlias.slice(0, 2).toUpperCase();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-[#0d0d1a] border-r border-white/5 z-40">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white">Campus Echo</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                  isActive
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/20"
                    : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto text-indigo-400" />}
              </Link>
            );
          })}

          {/* Admin section for students */}
          {!isAdmin && (
            <div className="pt-4 mt-4 border-t border-white/5">
              <p className="text-xs text-gray-600 px-3 mb-2 uppercase tracking-wider">Explore</p>
              <Link
                href="/dashboard/feed?view=trending"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-all"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Trending</span>
              </Link>
            </div>
          )}
        </nav>

        {/* User profile at bottom */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}aa)` }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user.anonymousAlias}</div>
              <div className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-gray-600 hover:text-red-400 transition-colors ml-1"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
