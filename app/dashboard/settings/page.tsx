"use client";

import { useState } from "react";
import useSWR from "swr";
import { adminFetcher, request } from "@/lib/api";

interface Settings {
  analyzePrice: number;
}

const CARD = "bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6";

export default function SettingsPage() {
  const { data, isLoading, mutate } = useSWR<Settings>("/admin/settings", adminFetcher);

  const [price, setPrice]   = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const val = parseInt(price, 10);
    if (isNaN(val) || val < 100) { setMsg({ type: "err", text: "Хамгийн багадаа 100₮ байх ёстой" }); return; }
    setSaving(true);
    setMsg(null);
    try {
      const updated = await request<Settings>("/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ analyzePrice: val }),
      });
      mutate(updated, false);
      setPrice("");
      setMsg({ type: "ok", text: `Үнэ амжилттай ${val.toLocaleString()}₮ болголоо` });
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
        <p className="text-sm text-white/40 mt-1">Платформын тохируулга</p>
      </div>

      <div className="max-w-xl space-y-6">
        <div className={CARD}>
          <h2 className="text-sm font-medium text-white/70 mb-1">Шинжилгээний үнэ</h2>
          <p className="text-xs text-white/30 mb-5">QPay-ээр төлөх дүн — одоогийн болон ирээдүйн нэхэмжлэхэд нөлөөлнө</p>

          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-2xl text-purple-400">◈</span>
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest mb-0.5">Одоогийн үнэ</p>
              {isLoading
                ? <div className="h-7 w-24 bg-white/10 rounded animate-pulse" />
                : <p className="text-2xl font-semibold text-white">{data?.analyzePrice.toLocaleString() ?? "—"}₮</p>
              }
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Шинэ үнэ (₮)</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={price}
                  onChange={(e) => { setPrice(e.target.value); setMsg(null); }}
                  placeholder={data?.analyzePrice.toString() ?? "1000"}
                  className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={saving || !price}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all"
                >
                  {saving ? "Хадгалж байна..." : "Хадгалах"}
                </button>
              </div>
            </div>

            {msg && (
              <p className={`text-xs px-4 py-2.5 rounded-xl border ${
                msg.type === "ok"
                  ? "text-green-400 bg-green-400/10 border-green-400/20"
                  : "text-red-400 bg-red-400/10 border-red-400/20"
              }`}>
                {msg.text}
              </p>
            )}
          </form>

          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <p className="text-xs text-white/20">
              Үнэ өөрчлөгдсний дараа шинэ нэхэмжлэхүүдэд хэрэгжинэ. Одоо хүлээгдэж буй нэхэмжлэхүүд нөлөөлөхгүй.
            </p>
          </div>
        </div>

        <div className={CARD}>
          <h2 className="text-sm font-medium text-white/70 mb-4">Нэвтрэх мэдээлэл</h2>
          <div className="space-y-2">
            {[
              { label: "Нэвтрэх нэр", value: "admin" },
              { label: "Нууц үг", value: "••••••" },
            ].map((r) => (
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
