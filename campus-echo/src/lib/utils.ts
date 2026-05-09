import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function getPostTypeColor(type: string): string {
  const colors: Record<string, string> = {
    COMPLAINT: "#ef4444",
    SUGGESTION: "#3b82f6",
    FEEDBACK: "#22c55e",
    CONFESSION: "#a78bfa",
    POLL: "#eab308",
    URGENT: "#f97316",
  };
  return colors[type] || "#6b7280";
}

export function parseTagInput(input: string): string[] {
  return input
    .split(/[,\s]+/)
    .map((t) => t.toLowerCase().trim().replace(/^#/, ""))
    .filter((t) => t.length > 0 && t.length <= 30)
    .slice(0, 5);
}
