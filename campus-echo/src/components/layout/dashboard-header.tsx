"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Bell, Search, Menu, X, Home, PlusSquare, Bookmark,
  User, BarChart3, MessageSquare, Users, Tag, Megaphone,
  AlertTriangle, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  user: {
    id: string;
    email: string;
    role: string;
    anonymousAlias: string;
  };
}

export function DashboardHeader({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = ["ADMIN", "MODERATOR"].includes(user.role);

  const colors = ["#6366f1","#8b5cf6","#ec4899","#ef4444","#f97316","#22c55e","#14b8a6","#3b82f6"];
  let hash = 0;
  for (let i = 0; i < user.anonymousAlias.length; i++) hash = user.anonymousAlias.charCodeAt(i) + ((hash << 5) - hash);
  const avatarColor = colors[Math.abs(hash) % colors.length];

  const mobileNav = isAdmin
    ? [
        { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
        { href: "/admin/posts", label: "Posts", icon: MessageSquare },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/categories", label: "Categories", icon: Tag },
        { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
        { href: "/admin/moderation", label: "Reports", icon: AlertTriangle },
      ]
    : [
        { href: "/dashboard", label: "Feed", icon: Home },
        { href: "/dashboard/create", label: "New Post", icon: PlusSquare },
        { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
        { href: "/dashboard/bookmarks", label: "Bookmarks", icon: Bookmark },
        { href: "/dashboard/profile", label: "My Posts", icon: User },
      ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#080810]/90 backdrop-blur-xl border-b border-white/5 px-4 lg:px-6 h-14 flex items-center gap-4">
        <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link href="/dashboard" className="lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-white text-sm">Campus Echo</span>
        </Link>
        <div className="flex-1" />
        <Link href="/dashboard/notifications">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white w-8 h-8">
            <Bell className="w-4 h-4" />
          </Button>
        </Link>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}99)` }}
          title={user.anonymousAlias}
        >
          {user.anonymousAlias.slice(0, 2).toUpperCase()}
        </div>
      </header>
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-[#080810]/95 backdrop-blur-xl pt-14">
          <nav className="p-4 space-y-1">
            {mobileNav.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}
                className={cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all",
                  pathname === item.href ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/20" : "text-gray-400 hover:text-white hover:bg-white/5"
                )}>
                <item.icon className="w-5 h-5" />{item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10">
              <button onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full">
                <LogOut className="w-5 h-5" />Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
