import { NextResponse } from "next/server";

// Google Search Console OAuth integration
// Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/integracje?error=gsc_not_configured", req.url)
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_URL}/api/integrations/gsc/callback`;
  const scope = "https://www.googleapis.com/auth/webmasters.readonly";
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `access_type=offline&` +
    `prompt=consent`;

  return NextResponse.redirect(authUrl);
}
