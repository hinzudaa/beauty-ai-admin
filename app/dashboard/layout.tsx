"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { adminTokenStore } from "@/lib/api";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function PushToggle() {
  const [state, setState] = useState<"unknown"|"granted"|"denied"|"default">("unknown");

  useEffect(() => {
    if (!("Notification" in window)) { setState("denied"); return; }
    setState(Notification.permission as typeof state);
  }, []);

  async function enable() {
    const reg  = await navigator.serviceWorker.ready;
    const perm = await Notification.requestPermission();
    setState(perm as typeof state);
    if (perm !== "granted") return;

    const token = adminTokenStore.get();
    const r = await fetch(`${BASE}/admin/vapid-public-key`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { publicKey } = await r.json() as { publicKey: string };
    const padding = "=".repeat((4 - (publicKey.length % 4)) % 4);
    const b64     = (publicKey + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw     = atob(b64);
    const key     = new Uint8Array([...raw].map((c) => c.charCodeAt(0)));

    const sub  = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    const json = sub.toJSON();
    await fetch(`${BASE}/admin/push/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
    });
    setState("granted");
  }

  if (state === "unknown") return null;

  return (
    <button
      onClick={state === "granted" ? undefined : enable}
      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 ${
        state === "granted"
          ? "text-purple-400/70 cursor-default"
          : "text-white/40 hover:text-white/70 hover:bg-white/[0.04] cursor-pointer"
      }`}
    >
      <span>{state === "granted" ? "🔔" : "🔕"}</span>
      {state === "granted" ? "Мэдэгдэл идэвхтэй" : "Мэдэгдэл идэвхжүүлэх"}
    </button>
  );
}

const nav = [
  { href: "/dashboard",               label: "Самбар",    icon: "◈" },
  { href: "/dashboard/users",         label: "Хэрэглэгч", icon: "◉" },
  { href: "/dashboard/subscriptions", label: "Захиалга",  icon: "★" },
  { href: "/dashboard/payments",      label: "Төлбөр",    icon: "✦" },
  { href: "/dashboard/settings",      label: "Тохиргоо",  icon: "⚙" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname    = usePathname();
  const [open, setOpen] = useState(false);

  function logout() {
    adminTokenStore.clear();
    document.cookie = "beauty_admin_token=; path=/; max-age=0";
    window.location.href = "/login";
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-56 shrink-0 bg-white/[0.03] border-r border-white/[0.06] flex-col">
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
              <Link key={l.href} href={l.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/20"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }`}>
                <span className="text-xs">{l.icon}</span>
                {l.label === "Самбар" ? "Хянах самбар"
                  : l.label === "Хэрэглэгч" ? "Хэрэглэгчид"
                  : l.label === "Захиалга" ? "Захиалгууд"
                  : l.label === "Төлбөр" ? "Төлбөрүүд"
                  : "Тохиргоо"}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 space-y-1">
          <PushToggle />
          <button onClick={logout}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all">
            ← Гарах
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b border-white/[0.06]"
        style={{ background: "rgba(15,15,15,0.95)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-2">
          <span className="text-purple-400 text-lg">✦</span>
          <span className="font-bold text-sm">Beauty AI Admin</span>
        </div>
        <button onClick={() => setOpen((v) => !v)}
          className="flex flex-col gap-[5px] w-8 h-8 items-center justify-center bg-transparent border-none cursor-pointer">
          <span className={`block h-[2px] bg-white rounded-full transition-all duration-200 ${open ? "w-5 rotate-45 translate-y-[7px]" : "w-5"}`} />
          <span className={`block h-[2px] bg-white rounded-full transition-all duration-200 ${open ? "opacity-0 w-3" : "w-3 self-start"}`} />
          <span className={`block h-[2px] bg-white rounded-full transition-all duration-200 ${open ? "w-5 -rotate-45 -translate-y-[7px]" : "w-5"}`} />
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute top-[52px] left-0 right-0 border-b border-white/[0.06] py-3 px-4 space-y-1"
            style={{ background: "#0f0f0f" }}
            onClick={(e) => e.stopPropagation()}>
            {nav.map((l) => {
              const active = pathname === l.href;
              return (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                    active
                      ? "bg-purple-600/20 text-purple-300 border border-purple-500/20"
                      : "text-white/60 hover:bg-white/[0.04]"
                  }`}>
                  <span>{l.icon}</span>{l.label === "Самбар" ? "Хянах самбар"
                    : l.label === "Хэрэглэгч" ? "Хэрэглэгчид"
                    : l.label === "Захиалга" ? "Захиалгууд"
                    : l.label === "Төлбөр" ? "Төлбөрүүд" : "Тохиргоо"}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <PushToggle />
              <button onClick={logout} className="text-white/30 text-sm px-3 py-2 border-none bg-transparent cursor-pointer">← Гарах</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto pt-[52px] md:pt-0 pb-20 md:pb-0">
        <div className="p-4 md:p-8">{children}</div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-white/[0.06]"
        style={{ background: "rgba(15,15,15,0.97)", backdropFilter: "blur(12px)" }}>
        {nav.map((l) => {
          const active = pathname === l.href;
          return (
            <Link key={l.href} href={l.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-[0.6rem] font-medium transition-all ${
                active ? "text-purple-400" : "text-white/30"
              }`}>
              <span className="text-base leading-none">{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
