"use client";
import { useState } from "react";
import { Check, CreditCard, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const PIANI = [
  { id: "free", nome: "Free", prezzo: "0", desc: "1GB Cloud, Funzioni Base" },
  {
    id: "basic",
    nome: "Basic",
    prezzo: "5",
    desc: "10GB Cloud, Finanza Avanzata",
  },
  { id: "pro", nome: "Pro", prezzo: "10", desc: "Illimitato, Palestra + AI" },
];

export default function Checkout() {
  const [step, setStep] = useState(1); // 1: Scelta Piano, 2: Pagamento
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    if (plan.id === "free") {
      router.push("/dashboard");
    } else {
      setStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-[1000px] mx-auto">
        {step === 1 ? (
          <>
            <h2 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-center mb-8 sm:mb-12">
              Scegli il tuo <span className="text-blue-600">Piano</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              {PIANI.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                    {p.nome}
                  </p>
                  <p className="text-5xl font-black mb-4">€{p.prezzo}</p>
                  <p className="text-xs text-gray-500 font-bold mb-8">
                    {p.desc}
                  </p>
                  <button
                    onClick={() => handleSelectPlan(p)}
                    className="mt-auto w-full bg-blue-50 text-blue-600 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                  >
                    Seleziona
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="max-w-[450px] mx-auto bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-2xl">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase mb-6 hover:text-black"
            >
              <ArrowLeft size={14} /> Indietro
            </button>
            <h3 className="text-2xl font-black italic uppercase mb-2">
              Pagamento
            </h3>
            <p className="text-xs font-bold text-blue-600 uppercase mb-8 tracking-widest">
              Piano {selectedPlan?.nome} - €{selectedPlan?.prezzo}/mese
            </p>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setLoading(true);
                setTimeout(() => router.push("/dashboard"), 2000);
              }}
            >
              <input
                required
                placeholder="TITOLARE CARTA"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-xs uppercase outline-none focus:ring-2 ring-blue-500"
              />
              <input
                required
                placeholder="NUMERO CARTA"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-xs uppercase outline-none focus:ring-2 ring-blue-500"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  required
                  placeholder="MM/AA"
                  className="p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-xs uppercase"
                />
                <input
                  required
                  placeholder="CVV"
                  className="p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-xs uppercase"
                />
              </div>
              <button
                disabled={loading}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black italic uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Paga Ora"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
