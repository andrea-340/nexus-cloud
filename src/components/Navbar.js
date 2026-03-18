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
  ShieldAlert,
  Menu,
  X
} from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [open, setOpen] = useState(false);
  const [landingMenuOpen, setLandingMenuOpen] = useState(false);
  const [appMenuOpen, setAppMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
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

  useEffect(() => {
    const checkInstalled = () => {
      const standalone =
        (typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)")?.matches) ||
        (typeof navigator !== "undefined" && navigator.standalone);
      setIsInstalled(Boolean(standalone));
    };

    checkInstalled();

    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setShowInstallHelp(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isInstalled) return;
    const ua = typeof navigator !== "undefined" ? String(navigator.userAgent || "") : "";
    const isIOS = /iphone|ipad|ipod/i.test(ua);

    if (deferredPrompt && typeof deferredPrompt.prompt === "function") {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice.catch(() => null);
      if (choice?.outcome !== "accepted") {
        setShowInstallHelp(true);
      }
      setDeferredPrompt(null);
      return;
    }

    setShowInstallHelp(true);
    if (!isIOS) setLandingMenuOpen(false);
  };

  // Se siamo sulla landing, usiamo il nuovo design professionale
  if (isLanding) {
    return (
      <nav className="fixed top-0 w-full z-[100] px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[1.75rem] sm:rounded-[2.5rem] px-4 sm:px-10 py-4 sm:py-5 shadow-2xl relative gap-3">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/40 shrink-0">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="text-lg sm:text-2xl font-black italic uppercase tracking-tighter text-white leading-none">Nexus <span className="text-blue-600">Cloud</span></span>
          </Link>
          
          <div className="hidden md:flex items-center gap-10">
            <Link href="#servizi" className="text-[10px] font-black uppercase italic tracking-[0.2em] text-gray-400 hover:text-white transition-colors">Servizi</Link>
            <Link href="#ia" className="text-[10px] font-black uppercase italic tracking-[0.2em] text-gray-400 hover:text-white transition-colors">Intelligenza</Link>
            <Link href="#sicurezza" className="text-[10px] font-black uppercase italic tracking-[0.2em] text-gray-400 hover:text-white transition-colors">Sicurezza</Link>

            <button
              onClick={handleInstallClick}
              className="bg-white/10 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase italic tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50"
              disabled={isInstalled}
            >
              {isInstalled ? "App Installata" : "Scarica App"}
            </button>
            
            {user ? (
              <Link href="/dashboard" className="flex items-center gap-3 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase italic tracking-widest hover:bg-white hover:text-blue-600 transition-all">
                {profile?.avatar_url && <img src={profile.avatar_url} className="w-6 h-6 rounded-lg object-cover" />}
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="bg-white text-black px-8 py-3 rounded-xl font-black text-[10px] uppercase italic tracking-widest hover:bg-blue-600 hover:text-white transition-all">Accedi</Link>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2 shrink-0">
            {user ? (
              <Link href="/dashboard" className="bg-blue-600 text-white px-3 py-2.5 rounded-xl font-black text-[9px] uppercase italic tracking-[0.14em] text-center">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="bg-white text-black px-3 py-2.5 rounded-xl font-black text-[9px] uppercase italic tracking-[0.14em] text-center">
                Accedi
              </Link>
            )}
            <button
              onClick={() => setLandingMenuOpen((v) => !v)}
              className="w-11 h-11 rounded-xl border border-white/10 bg-white/[0.04] text-white flex items-center justify-center"
              aria-label={landingMenuOpen ? "Chiudi menu" : "Apri menu"}
            >
              {landingMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {landingMenuOpen && (
            <div className="absolute left-0 right-0 top-[calc(100%+10px)] bg-slate-950 border border-white/10 rounded-[1.75rem] p-5 shadow-2xl md:hidden">
              <div className="flex flex-col gap-4 text-left">
                <Link
                  href="#servizi"
                  className="text-[11px] font-black uppercase italic tracking-[0.2em] text-gray-200/80 hover:text-white transition-colors"
                  onClick={() => setLandingMenuOpen(false)}
                >
                  Servizi
                </Link>
                <Link
                  href="#ia"
                  className="text-[11px] font-black uppercase italic tracking-[0.2em] text-gray-200/80 hover:text-white transition-colors"
                  onClick={() => setLandingMenuOpen(false)}
                >
                  Intelligenza
                </Link>
                <Link
                  href="#sicurezza"
                  className="text-[11px] font-black uppercase italic tracking-[0.2em] text-gray-200/80 hover:text-white transition-colors"
                  onClick={() => setLandingMenuOpen(false)}
                >
                  Sicurezza
                </Link>

                <button
                  onClick={handleInstallClick}
                  className="text-left text-[11px] font-black uppercase italic tracking-[0.2em] text-gray-200/80 hover:text-white transition-colors disabled:opacity-50"
                  disabled={isInstalled}
                >
                  {isInstalled ? "App Installata" : "Scarica App"}
                </button>

                <div className="h-px bg-white/10 my-1" />

                {user ? (
                  <Link
                    href="/dashboard"
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase italic tracking-widest text-center"
                    onClick={() => setLandingMenuOpen(false)}
                  >
                    Vai alla Dashboard
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/login"
                      className="bg-white text-black px-4 py-3 rounded-xl font-black text-[10px] uppercase italic tracking-widest text-center"
                      onClick={() => setLandingMenuOpen(false)}
                    >
                      Accedi
                    </Link>
                    <Link
                      href="/register"
                      className="bg-blue-600 text-white px-4 py-3 rounded-xl font-black text-[10px] uppercase italic tracking-widest text-center"
                      onClick={() => setLandingMenuOpen(false)}
                    >
                      Registrati
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {showInstallHelp && (
            <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
              <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 relative shadow-2xl border border-white/20">
                <button onClick={() => setShowInstallHelp(false)} className="absolute top-6 right-6 text-slate-300 hover:text-black transition-all"><X size={24} /></button>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Scarica App</h3>
                <p className="mt-3 text-[11px] font-bold text-slate-500">
                  Su iPhone: apri il menu Condividi e tocca “Aggiungi a Home”.
                  <br />
                  Su Android: apri il menu del browser e tocca “Installa app”.
                </p>
                <button
                  onClick={() => setShowInstallHelp(false)}
                  className="mt-8 w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                >
                  Ok
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  // Design Standard per Dashboard e altre pagine
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-[100] border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex justify-between items-center gap-4">
        <Link
          href="/"
          className="font-black italic text-2xl text-blue-600 tracking-tighter"
        >
          NEXUS
        </Link>

        <div className="flex gap-2 sm:gap-4 items-center">
          {user ? (
            <>
              {/* Tasti Home e Piani visibili solo se loggati */}
              <div className="hidden lg:flex gap-6 border-r border-gray-100 pr-6">
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
                  className="hidden sm:flex items-center gap-2 bg-gray-50 p-2 pr-4 rounded-2xl border border-gray-100"
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

                <button
                  onClick={() => setOpen(!open)}
                  className="sm:hidden w-11 h-11 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center"
                  aria-label={open ? "Chiudi profilo" : "Apri profilo"}
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-xl object-cover shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xs uppercase">
                      {user.email ? user.email[0] : "U"}
                    </div>
                  )}
                </button>

                {open && (
                  <div className="absolute top-14 right-0 w-[min(18rem,calc(100vw-2rem))] bg-white border border-gray-100 shadow-2xl rounded-[2rem] p-4">
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

              <button
                onClick={() => setAppMenuOpen((v) => !v)}
                className="lg:hidden w-11 h-11 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center text-slate-600"
                aria-label={appMenuOpen ? "Chiudi menu" : "Apri menu"}
              >
                {appMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </>
          ) : (
            <>
            <Link href="/login">
              <button className="bg-black text-white px-5 sm:px-8 py-3 rounded-2xl font-black text-[10px] uppercase italic tracking-widest hover:bg-blue-600 transition-all">
                Accedi
              </button>
            </Link>
            <button
              onClick={() => setAppMenuOpen((v) => !v)}
              className="md:hidden w-11 h-11 rounded-2xl border border-gray-100 bg-white flex items-center justify-center text-slate-600"
              aria-label={appMenuOpen ? "Chiudi menu" : "Apri menu"}
            >
              {appMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            </>
          )}
        </div>
      </div>

      {appMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex flex-col gap-3">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setAppMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 text-slate-700 font-black text-[10px] uppercase tracking-widest">
                  <LayoutGrid size={16} /> Home
                </Link>
                <Link href="/dashboard?view=piani" onClick={() => setAppMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 text-slate-700 font-black text-[10px] uppercase tracking-widest">
                  <CreditCard size={16} /> Piani
                </Link>
                <Link href="/dashboard?view=assistenza" onClick={() => setAppMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 text-slate-700 font-black text-[10px] uppercase tracking-widest">
                  <LifeBuoy size={16} /> Assistenza
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setAppMenuOpen(false)} className="px-4 py-3 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase italic tracking-widest text-center">
                  Accedi
                </Link>
                <Link href="/register" onClick={() => setAppMenuOpen(false)} className="px-4 py-3 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase italic tracking-widest text-center">
                  Registrati
                </Link>
              </>
            )}
          </div>
        </div>
      )}
      </div>
    </nav>
  );
}
