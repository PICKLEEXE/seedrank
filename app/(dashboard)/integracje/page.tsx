"use client";

import { useEffect, useState } from "react";
import { Plug, Plus, CheckCircle, X, Globe, Link as LinkIcon } from "lucide-react";

const CMS_OPTIONS = [
  { type: "wordpress", label: "WordPress", icon: "🔷", color: "bg-blue-50 border-blue-200" },
  { type: "ghost", label: "Ghost", icon: "👻", color: "bg-gray-50 border-gray-200" },
  { type: "webflow", label: "Webflow", icon: "🌊", color: "bg-purple-50 border-purple-200" },
];

interface Integration {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  credentials: { url?: string; domain?: string };
}

export default function IntegracjePage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCMS, setSelectedCMS] = useState<string | null>(null);
  const [cmsForm, setCmsForm] = useState({ url: "", username: "", appPassword: "" });
  const [gscConnected, setGscConnected] = useState(false);
  const [saving, setSaving] = useState(false);

  async function fetchIntegrations() {
    const res = await fetch("/api/integrations");
    const data = await res.json();
    const list: Integration[] = data.integrations || [];
    setIntegrations(list.filter((i) => i.type !== "gsc"));
    setGscConnected(list.some((i) => i.type === "gsc" && i.status === "connected"));
    setLoading(false);
  }

  useEffect(() => { fetchIntegrations(); }, []);

  async function connectGSC() {
    window.location.href = "/api/integrations/gsc";
  }

  async function saveCMS(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/integrations/wordpress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: selectedCMS, ...cmsForm }),
    });
    setSaving(false);
    if (res.ok) {
      setShowModal(false);
      setSelectedCMS(null);
      setCmsForm({ url: "", username: "", appPassword: "" });
      fetchIntegrations();
    }
  }

  async function deleteIntegration(id: string) {
    if (!confirm("Odłączyć integrację?")) return;
    await fetch(`/api/integrations/${id}`, { method: "DELETE" });
    fetchIntegrations();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integracje</h1>
        <p className="text-gray-500 text-sm mt-1">Połącz swoje narzędzia analityczne i CMS</p>
      </div>

      {/* Analytics section */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Integracje analityczne
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">
                🔍
              </div>
              <div>
                <p className="font-semibold text-gray-900">Google Search Console</p>
                <p className="text-sm text-gray-500">Monitoruj pozycje i ruch organiczny</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {gscConnected ? (
                <span className="flex items-center gap-1.5 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                  <CheckCircle className="h-4 w-4" /> Połączono
                </span>
              ) : (
                <button
                  onClick={connectGSC}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Połącz GSC
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CMS section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Integracje CMS
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            <Plus className="h-4 w-4" />
            Dodaj integrację
          </button>
        </div>

        {loading ? (
          <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
        ) : integrations.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <Plug className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Brak integracji</p>
            <p className="text-gray-400 text-sm mt-1 mb-5">
              Połącz swój CMS, aby automatycznie publikować artykuły
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Dodaj integrację
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {integrations.map((integration) => {
              const cms = CMS_OPTIONS.find((c) => c.type === integration.type);
              return (
                <div key={integration.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">
                      {cms?.icon || "🔌"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{cms?.label || integration.type}</p>
                      <p className="text-sm text-gray-500">{integration.credentials?.url || ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      integration.status === "connected" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {integration.status === "connected" ? "Połączono" : integration.status}
                    </span>
                    <button
                      onClick={() => deleteIntegration(integration.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add CMS Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Dodaj integrację CMS</h2>
              <button onClick={() => { setShowModal(false); setSelectedCMS(null); }} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {!selectedCMS ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">Wybierz platformę CMS:</p>
                {CMS_OPTIONS.map((cms) => (
                  <button
                    key={cms.type}
                    onClick={() => setSelectedCMS(cms.type)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 hover:border-green-300 transition-colors ${cms.color}`}
                  >
                    <span className="text-3xl">{cms.icon}</span>
                    <span className="font-semibold text-gray-900">{cms.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={saveCMS} className="space-y-4">
                <p className="text-sm text-gray-600">
                  Połącz <strong>{CMS_OPTIONS.find((c) => c.type === selectedCMS)?.label}</strong>
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL strony</label>
                  <input
                    type="url"
                    value={cmsForm.url}
                    onChange={(e) => setCmsForm({ ...cmsForm, url: e.target.value })}
                    placeholder="https://mojablog.pl"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa użytkownika</label>
                  <input
                    type="text"
                    value={cmsForm.username}
                    onChange={(e) => setCmsForm({ ...cmsForm, username: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hasło aplikacji</label>
                  <input
                    type="password"
                    value={cmsForm.appPassword}
                    onChange={(e) => setCmsForm({ ...cmsForm, appPassword: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Utwórz hasło aplikacji w WP Admin → Użytkownicy → Twój profil
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setSelectedCMS(null)} className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium">
                    Wróć
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                    {saving ? "Łączenie..." : "Połącz"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
