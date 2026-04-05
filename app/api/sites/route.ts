import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/stripe";
import { z } from "zod";

const schema = z.object({
  domain: z.string().min(3).regex(/^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+/),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const sites = await prisma.site.findMany({
    where: { userId: user.id },
    include: { _count: { select: { articles: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ sites });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { domain } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const plan = PLANS[user.planId as keyof typeof PLANS] || PLANS.free;
    const siteCount = await prisma.site.count({ where: { userId: user.id } });

    if (siteCount >= plan.sites) {
      return NextResponse.json(
        { error: `Site limit reached for the ${plan.name} plan (${plan.sites})` },
        { status: 403 }
      );
    }

    const existing = await prisma.site.findFirst({ where: { userId: user.id, domain } });
    if (existing) {
      return NextResponse.json({ error: "This domain already exists on your account" }, { status: 400 });
    }

    const site = await prisma.site.create({
      data: { userId: user.id, domain },
    });

    return NextResponse.json({ site }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
