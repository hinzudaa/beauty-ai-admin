"use client";

import Link from "next/link";
import useSWR from "swr";
import { adminFetcher } from "@/lib/api";

interface Stats {
  totalUsers: number;
  totalPayments: number;
  paidPayments: number;
  totalRevenue: number;
  usage: { analyze: number; outfit: number; hairstyle: number };
  subscriptions: { basic: number; pro: number };
  mrr: number;
}

const CARD = "bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6";

const FEATURE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  analyze:   { label: "Нүүрний шинжилгээ", icon: "◈", color: "text-purple-400" },
  outfit:    { label: "Хувцас генератор",  icon: "◉", color: "text-blue-400"   },
  hairstyle: { label: "Үс / Грим",         icon: "✦", color: "text-pink-400"   },
};

export default function DashboardPage() {
  const { data, isLoading } = useSWR<Stats>("/admin/stats", adminFetcher, {
    refreshInterval: 30_000,
  });

  const stats = [
    { label: "Нийт хэрэглэгч",        value: data?.totalUsers    ?? 0,                                  icon: "◉", color: "text-blue-400"   },
    { label: "Basic захиалга",         value: data?.subscriptions?.basic ?? 0,                           icon: "★", color: "text-yellow-400" },
    { label: "Pro захиалга",           value: data?.subscriptions?.pro   ?? 0,                           icon: "★", color: "text-purple-400" },
    { label: "Сарын давтагдах орлого", value: `${(data?.mrr ?? 0).toLocaleString()}₮`,                  icon: "◇", color: "text-green-400"  },
    { label: "Нийт нэхэмжлэх",        value: data?.totalPayments ?? 0,                                  icon: "◈", color: "text-yellow-400" },
    { label: "Төлсөн нэхэмжлэх",      value: data?.paidPayments  ?? 0,                                  icon: "✦", color: "text-green-400"  },
    { label: "Нийт орлого",            value: `${(data?.totalRevenue ?? 0).toLocaleString()}₮`,          icon: "◇", color: "text-purple-400" },
    { label: "Баталгаажаагүй",         value: (data?.totalPayments ?? 0) - (data?.paidPayments ?? 0),   icon: "✕", color: "text-red-400"    },
  ];

  const totalUsage = Object.values(data?.usage ?? {}).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Хянах самбар</h1>
          <p className="text-sm text-white/40 mt-1">Beauty AI платформын тойм</p>
        </div>
        <Link href="/dashboard/settings"
          className="px-4 py-2 text-xs rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all">
          Тохиргоо ⚙
        </Link>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoading
          ? [...Array(8)].map((_, i) => <div key={i} className={`${CARD} animate-pulse h-[100px]`} />)
          : stats.map((s) => (
            <div key={s.label} className={CARD}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-sm ${s.color}`}>{s.icon}</span>
                <p className="text-xs text-white/40 uppercase tracking-widest leading-tight">{s.label}</p>
              </div>
              <p className="text-3xl font-semibold text-white">{s.value}</p>
            </div>
          ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage */}
        <div className={CARD}>
          <h2 className="text-sm font-medium text-white/70 mb-5">Боломжийн хэрэглээ</h2>
          {isLoading
            ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-8 bg-white/[0.06] rounded-xl animate-pulse" />)}</div>
            : (
              <div className="space-y-4">
                {Object.entries(data?.usage ?? {}).map(([feature, count]) => {
                  const meta = FEATURE_LABELS[feature];
                  const pct  = totalUsage > 0 ? Math.round((count / totalUsage) * 100) : 0;
                  return (
                    <div key={feature}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className={`flex items-center gap-2 ${meta?.color ?? "text-white/60"}`}>
                          <span className="text-xs">{meta?.icon}</span>
                          {meta?.label ?? feature}
                        </span>
                        <span className="text-white font-medium">
                          {count.toLocaleString()} <span className="text-white/30 text-xs">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            feature === "analyze" ? "bg-purple-500" :
                            feature === "outfit"  ? "bg-blue-500" : "bg-pink-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        </div>

        {/* Quick links + subscription summary */}
        <div className={CARD}>
          <h2 className="text-sm font-medium text-white/70 mb-5">Шуурхай холбоос</h2>
          <div className="space-y-2 mb-5">
            {[
              { href: "/dashboard/users",         label: "Бүх хэрэглэгчдийг харах →" },
              { href: "/dashboard/subscriptions", label: "Идэвхтэй захиалгууд →"      },
              { href: "/dashboard/payments",      label: "Бүх төлбөрийг харах →"      },
              { href: "/dashboard/settings",      label: "Багцын үнэ тохируулах →"    },
            ].map((l) => (
              <Link key={l.href} href={l.href}
                className="block px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-sm text-white/60 hover:text-white transition-all">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <p className="text-xs text-white/30 mb-3">Захиалгын товч</p>
            {[
              { label: "Нийт идэвхтэй захиалга", value: (data?.subscriptions?.basic ?? 0) + (data?.subscriptions?.pro ?? 0) },
              { label: "Basic / Pro харьцаа",     value: `${data?.subscriptions?.basic ?? 0} / ${data?.subscriptions?.pro ?? 0}` },
              { label: "Сарын давтагдах орлого",  value: `${(data?.mrr ?? 0).toLocaleString()}₮` },
            ].map((r) => (
              <div key={r.label} className="flex justify-between text-sm py-1.5">
                <span className="text-white/40">{r.label}</span>
                <span className="text-white font-medium">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
