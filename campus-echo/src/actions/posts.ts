"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ApiResponse, PostFilters, PaginatedResponse, PostWithRelations } from "@/types";
import { triggerAdminNotification, triggerUserNotification } from "@/lib/pusher";
import { sendStatusUpdateEmail } from "@/lib/email";

const createPostSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(200),
  content: z.string().min(20, "Content must be at least 20 characters").max(5000),
  type: z.enum(["COMPLAINT", "SUGGESTION", "FEEDBACK", "CONFESSION", "POLL", "URGENT"]),
  categoryId: z.string().min(1),
  tags: z.array(z.string()).max(5).default([]),
  isAnonymous: z.boolean().default(true),
  attachmentUrls: z.array(z.string().url()).max(5).optional(),
  pollOptions: z.array(z.string().min(1)).min(2).max(6).optional(),
});

export async function createPost(formData: FormData): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    if (session.user.isBanned) return { success: false, error: "Account suspended" };

    const raw = {
      title: formData.get("title"),
      content: formData.get("content"),
      type: formData.get("type"),
      categoryId: formData.get("categoryId"),
      tags: JSON.parse(formData.get("tags") as string || "[]"),
      isAnonymous: formData.get("isAnonymous") === "true",
      attachmentUrls: JSON.parse(formData.get("attachmentUrls") as string || "[]"),
      pollOptions: JSON.parse(formData.get("pollOptions") as string || "null") || undefined,
    };

    const validated = createPostSchema.parse(raw);

    const post = await prisma.post.create({
      data: {
        title: validated.title,
        content: validated.content,
        type: validated.type as any,
        categoryId: validated.categoryId,
        tags: validated.tags,
        isAnonymous: validated.isAnonymous,
        authorId: session.user.id,
        attachments: validated.attachmentUrls?.length
          ? {
              create: validated.attachmentUrls.map((url) => ({
                url,
                publicId: url.split("/").pop() || "",
                filename: url.split("/").pop() || "file",
                mimeType: url.includes(".pdf") ? "application/pdf" : "image/jpeg",
                size: 0,
              })),
            }
          : undefined,
        pollOptions: validated.pollOptions?.length
          ? { create: validated.pollOptions.map((text) => ({ text })) }
          : undefined,
      },
    });

    // Notify admins
    await triggerAdminNotification({
      type: "NEW_POST",
      message: `New ${validated.type.toLowerCase()} posted: ${validated.title}`,
      postId: post.id,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/feed");
    return { success: true, data: post, message: "Post created successfully" };
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return { success: false, error: error.errors[0]?.message || "Validation failed" };
    }
    console.error("createPost error:", error);
    return { success: false, error: "Failed to create post" };
  }
}

export async function getPosts(filters: PostFilters): Promise<PaginatedResponse<PostWithRelations>> {
  const { page = 1, pageSize = 10, categoryId, type, status, search, tags, sortBy = "latest" } = filters;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (categoryId) where.categoryId = categoryId;
  if (type) where.type = type;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }
  if (tags?.length) where.tags = { hasSome: tags };

  const orderBy: any = {
    latest: { createdAt: "desc" },
    popular: { upvoteCount: "desc" },
    trending: [{ upvoteCount: "desc" }, { commentCount: "desc" }, { createdAt: "desc" }],
    oldest: { createdAt: "asc" },
  }[sortBy];

  const session = await auth();

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        category: true,
        author: { select: { anonymousAlias: true, id: true } },
        attachments: true,
        _count: { select: { comments: true, votes: true } },
        adminResponses: {
          include: { author: { select: { anonymousAlias: true } } },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  // Add user vote and bookmark status
  let enrichedPosts = posts as PostWithRelations[];
  if (session?.user?.id) {
    const postIds = posts.map((p) => p.id);
    const [votes, bookmarks] = await Promise.all([
      prisma.vote.findMany({
        where: { userId: session.user.id, postId: { in: postIds } },
      }),
      prisma.bookmark.findMany({
        where: { userId: session.user.id, postId: { in: postIds } },
      }),
    ]);

    const voteMap = new Map(votes.map((v) => [v.postId, v.value]));
    const bookmarkSet = new Set(bookmarks.map((b) => b.postId));

    enrichedPosts = posts.map((p) => ({
      ...(p as any),
      userVote: voteMap.get(p.id) ?? null,
      isBookmarked: bookmarkSet.has(p.id),
    }));
  }

  return {
    items: enrichedPosts,
    total,
    page,
    pageSize,
    hasMore: skip + pageSize < total,
  };
}

