"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Globe,
  FileText,
  TrendingUp,
  Share2,
  Plug,
  Building2,
  CreditCard,
  KeyRound,
  Users,
  Tag,
} from "lucide-react";

const mainNav = [
  { href: "/panel", label: "Dashboard", icon: LayoutDashboard },
  { href: "/strony", label: "Sites", icon: Globe },
  { href: "/artykuly", label: "Articles", icon: FileText },
  { href: "/slowa-kluczowe", label: "Keywords", icon: Tag },
  { href: "/wydajnosc", label: "Performance", icon: TrendingUp },
  { href: "/social", label: "Social Media", icon: Share2 },
  { href: "/integracje", label: "Integrations", icon: Plug },
];

const settingsNav = [
  { href: "/ustawienia/organizacja", label: "Organization", icon: Building2 },
  { href: "/ustawienia/platnosci", label: "Billing", icon: CreditCard },
  { href: "/ustawienia/api", label: "API Keys", icon: KeyRound },
  { href: "/ustawienia/zespol", label: "Team", icon: Users },
];

export function Sidebar({ planId = "free" }: { planId?: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">
            rankroot <span className="text-green-500">AI</span>
          </span>
          <span className="text-xs font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase">
            {planId}
          </span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {mainNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}

        <div className="pt-4 pb-1">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Settings
          </p>
        </div>

        {settingsNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
