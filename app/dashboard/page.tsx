"use client";

import useSWR from "swr";
import { adminFetcher } from "@/lib/api";

interface Stats {
  totalUsers: number;
  totalPayments: number;
  paidPayments: number;
  totalRevenue: number;
}

const CARD = "bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6";

export default function DashboardPage() {
  const { data, isLoading } = useSWR<Stats>("/admin/stats", adminFetcher, {
    refreshInterval: 30_000,
  });

  const stats = [
    { label: "Нийт хэрэглэгч",  value: data?.totalUsers    ?? 0, icon: "◉", color: "text-blue-400"   },
    { label: "Нийт нэхэмжлэх",  value: data?.totalPayments ?? 0, icon: "◈", color: "text-yellow-400" },
    { label: "Төлсөн",          value: data?.paidPayments  ?? 0, icon: "✦", color: "text-green-400"  },
    { label: "Нийт орлого (₮)", value: (data?.totalRevenue ?? 0).toLocaleString(), icon: "◇", color: "text-purple-400" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Хянах самбар</h1>
        <p className="text-sm text-white/40 mt-1">Beauty AI платформын тойм</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`${CARD} animate-pulse`}>
              <div className="h-4 bg-white/10 rounded mb-3 w-20" />
              <div className="h-8 bg-white/10 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className={CARD}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-sm ${s.color}`}>{s.icon}</span>
                <p className="text-xs text-white/40 uppercase tracking-widest">{s.label}</p>
              </div>
              <p className="text-3xl font-semibold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={CARD}>
          <h2 className="text-sm font-medium text-white/70 mb-4">Дэлгэрэнгүй</h2>
          <div className="space-y-3">
            {[
              { label: "Баталгаажаагүй нэхэмжлэх", value: (data?.totalPayments ?? 0) - (data?.paidPayments ?? 0) },
              { label: "Төлбөрийн дундаж", value: data?.paidPayments ? `${Math.round((data.totalRevenue) / data.paidPayments).toLocaleString()}₮` : "—" },
            ].map((r) => (
              <div key={r.label} className="flex justify-between text-sm">
                <span className="text-white/40">{r.label}</span>
                <span className="text-white font-medium">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={CARD}>
          <h2 className="text-sm font-medium text-white/70 mb-4">Шуурхай холбоос</h2>
          <div className="space-y-2">
            {[
              { href: "/dashboard/users",    label: "Бүх хэрэглэгчдийг харах →" },
              { href: "/dashboard/payments", label: "Бүх төлбөрийг харах →"     },
            ].map((l) => (
              <a key={l.href} href={l.href}
                className="block px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-sm text-white/60 hover:text-white transition-all">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
