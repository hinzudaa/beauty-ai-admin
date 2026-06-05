"use client";

import { useState } from "react";
import useSWR from "swr";
import { adminFetcher, request } from "@/lib/api";

interface Settings {
  basicPrice:    number;
  standardPrice: number;
  proPrice:      number;
  basicLimit:    number;
  standardLimit: number;
  proLimit:      number;
}

const CARD = "bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 sm:p-6";

const PACKAGES = [
  {
    key:   "basicPrice" as const,
    name:  "Basic",
    icon:  "◈",
    color: "text-blue-400",
    desc:  "Сард 5 шинжилгээ · 2 AI Look зураг",
  },
  {
    key:   "standardPrice" as const,
    name:  "Standard",
    icon:  "◉",
    color: "text-gray-400",
    desc:  "Сард 10 шинжилгээ · 2 AI Look зураг",
    decoy: true,
  },
  {
    key:   "proPrice" as const,
    name:  "Pro",
    icon:  "★",
    color: "text-purple-400",
    desc:  "Сард 10 шинжилгээ · 4 AI Look зураг · AI Стилист чат",
  },
] satisfies Array<{ key: PriceKey; name: string; icon: string; color: string; desc: string; decoy?: true }>;

const LIMIT_PACKAGES = [
  { key: "basicLimit"    as const, plan: "Basic",    color: "text-blue-400"   },
  { key: "standardLimit" as const, plan: "Standard", color: "text-gray-400"   },
  { key: "proLimit"      as const, plan: "Pro",      color: "text-purple-400" },
] satisfies Array<{ key: LimitKey; plan: string; color: string }>;

type PriceKey = "basicPrice" | "standardPrice" | "proPrice";
type LimitKey = "basicLimit" | "standardLimit" | "proLimit";

export default function SettingsPage() {
  const { data, isLoading, mutate } = useSWR<Settings>("/admin/settings", adminFetcher);

  const [prices, setPrices] = useState<Partial<Record<PriceKey | LimitKey, string>>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const limitKeys = ["basicLimit", "standardLimit", "proLimit"];
    const updates: Partial<Record<PriceKey | LimitKey, number>> = {};
    for (const [k, v] of Object.entries(prices)) {
      if (!v) continue;
      const num = parseInt(v, 10);
      if (isNaN(num) || num < 1) {
        setMsg({ type: "err", text: `${k}: 1-ээс их байх ёстой` });
        return;
      }
      if (!limitKeys.includes(k) && num < 100) {
        setMsg({ type: "err", text: `${k}: хамгийн багадаа 100₮ байх ёстой` });
        return;
      }
      updates[k as PriceKey | LimitKey] = num;
    }

    if (!Object.keys(updates).length) {
      setMsg({ type: "err", text: "Өөрчлөх үнэ оруулна уу" });
      return;
    }

    setSaving(true);
    try {
      const updated = await request<Settings>("/admin/settings", {
        method: "PUT",
        body:   JSON.stringify(updates as Record<string, number>),
      });
      mutate(updated, false);
      setPrices({});
      setMsg({ type: "ok", text: "Үнэ амжилттай хадгаллаа" });
    } catch (err) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Алдаа гарлаа" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-white">Тохиргоо</h1>
        <p className="text-sm text-white/40 mt-1">Сарын захиалгын багцын QPay үнэ</p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-4">

        {/* Price info note */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-xs text-yellow-400/80">
          ★ Standard нь decoy pricing — Basic-аас бага зэрэг үнэтэй тул хэрэглэгчид Pro-г сонгоход урам өгдөг.
        </div>

        {PACKAGES.map((pkg) => {
          const current = data?.[pkg.key];
          return (
            <div key={pkg.key} className={`${CARD} ${pkg.decoy ? "border-white/[0.04]" : ""}`}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className={`text-xl ${pkg.color}`}>{pkg.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{pkg.name} захиалга</p>
                      {pkg.decoy && (
                        <span className="text-[0.6rem] font-bold text-yellow-400/80 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-2 py-0.5">
                          Decoy
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/30 mt-0.5">{pkg.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/30 mb-1">Одоогийн үнэ</p>
                  {isLoading
                    ? <div className="h-7 w-24 bg-white/10 rounded animate-pulse" />
                    : <p className="text-xl font-bold text-white">{current?.toLocaleString() ?? "—"}₮</p>
                  }
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  type="number" min={100} step={1}
                  value={prices[pkg.key] ?? ""}
                  onChange={(e) => { setPrices((p) => ({ ...p, [pkg.key]: e.target.value })); setMsg(null); }}
                  placeholder={current?.toString() ?? "Шинэ үнэ"}
                  className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 transition-all"
                />
                <span className="flex items-center text-sm text-white/30 pr-1">₮</span>
              </div>
            </div>
          );
        })}

        {/* Limit section */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 text-xs text-blue-400/80 mt-2">
          ◈ Сарын хүсэлтийн хязгаар — хэрэглэгч тухайн сард хийж болох шинжилгээний тоо
        </div>

        {LIMIT_PACKAGES.map((pkg) => {
          const current = data?.[pkg.key];
          return (
            <div key={pkg.key} className={CARD}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`text-xl ${pkg.color}`}>◈</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{pkg.plan} хязгаар</p>
                    <p className="text-xs text-white/30 mt-0.5">Сарын хүсэлтийн дээд тоо</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/30 mb-1">Одоогийн</p>
                  {isLoading
                    ? <div className="h-7 w-16 bg-white/10 rounded animate-pulse" />
                    : <p className="text-xl font-bold text-white">{current ?? "—"} <span className="text-sm font-normal text-white/30">хүсэлт</span></p>
                  }
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  type="number" min={1} max={100} step={1}
                  value={prices[pkg.key] ?? ""}
                  onChange={(e) => { setPrices((p) => ({ ...p, [pkg.key]: e.target.value })); setMsg(null); }}
                  placeholder={current?.toString() ?? "Шинэ хязгаар"}
                  className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 transition-all"
                />
                <span className="flex items-center text-sm text-white/30 pr-1">хүсэлт</span>
              </div>
            </div>
          );
        })}

        {msg && (
          <p className={`text-xs px-4 py-2.5 rounded-xl border ${
            msg.type === "ok"
              ? "text-green-400 bg-green-400/10 border-green-400/20"
              : "text-red-400 bg-red-400/10 border-red-400/20"
          }`}>
            {msg.text}
          </p>
        )}

        <button type="submit" disabled={saving}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all">
          {saving ? "Хадгалж байна..." : "Бүгдийг хадгалах"}
        </button>

        {/* Credential card */}
        <div className={CARD}>
          <h2 className="text-sm font-medium text-white/70 mb-4">Нэвтрэх мэдээлэл</h2>
          <div className="space-y-2">
            {[{ label: "Нэвтрэх нэр", value: "admin" }, { label: "Нууц үг", value: "••••" }].map((r) => (
              <div key={r.label} className="flex justify-between text-sm py-2 border-b border-white/[0.05]">
                <span className="text-white/40">{r.label}</span>
                <span className="text-white/60 font-mono">{r.value}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/20">Нэвтрэх мэдээллийг .env файлаас өөрчилнө</p>
        </div>
      </form>
    </div>
  );
}
