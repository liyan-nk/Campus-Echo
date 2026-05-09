const PREFIXES = ["Echo", "Student", "Voice", "Anon", "Ghost", "Shadow", "Phantom"];

export function generateAnonymousAlias(): string {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}#${number}`;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  const maskedLocal = local.slice(0, 2) + "*".repeat(Math.max(local.length - 4, 3)) + local.slice(-2);
  return `${maskedLocal}@${domain}`;
}

export function getAvatarInitials(alias: string): string {
  const parts = alias.split("#");
  return parts[0].slice(0, 2).toUpperCase();
}

export function generateAvatarColor(alias: string): string {
  const colors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
    "#f97316", "#eab308", "#22c55e", "#14b8a6",
    "#3b82f6", "#06b6d4",
  ];
  let hash = 0;
  for (let i = 0; i < alias.length; i++) {
    hash = alias.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
