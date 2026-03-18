"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cloud, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient"; // Importiamo il client reale

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [dataNascita, setDataNascita] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);

  const router = useRouter();

  const handleAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const fullName = `${nome} ${cognome}`.trim();

    // LOGICA REALE SUPABASE
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          birth_date: dataNascita,
        },
        // Reindirizza l'utente alla dashboard dopo la conferma (se attiva)
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      if (error.message.includes("rate limit")) {
        setErrorMsg("Hai effettuato troppe registrazioni in poco tempo. Riprova tra un'ora.");
      } else {
        setErrorMsg(error.message);
      }
      setLoading(false);
    } else {
      // Successo! L'utente è stato creato.
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 py-8">
      <div className="max-w-[400px] w-full p-6 sm:p-10 border border-gray-100 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-blue-50 text-center">
        <Cloud size={40} className="text-[#1a73e8] mx-auto mb-6" />
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">
          Nexus Cloud
        </h1>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mb-8">
          Crea un nuovo account
        </p>

        {/* Messaggio di errore se la registrazione fallisce */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase text-left">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleAction} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              required
              type="text"
              placeholder="NOME"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 ring-blue-500 font-bold text-xs uppercase"
            />
            <input
              required
              type="text"
              placeholder="COGNOME"
              value={cognome}
              onChange={(e) => setCognome(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 ring-blue-500 font-bold text-xs uppercase"
            />
          </div>
          
          <div className="text-left">
            <label className="text-[9px] font-black text-gray-400 uppercase ml-4 mb-1 block">Data di Nascita</label>
            <input
              required
              type="date"
              value={dataNascita}
              onChange={(e) => setDataNascita(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 ring-blue-500 font-bold text-xs uppercase"
            />
          </div>

          <input
            required
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 ring-blue-500 font-bold text-xs uppercase"
          />
          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 pr-12 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 ring-blue-500 font-bold text-xs uppercase"
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

          <button
            disabled={loading}
            className="w-full bg-[#1a73e8] text-white py-5 rounded-2xl font-black italic uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all hover:bg-black"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                Registrati Ora <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
            Hai già un account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline ml-1">
              Accedi qui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
