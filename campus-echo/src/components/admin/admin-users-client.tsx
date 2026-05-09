"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { banUser, unbanUser } from "@/actions/admin";
import { Shield, Ban, CheckCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  anonymousAlias: string;
  role: string;
  isBanned: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  _count: { posts: number; comments: number };
}

export function AdminUsersClient({
  users: initialUsers,
  total,
  page,
  hasMore,
}: {
  users: User[];
  total: number;
  page: number;
  hasMore: boolean;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [actionId, setActionId] = useState<string | null>(null);
  const [showBanModal, setShowBanModal] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");
  const [search, setSearch] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/admin/users?search=${encodeURIComponent(search)}`);
  }

  async function handleBan(userId: string) {
    if (!banReason.trim()) return;
    setActionId(userId);
    const result = await banUser(userId, banReason);
    if (result.success) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isBanned: true } : u)));
    }
    setActionId(null);
    setShowBanModal(null);
    setBanReason("");
  }

  async function handleUnban(userId: string) {
    setActionId(userId);
    const result = await unbanUser(userId);
    if (result.success) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isBanned: false } : u)));
    }
    setActionId(null);
  }

  const colors = ["#6366f1","#8b5cf6","#ec4899","#ef4444","#f97316","#22c55e"];

  return (
    <div>
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or alias..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <Button type="submit" size="sm" className="bg-indigo-600 text-white">Search</Button>
      </form>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-gray-600 px-5 py-3 font-medium">User</th>
                <th className="text-left text-xs text-gray-600 px-5 py-3 font-medium hidden md:table-cell">Email</th>
                <th className="text-left text-xs text-gray-600 px-5 py-3 font-medium">Posts</th>
                <th className="text-left text-xs text-gray-600 px-5 py-3 font-medium hidden lg:table-cell">Joined</th>
                <th className="text-left text-xs text-gray-600 px-5 py-3 font-medium">Status</th>
                <th className="text-left text-xs text-gray-600 px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                let hash = 0;
                for (let i = 0; i < user.anonymousAlias.length; i++) hash = user.anonymousAlias.charCodeAt(i) + ((hash << 5) - hash);
                const avatarColor = colors[Math.abs(hash) % colors.length];

                return (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}88)` }}
                        >
                          {user.anonymousAlias.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm text-white">{user.anonymousAlias}</p>
                          <p className="text-xs text-gray-600 capitalize">{user.role.toLowerCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-gray-400">{user._count.posts}</span>
                      <span className="text-xs text-gray-600 ml-1">/ {user._count.comments}c</span>
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <span className="text-xs text-gray-600">
                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {user.isBanned ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">Banned</span>
                      ) : user.emailVerified ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">Active</span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">Unverified</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {user.isBanned ? (
                        <button
                          onClick={() => handleUnban(user.id)}
                          disabled={actionId === user.id}
                          className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowBanModal(user.id)}
                          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Ban
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-gray-600 text-sm">No users found</div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-xs text-gray-600">{total} total users</p>
        <div className="flex gap-2">
          {page > 1 && (
            <a href={`?page=${page - 1}`} className="px-3 py-1.5 rounded-lg glass border border-white/10 text-xs text-gray-300">
              Previous
            </a>
          )}
          {hasMore && (
            <a href={`?page=${page + 1}`} className="px-3 py-1.5 rounded-lg glass border border-white/10 text-xs text-gray-300">
              Next
            </a>
          )}
        </div>
      </div>

      {/* Ban modal */}
      {showBanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card p-6 w-full max-w-md">
            <h3 className="text-lg font-display font-bold text-white mb-2">Ban User</h3>
            <p className="text-sm text-gray-400 mb-4">This user will be prevented from posting or commenting.</p>
            <textarea
              rows={3}
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Reason for ban (required)..."
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 resize-none mb-4"
            />
            <div className="flex gap-3">
              <Button
                onClick={() => handleBan(showBanModal)}
                disabled={!banReason.trim() || actionId !== null}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Ban User
              </Button>
              <Button variant="outline" onClick={() => { setShowBanModal(null); setBanReason(""); }} className="border-white/10">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
