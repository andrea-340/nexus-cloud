"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { Cloud, Loader2, AlertCircle, CheckCircle2, ShieldCheck, X, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const REMEMBER_LOGIN_KEY = "nexus-cloud-remember-login";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberLogin, setRememberLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [showMfaChallenge, setShowMfaChallenge] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const shouldRemember =
          typeof window !== "undefined" &&
          window.localStorage.getItem(REMEMBER_LOGIN_KEY) === "true";

        if (!shouldRemember) {
          if (mounted) setCheckingSession(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          router.replace("/dashboard");
          return;
        }
      } finally {
        if (mounted) setCheckingSession(false);
      }
    };

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (typeof window === "undefined") return;
      const shouldRemember = window.localStorage.getItem(REMEMBER_LOGIN_KEY) === "true";
      if (session?.user && shouldRemember) {
        router.replace("/dashboard");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    const confirmed = searchParams.get("confirmed");
    const callbackMessage = searchParams.get("message");

    if (confirmed === "check-email") {
      setMessage("Registrazione completata. Controlla la mail e conferma il tuo account prima di accedere.");
      setError(null);
    } else if (confirmed === "success") {
      setMessage("Email confermata con successo. Ora puoi accedere al tuo account.");
      setError(null);
    } else if (confirmed === "error") {
      setError(callbackMessage || "La conferma dell'account non e andata a buon fine.");
      setMessage(null);
    }
  }, [searchParams]);

  const getReadableAuthError = (authError) => {
    const msg = String(authError?.message || "").toLowerCase();

    if (msg.includes("invalid login credentials")) return "Email o password non corretti.";
    if (msg.includes("email not confirmed")) return "Email non ancora confermata. Controlla la tua casella di posta.";
    if (msg.includes("invalid email")) return "Inserisci un indirizzo email valido.";
    if (msg.includes("password")) return "Password non valida.";

    return authError?.message || "Impossibile accedere in questo momento.";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      setError("Inserisci email e password.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    setShowMfaChallenge(false);
    setMfaFactorId(null);

    if (typeof window !== "undefined") {
      if (rememberLogin) window.localStorage.setItem(REMEMBER_LOGIN_KEY, "true");
      else window.localStorage.removeItem(REMEMBER_LOGIN_KEY);
    }

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: normalizedPassword,
    });

    if (loginError) {
      setError(getReadableAuthError(loginError));
      setLoading(false);
      return;
    }

    if (!data?.session) {
      setError("Accesso non completato. Riprova tra qualche secondo.");
      setLoading(false);
      return;
    }

    // Controlla se è richiesta l'autenticazione a due fattori
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) {
      router.push("/dashboard");
      return;
    }

    const totpFactor = factors.all.find(f => f.factor_type === 'totp' && f.status === 'verified');
    if (totpFactor) {
      setMfaFactorId(totpFactor.id);
      setShowMfaChallenge(true);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const verifyMfaChallenge = async () => {
    if (!mfaCode || !mfaFactorId) return;
    setLoading(true);
    setError(null);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId
      });
      
      if (challengeError) throw challengeError;
      
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challengeData.id,
        code: mfaCode
      });
      
      if (verifyError) throw verifyError;
      
      router.push("/dashboard");
    } catch (err) {
      setError(getReadableAuthError(err) || "Codice 2FA non valido. Riprova.");
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="max-w-[400px] w-full bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-gray-100 text-center">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/20">
            <Loader2 size={28} className="animate-spin" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
            Controllo accesso salvato
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 py-8">
      <div className="max-w-[400px] w-full bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-gray-100 text-center relative overflow-hidden">
        
        <AnimatePresence mode="wait">
          {!showMfaChallenge ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8 text-gray-800">
                Accedi a Nexus
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 text-xs font-bold uppercase text-left">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {message && (
                <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center gap-2 text-xs font-bold uppercase text-left">
                  <CheckCircle2 size={16} /> {message}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="ANDREA@ESEMPIO.IT"
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 ring-blue-500 font-bold text-xs"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center pr-4">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-[9px] font-black uppercase text-blue-600 hover:underline tracking-widest">
                      Password dimenticata?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full p-4 pr-12 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 ring-blue-500 font-bold text-xs"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-800"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-3 px-1 py-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberLogin}
                    onChange={(e) => setRememberLogin(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Ricorda credenziali
                  </span>
                </label>

                <button
                  disabled={loading}
                  className="w-full bg-[#1a73e8] text-white py-5 rounded-2xl font-black italic uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all hover:bg-black"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Entra nel Cloud"}
                </button>
              </form>

              <p className="mt-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Non hai un account?{" "}
                <Link href="/register" className="text-blue-600 hover:underline ml-1">
                  Registrati
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="mfa"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/20">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-gray-800">
                Verifica <span className="text-blue-600">2FA</span>
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-8 leading-relaxed px-4">
                Inserisci il codice di sicurezza generato dalla tua App di Autenticazione per accedere al tuo account criptato.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 text-xs font-bold uppercase text-left">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="space-y-6">
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="000 000" 
                  autoFocus
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-black text-center text-2xl sm:text-3xl tracking-[0.35em] sm:tracking-[0.5em] focus:ring-4 ring-blue-500/10 transition-all placeholder:text-[10px] placeholder:tracking-widest"
                />
                
                <button 
                  onClick={verifyMfaChallenge}
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-[11px] uppercase italic tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Verifica e Accedi"}
                </button>

                <button 
                  onClick={() => setShowMfaChallenge(false)}
                  className="text-[9px] font-black uppercase text-gray-400 hover:text-gray-800 tracking-[0.2em] flex items-center gap-2 mx-auto"
                >
                  <X size={12} /> Torna al Login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
