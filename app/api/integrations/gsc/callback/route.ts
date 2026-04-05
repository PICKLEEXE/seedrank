import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/integracje?error=gsc_denied", req.url)
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });
  if (!user) {
    return NextResponse.redirect(
      new URL("/integracje?error=gsc_user_not_found", req.url)
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_URL}/api/integrations/gsc/callback`;

  // Exchange authorization code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      new URL("/integracje?error=gsc_token_failed", req.url)
    );
  }

  const tokens = await tokenRes.json();

  // Fetch user's GSC sites to confirm access
  const sitesRes = await fetch(
    "https://www.googleapis.com/webmasters/v3/sites",
    {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    }
  );

  const sitesData = sitesRes.ok ? await sitesRes.json() : { siteEntry: [] };
  const gscSites = (sitesData.siteEntry ?? []).map(
    (s: { siteUrl: string }) => s.siteUrl
  );

  // Remove existing GSC integration and save new one
  await prisma.integration.deleteMany({
    where: { userId: user.id, type: "gsc" },
  });

  await prisma.integration.create({
    data: {
      userId: user.id,
      type: "gsc",
      status: "connected",
      credentials: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        expiry_date: tokens.expires_in
          ? Date.now() + tokens.expires_in * 1000
          : null,
        sites: gscSites,
      },
    },
  });

  return NextResponse.redirect(
    new URL("/integracje?success=gsc_connected", req.url)
  );
}
