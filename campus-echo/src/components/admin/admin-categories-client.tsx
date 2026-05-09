"use client";

import { useState } from "react";
import { createCategory, deleteCategory } from "@/actions/admin";
import { Plus, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  isActive: boolean;
  _count: { posts: number };
}

const COLOR_OPTIONS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#06b6d4", "#64748b",
];

export function AdminCategoriesClient({ categories: initialCats }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initialCats);
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "#6366f1" });
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!form.name.trim()) return;
    setIsCreating(true);
    setError("");
    const result = await createCategory(form.name, form.description, form.color);
    if (result.success) {
      window.location.reload();
    } else {
      setError(result.error || "Failed to create category");
    }
    setIsCreating(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete category "${name}"? This will fail if it has posts.`)) return;
    const result = await deleteCategory(id);
    if (result.success) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert(result.error);
    }
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
          New Category
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="glass-card p-5 mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">Create Category</h3>
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-3">
              {error}
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Category name"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Description</label>
              <Input
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Optional description"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, color }))}
                  className="w-8 h-8 rounded-lg transition-transform hover:scale-110"
                  style={{
                    background: color,
                    outline: form.color === color ? `2px solid white` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleCreate}
              disabled={isCreating || !form.name.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Create
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="border-white/10">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Categories grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="glass-card p-4 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}40` }}
            >
              <Tag className="w-5 h-5" style={{ color: cat.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{cat.name}</p>
              <p className="text-xs text-gray-600">{cat._count.posts} posts</p>
              {cat.description && (
                <p className="text-xs text-gray-600 truncate mt-0.5">{cat.description}</p>
              )}
            </div>
            {cat._count.posts === 0 && (
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                className="p-1.5 rounded-md text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
