"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, CheckCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

const statusColors: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  approved: "bg-blue-100 text-blue-700",
  draft: "bg-gray-100 text-gray-600",
  generating: "bg-yellow-100 text-yellow-700",
  scheduled: "bg-purple-100 text-purple-700",
  review: "bg-orange-100 text-orange-700",
};

const statusLabels: Record<string, string> = {
  published: "Published",
  approved: "Approved",
  draft: "Draft",
  generating: "Generating",
  scheduled: "Scheduled",
  review: "In review",
};

interface Article {
  id: string;
  title: string;
  content: string;
  status: string;
  seoScore: number | null;
  targetKeywords: string[];
  createdAt: string;
  publishedAt: string | null;
  site: { domain: string };
}

export default function ArtykulPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [article, setArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.article) {
          setArticle(d.article);
          setTitle(d.article.title);
          setContent(d.article.content);
          setStatus(d.article.status);
        }
        setLoading(false);
      });
  }, [id]);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, status }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Save error.");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this article? This action cannot be undone.")) return;
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    router.push("/artykuly");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500">Article not found.</p>
        <Link href="/artykuly" className="text-green-600 hover:underline text-sm mt-2 inline-block">
          ← Back to articles
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/artykuly"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 truncate max-w-[400px]">{article.title}</h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[article.status] || statusColors.draft}`}>
                {statusLabels[article.status] || article.status}
              </span>
            </div>
            <p className="text-gray-500 text-xs mt-0.5">
              {article.site?.domain} · {formatDate(article.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={24}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono resize-y"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Status</h3>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">SEO Score</h3>
            {article.seoScore !== null ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      article.seoScore >= 80 ? "bg-green-500" :
                      article.seoScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${article.seoScore}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900">{article.seoScore}</span>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No score</p>
            )}
          </div>

          {article.targetKeywords.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Keywords</h3>
              <div className="flex flex-wrap gap-1.5">
                {article.targetKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-xs font-medium"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Site</span>
              <span className="font-medium text-gray-700">{article.site?.domain}</span>
            </div>
            <div className="flex justify-between">
              <span>Created</span>
              <span>{formatDate(article.createdAt)}</span>
            </div>
            {article.publishedAt && (
              <div className="flex justify-between">
                <span>Published</span>
                <span>{formatDate(article.publishedAt)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Characters</span>
              <span>{content.length.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
