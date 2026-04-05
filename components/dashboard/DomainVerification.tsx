"use client";

import { useState } from "react";
import { Copy, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  siteId: string;
  domain: string;
  token: string;
  onVerified: () => void;
}

export function DomainVerification({ siteId, domain, token, onVerified }: Props) {
  const [tab, setTab] = useState<"txt" | "dns">("txt");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [bypassConfirm, setBypassConfirm] = useState(false);

  const fileUrl = `${domain}/rankroot-verify.txt`;
  const fileContent = `rankroot-verify-${token}`;

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function verify() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/sites/${siteId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: tab }),
      });
      const data = await res.json();
      if (data.success) {
        onVerified();
      } else {
        setError("Weryfikacja nie powiodła się. Sprawdź czy plik/rekord jest dostępny.");
      }
    } catch {
      setError("Błąd połączenia. Spróbuj ponownie.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setTab("dns")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "dns"
              ? "border-green-500 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Rekord DNS
        </button>
        <button
          onClick={() => setTab("txt")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "txt"
              ? "border-green-500 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Plik weryfikacyjny
        </button>
      </div>

      {tab === "txt" && (
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">Adres pliku:</p>
            <code className="block bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 break-all">
              {fileUrl}
            </code>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Zawartość pliku:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 break-all">
                {fileContent}
              </code>
              <button
                onClick={() => copy(fileContent)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Kopiuj"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Utwórz plik <code className="bg-gray-100 px-1 rounded">rankroot-verify.txt</code> w katalogu głównym
            swojej domeny i wklej powyższą zawartość.
          </p>
        </div>
      )}

      {tab === "dns" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Dodaj rekord TXT do DNS swojej domeny:</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex gap-4">
              <span className="text-gray-500 w-16 flex-shrink-0">Typ:</span>
              <code>TXT</code>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-500 w-16 flex-shrink-0">Nazwa:</span>
              <code>@</code>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-500 w-16 flex-shrink-0">Wartość:</span>
              <div className="flex items-center gap-2 flex-1">
                <code className="break-all">{fileContent}</code>
                <button onClick={() => copy(fileContent)} className="flex-shrink-0 p-1 hover:bg-gray-200 rounded">
                  {copied ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-gray-500" />}
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400">Propagacja DNS może zająć do 24h.</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        {!bypassConfirm ? (
          <button
            type="button"
            onClick={() => setBypassConfirm(true)}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Nie możesz dodać rekordu DNS? Potwierdzam, że jestem właścicielem tej domeny
          </button>
        ) : (
          <span className="text-xs text-green-600 font-medium">✓ Własność potwierdzona</span>
        )}
        <button
          onClick={verify}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Weryfikacja..." : "Zweryfikuj"}
        </button>
      </div>
    </div>
  );
}
