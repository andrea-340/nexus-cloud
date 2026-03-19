"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Conferma account in corso...");
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const ensureProfile = async (user) => {
      if (!user?.id) return;

      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "Operatore Nexus";
      const birthDate = user.user_metadata?.birth_date || "";

      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email || "",
        full_name: fullName,
        birth_date: birthDate,
        piano: "Free Plan",
      });
    };

    const completeAuth = async () => {
      try {
        const code = searchParams.get("code");
        const errorDescription = searchParams.get("error_description") || searchParams.get("error");

        if (errorDescription) {
          throw new Error(decodeURIComponent(errorDescription));
        }

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          router.replace("/login?confirmed=success");
          return;
        }

        await ensureProfile(session.user);

        if (!active) return;
        setStatus("Account confermato. Accesso in corso...");
        router.replace("/dashboard");
      } catch (err) {
        if (!active) return;
        const message = err?.message || "Errore durante la conferma dell'account.";
        setError(message);
        setStatus("");
        setTimeout(() => {
          router.replace(`/login?confirmed=error&message=${encodeURIComponent(message)}`);
        }, 1200);
      }
    };

    completeAuth();

    return () => {
      active = false;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-[420px] w-full bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 text-center">
        <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${error ? "bg-red-50 text-red-600" : "bg-blue-600 text-white shadow-xl shadow-blue-600/20"}`}>
          {error ? <AlertCircle size={30} /> : <Loader2 size={30} className="animate-spin" />}
        </div>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-gray-800">
          {error ? "Errore Conferma" : "Conferma Account"}
        </h1>
        <p className="mt-4 text-sm font-bold text-slate-500 leading-relaxed">
          {error || status}
        </p>
        {!error && (
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
            <CheckCircle2 size={14} />
            Sicurezza Supabase attiva
          </div>
        )}
      </div>
    </div>
  );
}

function AuthCallbackFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-[420px] w-full bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-blue-600 text-white shadow-xl shadow-blue-600/20">
          <Loader2 size={30} className="animate-spin" />
        </div>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-gray-800">
          Conferma Account
        </h1>
        <p className="mt-4 text-sm font-bold text-slate-500 leading-relaxed">
          Preparazione verifica in corso...
        </p>
      </div>
    </div>
  );
}
