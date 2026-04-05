"use client";

import { useState } from "react";
import { KeyRound, Eye, EyeOff, Copy, CheckCircle, RefreshCw } from "lucide-react";

export default function ApiPage() {
  const [demoMode, setDemoMode] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openaiKey, setOpenaiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const demoApiKey = "rnk_demo_xxxxxxxxxxxxxxxxxxxxxxxxxxxx";

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function saveSettings() {
    setSaving(true);
    await fetch("/api/user/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ demoMode, openaiKey }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
        <p className="text-gray-500 text-sm mt-1">Manage API keys and operating mode</p>
      </div>

      {/* Demo Mode Toggle */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-gray-900">Demo Mode</h2>
            <p className="text-sm text-gray-500 mt-1">
              Use built-in demo data without real API keys.
              Ideal for testing the platform.
            </p>
          </div>
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors ${demoMode ? "bg-green-500" : "bg-gray-200"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${demoMode ? "translate-x-6" : ""}`} />
          </button>
        </div>

        {demoMode && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              ✓ Demo Mode active
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              Article, keyword, and backlink generation uses simulated data.
            </p>
          </div>
        )}
      </div>

      {/* RankRoot API Key */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="h-4 w-4 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Your RankRoot API Key</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm">
            {showKey ? demoApiKey : "rnk_demo_••••••••••••••••••••••••••••••"}
          </div>
          <button onClick={() => setShowKey(!showKey)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button onClick={() => copy(demoApiKey)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* External API Keys */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">External API keys</h2>

        <div className={`space-y-4 ${demoMode ? "opacity-50 pointer-events-none" : ""}`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API Key
              <span className="text-xs text-gray-400 ml-2">(for content generation)</span>
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-mono"
            />
          </div>
        </div>

        {demoMode && (
          <p className="text-xs text-gray-400 mt-3">
            Disable Demo Mode to configure external API keys.
          </p>
        )}
      </div>

      <button
        onClick={saveSettings}
        disabled={saving}
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
      >
        {saved ? "✓ Saved" : saving ? "Saving..." : "Save settings"}
      </button>
    </div>
  );
}
