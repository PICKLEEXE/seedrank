import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");

  const sites = await prisma.site.findMany({ where: { userId: user.id }, select: { id: true } });
  const siteIds = sites.map((s) => s.id);

  const articles = await prisma.article.findMany({
    where: {
      siteId: siteId ? siteId : { in: siteIds },
    },
    include: { site: { select: { domain: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ articles });
}

export async function DELETE(_: Request) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
