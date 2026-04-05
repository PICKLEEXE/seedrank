import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const keyword = await prisma.keyword.findFirst({
    where: { id: params.id, site: { userId: user.id } },
  });
  if (!keyword) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.keyword.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
