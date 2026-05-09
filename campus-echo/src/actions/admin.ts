"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ApiResponse, DashboardStats, CategoryStat, DailyActivity } from "@/types";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!["ADMIN", "MODERATOR"].includes(session.user.role)) throw new Error("Forbidden");
  return session;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();

  const [
    totalPosts,
    pendingPosts,
    resolvedPosts,
    totalUsers,
    totalComments,
    reportsPending,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "PENDING" } }),
    prisma.post.count({ where: { status: "RESOLVED" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.comment.count(),
    prisma.report.count({ where: { isResolved: false } }),
  ]);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const activeUsers = await prisma.user.count({
    where: { posts: { some: { createdAt: { gte: thirtyDaysAgo } } } },
  });

  const resolutionRate = totalPosts > 0 ? Math.round((resolvedPosts / totalPosts) * 100) : 0;

  return {
    totalPosts,
    pendingPosts,
    resolvedPosts,
    totalUsers,
    activeUsers,
    totalComments,
    reportsPending,
    resolutionRate,
  };
}

export async function getCategoryStats(): Promise<CategoryStat[]> {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: "desc" } },
  });

  return categories.map((c) => ({
    name: c.name,
    count: c._count.posts,
    color: c.color,
  }));
}

export async function getDailyActivity(days: number = 7): Promise<DailyActivity[]> {
  await requireAdmin();

  const result: DailyActivity[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const start = new Date(date.setHours(0, 0, 0, 0));
    const end = new Date(date.setHours(23, 59, 59, 999));

    const [posts, comments, votes] = await Promise.all([
      prisma.post.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.comment.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.vote.count({ where: { createdAt: { gte: start, lte: end } } }),
    ]);

    result.push({
      date: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      posts,
      comments,
      votes,
    });
  }

  return result;
}

export async function getAllUsers(page: number = 1, search?: string) {
  await requireAdmin();

  const where: any = { role: { not: "ADMIN" } };
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { anonymousAlias: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * 20,
      take: 20,
      select: {
        id: true,
        email: true,
        role: true,
        anonymousAlias: true,
        isBanned: true,
        emailVerified: true,
        createdAt: true,
        _count: { select: { posts: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, hasMore: page * 20 < total };
}

export async function banUser(userId: string, reason: string): Promise<ApiResponse> {
  try {
    const session = await requireAdmin();

    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: true, bannedAt: new Date(), banReason: reason },
    });

    await prisma.moderationLog.create({
      data: {
        moderatorId: session.user.id,
        targetId: userId,
        action: "BAN_USER",
        reason,
      },
    });

    revalidatePath("/admin/users");
    return { success: true, message: "User banned" };
  } catch (error) {
    return { success: false, error: "Failed to ban user" };
  }
}

export async function unbanUser(userId: string): Promise<ApiResponse> {
  try {
    const session = await requireAdmin();

    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: false, bannedAt: null, banReason: null },
    });

    await prisma.moderationLog.create({
      data: { moderatorId: session.user.id, targetId: userId, action: "UNBAN_USER" },
    });

    revalidatePath("/admin/users");
    return { success: true, message: "User unbanned" };
  } catch (error) {
    return { success: false, error: "Failed to unban user" };
  }
}

export async function createCategory(name: string, description?: string, color?: string): Promise<ApiResponse> {
  try {
    await requireAdmin();

    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    await prisma.category.create({
      data: { name, slug, description, color: color || "#6366f1" },
    });

    revalidatePath("/admin/categories");
    return { success: true, message: "Category created" };
  } catch (error) {
    return { success: false, error: "Failed to create category" };
  }
}

export async function deleteCategory(id: string): Promise<ApiResponse> {
  try {
    await requireAdmin();

    const postCount = await prisma.post.count({ where: { categoryId: id } });
    if (postCount > 0) {
      return { success: false, error: `Cannot delete category with ${postCount} posts` };
    }

    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    return { success: true, message: "Category deleted" };
  } catch (error) {
    return { success: false, error: "Failed to delete category" };
  }
}

export async function createAnnouncement(
  title: string,
  content: string,
  isPinned: boolean = false
): Promise<ApiResponse> {
  try {
    const session = await requireAdmin();

    await prisma.announcement.create({
      data: { title, content, authorId: session.user.id, isPinned },
    });

    // Notify all students
    const students = await prisma.user.findMany({
      where: { role: "STUDENT", isBanned: false },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: students.map((s) => ({
        userId: s.id,
        type: "ANNOUNCEMENT" as any,
        title,
        message: content.slice(0, 200),
      })),
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/dashboard");
    return { success: true, message: "Announcement created and sent" };
  } catch (error) {
    return { success: false, error: "Failed to create announcement" };
  }
}

export async function getReports(page: number = 1, resolved: boolean = false) {
  await requireAdmin();

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where: { isResolved: resolved },
      skip: (page - 1) * 20,
      take: 20,
      include: {
        reporter: { select: { anonymousAlias: true } },
        post: { select: { id: true, title: true } },
        comment: { select: { id: true, content: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.report.count({ where: { isResolved: resolved } }),
  ]);

  return { reports, total, page };
}

export async function resolveReport(reportId: string): Promise<ApiResponse> {
  try {
    const session = await requireAdmin();

    await prisma.report.update({
      where: { id: reportId },
      data: { isResolved: true, resolvedAt: new Date(), resolvedBy: session.user.id },
    });

    revalidatePath("/admin/moderation");
    return { success: true, message: "Report resolved" };
  } catch (error) {
    return { success: false, error: "Failed to resolve report" };
  }
}

export async function addAdminResponse(postId: string, content: string): Promise<ApiResponse> {
  try {
    const session = await requireAdmin();

    await prisma.adminResponse.create({
      data: { postId, authorId: session.user.id, content },
    });

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          type: "ADMIN_RESPONSE",
          title: "Official response on your post",
          message: `Administration has responded to "${post.title}"`,
          postId,
        },
      });
    }

    revalidatePath(`/post/${postId}`);
    return { success: true, message: "Response added" };
  } catch (error) {
    return { success: false, error: "Failed to add response" };
  }
}
