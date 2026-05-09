import type { User, Post, Comment, Category, Vote, Notification, Attachment, Report, Bookmark, AdminResponse, PollOption } from "@prisma/client";

// ==========================================
// EXTENDED TYPES
// ==========================================

export type SafeUser = Omit<User, "passwordHash" | "anonymousSeed"> & {
  _count?: { posts: number; comments: number };
};

export type PostWithRelations = Post & {
  category: Category;
  author: { anonymousAlias: string; id: string };
  attachments: Attachment[];
  _count: { comments: number; votes: number };
  userVote?: number | null;
  isBookmarked?: boolean;
  adminResponses?: AdminResponse[];
  pollOptions?: PollOption[];
};

export type CommentWithReplies = Comment & {
  author: { anonymousAlias: string; id: string };
  replies?: CommentWithReplies[];
  userVote?: number | null;
  _count: { replies: number };
};

export type NotificationWithPost = Notification & {
  post?: Post | null;
};

// ==========================================
// FORM TYPES
// ==========================================

export interface CreatePostInput {
  title: string;
  content: string;
  type: string;
  categoryId: string;
  tags: string[];
  isAnonymous: boolean;
  attachments?: string[];
  pollOptions?: string[];
}

export interface UpdatePostStatusInput {
  postId: string;
  status: string;
  adminNote?: string;
}

export interface CreateCommentInput {
  postId: string;
  content: string;
  parentId?: string;
  isAnonymous: boolean;
}

export interface RegisterInput {
  email: string;
  password: string;
  confirmPassword: string;
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ==========================================
// FILTER TYPES
// ==========================================

export interface PostFilters {
  categoryId?: string;
  type?: string;
  status?: string;
  search?: string;
  tags?: string[];
  sortBy?: "latest" | "popular" | "trending" | "oldest";
  page?: number;
  pageSize?: number;
}

// ==========================================
// ANALYTICS TYPES
// ==========================================

export interface DashboardStats {
  totalPosts: number;
  pendingPosts: number;
  resolvedPosts: number;
  totalUsers: number;
  activeUsers: number;
  totalComments: number;
  reportsPending: number;
  resolutionRate: number;
}

export interface CategoryStat {
  name: string;
  count: number;
  color: string;
}

export interface DailyActivity {
  date: string;
  posts: number;
  comments: number;
  votes: number;
}

// ==========================================
// NEXT-AUTH TYPES
// ==========================================

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      anonymousAlias: string;
      emailVerified: Date | null;
      isBanned: boolean;
    };
  }

  interface User {
    id: string;
    role: string;
    anonymousAlias: string;
    isBanned: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    anonymousAlias: string;
    isBanned: boolean;
    emailVerified: Date | null;
  }
}
