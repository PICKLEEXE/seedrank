import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { FileText, TrendingUp, Globe, Zap, Plus, Bot } from "lucide-react";
import Link from "next/link";
import { PLANS } from "@/lib/stripe";
import { formatDate } from "@/lib/utils";

export default async function PanelPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      sites: {
        include: {
          articles: { orderBy: { createdAt: "desc" }, take: 5 },
        },
      },
    },
  });

  if (!user) redirect("/login");

  const plan = PLANS[user.planId as keyof typeof PLANS] || PLANS.free;
  const totalArticles = user.sites.reduce((s, site) => s + site.articles.length, 0);
  const activeSites = user.sites.filter((s) => s.verified).length;
  const autopilotSites = user.sites.filter((s) => s.autopilotEnabled).length;
  const recentArticles = user.sites.flatMap((s) => s.articles).slice(0, 5);

  const statusColors: Record<string, string> = {
    published: "bg-green-100 text-green-700",
    approved: "bg-blue-100 text-blue-700",
    draft: "bg-gray-100 text-gray-600",
    generating: "bg-yellow-100 text-yellow-700",
    scheduled: "bg-purple-100 text-purple-700",
  };

  const statusLabels: Record<string, string> = {
    published: "Published",
    approved: "Approved",
    draft: "Draft",
    generating: "Generating",
    scheduled: "Scheduled",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome, {user.name || user.email}</p>
        </div>
        <Link
          href="/strony"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add site
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Generated articles"
          value={totalArticles}
          icon={FileText}
          description="total across all sites"
          iconColor="text-blue-500"
        />
        <StatsCard
          title="Organic traffic"
          value="—"
          icon={TrendingUp}
          description="Connect GSC to see data"
          iconColor="text-purple-500"
        />
        <StatsCard
          title="Blogs / Sites"
          value={user.sites.length}
          icon={Globe}
          description={`${activeSites} verified`}
          iconColor="text-green-500"
        />
        <StatsCard
          title="Active sites"
          value={activeSites}
          icon={Zap}
          description={`${autopilotSites} on autopilot`}
          iconColor="text-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Articles */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Recent articles</h2>

          {recentArticles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No articles yet</p>
              <p className="text-gray-400 text-sm mt-1">Add a site and enable autopilot.</p>
              <Link
                href="/strony"
                className="inline-flex items-center gap-2 mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add site
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentArticles.map((article) => (
                <div key={article.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{article.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(article.createdAt)}</p>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    {article.seoScore && (
                      <span className="text-xs text-gray-500">SEO: {article.seoScore}</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[article.status] || statusColors.draft}`}>
                      {statusLabels[article.status] || article.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Plan card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Your plan</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Plan</span>
              <span className="text-sm font-bold text-green-600 uppercase">{plan.name}</span>
            </div>
            <div className="space-y-3">
              <LimitRow label="Articles" used={totalArticles} max={plan.articles} />
              <LimitRow label="Sites" used={user.sites.length} max={plan.sites} />
              <LimitRow label="Backlinks" used={0} max={plan.backlinks} />
              <LimitRow label="Keywords" used={0} max={plan.keywords} />
            </div>
            <Link
              href="/ustawienia/platnosci"
              className="block text-center mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Upgrade plan →
            </Link>
          </div>

          {/* Autopilot status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-4 w-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900">SEO Autopilot</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gray-300" />
              <span className="text-sm text-gray-500">INACTIVE</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">{autopilotSites} sites on autopilot</p>
            {user.sites.length > 0 && (
              <Link
                href="/strony"
                className="block text-center mt-3 text-xs text-green-600 hover:text-green-700 font-medium"
              >
                Manage sites →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LimitRow({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = Math.min((used / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span>
          {used}/{max === Infinity ? "∞" : max}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
