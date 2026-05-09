import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  identifier?: string;
}

export async function rateLimit(
  req: NextRequest,
  options: RateLimitOptions = { maxRequests: 10, windowMs: 60000 }
): Promise<{ success: boolean; remaining: number; reset: Date }> {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const key = options.identifier ? `${ip}:${options.identifier}` : ip;
  const now = new Date();
  const resetAt = new Date(now.getTime() + options.windowMs);

  try {
    const existing = await prisma.rateLimit.findUnique({ where: { key } });

    if (!existing || existing.resetAt < now) {
      await prisma.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt },
      });
      return { success: true, remaining: options.maxRequests - 1, reset: resetAt };
    }

    if (existing.count >= options.maxRequests) {
      return { success: false, remaining: 0, reset: existing.resetAt };
    }

    await prisma.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });

    return {
      success: true,
      remaining: options.maxRequests - existing.count - 1,
      reset: existing.resetAt,
    };
  } catch {
    // On error, allow the request
    return { success: true, remaining: options.maxRequests, reset: resetAt };
  }
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
