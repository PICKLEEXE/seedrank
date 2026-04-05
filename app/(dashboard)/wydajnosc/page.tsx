"use client";

import { useEffect, useState } from "react";
import { TrendingUp, MousePointerClick, Eye, BarChart2, Loader2 } from "lucide-react";
import Link from "next/link";

interface ChartRow {
  date: string;
  clicks: number;
  impressions: number;
}

interface TopQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GscData {
  connected: boolean;
  sites?: string[];
  chart?: ChartRow[];
  totals?: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  topQueries?: TopQuery[];
}

const DAYS_OPTIONS = [
  { value: 7, label: "7 dni" },
  { value: 28, label: "28 dni" },
  { value: 90, label: "90 dni" },
];

export default function WydajnoscPage() {
  const [data, setData] = useState<GscData | null>(null);
  const [selectedSite, setSelectedSite] = useState("");
  const [days, setDays] = useState(28);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gsc")
      .then((r) => r.json())
      .then((d: GscData) => {
        setData(d);
        if (d.sites && d.sites.length > 0) setSelectedSite(d.sites[0]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedSite) return;
    setLoading(true);
    fetch(`/api/gsc?siteUrl=${encodeURIComponent(selectedSite)}&days=${days}`)
      .then((r) => r.json())
      .then((d: GscData) => {
        setData((prev) => ({ ...prev, ...d }));
        setLoading(false);
      });
  }, [selectedSite, days]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!data.connected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wydajność</h1>
          <p className="text-gray-500 text-sm mt-1">Analityka SEO i ruch organiczny</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Połącz Google Search Console</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">
            Podłącz GSC aby zobaczyć dane o ruchu i pozycjach.
          </p>
          <Link
            href="/integracje"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Połącz GSC →
          </Link>
        </div>
      </div>
    );
  }

  const maxClicks = Math.max(...(data.chart?.map((r) => r.clicks) ?? [1]), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wydajność</h1>
          <p className="text-gray-500 text-sm mt-1">Analityka SEO i ruch organiczny</p>
        </div>
        <div className="flex gap-2">
          {data.sites && data.sites.length > 1 && (
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              {data.sites.map((s) => (
                <option key={s} value={s}>{s.replace(/^https?:\/\//, "")}</option>
              ))}
            </select>
          )}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden text-sm">
            {DAYS_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setDays(value)}
                className={`px-3 py-2 transition-colors ${
                  days === value
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                <MousePointerClick className="h-4 w-4" /> Kliknięcia
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {(data.totals?.clicks ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                <Eye className="h-4 w-4" /> Wyświetlenia
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {(data.totals?.impressions ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                <BarChart2 className="h-4 w-4" /> CTR
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {data.totals?.ctr ?? 0}%
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                <TrendingUp className="h-4 w-4" /> Śr. pozycja
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {data.totals?.position ?? "—"}
              </p>
            </div>
          </div>

          {/* Chart */}
          {data.chart && data.chart.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Kliknięcia w czasie</h2>
              <div className="flex items-end gap-1 h-32">
                {data.chart.map((row) => (
                  <div
                    key={row.date}
                    className="flex-1 flex flex-col items-center gap-1 group relative"
                  >
                    <div
                      className="w-full bg-green-400 rounded-t hover:bg-green-500 transition-colors cursor-pointer"
                      style={{ height: `${Math.max((row.clicks / maxClicks) * 100, 2)}%` }}
                      title={`${row.date}: ${row.clicks} kliknięć`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>{data.chart[0]?.date}</span>
                <span>{data.chart[data.chart.length - 1]?.date}</span>
              </div>
            </div>
          )}

          {/* Top queries */}
          {data.topQueries && data.topQueries.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">Top zapytania</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Zapytanie</th>
                    <th className="text-right px-5 py-3 font-medium text-gray-600">Kliknięcia</th>
                    <th className="text-right px-5 py-3 font-medium text-gray-600">Wyświetlenia</th>
                    <th className="text-right px-5 py-3 font-medium text-gray-600">CTR</th>
                    <th className="text-right px-5 py-3 font-medium text-gray-600">Pozycja</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topQueries.map((q) => (
                    <tr key={q.query} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-900 max-w-[300px] truncate">{q.query}</td>
                      <td className="px-5 py-3 text-right text-gray-700">{q.clicks.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-gray-500">{q.impressions.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-gray-500">{q.ctr}%</td>
                      <td className="px-5 py-3 text-right text-gray-500">{q.position}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
