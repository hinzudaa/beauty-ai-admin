"use client";

import { useState } from "react";
import useSWR from "swr";
import { adminFetcher } from "@/lib/api";

interface Payment {
  id: string;
  phone: string;
  invoiceId: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  type: string;
  createdAt: string;
  paidAt?: string;
}

interface PaymentsResponse {
  data: Payment[];
  total: number;
  page: number;
  pages: number;
}

const CELL = "px-4 py-3 text-sm";
const STATUS_STYLE: Record<string, string> = {
  paid:    "text-green-400 bg-green-400/10 border-green-400/20",
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  failed:  "text-red-400 bg-red-400/10 border-red-400/20",
};
const STATUS_LABEL: Record<string, string> = {
  paid: "Төлсөн", pending: "Хүлээгдэж буй", failed: "Амжилтгүй",
};

export default function PaymentsPage() {
  const [page, setPage]     = useState(1);
  const [filter, setFilter] = useState("");

  const { data, isLoading } = useSWR<PaymentsResponse>(
    `/admin/payments?page=${page}&limit=20${filter ? `&status=${filter}` : ""}`,
    adminFetcher,
    { revalidateOnFocus: false }
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Төлбөрүүд</h1>
          <p className="text-sm text-white/40 mt-1">Нийт {data?.total ?? 0} нэхэмжлэх</p>
        </div>

        <div className="flex gap-2">
          {[
            { value: "", label: "Бүгд" },
            { value: "paid",    label: "Төлсөн" },
            { value: "pending", label: "Хүлээгдэж буй" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all border ${
                filter === f.value
                  ? "bg-purple-600/20 text-purple-300 border-purple-500/30"
                  : "bg-white/[0.04] text-white/40 border-white/[0.07] hover:text-white/70"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.07]">
              {["Утас", "Дүн", "Статус", "Огноо", "Invoice ID"].map((h) => (
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
              : data?.data.map((p) => (
                <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                  <td className={`${CELL} text-white font-medium`}>{p.phone}</td>
                  <td className={`${CELL} text-white`}>{p.amount.toLocaleString()}₮</td>
                  <td className={CELL}>
                    <span className={`inline-flex items-center text-xs border px-2 py-0.5 rounded-full ${STATUS_STYLE[p.status] ?? ""}`}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className={`${CELL} text-white/40`}>
                    {new Date(p.createdAt).toLocaleDateString("mn-MN")}
                    {p.paidAt && (
                      <span className="block text-xs text-green-400/60">{new Date(p.paidAt).toLocaleTimeString("mn-MN")}</span>
                    )}
                  </td>
                  <td className={`${CELL} text-white/20 font-mono text-xs`}>{p.invoiceId.slice(0, 8)}...</td>
                </tr>
              ))
            }
          </tbody>
        </table>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.07]">
            <p className="text-xs text-white/30">{page} / {data.pages} хуудас</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/50 hover:text-white disabled:opacity-30 transition-all">← Өмнөх</button>
              <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages}
                className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/50 hover:text-white disabled:opacity-30 transition-all">Дараах →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
