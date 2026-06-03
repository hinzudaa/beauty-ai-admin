"use client";

import { useState } from "react";
import { request, adminTokenStore } from "@/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [busy, setBusy]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await request<{ token: string }>("/admin/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      adminTokenStore.set(res.token);
      document.cookie = `beauty_admin_token=${res.token}; path=/; max-age=${86400}; SameSite=Lax`;
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="text-purple-400 text-xl">✦</span>
            <span className="font-bold text-xl tracking-wide">Beauty AI Admin</span>
          </div>
          <h1 className="text-2xl font-semibold text-white">Нэвтрэх</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Нэвтрэх нэр</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50 transition-all"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Нууц үг</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50 transition-all"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50"
          >
            {busy ? "Нэвтэрч байна..." : "Нэвтрэх →"}
          </button>
        </form>
      </div>
    </div>
  );
}
