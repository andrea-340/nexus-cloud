"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  User,
  ChevronDown,
  LayoutGrid,
  CreditCard,
  LifeBuoy,
  Zap,
  ShieldAlert
} from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isLanding = pathname === "/";

  const ADMIN_EMAIL = "altomarea59@gmail.com";

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from("profiles").select("avatar_url, full_name").eq("id", userId).single();
    if (data) setProfile(data);
  };

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
      });
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Se siamo sulla landing, usiamo il nuovo design professionale
  if (isLanding) {
    return (
      <nav className="fixed top-0 w-full z-[100] px-6 py-8">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] px-10 py-5 shadow-2xl">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/40">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="text-2xl font-black italic uppercase tracking-tighter text-white">Nexus <span className="text-blue-600">Cloud</span></span>
          </Link>
          
          <div className="hidden md:flex items-center gap-10">
            <Link href="#servizi" className="text-[10px] font-black uppercase italic tracking-[0.2em] text-gray-400 hover:text-white transition-colors">Servizi</Link>
            <Link href="#ia" className="text-[10px] font-black uppercase italic tracking-[0.2em] text-gray-400 hover:text-white transition-colors">Intelligenza</Link>
            <Link href="#sicurezza" className="text-[10px] font-black uppercase italic tracking-[0.2em] text-gray-400 hover:text-white transition-colors">Sicurezza</Link>
            
            {user ? (
              <Link href="/dashboard" className="flex items-center gap-3 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase italic tracking-widest hover:bg-white hover:text-blue-600 transition-all">
                {profile?.avatar_url && <img src={profile.avatar_url} className="w-6 h-6 rounded-lg object-cover" />}
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="bg-white text-black px-8 py-3 rounded-xl font-black text-[10px] uppercase italic tracking-widest hover:bg-blue-600 hover:text-white transition-all">Accedi</Link>
            )}
          </div>
        </div>
      </nav>
    );
  }

  // Design Standard per Dashboard e altre pagine
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-[100] border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto flex justify-between items-center p-5">
        <Link
          href="/"
          className="font-black italic text-2xl text-blue-600 tracking-tighter"
        >
          NEXUS
        </Link>

        <div className="flex gap-6 items-center">
          {user ? (
            <>
              {/* Tasti Home e Piani visibili solo se loggati */}
              <div className="hidden md:flex gap-6 border-r border-gray-100 pr-6">
                <Link
                  href="/dashboard"
                  onClick={() => {
                    // Se siamo già in dashboard, forziamo il reset degli stati
                    if (window.location.pathname === "/dashboard") {
                      window.location.href = "/dashboard";
                    }
                  }}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-all"
                >
                  <LayoutGrid size={14} /> Home
                </Link>
                <Link
                  href="/dashboard?view=piani"
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-all"
                >
                  <CreditCard size={14} /> Piani
                </Link>
                <Link
                  href="/dashboard?view=assistenza"
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-all"
                >
                  <LifeBuoy size={14} /> Assistenza
                </Link>
              </div>

              <div className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 bg-gray-50 p-2 pr-4 rounded-2xl border border-gray-100"
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-xl object-cover shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xs uppercase">
                      {user.email ? user.email[0] : 'U'}
                    </div>
                  )}
                  <ChevronDown size={14} className={open ? "rotate-180" : ""} />
                </button>

                {open && (
                  <div className="absolute top-14 right-0 w-64 bg-white border border-gray-100 shadow-2xl rounded-[2rem] p-4">
                    <div className="px-4 py-3 border-b border-gray-50 mb-2">
                      <p className="text-[10px] font-bold truncate text-gray-800">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard?view=profilo"
                      onClick={() => setOpen(false)}
                      className="w-full flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-xl font-black uppercase text-[10px]"
                    >
                      <User size={16} /> I Miei Dati
                    </Link>

                    {user.email === ADMIN_EMAIL && (
                      <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="w-full flex items-center gap-3 p-3 text-blue-600 hover:bg-blue-50 rounded-xl font-black uppercase text-[10px] mt-1 border border-blue-100"
                      >
                        <ShieldAlert size={16} /> Pannello Admin
                      </Link>
                    )}

                    <button
                      onClick={() => supabase.auth.signOut()}
                      className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl font-black uppercase text-[10px] mt-2"
                    >
                      <LogOut size={16} /> Esci Account
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/login">
              <button className="bg-black text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase italic tracking-widest hover:bg-blue-600 transition-all">
                Accedi
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
