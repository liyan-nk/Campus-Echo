"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ApiResponse, CommentWithReplies } from "@/types";
import { triggerUserNotification } from "@/lib/pusher";

const createCommentSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(1, "Comment cannot be empty").max(2000),
  parentId: z.string().optional(),
  isAnonymous: z.boolean().default(true),
});

export async function createComment(formData: FormData): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    if (session.user.isBanned) return { success: false, error: "Account suspended" };

    const validated = createCommentSchema.parse({
      postId: formData.get("postId"),
      content: formData.get("content"),
      parentId: formData.get("parentId") || undefined,
      isAnonymous: formData.get("isAnonymous") === "true",
    });

    const comment = await prisma.comment.create({
      data: {
        postId: validated.postId,
        content: validated.content,
        authorId: session.user.id,
        parentId: validated.parentId,
        isAnonymous: validated.isAnonymous,
      },
      include: {
        author: { select: { anonymousAlias: true, id: true } },
        _count: { select: { replies: true } },
      },
    });

    // Update comment count on post
    await prisma.post.update({
      where: { id: validated.postId },
      data: { commentCount: { increment: 1 } },
    });

    // Notify post author if comment on their post
    const post = await prisma.post.findUnique({
      where: { id: validated.postId },
      select: { authorId: true, title: true },
    });

    if (post && post.authorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          type: "COMMENT_REPLY",
          title: "New comment on your post",
          message: `Someone commented on "${post.title}"`,
          postId: validated.postId,
        },
      });

      await triggerUserNotification(post.authorId, {
        type: "COMMENT_REPLY",
        title: "New comment on your post",
        message: `Someone commented on "${post.title}"`,
        postId: validated.postId,
      });
    }

    // Notify parent comment author if this is a reply
    if (validated.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: validated.parentId },
        select: { authorId: true },
      });

      if (parentComment && parentComment.authorId !== session.user.id) {
        await prisma.notification.create({
          data: {
            userId: parentComment.authorId,
            type: "COMMENT_REPLY",
            title: "Someone replied to your comment",
            message: validated.content.slice(0, 100),
            postId: validated.postId,
          },
        });
      }
    }

    revalidatePath(`/post/${validated.postId}`);
    return { success: true, data: comment, message: "Comment added" };
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return { success: false, error: error.errors[0]?.message };
    }
    return { success: false, error: "Failed to add comment" };
  }
}

export async function getComments(postId: string): Promise<CommentWithReplies[]> {
  const session = await auth();

  const comments = await prisma.comment.findMany({
    where: { postId, parentId: null, isDeleted: false },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { anonymousAlias: true, id: true } },
      _count: { select: { replies: true } },
      replies: {
        where: { isDeleted: false },
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { anonymousAlias: true, id: true } },
          _count: { select: { replies: true } },
        },
      },
    },
  });

  if (session?.user?.id) {
    const commentIds = comments.flatMap((c) => [c.id, ...c.replies.map((r) => r.id)]);
    const votes = await prisma.commentVote.findMany({
      where: { userId: session.user.id, commentId: { in: commentIds } },
    });
    const voteMap = new Map(votes.map((v) => [v.commentId, v.value]));

    return comments.map((c) => ({
      ...(c as any),
      userVote: voteMap.get(c.id) ?? null,
      replies: c.replies.map((r) => ({ ...(r as any), userVote: voteMap.get(r.id) ?? null })),
    }));
  }

  return comments as CommentWithReplies[];
}

export async function voteOnComment(commentId: string, value: 1 | -1): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const existing = await prisma.commentVote.findUnique({
      where: { commentId_userId: { commentId, userId: session.user.id } },
    });

    if (existing) {
      if (existing.value === value) {
        await prisma.commentVote.delete({ where: { commentId_userId: { commentId, userId: session.user.id } } });
        await prisma.comment.update({
          where: { id: commentId },
          data: {
            likeCount: value === 1 ? { decrement: 1 } : undefined,
            dislikeCount: value === -1 ? { decrement: 1 } : undefined,
          },
        });
        return { success: true, data: { vote: null } };
      } else {
        await prisma.commentVote.update({
          where: { commentId_userId: { commentId, userId: session.user.id } },
          data: { value },
        });
        await prisma.comment.update({
          where: { id: commentId },
          data: {
            likeCount: value === 1 ? { increment: 1 } : { decrement: 1 },
            dislikeCount: value === -1 ? { increment: 1 } : { decrement: 1 },
          },
        });
        return { success: true, data: { vote: value } };
      }
    }

    await prisma.commentVote.create({ data: { commentId, userId: session.user.id, value } });
    await prisma.comment.update({
      where: { id: commentId },
      data: {
        likeCount: value === 1 ? { increment: 1 } : undefined,
        dislikeCount: value === -1 ? { increment: 1 } : undefined,
      },
    });

    return { success: true, data: { vote: value } };
  } catch (error) {
    return { success: false, error: "Failed to vote" };
  }
}

export async function deleteComment(commentId: string): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return { success: false, error: "Comment not found" };

    const canDelete =
      comment.authorId === session.user.id ||
      session.user.role === "ADMIN" ||
      session.user.role === "MODERATOR";

    if (!canDelete) return { success: false, error: "Unauthorized" };

    await prisma.comment.update({ where: { id: commentId }, data: { isDeleted: true, content: "[deleted]" } });

    revalidatePath(`/post/${comment.postId}`);
    return { success: true, message: "Comment deleted" };
  } catch (error) {
    return { success: false, error: "Failed to delete comment" };
  }
}
