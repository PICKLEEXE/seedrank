"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Trash2, TrendingUp, BarChart2, Target, Loader2, X } from "lucide-react";

interface Keyword {
  id: string;
  keyword: string;
  searchVolume: number | null;
  difficulty: number | null;
  position: number | null;
  trackedAt: string;
  site: { domain: string };
}

interface Site {
  id: string;
  domain: string;
  verified: boolean;
}

function DifficultyBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-400">—</span>;
  const color =
    value >= 70 ? "text-red-600 bg-red-50" :
    value >= 40 ? "text-yellow-700 bg-yellow-50" :
    "text-green-700 bg-green-50";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {value}
    </span>
  );
}

function PositionBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-400">—</span>;
  const color =
    value <= 3 ? "text-green-700 font-bold" :
    value <= 10 ? "text-green-600" :
    value <= 30 ? "text-yellow-600" :
    "text-gray-500";
  return <span className={`text-sm ${color}`}>#{value}</span>;
}

export default function SlowaKluczowePage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSite, setSelectedSite] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newSiteId, setNewSiteId] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/keywords").then((r) => r.json()),
      fetch("/api/sites").then((r) => r.json()),
    ]).then(([kwData, sitesData]) => {
      setKeywords(kwData.keywords || []);
      const verified = (sitesData.sites || []).filter((s: Site) => s.verified);
      setSites(verified);
      if (verified.length > 0) setNewSiteId(verified[0].id);
      setLoading(false);
    });
  }, []);

  const filtered = keywords.filter((kw) => {
    const matchSearch = kw.keyword.toLowerCase().includes(search.toLowerCase());
    const matchSite = selectedSite === "all" || kw.site?.domain === selectedSite;
    return matchSearch && matchSite;
  });

  async function handleAdd() {
    setAddError("");
    if (!newKeyword.trim()) return setAddError("Please enter a keyword.");
    if (!newSiteId) return setAddError("Please select a site.");
    setAdding(true);
    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: newKeyword.trim(), siteId: newSiteId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || "Error adding keyword.");
      } else {
        setKeywords((prev) => [data.keyword, ...prev]);
        setNewKeyword("");
        setShowModal(false);
      }
    } catch {
      setAddError("Network error.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this keyword?")) return;
    await fetch(`/api/keywords/${id}`, { method: "DELETE" });
    setKeywords((prev) => prev.filter((k) => k.id !== id));
  }

  // Stats
  const tracked = keywords.length;
  const inTop10 = keywords.filter((k) => k.position !== null && k.position <= 10).length;
  const avgPosition =
    keywords.filter((k) => k.position !== null).length > 0
      ? Math.round(
          keywords.filter((k) => k.position !== null).reduce((s, k) => s + k.position!, 0) /
            keywords.filter((k) => k.position !== null).length
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Keywords</h1>
          <p className="text-gray-500 text-sm mt-1">Track positions and analyze difficulty</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setAddError(""); setNewKeyword(""); }}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add keyword
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
            <Target className="h-4 w-4" /> Tracked
          </div>
          <p className="text-2xl font-bold text-gray-900">{tracked}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
            <TrendingUp className="h-4 w-4" /> Top 10
          </div>
          <p className="text-2xl font-bold text-gray-900">{inTop10}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
            <BarChart2 className="h-4 w-4" /> Avg. position
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgPosition ?? "—"}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search keywords..."
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
          <option value="all">All sites</option>
          {sites.map((s) => (
            <option key={s.id} value={s.domain}>{s.domain}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            {keywords.length === 0
              ? "No keywords being tracked."
              : "No results for the selected filters."}
          </p>
          {keywords.length === 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add first keyword
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Keyword</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Site</th>
                <th className="text-center px-5 py-3 font-medium text-gray-600">Position</th>
                <th className="text-center px-5 py-3 font-medium text-gray-600">Volume</th>
                <th className="text-center px-5 py-3 font-medium text-gray-600">Difficulty</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((kw) => (
                <tr key={kw.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <span className="font-medium text-gray-900">{kw.keyword}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{kw.site?.domain || "—"}</td>
                  <td className="px-5 py-3 text-center">
                    <PositionBadge value={kw.position} />
                  </td>
                  <td className="px-5 py-3 text-center text-gray-600">
                    {kw.searchVolume !== null ? kw.searchVolume.toLocaleString() : "—"}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <DifficultyBadge value={kw.difficulty} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(kw.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add keyword</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Site</label>
              {sites.length === 0 ? (
                <p className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-3 text-center">
                  No verified sites.{" "}
                  <a href="/strony" className="text-green-600 hover:underline">Add a site →</a>
                </p>
              ) : (
                <select
                  value={newSiteId}
                  onChange={(e) => setNewSiteId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>{s.domain}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Keyword</label>
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="e.g. seo optimization"
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {addError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                {addError}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={adding || sites.length === 0}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
