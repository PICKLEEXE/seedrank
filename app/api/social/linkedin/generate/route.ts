import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { mockGenerateLinkedInPost } from "@/lib/demo-data";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { articleTitle, articleContent, tone } = body;

  const result = await mockGenerateLinkedInPost(
    articleTitle || "SEO Strategy",
    articleContent || ""
  );

  return NextResponse.json({ post: result });
}
