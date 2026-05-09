"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { createAnnouncement } from "@/actions/admin";
import { Plus, Megaphone, Pin, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isPublished: boolean;
  createdAt: Date;
}

export function AdminAnnouncementsClient({
  announcements: initialList,
}: {
  announcements: Announcement[];
}) {
  const [announcements, setAnnouncements] = useState(initialList);
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", isPinned: false });

  async function handleCreate() {
    if (!form.title.trim() || !form.content.trim()) return;
    setIsCreating(true);
    const result = await createAnnouncement(form.title, form.content, form.isPinned);
    if (result.success) {
      setSuccess(true);
      setShowForm(false);
      setForm({ title: "", content: "", isPinned: false });
      window.location.reload();
    }
    setIsCreating(false);
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Announcement
        </Button>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-4">
          <CheckCircle className="w-4 h-4" />
          Announcement sent to all students!
        </div>
      )}

      {showForm && (
        <div className="glass-card p-5 mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">Create Announcement</h3>
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Title *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Announcement title"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Content *</label>
              <textarea
                rows={5}
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Write the announcement content..."
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 resize-none"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, isPinned: !p.isPinned }))}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.isPinned ? "bg-indigo-600" : "bg-gray-700"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.isPinned ? "translate-x-5" : ""}`} />
              </button>
              <span className="text-sm text-gray-300">Pin to top of feed</span>
            </label>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleCreate}
              disabled={isCreating || !form.title.trim() || !form.content.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Megaphone className="w-4 h-4 mr-2" />}
              Send to All Students
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="border-white/10">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {announcements.map((ann) => (
          <div key={ann.id} className="glass-card p-5">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <h3 className="text-sm font-semibold text-white">{ann.title}</h3>
                {ann.isPinned && (
                  <span className="flex items-center gap-1 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                    <Pin className="w-2.5 h-2.5" />
                    Pinned
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-600 flex-shrink-0">
                {formatDistanceToNow(new Date(ann.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{ann.content}</p>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Megaphone className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No announcements yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
