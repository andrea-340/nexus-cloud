"use client";
import { useEffect } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return (
    <html lang="it">
      <body className={`antialiased ${isLanding ? 'bg-[#050505]' : 'bg-slate-50'}`}>
        <Navbar />
        {/* pt-16 rimosso se siamo sulla landing per gestire il padding internamente */}
        <main className={`min-h-screen ${isLanding ? '' : 'pt-20 md:pt-24'}`}>{children}</main>
        {!isLanding && <Footer />}
      </body>
    </html>
  );
}
