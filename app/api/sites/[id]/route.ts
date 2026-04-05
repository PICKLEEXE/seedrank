import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getAuthorizedSite(siteId: string, userEmail: string) {
  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) return null;
  return prisma.site.findFirst({ where: { id: siteId, userId: user.id } });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const site = await getAuthorizedSite(params.id, session.user.email!);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.site.update({
    where: { id: params.id },
    data: {
      autopilotEnabled: body.autopilotEnabled ?? site.autopilotEnabled,
      cmsType: body.cmsType ?? site.cmsType,
      cmsCredentials: body.cmsCredentials ?? site.cmsCredentials,
    },
  });

  return NextResponse.json({ site: updated });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const site = await getAuthorizedSite(params.id, session.user.email!);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.article.deleteMany({ where: { siteId: params.id } });
  await prisma.keyword.deleteMany({ where: { siteId: params.id } });
  await prisma.backlink.deleteMany({ where: { siteId: params.id } });
  await prisma.site.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