export async function getPostById(id: string): Promise<PostWithRelations | null> {
  const session = await auth();

  await prisma.post.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      category: true,
      author: { select: { anonymousAlias: true, id: true } },
      attachments: true,
      pollOptions: true,
      adminResponses: {
        include: { author: { select: { anonymousAlias: true, role: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { comments: true, votes: true } },
    },
  });

  if (!post) return null;

  if (session?.user?.id) {
    const [vote, bookmark] = await Promise.all([
      prisma.vote.findUnique({ where: { postId_userId: { postId: id, userId: session.user.id } } }),
      prisma.bookmark.findUnique({ where: { userId_postId: { userId: session.user.id, postId: id } } }),
    ]);

    return {
      ...(post as any),
      userVote: vote?.value ?? null,
      isBookmarked: !!bookmark,
    };
  }

  return post as PostWithRelations;
}

export async function voteOnPost(postId: string, value: 1 | -1): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const existing = await prisma.vote.findUnique({
      where: { postId_userId: { postId, userId: session.user.id } },
    });

    if (existing) {
      if (existing.value === value) {
        // Remove vote
        await prisma.vote.delete({ where: { postId_userId: { postId, userId: session.user.id } } });
        await prisma.post.update({
          where: { id: postId },
          data: {
            upvoteCount: value === 1 ? { decrement: 1 } : undefined,
            downvoteCount: value === -1 ? { decrement: 1 } : undefined,
          },
        });
        return { success: true, data: { vote: null } };
      } else {
        // Change vote
        await prisma.vote.update({
          where: { postId_userId: { postId, userId: session.user.id } },
          data: { value },
        });
        await prisma.post.update({
          where: { id: postId },
          data: {
            upvoteCount: value === 1 ? { increment: 1 } : { decrement: 1 },
            downvoteCount: value === -1 ? { increment: 1 } : { decrement: 1 },
          },
        });
        return { success: true, data: { vote: value } };
      }
    }

    await prisma.vote.create({ data: { postId, userId: session.user.id, value } });
    await prisma.post.update({
      where: { id: postId },
      data: {
        upvoteCount: value === 1 ? { increment: 1 } : undefined,
        downvoteCount: value === -1 ? { increment: 1 } : undefined,
      },
    });

    revalidatePath(`/post/${postId}`);
    return { success: true, data: { vote: value } };
  } catch (error) {
    return { success: false, error: "Failed to vote" };
  }
}

export async function toggleBookmark(postId: string): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const existing = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId: session.user.id, postId } },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return { success: true, data: { bookmarked: false } };
    }

    await prisma.bookmark.create({ data: { userId: session.user.id, postId } });
    return { success: true, data: { bookmarked: true } };
  } catch (error) {
    return { success: false, error: "Failed to toggle bookmark" };
  }
}

export async function deletePost(postId: string): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return { success: false, error: "Post not found" };

    const canDelete =
      post.authorId === session.user.id ||
      session.user.role === "ADMIN" ||
      session.user.role === "MODERATOR";

    if (!canDelete) return { success: false, error: "Unauthorized" };

    await prisma.post.delete({ where: { id: postId } });
    revalidatePath("/dashboard");
    return { success: true, message: "Post deleted" };
  } catch (error) {
    return { success: false, error: "Failed to delete post" };
  }
}

export async function updatePostStatus(
  postId: string,
  status: string,
  adminNote?: string
): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    if (!["ADMIN", "MODERATOR"].includes(session.user.role)) return { success: false, error: "Unauthorized" };

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        status: status as any,
        resolvedAt: status === "RESOLVED" ? new Date() : undefined,
      },
      include: { author: { select: { email: true, anonymousAlias: true } } },
    });

    if (adminNote) {
      await prisma.adminResponse.create({
        data: { postId, authorId: session.user.id, content: adminNote },
      });
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId: post.authorId,
        type: "STATUS_CHANGE",
        title: "Post Status Updated",
        message: `Your post "${post.title}" is now ${status.replace("_", " ")}`,
        postId,
      },
    });

    // Real-time notification
    await triggerUserNotification(post.authorId, {
      type: "STATUS_CHANGE",
      title: notification.title,
      message: notification.message,
      postId,
    });

    // Email notification
    try {
      await sendStatusUpdateEmail(post.author.email, post.title, status, adminNote);
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
    }

    revalidatePath(`/post/${postId}`);
    revalidatePath("/admin/posts");
    return { success: true, message: "Status updated" };
  } catch (error) {
    return { success: false, error: "Failed to update status" };
  }
}

export async function reportPost(
  postId: string,
  reason: string,
  description?: string
): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await prisma.report.create({
      data: {
        reporterId: session.user.id,
        postId,
        reason: reason as any,
        description,
      },
    });

    return { success: true, message: "Report submitted" };
  } catch (error) {
    return { success: false, error: "Failed to submit report" };
  }
}
