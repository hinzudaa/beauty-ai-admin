import type { Metadata, Viewport } from "next";
import "./globals.css";
import PushSetup from "@/components/PushSetup";

export const metadata: Metadata = {
  title: "Looka Admin",
  description: "Looka Beauty AI — Admin Panel",
  manifest: "/manifest.json",
  appleWebApp: {
    capable:        true,
    statusBarStyle: "black-translucent",
    title:          "Looka Admin",
  },
};

export const viewport: Viewport = {
  themeColor:          "#9333ea",
  width:               "device-width",
  initialScale:        1,
  maximumScale:        1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-[#0f0f0f] text-white">
        {children}
        <PushSetup />
      </body>
    </html>
  );
}
