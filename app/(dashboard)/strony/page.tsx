"use client";

import { useEffect, useState } from "react";
import { Plus, Globe, CheckCircle, XCircle, Zap, ZapOff, Trash2, X } from "lucide-react";
import { DomainVerification } from "@/components/dashboard/DomainVerification";
import { z } from "zod";

const domainSchema = z.object({
  domain: z
    .string()
    .min(3, "Podaj domenę")
    .regex(/^(https?:\/\/)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+/, "Podaj poprawną domenę"),
});

interface Site {
  id: string;
  domain: string;
  verified: boolean;
  autopilotEnabled: boolean;
  verificationToken: string;
  createdAt: string;
  _count?: { articles: number };
}

export default function StronyPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [verifyingSite, setVerifyingSite] = useState<Site | null>(null);
  const [domain, setDomain] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function fetchSites() {
    const res = await fetch("/api/sites");
    const data = await res.json();
    setSites(data.sites || []);
    setLoading(false);
  }

  useEffect(() => { fetchSites(); }, []);

  async function addSite(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    let cleaned = domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    const result = domainSchema.safeParse({ domain: cleaned });
    if (!result.success) {
      setFormError(result.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: cleaned }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setFormError(data.error || "Wystąpił błąd");
      return;
    }

    setShowModal(false);
    setDomain("");
    fetchSites();
    setVerifyingSite(data.site);
  }

  async function toggleAutopilot(site: Site) {
    await fetch(`/api/sites/${site.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autopilotEnabled: !site.autopilotEnabled }),
    });
    fetchSites();
  }

  async function deleteSite(id: string) {
    if (!confirm("Czy na pewno chcesz usunąć tę stronę? Wszystkie powiązane artykuły zostaną usunięte.")) return;
    await fetch(`/api/sites/${id}`, { method: "DELETE" });
    fetchSites();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Strony</h1>
          <p className="text-gray-500 text-sm mt-1">Zarządzaj swoimi domenami i SEO</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Dodaj stronę
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : sites.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium text-lg">Brak stron</p>
          <p className="text-gray-400 text-sm mt-1 mb-5">
            Dodaj swoją pierwszą domenę i uruchom SEO Autopilota.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Dodaj stronę
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sites.map((site) => (
            <div key={site.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{site.domain}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {site.verified ? (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" /> Zweryfikowana
                        </span>
                      ) : (
                        <button
                          onClick={() => setVerifyingSite(site)}
                          className="flex items-center gap-1 text-xs text-orange-600 hover:underline"
                        >
                          <XCircle className="h-3 w-3" /> Niezweryfikowana — kliknij aby zweryfikować
                        </button>
                      )}
                      {site.verified && (
                        <span className="text-xs text-gray-400">
                          • {site._count?.articles || 0} artykułów
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {site.verified && (
                    <button
                      onClick={() => toggleAutopilot(site)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        site.autopilotEnabled
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {site.autopilotEnabled ? (
                        <><Zap className="h-3 w-3" /> Autopilot ON</>
                      ) : (
                        <><ZapOff className="h-3 w-3" /> Autopilot OFF</>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => deleteSite(site.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Site Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Dodaj nową stronę</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={addSite} className="space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domena</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="np. mojablog.pl"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">Wpisz samą domenę bez https://</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? "Dodawanie..." : "Dodaj"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {verifyingSite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Weryfikacja domeny</h2>
              <button onClick={() => setVerifyingSite(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Zweryfikuj własność domeny <strong>{verifyingSite.domain}</strong>
            </p>
            <DomainVerification
              siteId={verifyingSite.id}
              domain={verifyingSite.domain}
              token={verifyingSite.verificationToken}
              onVerified={() => {
                setVerifyingSite(null);
                fetchSites();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
