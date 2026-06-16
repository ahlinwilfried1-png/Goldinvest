import React, { useState } from 'react';
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
  PiggyBank
} from 'lucide-react';

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
  // Calculator state
  const [calcAmount, setCalcAmount] = useState<number>(10000);
  
  // Custom ROI formulas based on standard AgroProfit products
  const dailyRate = 0.085; // 8.5% daily average
  const calcDaily = Math.round(calcAmount * dailyRate);
  const calcWeekly = Math.round(calcAmount * dailyRate * 7);
  const calcMonthly = Math.round(calcAmount * dailyRate * 30);

  // Quick select calculator amounts
  const fastAmounts = [5000, 10000, 25000, 50000, 100000, 250000];

  return (
    <div id="home-root" className="w-full min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-start p-0 m-0 relative overflow-x-hidden font-sans antialiased selection:bg-orange-500 selection:text-white pb-16">
      
      {/* Background aesthetic blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
      
      {/* Top Header / Bar */}
      <header id="main-header" className="w-full max-w-4xl px-6 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-orange-500 flex items-center justify-center shadow-lg shadow-emerald-600/10 transform hover:rotate-6 transition-all">
            <Leaf className="w-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-sans font-black text-slate-900 text-lg uppercase tracking-wider leading-none">
              Agro<span className="text-orange-500">Profit</span>
            </h1>
            <span className="text-[9px] text-emerald-600 font-extrabold tracking-widest uppercase block mt-0.5">Mobile Official</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <button
              onClick={onGoToDashboard}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-600/10"
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
        
        {/* Banner Badge */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mb-5 animate-pulse">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
          <span className="text-[10px] text-emerald-800 font-black uppercase tracking-wider">
            Investissement Certifié & Sécurisé
          </span>
        </div>

        {/* Title */}
        <h2 className="text-center font-sans font-black text-slate-900 text-3xl sm:text-4xl leading-tight uppercase tracking-tight mb-4">
          Cultivez votre Capital <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-orange-500 to-amber-500">
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
            <span className="text-[10.5px] font-black uppercase px-2.5 py-1 bg-orange-100 text-orange-700 rounded-md">
              +200F Offerts 🎁
            </span>
          </div>

          <div className="space-y-3">
            {isLoggedIn ? (
              <button
                onClick={onGoToDashboard}
                className="w-full py-4 rounded-2xl font-black bg-gradient-to-r from-emerald-600 to-emerald-700 hover:opacity-95 text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                <span>Accéder à mon espace</span>
                <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigateToAuth(true)}
                  className="w-full py-4 rounded-2xl font-black bg-gradient-to-r from-orange-500 to-amber-600 hover:opacity-95 text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest cursor-pointer shadow-lg shadow-orange-500/20"
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
            <span className="block text-base font-black text-emerald-600">15K+</span>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-0.5 block">Membres</span>
          </div>
          <div className="bg-white border border-slate-100 p-3 rounded-2xl text-center shadow-sm">
            <span className="block text-base font-black text-orange-500">286M+</span>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-0.5 block">Gains CFA</span>
          </div>
          <div className="bg-white border border-slate-100 p-3 rounded-2xl text-center shadow-sm">
            <span className="block text-base font-black text-amber-500">35%</span>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-0.5 block">ROI Moyen</span>
          </div>
        </div>

        {/* Interactive ROI Calculator Section */}
        <section id="roi-calculator" className="w-full bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-xl mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg">
              <Calculator className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">Simulateur de Gains Agricole</h3>
          </div>

          <p className="text-[10.5px] text-slate-400 font-medium leading-relaxed mb-4">
            Choisissez un montant à investir en F CFA pour estimer vos retours quotidiens et mensuels réels.
          </p>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10.5px] font-bold text-slate-400">Capital</span>
              <span className="text-lg font-black text-emerald-400">{calcAmount.toLocaleString()} F CFA</span>
            </div>
            
            <input 
              type="range"
              min="5000"
              max="500000"
              step="5000"
              value={calcAmount}
              onChange={(e) => setCalcAmount(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Quick numbers selector */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {fastAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setCalcAmount(amt)}
                className={`px-2.5 py-1 rounded-lg text-[9.5px] font-black transition-all cursor-pointer ${
                  calcAmount === amt
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                {amt >= 1000 ? `${amt / 1000}K` : amt}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
            <div className="text-center">
              <span className="text-[8.5px] text-slate-400 font-black uppercase tracking-wider block">Par Jour</span>
              <span className="text-[11.5px] font-sans font-black text-emerald-400 mt-1 block">+{calcDaily.toLocaleString()} F</span>
            </div>
            <div className="text-center border-x border-slate-800">
              <span className="text-[8.5px] text-slate-400 font-black uppercase tracking-wider block">Par Semaine</span>
              <span className="text-[11.5px] font-sans font-black text-emerald-400 mt-1 block">+{calcWeekly.toLocaleString()} F</span>
            </div>
            <div className="text-center">
              <span className="text-[8.5px] text-slate-400 font-black uppercase tracking-wider block">Par Mois</span>
              <span className="text-[11.5px] font-sans font-black text-amber-400 mt-1 block">+{calcMonthly.toLocaleString()} F</span>
            </div>
          </div>
        </section>

        {/* official app download / PWA notice card */}
        <section id="app-features" className="w-full bg-gradient-to-tr from-orange-50 to-amber-50 border border-orange-100 rounded-3xl p-5.5 relative overflow-hidden mb-6">
          <div className="absolute top-[-20px] right-[-20px] w-28 h-28 bg-orange-200/20 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-200/50">
              <Smartphone className="w-6 h-6 text-orange-600 stroke-[2.5] animate-bounce" />
            </div>
            <div className="flex-1">
              <h4 className="font-sans font-black text-slate-900 text-[13px] uppercase tracking-tight">
                COMPATIBILITÉ MOBILE EXTRÊME
              </h4>
              <p className="text-[10.5px] font-bold text-slate-500 mt-0.5 uppercase tracking-wide">
                APPLICATION DIRECTE INSTANTANÉE
              </p>
              <p className="text-[11px] text-slate-600 font-semibold mt-2 leading-relaxed">
                Notre application s'installe directement via le bouton d'installation ou par fichier APK. Fini les fichiers volumineux, les ouvertures WPS Office compliquées ou les bugs de téléchargements !
              </p>
              
              <div className="flex items-center gap-2 mt-3 text-[10.5px] font-black text-orange-600 uppercase tracking-wider">
                <span>Sécurisé</span>
                <span>•</span>
                <span>Léger</span>
                <span>•</span>
                <span>Notifications directes</span>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Partner Badge */}
        <div id="security-foot" className="flex flex-col items-center justify-center gap-1 opacity-70 mt-4">
          <div className="flex items-center gap-1.5 text-[9.5px] font-black uppercase text-slate-400 tracking-widest">
            <Award className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
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
