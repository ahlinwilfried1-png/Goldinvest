import React, { useState, useEffect } from 'react';
import { User, Deposit, Withdrawal, Investment, SystemNotification, Commission } from '../types';
import { DataStore, syncWithBackend } from '../dataStore';
import { 
  ArrowLeft, 
  ArrowDownLeft, 
  ArrowUpRight, 
  PlusCircle,
  ArrowUpCircle,
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
  Bell,
  Gift,
  TrendingUp
} from 'lucide-react';

interface HistoriquePageProps {
  user: User;
  onNavigate: (path: string) => void;
}

export default function HistoriquePage({ user, onNavigate }: HistoriquePageProps) {
  const [activeTab, setActiveTab] = useState<'recharge' | 'retrait' | 'achat' | 'commission' | 'revenu'>('recharge');
  
  // Data lists corresponding to the types
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed'>('all');

  // Notifications state
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

    // 4. Commissions
    const allComms = DataStore.getCommissions().filter(c => c.userId === user.id);
    setCommissions(allComms);

    // 5. Notifications
    const allNotifs = DataStore.getNotifications().filter(n => n.userId === undefined || n.userId === user.id);
    setNotifs(allNotifs);
  };

  const getRevenuItems = () => {
    const list: any[] = [];
    investments.forEach(inv => {
      const createdTime = new Date(inv.createdAt).getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      for (let d = 1; d <= inv.daysPassed; d++) {
        const claimTime = createdTime + d * oneDayMs;
        list.push({
          id: `rev-${inv.id}-${d}`,
          investmentId: inv.id,
          productName: inv.productName,
          amount: inv.dailyReturn,
          createdAt: new Date(claimTime).toISOString(),
          dayNumber: d
        });
      }
    });
    // Trier par date décroissante
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
    } else if (activeTab === 'achat') {
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
    } else if (activeTab === 'commission') {
      return commissions.filter(item => {
        const matchesSearch = item.fromUserName.toLowerCase().includes(term) || 
                             item.amount.toString().includes(term) ||
                             `niveau ${item.level}`.includes(term);
        return matchesSearch;
      });
    } else {
      return getRevenuItems().filter(item => {
        const matchesSearch = item.productName.toLowerCase().includes(term) || 
                             item.amount.toString().includes(term);
        return matchesSearch;
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
        
        {/* TABS SEPARATOR CATEGORIES */}
        <div className="bg-white p-1.5 rounded-2xl border border-orange-100/80 shadow-sm flex overflow-x-auto whitespace-nowrap scrollbar-none gap-2 md:grid md:grid-cols-4">
          <button
            onClick={() => {
              setActiveTab('recharge');
              setStatusFilter('all');
            }}
            className={`flex-1 md:flex-initial py-3 px-4 sm:py-3.5 rounded-xl font-sans font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all flex flex-row items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'recharge' 
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <PlusCircle className={`w-4 h-4 shrink-0 ${activeTab === 'recharge' ? 'text-white' : 'text-emerald-500'}`} />
            <span>1. Recharges</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('retrait');
              setStatusFilter('all');
            }}
            className={`flex-1 md:flex-initial py-3 px-4 sm:py-3.5 rounded-xl font-sans font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all flex flex-row items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'retrait' 
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <ArrowUpCircle className={`w-4 h-4 shrink-0 ${activeTab === 'retrait' ? 'text-white' : 'text-rose-500'}`} />
            <span>2. Retraits</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('achat');
              setStatusFilter('all');
            }}
            className={`flex-1 md:flex-initial py-3 px-4 sm:py-3.5 rounded-xl font-sans font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all flex flex-row items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'achat' 
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className={`w-4 h-4 shrink-0 ${activeTab === 'achat' ? 'text-white' : 'text-purple-500'}`} />
            <span>3. Achats</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('revenu');
              setStatusFilter('all');
            }}
            className={`flex-1 md:flex-initial py-3 px-4 sm:py-3.5 rounded-xl font-sans font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all flex flex-row items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'revenu' 
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <TrendingUp className={`w-4 h-4 shrink-0 ${activeTab === 'revenu' ? 'text-white' : 'text-blue-500'}`} />
            <span>4. Revenus</span>
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
                activeTab === 'achat' ? "Rechercher par formule..." :
                activeTab === 'commission' ? "Rechercher par parrainage, filleul..." :
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
              disabled={activeTab === 'commission' || activeTab === 'revenu'}
            >
              <option value="all">Statut: Tous</option>
              {activeTab === 'recharge' || activeTab === 'retrait' ? (
                <>
                  <option value="pending">En attente ⏳</option>
                  <option value="approved">Validé ✅</option>
                  <option value="rejected">Refusé ❌</option>
                </>
              ) : activeTab === 'achat' ? (
                <>
                  <option value="approved">Actif 🟢</option>
                  <option value="completed">Terminé ✔️</option>
                </>
              ) : (
                <option value="all">Non applicable</option>
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
                    {activeTab !== 'retrait' && activeTab !== 'recharge' && <th className="py-4 px-4">Détails de l’opération</th>}
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

                  {/* COMMISSION TAB ROWS */}
                  {activeTab === 'commission' && (filteredItems as Commission[]).map((comm) => (
                    <tr key={comm.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 sm:px-6 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="font-mono font-medium text-[11px]">{formatDate(comm.createdAt)}</span>
                        </div>
                        <div className="font-mono text-[9px] text-slate-400">ID: {comm.id}</div>
                      </td>
                      <td className="py-4 px-4 space-y-1">
                        <div className="font-sans font-bold text-slate-850 flex items-center gap-1.5 flex-wrap">
                          <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                            type = commission
                          </span>
                          <span>Parrainage de {comm.fromUserName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-bold">
                          Filleul direct de <span className="text-orange-600 font-extrabold">Niveau {comm.level}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-mono font-black text-orange-600 text-[13px]">
                          +{comm.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-black text-[10px] uppercase border border-emerald-100">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Crédité
                        </span>
                      </td>
                    </tr>
                  ))}

                  {/* REVENU TAB ROWS */}
                  {activeTab === 'revenu' && (filteredItems as any[]).map((rev) => (
                    <tr key={rev.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 sm:px-6 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="font-mono font-medium text-[11px]">{formatDate(rev.createdAt)}</span>
                        </div>
                        <div className="font-mono text-[9px] text-slate-400">ID: {rev.id}</div>
                      </td>
                      <td className="py-4 px-4 space-y-1">
                        <div className="font-sans font-bold text-slate-850 flex items-center gap-1.5 flex-wrap">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                            type = revenu
                          </span>
                          <span>Formule {rev.productName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-bold">
                          Versement journalier : <span className="text-blue-600">Jour {rev.dayNumber}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-mono font-black text-blue-600 text-[13px]">
                          +{rev.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-black text-[10px] uppercase border border-emerald-100">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Récolté
                        </span>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* SECURITY REASSURANCE BADGES MOVED OR REMOVED AT USER REQUEST */}

      </main>
    </div>
  );
}
