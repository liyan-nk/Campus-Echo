import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { tags: { hasSome: [q.toLowerCase()] } },
      ],
    },
    take: 8,
    orderBy: { upvoteCount: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      upvoteCount: true,
      category: { select: { name: true, color: true } },
      createdAt: true,
    },
  });

  return NextResponse.json({ results: posts });
}
