"use client";

import { useEffect, useState } from "react";
import { Check, Zap } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceYearly: 0,
    sites: 1,
    articles: 5,
    keywords: 10,
    team: 1,
    integrations: 1,
    backlinks: 5,
    features: ["SEO Autopilot", "API", "Agency mode", "AI corrections"],
    featureFlags: [false, false, false, false],
    highlight: false,
  },
  {
    id: "beginner",
    name: "Beginner",
    price: 99,
    priceYearly: 79,
    sites: 2,
    articles: 30,
    keywords: 20,
    team: 2,
    integrations: 5,
    backlinks: 50,
    features: ["SEO Autopilot", "API", "Agency mode", "AI corrections"],
    featureFlags: [true, false, false, true],
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 299,
    priceYearly: 239,
    sites: 10,
    articles: 100,
    keywords: 100,
    team: 5,
    integrations: 10,
    backlinks: 150,
    features: ["SEO Autopilot", "API", "Agency mode", "AI corrections"],
    featureFlags: [true, true, false, true],
    highlight: true,
  },
  {
    id: "ultimate",
    name: "Ultimate",
    price: 599,
    priceYearly: 479,
    sites: 20,
    articles: 300,
    keywords: 200,
    team: 15,
    integrations: 50,
    backlinks: 500,
    features: ["SEO Autopilot", "API", "Agency mode", "AI corrections"],
    featureFlags: [true, true, true, true],
    highlight: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 999,
    priceYearly: 799,
    sites: 50,
    articles: 600,
    keywords: 500,
    team: Infinity,
    integrations: 100,
    backlinks: 1000,
    features: ["SEO Autopilot", "API", "Agency mode", "AI corrections"],
    featureFlags: [true, true, true, true],
    highlight: false,
  },
];

export default function PlatnosciPage() {
  const [yearly, setYearly] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [usage, setUsage] = useState({ articles: 0, sites: 0, keywords: 0, backlinks: 0 });
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/plan").then((r) => r.json()).then((d) => {
      setCurrentPlan(d.planId || "free");
      setUsage(d.usage || {});
    });
  }, []);

  async function upgradePlan(planId: string) {
    if (planId === "free") return;
    setLoadingPlan(planId);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, yearly }),
    });
    const data = await res.json();
    setLoadingPlan(null);
    if (data.url) window.location.href = data.url;
  }

  const plan = PLANS.find((p) => p.id === currentPlan) || PLANS[0];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 text-sm mt-1">
          Current plan:{" "}
          <span className="font-semibold text-green-600">{plan.name}</span>
        </p>
      </div>

      {/* Usage */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Usage this month</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UsageBar label="Articles" used={usage.articles} max={plan.articles} />
          <UsageBar label="Sites" used={usage.sites} max={plan.sites} />
          <UsageBar label="Keywords" used={usage.keywords} max={plan.keywords} />
          <UsageBar label="Backlinks" used={usage.backlinks} max={plan.backlinks} />
        </div>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm font-medium ${!yearly ? "text-gray-900" : "text-gray-400"}`}>
          Monthly
        </span>
        <button
          onClick={() => setYearly(!yearly)}
          className={`relative w-11 h-6 rounded-full transition-colors ${yearly ? "bg-green-500" : "bg-gray-200"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${yearly ? "translate-x-5" : ""}`} />
        </button>
        <span className={`text-sm font-medium ${yearly ? "text-gray-900" : "text-gray-400"}`}>
          Yearly{" "}
          <span className="text-green-600 font-semibold">-20%</span>
        </span>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {PLANS.map((p) => {
          const isActive = p.id === currentPlan;
          const price = yearly ? p.priceYearly : p.price;

          return (
            <div
              key={p.id}
              className={`relative bg-white rounded-xl border-2 p-5 flex flex-col ${
                p.highlight ? "border-green-500 shadow-lg shadow-green-100" : "border-gray-200"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-bold text-gray-900">{p.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-gray-900">{price}</span>
                  <span className="text-gray-500 text-sm">/mo</span>
                </div>
              </div>

              <ul className="space-y-1.5 text-xs text-gray-600 mb-5 flex-1">
                <li>✓ {p.sites} site{p.sites > 1 ? "s" : ""}</li>
                <li>✓ {p.articles} articles</li>
                <li>✓ {p.keywords} keywords</li>
                <li>✓ {p.team === Infinity ? "∞" : p.team} team members</li>
                <li>✓ {p.integrations} integrations</li>
                <li>✓ {p.backlinks} backlinks</li>
                <div className="my-2 border-t border-gray-100" />
                {p.features.map((feat, i) => (
                  <li key={feat} className={p.featureFlags[i] ? "text-gray-700" : "text-gray-300 line-through"}>
                    {p.featureFlags[i] ? "✓" : "✗"} {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => upgradePlan(p.id)}
                disabled={isActive || loadingPlan === p.id || p.id === "free"}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-green-50 text-green-700 cursor-default border border-green-200"
                    : p.id === "free"
                    ? "bg-gray-50 text-gray-400 cursor-default"
                    : p.highlight
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {isActive
                  ? "Current plan"
                  : loadingPlan === p.id
                  ? "Loading..."
                  : p.id === "free"
                  ? "Current plan"
                  : "Choose plan"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UsageBar({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = max > 0 ? Math.min((used / max) * 100, 100) : 0;
  const isNearLimit = pct > 80;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className={`font-medium ${isNearLimit ? "text-orange-600" : "text-gray-500"}`}>
          {used} / {max === Infinity ? "∞" : max}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isNearLimit ? "bg-orange-400" : "bg-green-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
