"use client";

import { useState } from "react";
import useSWR from "swr";
import { adminFetcher } from "@/lib/api";

interface User {
  id: string;
  phone: string;
  phoneVerified: boolean;
  createdAt: string;
}

interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  pages: number;
}

const CELL = "px-4 py-3 text-sm";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSWR<UsersResponse>(
    `/admin/users?page=${page}&limit=20`,
    adminFetcher,
    { revalidateOnFocus: false }
  );

  return (
    <div>
      <div className="mb-5 sm:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white">Хэрэглэгчид</h1>
          <p className="text-sm text-white/40 mt-1">Нийт {data?.total ?? 0} хэрэглэгч</p>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden"><div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.07]">
              {["Утас", "Баталгаажилт", "Бүртгэгдсэн", "ID"].map((h) => (
                <th key={h} className={`${CELL} text-left text-xs text-white/30 uppercase tracking-widest font-medium`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(10)].map((_, i) => (
                <tr key={i} className="border-b border-white/[0.04]">
                  {[...Array(4)].map((__, j) => (
                    <td key={j} className={CELL}><div className="h-4 bg-white/[0.06] rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
              : data?.data.map((u) => (
                <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                  <td className={`${CELL} text-white font-medium`}>{u.phone}</td>
                  <td className={CELL}>
                    {u.phoneVerified
                      ? <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">✓ Баталгаажсан</span>
                      : <span className="text-xs text-white/30">Баталгаажаагүй</span>
                    }
                  </td>
                  <td className={`${CELL} text-white/40`}>{new Date(u.createdAt).toLocaleDateString("mn-MN")}</td>
                  <td className={`${CELL} text-white/20 font-mono text-xs`}>{String(u.id).slice(-8)}</td>
                </tr>
              ))
            }
          </tbody>
        </table></div>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.07]">
            <p className="text-xs text-white/30">{page} / {data.pages} хуудас</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/50 hover:text-white disabled:opacity-30 transition-all"
              >← Өмнөх</button>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/50 hover:text-white disabled:opacity-30 transition-all"
              >Дараах →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
