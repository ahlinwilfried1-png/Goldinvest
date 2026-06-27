import React, { useState } from 'react';
import { DataStore } from '../dataStore';
import { 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Headphones, 
  Smartphone, 
  Activity, 
  Award, 
  Calculator, 
  ChevronRight, 
  CheckCircle,
  Clock,
  PiggyBank,
  X,
  Download,
  Share,
  Check,
  Speaker,
  Volume2,
  Tv,
  Cpu,
  Music,
  Zap,
  BarChart3,
  Sliders,
  Play,
  Sparkles,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const liveTransactions = [
  { name: "Abdoulaye K.", type: "recharge", amount: "15 000 F CFA", flag: "🇨🇮", desc: "a rechargé" },
  { name: "Mariam O.", type: "retrait", amount: "45 000 F CFA", flag: "🇧🇫", desc: "a retiré" },
  { name: "Koffi A.", type: "recharge", amount: "100 000 F CFA", flag: "🇹🇬", desc: "a rechargé" },
  { name: "Chantal Z.", type: "retrait", amount: "12 000 F CFA", flag: "🇧🇯", desc: "a retiré" },
  { name: "Fatoumata B.", type: "recharge", amount: "5 000 F CFA", flag: "🇧🇫", desc: "a rechargé" },
  { name: "Alain T.", type: "retrait", amount: "25 000 F CFA", flag: "🇨🇮", desc: "a retiré" },
  { name: "Sena B.", type: "recharge", amount: "50 000 F CFA", flag: "🇹🇬", desc: "a rechargé" },
  { name: "Gaston S.", type: "retrait", amount: "8 000 F CFA", flag: "🇧🇯", desc: "a retiré" },
  { name: "Yasmine K.", type: "recharge", amount: "250 000 F CFA", flag: "🇨🇮", desc: "a rechargé" },
  { name: "Rodrigue M.", type: "retrait", amount: "35 000 F CFA", flag: "🇧🇯", desc: "a retiré" },
  { name: "Inès Y.", type: "recharge", amount: "80 000 F CFA", flag: "🇹🇬", desc: "a rechargé" },
  { name: "Félix S.", type: "retrait", amount: "15 000 F CFA", flag: "🇧🇫", desc: "a retiré" }
];

interface HomeProps {
  onNavigateToAuth: (isRegister: boolean) => void;
  isLoggedIn: boolean;
  onGoToDashboard: () => void;
}

export default function Home({ 
  onNavigateToAuth, 
  isLoggedIn, 
  onGoToDashboard 
}: HomeProps) {
  const currentUser = isLoggedIn ? DataStore.getCurrentUser() : null;

  // PWA & Iframe Installation logic
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [deviceOS, setDeviceOS] = useState<'ios' | 'android' | 'other'>('other');
  const [copiedLink, setCopiedLink] = useState(false);

  // Dashboard Simulator State
  const [selectedAmount, setSelectedAmount] = useState<number>(100000);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [accumulatedSimEarnings, setAccumulatedSimEarnings] = useState<number>(0);
  const [simRate, setSimRate] = useState<number>(7.5); // % daily yield
  const [activeGraphDay, setActiveGraphDay] = useState<number>(5); // currently selected day on the graph

  React.useEffect(() => {
    let interval: any = null;
    if (isSimulating) {
      setSimulationProgress(0);
      setAccumulatedSimEarnings(0);
      interval = setInterval(() => {
        setSimulationProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsSimulating(false);
            // set initial earnings (daily earnings as starting point)
            setAccumulatedSimEarnings(Math.round(selectedAmount * (simRate / 100)));
            return 100;
          }
          return prev + 4;
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating, selectedAmount, simRate]);

  // Live ticking of accumulated simulation earnings
  React.useEffect(() => {
    let timer: any = null;
    if (accumulatedSimEarnings > 0) {
      timer = setInterval(() => {
        // dynamic tick up depending on the investment amount
        const tickVal = Math.max(1, Math.round(selectedAmount * 0.000003));
        setAccumulatedSimEarnings(prev => prev + tickVal);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [accumulatedSimEarnings, selectedAmount]);

  // Adjust yield percentage based on selected capital preset
  const handlePresetSelect = (amount: number) => {
    setSelectedAmount(amount);
    if (amount <= 10000) setSimRate(5.5);
    else if (amount <= 50000) setSimRate(6.5);
    else if (amount <= 150000) setSimRate(7.5);
    else if (amount <= 500000) setSimRate(8.8);
    else setSimRate(9.8);
    
    // reset simulation when amount changes to let them press the play button again
    setAccumulatedSimEarnings(0);
  };

  React.useEffect(() => {
    // Detect standalone mode
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect OS
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setDeviceOS('ios');
    } else if (/android/.test(ua)) {
      setDeviceOS('android');
    }
  }, []);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div id="home-root" className="w-full min-h-screen bg-transparent text-slate-800 flex flex-col items-center justify-start p-0 m-0 relative overflow-x-hidden font-sans antialiased selection:bg-red-600 selection:text-white pb-16">
      


      {/* Immersive AirPods background image directly behind the text */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden select-none" id="home-airpods-bg-wrapper">
        <img 
          src="https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=1600&q=85" 
          alt="Home AirPods Background Immersive" 
          className="w-full h-full object-cover filter brightness-[1.03] contrast-[1.01]"
          referrerPolicy="no-referrer"
        />
        {/* Soft white overlay to ensure pristine contrast and high readability for all text */}
        <div className="absolute inset-0 bg-white/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/40" />
      </div>
      
      {/* Top Header / Bar */}
      <header id="main-header" className="w-full max-w-4xl px-6 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-yellow-500 flex items-center justify-center shadow-lg shadow-red-600/10 transform hover:rotate-6 transition-all">
            <Headphones className="w-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-sans font-black text-slate-900 text-lg uppercase tracking-wider leading-none">
              Ai<span className="text-red-600">prods</span>
            </h1>
            <span className="text-[9px] text-red-600 font-extrabold tracking-widest uppercase block mt-0.5">Mobile Official</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <button
              onClick={onGoToDashboard}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-red-600/10"
            >
              Tableau de bord
            </button>
          ) : (
            <button
              onClick={() => onNavigateToAuth(false)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              Connexion
            </button>
          )}
        </div>
      </header>

      {/* Hero Container */}
      <main id="home-main" className="w-full max-w-md px-6 flex flex-col items-center relative z-10 mt-2">
        
        {isLoggedIn && currentUser && (
          <div className="w-full px-5 py-3.5 bg-yellow-500/10 border border-yellow-500/20 text-xs font-bold text-yellow-800 rounded-2xl mb-5 flex items-center justify-between text-left shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-base">👋</span>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block leading-none mb-0.5">Ravi de vous revoir</span>
                <span className="font-extrabold text-[#dc2626]">{currentUser.name || "Cher Partenaire"}</span>
              </div>
            </div>
            <span className="text-[9px] uppercase bg-green-500/10 text-green-600 px-2 py-0.5 rounded border border-green-500/20">En ligne ✓</span>
          </div>
        )}

        {/* BANNER FLUX EN DIRECT (Va-et-vient de gauche à droite) */}
        <div className="w-full bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-3 shadow-xs mb-5 overflow-hidden relative" id="live-ticker-container">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Flux d'activité en direct
              </span>
            </div>
            <span className="text-[8px] font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase tracking-wider">
              En direct 🔴
            </span>
          </div>

          <div className="relative w-full overflow-hidden py-1">
            {/* Edge fades */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee-ltr flex items-center gap-4 whitespace-nowrap">
              {liveTransactions.map((tx, idx) => (
                <div 
                  key={`tx-${idx}`} 
                  className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5 shrink-0"
                >
                  <span className="text-xs select-none">{tx.flag}</span>
                  <span className="text-[11px] font-bold text-slate-800">{tx.name}</span>
                  
                  {tx.type === "recharge" ? (
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20">
                      a rechargé ⚡
                    </span>
                  ) : (
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
                      a retiré 💸
                    </span>
                  )}
                  
                  <span className="text-[11.5px] font-extrabold text-slate-900">{tx.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Banner Badge */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50/70 backdrop-blur-md border border-red-100/60 rounded-full mb-5 animate-pulse">
          <ShieldCheck className="w-3.5 h-3.5 text-red-600 stroke-[2.5]" />
          <span className="text-[10px] text-red-800 font-black uppercase tracking-wider">
            Investissement Certifié & Sécurisé
          </span>
        </div>

        {/* Title */}
        <h2 className="text-center font-sans font-black text-slate-900 text-3xl sm:text-4xl leading-tight uppercase tracking-tight mb-4">
          Faites Fructifier <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-500 to-red-700">
            Votre Capital
          </span>
        </h2>

        <p className="text-center text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mb-6">
          Rejoignez plus de 15,000 investisseurs africains et financez des stocks d'Airprods de haute technologie à fort rendement journalier.
        </p>

        {/* PREMIUM IMAGE OF AIRPRODS UNDER THE WRITINGS */}
        <div className="w-full mb-6 rounded-[28px] overflow-hidden relative border border-orange-100 shadow-[0_12px_45px_rgba(249,115,22,0.06)] bg-white group" id="home-airprods-image-hero">
          {/* Glowing gradients matching the white-orange-violet theme */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#7c3aed]/10 via-transparent to-[#ff7c00]/10 pointer-events-none z-10" />
          
          <img 
            src="https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=800&q=80" 
            alt="Airprods Premium Wireless Earbuds"
            className="w-full h-48 sm:h-52 object-cover transform duration-700 ease-out group-hover:scale-105"
            referrerPolicy="no-referrer"
          />

          {/* Color border line highlight */}
          <div className="absolute bottom-0 inset-x-0 h-[3.5px] bg-gradient-to-r from-[#ff7c00] via-white to-[#7c3aed]" />

          {/* Premium banner label */}
          <div className="absolute top-3 left-3 bg-white/85 backdrop-blur-md rounded-lg py-1 px-2.5 border border-orange-100 flex items-center gap-1.5 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-800">
              Gamme Premium • 2026
            </span>
          </div>
        </div>

        {/* Action button card with automatic crop visual */}
        <div className="w-full bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6.5 shadow-[0_15px_40px_rgba(0,0,0,0.03)] mb-6 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚀</span>
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Prêt à récolter ?</span>
            </div>
            <span className="text-[10.5px] font-black uppercase px-2.5 py-1 bg-yellow-100 text-yellow-805 rounded-md">
              +200F Offerts 🎁
            </span>
          </div>

          <div className="space-y-3">
            {isLoggedIn ? (
              <button
                onClick={onGoToDashboard}
                className="w-full py-4 rounded-2xl font-black bg-gradient-to-r from-red-600 to-red-700 hover:opacity-95 text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest cursor-pointer shadow-lg shadow-red-600/20"
              >
                <span>Accéder à mon espace</span>
                <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigateToAuth(true)}
                  className="w-full py-4 rounded-2xl font-black bg-gradient-to-r from-red-500 to-red-600 hover:opacity-95 text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest cursor-pointer shadow-lg shadow-red-500/20"
                >
                  <span>Créer mon compte gratuit</span>
                  <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
                </button>
                <button
                  onClick={() => onNavigateToAuth(false)}
                  className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl text-[10.5px] font-bold transition-all cursor-pointer uppercase tracking-wider"
                >
                  Déjà Inscrit ? Se connecter
                </button>
              </>
            )}
          </div>
        </div>

        {/* Trust Indicators Carousel / Grid */}
        <div className="w-full grid grid-cols-3 gap-2 mb-6">
          <div className="bg-white/70 backdrop-blur-md border border-slate-100 p-3 rounded-2xl text-center shadow-sm">
            <span className="block text-base font-black text-red-600">15K+</span>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-0.5 block">Membres</span>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-slate-100 p-3 rounded-2xl text-center shadow-sm">
            <span className="block text-base font-black text-yellow-600">286M+</span>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-0.5 block">Gains CFA</span>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-slate-100 p-3 rounded-2xl text-center shadow-sm">
            <span className="block text-base font-black text-red-600">35%</span>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-0.5 block">ROI Moyen</span>
          </div>
        </div>

        {/* PROFESSIONAL DASHBOARD INTERACTIVE SIMULATOR ON HOME PAGE */}
        <div className="w-full bg-slate-900 text-white border border-slate-800 rounded-[32px] p-5 sm:p-6 mb-8 shadow-2xl relative overflow-hidden text-left" id="home-interactive-dashboard-simulator">
          {/* Futuristic corner gradient decor */}
          <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#ff7c00]/25 to-transparent rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-[#7c3aed]/25 to-transparent rounded-full blur-xl pointer-events-none" />

          {/* Card Header */}
          <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff7c00] to-[#7c3aed] flex items-center justify-center shadow-md">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#E6C594]">
                  Tableau de bord de simulation
                </h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  Technologie de rendement Aiprods
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#ff7c00]/10 border border-[#ff7c00]/20 rounded-full animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff7c00]" />
              <span className="text-[8.5px] font-black uppercase text-[#ff7c00] tracking-wider">
                TEMPS RÉEL ⚡
              </span>
            </div>
          </div>

          {/* STATS ROW (3 COLUMNS) */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            <div className="bg-white/[0.03] border border-white/5 p-2.5 rounded-xl text-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Solde de test
              </span>
              <span className="text-xs sm:text-sm font-sans font-black text-white block">
                {accumulatedSimEarnings > 0 ? (
                  <span className="text-green-400 font-mono tracking-tight animate-pulse">
                    {accumulatedSimEarnings.toLocaleString()} F
                  </span>
                ) : (
                  <span className="text-slate-500 font-mono">0.00 F</span>
                )}
              </span>
            </div>
            
            <div className="bg-white/[0.03] border border-white/5 p-2.5 rounded-xl text-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Gain Journalier
              </span>
              <span className="text-xs sm:text-sm font-sans font-black text-orange-400 block font-mono">
                +{Math.round(selectedAmount * (simRate / 100)).toLocaleString()} F
              </span>
            </div>

            <div className="bg-white/[0.03] border border-white/5 p-2.5 rounded-xl text-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Taux (VIP)
              </span>
              <span className="text-xs sm:text-sm font-sans font-black text-violet-400 block font-mono">
                {simRate}% / jour
              </span>
            </div>
          </div>

          {/* CAPITAL SELECTOR */}
          <div className="mb-5 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-350 tracking-wider">
                <Sliders className="w-3.5 h-3.5 text-orange-400" />
                <span>Sélectionner votre capital</span>
              </div>
              <span className="text-xs font-black font-mono text-white bg-white/10 px-2 py-0.5 rounded">
                {selectedAmount.toLocaleString()} F CFA
              </span>
            </div>

            {/* Slider control */}
            <input 
              type="range" 
              min="5000" 
              max="1000000" 
              step="5000"
              value={selectedAmount}
              onChange={(e) => handlePresetSelect(Number(e.target.value))}
              disabled={isSimulating}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#ff7c00] mb-3 focus:outline-none"
            />

            {/* Preset shortcuts */}
            <div className="grid grid-cols-5 gap-1">
              {[10000, 50000, 150000, 500000, 1000000].map((val) => (
                <button
                  key={val}
                  type="button"
                  disabled={isSimulating}
                  onClick={() => handlePresetSelect(val)}
                  className={`py-1.5 px-0 rounded-lg text-[9px] font-black transition-all border outline-none truncate cursor-pointer ${
                    selectedAmount === val 
                      ? 'bg-gradient-to-r from-[#ff7c00] to-[#7c3aed] text-white border-transparent shadow-md' 
                      : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300'
                  }`}
                >
                  {val >= 1000000 ? '1M' : val >= 1000 ? `${val/1000}k` : val} F
                </button>
              ))}
            </div>
          </div>

          {/* LIVE SIMULATOR BUTTON & PROGRESS BAR */}
          <div className="mb-5">
            {isSimulating ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-350">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-orange-400 animate-spin" />
                    <span className="animate-pulse">Traitement des flux audio Aiprods...</span>
                  </div>
                  <span className="font-mono">{simulationProgress}%</span>
                </div>
                {/* Custom Progress bar */}
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="bg-gradient-to-r from-[#ff7c00] via-[#7c3aed] to-emerald-500 h-full rounded-full transition-all duration-100" 
                    style={{ width: `${simulationProgress}%` }}
                  />
                </div>
                {/* Visual soundwaves moving */}
                <div className="flex items-center justify-center gap-1 py-1">
                  {[1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 4, 2, 1].map((h, i) => (
                    <span 
                      key={i} 
                      className="w-1 rounded-full bg-gradient-to-t from-[#7c3aed] to-[#ff7c00] animate-pulse" 
                      style={{ 
                        height: `${h * 4}px`, 
                        animationDelay: `${i * 0.05}s`,
                        animationDuration: '0.6s'
                      }} 
                    />
                  ))}
                </div>
              </div>
            ) : accumulatedSimEarnings > 0 ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl flex items-center justify-between text-left animate-fade-in">
                <div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[10.5px] font-black uppercase text-emerald-400 tracking-wider">
                      CONTRAT ACTIF ET EN COURS 🎧
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-350 font-medium leading-relaxed mt-1">
                    Votre capital génère des revenus en direct. Observez le solde de test augmenter chaque seconde !
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePresetSelect(selectedAmount)}
                  className="bg-white/5 hover:bg-white/10 text-[9px] text-slate-300 font-bold px-2.5 py-1.5 rounded-lg border border-white/5 active:scale-95 cursor-pointer outline-none shrink-0 ml-2"
                >
                  Réinitialiser
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSimulating(true)}
                className="w-full py-3.5 bg-gradient-to-r from-[#ff7c00] to-[#7c3aed] hover:opacity-95 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2 active:scale-[0.98] outline-none"
              >
                <Play className="w-4 h-4 text-white fill-current shrink-0" />
                <span>Lancer la production de test</span>
              </button>
            )}
          </div>

          {/* GROWTH HIGH-FIDELITY INTERACTIVE VECTOR CHART */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-350 tracking-wider">
                <TrendingUp className="w-3.5 h-3.5 text-[#ff7c00]" />
                <span>Croissance estimée des gains</span>
              </div>
              <span className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wider">
                Sélectionnez un jour
              </span>
            </div>

            {/* SVG line chart */}
            <div className="relative w-full h-24 mb-4 flex items-end">
              <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Gradient background under graph line */}
                <defs>
                  <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff7c00" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal grid guide lines */}
                <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

                {/* Smooth area under the line */}
                <path 
                  d="M 5,90 L 5,80 C 15,75 25,65 35,55 C 50,45 65,30 80,18 C 87,14 92,11 95,10 L 95,90 Z" 
                  fill="url(#chart-area-grad)" 
                />

                {/* Neon graph line */}
                <path 
                  d="M 5,80 C 15,75 25,65 35,55 C 50,45 65,30 80,18 C 87,14 92,11 95,10" 
                  fill="none" 
                  stroke="url(#orange-violet-grad)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />
              </svg>

              {/* Day dots (X-axis distribution) */}
              <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-between px-1 pointer-events-none">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  return (
                    <div 
                      key={day} 
                      className="flex flex-col items-center group cursor-pointer pointer-events-auto select-none"
                      style={{ width: '12%' }}
                      onClick={() => setActiveGraphDay(day)}
                    >
                      {/* Interactive dot */}
                      <div 
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                          activeGraphDay === day 
                            ? 'bg-[#ff7c00] border-2 border-white scale-125 shadow-[0_0_12px_#ff7c00]' 
                            : 'bg-slate-800 border-2 border-white/20 hover:border-white/50'
                        }`}
                        title={`Jour ${day}`}
                      />
                      <span className={`text-[8px] font-mono font-bold mt-1.5 transition-colors ${
                        activeGraphDay === day ? 'text-[#ff7c00]' : 'text-slate-400'
                      }`}>
                        J{day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected day feedback info box */}
            <div className="bg-white/[0.03] border border-white/5 p-2.5 rounded-xl flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-slate-350">
                <Clock className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span>Gains cumulés au Jour {activeGraphDay} :</span>
              </div>
              <span className="font-black font-mono text-[#ff7c00] text-sm tracking-tight">
                +{Math.round(selectedAmount * (simRate / 100) * activeGraphDay).toLocaleString()} F CFA
              </span>
            </div>
          </div>

          {/* TELEMETRY EQUIPMENT DETAILS FOOTER */}
          <div className="flex items-center justify-between bg-white/[0.01] border-t border-white/5 pt-3.5 text-[8.5px] font-bold text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-1">
              <Cpu className="w-3 text-slate-500 animate-pulse" />
              <span>MINEUR: STUDIO PRO-5G</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 text-[#ff7c00]" />
              <span>SYNC RATE: 100% SECURE</span>
            </div>
          </div>
        </div>

        {/* SECTION UNIQUE : ACTIVITÉS CYCLE COURT */}
        <div className="w-full mb-6 select-none text-left border-t border-slate-100/60 pt-6">
          <div className="px-1">
            <span className="text-[10px] text-red-655 font-black uppercase tracking-widest block mb-0.5">CYCLE COURT ⚡</span>
            <h3 className="text-xl font-sans font-black text-slate-900 uppercase tracking-tight">
              Activités Cycle Court
            </h3>
          </div>
        </div>

        {/* USINES ET CONSTRUCTEURS AIRPRODS EN MOUVEMENT */}
        <div className="w-full mb-6 mt-4 select-none text-left border-t border-slate-100/60 pt-6">
          <div className="px-1 mb-4">
            <span className="text-[10px] text-red-600 font-black uppercase tracking-widest block mb-0.5">PARTENAIRES INDUSTRIELS 🎧</span>
            <h3 className="text-base font-sans font-black text-slate-900 uppercase tracking-tight">
              Usines de Fabrication
            </h3>
            <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed mt-1">
              Les leaders mondiaux de la technologie audio qui conçoivent et assemblent nos équipements.
            </p>
          </div>

          {/* Marquee Wrapper with fading edges */}
          <div className="relative w-full overflow-hidden bg-slate-50 py-4 rounded-2xl border border-slate-100/80">
            {/* Gradients to fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee-ltr flex items-center gap-6 whitespace-nowrap">
              {/* First Set of Logos */}
              {[
                { name: "Apple Audio", slug: "apple", color: "1e293b", bg: "bg-slate-100", detail: "California" },
                { name: "Sony Corp", slug: "sony", color: "000000", bg: "bg-slate-100/80", detail: "Tokyo" },
                { name: "Bose Prof", slug: "bose", color: "000000", bg: "bg-zinc-100", detail: "Boston" },
                { name: "Sennheiser", slug: "sennheiser", color: "000000", bg: "bg-zinc-50", detail: "Germany" },
                { name: "JBL Audio", slug: "jbl", color: "FF6600", bg: "bg-orange-50", detail: "Los Angeles" },
                { name: "Beats Elec", slug: "beatsbydre", color: "E30000", bg: "bg-red-50", detail: "Culver City" },
                { name: "Samsung", slug: "samsung", color: "1428A0", bg: "bg-blue-50", detail: "Seoul" },
                { name: "Xiaomi", slug: "xiaomi", color: "FF6700", bg: "bg-amber-50", detail: "Beijing" }
              ].map((brand, idx) => (
                <div key={`brand-1-${idx}`} className="inline-flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm shrink-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${brand.bg} p-1.5`}>
                    <img 
                      src={`https://cdn.simpleicons.org/${brand.slug}/${brand.color}`} 
                      alt={brand.name} 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-black uppercase text-slate-800 leading-none">{brand.name}</span>
                    <span className="text-[7.5px] font-extrabold uppercase text-slate-400 tracking-wider mt-0.5">{brand.detail}</span>
                  </div>
                </div>
              ))}

              {/* Duplicate Set for Seamless Loop */}
              {[
                { name: "Apple Audio", slug: "apple", color: "1e293b", bg: "bg-slate-100", detail: "California" },
                { name: "Sony Corp", slug: "sony", color: "000000", bg: "bg-slate-100/80", detail: "Tokyo" },
                { name: "Bose Prof", slug: "bose", color: "000000", bg: "bg-zinc-100", detail: "Boston" },
                { name: "Sennheiser", slug: "sennheiser", color: "000000", bg: "bg-zinc-50", detail: "Germany" },
                { name: "JBL Audio", slug: "jbl", color: "FF6600", bg: "bg-orange-50", detail: "Los Angeles" },
                { name: "Beats Elec", slug: "beatsbydre", color: "E30000", bg: "bg-red-50", detail: "Culver City" },
                { name: "Samsung", slug: "samsung", color: "1428A0", bg: "bg-blue-50", detail: "Seoul" },
                { name: "Xiaomi", slug: "xiaomi", color: "FF6700", bg: "bg-amber-50", detail: "Beijing" }
              ].map((brand, idx) => (
                <div key={`brand-2-${idx}`} className="inline-flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm shrink-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${brand.bg} p-1.5`}>
                    <img 
                      src={`https://cdn.simpleicons.org/${brand.slug}/${brand.color}`} 
                      alt={brand.name} 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-black uppercase text-slate-800 leading-none">{brand.name}</span>
                    <span className="text-[7.5px] font-extrabold uppercase text-slate-400 tracking-wider mt-0.5">{brand.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security & Partner Badge */}
        <div id="security-foot" className="flex flex-col items-center justify-center gap-1 opacity-70 mt-8">
          <div className="flex items-center gap-1.5 text-[9.5px] font-black uppercase text-slate-400 tracking-widest">
            <Award className="w-3.5 h-3.5 text-red-600 stroke-[3]" />
            <span>AIPRODS CERTIFICATION v2.5</span>
          </div>
          <span className="text-[8px] font-extrabold uppercase text-slate-350 tracking-widest">
            Cryptage Militaire SSL 256 Bits
          </span>
        </div>

      </main>
    </div>
  );
}
