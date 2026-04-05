"use client";

import { useEffect, useState } from "react";
import { FileText, Search, Plus, ExternalLink, Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

const STATUS_FILTERS = [
  { key: "all", label: "Wszystkie" },
  { key: "draft", label: "Szkice" },
  { key: "generating", label: "Generowane" },
  { key: "review", label: "Do recenzji" },
  { key: "approved", label: "Zatwierdzone" },
  { key: "scheduled", label: "Zaplanowane" },
  { key: "published", label: "Opublikowane" },
];

const statusColors: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  approved: "bg-blue-100 text-blue-700",
  draft: "bg-gray-100 text-gray-600",
  generating: "bg-yellow-100 text-yellow-700",
  scheduled: "bg-purple-100 text-purple-700",
  review: "bg-orange-100 text-orange-700",
};

const statusLabels: Record<string, string> = {
  published: "Opublikowany",
  approved: "Zatwierdzony",
  draft: "Szkic",
  generating: "Generowanie",
  scheduled: "Zaplanowany",
  review: "Do recenzji",
};

interface Article {
  id: string;
  title: string;
  status: string;
  seoScore: number | null;
  createdAt: string;
  publishedAt: string | null;
  site: { domain: string };
}

interface Site {
  id: string;
  domain: string;
}

export default function ArtykulyPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSite, setSelectedSite] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/articles").then((r) => r.json()),
      fetch("/api/sites").then((r) => r.json()),
    ]).then(([articlesData, sitesData]) => {
      setArticles(articlesData.articles || []);
      setSites(sitesData.sites || []);
      setLoading(false);
    });
  }, []);

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchSite = selectedSite === "all" || a.site?.domain === selectedSite;
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchSite && matchStatus;
  });

  async function deleteArticle(id: string) {
    if (!confirm("Usunąć artykuł?")) return;
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    setArticles((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Artykuły</h1>
          <p className="text-gray-500 text-sm mt-1">Zarządzaj i generuj treści SEO</p>
        </div>
        <Link
          href="/artykuly/nowy"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nowy artykuł
        </Link>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Szukaj artykułów..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>
        <select
          value={selectedSite}
          onChange={(e) => setSelectedSite(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="all">Wszystkie strony</option>
          {sites.map((s) => (
            <option key={s.id} value={s.domain}>{s.domain}</option>
          ))}
        </select>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {STATUS_FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            {articles.length === 0
              ? "Brak artykułów. Dodaj stronę i uruchom autopilota."
              : "Brak wyników dla podanych filtrów."}
          </p>
          {articles.length === 0 && (
            <Link
              href="/strony"
              className="inline-flex items-center gap-2 mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Dodaj stronę →
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Tytuł</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Strona</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">SEO</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Data</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((article) => (
                <tr key={article.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-[280px]">{article.title}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{article.site?.domain || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[article.status] || statusColors.draft}`}>
                      {statusLabels[article.status] || article.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{article.seoScore ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-500">{formatDate(article.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link href={`/artykuly/${article.id}`} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => deleteArticle(article.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
