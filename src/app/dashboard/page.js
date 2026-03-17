"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dumbbell, ImageIcon, Briefcase, Bot, X, Upload, 
  Wallet, FileText, CheckCircle2, ChevronRight, Calculator, Edit3, 
  Monitor, Send, Sparkles, Loader2, Trash2, Folder, LifeBuoy, Mail, ChevronDown, Calendar,
  ShieldCheck, Lock, Shield, Music, Play, Pause, SkipForward, SkipBack, Volume2, Search as SearchIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  return (
    <Suspense fallback={<LoaderPage />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollRef = useRef(null);
  
  // --- STATI CORE ---
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ piano: "Pro Plan", full_name: "Utente Nexus", email: "", birth_date: "" });
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light"); // light, dark
  const [userBg, setUserBg] = useState(null);

  // --- NAVIGAZIONE & UI ---
  const [activeFolder, setActiveFolder] = useState(null);
  const [activeSubFolder, setActiveSubFolder] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPianiModal, setShowPianiModal] = useState(false);
  const [showPIvaModal, setShowPIvaModal] = useState(false);
  const [showAssistenzaModal, setShowAssistenzaModal] = useState(false);
  const [pIva, setPIva] = useState("");
  const [haPIva, setHaPIva] = useState(null); // null, true, false
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAppointment, setNewAppointment] = useState({ title: "", time: "09:00", description: "" });
  const [editMode, setEditMode] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState(null);
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvc: "" });
  
  // --- MFA / 2FA STATI ---
  const [isMfaActive, setIsMfaActive] = useState(false);
  const [mfaEnrollData, setMfaEnrollData] = useState(null); // { qr, secret, id }
  const [mfaCode, setMfaCode] = useState("");
  const [showMfaEnroll, setShowMfaEnroll] = useState(false);

  // Gestione view dai searchParams
  useEffect(() => {
    const view = searchParams.get("view");
    if (view === "profilo") setShowUserModal(true);
    else setShowUserModal(false);
    
    if (view === "piani") setShowPianiModal(true);
    else setShowPianiModal(false);
    
    if (view === "assistenza") setShowAssistenzaModal(true);
    else setShowAssistenzaModal(false);
  }, [searchParams]);

  const closeModals = () => {
    setShowUserModal(false);
    setShowPianiModal(false);
    setShowAssistenzaModal(false);
    router.replace("/dashboard", { scroll: false });
  };

  // --- NEXUS AI ---
  const [inputIA, setInputIA] = useState("");
  const [chatIA, setChatIA] = useState([
    { role: "ia", text: "Sistemi Nexus online. Analisi ambiente completata. Come procediamo?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]); // File trovati ma non ancora mostrati

  // --- DATI OPERATIVI (PALESTRA & STORAGE) ---
  const [massimale, setMassimale] = useState(100);
  const [percentuale, setPercentuale] = useState(75);
  const [workoutRoutine, setWorkoutRoutine] = useState("");
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);
  const [userFiles, setUserFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [viewFileUrl, setViewFileUrl] = useState(null);
  const [storageUsage, setStorageUsage] = useState(0); // in bytes
  const [storageLimit, setStorageLimit] = useState(500 * 1024 * 1024); // default 500MB

  // Calcola il limite in base al piano
  useEffect(() => {
    if (profile.piano === "Free Plan") setStorageLimit(500 * 1024 * 1024);
    else if (profile.piano === "Pro Plan") setStorageLimit(2 * 1024 * 1024 * 1024);
    else if (profile.piano === "Premium Plan") setStorageLimit(4 * 1024 * 1024 * 1024);
  }, [profile.piano]);

  // Calcola l'occupazione totale
  const calculateTotalUsage = async () => {
    if (!user) return;
    const useS3 = process.env.NEXT_PUBLIC_USE_S3 === "true";
    let total = 0;

    if (useS3) {
      try {
        const res = await fetch(`/api/storage?action=list&prefix=${user.id}/`);
        const data = await res.json();
        if (data.files) {
          total = data.files.reduce((acc, f) => acc + (f.size || 0), 0);
        }
      } catch (err) { console.error(err); }
    } else {
      // Fallback Supabase (approssimativo)
      const folders = ["Lavoro", "Palestra", "Media", "Musica"];
      for (const folder of folders) {
        const { data } = await supabase.storage.from("files").list(`${user.id}/${folder}`);
        if (data) {
          total += data.reduce((acc, f) => acc + (f.metadata?.size || 0), 0);
        }
      }
    }
    setStorageUsage(total);
  };

  useEffect(() => {
    calculateTotalUsage();
  }, [user, userFiles]);

  // --- DATI FINANZA ---
  const [stipendio, setStipendio] = useState(0);
  const [spese, setSpese] = useState([]);
  const [nuovaSpesa, setNuovaSpesa] = useState({ nome: "", importo: 0 });
  const [obiettivo, setObiettivo] = useState({ nome: "", target: 0, risparmi: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  // --- DATI MUSICA ---
  const [musicSearch, setMusicSearch] = useState("");
  const [musicResults, setMusicResults] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [isMusicLoading, setIsMusicLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));

  // Orologio Real-time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [musicProgress, setMusicProgress] = useState(0);
  const [musicVolume, setMusicVolume] = useState(1);
  const [musicDuration, setMusicDuration] = useState(0);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [isAppleMusicConnected, setIsAppleMusicConnected] = useState(false);
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
  const [isDropboxConnected, setIsDropboxConnected] = useState(false);
  const [externalCloudFiles, setExternalCloudFiles] = useState([]);

  // Caricamento SDK Esterni
  useEffect(() => {
    // Spotify SDK
    const spotifyScript = document.createElement("script");
    spotifyScript.src = "https://sdk.scdn.co/spotify-player.js";
    spotifyScript.async = true;
    document.body.appendChild(spotifyScript);

    // Google Picker API
    const googleScript = document.createElement("script");
    googleScript.src = "https://apis.google.com/js/api.js";
    googleScript.async = true;
    document.body.appendChild(googleScript);

    // Dropbox Chooser SDK
    const dropboxScript = document.createElement("script");
    dropboxScript.src = "https://www.dropbox.com/static/api/2/dropins.js";
    dropboxScript.id = "dropboxjs";
    dropboxScript.setAttribute("data-app-key", "TUA_DROPBOX_APP_KEY");
    document.body.appendChild(dropboxScript);

    return () => {
      document.body.removeChild(spotifyScript);
      document.body.removeChild(googleScript);
      document.body.removeChild(dropboxScript);
    };
  }, []);

  const connectGoogleDrive = () => {
    alert("Inizializzazione Google Cloud Drive... Apertura portale di autorizzazione.");
    // In un caso reale qui andrebbe il flusso OAuth di Google
    setTimeout(() => {
      setIsGoogleDriveConnected(true);
      alert("Nexus Cloud: Google Drive collegato con successo! Ora puoi accedere ai tuoi file Google direttamente da qui.");
    }, 2000);
  };

  const connectDropbox = () => {
    alert("Inizializzazione Dropbox Connect... Verifica permessi cartelle.");
    setTimeout(() => {
      setIsDropboxConnected(true);
      alert("Nexus Cloud: Dropbox collegato con successo! I tuoi file Dropbox sono ora sincronizzati.");
    }, 2000);
  };
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [appleMusicInstance, setAppleMusicInstance] = useState(null);

  // Caricamento SDK Esterni
  useEffect(() => {
    // Spotify SDK
    const spotifyScript = document.createElement("script");
    spotifyScript.src = "https://sdk.scdn.co/spotify-player.js";
    spotifyScript.async = true;
    document.body.appendChild(spotifyScript);

    // Apple Music SDK (MusicKit)
    const appleScript = document.createElement("script");
    appleScript.src = "https://js-cdn.music.apple.com/musickit/v3/musickit.js";
    appleScript.async = true;
    appleScript.onload = () => {
      if (window.MusicKit) {
        // Inizializzazione MusicKit (Richiede Developer Token)
        // MusicKit.configure({ ... });
      }
    };
    document.body.appendChild(appleScript);

    return () => {
      document.body.removeChild(spotifyScript);
      document.body.removeChild(appleScript);
    };
  }, []);

  const connectSpotify = () => {
    const clientId = "INSERISCI_TUO_SPOTIFY_CLIENT_ID"; // Placeholder
    const redirectUri = window.location.origin + "/dashboard";
    const scopes = [
      "user-read-private",
      "user-read-email",
      "user-modify-playback-state",
      "user-read-playback-state",
      "streaming"
    ].join(" ");

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    
    // Apri popup per login reale
    const width = 450, height = 730;
    const left = (window.innerWidth / 2) - (width / 2);
    const top = (window.innerHeight / 2) - (height / 2);
    
    window.open(authUrl, "Spotify Login", `width=${width},height=${height},left=${left},top=${top}`);
  };

  // Cattura token Spotify dall'URL dopo il redirect
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token"))?.split("=")[1];
      if (token) {
        setSpotifyToken(token);
        setIsSpotifyConnected(true);
        window.location.hash = "";
        alert("Nexus Cloud: Connessione Spotify stabilita con successo.");
      }
    }
  }, []);

  const connectAppleMusic = async () => {
    if (!window.MusicKit) {
      alert("Apple MusicKit non ancora caricato. Riprova tra un istante.");
      return;
    }

    try {
      const music = window.MusicKit.getInstance();
      if (music) {
        await music.authorize();
        setIsAppleMusicConnected(true);
        setAppleMusicInstance(music);
        alert("Nexus Cloud: Connessione Apple Music stabilita con successo.");
      } else {
        alert("Configura prima il tuo Developer Token nelle impostazioni di Apple Music.");
      }
    } catch (error) {
      console.error("Apple Music Error:", error);
      alert("Errore durante la connessione ad Apple Music.");
    }
  };

  // --- METEO ---
  const [weatherData, setWeatherData] = useState(null);
  const [selectedCity, setSelectedCity] = useState("Roma");
  const [showCitySelector, setShowCitySelector] = useState(false);

  const italianCities = [
    "Roma", "Milano", "Napoli", "Torino", "Palermo", "Genova", "Bologna", "Firenze", "Bari", "Catania", "Venezia", "Verona", "Cosenza", "Reggio Calabria", "Catanzaro"
  ];

  // 1. SINCRONIZZAZIONE PROFILO
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login");
      } else {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email);
      }
    });

    const fetchProfile = async (userId, email) => {
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", userId).single();
      
      // Controllo MFA reale
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const hasMfa = factors?.all?.some(f => f.factor_type === 'totp' && f.status === 'verified');
      setIsMfaActive(hasMfa);

      if (prof) {
        setProfile({ 
          piano: prof.piano || "Free Plan", 
          full_name: prof.full_name || "Operatore Nexus", 
          email: email || "",
          avatar_url: prof.avatar_url || null,
          birth_date: prof.birth_date || ""
        });

        // Recupera Tema e Sfondo
        if (prof.theme) setTheme(prof.theme);
        if (prof.custom_bg) setUserBg(prof.custom_bg);

        // Recupera città preferita
        if (prof.preferred_city) setSelectedCity(prof.preferred_city);

        if (prof.piva) {
          setPIva(prof.piva);
          setHaPIva(true);
        } else if (prof.ha_piva !== undefined) {
          setHaPIva(prof.ha_piva);
        }
        if (prof.workout_routine) {
          setWorkoutRoutine(prof.workout_routine);
        } else {
          // Fallback locale se non c'è sul DB
          const localWorkout = localStorage.getItem(`nexus_workout_${userId}`);
          if (localWorkout) setWorkoutRoutine(localWorkout);
        }
        
        // Dati Finanza
        if (prof.finance_data) {
          const fd = prof.finance_data;
          setStipendio(fd.stipendio || 0);
          setSpese(fd.spese || []);
          setObiettivo(fd.obiettivo || { nome: "", target: 0, risparmi: 0 });
        }

        // Dati Note
        if (prof.notes_data) {
          setNotes(prof.notes_data);
        } else {
          const localNotes = localStorage.getItem(`nexus_notes_${userId}`);
          if (localNotes) setNotes(JSON.parse(localNotes));
        }

        // Dati Calendario
        if (prof.calendar_data) {
          setAppointments(prof.calendar_data);
        } else {
          const localCal = localStorage.getItem(`nexus_calendar_${userId}`);
          if (localCal) setAppointments(JSON.parse(localCal));
        }
      }
      setLoading(false);
    };

    const initNexus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");
      setUser(session.user);
      await fetchProfile(session.user.id, session.user.email);
    };
    
    initNexus();
    return () => subscription.unsubscribe();
  }, [router]);

  const saveWorkout = async (newRoutine) => {
    if (!user) return;
    setIsSavingWorkout(true);
    try {
      // Salva su Supabase
      const { error } = await supabase
        .from("profiles")
        .update({ workout_routine: newRoutine })
        .eq("id", user.id);
      
      // Fallback su localStorage per "real-time" e persistenza locale se Supabase fallisce
      localStorage.setItem(`nexus_workout_${user.id}`, newRoutine);
      
      if (error) console.warn("Supabase update failed, using localStorage fallback", error.message);
      setWorkoutRoutine(newRoutine);
    } catch (error) {
      console.error("Save workout error:", error.message);
    } finally {
      setIsSavingWorkout(false);
    }
  };

  const saveFinance = async (data) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ finance_data: data })
        .eq("id", user.id);
      if (error) throw error;
      console.log("Finance data saved successfully");
    } catch (error) {
      console.error("Save finance error:", error.message);
    }
  };

  const saveNotes = async (newNotes) => {
    if (!user) return;
    try {
      localStorage.setItem(`nexus_notes_${user.id}`, JSON.stringify(newNotes));
      const { error } = await supabase
        .from("profiles")
        .update({ notes_data: newNotes })
        .eq("id", user.id);
      if (error) throw error;
    } catch (error) {
      console.warn("Nexus Cloud: Nota salvata localmente.");
    }
  };

  const handleAddNote = () => {
    const newNote = { id: Date.now(), title: "Nuova Nota", content: "", date: new Date().toLocaleDateString() };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setActiveNote(newNote);
    saveNotes(updatedNotes);
  };

  const handleDeleteNote = (id) => {
    if (confirm("Sei sicuro di voler eliminare questa nota?")) {
      const updatedNotes = notes.filter(n => n.id !== id);
      setNotes(updatedNotes);
      if (activeNote?.id === id) setActiveNote(null);
      saveNotes(updatedNotes);
    }
  };

  const handleUpdateNote = (id, field, value) => {
    const updatedNotes = notes.map(n => n.id === id ? { ...n, [field]: value } : n);
    setNotes(updatedNotes);
    if (activeNote?.id === id) setActiveNote({ ...activeNote, [field]: value });
    saveNotes(updatedNotes);
  };

  // --- LOGICA MFA / 2FA REAL ---
  const startMfaEnroll = async () => {
    try {
      // Controlla se esiste già un fattore non verificato
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const existingUnverified = factors.all.find(f => f.factor_type === 'totp' && f.status === 'unverified');
      
      if (existingUnverified) {
        // Se esiste già, dobbiamo rimuoverlo o usare quello. 
        // Per semplicità lo rimuoviamo e ne creiamo uno nuovo per rigenerare il QR.
        await supabase.auth.mfa.unenroll({ factorId: existingUnverified.id });
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'Nexus Cloud',
        friendlyName: user.email.split('@')[0] + "_" + Math.floor(Math.random() * 1000)
      });
      
      if (error) throw error;
      
      setMfaEnrollData({
        qr: data.totp.qr_code,
        secret: data.totp.secret,
        id: data.id
      });
      setShowMfaEnroll(true);
    } catch (error) {
      alert("Errore inizializzazione 2FA: " + error.message);
    }
  };

  const verifyMfaEnroll = async () => {
    if (!mfaCode || !mfaEnrollData) return;
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaEnrollData.id
      });
      
      if (challengeError) throw challengeError;
      
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaEnrollData.id,
        challengeId: challengeData.id,
        code: mfaCode
      });
      
      if (verifyError) throw verifyError;
      
      setIsMfaActive(true);
      setShowMfaEnroll(false);
      setMfaEnrollData(null);
      setMfaCode("");
      alert("Autenticazione a Due Fattori (2FA) attivata con successo!");
    } catch (error) {
      alert("Codice non valido o errore verifica: " + error.message);
    }
  };

  const unenrollMfa = async () => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors.all.find(f => f.factor_type === 'totp');
      
      if (totpFactor) {
        const { error } = await supabase.auth.mfa.unenroll({
          factorId: totpFactor.id
        });
        if (error) throw error;
        setIsMfaActive(false);
        alert("2FA disattivata correttamente.");
      }
    } catch (error) {
      alert("Errore disattivazione: " + error.message);
    }
  };

  const handleStartProTrial = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ piano: "Pro Plan (Trial)" })
        .eq("id", user.id);
      
      if (error) throw error;
      setProfile({ ...profile, piano: "Pro Plan (Trial)" });
      alert("Prova gratuita di 7 giorni attivata! Ora hai accesso a tutti i moduli Pro.");
    } catch (error) {
      alert("Errore attivazione prova: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveCalendar = async (newApps) => {
    if (!user) return;
    try {
      localStorage.setItem(`nexus_calendar_${user.id}`, JSON.stringify(newApps));
      const { error } = await supabase
        .from("profiles")
        .update({ calendar_data: newApps })
        .eq("id", user.id);
      if (error) throw error;
    } catch (error) {
      console.warn("Nexus Cloud: Calendario salvato localmente.");
    }
  };

  const handleAddAppointment = () => {
    if (!newAppointment.title) return;
    const app = { 
      id: Date.now(), 
      date: selectedDate, 
      ...newAppointment 
    };
    const updated = [...appointments, app];
    setAppointments(updated);
    saveCalendar(updated);
    setNewAppointment({ title: "", time: "09:00", description: "" });
  };

  const handleDeleteAppointment = (id) => {
    if (confirm("Eliminare questo impegno dal calendario?")) {
      const updated = appointments.filter(a => a.id !== id);
      setAppointments(updated);
      saveCalendar(updated);
    }
  };

  const handleAddSpesa = () => {
    if (!nuovaSpesa.nome || nuovaSpesa.importo <= 0) return;
    const nuoveSpese = [...spese, { ...nuovaSpesa, id: Date.now() }];
    setSpese(nuoveSpese);
    saveFinance({ stipendio, spese: nuoveSpese, obiettivo });
    setNuovaSpesa({ nome: "", importo: 0 });
  };

  const handleDeleteSpesa = (id) => {
    const nuoveSpese = spese.filter(s => s.id !== id);
    setSpese(nuoveSpese);
    saveFinance({ stipendio, spese: nuoveSpese, obiettivo });
  };

  const handleUpdateStipendio = (val) => {
    const s = Number(val);
    setStipendio(s);
    saveFinance({ stipendio: s, spese, obiettivo });
  };

  const handleUpdateObiettivo = (val) => {
    const nuovoRisparmio = Number(val);
    const nuovoObiettivo = { ...obiettivo, risparmi: nuovoRisparmio };
    setObiettivo(nuovoObiettivo);
    saveFinance({ stipendio, spese, obiettivo: nuovoObiettivo });
    
    if (nuovoRisparmio >= obiettivo.target && obiettivo.target > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  };

  const handleUpdateObiettivoTarget = (val) => {
    const t = Number(val);
    const nuovoObiettivo = { ...obiettivo, target: t };
    setObiettivo(nuovoObiettivo);
    saveFinance({ stipendio, spese, obiettivo: nuovoObiettivo });
  };

  const handleUpdateObiettivoNome = (val) => {
    const nuovoObiettivo = { ...obiettivo, nome: val };
    setObiettivo(nuovoObiettivo);
    saveFinance({ stipendio, spese, obiettivo: nuovoObiettivo });
  };

  // --- LOGICA MUSICA ---
  const searchMusic = async () => {
    if (!musicSearch.trim()) return;
    setIsMusicLoading(true);
    try {
      // 1. Deezer (Standard)
      const response = await fetch(`/api/music?q=${encodeURIComponent(musicSearch)}`);
      const data = await response.json();
      let results = [];
      
      if (data.data) {
        results = data.data.map(item => ({
          id: item.id,
          title: item.title,
          artist: item.artist.name,
          album: item.album.title,
          cover: item.album.cover_xl || item.album.cover_big,
          previewUrl: item.preview,
          type: 'deezer',
          uri: item.link
        }));
      }

      // 2. Spotify (Se connesso)
      if (isSpotifyConnected && spotifyToken) {
        const spotRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(musicSearch)}&type=track&limit=10`, {
          headers: { 'Authorization': `Bearer ${spotifyToken}` }
        });
        const spotData = await spotRes.json();
        if (spotData.tracks) {
          const spotTracks = spotData.tracks.items.map(item => ({
            id: item.id,
            title: item.name,
            artist: item.artists[0].name,
            album: item.album.name,
            cover: item.album.images[0].url,
            previewUrl: item.preview_url,
            type: 'spotify',
            uri: item.uri
          }));
          results = [...spotTracks, ...results];
        }
      }

      setMusicResults(results);
    } catch (error) {
      console.error("Errore ricerca musica:", error);
    } finally {
      setIsMusicLoading(false);
    }
  };

  const handleMusicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    
    if (!file.type.startsWith('audio/')) {
      alert("Seleziona un file audio valido (MP3, WAV, ecc.)");
      return;
    }

    setLoading(true);
    try {
      const useS3 = process.env.NEXT_PUBLIC_USE_S3 === "true";
      const path = `${user.id}/Musica/${Date.now()}_${file.name}`;

      if (useS3) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("path", path);
        const res = await fetch("/api/storage", { method: "POST", body: formData });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
      } else {
        const { error: uploadError } = await supabase.storage.from("files").upload(path, file);
        if (uploadError) throw uploadError;
      }

      alert("Brano caricato con successo nella tua libreria!");
      refreshFiles();
    } catch (error) {
      alert("Errore caricamento brano: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const playTrack = (track) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      // Resetta il progresso per un nuovo brano
      setMusicProgress(0);
    }
  };

  const handleMusicProgress = (e) => {
    const time = Number(e.target.value);
    setMusicProgress(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e) => {
    const vol = Number(e.target.value);
    setMusicVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const formatTime = (time) => {
    if (!time) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  // --- GESTIONE ABBONAMENTI & PAGAMENTI ---
  const handleActivatePlan = (planName) => {
    setSelectedPlanToBuy(planName);
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
      alert("Inserisci tutti i dati della carta per procedere.");
      return;
    }
    
    setLoading(true);
    // Simulazione transazione bancaria
    setTimeout(async () => {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ piano: selectedPlanToBuy })
          .eq("id", user.id);
        
        if (error) throw error;
        
        setProfile({ ...profile, piano: selectedPlanToBuy });
        setShowPaymentModal(false);
        setShowPianiModal(false);
        alert(`Pagamento completato! Il tuo piano ${selectedPlanToBuy} è ora attivo.`);
      } catch (error) {
        alert("Errore durante l'attivazione del piano: " + error.message);
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  const handleCancelSubscription = async () => {
    const confirmCancel = confirm("Sei sicuro di voler annullare il tuo abbonamento? Tornerai al piano Free.");
    if (!confirmCancel) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ piano: "Free Plan" })
        .eq("id", user.id);
      
      if (error) throw error;
      
      setProfile({ ...profile, piano: "Free Plan" });
      setShowUserModal(false);
      alert("Abbonamento annullato con successo. Il tuo piano è ora Free.");
    } catch (error) {
      alert("Errore durante l'annullamento: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. SINCRONIZZAZIONE STORAGE (Semplificata, no duplicati)
  const refreshFiles = async () => {
    if (!user || !activeFolder || activeFolder === "Finance") return;
    
    // Se non abbiamo ancora configurato S3, usiamo Supabase (fallback)
    const useS3 = process.env.NEXT_PUBLIC_USE_S3 === "true";
    const path = activeSubFolder 
      ? `${user.id}/${activeFolder}/${activeSubFolder}`
      : `${user.id}/${activeFolder}`;

    if (useS3) {
      try {
        const res = await fetch(`/api/storage?action=list&prefix=${path}`);
        const data = await res.json();
        if (data.files) {
          const filesWithUrls = await Promise.all(data.files.map(async f => {
            const urlRes = await fetch(`/api/storage?action=getUrl&path=${f.key}`);
            const { url } = await urlRes.json();
            return { ...f, url, fullPath: f.key };
          }));
          setUserFiles(filesWithUrls);
          return;
        }
      } catch (err) {
        console.error("S3 List Error:", err);
      }
    }

    // Fallback Supabase
    const { data, error } = await supabase.storage.from("files").list(path);
    if (!error && data) {
      const filesWithUrls = data.filter(f => f.name !== ".emptyFolder").map(f => {
        const { data: { publicUrl } } = supabase.storage.from("files").getPublicUrl(`${path}/${f.name}`);
        return { ...f, url: publicUrl, fullPath: `${path}/${f.name}` };
      });
      setUserFiles(filesWithUrls);
    }
  };

  useEffect(() => { refreshFiles(); }, [user, activeFolder]);

  // 3. LOGICA NEXUS AI (Migliorata per essere reattiva)
  const askNexus = async (directMsg = null) => {
    // Controllo permessi IA
    if (profile.piano !== "Premium Plan") {
      setChatIA(prev => [...prev, { 
        role: "ia", 
        text: "Accesso negato. L'unità Nexus Intelligence (IA) è disponibile esclusivamente per gli utenti con protocollo Premium. Effettua l'upgrade per sbloccare l'analisi dei file e l'assistenza intelligente." 
      }]);
      setShowPianiModal(true);
      return;
    }

    const rawMsg = directMsg || inputIA;
    const userMsg = String(rawMsg || "").trim();
    if (!userMsg) return;
    
    setChatIA(prev => [...prev, { role: "user", text: userMsg }]);
    setInputIA("");
    setIsTyping(true);

    setTimeout(() => {
      let response = `Analisi per l'utente ${profile.full_name.split(' ')[0]}: `;
      const msg = userMsg.toLowerCase();
      let foundFiles = [];
      
      if (msg === "si" || msg === "sì" || msg.includes("mostra") || msg.includes("visualizza")) {
        if (pendingFiles.length > 0) {
          setChatIA(prev => [...prev, { 
            role: "ia", 
            text: `Certamente. Ecco i file individuati nell'unità ${activeFolder || "sistema"}:`,
            files: pendingFiles 
          }]);
          setPendingFiles([]);
          setIsTyping(false);
          return;
        }
      }

      if (msg.includes("ciao")) {
        response = `Ciao ${profile.full_name.split(' ')[0]}! Sono l'unità Nexus, come posso aiutarti oggi?`;
      } else if (msg.includes("assistenza") || msg.includes("aiuto") || msg.includes("problema")) {
        response = "Hai attivato il protocollo Assistenza. Puoi contattare il nostro supporto tecnico tramite la sezione 'Contatti' nel menu, oppure posso guidarti io nella risoluzione di problemi comuni relativi al tuo piano " + profile.piano + ".";
      } else if (msg.includes("file") || msg.includes("archivio") || msg.includes("foto") || msg.includes("video") || msg.includes("documenti")) {
        if (activeFolder) {
          foundFiles = userFiles;
          if (foundFiles.length > 0) {
            response = `Nell'archivio ${activeFolder} ho individuato ${foundFiles.length} elementi (documenti, foto o video). Desideri che li mostri qui in chat?`;
            setPendingFiles(foundFiles);
          } else {
            response = `L'archivio ${activeFolder} risulta attualmente vuoto. Carica dei file per permettermi di analizzarli.`;
          }
        } else {
          response = "Seleziona un'unità archivio per permettermi di scansionare i file e fornirti un'analisi dettagliata del contenuto.";
        }
      } else if (msg.includes("calcola") || msg.includes("carico") || msg.includes("massimale")) {
        const calcolo = (massimale * (percentuale/100)).toFixed(1);
        response += `Calcolo biometrico completato. Al ${percentuale}% del tuo massimale (${massimale}kg), il carico ottimale è ${calcolo}kg. Ho sincronizzato questo dato con la tua scheda attiva.`;
      } else if (msg.includes("scheda") || msg.includes("allenamento") || msg.includes("palestra")) {
        if (workoutRoutine) {
          const exercises = workoutRoutine.split('\n').filter(line => line.trim().length > 0);
          response += `Ho analizzato la tua scheda digitale (${exercises.length} esercizi rilevati). Il tuo carico target di ${ (massimale * (percentuale/100)).toFixed(1) }kg è stato applicato alle serie di potenza.`;
        } else {
          response += "La tua scheda digitale è vuota. Puoi scriverla direttamente nel modulo Training o caricare un PDF per l'estrazione automatica dei dati.";
        }
      } else if (msg.includes("chi sei") || msg.includes("nexus")) {
        response = "Sono l'unità Nexus v3.0, il tuo assistente digitale di livello Pro. Posso gestire i tuoi file, ottimizzare i tuoi carichi in palestra e analizzare i tuoi dati di business in tempo reale.";
      } else if (msg.includes("grazie") || msg.includes("ok")) {
        response = "Protocollo confermato. Resto in attesa di nuove istruzioni, Operatore.";
      } else {
        response += `Comando ricevuto. Sto incrociando i dati tra l'unità ${activeFolder || "sistema globale"} e il tuo protocollo ${profile.piano}. Desideri un report sui file caricati o un'ottimizzazione dei carichi?`;
      }

      setChatIA(prev => [...prev, { role: "ia", text: response }]);
      setIsTyping(false);
      // Scroll automatico alla fine della chat
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 1200);
  };

  // 4. GESTIONE DOCUMENTI (Upload & Delete)
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeFolder) return;

    // Controllo Quota Disco
    if (storageUsage + file.size > storageLimit) {
      alert(`Spazio esaurito! Il tuo piano ${profile.piano} ha un limite di ${(storageLimit / (1024 * 1024 * 1024)).toFixed(1)}GB. Fai l'upgrade per sbloccare più spazio.`);
      setShowPianiModal(true);
      return;
    }

    setIsUploading(true);
    
    const useS3 = process.env.NEXT_PUBLIC_USE_S3 === "true";
    const basePath = activeSubFolder ? `${activeFolder}/${activeSubFolder}` : activeFolder;
    const path = `${user.id}/${basePath}/${Date.now()}_${file.name}`;

    try {
      if (useS3) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("path", path);
        const res = await fetch("/api/storage", { method: "POST", body: formData });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
      } else {
        const { error } = await supabase.storage.from("files").upload(path, file);
        if (error) throw error;
      }
      await refreshFiles();
      await calculateTotalUsage();
    } catch (error) {
      console.error("Upload error:", error.message);
      alert("Errore durante l'upload: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadFile = async (f) => {
    try {
      // Per S3 l'URL è già firmato e pronto al download
      const useS3 = process.env.NEXT_PUBLIC_USE_S3 === "true";
      if (useS3) {
        const link = document.createElement('a');
        link.href = f.url;
        link.download = f.name.split('_').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const { data, error } = await supabase.storage.from("files").download(f.fullPath);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = f.name.split('_').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error.message);
      alert("Errore durante il download: " + error.message);
    }
  };

  const deleteFile = async (f) => {
    try {
      const useS3 = process.env.NEXT_PUBLIC_USE_S3 === "true";
      if (useS3) {
        const res = await fetch("/api/storage", { 
          method: "DELETE", 
          body: JSON.stringify({ path: f.fullPath }),
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
      } else {
        const { error } = await supabase.storage.from("files").remove([f.fullPath]);
        if (error) throw error;
      }
      await refreshFiles();
      await calculateTotalUsage();
      if (viewFileUrl === f.url) setViewFileUrl(null);
    } catch (error) {
      console.error("Delete error:", error.message);
      alert("Errore durante l'eliminazione: " + error.message);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    // Controllo dimensione file (max 2MB per sicurezza)
    if (file.size > 2 * 1024 * 1024) {
      alert("L'immagine è troppo grande. Massimo 2MB.");
      return;
    }

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Proviamo a caricare nel bucket 'files' (che dovrebbe essere quello predefinito)
      const { error: uploadError } = await supabase.storage
        .from("files")
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) {
        // Se il bucket 'files' non esiste, proviamo con 'avatars'
        if (uploadError.message.includes("Bucket not found")) {
           const { error: uploadErrorAlt } = await supabase.storage
            .from("avatars")
            .upload(filePath, file, { upsert: true });
           
           if (uploadErrorAlt) throw new Error("Per caricare l'immagine, devi creare un bucket chiamato 'files' o 'avatars' nel tuo pannello Supabase Storage e impostarlo come PUBLIC.");
        } else {
          throw uploadError;
        }
      }

      // Otteniamo l'URL pubblico (usando il bucket che ha funzionato)
      const bucketName = "files"; // Assumiamo files per default dopo il check sopra
      const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);

      // Aggiorniamo il database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      alert("Immagine profilo aggiornata!");
    } catch (error) {
      console.error("Errore Avatar:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePIvaSubmit = async () => {
    if (!pIva.trim()) return;
    try {
      await supabase.from("profiles").update({ piva: pIva, ha_piva: true }).eq("id", user.id);
      setHaPIva(true);
      setShowPIvaModal(false);
    } catch (error) {
      console.error("PIVA error:", error.message);
    }
  };

  const handleNoPIva = async () => {
    try {
      await supabase.from("profiles").update({ ha_piva: false }).eq("id", user.id);
      setHaPIva(false);
      setShowPIvaModal(false);
    } catch (error) {
      console.error("No PIVA error:", error.message);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (user) {
      await supabase.from("profiles").update({ theme: newTheme }).eq("id", user.id);
    }
  };

  const setCustomBg = async (url) => {
    setUserBg(url);
    if (user) {
      await supabase.from("profiles").update({ custom_bg: url }).eq("id", user.id);
    }
  };

  // 5. METEO (Solo Pro/Premium)
  useEffect(() => {
    if (profile.piano !== "Free Plan") {
      const fetchWeather = async () => {
        try {
          // Utilizziamo un'API reale (Open-Meteo) per tutte le città italiane
          // Prima recuperiamo le coordinate per la città selezionata (simulato o tramite geocoding rapido)
          const cityCoords = {
            "Roma": { lat: 41.89, lon: 12.49 },
            "Milano": { lat: 45.46, lon: 9.18 },
            "Napoli": { lat: 40.85, lon: 14.26 },
            "Torino": { lat: 45.07, lon: 7.68 },
            "Palermo": { lat: 38.11, lon: 13.36 },
            "Genova": { lat: 44.40, lon: 8.94 },
            "Bologna": { lat: 44.49, lon: 11.34 },
            "Firenze": { lat: 43.76, lon: 11.25 },
            "Bari": { lat: 41.11, lon: 16.87 },
            "Catania": { lat: 37.50, lon: 15.08 },
            "Venezia": { lat: 45.43, lon: 12.31 },
            "Verona": { lat: 45.43, lon: 10.99 },
            "Cosenza": { lat: 39.30, lon: 16.25 },
            "Reggio Calabria": { lat: 38.11, lon: 15.65 },
            "Catanzaro": { lat: 38.90, lon: 16.59 }
          };

          const coords = cityCoords[selectedCity] || cityCoords["Roma"];
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`);
          const data = await res.json();
          
          if (data.current_weather) {
            setWeatherData({
              city: selectedCity,
              temp: `${Math.round(data.current_weather.temperature)}°C`,
              condition: getWeatherCondition(data.current_weather.weathercode),
              feelsLike: `${Math.round(data.current_weather.temperature - 2)}°C` // Simulazione feelsLike
            });
          }
        } catch (error) {
          console.error("Weather fetch error:", error);
        }
      };

      fetchWeather();
      const interval = setInterval(fetchWeather, 300000); // Aggiorna ogni 5 minuti
      return () => clearInterval(interval);
    }
  }, [profile.piano, selectedCity]);

  const getWeatherCondition = (code) => {
    if (code === 0) return "Sereno";
    if (code >= 1 && code <= 3) return "Parzialmente Nuvoloso";
    if (code >= 45 && code <= 48) return "Nebbia";
    if (code >= 51 && code <= 67) return "Pioggia";
    if (code >= 71 && code <= 77) return "Neve";
    if (code >= 80 && code <= 82) return "Rovescio";
    if (code >= 95) return "Temporale";
    return "Variabile";
  };

  const handleCitySelect = async (city) => {
    setSelectedCity(city);
    setShowCitySelector(false);
    if (user) {
      await supabase.from("profiles").update({ preferred_city: city }).eq("id", user.id);
    }
  };

  if (loading) return <LoaderPage />;

  const backgroundStyles = userBg ? {
    backgroundImage: `url(${userBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  } : {};

  return (
    <div 
      style={backgroundStyles}
      className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0F172A] text-white' : 'bg-[#F1F5F9] text-slate-900'} font-sans selection:bg-blue-200`}
    >
      <Navbar />
      
      <main className="max-w-7xl mx-auto pt-32 px-6 pb-24">
        
        {/* --- TERMINALE HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-900'} rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl border border-white/10 ring-4 ring-white`}>
              <Monitor size={32} />
            </div>
            <div>
              <h1 className={`text-3xl font-black italic uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Nexus <span className="text-blue-600">Terminal</span></h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className={`text-[9px] font-black ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'} uppercase tracking-[0.3em]`}>Core v3.0 Active / {profile.full_name}</p>
              </div>
            </div>
          </div>

          {/* Widget Meteo & Orologio Pro */}
          <div className="flex items-center gap-4">
            {/* Orologio Digitale */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} px-6 py-3 rounded-2xl shadow-sm border flex items-center gap-3`}
            >
              <div className="text-right">
                <p className="text-[8px] font-black uppercase text-slate-400">System Time</p>
                <p className={`text-2xl font-black italic ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{currentTime}</p>
              </div>
            </motion.div>

            {weatherData && (
              <div className="relative">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  onClick={() => setShowCitySelector(!showCitySelector)}
                  className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-blue-500' : 'bg-white border-slate-100 hover:border-blue-300'} px-6 py-3 rounded-2xl shadow-sm border flex items-center gap-4 cursor-pointer transition-all`}
                >
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <p className="text-[8px] font-black uppercase text-slate-400">{weatherData.city}</p>
                      <ChevronDown size={8} className="text-slate-400" />
                    </div>
                    <p className={`text-xs font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{weatherData.condition}</p>
                  </div>
                  <div className={`flex items-center gap-2 border-l ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'} pl-4`}>
                    <span className={`text-2xl font-black italic ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{weatherData.temp}</span>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {showCitySelector && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute top-full right-0 mt-2 w-48 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-2xl shadow-2xl border p-2 z-[60] grid grid-cols-2 gap-1`}
                    >
                      {italianCities.map(city => (
                        <button 
                          key={city}
                          onClick={() => handleCitySelect(city)}
                          className={`p-2 text-[9px] font-black uppercase rounded-lg transition-colors ${selectedCity === city ? 'bg-blue-600 text-white' : (theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-600')}`}
                        >
                          {city}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </header>

        {/* --- APPS ROW (Notes & Calendar) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Note App Trigger */}
          <div 
            onClick={() => {
              if (profile.piano === "Free Plan") {
                alert("Le Note sono disponibili solo nei piani Pro e Premium.");
                setShowPianiModal(true);
              } else {
                setShowNotesModal(true);
              }
            }}
            className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-[2rem] p-4 shadow-sm border flex items-center gap-4 group cursor-pointer hover:ring-2 ring-blue-500/20 transition-all`}
          >
            <div className={`bg-slate-900 p-3 rounded-xl text-white group-hover:bg-blue-600 transition-colors`}>
              <Edit3 size={20} />
            </div>
            <div className="flex-1">
              <p className={`text-xs font-black uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Nexus Notes</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{notes.length > 0 ? `${notes.length} note salvate` : "Gestisci le tue note..."}</p>
            </div>
            <div className={`px-4 py-2 ${theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-400'} rounded-lg text-[10px] font-black uppercase group-hover:bg-blue-600 group-hover:text-white transition-all`}>Apri</div>
          </div>

          {/* Calendar App Trigger */}
          <div 
            onClick={() => setShowCalendarModal(true)}
            className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-[2rem] p-4 shadow-sm border flex items-center gap-4 group cursor-pointer hover:ring-2 ring-blue-500/20 transition-all`}
          >
            <div className={`bg-slate-900 p-3 rounded-xl text-white group-hover:bg-blue-600 transition-colors`}>
              <Calendar size={20} />
            </div>
            <div className="flex-1">
              <p className={`text-xs font-black uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Nexus Calendar</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                {appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length} impegni oggi
              </p>
            </div>
            <div className={`px-4 py-2 ${theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-400'} rounded-lg text-[10px] font-black uppercase group-hover:bg-blue-600 group-hover:text-white transition-all`}>Pianifica</div>
          </div>
        </div>

        {/* --- AREA DI LAVORO --- */}
        {!activeFolder ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FolderCard 
              icon={<Briefcase />} 
              title="Lavoro" 
              color="bg-blue-600" 
              onClick={() => {
                if (haPIva === null) {
                  setShowPIvaModal(true);
                } else {
                  setActiveFolder("Lavoro");
                }
              }} 
            />
            <FolderCard 
              icon={<Wallet />} 
              title="Finance" 
              color="bg-emerald-600" 
              onClick={() => {
                if (profile.piano === "Free Plan") {
                  alert("Accesso negato: Il modulo Finance è disponibile solo per i piani Pro e Premium.");
                  setShowPianiModal(true);
                } else {
                  setActiveFolder("Finance");
                }
              }} 
            />
            <FolderCard icon={<Dumbbell />} title="Training" color="bg-orange-500" onClick={() => setActiveFolder("Palestra")} />
            <FolderCard icon={<ImageIcon />} title="Assets" color="bg-purple-600" onClick={() => setActiveFolder("Media")} />
            <FolderCard icon={<Music />} title="Musica" color="bg-pink-600" onClick={() => setActiveFolder("Musica")} />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`${theme === 'dark' ? 'bg-slate-900/80 backdrop-blur-xl border-slate-700' : 'bg-white border-slate-200'} rounded-[3.5rem] p-8 md:p-12 shadow-2xl border relative min-h-[600px]`}>
            {/* Folder Switcher Rapido */}
            <div className={`absolute -top-6 left-1/2 -translate-x-1/2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-full px-6 py-3 shadow-xl border flex gap-4 z-10`}>
              <MiniFolderBtn icon={<Briefcase size={14}/>} active={activeFolder === "Lavoro"} onClick={() => setActiveFolder("Lavoro")} />
              <MiniFolderBtn icon={<Wallet size={14}/>} active={activeFolder === "Finance"} onClick={() => {
                if (profile.piano === "Free Plan") {
                  alert("Upgrade richiesto per il modulo Finance.");
                  setShowPianiModal(true);
                } else {
                  setActiveFolder("Finance");
                }
              }} />
              <MiniFolderBtn icon={<Dumbbell size={14}/>} active={activeFolder === "Palestra"} onClick={() => setActiveFolder("Palestra")} />
              <MiniFolderBtn icon={<ImageIcon size={14}/>} active={activeFolder === "Media"} onClick={() => setActiveFolder("Media")} />
              <MiniFolderBtn icon={<Music size={14}/>} active={activeFolder === "Musica"} onClick={() => setActiveFolder("Musica")} />
            </div>

            <button onClick={() => {setActiveFolder(null); setActiveSubFolder(null); setViewFileUrl(null);}} className={`absolute top-10 right-10 w-12 h-12 ${theme === 'dark' ? 'bg-slate-800 text-slate-500 hover:text-red-500' : 'bg-slate-50 text-slate-300 hover:text-red-600'} rounded-full flex items-center justify-center transition-all shadow-sm`}><X size={24}/></button>
            
            <div className="flex items-center gap-4 mb-12">
               <h2 className={`text-3xl font-black italic uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Archivio / <span className="text-blue-600">{activeFolder}</span> {activeSubFolder && <span className="text-slate-400"> / {activeSubFolder}</span>}</h2>
               <div className={`h-px flex-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`} />
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
              {/* Sezione Musica */}
              {activeFolder === "Musica" && (
                <div className="lg:col-span-12 flex flex-col gap-8">
                  {/* Music Header & Upload */}
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-4">
                    <div className="flex-1 w-full">
                      {profile.piano === "Free Plan" ? (
                        <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Nexus Discovery</p>
                            <p className="text-xs font-bold text-slate-600">La ricerca su Deezer è riservata ai piani Pro e Premium.</p>
                          </div>
                          <button 
                            onClick={() => setShowPianiModal(true)}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-[9px] uppercase italic hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                          >
                            Upgrade
                          </button>
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                          <div className="flex-1 relative w-full">
                            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                              type="text" 
                              placeholder="Cerca su Deezer..." 
                              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-6 outline-none focus:ring-2 ring-pink-500/20 font-bold text-sm"
                              value={musicSearch}
                              onChange={(e) => setMusicSearch(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && searchMusic()}
                            />
                          </div>
                          <button 
                            onClick={searchMusic}
                            disabled={isMusicLoading}
                            className="bg-pink-600 text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase italic tracking-widest hover:bg-pink-700 transition-all shadow-lg shadow-pink-600/20 flex items-center gap-3 disabled:opacity-50"
                          >
                            {isMusicLoading ? <Loader2 className="animate-spin" size={14} /> : <Music size={14} />}
                            Cerca
                          </button>
                        </div>
                      )}
                    </div>

                    <label className="flex-shrink-0 flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase italic tracking-widest cursor-pointer hover:bg-blue-600 transition-all shadow-xl active:scale-95">
                      <Upload size={16} /> Carica Brano MP3
                      <input type="file" accept="audio/*" className="hidden" onChange={handleMusicUpload} />
                    </label>
                  </div>

                  <div className="grid lg:grid-cols-12 gap-10">
                    {/* Lista Risultati & Libreria */}
                    <div className="lg:col-span-8 space-y-10">
                      
                      {/* Servizi Esterni (Spotify / Apple Music) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                          onClick={connectSpotify}
                          className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${isSpotifyConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/30'}`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSpotifyConnected ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                            <Music size={18} />
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] font-black uppercase">Spotify Connect</p>
                            <p className="text-[8px] font-bold uppercase opacity-60">{isSpotifyConnected ? 'Connesso' : 'Collega il tuo account'}</p>
                          </div>
                        </button>
                        <button 
                          onClick={connectAppleMusic}
                          className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${isAppleMusicConnected ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-100 hover:border-red-500 hover:bg-red-50/30'}`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAppleMusicConnected ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'}`}>
                            <Music size={18} />
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] font-black uppercase">Apple Music</p>
                            <p className="text-[8px] font-bold uppercase opacity-60">{isAppleMusicConnected ? 'Connesso' : 'Verifica Apple ID'}</p>
                          </div>
                        </button>
                      </div>

                      {/* La Tua Libreria (File caricati) */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 ml-2">La Tua Libreria Cloud</h3>
                        {userFiles.length > 0 ? (
                          <div className="grid sm:grid-cols-2 gap-4">
                            {userFiles.map((file) => (
                              <div 
                                key={file.id}
                                onClick={() => playTrack({
                                  id: file.id,
                                  title: file.name.split('_').slice(1).join('_'),
                                  artist: "Caricato da te",
                                  album: "Nexus Cloud",
                                  cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop",
                                  previewUrl: file.url,
                                  type: 'local'
                                })}
                                className={`p-4 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer group ${currentTrack?.id === file.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-100'}`}
                              >
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                  {currentTrack?.id === file.id && isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-black text-[11px] uppercase truncate ${currentTrack?.id === file.id ? 'text-blue-600' : 'text-slate-800'}`}>{file.name.split('_').slice(1).join('_')}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase truncate">MP3 • Cloud Storage</p>
                                </div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteFile({ fullPath: file.fullPath }); }}
                                  className="text-slate-200 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center">
                            <Music size={32} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">
                              Nessun brano nel cloud.<br />Trascina i tuoi MP3 qui per iniziare.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Risultati Deezer (Solo per piani superiori) */}
                      {profile.piano !== "Free Plan" && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 ml-2">Scopri su Deezer & Spotify</h3>
                          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                            {musicResults.map((track) => (
                              <div 
                                key={track.id} 
                                className={`group p-4 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer ${currentTrack?.id === track.id ? (track.type === 'spotify' ? 'bg-emerald-50 border-emerald-200' : 'bg-pink-50 border-pink-200') : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md'}`}
                                onClick={() => playTrack(track)}
                              >
                                <div className="relative w-12 h-12 flex-shrink-0">
                                  <img src={track.cover} alt={track.title} className="w-full h-full object-cover rounded-xl shadow-sm" />
                                  <div className={`absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${currentTrack?.id === track.id ? 'opacity-100' : ''}`}>
                                    {currentTrack?.id === track.id && isPlaying ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white ml-1" />}
                                  </div>
                                  {track.type === 'spotify' && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                                      <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-black text-xs uppercase truncate ${currentTrack?.id === track.id ? (track.type === 'spotify' ? 'text-emerald-600' : 'text-pink-600') : 'text-slate-800'}`}>{track.title}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{track.artist} • {track.album}</p>
                                </div>
                                <div className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${track.type === 'spotify' ? 'bg-emerald-100 text-emerald-600' : 'bg-pink-100 text-pink-600'}`}>
                                  {track.type}
                                </div>
                              </div>
                            ))}
                            {musicResults.length === 0 && !isMusicLoading && (
                              <div className="text-center py-20 opacity-20 flex flex-col items-center">
                                <Music size={60} />
                                <p className="text-xs font-black uppercase mt-4">Cerca qualcosa per iniziare l&apos;ascolto</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mini Player Sidebar */}
                    <div className="lg:col-span-4">
                      <div className="bg-slate-900 rounded-[3rem] p-8 text-white sticky top-10 shadow-2xl overflow-hidden group border border-white/5">
                        <div className={`absolute inset-0 bg-gradient-to-br opacity-50 ${currentTrack?.type === 'local' ? 'from-blue-600/20' : (currentTrack?.type === 'spotify' ? 'from-emerald-600/20' : 'from-pink-600/20')} to-transparent`} />
                        <div className="relative z-10">
                          {currentTrack ? (
                            <>
                              {/* Spotify Player Integrato */}
                              {currentTrack.type === 'spotify' ? (
                                <div className="space-y-6">
                                  <div className="text-center mb-6">
                                    <h4 className="text-lg font-black italic uppercase tracking-tighter text-emerald-400">Spotify Integrated</h4>
                                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">Stai riproducendo dall&apos;app Spotify</p>
                                  </div>
                                  <iframe 
                                    src={`https://open.spotify.com/embed/track/${currentTrack.id}`} 
                                    width="100%" 
                                    height="352" 
                                    frameBorder="0" 
                                    allowtransparency="true" 
                                    allow="encrypted-media"
                                    className="rounded-[2rem] shadow-2xl"
                                  />
                                </div>
                              ) : currentTrack.type === 'apple' ? (
                                <div className="space-y-6">
                                  <div className="text-center mb-6">
                                    <h4 className="text-lg font-black italic uppercase tracking-tighter text-red-400">Apple Music</h4>
                                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">Connessione MusicKit Attiva</p>
                                  </div>
                                  <iframe 
                                    src={`https://embed.music.apple.com/it/album/${currentTrack.albumId}?i=${currentTrack.id}`} 
                                    width="100%" 
                                    height="450" 
                                    frameBorder="0" 
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                                    className="rounded-[2rem] shadow-2xl"
                                  />
                                </div>
                              ) : (
                                <>
                                  <div className="aspect-square w-full rounded-[2rem] overflow-hidden mb-8 shadow-2xl ring-1 ring-white/10">
                                    <img src={currentTrack.cover} alt={currentTrack.title} className="w-full h-full object-cover animate-pulse-slow" />
                                  </div>
                                  <div className="text-center mb-8">
                                    <h4 className="text-lg font-black italic uppercase tracking-tighter truncate">{currentTrack.title}</h4>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 truncate ${currentTrack?.type === 'local' ? 'text-blue-400' : 'text-pink-400'}`}>{currentTrack.artist}</p>
                                  </div>
                                  
                                  {/* Audio Tag Nascosto */}
                                  <audio 
                                    ref={audioRef} 
                                    src={currentTrack.previewUrl} 
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    onEnded={() => setIsPlaying(false)}
                                    onTimeUpdate={(e) => setMusicProgress(e.target.currentTime)}
                                    onLoadedMetadata={(e) => setMusicDuration(e.target.duration)}
                                    autoPlay
                                  />

                                  <div className="flex justify-center items-center gap-8 mb-6">
                                    <button className="text-gray-500 hover:text-white transition-all"><SkipBack size={24}/></button>
                                    <button 
                                      onClick={() => isPlaying ? audioRef.current.pause() : audioRef.current.play()}
                                      className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl"
                                    >
                                      {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                                    </button>
                                    <button className="text-gray-500 hover:text-white transition-all"><SkipForward size={24}/></button>
                                  </div>

                                  {/* Barra di Progresso */}
                                  <div className="space-y-2 mb-8">
                                    <input 
                                      type="range" 
                                      min="0" 
                                      max={musicDuration || 100} 
                                      value={musicProgress}
                                      onChange={handleMusicProgress}
                                      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-pink-500 transition-all"
                                    />
                                    <div className="flex justify-between text-[8px] font-black uppercase text-gray-500">
                                      <span>{formatTime(musicProgress)}</span>
                                      <span>{formatTime(musicDuration)}</span>
                                    </div>
                                  </div>

                                  {currentTrack?.type === 'deezer' && (
                                    <div className="mb-8 text-center">
                                      <p className="text-[8px] font-bold text-gray-500 uppercase mb-3">Stai ascoltando un&apos;anteprima</p>
                                      <a 
                                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(currentTrack.artist + " " + currentTrack.title)}`}
                                        target="_blank"
                                        className="inline-flex items-center gap-2 bg-red-600/10 text-red-500 px-4 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all"
                                      >
                                        Ascolta versione integrale
                                      </a>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-4 text-gray-500">
                                    <Volume2 size={16} />
                                    <input 
                                      type="range" 
                                      min="0" 
                                      max="1" 
                                      step="0.01"
                                      value={musicVolume}
                                      onChange={handleVolumeChange}
                                      className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-gray-400"
                                    />
                                  </div>
                                </>
                              )}
                            </>
                          ) : (
                            <div className="py-20 text-center flex flex-col items-center gap-6">
                              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-gray-600">
                                <Music size={40} />
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Player Inattivo</p>
                                <p className="text-[8px] font-bold text-gray-700 uppercase mt-2">Seleziona un brano dal Cloud o Deezer</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sezione Speciale Lavoro */}
              {activeFolder === "Lavoro" && !activeSubFolder && (
                <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {haPIva ? (
                    <>
                      <SubFolderCard title="Fatture" onClick={() => {setActiveSubFolder("Fatture"); refreshFiles();}} />
                      <SubFolderCard title="Preventivi" onClick={() => {setActiveSubFolder("Preventivi"); refreshFiles();}} />
                      <SubFolderCard title="Documenti Aziendali" onClick={() => {setActiveSubFolder("Documenti Aziendali"); refreshFiles();}} />
                    </>
                  ) : (
                    <>
                      <SubFolderCard title="Busta Paga" onClick={() => {setActiveSubFolder("Busta Paga"); refreshFiles();}} />
                      <SubFolderCard title="Documenti Lavoro" onClick={() => {setActiveSubFolder("Documenti Lavoro"); refreshFiles();}} />
                      {/* Limite 3 cartelle per Free Plan */}
                      {profile.piano !== "Free Plan" && <SubFolderCard title="Archivio Storico" onClick={() => {setActiveSubFolder("Archivio Storico"); refreshFiles();}} />}
                    </>
                  )}
                </div>
              )}

              {/* Sezione Speciale Finance */}
              {activeFolder === "Finance" && (
                <div className="lg:col-span-12 space-y-8">
                  {/* Confetti / Congratulazioni */}
                  <AnimatePresence>
                    {showConfetti && (
                      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
                        <div className="bg-white p-20 rounded-[4rem] shadow-2xl border-4 border-emerald-500 text-center">
                          <Sparkles size={80} className="text-emerald-500 mx-auto mb-6 animate-bounce" />
                          <h2 className="text-5xl font-black italic uppercase text-slate-900">CONGRATULAZIONI!</h2>
                          <p className="text-xl font-bold text-slate-500 mt-4 uppercase tracking-widest">Obiettivo &quot;{obiettivo.nome}&quot; Completato!</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid md:grid-cols-3 gap-8">
                    {/* Gestione Stipendio e Saldo */}
                    <div className="md:col-span-1 space-y-6">
                      <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100">
                        <h4 className="text-[10px] font-black uppercase text-emerald-600 mb-6 tracking-widest flex items-center gap-2"><Wallet size={14}/> Gestione Stipendio</h4>
                        <label className="text-[8px] font-black text-emerald-400 uppercase block mb-2 px-1">Stipendio Mensile (€)</label>
                        <input 
                          type="number" 
                          value={stipendio} 
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setStipendio(val);
                            saveFinance({ stipendio: val, spese, obiettivo });
                          }} 
                          className="w-full p-4 rounded-xl font-black text-2xl shadow-sm outline-none bg-white focus:ring-2 ring-emerald-500/20" 
                        />
                        <div className="mt-8 pt-8 border-t border-emerald-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Disponibilità Residua</p>
                          <p className={`font-black text-4xl italic leading-none ${stipendio - spese.reduce((acc, s) => acc + s.importo, 0) < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                            {(stipendio - spese.reduce((acc, s) => acc + s.importo, 0)).toFixed(2)}€
                          </p>
                        </div>
                      </div>

                      <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100">
                        <h4 className="text-[10px] font-black uppercase text-blue-600 mb-6 tracking-widest flex items-center gap-2"><Sparkles size={14}/> Obiettivo Risparmio</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="text-[8px] font-black text-blue-400 uppercase block mb-1 px-1">Cosa vuoi acquistare?</label>
                            <input type="text" value={obiettivo.nome} onChange={(e) => setObiettivo({...obiettivo, nome: e.target.value})} placeholder="Es: Auto Nuova" className="w-full p-3 rounded-lg font-bold text-xs shadow-sm outline-none bg-white" />
                          </div>
                          <div>
                            <label className="text-[8px] font-black text-blue-400 uppercase block mb-1 px-1">Target (€)</label>
                            <input type="number" value={obiettivo.target} onChange={(e) => setObiettivo({...obiettivo, target: Number(e.target.value)})} className="w-full p-3 rounded-lg font-bold text-xs shadow-sm outline-none bg-white" />
                          </div>
                          <div>
                            <label className="text-[8px] font-black text-blue-400 uppercase block mb-1 px-1">Risparmiati (€)</label>
                            <input type="number" value={obiettivo.risparmi} onChange={(e) => handleUpdateObiettivo(e.target.value)} className="w-full p-3 rounded-lg font-bold text-xs shadow-sm outline-none bg-white" />
                          </div>
                          {obiettivo.target > 0 && (
                            <div className="mt-4">
                              <div className="flex justify-between text-[8px] font-black uppercase mb-1">
                                <span>Progresso</span>
                                <span>{Math.min(100, Math.round((obiettivo.risparmi / obiettivo.target) * 100))}%</span>
                              </div>
                              <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (obiettivo.risparmi / obiettivo.target) * 100)}%` }} className="h-full bg-blue-600" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lista Spese */}
                    <div className="md:col-span-2 space-y-6">
                      <div className="p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-full">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-widest flex items-center gap-2"><Trash2 size={14}/> Registro Spese</h4>
                        
                        <div className="flex gap-3 mb-8">
                          <input type="text" value={nuovaSpesa.nome} onChange={(e) => setNuovaSpesa({...nuovaSpesa, nome: e.target.value})} placeholder="Nome spesa..." className="flex-grow p-4 rounded-xl font-bold text-xs bg-slate-50 border border-slate-100 outline-none focus:ring-2 ring-blue-500/20" />
                          <input type="number" value={nuovaSpesa.importo} onChange={(e) => setNuovaSpesa({...nuovaSpesa, importo: Number(e.target.value)})} placeholder="Importo..." className="w-32 p-4 rounded-xl font-bold text-xs bg-slate-50 border border-slate-100 outline-none focus:ring-2 ring-blue-500/20" />
                          <button onClick={handleAddSpesa} className="bg-slate-900 text-white px-6 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 transition-all">Aggiungi</button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar max-h-[400px]">
                          {spese.length > 0 ? spese.map(s => (
                            <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                              <div>
                                <p className="text-[10px] font-black uppercase text-slate-800">{s.nome}</p>
                                <p className="text-[8px] font-bold text-slate-400">Inserita il {new Date(s.id).toLocaleDateString()}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="font-black text-sm text-red-500">-{s.importo.toFixed(2)}€</span>
                                <button onClick={() => handleDeleteSpesa(s.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                              </div>
                            </motion.div>
                          )) : (
                            <div className="flex flex-col items-center justify-center h-full py-20 opacity-20 grayscale">
                              <Wallet size={40} className="mb-4" />
                              <p className="text-[10px] font-black uppercase">Nessuna spesa registrata</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sezione Speciale Training */}
              {activeFolder === "Palestra" && (
                <div className="lg:col-span-5 space-y-6">
                   {/* Calcolatore */}
                   <div className="p-8 bg-orange-50 rounded-[2.5rem] border border-orange-100 shadow-inner">
                      <h4 className="text-[10px] font-black uppercase text-orange-600 mb-6 flex items-center gap-2 tracking-[0.2em]"><Calculator size={14}/> Training Calculator</h4>
                      <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                           <label className="text-[8px] font-black text-orange-300 uppercase block mb-2 px-1">Massimale</label>
                           <input type="number" value={massimale} onChange={(e)=>setMassimale(Number(e.target.value))} className="w-full p-4 rounded-xl font-black text-xl shadow-sm outline-none bg-white focus:ring-2 ring-orange-500/20" />
                        </div>
                        <div className="flex-1">
                           <label className="text-[8px] font-black text-orange-300 uppercase block mb-2 px-1">Perc %</label>
                           <input type="number" value={percentuale} onChange={(e)=>setPercentuale(Number(e.target.value))} className="w-full p-4 rounded-xl font-black text-xl shadow-sm outline-none bg-white text-blue-600 focus:ring-2 ring-blue-500/20" />
                        </div>
                      </div>
                      <div className="text-center bg-white p-6 rounded-2xl border border-orange-200 shadow-sm">
                         <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Target Load</p>
                         <p className="font-black text-5xl text-orange-600 italic leading-none">{(massimale * (percentuale/100)).toFixed(1)}<span className="text-xl ml-1 uppercase not-italic">kg</span></p>
                      </div>
                   </div>

                   {/* Editor Scheda Digitale */}
                   <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 shadow-inner flex flex-col h-[480px]">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-2 tracking-[0.2em]"><Edit3 size={14}/> Scheda Operativa</h4>
                        {isSavingWorkout && <Loader2 size={14} className="animate-spin text-blue-600" />}
                      </div>
                      
                      <div className="flex-1 bg-white rounded-2xl border border-blue-100 overflow-hidden flex flex-col shadow-sm">
                        <div className="flex border-b border-blue-50">
                           <button onClick={()=>setEditMode(true)} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-colors ${editMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>Edit</button>
                           <button onClick={()=>setEditMode(false)} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-colors ${!editMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>Live View</button>
                        </div>
                        
                        {editMode ? (
                          <textarea 
                            value={workoutRoutine} 
                            onChange={(e) => setWorkoutRoutine(e.target.value)}
                            placeholder="Inserisci esercizi (es: 4x10 Panca Piana)..."
                            className="flex-1 w-full p-6 outline-none font-bold text-xs text-slate-700 placeholder:text-slate-200 resize-none bg-transparent"
                          />
                        ) : (
                          <div className="flex-1 p-6 overflow-y-auto space-y-3 bg-slate-50/50">
                            {workoutRoutine ? workoutRoutine.split('\n').map((line, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-100/50 shadow-sm animate-in slide-in-from-left-2 fade-in duration-300">
                                <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                                <span className="text-[11px] font-bold text-slate-700">{line}</span>
                              </div>
                            )) : (
                              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale">
                                <Bot size={40} className="mb-4" />
                                <p className="text-[10px] font-black uppercase">Nessun protocollo caricato</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={() => {
                          saveWorkout(workoutRoutine);
                          setEditMode(false);
                        }}
                        className="mt-4 w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[10px] uppercase italic tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                      >
                        Sincronizza Scheda
                      </button>
                   </div>
                </div>
              )}

              {/* Lista Documenti (Attiva per tutte le cartelle) */}
              <div className={`${activeFolder === "Palestra" ? "lg:col-span-7" : (activeFolder === "Lavoro" && !activeSubFolder ? "hidden" : "lg:col-span-12")}`}>
                
                {/* Switcher Cloud Esterni */}
                <div className="flex gap-4 mb-8">
                  <button 
                    onClick={connectGoogleDrive}
                    className={`flex-1 p-4 rounded-2xl border flex items-center justify-center gap-3 transition-all ${isGoogleDriveConnected ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                  >
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                       <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="w-5 h-5" alt="Drive" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{isGoogleDriveConnected ? 'Drive Connected' : 'Google Drive'}</span>
                  </button>
                  <button 
                    onClick={connectDropbox}
                    className={`flex-1 p-4 rounded-2xl border flex items-center justify-center gap-3 transition-all ${isDropboxConnected ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                  >
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                       <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg" className="w-5 h-5" alt="Dropbox" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{isDropboxConnected ? 'Dropbox Connected' : 'Dropbox Cloud'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {activeFolder !== "Finance" && (
                    <label className="aspect-square bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group overflow-hidden">
                      {isUploading ? <Loader2 className="animate-spin text-blue-600" /> : <Upload className="text-slate-300 group-hover:text-blue-600 group-hover:-translate-y-1 transition-transform mb-2" />}
                      <span className="text-[10px] font-black uppercase text-slate-400">Upload File</span>
                      <input type="file" onChange={handleUpload} className="hidden" />
                    </label>
                  )}
                  
                  {userFiles.map((f, i) => (
                    <motion.div key={i} layout className="aspect-square bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center group relative overflow-hidden transition-all hover:shadow-xl">
                      <FileText size={40} className="text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-[10px] font-black uppercase truncate w-full px-6 text-center text-slate-600">{f.name.split('_').pop()}</p>
                      
                      <div className="absolute inset-0 bg-slate-900/95 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 p-6">
                        <button onClick={()=>setViewFileUrl(f.url)} className="w-full bg-white text-black py-3 rounded-xl font-black text-[10px] uppercase hover:bg-blue-500 hover:text-white transition-colors">Visualizza</button>
                        <button onClick={()=>downloadFile(f)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-[10px] uppercase hover:bg-blue-700 transition-colors">Scarica</button>
                        <button onClick={()=>deleteFile(f)} className="w-full bg-red-600 text-white py-3 rounded-xl font-black text-[10px] uppercase hover:bg-red-700 transition-colors">Elimina</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Anteprima Documenti Real-Time */}
            <AnimatePresence>
              {viewFileUrl && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-12 rounded-[2.5rem] bg-slate-950 p-4 border border-white/10 overflow-hidden shadow-2xl">
                  <div className="flex justify-between items-center mb-4 px-4">
                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Digital Previewer Active</span>
                    <button onClick={() => setViewFileUrl(null)} className="text-white/40 hover:text-white"><X size={20}/></button>
                  </div>
                  <iframe src={viewFileUrl} className="w-full h-[600px] rounded-2xl bg-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* --- NEXUS INTELLIGENCE CENTER (CHAT + AZIONI) --- */}
        <div className="mt-12 grid lg:grid-cols-3 gap-10">
          <section className="lg:col-span-2 bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
            
            <div className="relative z-10 flex flex-col h-full">
              <header className="flex items-center gap-4 mb-10">
                <div className="p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/30"><Bot size={28} /></div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Nexus <span className="text-blue-500">I.U.</span></h3>
                  <p className="text-[9px] font-black uppercase opacity-40 tracking-widest mt-1">Intelligence Unit Connected</p>
                </div>
              </header>
              
              <div ref={scrollRef} className="h-80 overflow-y-auto mb-8 space-y-6 pr-4 custom-scrollbar flex flex-col">
                {chatIA.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                    <div className={`p-5 rounded-[1.8rem] max-w-[85%] text-[12px] font-bold leading-relaxed shadow-sm ${m.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-white/5 text-blue-50 border border-white/10 rounded-bl-none"}`}>
                      {m.text}
                    </div>
                    {m.files && (
                      <div className="grid grid-cols-2 gap-3 mt-4 w-full max-w-[85%]">
                        {m.files.map((file, fIdx) => {
                          const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                          const isVideo = file.name.match(/\.(mp4|webm|ogg)$/i);
                          return (
                            <div key={fIdx} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-3 group relative overflow-hidden">
                              {isImage ? (
                                <img src={file.url} alt={file.name} className="w-full aspect-video object-cover rounded-xl" />
                              ) : isVideo ? (
                                <video src={file.url} controls className="w-full aspect-video rounded-xl" />
                              ) : (
                                <div className="w-full aspect-video bg-white/10 rounded-xl flex items-center justify-center">
                                  <FileText size={32} className="text-blue-400" />
                                </div>
                              )}
                              <p className="text-[9px] font-black uppercase truncate text-blue-200/60 px-1">{file.name.split('_').pop()}</p>
                              <div className="absolute inset-0 bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 p-4">
                                <button onClick={()=>setViewFileUrl(file.url)} className="w-full bg-blue-600 text-white py-2 rounded-lg font-black text-[8px] uppercase">Visualizza</button>
                                <button onClick={()=>downloadFile(file)} className="w-full bg-white text-slate-900 py-2 rounded-lg font-black text-[8px] uppercase">Scarica</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Nexus sta elaborando i dati di {activeFolder || "sistema"}...</motion.div>}
              </div>

              {/* Suggerimenti Comandi IA */}
              <div className="flex flex-wrap gap-2 mb-6">
                <p className="text-[8px] font-black uppercase text-white/30 w-full mb-1 tracking-[0.2em]">Comandi Suggeriti</p>
                {[
                  "Analizza i miei file",
                  "Calcola il mio massimale",
                  "Report finanziario",
                  "Chi sei?",
                  "Aiuto"
                ].map((cmd) => (
                  <button 
                    key={cmd}
                    onClick={() => askNexus(cmd)}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-tighter hover:bg-blue-600 hover:border-blue-500 transition-all"
                  >
                    {cmd}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 bg-white/5 p-3 rounded-[2rem] border border-white/10 backdrop-blur-sm focus-within:border-blue-500 transition-colors">
                <input value={inputIA} onChange={(e)=>setInputIA(e.target.value)} onKeyDown={(e)=>e.key==="Enter" && askNexus()} placeholder="Esegui comando o chiedi analisi file..." className="flex-1 bg-transparent border-none outline-none px-6 text-sm font-bold placeholder:text-white/10" />
                <button onClick={askNexus} className="p-5 bg-blue-600 rounded-[1.4rem] hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/40 active:scale-95"><Send size={20}/></button>
              </div>
            </div>
          </section>

          <aside className="space-y-8">
             <div className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm">
                <h4 className="text-[11px] font-black uppercase text-slate-400 mb-8 tracking-[0.2em] flex items-center gap-3"><Sparkles size={16} className="text-blue-600"/> Nexus Matrix</h4>
                <div className="space-y-4">
                  <QuickButton 
                    label="Analisi Predittiva Finanza" 
                    onClick={() => {
                      setActiveFolder("Finance");
                      askNexus("Esegui analisi predittiva sui documenti in Finance");
                    }}
                  />
                  <QuickButton 
                    label="Consolida Documenti Business" 
                    onClick={() => {
                      setActiveFolder("Business");
                      askNexus("Consolida tutti i documenti della cartella Business");
                    }}
                  />
                  <QuickButton 
                    label="Report Bio-Metrico Training" 
                    onClick={() => {
                      setActiveFolder("Palestra");
                      askNexus("Genera report bio-metrico basato sui miei carichi");
                    }}
                  />
                </div>
                
                <div className="mt-10 pt-8 border-t border-slate-50">
                   <div className="flex justify-between items-center mb-4">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Occupazione Disco</p>
                      <span className={`text-[10px] font-black ${storageUsage / storageLimit > 0.9 ? 'text-red-600' : 'text-blue-600'}`}>
                        {Math.round((storageUsage / storageLimit) * 100)}%
                      </span>
                   </div>
                   <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${Math.min(100, (storageUsage / storageLimit) * 100)}%` }} 
                        transition={{ duration: 1.5 }} 
                        className={`h-full rounded-full ${storageUsage / storageLimit > 0.9 ? 'bg-red-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`} 
                      />
                   </div>
                   <p className="text-[8px] font-black text-slate-400 mt-3 text-center uppercase tracking-widest">
                     Nexus Cloud Capacity: {(storageLimit / (1024 * 1024 * 1024)).toFixed(1)}GB
                   </p>
                </div>
             </div>
          </aside>
        </div>

        {/* --- MODALE PIANI --- */}
        <AnimatePresence>
          {showPianiModal && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-4xl rounded-[3.5rem] p-12 relative shadow-2xl border border-white/20">
                <button onClick={() => {setShowPianiModal(false); router.push("/dashboard");}} className="absolute top-10 right-10 text-slate-300 hover:text-black transition-all hover:rotate-90"><X size={28}/></button>
                <div className="text-center mb-10">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">Nexus <span className="text-blue-600">Upgrade</span></h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Potenzia il tuo protocollo operativo</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Plan Free */}
                  <div className={`p-8 rounded-[2.5rem] border ${profile.piano === "Free Plan" ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/20' : 'bg-slate-50 border-slate-200'}`}>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Basic</p>
                    <p className="text-2xl font-black italic uppercase mb-1">Free Plan</p>
                    <p className="text-[10px] font-bold text-blue-600 mb-6">0€ / SEMPRE</p>
                    <ul className="space-y-3 mb-8">
                      <li className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500"/> 500MB Storage</li>
                      <li className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500"/> Gestione Archivi</li>
                      <li className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-2 line-through"><X size={12} className="text-red-400"/> Modulo Finance</li>
                      <li className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-2 line-through"><X size={12} className="text-red-400"/> Nexus AI v3.0</li>
                    </ul>
                    {profile.piano === "Free Plan" && <span className="block text-center text-[9px] font-black text-blue-600 uppercase">Piano Attivo</span>}
                  </div>

                  {/* Plan Pro */}
                  <div className={`p-8 rounded-[2.5rem] border ${profile.piano === "Pro Plan" ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/20' : 'bg-white border-slate-200 shadow-xl'}`}>
                    <p className="text-[10px] font-black uppercase text-blue-600 mb-2">Recommended</p>
                    <p className="text-2xl font-black italic uppercase mb-1">Pro Plan</p>
                    <p className="text-[10px] font-bold text-blue-600 mb-6">3€ / MESE</p>
                    <ul className="space-y-3 mb-8">
                      <li className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500"/> 2GB Storage</li>
                      <li className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500"/> Gestione Avanzata File</li>
                      <li className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500"/> Modulo Finance</li>
                      <li className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-2 line-through"><X size={12} className="text-red-400"/> Nexus AI v3.0</li>
                    </ul>
                    {profile.piano === "Free Plan" && (
                      <button 
                        onClick={handleStartProTrial}
                        className="w-full mb-3 bg-emerald-500 text-white py-3 rounded-xl font-black text-[10px] uppercase italic hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-600/20"
                      >
                        Attiva Prova Gratuita (7gg)
                      </button>
                    )}
                    <button 
                      onClick={() => handleActivatePlan("Pro Plan")}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-[10px] uppercase italic hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                    >
                      Seleziona Pro
                    </button>
                  </div>

                  {/* Plan Premium */}
                  <div className={`p-8 rounded-[2.5rem] border ${profile.piano === "Premium Plan" ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/20' : 'bg-slate-900 border-white/10 text-white shadow-2xl'}`}>
                    <p className="text-[10px] font-black uppercase text-blue-400 mb-2">Ultimate</p>
                    <p className="text-2xl font-black italic uppercase mb-1">Premium Plan</p>
                    <p className="text-[10px] font-bold text-blue-400 mb-6">5€ / MESE</p>
                    <ul className="space-y-3 mb-8">
                      <li className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500"/> 4GB Storage</li>
                      <li className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500"/> Nexus AI v3.0 Full</li>
                      <li className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500"/> Modulo Finance</li>
                      <li className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500"/> Supporto Prioritario</li>
                    </ul>
                    <button 
                      onClick={() => handleActivatePlan("Premium Plan")}
                      className="w-full bg-white text-slate-900 py-3 rounded-xl font-black text-[10px] uppercase italic hover:bg-blue-500 hover:text-white transition-all"
                    >
                      Seleziona Premium
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- MODALE IDENTITÀ (DATI UTENTE) --- */}
        <AnimatePresence>
          {showUserModal && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-sm rounded-[3rem] p-8 relative shadow-2xl border border-white/20 max-h-[85vh] overflow-y-auto custom-scrollbar">
                <button onClick={closeModals} className="absolute top-6 right-6 text-slate-300 hover:text-black transition-all hover:rotate-90"><X size={24}/></button>
                <div className="text-center mb-6">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-[1.8rem] object-cover shadow-xl ring-4 ring-blue-50/50" />
                    ) : (
                      <div className="w-20 h-20 bg-slate-900 rounded-[1.8rem] flex items-center justify-center text-white text-3xl font-black uppercase shadow-xl ring-4 ring-blue-50/50">{profile.full_name[0]}</div>
                    )}
                    <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
                      <Upload size={14} />
                      <input type="file" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Profilo Certificato</h3>
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">Nexus Cloud Operator</p>
                </div>
                <div className="space-y-3">
                  <DataRow label="Nome Completo" value={profile.full_name} />
                  <DataRow label="Nexus Email" value={profile.email} />
                  {profile.birth_date && <DataRow label="Data di Nascita" value={new Date(profile.birth_date).toLocaleDateString('it-IT')} />}
                  {haPIva && <DataRow label="Partita IVA" value={pIva} />}
                  
                  {/* --- SEZIONE SICUREZZA & 2FA REAL --- */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest flex items-center gap-2">
                      <ShieldCheck size={12} className="text-emerald-500" /> Sicurezza Account
                    </h4>
                    
                    <div className="space-y-2">
                      <div className={`p-3.5 rounded-xl border flex justify-between items-center transition-all ${isMfaActive ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                        <div>
                          <p className={`text-[9px] font-black uppercase ${isMfaActive ? 'text-emerald-600' : 'text-slate-800'}`}>Autenticazione 2FA</p>
                          <p className="text-[7px] font-bold text-slate-400 uppercase">{isMfaActive ? 'Protetto' : 'Non attiva'}</p>
                        </div>
                        <button 
                          onClick={isMfaActive ? unenrollMfa : startMfaEnroll}
                          className={`text-[7px] font-black uppercase px-2.5 py-1 rounded-md transition-all ${isMfaActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                          {isMfaActive ? 'OFF' : 'ON'}
                        </button>
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-800">Criptazione Cloud</p>
                          <p className="text-[7px] font-bold text-slate-400 uppercase">AES-256 Bit Active</p>
                        </div>
                        <Lock size={12} className="text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-blue-600 rounded-[1.8rem] text-white shadow-lg shadow-blue-600/20 mt-4">
                    <p className="text-[8px] font-black uppercase opacity-60 mb-0.5 tracking-widest">Autorizzazione</p>
                    <p className="font-black italic uppercase text-base">{profile.piano}</p>
                  </div>

                  {/* Personalizzazione UI */}
                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                    <h4 className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-widest flex items-center gap-2">
                      <Sparkles size={12} className="text-blue-600" /> Aspetto Terminale
                    </h4>
                    
                    <button 
                      onClick={toggleTheme}
                      className={`w-full p-4 rounded-xl border flex justify-between items-center transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">Tema {theme === 'light' ? 'Chiaro' : 'Scuro'}</span>
                      {theme === 'light' ? <Monitor size={16} /> : <Bot size={16} />}
                    </button>

                    <div className="space-y-2">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Sfondi Operativi</p>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          null,
                          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
                          "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop",
                          "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop"
                        ].map((url, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setCustomBg(url)}
                            className={`aspect-square rounded-lg border-2 transition-all overflow-hidden ${userBg === url ? 'border-blue-600 scale-95' : 'border-transparent hover:border-slate-300'}`}
                          >
                            {url ? <img src={url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">RESET</div>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {profile.piano !== "Free Plan" && (
                    <button 
                      onClick={handleCancelSubscription}
                      className="w-full mt-4 py-3 rounded-[1.5rem] border border-red-100 text-red-600 font-black text-[9px] uppercase italic tracking-widest hover:bg-red-50 transition-all"
                    >
                      Annulla Abbonamento
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- MODALE ATTIVAZIONE 2FA (QR CODE) --- */}
        <AnimatePresence>
          {showMfaEnroll && mfaEnrollData && (
            <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-sm rounded-[3rem] p-8 relative shadow-3xl text-center max-h-[85vh] overflow-y-auto custom-scrollbar">
                <button onClick={() => {setShowMfaEnroll(false); setMfaEnrollData(null);}} className="absolute top-6 right-6 text-slate-300 hover:text-black transition-all"><X size={24}/></button>
                
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-600/20"><ShieldCheck size={32}/></div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2 text-slate-900">Configura <span className="text-blue-600">2FA</span></h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-6 leading-relaxed">Scansiona il codice QR con la tua App di Autenticazione</p>
                
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-6">
                  <div className="bg-white p-3 rounded-2xl shadow-inner mb-4 flex justify-center border border-slate-200 overflow-hidden">
                    <img src={mfaEnrollData.qr} alt="MFA QR Code" className="w-40 h-48" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Codice Manuale:</p>
                    <code className="block bg-white p-3 rounded-lg font-black text-blue-600 tracking-widest text-sm border border-slate-200 select-all">{mfaEnrollData.secret}</code>
                  </div>
                </div>

                <div className="space-y-3">
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="CODICE 6 CIFRE" 
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-black text-center text-xl tracking-[0.4em] focus:ring-2 ring-blue-500/10 transition-all placeholder:text-[9px] placeholder:tracking-widest"
                  />
                  <button 
                    onClick={verifyMfaEnroll}
                    className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-[10px] uppercase italic tracking-[0.1em] hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                  >
                    Verifica & Attiva
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- MODALE PAGAMENTO (CARTA DI CREDITO) --- */}
        <AnimatePresence>
          {showPaymentModal && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[150] flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-sm rounded-[3rem] p-8 relative shadow-2xl border border-white/20">
                <button onClick={() => setShowPaymentModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-black transition-all"><X size={24}/></button>
                
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-blue-600/20"><Wallet size={24}/></div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Pagamento {selectedPlanToBuy}</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Transazione Nexus Secure</p>
                </div>

                <div className="space-y-4">
                  <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <label className="text-[7px] font-black text-slate-400 uppercase block mb-1.5 px-1">Numero Carta</label>
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000" 
                      className="w-full p-3.5 rounded-xl font-black text-xs bg-white border border-slate-200 outline-none mb-3 focus:ring-2 ring-blue-500/20"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[7px] font-black text-slate-400 uppercase block mb-1.5 px-1">Scadenza</label>
                        <input 
                          type="text" 
                          placeholder="MM/AA" 
                          className="w-full p-3.5 rounded-xl font-black text-xs bg-white border border-slate-200 outline-none focus:ring-2 ring-blue-500/20"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[7px] font-black text-slate-400 uppercase block mb-1.5 px-1">CVC/CVV</label>
                        <input 
                          type="text" 
                          placeholder="000" 
                          className="w-full p-3.5 rounded-xl font-black text-xs bg-white border border-slate-200 outline-none focus:ring-2 ring-blue-500/20"
                          value={cardDetails.cvc}
                          onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={confirmPayment}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase italic tracking-[0.1em] hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                  >
                    Conferma & Attiva
                  </button>
                  <p className="text-[7px] font-bold text-slate-400 text-center uppercase px-4">Premendo accetti i termini Nexus Cloud.</p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- MODALE PIVA --- */}
        <AnimatePresence>
          {showPIvaModal && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-[3.5rem] p-12 relative shadow-2xl">
                <button onClick={() => setShowPIvaModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-black transition-all"><X size={24}/></button>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-center mb-8">Configurazione Lavoro</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-10">Seleziona il tuo profilo professionale</p>
                <div className="space-y-4">
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-blue-600 mb-4">Hai una Partita IVA?</p>
                    <input 
                      type="text" 
                      value={pIva} 
                      onChange={(e) => setPIva(e.target.value)} 
                      placeholder="Inserisci P.IVA..." 
                      className="w-full p-4 rounded-xl font-bold text-xs bg-white border border-slate-200 outline-none mb-4"
                    />
                    <button onClick={handlePIvaSubmit} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-[10px] uppercase">Conferma P.IVA</button>
                  </div>
                  <button onClick={handleNoPIva} className="w-full p-6 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase italic tracking-widest">Non ho Partita IVA (Dipendente)</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- MODALE ASSISTENZA --- */}
        <AnimatePresence>
          {showAssistenzaModal && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 relative shadow-2xl border border-white/20">
                <button onClick={() => {setShowAssistenzaModal(false); router.push("/dashboard");}} className="absolute top-10 right-10 text-slate-300 hover:text-black transition-all hover:rotate-90"><X size={28}/></button>
                <div className="text-center mb-10">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">Nexus <span className="text-blue-600">Support</span></h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Siamo qui per aiutarti</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl"><Mail size={28}/></div>
                    <h4 className="text-lg font-black italic uppercase mb-2">Email Direct</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-6 leading-relaxed">Scrivici per problemi tecnici o commerciali. Risposta entro 24h.</p>
                    <a href="mailto:support@nexus.cloud" className="text-blue-600 font-black text-xs uppercase tracking-widest">support@nexus.cloud</a>
                  </div>
                  <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white border border-white/10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white text-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-xl"><LifeBuoy size={28}/></div>
                    <h4 className="text-lg font-black italic uppercase mb-2">Nexus AI v3.0</h4>
                    <p className="text-[10px] font-bold text-white/40 uppercase mb-6 leading-relaxed">L&apos;assistenza intelligente è attiva 24/7 nella tua dashboard.</p>
                    <button onClick={() => {setShowAssistenzaModal(false); askNexus("Ho bisogno di assistenza tecnica.");}} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase">Parla con Nexus</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- MODALE NOTE APP (APPLE STYLE) --- */}
        <AnimatePresence>
          {showNotesModal && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-5xl h-[80vh] rounded-[3.5rem] overflow-hidden flex shadow-2xl border border-white/20">
                {/* Sidebar Note */}
                <div className="w-80 bg-slate-50 border-r border-slate-100 flex flex-col">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Nexus <span className="text-blue-600">Notes</span></h3>
                    <button onClick={handleAddNote} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"><Edit3 size={16}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {notes.map(n => (
                      <button 
                        key={n.id} 
                        onClick={() => setActiveNote(n)}
                        className={`w-full text-left p-4 rounded-2xl transition-all group ${activeNote?.id === n.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white'}`}
                      >
                        <p className={`text-[11px] font-black uppercase truncate ${activeNote?.id === n.id ? 'text-white' : 'text-slate-800'}`}>{n.title}</p>
                        <div className="flex justify-between items-center mt-1">
                          <p className={`text-[9px] font-bold ${activeNote?.id === n.id ? 'text-blue-100' : 'text-slate-400'}`}>{n.date}</p>
                          <Trash2 
                            size={10} 
                            className={`transition-all ${activeNote?.id === n.id ? 'text-white/40 hover:text-white opacity-100' : 'text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100'}`} 
                            onClick={(e) => {e.stopPropagation(); handleDeleteNote(n.id);}} 
                          />
                        </div>
                      </button>
                    ))}
                    {notes.length === 0 && (
                      <div className="text-center py-20 opacity-20">
                        <FileText size={40} className="mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase">Nessuna nota</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Editor Nota */}
                <div className="flex-1 bg-white flex flex-col relative">
                  <button onClick={() => setShowNotesModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-black transition-all z-10"><X size={24}/></button>
                  
                  {activeNote ? (
                    <div className="flex-1 flex flex-col p-12">
                      <input 
                        type="text" 
                        value={activeNote.title}
                        onChange={(e) => handleUpdateNote(activeNote.id, 'title', e.target.value)}
                        className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 border-none outline-none mb-8 placeholder:text-slate-100"
                        placeholder="Titolo Nota..."
                      />
                      <textarea 
                        value={activeNote.content}
                        onChange={(e) => handleUpdateNote(activeNote.id, 'content', e.target.value)}
                        className="flex-1 text-sm font-bold text-slate-600 leading-relaxed border-none outline-none resize-none placeholder:text-slate-100"
                        placeholder="Inizia a scrivere il tuo pensiero..."
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-10">
                      <Bot size={100} />
                      <p className="text-2xl font-black uppercase mt-6 tracking-widest">Seleziona o crea una nota</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* --- MODALE CALENDARIO APP --- */}
        <AnimatePresence>
          {showCalendarModal && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-5xl h-[85vh] rounded-[3.5rem] overflow-hidden flex shadow-2xl border border-white/20">
                {/* Sidebar Appuntamenti del Giorno */}
                <div className="w-80 bg-slate-50 border-r border-slate-100 flex flex-col">
                  <div className="p-8 border-b border-slate-100">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Nexus <span className="text-blue-600">Events</span></h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{selectedDate}</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <h4 className="text-[10px] font-black uppercase text-blue-600 mb-4 tracking-widest">Nuovo Impegno</h4>
                      <input 
                        type="text" 
                        placeholder="Cosa devi fare?" 
                        value={newAppointment.title}
                        onChange={(e) => setNewAppointment({...newAppointment, title: e.target.value})}
                        className="w-full p-3 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-bold outline-none mb-3"
                      />
                      <input 
                        type="time" 
                        value={newAppointment.time}
                        onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                        className="w-full p-3 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-bold outline-none mb-3"
                      />
                      <button 
                        onClick={handleAddAppointment}
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 transition-all"
                      >
                        Aggiungi
                      </button>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In programma</p>
                      {appointments.filter(a => a.date === selectedDate).length > 0 ? (
                        appointments.filter(a => a.date === selectedDate).map(a => (
                          <div key={a.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm group">
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-[11px] font-black uppercase text-slate-800">{a.title}</p>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAppointment(a.id);
                                }} 
                                className="text-slate-300 hover:text-red-500 transition-all p-1"
                              >
                                <Trash2 size={14}/>
                              </button>
                            </div>
                            <p className="text-[10px] font-bold text-blue-600">{a.time}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-[9px] font-bold text-slate-300 uppercase text-center py-10 italic">Nessun impegno per questa data</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Grid Calendario Mensile */}
                <div className="flex-1 bg-white p-10 flex flex-col relative">
                  <button onClick={() => setShowCalendarModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-black transition-all z-10"><X size={24}/></button>
                  
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Calendario <span className="text-blue-600">Nexus</span></h2>
                  </div>

                  <div className="flex-1 grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-[2rem] overflow-hidden shadow-inner">
                    {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(d => (
                      <div key={d} className="bg-slate-50 p-4 text-center text-[10px] font-black uppercase text-slate-400">{d}</div>
                    ))}
                    {/* Generazione Giorni (Esempio semplificato per il mese corrente) */}
                    {Array.from({ length: 35 }).map((_, i) => {
                      const day = (i + 1) - 2; // Offset per allineamento (da affinare)
                      const isToday = day === new Date().getDate();
                      const dateStr = `2026-03-${day < 10 ? '0'+day : day}`;
                      const hasEvents = appointments.some(a => a.date === dateStr);
                      
                      if (day < 1 || day > 31) return <div key={i} className="bg-white/50" />;

                      return (
                        <button 
                          key={i} 
                          onClick={() => setSelectedDate(dateStr)}
                          className={`bg-white p-4 relative flex flex-col items-center justify-center gap-1 transition-all hover:bg-blue-50 ${selectedDate === dateStr ? 'ring-2 ring-blue-600 z-10' : ''}`}
                        >
                          <span className={`text-sm font-black ${isToday ? 'text-blue-600' : 'text-slate-800'}`}>{day}</span>
                          {hasEvents && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// COMPONENTI DI SUPPORTO (PULITI)
function SubFolderCard({ title, onClick }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.05 }} 
      whileTap={{ scale: 0.95 }}
      onClick={onClick} 
      className="p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] flex flex-col items-center gap-4 hover:bg-blue-600 hover:text-white transition-all group shadow-sm"
    >
      <Folder size={32} className="text-blue-600 group-hover:text-white transition-colors" />
      <span className="text-[10px] font-black uppercase tracking-widest">{title}</span>
    </motion.button>
  );
}

function MiniFolderBtn({ icon, active, onClick }) {
  return (
    <button 
      onClick={onClick} 
      className={`p-3 rounded-full transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-blue-600'}`}
    >
      {icon}
    </button>
  );
}

function QuickButton({ label, onClick }) {
  return (
    <button onClick={onClick} className="w-full text-left p-5 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-2xl transition-all font-black uppercase italic text-[10px] tracking-tight border border-slate-100 group shadow-sm">
      <span className="flex items-center justify-between">
        {label}
        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </span>
    </button>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
      <p className="text-[8px] font-black uppercase text-slate-400 mb-0.5 tracking-widest">{label}</p>
      <p className="text-xs font-bold text-slate-800 break-all">{value}</p>
    </div>
  );
}

function FolderCard({ icon, title, color, onClick }) {
  return (
    <motion.div whileHover={{ y: -10, scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onClick} className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-50 flex flex-col items-center cursor-pointer group transition-all">
      <div className={`w-20 h-20 ${color} text-white rounded-[1.8rem] flex items-center justify-center mb-8 shadow-2xl transition group-hover:rotate-6 group-hover:shadow-3xl`}>{icon}</div>
      <h3 className="font-black uppercase italic text-xs tracking-[0.1em] text-slate-800">{title}</h3>
    </motion.div>
  );
}

function LoaderPage() {
  return <div className="h-screen flex items-center justify-center bg-[#F1F5F9]">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <Loader2 className="animate-spin text-blue-600" size={60} />
        <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" size={24} />
      </div>
      <p className="font-black uppercase text-[11px] tracking-[0.5em] text-slate-400 animate-pulse">Sincronizzazione Unità Nexus...</p>
    </div>
  </div>;
}
