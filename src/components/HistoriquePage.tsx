import React, { useState, useEffect } from 'react';
import { User, Deposit, Withdrawal, Investment, SystemNotification } from '../types';
import { DataStore, syncWithBackend } from '../dataStore';
import { 
  ArrowLeft, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShoppingBag, 
  RefreshCw, 
  Calendar, 
  Search, 
  SlidersHorizontal,
  Wallet,
  CheckCircle,
  Clock,
  XCircle,
  Database,
  Gift,
  Bell
} from 'lucide-react';

interface HistoriquePageProps {
  user: User;
  onNavigate: (path: string) => void;
}

export default function HistoriquePage({ user, onNavigate }: HistoriquePageProps) {
  const [activeTab, setActiveTab] = useState<'recharge' | 'retrait' | 'achat'>('recharge');
  
  // Data lists corresponding to the types
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed'>('all');

  // Gift Code & Notifications states
  const [giftCode, setGiftCode] = useState('');
  const [applyingCode, setApplyingCode] = useState(false);
  const [codeFeedback, setCodeFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [notifs, setNotifs] = useState<SystemNotification[]>([]);
  const [hashActive, setHashActive] = useState(window.location.hash);

  const fetchTransactions = () => {
    // 1. Recharges (deposits of type: recharge)
    const allDeps = DataStore.getDeposits().filter(d => d.userId === user.id);
    setDeposits(allDeps);

    // 2. Retraits (withdrawals of type: retrait)
    const allWths = DataStore.getWithdrawals().filter(w => w.userId === user.id);
    setWithdrawals(allWths);

    // 3. Achats (investments of type: achat)
    const allInvs = DataStore.getInvestments().filter(i => i.userId === user.id);
    setInvestments(allInvs);

    // 4. Notifications
    const allNotifs = DataStore.getNotifications().filter(n => n.userId === undefined || n.userId === user.id);
    setNotifs(allNotifs);
  };

  useEffect(() => {
    fetchTransactions();
    
    // Listen for background updates
    const handleStoreUpdated = () => {
      fetchTransactions();
    };
    window.addEventListener('gi_store_updated', handleStoreUpdated);
    return () => {
      window.removeEventListener('gi_store_updated', handleStoreUpdated);
    };
  }, [user.id]);

  useEffect(() => {
    const handleHashChange = () => {
      setHashActive(window.location.hash);
      if (window.location.hash) {
        setTimeout(() => {
          const el = document.getElementById(window.location.hash.substring(1));
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    // Initial trigger
    handleHashChange();
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const codeClean = giftCode.trim();
    if (!codeClean) return;
    setApplyingCode(true);
    setCodeFeedback(null);
    setTimeout(() => {
      const res = DataStore.applyBonusCode(user.id, codeClean);
      setApplyingCode(false);
      if (res.success) {
        setCodeFeedback({ message: `Félicitations ! ${res.message}`, type: 'success' });
        setGiftCode('');
        fetchTransactions();
        window.dispatchEvent(new CustomEvent('gi_store_updated'));
      } else {
        setCodeFeedback({ message: res.message, type: 'error' });
      }
    }, 700);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await syncWithBackend();
      fetchTransactions();
    } catch (err) {
      console.error('Failed to sync history from backend:', err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const getCurrency = () => {
    return 'XOF';
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Filter based on currently active tab and search/status parameters
  const getFilteredData = () => {
    const term = searchTerm.toLowerCase().trim();
    
    if (activeTab === 'recharge') {
      return deposits.filter(item => {
        // Enforce the data schema/database type = recharge
        const matchesType = true; // Implicitly deposits are recharges
        const matchesSearch = item.operator.toLowerCase().includes(term) || 
                             item.reference.toLowerCase().includes(term) ||
                             item.amount.toString().includes(term);
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesType && matchesSearch && matchesStatus;
      });
    } else if (activeTab === 'retrait') {
      return withdrawals.filter(item => {
        // Enforce the database type = retrait
        const matchesType = true; // Implicitly withdrawals are retraits
        const matchesSearch = item.operator.toLowerCase().includes(term) || 
                             item.number.toLowerCase().includes(term) ||
                             item.amount.toString().includes(term);
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesType && matchesSearch && matchesStatus;
      });
    } else {
      return investments.filter(item => {
        // Enforce the database type = achat
        const matchesType = true; // Implicitly investments are achats
        const matchesSearch = item.productName.toLowerCase().includes(term) || 
                             item.price.toString().includes(term);
        const matchesStatus = statusFilter === 'all' || 
                             (statusFilter === 'approved' && item.status === 'active') || 
                             (statusFilter === 'completed' && item.status === 'completed');
        return matchesType && matchesSearch && matchesStatus;
      });
    }
  };

  const filteredItems = getFilteredData();

  return (
    <div className="min-h-screen bg-[#fff6ed] pb-24 text-slate-900 selection:bg-orange-200">
      {/* HEADER SECTION */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-orange-100 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => onNavigate('/')}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-950 transition-colors font-bold text-sm cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            <span>Tableau de bord</span>
          </button>
          
          <h1 className="font-sans font-black text-base sm:text-lg text-slate-800 uppercase tracking-wider">
            Historique de Compte
          </h1>

          <button 
            onClick={handleRefresh}
            disabled={loading}
            className={`p-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-full transition-all cursor-pointer ${loading ? 'animate-spin' : ''}`}
            title="Synchroniser"
          >
            <RefreshCw className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* BALANCE HIGHLIGHT CARD */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-700/50">
          <div>
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest block mb-1">Solde Disponible</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold font-sans tracking-tight solde-bold">
                {user.balance.toLocaleString()}
              </span>
              <span className="text-sm font-black text-orange-400 select-none">{getCurrency()}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-orange-500" />
              Directement synchronisé avec la base Supabase Cloud.
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:self-center select-none">
            <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700 text-xs flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Type: Utilisateur</span>
            </div>
            <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700 text-xs">
              <span className="text-slate-400">Tel:</span> <span className="font-bold">{user.whatsapp}</span>
            </div>
          </div>
        </div>

        {/* SECTION: CODE CADEAU & ANNOUNCEMENTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* CARD A: ENTER GIFT CODE */}
          <div 
            id="code-cadeau"
            className={`p-6 rounded-3xl border text-slate-850 text-left transition-all duration-500 bg-white shadow-sm ${
              hashActive === '#code-cadeau' 
                ? 'border-orange-400 ring-4 ring-orange-100 shadow-md scale-[1.01]' 
                : 'border-orange-100/80 hover:border-orange-200'
            }`}
          >
            <div className="flex items-center space-x-3 pb-3 border-b border-orange-50/50">
              <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-sans font-black text-slate-800 uppercase tracking-wider truncate">Code Cadeau Bonus</h4>
                <p className="text-[10px] text-slate-400 block font-bold truncate">Créditez instantanément votre solde</p>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Entrez votre code promotionnel ou numéro de carte bonus reçu lors d'événements AgriCapital ou partagé sur nos canaux officiels.
              </p>
              
              <form onSubmit={handleApplyCode} className="flex gap-2 mr-0.5">
                <input
                  type="text"
                  placeholder="Ex: AGRIGIFT2026, BONUSTG..."
                  value={giftCode}
                  onChange={(e) => setGiftCode(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 focus:border-orange-400 font-sans rounded-2xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={applyingCode}
                  className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-sans font-black text-[11px] uppercase tracking-wider rounded-2xl transition-all shadow cursor-pointer flex items-center justify-center shrink-0"
                >
                  {applyingCode ? 'Verification...' : 'Valider'}
                </button>
              </form>

              {/* LOCAL FEEDBACK ALERT */}
              {codeFeedback && (
                <div className={`p-3.5 rounded-2xl border text-[11px] leading-relaxed font-bold flex items-center gap-2 animate-fade-in ${
                  codeFeedback.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                    : 'bg-rose-50 border-rose-100 text-rose-700'
                }`}>
                  <span className="shrink-0">{codeFeedback.type === 'success' ? '✅' : '⚠️'}</span>
                  <p className="flex-1">{codeFeedback.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* CARD B: NOTIFICATIONS / ANNOUNCEMENTS FEED */}
          <div 
            id="notifications"
            className={`p-6 rounded-3xl border text-slate-850 text-left transition-all duration-500 bg-white shadow-sm ${
              hashActive === '#notifications' 
                ? 'border-orange-400 ring-4 ring-orange-100 shadow-md scale-[1.01]' 
                : 'border-orange-100/80 hover:border-orange-200'
            }`}
          >
            <div className="flex items-center space-x-3 pb-3 border-b border-orange-50/50">
              <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-sans font-black text-slate-800 uppercase tracking-wider truncate">Notifications ({notifs.length})</h4>
                <p className="text-[10px] text-slate-400 block font-bold truncate">Actu en direct de l'administration</p>
              </div>
            </div>

            <div className="pt-4 space-y-3 max-h-[178px] overflow-y-auto pr-1">
              {notifs.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-[11px] font-bold leading-relaxed">
                  Aucune notification enregistrée sur votre compte.<br/>
                  <span className="text-[9px] font-medium text-slate-400">Vos actus s'afficheront ici.</span>
                </div>
              ) : (
                notifs.map((n) => (
                  <div key={n.id} className="p-3 bg-slate-50 border border-slate-100/70 rounded-2xl flex flex-col gap-1 text-[11px] text-slate-800 shadow-sm leading-relaxed">
                    <div className="flex justify-between items-center gap-1.5 border-b border-slate-200/40 pb-1">
                      <span className="text-[9px] font-black text-orange-600 uppercase tracking-tight flex items-center gap-1 truncate">
                        📢 {n.title || "COMMUNIQUÉ"}
                      </span>
                      <span className="text-[8px] text-slate-400 font-mono shrink-0">
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-600 leading-normal font-bold whitespace-pre-line mt-1">
                      {n.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* TABS SEPARATOR CATEGORIES */}
        <div className="bg-white p-1.5 rounded-2xl border border-orange-100/80 shadow-sm grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              setActiveTab('recharge');
              setStatusFilter('all');
            }}
            className={`py-3.5 rounded-xl font-sans font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-2.5 cursor-pointer ${
              activeTab === 'recharge' 
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <ArrowDownLeft className={`w-4.5 h-4.5 ${activeTab === 'recharge' ? 'text-white' : 'text-emerald-500'}`} />
            <span>1. Recharges</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('retrait');
              setStatusFilter('all');
            }}
            className={`py-3.5 rounded-xl font-sans font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-2.5 cursor-pointer ${
              activeTab === 'retrait' 
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <ArrowUpRight className={`w-4.5 h-4.5 ${activeTab === 'retrait' ? 'text-white' : 'text-rose-500'}`} />
            <span>2. Retraits</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('achat');
              setStatusFilter('all');
            }}
            className={`py-3.5 rounded-xl font-sans font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-2.5 cursor-pointer ${
              activeTab === 'achat' 
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className={`w-4.5 h-4.5 ${activeTab === 'achat' ? 'text-white' : 'text-purple-500'}`} />
            <span>3. Achats</span>
          </button>
        </div>

        {/* SEARCH AND FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeTab === 'recharge' ? "Rechercher par opérateur, référence..." :
                activeTab === 'retrait' ? "Rechercher par numéro, opérateur..." :
                "Rechercher par formule..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-orange-100 rounded-2xl pl-10 pr-4 py-3 text-xs md:text-sm focus:outline-none focus:border-orange-400 font-medium"
            />
          </div>

          <div className="flex items-center space-x-2 bg-white px-3 py-2 border border-orange-100 rounded-2xl">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-bold font-sans text-slate-700 focus:outline-none pr-3"
            >
              <option value="all">Statut: Tous</option>
              {activeTab !== 'achat' ? (
                <>
                  <option value="pending">En attente ⏳</option>
                  <option value="approved">Validé ✅</option>
                  <option value="rejected">Refusé ❌</option>
                </>
              ) : (
                <>
                  <option value="approved">Actif 🟢</option>
                  <option value="completed">Terminé ✔️</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* RESULT CONTAINER */}
        <div className="bg-white border border-orange-100/80 rounded-3xl shadow-sm overflow-hidden min-h-[250px]">
          
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-3">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center">
                <Clock className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <p className="font-sans font-black text-sm text-slate-800">Aucune opération trouvée</p>
                <p className="text-xs text-slate-400 max-w-sm">
                  Il n’y a aucun historique correspondant à vos critères ou de type{' '}
                  <span className="font-bold underline text-orange-500">
                    type = {activeTab}
                  </span>.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-orange-50 font-sans font-black text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest select-none">
                    <th className="py-4 px-4 sm:px-6">Date & ID</th>
                    <th className="py-4 px-4">Détails de l’opération</th>
                    <th className="py-4 px-4 text-right">Montant ({getCurrency()})</th>
                    <th className="py-4 px-4 sm:px-6 text-right">Statut / Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-50/50 text-xs">
                  
                  {/* RECHARGE TAB ROWS */}
                  {activeTab === 'recharge' && (filteredItems as Deposit[]).map((dep) => (
                    <tr key={dep.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 sm:px-6 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="font-mono font-medium text-[11px]">{formatDate(dep.createdAt)}</span>
                        </div>
                        <div className="font-mono text-[9px] text-slate-400">ID: {dep.id}</div>
                      </td>
                      <td className="py-4 px-4 space-y-1">
                        <div className="font-sans font-bold text-slate-850 flex items-center gap-1.5">
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                            type = recharge
                          </span>
                          <span>{dep.operator}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Réf: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700 text-[10px]">{dep.reference || 'Aucune'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-mono font-black text-emerald-600 text-[13px]">
                          +{dep.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        {dep.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-black text-[10px] uppercase border border-emerald-100">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Validé
                          </span>
                        )}
                        {dep.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-black text-[10px] uppercase border border-amber-100">
                            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                            En attente
                          </span>
                        )}
                        {dep.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full font-black text-[10px] uppercase border border-rose-100">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Refusé
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* RETRAIT TAB ROWS */}
                  {activeTab === 'retrait' && (filteredItems as Withdrawal[]).map((wth) => (
                    <tr key={wth.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 sm:px-6 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="font-mono font-medium text-[11px]">{formatDate(wth.createdAt)}</span>
                        </div>
                        <div className="font-mono text-[9px] text-slate-400">ID: {wth.id}</div>
                      </td>
                      <td className="py-4 px-4 space-y-1">
                        <div className="font-sans font-bold text-slate-850 flex items-center gap-1.5">
                          <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                            type = retrait
                          </span>
                          <span>{wth.operator}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Compte: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700 text-[10px]">{wth.number}</span>
                        </div>
                        {wth.fee && wth.fee > 0 ? (
                          <div className="text-[10px] text-slate-400 font-medium">
                            Frais: {wth.fee.toLocaleString()} F | Net payé: {wth.netAmount?.toLocaleString() || (wth.amount - wth.fee).toLocaleString()} F
                          </div>
                        ) : null}
                        {wth.proof_file_url ? (
                          <div className="pt-1.5 flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-400 font-bold">Mon justificatif :</span>
                            {wth.proof_file_url.startsWith("data:application/pdf") ? (
                              <a 
                                href={wth.proof_file_url} 
                                download={`justificatif-${wth.id}.pdf`}
                                className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[9px] font-black font-mono transition-all flex items-center gap-1 cursor-pointer"
                                title="Télécharger Justificatif PDF"
                              >
                                📄 PDF
                              </a>
                            ) : (
                              <a 
                                href={wth.proof_file_url} 
                                download={`justificatif-${wth.id}.png`}
                                className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[9px] font-black font-mono transition-all flex items-center gap-1 cursor-pointer inline-flex"
                                title="Télécharger Justificatif Image"
                              >
                                🖼️ Image
                              </a>
                            )}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-mono font-black text-rose-600 text-[13px]">
                          -{wth.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        {wth.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-black text-[10px] uppercase border border-emerald-100">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Validé
                          </span>
                        )}
                        {wth.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-black text-[10px] uppercase border border-amber-100">
                            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                            En attente
                          </span>
                        )}
                        {wth.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full font-black text-[10px] uppercase border border-rose-100">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Refusé
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* ACHAT TAB ROWS */}
                  {activeTab === 'achat' && (filteredItems as Investment[]).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 sm:px-6 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="font-mono font-medium text-[11px]">{formatDate(inv.createdAt)}</span>
                        </div>
                        <div className="font-mono text-[9px] text-slate-400">ID: {inv.id}</div>
                      </td>
                      <td className="py-4 px-4 space-y-1">
                        <div className="font-sans font-bold text-slate-850 flex items-center gap-1.5">
                          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                            type = achat
                          </span>
                          <span>Formule {inv.productName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium leading-relaxed">
                          Revenu: <span className="font-bold text-emerald-600">+{inv.dailyReturn.toLocaleString()} F / jour</span><br />
                          Durée: <span className="text-slate-700 font-semibold">{inv.durationDays} jours</span> (Plan actuel: Jour {inv.daysPassed}/{inv.durationDays})
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-mono font-black text-purple-600 text-[13px]">
                          {inv.price.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        {inv.status === 'active' && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-black text-[10px] uppercase border border-emerald-100">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Actif
                          </span>
                        )}
                        {inv.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-black text-[10px] uppercase border border-slate-200">
                            <CheckCircle className="w-3 h-3 text-slate-500" />
                            Terminé
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* SECURITY REASSURANCE BADGES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs select-none">
          <div className="bg-slate-100 rounded-2xl p-4.5 flex items-start gap-3.5 border border-slate-200/50">
            <Wallet className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h5 className="font-bold text-slate-800 font-sans uppercase text-[10px] tracking-wide">Intégrité des Transactions</h5>
              <p className="text-slate-500 text-[11px] leading-relaxed">Toutes vos opérations sont sécurisées. Les recharges et les retraits de fonds sont validés individuellement par l'administrateur système.</p>
            </div>
          </div>
          <div className="bg-orange-50/50 rounded-2xl p-4.5 flex items-start gap-3.5 border border-orange-100/50">
            <RefreshCw className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h5 className="font-bold text-slate-800 font-sans uppercase text-[10px] tracking-wide">Calcul des Gains Temporisés</h5>
              <p className="text-slate-500 text-[11px] leading-relaxed">Les retours quotidiens sur vos achats de VIP tombent automatiquement toutes les 24 heures et sont ajoutés instantanément à votre balance de retrait.</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
