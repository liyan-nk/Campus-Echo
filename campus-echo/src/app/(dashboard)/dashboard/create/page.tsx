"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  Upload, X, Loader2, AlertCircle, Plus, Minus,
  FileText, Image as ImageIcon, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPost } from "@/actions/posts";

const POST_TYPES = [
  { value: "COMPLAINT", label: "Complaint", emoji: "😤", desc: "Report an issue" },
  { value: "SUGGESTION", label: "Suggestion", emoji: "💡", desc: "Propose an improvement" },
  { value: "FEEDBACK", label: "Feedback", emoji: "💬", desc: "General feedback" },
  { value: "CONFESSION", label: "Confession", emoji: "🤫", desc: "Share anonymously" },
  { value: "POLL", label: "Poll", emoji: "📊", desc: "Ask the community" },
  { value: "URGENT", label: "Urgent", emoji: "🚨", desc: "Requires immediate attention" },
];

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CreatePostPageProps {
  categories: Category[];
}

export default function CreatePostPage({ categories }: { categories?: Category[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; name: string; type: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "COMPLAINT",
    categoryId: "",
    tags: [] as string[],
    isAnonymous: true,
    pollOptions: ["", ""],
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    for (const file of acceptedFiles.slice(0, 5 - uploadedFiles.length)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) {
          setUploadedFiles((prev) => [...prev, { url: data.url, name: file.name, type: file.type }]);
        }
      } catch (e) {
        console.error("Upload failed:", e);
      }
    }
    setIsUploading(false);
  }, [uploadedFiles.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [] },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024,
    disabled: uploadedFiles.length >= 5,
  });

  function addTag() {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.categoryId) { setError("Please select a category"); return; }
    if (!form.title.trim()) { setError("Please add a title"); return; }
    if (!form.content.trim()) { setError("Please add some content"); return; }

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("type", form.type);
    formData.append("categoryId", form.categoryId);
    formData.append("tags", JSON.stringify(form.tags));
    formData.append("isAnonymous", String(form.isAnonymous));
    formData.append("attachmentUrls", JSON.stringify(uploadedFiles.map((f) => f.url)));

    if (form.type === "POLL") {
      const validOptions = form.pollOptions.filter((o) => o.trim());
      if (validOptions.length < 2) { setError("Add at least 2 poll options"); setIsLoading(false); return; }
      formData.append("pollOptions", JSON.stringify(validOptions));
    }

    const result = await createPost(formData);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } else {
      setError(result.error || "Failed to create post");
    }
    setIsLoading(false);
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">Post submitted!</h2>
        <p className="text-gray-400">Redirecting to feed...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Create a Post</h1>
        <p className="text-gray-500 text-sm mt-1">Your identity will be protected anonymously</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Post Type */}
        <div>
          <Label className="text-gray-300 text-sm mb-3 block">Post Type</Label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {POST_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, type: type.value }))}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs transition-all ${
                  form.type === type.value
                    ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                    : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20"
                }`}
              >
                <span className="text-xl">{type.emoji}</span>
                <span className="font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <Label className="text-gray-300 text-sm mb-2 block">Category *</Label>
          <div className="flex flex-wrap gap-2">
            {(categories || []).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setForm((p) => ({ ...p, categoryId: cat.id }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  form.categoryId === cat.id
                    ? "border-opacity-60 scale-105"
                    : "border-white/10 bg-white/5 text-gray-500 hover:border-white/20"
                }`}
                style={
                  form.categoryId === cat.id
                    ? { background: `${cat.color}20`, color: cat.color, borderColor: `${cat.color}50` }
                    : {}
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="title" className="text-gray-300 text-sm mb-2 block">Title *</Label>
          <Input
            id="title"
            placeholder="Summarize your issue in a sentence..."
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            maxLength={200}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500"
          />
          <p className="text-xs text-gray-600 mt-1">{form.title.length}/200</p>
        </div>

        {/* Content */}
        <div>
          <Label htmlFor="content" className="text-gray-300 text-sm mb-2 block">Description *</Label>
          <textarea
            id="content"
            rows={6}
            placeholder="Describe your issue in detail. Be specific — more context leads to faster resolution."
            value={form.content}
            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            maxLength={5000}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 resize-none transition-colors"
          />
          <p className="text-xs text-gray-600 mt-1">{form.content.length}/5000</p>
        </div>

        {/* Poll Options */}
        {form.type === "POLL" && (
          <div>
            <Label className="text-gray-300 text-sm mb-2 block">Poll Options</Label>
            <div className="space-y-2">
              {form.pollOptions.map((option, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    placeholder={`Option ${idx + 1}`}
                    value={option}
                    onChange={(e) => {
                      const opts = [...form.pollOptions];
                      opts[idx] = e.target.value;
                      setForm((p) => ({ ...p, pollOptions: opts }));
                    }}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500"
                  />
                  {form.pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, pollOptions: p.pollOptions.filter((_, i) => i !== idx) }))}
                      className="p-2 text-gray-500 hover:text-red-400"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {form.pollOptions.length < 6 && (
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, pollOptions: [...p.pollOptions, ""] }))}
                  className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add option
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        <div>
          <Label className="text-gray-300 text-sm mb-2 block">Tags (optional)</Label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {form.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 text-gray-300 text-xs">
                #{tag}
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }))}
                  className="text-gray-500 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          {form.tags.length < 5 && (
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500 text-sm"
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag} className="border-white/10">
                Add
              </Button>
            </div>
          )}
        </div>

        {/* File Upload */}
        <div>
          <Label className="text-gray-300 text-sm mb-2 block">Attachments (optional)</Label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
              isDragActive
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-white/10 hover:border-white/20 bg-white/3"
            }`}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                <p className="text-sm text-gray-400">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-gray-500" />
                <p className="text-sm text-gray-500">
                  {isDragActive ? "Drop files here" : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs text-gray-700">Images & PDFs up to 10MB (max 5 files)</p>
              </div>
            )}
          </div>

          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400">
                  {file.type.startsWith("image/") ? (
                    <ImageIcon className="w-3.5 h-3.5" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                  <span className="truncate max-w-[100px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-gray-600 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Anonymous toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
          <div>
            <p className="text-sm font-medium text-white">Post anonymously</p>
            <p className="text-xs text-gray-500 mt-0.5">Your alias will be shown instead of your real identity</p>
          </div>
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, isAnonymous: !p.isAnonymous }))}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              form.isAnonymous ? "bg-indigo-600" : "bg-gray-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                form.isAnonymous ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Submit Post Anonymously
        </Button>
      </form>
    </div>
  );
}
