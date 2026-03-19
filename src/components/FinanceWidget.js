"use client";
import { useState } from "react";
import { Wallet, Plus } from "lucide-react";

export default function FinanceWidget() {
  const [salary] = useState(2500);
  const [expenses, setExpenses] = useState([
    { id: 1, label: "Affitto", amount: 600 },
  ]);
  const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100">
      <div className="flex items-center gap-2 mb-6 font-black italic text-primary uppercase">
        <Wallet size={20} /> <h2>Finanza Personale</h2>
      </div>
      <div className="bg-slate-900 p-6 rounded-3xl text-white mb-6">
        <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
          Saldo Rimanente
        </p>
        <h3 className="text-4xl font-black italic">€{salary - total}</h3>
      </div>
      <div className="space-y-3 mb-6">
        {expenses.map((e) => (
          <div
            key={e.id}
            className="flex justify-between font-bold text-sm bg-slate-50 p-4 rounded-xl"
          >
            <span>{e.label}</span>
            <span className="text-red-500">-€{e.amount}</span>
          </div>
        ))}
      </div>
      <button className="w-full bg-primary text-white p-4 rounded-2xl font-black italic shadow-lg shadow-indigo-100">
        AGGIUNGI SPESA +
      </button>
    </div>
  );
}
