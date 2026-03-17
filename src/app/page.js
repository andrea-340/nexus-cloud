"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "../lib/supabaseClient"; // Assicurati che il percorso sia giusto
import { useRouter } from "next/navigation";
import Link from "next/link"; // <--- AGGIUNTO QUESTO (Mancava!)
import {
  Folder, Dumbbell, ImageIcon, Briefcase, Bot, ArrowRight, 
  Loader2, X, Upload, Wallet, Trash2, FileText, CheckCircle2, 
  ChevronRight, PiggyBank, TrendingUp, Plus, Target, Euro,
  Shield, Zap,
  // AGGIUNTE QUESTE ICONE (Mancavano!)
  Database, Cpu, BarChart3, Fingerprint, Globe, Lock,
  Sparkles, MessageSquare, ShieldCheck, Activity, Layers, Rocket, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-blue-500/30">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-60 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-blue-600/10 blur-[150px] rounded-full -mt-[500px]" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full" />

        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 mb-12 backdrop-blur-md"
          >
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-100/60">
              Il futuro del Cloud è qui. Benvenuto in Nexus v3.0
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.85] mb-10"
          >
            Sincronizza <br /> La Tua <span className="text-blue-600">Realtà</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl mx-auto text-gray-400 font-medium text-xl md:text-2xl mb-14 leading-relaxed"
          >
            L&apos;unico ecosistema digitale che fonde archiviazione intelligente, 
            gestione finanziaria avanzata e potenza IA in un&apos;unica interfaccia professionale.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link
              href="/register"
              className="group relative px-12 py-6 bg-blue-600 rounded-[2rem] font-black uppercase italic text-sm overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-600/40"
            >
              <span className="relative z-10 flex items-center gap-3">Inizia il Viaggio <ArrowRight size={18} /></span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            </Link>
            <Link
              href="#ia"
              className="px-12 py-6 bg-white/5 border border-white/10 rounded-[2rem] font-black uppercase italic text-sm hover:bg-white hover:text-black transition-all"
            >
              Scopri Nexus IA
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- STATS BAR --- */}
      <section className="py-20 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <StatItem icon={<ShieldCheck size={18}/>} label="Sicurezza" value="MIL-SPEC" />
          <StatItem icon={<Cpu size={18}/>} label="Core Engine" value="NEXUS V3" />
          <StatItem icon={<Activity size={18}/>} label="Performance" value="ULTRA-FAST" />
          <StatItem icon={<Globe size={18}/>} label="Uptime" value="99.99%" />
        </div>
      </section>

      {/* --- AI PRESENTATION --- */}
      <section id="ia" className="py-40 px-6 relative">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl bg-blue-600/20 border border-blue-600/30">
              <Bot size={20} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Intelligence Unit</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
              Nexus <span className="text-blue-600">IA</span>: Il Tuo <br /> Cervello Cloud
            </h2>
            <p className="text-xl text-gray-400 leading-relaxed font-medium">
              Non limitarti ad archiviare. Interroga il tuo archivio. La nostra IA analizza istantaneamente 
              i tuoi documenti, estrae dati dai PDF e ti assiste nella gestione quotidiana del lavoro e della salute.
            </p>
            <ul className="space-y-6">
              <FeatureItem title="Analisi Documentale" desc="Carica un PDF e chiedi a Nexus di riassumerlo o trovare dati specifici." />
              <FeatureItem title="Bio-Metrica Palestra" desc="Calcola carichi e massimali basandosi sullo storico dei tuoi allenamenti." />
              <FeatureItem title="Business Insight" desc="Analizza fatture e preventivi per fornirti una visione chiara del tuo lavoro." />
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-blue-600/20 blur-[100px] rounded-full" />
            <div className="relative bg-white/5 border border-white/10 rounded-[4rem] p-10 backdrop-blur-3xl shadow-3xl">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"><MessageSquare size={18}/></div>
                  <div className="h-2 w-48 bg-white/10 rounded-full animate-pulse" />
                </div>
                <div className="flex items-center gap-4 p-5 bg-blue-600/10 rounded-2xl border border-blue-600/20 ml-12">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-blue-400"><Bot size={18}/></div>
                  <div className="space-y-2">
                    <div className="h-2 w-64 bg-blue-400/30 rounded-full" />
                    <div className="h-2 w-40 bg-blue-400/30 rounded-full" />
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"><CheckCircle2 size={18}/></div>
                  <div className="h-2 w-32 bg-white/10 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- SERVICES GRID --- */}
      <section id="servizi" className="py-40 px-6 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-[1200px] mx-auto text-center mb-32">
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6">
            Servizi <span className="text-blue-600">Integrati</span>
          </h2>
          <p className="text-gray-500 font-black uppercase text-xs tracking-[0.4em]">Architettura a 360 Gradi</p>
        </div>

        <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          <FeatureCard 
            icon={<Wallet size={40} />} 
            title="Finance Hub" 
            desc="Monitora stipendi, spese e obiettivi di risparmio con grafici in tempo reale. Il tuo CFO digitale."
            color="hover:border-emerald-500/50"
          />
          <FeatureCard 
            icon={<Briefcase size={40} />} 
            title="Lavoro & P.IVA" 
            desc="Gestione fatture, preventivi e documenti aziendali separata dai file personali. Organizzazione pura."
            color="hover:border-blue-500/50"
          />
          <FeatureCard 
            icon={<Dumbbell size={40} />} 
            title="Training Pro" 
            desc="Editor di schede operativo e live-view per i tuoi allenamenti in tempo reale."
            color="hover:border-orange-500/50"
          />
          <FeatureCard 
            icon={<Layers size={40} />} 
            title="Smart Notes" 
            desc="Un ecosistema di note professionali con titoli, contenuti e salvataggio automatico cloud."
            color="hover:border-purple-500/50"
          />
          <FeatureCard 
            icon={<Calendar size={40} />} 
            title="Nexus Events" 
            desc="Pianifica ogni appuntamento nel calendario integrato. Sincronizzazione totale tra i dispositivi."
            color="hover:border-blue-400/50"
          />
          <FeatureCard 
            icon={<Lock size={40} />} 
            title="Security Max" 
            desc="Dati crittografati e gestione accessi basata sui piani Free, Pro e Premium."
            color="hover:border-red-500/50"
          />
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-60 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[800px] bg-blue-600/10 blur-[200px] rounded-full" />
        
        <div className="max-w-[1000px] mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[5rem] p-20 md:p-32 shadow-3xl border border-white/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-3xl rounded-full -mr-40 -mt-40" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/20 blur-3xl rounded-full -ml-40 -mb-40" />
            
            <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-12 leading-[0.9]">
              Il Tuo <br /> Futuro è <br /> <span className="text-white">Connesso.</span>
            </h2>
            <Link
              href="/register"
              className="group inline-flex items-center gap-5 bg-white text-blue-900 px-16 py-8 rounded-[2.5rem] font-black uppercase italic text-lg tracking-widest hover:scale-105 transition-all shadow-2xl"
            >
              Attiva Nexus Cloud <Rocket size={24} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-6 border-t border-white/5 bg-black">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <Zap size={24} className="text-blue-600" />
            <span className="text-xl font-black italic uppercase tracking-tighter">Nexus <span className="text-blue-600">Cloud</span></span>
          </div>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Termini</Link>
            <Link href="#" className="hover:text-white transition-colors">Sicurezza</Link>
          </div>
          <p className="text-[9px] font-black uppercase text-gray-700 tracking-[0.2em]">
            © 2026 Nexus Cloud Intelligence — Built for the future
          </p>
        </div>
      </footer>
    </div>
  );
}

