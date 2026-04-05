import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/stripe";
import { z } from "zod";

const schema = z.object({
  siteId: z.string(),
  keyword: z.string().min(1).max(200),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");

  const keywords = await prisma.keyword.findMany({
    where: {
      site: { userId: user.id },
      ...(siteId ? { siteId } : {}),
    },
    include: { site: { select: { domain: true } } },
    orderBy: { trackedAt: "desc" },
  });

  return NextResponse.json({ keywords });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const site = await prisma.site.findFirst({ where: { id: body.siteId, userId: user.id } });
    if (!site) return NextResponse.json({ error: "Strona nie znaleziona" }, { status: 404 });

    const plan = PLANS[user.planId as keyof typeof PLANS] || PLANS.free;
    const keywordCount = await prisma.keyword.count({ where: { site: { userId: user.id } } });
    if (keywordCount >= plan.keywords) {
      return NextResponse.json(
        { error: `Limit słów kluczowych osiągnięty (${plan.keywords})` },
        { status: 403 }
      );
    }

    // Check duplicate
    const existing = await prisma.keyword.findFirst({
      where: { siteId: body.siteId, keyword: body.keyword },
    });
    if (existing) {
      return NextResponse.json({ error: "To słowo kluczowe już jest śledzone" }, { status: 409 });
    }

    const keyword = await prisma.keyword.create({
      data: {
        siteId: body.siteId,
        keyword: body.keyword,
      },
      include: { site: { select: { domain: true } } },
    });

    return NextResponse.json({ keyword }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Wewnętrzny błąd serwera" }, { status: 500 });
  }
}
