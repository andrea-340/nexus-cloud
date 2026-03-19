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
  X,
  Laptop,
  Smartphone,
  Apple
} from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [open, setOpen] = useState(false);
  const [landingMenuOpen, setLandingMenuOpen] = useState(false);
  const [appMenuOpen, setAppMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [showInstallDevicePicker, setShowInstallDevicePicker] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installDevice, setInstallDevice] = useState(null);
  const pathname = usePathname();
  const isLanding = pathname === "/";

  const ADMIN_EMAIL = "altomarea59@gmail.com";
  const REMEMBER_LOGIN_KEY = "nexus-cloud-remember-login";

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

  const handleInstallClick = () => {
    if (isInstalled) return;
    setShowInstallDevicePicker(true);
  };

  const handleInstallDeviceSelect = async (device) => {
    setInstallDevice(device);
    setShowInstallDevicePicker(false);

    const canUsePrompt = deferredPrompt && typeof deferredPrompt.prompt === "function";
    const shouldOpenPrompt = device === "desktop" || device === "android";

    if (shouldOpenPrompt && canUsePrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice.catch(() => null);
      if (choice?.outcome === "accepted") {
        setDeferredPrompt(null);
        setLandingMenuOpen(false);
        return;
      }
      setDeferredPrompt(null);
    }

    setShowInstallHelp(true);
    setLandingMenuOpen(false);
  };

  const handleSignOut = async () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(REMEMBER_LOGIN_KEY);
    }
    await supabase.auth.signOut();
  };

  // Se siamo sulla landing, usiamo il nuovo design professionale
  if (isLanding) {
    const installOptions = [
      {
        id: "desktop",
        title: "PC / Desktop",
        description: "Chrome, Edge o browser desktop con installazione come app.",
        icon: <Laptop size={20} />,
      },
      {
        id: "android",
        title: "Android",
        description: "Installa dal browser con il prompt o dal menu del browser.",
        icon: <Smartphone size={20} />,
      },
      {
        id: "iphone",
        title: "iPhone / iPad",
        description: "Aggiungi alla Home da Safari con il menu Condividi.",
        icon: <Apple size={20} />,
      },
    ];

    const installHelpContent = {
      desktop: {
        title: "Installa su PC",
        text: "Usa Chrome o Edge e conferma il popup di installazione.",
        accent: "from-cyan-500 to-blue-600",
        chip: "Desktop",
        steps: [
          "Apri Nexus Cloud in Chrome o Edge",
          "Premi Installa quando compare il popup",
          "Se non compare, apri il menu e scegli Installa app",
        ],
      },
      android: {
        title: "Installa su Android",
        text: "Conferma il popup oppure installa dal menu del browser.",
        accent: "from-emerald-500 to-teal-600",
        chip: "Android",
        steps: [
          "Apri Nexus Cloud in Chrome",
          "Conferma il popup di installazione",
          "Se non appare, usa il menu e tocca Installa app",
        ],
      },
      iphone: {
        title: "Installa su iPhone",
        text: "Su iPhone l'installazione avviene da Safari con Aggiungi a Home.",
        accent: "from-orange-500 to-rose-600",
        chip: "iPhone / iPad",
        steps: [
          "Apri Nexus Cloud in Safari",
          "Tocca il tasto Condividi",
          "Scegli Aggiungi a Home e conferma",
        ],
      },
    };

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

        </div>
        {showInstallDevicePicker && (
          <div className="fixed inset-0 z-[300] bg-slate-950/95 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_transparent_38%),radial-gradient(circle_at_bottom,_rgba(34,197,94,0.16),_transparent_34%)]" />
            <div className="relative h-[100dvh] w-full flex items-stretch sm:items-center justify-center sm:p-6">
              <div className="w-full h-full sm:h-auto sm:max-h-[90dvh] sm:max-w-5xl bg-[#07111f] text-white rounded-none sm:rounded-[2.5rem] shadow-2xl border-0 sm:border sm:border-white/10 overflow-hidden flex flex-col">
                <div className="px-5 py-4 sm:px-8 sm:py-6 border-b border-white/10 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">Install Guide</p>
                    <h3 className="mt-2 text-2xl sm:text-4xl font-black italic uppercase tracking-tighter text-white">Scegli Dispositivo</h3>
                    <p className="mt-2 text-[12px] sm:text-sm font-bold text-slate-300 max-w-2xl">
                      Seleziona il dispositivo e ti mostriamo il metodo corretto per installare Nexus Cloud come app.
                    </p>
                  </div>
                  <button onClick={() => setShowInstallDevicePicker(false)} className="text-slate-500 hover:text-white transition-all shrink-0"><X size={24} /></button>
                </div>
                <div className="flex-1 p-5 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {installOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleInstallDeviceSelect(option.id)}
                      className="rounded-[2rem] border border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-400/40 transition-all p-6 sm:p-7 flex flex-col justify-between gap-6 text-left min-h-[180px]"
                    >
                      <div className="w-16 h-16 rounded-[1.35rem] bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-900/40">
                        {option.icon}
                      </div>
                      <div>
                        <p className="text-[13px] sm:text-[14px] font-black uppercase tracking-widest text-white">{option.title}</p>
                        <p className="mt-3 text-[13px] sm:text-sm font-bold text-slate-300 leading-relaxed">{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {showInstallHelp && (
          <div className="fixed inset-0 z-[300] bg-slate-950/95 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.24),_transparent_38%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.18),_transparent_34%)]" />
            <div className="relative h-[100dvh] w-full flex items-stretch sm:items-center justify-center sm:p-6">
              <div className="w-full h-full sm:h-auto sm:max-h-[90dvh] sm:max-w-5xl bg-[#07111f] text-white rounded-none sm:rounded-[2.5rem] shadow-2xl border-0 sm:border sm:border-white/10 overflow-hidden flex flex-col">
                <div className="px-5 py-4 sm:px-8 sm:py-6 border-b border-white/10 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">Install Guide</p>
                    <h3 className="mt-2 text-2xl sm:text-4xl font-black italic uppercase tracking-tighter text-white">
                      {installHelpContent[installDevice || "desktop"]?.title || "Scarica App"}
                    </h3>
                  </div>
                  <button onClick={() => setShowInstallHelp(false)} className="text-slate-500 hover:text-white transition-all shrink-0"><X size={24} /></button>
                </div>
                <div className="flex-1 p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5 sm:gap-6">
                  <div className="rounded-[2rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-5 sm:p-7 flex flex-col justify-between">
                    <div>
                      <div className={`inline-flex px-3 py-1 rounded-full bg-gradient-to-r ${installHelpContent[installDevice || "desktop"]?.accent || "from-blue-500 to-cyan-600"} text-[10px] font-black uppercase tracking-[0.22em] text-white`}>
                        {installHelpContent[installDevice || "desktop"]?.chip || "Device"}
                      </div>
                      <p className="mt-5 text-base sm:text-xl font-bold text-white leading-relaxed">
                        {installHelpContent[installDevice || "desktop"]?.text}
                      </p>
                    </div>
                    <div className="mt-6 rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">Suggerimento</p>
                      <p className="mt-2 text-[12px] sm:text-sm font-bold text-emerald-100 leading-relaxed">
                        Dopo l&apos;installazione apri Nexus Cloud dalla schermata Home per un&apos;esperienza piu veloce e simile a un&apos;app nativa.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-7 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-200">Passaggi Rapidi</p>
                      <div className="mt-5 space-y-4">
                        {(installHelpContent[installDevice || "desktop"]?.steps || []).map((step, index) => (
                          <div key={step} className="flex items-start gap-4">
                            <div className="w-9 h-9 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                              {index + 1}
                            </div>
                            <p className="text-[14px] sm:text-[15px] font-bold text-slate-200 leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowInstallHelp(false)}
                      className="mt-8 w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-950/40"
                    >
                      Ho Capito
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
                      onClick={handleSignOut}
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
