import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CryptoJS from "crypto-js";
import { z } from "zod";

const schema = z.object({
  type: z.enum(["wordpress", "ghost", "webflow"]),
  url: z.string().url(),
  username: z.string().min(1),
  appPassword: z.string().min(1),
});

const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET || "default-key";

function encrypt(text: string) {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { type, url, username, appPassword } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Test WP connection
    if (type === "wordpress") {
      try {
        const testUrl = `${url.replace(/\/$/, "")}/wp-json/wp/v2/users/me`;
        const auth = Buffer.from(`${username}:${appPassword}`).toString("base64");
        const testRes = await fetch(testUrl, {
          headers: { Authorization: `Basic ${auth}` },
          signal: AbortSignal.timeout(8000),
        });
        if (!testRes.ok) {
          return NextResponse.json({ error: "Błędne dane uwierzytelniające WordPress" }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: "Nie można połączyć z WordPress. Sprawdź URL." }, { status: 400 });
      }
    }

    const integration = await prisma.integration.create({
      data: {
        userId: user.id,
        type,
        credentials: {
          url,
          username,
          appPassword: encrypt(appPassword),
        },
        status: "connected",
      },
    });

    return NextResponse.json({ integration: { id: integration.id, type, status: "connected" } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Wewnętrzny błąd serwera" }, { status: 500 });
  }
}
