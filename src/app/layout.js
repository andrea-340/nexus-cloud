"use client";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <html lang="it">
      <body className={`antialiased ${isLanding ? 'bg-[#050505]' : 'bg-slate-50'}`}>
        <Navbar />
        {/* pt-16 rimosso se siamo sulla landing per gestire il padding internamente */}
        <main className={`min-h-screen ${isLanding ? '' : 'pt-16'}`}>{children}</main>
        {!isLanding && <Footer />}
      </body>
    </html>
  );
}
