"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { AlertCircle, CheckCircle2, Cloud, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (resetError) throw resetError;
      setMessage("Email inviata! Apri il link nella mail per scegliere la nuova password.");
    } catch (err) {
      if (err?.message?.includes("rate limit")) {
        setError("Troppi tentativi. Attendi qualche minuto prima di richiedere una nuova email.");
      } else {
        setError(err?.message || "Errore durante l'invio dell'email di ripristino.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-[420px] w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 text-center relative overflow-hidden">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/20">
          <Cloud size={32} />
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-gray-800">
            Ripristina Password
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-8 leading-relaxed px-4 tracking-widest">
            Inserisci la tua email. Ti inviamo un link per impostare la nuova password.
          </p>

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

          <form onSubmit={handleSend} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">
                Email
              </label>
              <input
                required
                type="email"
                placeholder="ANDREA@ESEMPIO.IT"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 ring-blue-500 font-bold text-xs uppercase"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-[#1a73e8] text-white py-5 rounded-2xl font-black italic uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all hover:bg-black"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Invia Link"}
            </button>
          </form>

          <p className="mt-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <Link href="/login" className="text-blue-600 hover:underline">
              Torna al login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

