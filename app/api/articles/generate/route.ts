import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mockGenerateArticle } from "@/lib/demo-data";
import { PLANS } from "@/lib/stripe";
import { z } from "zod";

const schema = z.object({
  siteId: z.string(),
  keywords: z.array(z.string()).min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { siteId, keywords } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const site = await prisma.site.findFirst({ where: { id: siteId, userId: user.id } });
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

    const plan = PLANS[user.planId as keyof typeof PLANS] || PLANS.free;
    const articleCount = await prisma.article.count({ where: { site: { userId: user.id } } });
    if (articleCount >= plan.articles) {
      return NextResponse.json({ error: `Limit artykułów osiągnięty (${plan.articles})` }, { status: 403 });
    }

    // Demo mode — use mock generation
    const generated = await mockGenerateArticle(keywords);

    const article = await prisma.article.create({
      data: {
        siteId,
        title: generated.title,
        content: generated.content,
        status: generated.status,
        targetKeywords: generated.targetKeywords,
        seoScore: generated.seoScore,
      },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Wewnętrzny błąd serwera" }, { status: 500 });
  }
}
