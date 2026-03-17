"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { AlertCircle, CheckCircle2, Cloud, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ResetPassword() {
  const router = useRouter();
  const [isExchanging, setIsExchanging] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [expectedEmail, setExpectedEmail] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          setIsReady(true);
        } else if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
          setIsReady(true);
        } else {
          setError("Link non valido o incompleto. Apri questo link direttamente dalla mail di ripristino.");
          setIsReady(false);
        }

        const { data: userData } = await supabase.auth.getUser();
        const userEmail = userData?.user?.email || "";
        setExpectedEmail(userEmail);
        setEmail(userEmail);
      } catch (err) {
        setError(err?.message || "Errore durante la validazione del link di ripristino.");
        setIsReady(false);
      } finally {
        setIsExchanging(false);
      }
    };

    init();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!isReady) {
      setError("Sessione di ripristino non valida. Richiedi una nuova email di ripristino.");
      return;
    }

    if (expectedEmail && email.trim().toLowerCase() !== expectedEmail.toLowerCase()) {
      setError("Email non corretta per questo link di ripristino.");
      return;
    }

    if (password.length < 8) {
      setError("La password deve avere almeno 8 caratteri.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Le password non coincidono.");
      return;
    }

    setSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setMessage("Password aggiornata con successo. Ora puoi accedere.");
      setTimeout(() => router.push("/login"), 800);
    } catch (err) {
      setError(err?.message || "Errore durante l'aggiornamento della password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-[420px] w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 text-center relative overflow-hidden">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/20">
          <Cloud size={32} />
        </div>

        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-gray-800">
          Reimposta Password
        </h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase mb-8 leading-relaxed px-4 tracking-widest">
          Scegli una nuova password per il tuo account.
        </p>

        <AnimatePresence mode="wait">
          {isExchanging ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 flex items-center justify-center gap-3 text-xs font-bold uppercase text-gray-400 tracking-widest"
            >
              <Loader2 className="animate-spin" /> Validazione link...
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
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

              <form onSubmit={handleUpdatePassword} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="EMAIL"
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 ring-blue-500 font-bold text-xs uppercase"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isReady || saving}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">
                    Nuova Password
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full p-4 pr-12 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 ring-blue-500 font-bold text-xs uppercase"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={!isReady || saving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-800"
                      disabled={!isReady || saving}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">
                    Conferma Password
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full p-4 pr-12 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 ring-blue-500 font-bold text-xs uppercase"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={!isReady || saving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? "Nascondi password" : "Mostra password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-800"
                      disabled={!isReady || saving}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  disabled={!isReady || saving}
                  className="w-full bg-[#1a73e8] text-white py-5 rounded-2xl font-black italic uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all hover:bg-black disabled:opacity-50 disabled:hover:bg-[#1a73e8]"
                >
                  {saving ? <Loader2 className="animate-spin" /> : "Aggiorna Password"}
                </button>
              </form>

              <p className="mt-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <Link href="/login" className="text-blue-600 hover:underline">
                  Torna al login
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
