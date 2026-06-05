"use client";

import { useState } from "react";
import useSWR from "swr";
import { adminFetcher, request } from "@/lib/api";

interface Subscription { plan: string; expiresAt: string; }
interface User {
  id: string;
  phone: string;
  phoneVerified: boolean;
  subscription: Subscription | null;
  createdAt: string;
}
interface UsersResponse { data: User[]; total: number; page: number; pages: number; }

const PLANS = [
  { id: "basic",    label: "Basic",    color: "text-blue-400",   desc: "5 шинжилгээ · 2 зураг",  days: 30 },
  { id: "standard", label: "Standard", color: "text-gray-400",   desc: "10 шинжилгээ · 2 зураг", days: 30 },
  { id: "pro",      label: "Pro ⭐",   color: "text-purple-400", desc: "10 шинжилгээ · 4 зураг", days: 30 },
];

const CELL = "px-4 py-3 text-sm";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Grant modal state
  const [modal, setModal]       = useState<User | null>(null);
  const [selPlan, setSelPlan]   = useState("pro");
  const [selDays, setSelDays]   = useState(30);
  const [granting, setGranting] = useState(false);
  const [msg, setMsg]           = useState<{ ok: boolean; text: string } | null>(null);

  const url = `/admin/users?page=${page}&limit=20${search ? `&search=${encodeURIComponent(search)}` : ""}`;
  const { data, isLoading, mutate } = useSWR<UsersResponse>(url, adminFetcher, { revalidateOnFocus: false });

  function openModal(u: User) {
    setModal(u);
    setSelPlan(u.subscription?.plan ?? "pro");
    setSelDays(30);
    setMsg(null);
  }

  async function handleGrant() {
    if (!modal) return;
    setGranting(true); setMsg(null);
    try {
      await request(`/admin/users/${modal.id}/grant`, {
        method: "PATCH",
        body: JSON.stringify({ plan: selPlan, days: selDays }),
      });
      setMsg({ ok: true, text: `✓ ${modal.phone}-д ${selPlan.toUpperCase()} эрх олгогдлоо` });
      mutate();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Алдаа гарлаа" });
    } finally {
      setGranting(false);
    }
  }

  async function handleRevoke(u: User) {
    if (!confirm(`${u.phone}-ийн захиалгыг устгах уу?`)) return;
    try {
      await request(`/admin/users/${u.id}/subscription`, { method: "DELETE" });
      mutate();
    } catch { /* ignore */ }
  }

  const planColor = (plan?: string) => {
    if (plan === "pro")      return "text-purple-400 bg-purple-400/10 border-purple-400/20";
    if (plan === "standard") return "text-gray-300  bg-gray-300/10  border-gray-300/20";
    if (plan === "basic")    return "text-blue-400  bg-blue-400/10  border-blue-400/20";
    return "";
  };

  return (
    <div>
      <div className="mb-5 sm:mb-8 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-semibold text-white">Хэрэглэгчид</h1>
          <p className="text-sm text-white/40 mt-1">Нийт {data?.total ?? 0} хэрэглэгч</p>
        </div>
        <input
          type="text" placeholder="Утасны дугаараар хайх..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full sm:w-56 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-purple-500/50 transition-all placeholder:text-white/20"
        />
      </div>

      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {["Утас", "Захиалга", "Баталгаажилт", "Бүртгэгдсэн", "Үйлдэл"].map((h) => (
                  <th key={h} className={`${CELL} text-left text-xs text-white/30 uppercase tracking-widest font-medium`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(10)].map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    {[...Array(5)].map((__, j) => (
                      <td key={j} className={CELL}><div className="h-4 bg-white/[0.06] rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
                : data?.data.map((u) => (
                  <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                    <td className={`${CELL} text-white font-medium`}>{u.phone}</td>

                    {/* Subscription */}
                    <td className={CELL}>
                      {u.subscription
                        ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold border px-2 py-0.5 rounded-full ${planColor(u.subscription.plan)}`}>
                              {u.subscription.plan.toUpperCase()}
                            </span>
                            <span className="text-[0.7rem] text-white/30">
                              {new Date(u.subscription.expiresAt).toLocaleDateString("mn-MN")} хүртэл
                            </span>
                          </div>
                        )
                        : <span className="text-xs text-white/20">—</span>
                      }
                    </td>

                    <td className={CELL}>
                      {u.phoneVerified
                        ? <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">✓ Баталгаажсан</span>
                        : <span className="text-xs text-white/30">Баталгаажаагүй</span>
                      }
                    </td>
                    <td className={`${CELL} text-white/40 text-xs`}>{new Date(u.createdAt).toLocaleDateString("mn-MN")}</td>

                    {/* Actions */}
                    <td className={`${CELL}`}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(u)}
                          className="text-xs font-semibold text-purple-400 bg-purple-400/10 border border-purple-400/20 px-3 py-1 rounded-full hover:bg-purple-400/20 transition-all"
                        >
                          Эрх өгөх
                        </button>
                        {u.subscription && (
                          <button
                            onClick={() => handleRevoke(u)}
                            className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
                          >
                            Устгах
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.07]">
            <p className="text-xs text-white/30">{page} / {data.pages} хуудас</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/50 hover:text-white disabled:opacity-30 transition-all">
                ← Өмнөх
              </button>
              <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages}
                className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/50 hover:text-white disabled:opacity-30 transition-all">
                Дараах →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Grant permission modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-[1] w-full max-w-[380px] bg-[#1a1a1f] border border-white/[0.1] rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.5)]">

            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-xs text-white/40 mb-1">Эрх олгох</p>
                <p className="text-base font-bold text-white">{modal.phone}</p>
                {modal.subscription && (
                  <p className="text-xs text-white/30 mt-0.5">
                    Одоогийн: {modal.subscription.plan.toUpperCase()} · {new Date(modal.subscription.expiresAt).toLocaleDateString("mn-MN")} хүртэл
                  </p>
                )}
              </div>
              <button onClick={() => setModal(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.06] text-white/40 hover:text-white text-sm border-none cursor-pointer transition-all">
                ×
              </button>
            </div>

            {/* Plan selection */}
            <div className="space-y-2 mb-4">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Багц сонгох</p>
              {PLANS.map((p) => (
                <button key={p.id} type="button" onClick={() => setSelPlan(p.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all cursor-pointer
                    ${selPlan === p.id
                      ? "bg-purple-500/10 border-purple-500/40"
                      : "bg-white/[0.03] border-white/[0.07] hover:border-white/20"
                    }`}>
                  <div>
                    <p className={`text-sm font-bold ${selPlan === p.id ? "text-white" : "text-white/60"}`}>{p.label}</p>
                    <p className="text-xs text-white/30 mt-0.5">{p.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 transition-all flex-shrink-0
                    ${selPlan === p.id ? "bg-purple-500 border-purple-500" : "border-white/20"}`} />
                </button>
              ))}
            </div>

            {/* Days selection */}
            <div className="mb-5">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Хугацаа</p>
              <div className="grid grid-cols-4 gap-2">
                {[7, 14, 30, 90].map((d) => (
                  <button key={d} type="button" onClick={() => setSelDays(d)}
                    className={`py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer
                      ${selDays === d
                        ? "bg-purple-500/20 border-purple-500/50 text-white"
                        : "bg-white/[0.03] border-white/[0.07] text-white/40 hover:text-white/70"
                      }`}>
                    {d}өдөр
                  </button>
                ))}
              </div>
            </div>

            {/* Result message */}
            {msg && (
              <p className={`text-xs px-3 py-2 rounded-lg mb-4 ${msg.ok ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
                {msg.text}
              </p>
            )}

            {/* Confirm */}
            <button
              type="button"
              onClick={handleGrant}
              disabled={granting}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-br from-purple-600 to-violet-600
                disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none
                hover:shadow-[0_4px_20px_rgba(147,51,234,0.4)] transition-all"
            >
              {granting ? "Олгож байна..." : `${selPlan.toUpperCase()} эрх олгох — ${selDays} өдөр`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
