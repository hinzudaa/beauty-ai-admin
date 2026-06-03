import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beauty AI — Admin",
  description: "Admin dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body className="min-h-screen bg-[#0f0f0f] text-white">{children}</body>
    </html>
  );
}
