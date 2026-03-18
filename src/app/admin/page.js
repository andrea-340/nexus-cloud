"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  Users, ShieldCheck, CreditCard, Activity, 
  ArrowLeft, Search, Mail, Calendar, 
  AlertCircle, Loader2, CheckCircle2, UserCheck
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ total: 0, pro: 0, premium: 0, free: 0 });
  
  const router = useRouter();

  // DEFINISCI QUI L'EMAIL DELL'AMMINISTRATORE
  const ADMIN_EMAIL = "altomarea59@gmail.com"; 

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("Nessuna sessione trovata.");
        router.push("/login");
        return;
      }

      if (session.user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        console.error("Accesso negato: email non corrispondente.", session.user.email);
        alert("Accesso Negato: Solo l'amministratore principale può accedere a questa pagina.");
        router.push("/dashboard");
        return;
      }

      setUser(session.user);
      setIsAdmin(true);
      fetchAllUsers();
    } catch (err) {
      console.error("Errore durante il controllo admin:", err);
      router.push("/dashboard");
    }
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      // 1. Verifichiamo prima se possiamo leggere la tabella
      const { data, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) {
        console.error("Dettaglio errore database:", error);
        
        // Messaggi di errore specifici per l'admin
        if (error.message.includes("column") && error.message.includes("email")) {
          alert("ERRORE CRITICO: La colonna 'email' non esiste ancora nella tabella 'profiles'. Torna nel SQL Editor e aggiungila con: ALTER TABLE profiles ADD COLUMN email TEXT;");
        } else if (error.message.includes("policy")) {
          alert("ERRORE PERMESSI: La policy RLS impedisce la lettura. Assicurati di aver eseguito il comando CREATE POLICY per l'admin.");
        } else {
          alert("Errore caricamento: " + error.message);
        }
        throw error;
      }

      setAllUsers(data || []);
      
      // Calcola statistiche in modo sicuro
      const proCount = (data || []).filter(u => u.piano && u.piano.toLowerCase().includes("pro")).length;
      const premiumCount = (data || []).filter(u => u.piano && u.piano.toLowerCase().includes("premium")).length;
      const freeCount = (data || []).filter(u => !u.piano || u.piano.toLowerCase().includes("free")).length;
      
      setStats({
        total: data.length,
        pro: proCount,
        premium: premiumCount,
        free: freeCount
      });
    } catch (error) {
      console.error("Admin fetch error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 md:p-12 font-sans">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-all mb-4 text-[10px] font-black uppercase tracking-widest">
              <ArrowLeft size={14} /> Torna alla Dashboard
            </Link>
            <div className="flex items-center gap-6">
              <h1 className="text-5xl font-black italic uppercase tracking-tighter">Nexus <span className="text-blue-600">Admin</span></h1>
              <button 
                onClick={fetchAllUsers}
                className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-blue-600 hover:text-white transition-all group"
                title="Ricarica Dati"
              >
                <Activity size={18} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">Pannello di Controllo Centrale</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-[2rem] backdrop-blur-xl">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400">Amministratore</p>
              <p className="text-sm font-bold italic">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <StatCard icon={<Users className="text-blue-500" />} label="Utenti Totali" value={stats.total} />
          <StatCard icon={<CreditCard className="text-emerald-500" />} label="Piani Pro" value={stats.pro} />
          <StatCard icon={<UserCheck className="text-purple-500" />} label="Piani Premium" value={stats.premium} />
          <StatCard icon={<Activity className="text-orange-500" />} label="Stato Sistemi" value="ONLINE" />
        </div>

        {/* User List Table */}
        <div className="bg-white/5 border border-white/10 rounded-[3.5rem] overflow-hidden backdrop-blur-xl">
          <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Database <span className="text-blue-600">Utenti</span></h2>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Cerca per nome o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 outline-none focus:ring-2 ring-blue-500/20 font-bold text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Nome e Cognome</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Email Nexus</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Piano Attivo</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Data Iscrizione</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-10 py-20 text-center">
                      <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={40} />
                      <p className="text-xs font-black uppercase text-gray-500 tracking-widest">Sincronizzazione database...</p>
                    </td>
                  </tr>
                ) : filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-blue-600/20">
                          {u.full_name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{u.full_name || 'Utente Nexus'}</p>
                          <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Verificato</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-sm text-gray-400 font-medium">{u.email || 'N/A'}</td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col gap-1">
                        <span className={`w-fit px-4 py-1.5 rounded-lg text-[9px] font-black uppercase italic ${
                          u.piano?.includes("Premium") ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                          u.piano?.includes("Pro") ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {u.piano || 'Free Plan'}
                        </span>
                        {u.piano?.includes("Trial") && <span className="text-[7px] font-black text-emerald-500 uppercase ml-1">Periodo di Prova</span>}
                      </div>
                    </td>
                    <td className="px-10 py-6 text-xs text-gray-500 font-bold">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('it-IT') : 'N/D'}
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                        <span className="text-[9px] font-black uppercase text-emerald-500 tracking-tighter">Account Attivo</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && !loading && (
            <div className="p-20 text-center">
              <AlertCircle className="mx-auto text-gray-700 mb-4" size={40} />
              <p className="text-xs font-black uppercase text-gray-600 tracking-widest">Nessun utente trovato</p>
              <p className="text-[10px] text-gray-500 uppercase mt-2">Se hai appena creato il database, prova a inserire manualmente gli utenti esistenti tramite SQL.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
      <div className="mb-6">{icon}</div>
      <p className="text-4xl font-black italic uppercase tracking-tighter mb-1">{value}</p>
      <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{label}</p>
    </div>
  );
}
