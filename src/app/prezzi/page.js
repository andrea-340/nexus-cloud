"use client";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "0",
      features: [
        "10GB Storage sicuro",
        "Accesso Base Finanza",
        "1 Scheda Palestra attiva",
        "Supporto Community",
      ],
      btn: "Inizia Gratis",
      featured: false,
      // Il piano free manda alla registrazione semplice
      link: "/register?plan=free",
    },
    {
      name: "Premium",
      price: "9.99",
      features: [
        "500GB Storage Premium",
        "Finanza Avanzata (Export PDF)",
        "Schede Palestra Illimitate",
        "Supporto prioritario 24/7",
      ],
      btn: "Prova Premium",
      featured: true,
      // I piani a pagamento passano prima per la registrazione
      link: "/register?plan=premium",
    },
    {
      name: "Business",
      price: "29.99",
      features: [
        "2TB Storage Aziendale",
        "Multi-Utente (fino a 5)",
        "API dedicate & Webhook",
        "Backup Giornaliero automatico",
      ],
      btn: "Contatta Sales",
      featured: false,
      link: "/register?plan=business",
    },
  ];

  return (
    <div className="bg-white pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto text-center">
        {/* Header Sezione Prezzi */}
        <div className="mb-16">
          <h2 className="text-[#1a73e8] font-bold text-sm uppercase tracking-[0.2em] mb-4">
            Prezzi e Piani
          </h2>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-gray-900 tracking-tight leading-tight">
            Soluzioni flessibili per il tuo <br />
            <span className="text-[#1a73e8]">mondo digitale</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Nessun costo nascosto. Inizia con la prova gratuita e sblocca
            funzionalità avanzate quando ne hai bisogno.
          </p>
        </div>

        {/* Griglia Piani */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 sm:p-8 md:p-10 rounded-[2rem] border transition-all duration-300 flex flex-col h-full ${
                plan.featured
                  ? "border-[#1a73e8] shadow-[0_20px_50px_rgba(26,115,232,0.15)] md:scale-105 bg-white z-10"
                  : "border-gray-100 shadow-sm bg-white hover:border-gray-200"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1a73e8] text-white px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em]">
                  Consigliato
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {plan.name}
                </h3>
                <div className="flex justify-center items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter">
                    €{plan.price}
                  </span>
                  <span className="text-gray-400 font-bold text-sm italic">
                    /mese
                  </span>
                </div>
              </div>

              {/* Lista Feature */}
              <ul className="text-left space-y-5 mb-12 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-sm font-medium text-gray-600"
                  >
                    <Check
                      size={18}
                      className="text-[#1a73e8] shrink-0 mt-0.5"
                      strokeWidth={3}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Tasto Azione con senso logico */}
              <Link
                href={plan.link}
                className={`w-full block py-4 rounded-xl font-bold uppercase italic tracking-widest text-sm transition-all text-center ${
                  plan.featured
                    ? "bg-[#1a73e8] text-white hover:bg-black shadow-lg shadow-blue-100"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {plan.btn}
              </Link>
            </div>
          ))}
        </div>

        {/* Footer info aggiuntiva */}
        <p className="mt-12 text-gray-400 text-xs font-bold uppercase tracking-widest">
          Tutti i piani includono la crittografia dei dati end-to-end.
        </p>
      </div>
    </div>
  );
}
