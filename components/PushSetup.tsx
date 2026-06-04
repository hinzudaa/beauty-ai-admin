"use client";

import { useEffect } from "react";
import { adminTokenStore, request } from "@/lib/api";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Convert base64url string to Uint8Array for VAPID */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw     = atob(base64);
  return new Uint8Array([...raw].map((c) => c.charCodeAt(0)));
}

export default function PushSetup() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    // Only subscribe if admin is logged in
    const token = adminTokenStore.get();
    if (!token) return;

    (async () => {
      try {
        // 1. Register service worker
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        await navigator.serviceWorker.ready;

        // 2. Check existing subscription
        let sub = await reg.pushManager.getSubscription();
        if (sub) {
          // Already subscribed — sync with backend
          await syncSubscription(sub, token);
          return;
        }

        // 3. Request permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        // 4. Get VAPID public key from backend
        const res = await fetch(`${BASE}/admin/vapid-public-key`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const { publicKey } = await res.json() as { publicKey: string };

        // 5. Subscribe
        sub = await reg.pushManager.subscribe({
          userVisibleOnly:      true,
          applicationServerKey: urlBase64ToUint8Array(publicKey).buffer as ArrayBuffer,
        });

        // 6. Send subscription to backend
        await syncSubscription(sub, token);
        console.log("[push] Subscribed to admin push notifications");
      } catch (err) {
        console.warn("[push] Setup failed:", err);
      }
    })();
  }, []);

  return null; // invisible, setup only
}

async function syncSubscription(sub: PushSubscription, token: string): Promise<void> {
  const json = sub.toJSON();
  await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/admin/push/subscribe`, {
    method:  "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body:    JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
  });
}
