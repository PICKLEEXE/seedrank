import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { sites: { include: { articles: true, keywords: true, backlinks: true } } },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const totalArticles = user.sites.reduce((s, site) => s + site.articles.length, 0);
  const totalKeywords = user.sites.reduce((s, site) => s + site.keywords.length, 0);
  const totalBacklinks = user.sites.reduce((s, site) => s + site.backlinks.length, 0);

  return NextResponse.json({
    planId: user.planId,
    usage: {
      articles: totalArticles,
      sites: user.sites.length,
      keywords: totalKeywords,
      backlinks: totalBacklinks,
    },
  });
}
