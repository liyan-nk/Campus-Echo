import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.PUSHER_CLUSTER || "ap2",
  useTLS: true,
});

export const PUSHER_EVENTS = {
  NOTIFICATION: "notification",
  POST_UPDATED: "post:updated",
  POST_CREATED: "post:created",
  COMMENT_ADDED: "comment:added",
  STATUS_CHANGED: "status:changed",
} as const;

export function getUserChannel(userId: string): string {
  return `private-user-${userId}`;
}

export function getPostChannel(postId: string): string {
  return `post-${postId}`;
}

export function getAdminChannel(): string {
  return "admin-notifications";
}

export async function triggerUserNotification(
  userId: string,
  data: {
    type: string;
    title: string;
    message: string;
    postId?: string;
  }
): Promise<void> {
  try {
    await pusherServer.trigger(getUserChannel(userId), PUSHER_EVENTS.NOTIFICATION, data);
  } catch (error) {
    console.error("Pusher notification error:", error);
  }
}

export async function triggerAdminNotification(data: {
  type: string;
  message: string;
  postId?: string;
}): Promise<void> {
  try {
    await pusherServer.trigger(getAdminChannel(), PUSHER_EVENTS.NOTIFICATION, data);
  } catch (error) {
    console.error("Pusher admin notification error:", error);
  }
}
