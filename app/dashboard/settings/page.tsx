"use client";

import { useState } from "react";
import useSWR from "swr";
import { adminFetcher, request } from "@/lib/api";

interface Settings {
  basicPrice: number;
  proPrice:   number;
}

const CARD = "bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6";

const PACKAGES = [
  {
    key:   "basicPrice" as const,
    name:  "Basic",
    icon:  "◈",
    color: "text-blue-400",
    limit: 20,
    desc:  "Сард 20 шинжилгээ · Нүүр + Үс + Хувцас нэгэн зэрэг · Look татах",
  },
  {
    key:   "proPrice" as const,
    name:  "Pro",
    icon:  "★",
    color: "text-purple-400",
    limit: 40,
    desc:  "Сард 40 шинжилгээ · AI Personal Stylist Chat · Бүх Basic боломж",
  },
] as const;

type PriceKey = keyof Settings;

export default function SettingsPage() {
  const { data, isLoading, mutate } = useSWR<Settings>("/admin/settings", adminFetcher);

  const [prices, setPrices]   = useState<Partial<Record<PriceKey, string>>>({});
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const updates: Partial<Record<PriceKey, number>> = {};
    for (const [k, v] of Object.entries(prices)) {
      if (!v) continue;
      const num = parseInt(v, 10);
      if (isNaN(num) || num < 100) {
        setMsg({ type: "err", text: `${k}: хамгийн багадаа 100₮ байх ёстой` });
        return;
      }
      updates[k as PriceKey] = num;
    }

    if (!Object.keys(updates).length) {
      setMsg({ type: "err", text: "Өөрчлөх үнэ оруулна уу" });
      return;
    }

    setSaving(true);
    try {
      const updated = await request<Settings>("/admin/settings", {
        method: "PUT",
        body:   JSON.stringify(updates),
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
        <h1 className="text-2xl font-semibold text-white">Тохиргоо</h1>
        <p className="text-sm text-white/40 mt-1">Сарын захиалгын багцын QPay үнэ</p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-4">
        {PACKAGES.map((pkg) => {
          const current = data?.[pkg.key];
          return (
            <div key={pkg.key} className={CARD}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className={`text-xl ${pkg.color}`}>{pkg.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{pkg.name} захиалга</p>
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
                  type="number" min={100} step={100}
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
          {saving ? "Хадгалж байна..." : "Хадгалах"}
        </button>

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
