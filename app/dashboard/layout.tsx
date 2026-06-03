"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminTokenStore } from "@/lib/api";

const nav = [
  { href: "/dashboard",          label: "Хянах самбар", icon: "◈" },
  { href: "/dashboard/users",    label: "Хэрэглэгчид",  icon: "◉" },
  { href: "/dashboard/payments", label: "Төлбөрүүд",    icon: "✦" },
  { href: "/dashboard/settings", label: "Тохиргоо",     icon: "⚙" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function logout() {
    adminTokenStore.clear();
    document.cookie = "beauty_admin_token=; path=/; max-age=0";
    window.location.href = "/login";
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 bg-white/[0.03] border-r border-white/[0.06] flex flex-col">
        <div className="px-5 py-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="text-purple-400">✦</span>
            <span className="font-bold text-sm tracking-wide">Beauty AI</span>
          </div>
          <p className="text-[0.6rem] text-white/30 uppercase tracking-widest mt-1">Admin panel</p>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {nav.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/20"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }`}
              >
                <span className="text-xs">{l.icon}</span>
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4">
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all"
          >
            ← Гарах
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
