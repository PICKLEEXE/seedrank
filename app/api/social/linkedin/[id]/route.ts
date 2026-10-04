import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

  const post = await prisma.linkedInPost.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const body = await req.json();
  const { content, hook, cta, hashtags, scheduledFor, status } = body;

  const updated = await prisma.linkedInPost.update({
    where: { id: params.id },
    data: {
      ...(content !== undefined && { content }),
      ...(hook !== undefined && { hook }),
      ...(cta !== undefined && { cta }),
      ...(hashtags !== undefined && { hashtags }),
      ...(scheduledFor !== undefined && { scheduledFor: scheduledFor ? new Date(scheduledFor) : null }),
      ...(status !== undefined && { status }),
    },
  });

  return NextResponse.json({ post: updated });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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

  const post = await prisma.linkedInPost.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await prisma.linkedInPost.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
