"use client";

import { useState } from "react";
import useSWR from "swr";
import { adminFetcher } from "@/lib/api";

interface Subscriber {
  id: string;
  phone: string;
  plan: "basic" | "pro";
  status: string;
  expiresAt: string;
  monthlyUsage: number;
  usageLimit: number;
  startedAt: string;
}

interface Page {
  data:  Subscriber[];
  total: number;
  page:  number;
  pages: number;
}

const CARD = "bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6";

const PLAN_COLOR: Record<string, string> = {
  basic: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  pro:   "text-purple-400 bg-purple-400/10 border-purple-400/20",
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("mn-MN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default function SubscriptionsPage() {
  const [page,    setPage]    = useState(1);
  const [planFilter, setPlanFilter] = useState<"" | "basic" | "pro">("");

  const url = `/admin/subscriptions?page=${page}&limit=20${planFilter ? `&plan=${planFilter}` : ""}`;
  const { data, isLoading, error } = useSWR<Page>(url, adminFetcher);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Захиалгууд</h1>
          <p className="text-sm text-white/40 mt-1">
            {isLoading ? "..." : `Нийт ${data?.total ?? 0} идэвхтэй захиалга`}
          </p>
        </div>
        <div className="flex gap-2">
          {(["", "basic", "pro"] as const).map((p) => (
            <button
              key={p}
              onClick={() => { setPlanFilter(p); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                planFilter === p
                  ? "bg-purple-600/30 text-purple-300 border border-purple-500/30"
                  : "text-white/40 border border-white/10 hover:text-white/70"
              }`}
            >
              {p === "" ? "Бүгд" : p === "basic" ? "Basic" : "Pro"}
            </button>
          ))}
        </div>
      </div>

      <div className={CARD}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Утас", "Багц", "Ашиглалт", "Эхэлсэн", "Дуусах", ""].map((h) => (
                  <th key={h} className="text-left text-xs text-white/30 uppercase tracking-wider pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {isLoading
                ? [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((__, j) => (
                        <td key={j} className="py-3 pr-4">
                          <div className="h-4 bg-white/[0.06] rounded animate-pulse w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data?.data.map((s) => {
                    const usagePct = Math.round((s.monthlyUsage / s.usageLimit) * 100);
                    return (
                      <tr key={s.id} className="hover:bg-white/[0.02] transition-all">
                        <td className="py-3 pr-4 text-white font-medium">{s.phone}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${PLAN_COLOR[s.plan]}`}>
                            {s.plan === "pro" ? "Pro" : "Basic"}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white/70">{s.monthlyUsage}/{s.usageLimit}</span>
                            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${usagePct >= 90 ? "bg-red-400" : usagePct >= 60 ? "bg-yellow-400" : "bg-green-400"}`}
                                style={{ width: `${usagePct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-white/50">{fmt(s.startedAt)}</td>
                        <td className="py-3 pr-4 text-white/50">{fmt(s.expiresAt)}</td>
                        <td className="py-3">
                          <span className="text-xs text-green-400">Идэвхтэй</span>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>

          {!isLoading && error && (
            <p className="text-center text-red-400/70 text-sm py-12">
              Backend холбогдсонгүй — сервер ажиллаж байгааг шалгана уу
            </p>
          )}
          {!isLoading && !error && (!data?.data.length) && (
            <p className="text-center text-white/30 text-sm py-12">Идэвхтэй захиалга байхгүй байна</p>
          )}
        </div>

        {/* Pagination */}
        {(data?.pages ?? 0) > 1 && (
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.06]">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg text-xs text-white/50 border border-white/10 disabled:opacity-30 hover:text-white hover:border-white/20 transition-all"
            >
              ← Өмнөх
            </button>
            <span className="text-xs text-white/30">{page} / {data?.pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(data?.pages ?? 1, p + 1))}
              disabled={page >= (data?.pages ?? 1)}
              className="px-3 py-1.5 rounded-lg text-xs text-white/50 border border-white/10 disabled:opacity-30 hover:text-white hover:border-white/20 transition-all"
            >
              Дараах →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