// COMPONENTI DI SUPPORTO
function StatItem({ icon, label, value }) {
  return (
    <div className="space-y-3">
      <div className="text-blue-600 flex justify-center">{icon}</div>
      <p className="text-3xl font-black italic text-white leading-none">{value}</p>
      <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest leading-none">
        {label}
      </p>
    </div>
  );
}

function FeatureItem({ title, desc }) {
  return (
    <li className="flex gap-5">
      <div className="w-6 h-6 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white">
        <CheckCircle2 size={14} />
      </div>
      <div>
        <h4 className="text-sm font-black uppercase italic text-white mb-1">{title}</h4>
        <p className="text-sm text-gray-500 font-medium leading-relaxed">{desc}</p>
      </div>
    </li>
  );
}

function FeatureCard({ icon, title, desc, color }) {
  return (
    <motion.div
      whileHover={{ y: -15, scale: 1.02 }}
      className={`p-12 rounded-[4rem] bg-white/[0.02] border border-white/5 ${color} transition-all duration-500 group relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors" />
      <div className="text-blue-500 mb-10 group-hover:scale-110 group-hover:text-white transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-black italic uppercase mb-6 tracking-tight">{title}</h3>
      <p className="text-gray-500 text-base font-medium leading-relaxed group-hover:text-gray-300 transition-colors">
        {desc}
      </p>
    </motion.div>
  );
}
