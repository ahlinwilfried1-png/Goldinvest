import React, { useState, useEffect } from 'react';
import { Investment } from '../types';
import { Clock, CheckCircle, AlertCircle, Coins, Flame } from 'lucide-react';

interface InvestmentItemProps {
  investment: Investment;
  onClaim: (id: string) => Promise<void>;
}

export const InvestmentItem: React.FC<InvestmentItemProps> = ({ investment, onClaim }) => {
  const [now, setNow] = useState<number>(Date.now());
  const [claiming, setClaiming] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isActivity = investment.category === 'activity' || (investment as any).isCyclic;
  const isCompleted = investment.status === 'completed' || investment.daysPassed >= investment.durationDays;

  // Calculate times
  const createdTime = new Date(investment.createdAt).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  let nextClaimTime = 0;
  if (isActivity) {
    nextClaimTime = createdTime + investment.durationDays * oneDayMs;
  } else {
    nextClaimTime = createdTime + (investment.daysPassed + 1) * oneDayMs;
  }

  const isReady = !isCompleted && !isActivity && now >= nextClaimTime;
  const diff = nextClaimTime - now;

  let timeLeftStr = '';
  let cyclePercent = 0;

  if (isCompleted) {
    timeLeftStr = 'Complété';
    cyclePercent = 100;
  } else if (isActivity) {
    if (diff <= 0) {
      timeLeftStr = 'Cycle terminé - En cours de versement';
      cyclePercent = 100;
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      timeLeftStr = `${hours}h ${minutes}m ${seconds}s`;
      
      const totalDurationMs = investment.durationDays * oneDayMs;
      const elapsedMs = now - createdTime;
      cyclePercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));
    }
  } else {
    if (diff <= 0) {
      timeLeftStr = 'Revenu disponible';
      cyclePercent = 100;
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      timeLeftStr = `${hours}h ${minutes}m ${seconds}s`;

      const lastClaimTime = nextClaimTime - oneDayMs;
      const elapsedInCycleMs = now - lastClaimTime;
      cyclePercent = Math.min(100, Math.max(0, Math.round((elapsedInCycleMs / oneDayMs) * 100)));
    }
  }

  // Format the exact time the revenue will drop in 24h (or target date)
  const nextClaimDateObj = new Date(nextClaimTime);
  const formattedDate = nextClaimDateObj.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = nextClaimDateObj.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleClaimClick = async () => {
    if (claiming) return;
    setClaiming(true);
    try {
      await onClaim(investment.id);
    } catch (err) {
      console.error(err);
    } finally {
      setClaiming(false);
    }
  };

  const totalInvestmentPercent = Math.min(100, Math.round((investment.daysPassed / investment.durationDays) * 100));

  return (
    <div id={`investment-card-${investment.id}`} className="bg-white border border-slate-200 rounded-2xl p-4 text-left space-y-3.5 shadow-xs transition-all hover:shadow-sm">
      {/* Product Title and Invested Badge */}
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <h5 className="font-sans font-black text-slate-850 text-xs sm:text-[13px] uppercase tracking-tight flex items-center gap-1.5">
            {isActivity && <Flame className="w-4 h-4 text-orange-500 fill-orange-100" />}
            {investment.productName}
          </h5>
          <span className="text-[10px] text-slate-400 font-bold block">
            Plan {isActivity ? 'Cycle Court' : 'Stabilité'} • Jour {investment.daysPassed} sur {investment.durationDays}
          </span>
        </div>
        <div className="text-right">
          <span className="text-slate-400 text-[8.5px] block uppercase font-black tracking-wider">Investi</span>
          <span className="text-[#0086ff] font-black text-xs sm:text-sm font-mono">
            {investment.price.toLocaleString()} F CFA
          </span>
        </div>
      </div>

      {/* Main duration progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[8.5px] text-slate-400 font-black uppercase tracking-wider">
          <span>Progression globale</span>
          <span className="text-slate-650 font-bold font-mono">{totalInvestmentPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/40">
          <div className="bg-slate-300 h-full rounded-full transition-all" style={{ width: `${totalInvestmentPercent}%` }} />
        </div>
      </div>

      {/* Next Revenue Drop Tracker (The requested feature) */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Clock className={`w-3.5 h-3.5 ${isReady ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
            {isActivity ? 'Cycle finalisé le' : 'Prochain gain quotidien'}
          </span>
          <span className="font-sans font-black text-[9px] uppercase tracking-wider text-slate-400 font-mono">
            {formattedDate} à {formattedTime}
          </span>
        </div>

        {/* 24-Hour Cycle Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                isCompleted 
                  ? 'bg-emerald-500' 
                  : isReady 
                    ? 'bg-emerald-500' 
                    : 'bg-gradient-to-r from-orange-500 to-indigo-500'
              }`}
              style={{ width: `${cyclePercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[8.5px] font-bold text-slate-400 uppercase">
            <span>
              {isCompleted ? 'Contrat terminé' : isReady ? 'Disponible' : 'Minage en cours'}
            </span>
            <span className="font-mono text-slate-500">
              {isCompleted ? '100%' : isReady ? 'Prêt' : timeLeftStr}
            </span>
          </div>
        </div>
      </div>

      {/* Earnings Information & Harvest Actions */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="text-left">
          <span className="text-[8.5px] text-slate-400 block uppercase font-bold tracking-wider leading-none">Rendement quotidien</span>
          <span className="text-emerald-600 font-black text-xs sm:text-sm font-mono">
            +{investment.dailyReturn.toLocaleString()} F / jour
          </span>
        </div>

        <div className="text-right">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 font-black uppercase text-[8.5px] px-2.5 py-1.5 rounded-lg border border-slate-200">
              <CheckCircle className="w-3 h-3 text-slate-400" />
              Terminé
            </span>
          ) : isActivity ? (
            <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 font-black uppercase text-[8.5px] px-2.5 py-1.5 rounded-lg border border-orange-200 animate-pulse">
              <Flame className="w-3 h-3 text-orange-500" />
              Automatique
            </span>
          ) : isReady ? (
            <button
              type="button"
              disabled={claiming}
              onClick={handleClaimClick}
              className="bg-gradient-to-r from-[#ff7c00] to-[#7c3aed] text-white hover:brightness-110 active:scale-95 text-[9.5px] font-black uppercase px-4 py-1.5 rounded-lg shadow-sm cursor-pointer border-0 outline-none transition-all flex items-center gap-1.5"
            >
              <Coins className="w-3.5 h-3.5" />
              {claiming ? 'Récolte...' : 'Récolter'}
            </button>
          ) : (
            <div className="flex flex-col text-right">
              <span className="text-[8.5px] text-slate-400 uppercase font-bold tracking-wider">Cumulé</span>
              <span className="font-extrabold text-slate-700 text-[11px] font-mono">
                {(investment.dailyReturn * investment.daysPassed).toLocaleString()} F CFA
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
