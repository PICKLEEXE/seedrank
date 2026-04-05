import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function refreshAccessToken(
  refreshToken: string
): Promise<string | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token ?? null;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const integration = await prisma.integration.findFirst({
    where: { userId: user.id, type: "gsc" },
  });

  if (!integration) {
    return NextResponse.json({ connected: false });
  }

  const creds = integration.credentials as {
    access_token: string;
    refresh_token?: string;
    expiry_date?: number;
    sites?: string[];
  };

  let accessToken = creds.access_token;

  // Refresh if expired
  if (
    creds.expiry_date &&
    creds.expiry_date < Date.now() + 60_000 &&
    creds.refresh_token
  ) {
    const newToken = await refreshAccessToken(creds.refresh_token);
    if (newToken) {
      accessToken = newToken;
      await prisma.integration.update({
        where: { id: integration.id },
        data: {
          credentials: {
            ...creds,
            access_token: newToken,
            expiry_date: Date.now() + 3600 * 1000,
          },
        },
      });
    }
  }

  const { searchParams } = new URL(req.url);
  const siteUrl = searchParams.get("siteUrl");
  const days = parseInt(searchParams.get("days") || "28", 10);

  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - days * 86400_000)
    .toISOString()
    .split("T")[0];

  if (!siteUrl) {
    return NextResponse.json({ connected: true, sites: creds.sites ?? [] });
  }

  // Fetch performance data from GSC
  const [perfRes, queryRes] = await Promise.all([
    fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
        siteUrl
      )}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ["date"],
          rowLimit: days,
        }),
      }
    ),
    fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
        siteUrl
      )}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ["query"],
          rowLimit: 10,
          orderBy: [{ fieldName: "clicks", sortOrder: "DESCENDING" }],
        }),
      }
    ),
  ]);

  const [perfData, queryData] = await Promise.all([
    perfRes.json(),
    queryRes.json(),
  ]);

  const rows: Array<{
    keys: string[];
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }> = perfData.rows ?? [];

  const totals = rows.reduce(
    (acc, r) => ({
      clicks: acc.clicks + r.clicks,
      impressions: acc.impressions + r.impressions,
    }),
    { clicks: 0, impressions: 0 }
  );

  const avgCtr =
    totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const avgPosition =
    rows.length > 0
      ? rows.reduce((acc, r) => acc + r.position, 0) / rows.length
      : 0;

  return NextResponse.json({
    connected: true,
    sites: creds.sites ?? [],
    chart: rows.map((r) => ({
      date: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
    })),
    totals: {
      clicks: totals.clicks,
      impressions: totals.impressions,
      ctr: parseFloat(avgCtr.toFixed(2)),
      position: parseFloat(avgPosition.toFixed(1)),
    },
    topQueries: (queryData.rows ?? []).map(
      (r: {
        keys: string[];
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
      }) => ({
        query: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: parseFloat((r.ctr * 100).toFixed(1)),
        position: parseFloat(r.position.toFixed(1)),
      })
    ),
  });
}
