import React, { useState } from 'react';
import { DataStore } from '../dataStore';
import { 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Leaf, 
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
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    <div id="home-root" className="w-full min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-start p-0 m-0 relative overflow-x-hidden font-sans antialiased selection:bg-red-600 selection:text-white pb-16">
      


      {/* Background aesthetic blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-red-505/10 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-yellow-505/5 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
      
      {/* Top Header / Bar */}
      <header id="main-header" className="w-full max-w-4xl px-6 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-yellow-500 flex items-center justify-center shadow-lg shadow-red-600/10 transform hover:rotate-6 transition-all">
            <Leaf className="w-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-sans font-black text-slate-900 text-lg uppercase tracking-wider leading-none">
              Agro<span className="text-red-600">Profit</span>
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

        {/* Banner Badge */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 border border-red-100 rounded-full mb-5 animate-pulse">
          <ShieldCheck className="w-3.5 h-3.5 text-red-600 stroke-[2.5]" />
          <span className="text-[10px] text-red-800 font-black uppercase tracking-wider">
            Investissement Certifié & Sécurisé
          </span>
        </div>

        {/* Title */}
        <h2 className="text-center font-sans font-black text-slate-900 text-3xl sm:text-4xl leading-tight uppercase tracking-tight mb-4">
          Cultivez votre Capital <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-500 to-red-700">
            Dans la Terre
          </span>
        </h2>

        <p className="text-center text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mb-6">
          Rejoignez plus de 15,000 investisseurs africains et financez des projets agro-industriels rentables à fort rendement journalier.
        </p>

        {/* Action button card with automatic crop visual */}
        <div className="w-full bg-white border border-slate-200/60 rounded-3xl p-6.5 shadow-[0_15px_40px_rgba(0,0,0,0.03)] mb-6 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
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
          <div className="bg-white border border-slate-100 p-3 rounded-2xl text-center shadow-sm">
            <span className="block text-base font-black text-red-600">15K+</span>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-0.5 block">Membres</span>
          </div>
          <div className="bg-white border border-slate-100 p-3 rounded-2xl text-center shadow-sm">
            <span className="block text-base font-black text-yellow-600">286M+</span>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-0.5 block">Gains CFA</span>
          </div>
          <div className="bg-white border border-slate-100 p-3 rounded-2xl text-center shadow-sm">
            <span className="block text-base font-black text-red-600">35%</span>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-0.5 block">ROI Moyen</span>
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

        {/* Security & Partner Badge */}
        <div id="security-foot" className="flex flex-col items-center justify-center gap-1 opacity-70 mt-8">
          <div className="flex items-center gap-1.5 text-[9.5px] font-black uppercase text-slate-400 tracking-widest">
            <Award className="w-3.5 h-3.5 text-red-600 stroke-[3]" />
            <span>AGROPROFIT CERTIFICATION v2.5</span>
          </div>
          <span className="text-[8px] font-extrabold uppercase text-slate-350 tracking-widest">
            Cryptage Militaire SSL 256 Bits
          </span>
        </div>

      </main>
    </div>
  );
}
