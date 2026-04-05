import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const article = await prisma.article.findFirst({
    where: { id: params.id, site: { userId: user.id } },
    include: { site: { select: { domain: true } } },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ article });
}

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  status: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const article = await prisma.article.findFirst({
    where: { id: params.id, site: { userId: user.id } },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = patchSchema.parse(await req.json());
    const updated = await prisma.article.update({
      where: { id: params.id },
      data: {
        ...body,
        ...(body.status === "published" && !article.publishedAt
          ? { publishedAt: new Date() }
          : {}),
      },
    });
    return NextResponse.json({ article: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Wewnętrzny błąd serwera" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const article = await prisma.article.findFirst({
    where: { id: params.id, site: { userId: user.id } },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.article.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
