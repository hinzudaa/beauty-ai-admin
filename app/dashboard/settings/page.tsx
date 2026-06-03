"use client";

import { useState } from "react";
import useSWR from "swr";
import { adminFetcher, request } from "@/lib/api";

interface Settings {
  analyzePrice: number;
  outfitPrice: number;
  hairstylePrice: number;
}

const CARD = "bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6";

const FEATURES = [
  { key: "analyzePrice",   label: "Нүүрний шинжилгээ", icon: "◈", color: "text-purple-400", desc: "Selfie upload → AI нүүр шинжилгээ" },
  { key: "outfitPrice",    label: "Хувцас генератор",  icon: "◉", color: "text-blue-400",   desc: "Event + style → AI хувцас хослол" },
  { key: "hairstylePrice", label: "Үс засал & Грим",   icon: "✦", color: "text-pink-400",   desc: "Selfie upload → AI үс, грим зөвлөмж" },
] as const;

type PriceKey = "analyzePrice" | "outfitPrice" | "hairstylePrice";

export default function SettingsPage() {
  const { data, isLoading, mutate } = useSWR<Settings>("/admin/settings", adminFetcher);

  const [prices, setPrices] = useState<Partial<Record<PriceKey, string>>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState<{ type: "ok" | "err"; text: string } | null>(null);

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
        body: JSON.stringify(updates),
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
        <p className="text-sm text-white/40 mt-1">Боломж тус бүрийн QPay үнэ</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSave} className="space-y-4 mb-6">
          {FEATURES.map((f) => {
            const current = data?.[f.key];
            return (
              <div key={f.key} className={CARD}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg ${f.color}`}>{f.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{f.label}</p>
                      <p className="text-xs text-white/30">{f.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/30 mb-0.5">Одоогийн үнэ</p>
                    {isLoading
                      ? <div className="h-6 w-16 bg-white/10 rounded animate-pulse" />
                      : <p className="text-lg font-semibold text-white">{current?.toLocaleString() ?? "—"}₮</p>
                    }
                  </div>
                </div>

                <div className="flex gap-3">
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={prices[f.key] ?? ""}
                    onChange={(e) => { setPrices((p) => ({ ...p, [f.key]: e.target.value })); setMsg(null); }}
                    placeholder={current?.toString() ?? "1000"}
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

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all"
          >
            {saving ? "Хадгалж байна..." : "Бүгдийг хадгалах"}
          </button>
        </form>

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
      </div>
    </div>
  );
}
