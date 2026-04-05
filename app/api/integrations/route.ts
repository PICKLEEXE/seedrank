import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const integrations = await prisma.integration.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, type: true, status: true, createdAt: true, credentials: true },
  });

  // Mask sensitive credential fields
  const masked = integrations.map((i) => ({
    ...i,
    credentials: {
      url: (i.credentials as any)?.url,
      domain: (i.credentials as any)?.domain,
    },
  }));

  return NextResponse.json({ integrations: masked });
}
