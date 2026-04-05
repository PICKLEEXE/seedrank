import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const site = await prisma.site.findFirst({ where: { id: params.id, userId: user.id } });
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  const { method } = await req.json();

  if (method === "txt") {
    try {
      const url = `https://${site.domain}/rankroot-verify.txt`;
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error("File not accessible");

      const content = await response.text();
      const expected = `rankroot-verify-${site.verificationToken}`;

      if (content.trim() === expected) {
        await prisma.site.update({ where: { id: params.id }, data: { verified: true } });
        return NextResponse.json({ success: true });
      }

      return NextResponse.json(
        { success: false, message: "Treść pliku nie pasuje" },
        { status: 400 }
      );
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Nie można pobrać pliku weryfikacyjnego" },
        { status: 400 }
      );
    }
  }

  if (method === "dns") {
    // DNS TXT record verification would go here (requires DNS lookup library)
    // For now return not implemented
    return NextResponse.json(
      { success: false, message: "Weryfikacja DNS wymaga konfiguracji serwera" },
      { status: 501 }
    );
  }

  return NextResponse.json({ success: false }, { status: 400 });
}
