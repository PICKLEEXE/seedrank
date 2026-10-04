import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { DEMO_LINKEDIN_POSTS } from "@/lib/demo-data";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      linkedinPosts: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const posts = user.linkedinPosts.length > 0 ? user.linkedinPosts : DEMO_LINKEDIN_POSTS;

  return NextResponse.json({
    posts,
    connected: user.linkedinConnected,
    profileUrl: user.linkedinProfileUrl,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const { content, hook, cta, hashtags, scheduledFor, articleId } = body;

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const post = await prisma.linkedInPost.create({
    data: {
      userId: user.id,
      content,
      hook: hook || null,
      cta: cta || null,
      hashtags: hashtags || [],
      status: scheduledFor ? "scheduled" : "draft",
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      articleId: articleId || null,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
