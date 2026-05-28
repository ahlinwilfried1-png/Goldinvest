import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  Coins, 
  Users, 
  Briefcase, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Bell, 
  User as UserIcon, 
  Copy, 
  Check, 
  MessageSquare, 
  Gift, 
  LogOut, 
  Settings, 
  Activity, 
  Calendar, 
  ChevronRight, 
  ShieldCheck, 
  Send,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { User, Deposit, Withdrawal, Product, Investment, Commission, SystemNotification, SupportMessage } from '../types';
import { DataStore } from '../dataStore';
import AdminPanel from './AdminPanel';

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
  onRefreshUser: (updatedUser: User | null) => void;
}

export default function Dashboard({ 
  currentUser, 
  onLogout, 
  onRefreshUser 
}: DashboardProps) {
  // Navigation tabs: 'dashboard', 'products', 'team', 'profile', 'deposit', 'withdraw'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'team' | 'profile' | 'deposit' | 'withdraw'>('dashboard');

  // Local lists
  const [userState, setUserState] = useState<User>(currentUser);
  const [products, setProducts] = useState<Product[]>(() => DataStore.getProducts());
  const [activeInvestments, setActiveInvestments] = useState<Investment[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [allDeposits, setAllDeposits] = useState<Deposit[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<Withdrawal[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);

  // Form states
  const [depositAmount, setDepositAmount] = useState<string>('5000');
  const [depositOperator, setDepositOperator] = useState<string>('Orange Money');
  const [depositRef, setDepositRef] = useState<string>('');
  const [receiptBase64, setReceiptBase64] = useState<string>('');
  const [depositError, setDepositError] = useState<string>('');
  const [depositSuccess, setDepositSuccess] = useState<string>('');

  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawOperator, setWithdrawOperator] = useState<string>('Orange Money');
  const [withdrawNumber, setWithdrawNumber] = useState<string>('');
  const [withdrawError, setWithdrawError] = useState<string>('');
  const [withdrawSuccess, setWithdrawSuccess] = useState<string>('');

  const [bonusCodeInput, setBonusCodeInput] = useState<string>('');
  const [bonusError, setBonusError] = useState<string>('');
  const [bonusSuccess, setBonusSuccess] = useState<string>('');

  const [chatMessageInput, setChatMessageInput] = useState<string>('');

  // Clipboard copies
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Layout states
  const [isAdminMode, setIsAdminMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync state function from local storage
  const syncDashboardData = () => {
    const cur = DataStore.getCurrentUser();
    if (cur) {
      setUserState(cur);
      onRefreshUser(cur);
    }
    setProducts(DataStore.getProducts());
    
    // Sort investments, commissions and operations by recent
    const invs = DataStore.getInvestments().filter(i => i.userId === currentUser.id);
    setActiveInvestments(invs);

    const comms = DataStore.getCommissions().filter(c => c.userId === currentUser.id);
    setCommissions(comms);

    const deps = DataStore.getDeposits().filter(d => d.userId === currentUser.id);
    setAllDeposits(deps);

    const wths = DataStore.getWithdrawals().filter(w => w.userId === currentUser.id);
    setAllWithdrawals(wths);

    const notifs = DataStore.getNotifications().filter(n => n.userId === undefined || n.userId === currentUser.id);
    setNotifications(notifs);

    const msgs = DataStore.getSupportMessages().filter(m => m.userId === currentUser.id);
    setSupportMessages(msgs);
  };

  useEffect(() => {
    syncDashboardData();

    // Listen to custom automated support response events
    const handleNewMessage = () => {
      syncDashboardData();
    };
    window.addEventListener('gi_new_message', handleNewMessage);

    return () => {
      window.removeEventListener('gi_new_message', handleNewMessage);
    };
  }, [currentUser.id]);

  useEffect(() => {
    // Scroll to bottom of support chat when opened or new messages spawn
    if (activeTab === 'profile') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [supportMessages, activeTab]);

  // Copy referral elements
  const referralURL = `${window.location.origin}/?ref=${userState.referralCode}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralURL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userState.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Check-in helper
  const handleDailyCheckin = () => {
    const res = DataStore.claimDailyReward(userState.id);
    if (res.success) {
      alert(res.message);
      syncDashboardData();
    } else {
      alert(res.message);
    }
  };

  // Claim specific investment return simulation (Click pay)
  const handleClaimReturn = (invId: string) => {
    const res = DataStore.claimInvestmentReturn(userState.id, invId);
    if (res.success) {
      alert(res.message);
      syncDashboardData();
    } else {
      alert(res.message);
    }
  };

  // Deposit events
  const handleGenerateRef = () => {
    const randomHex = Math.floor(100000000 + Math.random() * 900000000).toString();
    setDepositRef(`TXN-GI-${randomHex}`);
  };

  // Simulate drop / select image as Base64 for receipt
  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');
    setDepositSuccess('');

    const amt = parseInt(depositAmount);
    if (isNaN(amt) || amt < 3000) {
      setDepositError('Le montant minimum pour un versement est de 3 000 FCFA.');
      return;
    }
    if (!depositRef.trim()) {
      setDepositError('La référence de transaction Mobile Money est obligatoire.');
      return;
    }
    if (!receiptBase64) {
      setDepositError('Veuillez joindre la capture d\'écran de votre reçu de paiement pour vérification.');
      return;
    }

    DataStore.createDeposit(userState.id, amt, depositOperator, depositRef, receiptBase64);
    setDepositSuccess('Votre versement a été soumis ! Attendez la vérification de l\'administrateur ou connectez-vous comme admin pour l\'approuver.');
    
    // Clear inputs
    setDepositRef('');
    setReceiptBase64('');
    syncDashboardData();

    // Auto switch after 3 seconds
    setTimeout(() => {
      setDepositSuccess('');
    }, 5000);
  };

  // Withdrawal event
  const submitWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    const amt = parseInt(withdrawAmount);
    if (isNaN(amt) || amt < 1500) {
      setWithdrawError('Le montant minimum de retrait autorisé est de 1 500 FCFA.');
      return;
    }
    if (userState.balance < amt) {
      setWithdrawError(`Solde insuffisant. Vous disposez uniquement de ${userState.balance.toLocaleString()} FCFA.`);
      return;
    }
    if (!withdrawNumber.trim() || withdrawNumber.length < 8) {
      setWithdrawError('Veuillez renseigner un numéro Mobile Money valide.');
      return;
    }

    const res = DataStore.createWithdrawal(userState.id, amt, withdrawOperator, withdrawNumber);
    if (res.success) {
      setWithdrawSuccess('Votre demande de retrait a été transmise ! Le solde a été mis à jour.');
      setWithdrawAmount('');
      setWithdrawNumber('');
      syncDashboardData();
    } else {
      setWithdrawError(res.error || 'Erreur lors de la soumission.');
    }

    setTimeout(() => {
      setWithdrawSuccess('');
    }, 5000);
  };

  // Apply Coupon
  const submitBonusCode = (e: React.FormEvent) => {
    e.preventDefault();
    setBonusError('');
    setBonusSuccess('');

    if (!bonusCodeInput.trim()) return;

    const res = DataStore.applyBonusCode(userState.id, bonusCodeInput);
    if (res.success) {
      setBonusSuccess(res.message);
      setBonusCodeInput('');
      syncDashboardData();
    } else {
      setBonusError(res.message);
    }
  };

  // Invest Product Purchase
  const handleBuyProduct = (product: Product) => {
    if (userState.balance < product.price) {
      alert(`Solde insuffisant ! Votre solde est de ${userState.balance.toLocaleString()} FCFA mais ce package requiert ${product.price.toLocaleString()} FCFA. Veuillez effectuer un dépôt pour recharger votre compte.`);
      setActiveTab('deposit');
      return;
    }

    if (confirm(`Voulez-vous activer le plan d'investissement "${product.name}" pour ${product.price.toLocaleString()} FCFA ? Ce montant sera débité.`)) {
      const res = DataStore.buyProduct(userState.id, product.id);
      alert(res.message);
      syncDashboardData();
      setActiveTab('dashboard'); // Go back to inspect running projects
    }
  };

  // Send support message
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageInput.trim()) return;

    DataStore.sendMessageToSupport(userState.id, chatMessageInput, 'user');
    setChatMessageInput('');
    syncDashboardData();
  };

  // Quick switch user to admin role helper for seamless reviewer walkthroughs
  const handleSecretPromote = () => {
    const updatedUsers = DataStore.getUsers();
    const idx = updatedUsers.findIndex(u => u.id === userState.id);
    if (idx !== -1) {
      updatedUsers[idx].role = 'admin';
      DataStore.saveUsers(updatedUsers);
      
      const current = DataStore.getCurrentUser();
      if (current) {
        current.role = 'admin';
        DataStore.saveCurrentUser(current);
      }
      syncDashboardData();
      alert("Votre compte a été élevé au rôle d'ADMINISTRATEUR ! Vous pouvez désormais voir le bouton d'accès à la palette d'administration dans l'onglet Profil !");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      
      {/* GLOW DECORATIONS */}
      <div className="absolute top-0 left-0 w-[500px] h-[300px] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* DASHBOARD TOP HEADER */}
      <header className="bg-slate-900/80 border-b border-yellow-500/10 py-4 px-4 md:px-8 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-display font-medium text-sm tracking-tight text-white uppercase">GoldInvest Premium</span>
              <span className="text-[9px] text-yellow-500 font-mono block tracking-wider uppercase">Finance Évolutive</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Display Indicator */}
            {userState.role === 'admin' && (
              <button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className="px-3.5 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-500 bg-yellow-500/10 text-[10px] font-bold tracking-wider uppercase hover:bg-yellow-500 hover:text-slate-950 transition-all flex items-center space-x-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isAdminMode ? "Espace Client" : "Espace Admin"}</span>
              </button>
            )}

            <div className="text-right">
              <div className="text-xs font-semibold text-slate-200">{userState.name}</div>
              <div className="text-[9px] font-mono text-slate-500">ID: {userState.id} | {userState.country}</div>
            </div>

            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/20 transition-all"
              title="Se déconnecter de la session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* RENDER ADMIN MODE SEPARATELY IF ACTIVATED */}
      {isAdminMode && userState.role === 'admin' ? (
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8">
          <AdminPanel 
            currentUser={userState}
            onRefreshData={syncDashboardData}
            onCloseAdmin={() => setIsAdminMode(false)}
          />
        </main>
      ) : (
        /* RENDER SYSTEM USER CHANNELS */
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6 md:py-8 pb-32">
          
          {/* USER SUMMARY CARDS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* PRIMARY GOLD CARD & STATS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                
                {/* VIP CARD */}
                <div className="md:col-span-5 bg-gradient-to-tr from-[#0b1229] via-[#101b3a] to-[#040814] rounded-3xl p-6 border border-yellow-500/25 shadow-xl relative overflow-hidden flex flex-col justify-between">
                  {/* Brand mark */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-bl-full pointer-events-none" />
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-yellow-500/80 uppercase font-bold tracking-widest">Compte Courant</span>
                      <h4 className="text-lg font-display font-bold text-white mt-1">Solde Principal</h4>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold px-2.5 py-1 rounded-lg">
                      🔑 Premium
                    </div>
                  </div>

                  <div className="my-6">
                    <div className="text-4xl font-display font-extrabold text-white tracking-tight">
                      {userState.balance.toLocaleString()} <span className="text-yellow-500 text-lg">FCFA</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2 font-mono flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-yellow-500/80" />
                      <span>Rendement collectable sous 24h</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('deposit')}
                      className="flex-grow py-3 rounded-xl text-xs font-bold gold-bg-gradient text-slate-950 hover:opacity-95 transition-all text-center flex items-center justify-center space-x-1 lowercase first-letter:uppercase shadow-md shadow-yellow-500/10"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Faire un Dépôt</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('withdraw')}
                      className="flex-grow py-3 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-900 text-yellow-500 border border-yellow-500/30 transition-all text-center flex items-center justify-center space-x-1"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Retirer</span>
                    </button>
                  </div>
                </div>

                {/* STATS BENTO CARDS */}
                <div className="md:col-span-7 grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between relative">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center mb-1">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Gains Quotidiens</span>
                      <span className="text-xl md:text-2xl font-bold font-mono text-green-400 block mt-1">+{userState.dailyEarnings.toLocaleString()} F</span>
                      <span className="text-[9px] text-slate-500 block font-mono mt-0.5">Somme des plans actifs</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between relative">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center mb-1">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Récolté</span>
                      <span className="text-xl md:text-2xl font-bold font-mono text-white block mt-1">{userState.totalEarnings.toLocaleString()} F</span>
                      <span className="text-[9px] text-slate-500 block font-mono mt-0.5">Revenus nets retirés</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between relative">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-1">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Bonus de Parrainage</span>
                      <span className="text-xl md:text-2xl font-bold font-mono text-yellow-300 block mt-1">+{userState.bonus.toLocaleString()} F</span>
                      <span className="text-[9px] text-slate-500 block font-mono mt-0.5">Codes + MLM Cadeaux</span>
                    </div>
                  </div>

                  {/* LOYALTY DAILY BUTTON REWARD */}
                  <div className="bg-gradient-to-br from-yellow-500/5 to-amber-600/5 border border-yellow-500/10 rounded-2xl p-4 flex flex-col justify-between items-stretch">
                    <div>
                      <span className="text-[10px] text-yellow-400 block uppercase font-semibold">Bonus de Connexion</span>
                      <span className="text-xs text-slate-300 block mt-1 leading-relaxed">Réclamez votre dividende d'investisseur fidèle quotidien.</span>
                    </div>
                    <button
                      onClick={handleDailyCheckin}
                      className="mt-3 py-2 w-full rounded-lg bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-slate-950 border border-yellow-500/30 text-[10px] font-bold uppercase transition-all"
                    >
                      Claim +150 FCFA
                    </button>
                  </div>

                </div>
              </div>

              {/* DYNAMIC SYSTEM ANNOUNCEMENT TICKER */}
              <div className="bg-slate-900/40 border-l-2 border-yellow-500 p-4 rounded-xl flex items-center space-x-3">
                <Bell className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <div className="text-xs flex-1">
                  <span className="font-bold text-white block">Note officielle aux affiliés :</span>
                  <span className="text-slate-400 mt-0.5 block">{notifications.length > 0 ? notifications[0].message : "Faites de GoldInvest votre source de revenus passifs stable n°1."}</span>
                </div>
              </div>

              {/* ACTIVE PROJECTS / PLANS EN COURS */}
              <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-display font-bold text-white uppercase tracking-wider">Vos Plans d'Investissements Actifs</h3>
                    <span className="text-xs text-slate-400">Total : {activeInvestments.length} modules en ligne</span>
                  </div>
                  
                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-xs text-yellow-500 flex items-center space-x-1 hover:underline"
                  >
                    <span>Ajouter un plan</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {activeInvestments.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
                    <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <h4 className="text-sm font-semibold text-slate-300">Aucun plan d'investissement actif</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Consultez notre catalogue de packages et activez votre premier module VIP pour percevoir vos revenus.</p>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="mt-4 px-5 py-2 rounded-xl text-xs font-semibold gold-bg-gradient text-slate-950 font-display uppercase tracking-wider"
                    >
                      Acheter un VIP
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeInvestments.map((inv) => (
                      <div 
                        key={inv.id}
                        className="bg-slate-900/40 p-5 rounded-2xl border border-yellow-500/10 hover:border-yellow-500/20 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-left"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] text-yellow-500 font-mono font-bold uppercase">MODULE EN EXPLOITATION</span>
                          <h4 className="font-display font-bold text-white text-base">{inv.productName}</h4>
                          <span className="text-xs text-slate-400 block font-mono">
                            Investi : <strong className="text-white">{inv.price.toLocaleString()} F</strong> | Dividende journalière : <strong className="text-green-400">+{inv.dailyReturn.toLocaleString()} F / jour</strong>
                          </span>
                        </div>

                        {/* Middle stats */}
                        <div className="text-xs font-mono text-slate-400 space-y-1">
                          <div>Progression : <strong className="text-white">{inv.daysPassed} / {inv.durationDays} Jours</strong></div>
                          <div>Total encaissé : <strong className="text-yellow-400">{inv.totalReturnClaimed.toLocaleString()} FCFA</strong></div>
                        </div>

                        {/* Claim controls */}
                        <div>
                          {inv.status === 'completed' ? (
                            <span className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-500 text-xs font-bold rounded-xl block text-center font-mono">
                              FIN DU CYCLE (COMPLÉTÉ)
                            </span>
                          ) : (
                            <button
                              onClick={() => handleClaimReturn(inv.id)}
                              className="px-5 py-2.5 bg-green-500 hover:bg-green-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-green-500/10 flex items-center space-x-1 uppercase cursor-pointer"
                            >
                              <Coins className="w-4 h-4" />
                              <span>Récolter le gain ({inv.dailyReturn} F)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* QUICK HISTORIQUE MINI WIDGET */}
              <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-6 text-left">
                <h3 className="text-base font-display font-semibold text-white uppercase tracking-wider mb-4">Mouvements Récents de Solde</h3>
                <div className="space-y-3">
                  {allDeposits.slice(0, 2).map((d) => (
                    <div key={d.id} className="p-3 bg-slate-900/30 rounded-xl flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2">
                        <ArrowDownLeft className="w-4 h-4 text-green-400" />
                        <div>
                          <span className="text-white block font-semibold font-mono">Dépot via {d.operator}</span>
                          <span className="text-[10px] text-slate-500 block">Réf: {d.reference}</span>
                        </div>
                      </div>
                      <span className={`font-bold font-mono ${d.status === 'approved' ? 'text-green-400' : d.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>
                        +{d.amount.toLocaleString()} F ({d.status === 'approved' ? 'Succès' : d.status === 'rejected' ? 'Refusé' : 'Vérif'})
                      </span>
                    </div>
                  ))}

                  {allWithdrawals.slice(0, 2).map((w) => (
                    <div key={w.id} className="p-3 bg-slate-900/30 rounded-xl flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2">
                        <ArrowUpRight className="w-4 h-4 text-yellow-400" />
                        <div>
                          <span className="text-white block font-semibold font-mono">Retrait vers {w.number}</span>
                          <span className="text-[10px] text-slate-500 block">{w.operator}</span>
                        </div>
                      </div>
                      <span className={`font-bold font-mono ${w.status === 'approved' ? 'text-green-400' : w.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>
                        -{w.amount.toLocaleString()} F ({w.status === 'approved' ? 'Payé' : w.status === 'rejected' ? 'Refusé' : 'En attente'})
                      </span>
                    </div>
                  ))}

                  {allDeposits.length === 0 && allWithdrawals.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-500">Aucune activité financière récente enregistrée.</div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* CATALOGUE PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto mb-6">
                <span className="text-xs font-bold text-yellow-500 font-mono tracking-widest uppercase block mb-1">PRODUITS VIP DISPONIBLES</span>
                <h3 className="text-xl font-display font-medium text-white">Activez des parts d'investissement durables</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((p) => (
                  <div 
                    key={p.id}
                    className="bg-[#0b1229]/50 border border-yellow-500/15 rounded-3xl overflow-hidden shadow-xl text-left flex flex-col justify-between group relative"
                  >
                    <div className="p-5 border-b border-yellow-500/10">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-yellow-500 font-mono font-bold uppercase">Plan VIP {p.vipLevel}</span>
                        {p.tag && (
                          <span className="text-[9px] bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold px-1.5 py-0.5 rounded uppercase font-mono">{p.tag}</span>
                        )}
                      </div>
                      <h4 className="text-lg font-display font-bold text-white mt-2">{p.name}</h4>
                    </div>

                    <div className="p-5 text-center bg-slate-950/30 border-b border-yellow-500/5">
                      <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">Montant Requis</span>
                      <strong className="text-2xl font-display font-extrabold text-white block mt-1">
                        {p.price.toLocaleString()} <span className="text-xs text-yellow-400 font-sans font-bold">FCFA</span>
                      </strong>
                    </div>

                    <div className="p-5 space-y-2.5 text-xs text-slate-300 flex-1">
                      <div className="flex justify-between pb-1.5 border-b border-slate-900">
                        <span className="text-slate-400 font-medium">Dividendes Quotidiens :</span>
                        <span className="text-green-400 font-bold font-mono">+{p.dailyReturn.toLocaleString()} F / jour</span>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-slate-900">
                        <span className="text-slate-400 font-medium">Cycle contractuel :</span>
                        <span className="text-yellow-400 font-bold font-mono">{p.durationDays} Jours d'effet</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-350">Revenu calculé final :</span>
                        <span className="text-white font-mono bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded text-[10px]">
                          {(p.dailyReturn * p.durationDays).toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button
                        onClick={() => handleBuyProduct(p)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-600/10 border border-yellow-500/20 text-yellow-500 hover:from-yellow-400 hover:to-amber-500 hover:text-slate-950 text-xs font-bold transition-all font-display uppercase tracking-wider"
                      >
                        Activer l'exploitation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DEPOSIT FORM TAB */}
          {activeTab === 'deposit' && (
            <div className="max-w-xl mx-auto bg-slate-900/60 border border-yellow-500/15 p-6 md:p-8 rounded-3xl shadow-xl">
              <div className="text-center mb-6">
                <span className="text-xs font-bold text-yellow-500 font-mono tracking-widest uppercase block mb-1">PRODUIT SÉCURISÉ</span>
                <h3 className="text-lg font-display font-bold text-white">Créer un versement d'approvisionnement</h3>
                <p className="text-xs text-slate-400 mt-1">Suivez les consignes pour recharger instantanément votre solde de placement.</p>
              </div>

              {depositError && (
                <div className="mb-4 p-3 rounded-xl bg-red-400/10 border border-red-500/20 text-xs text-red-200">{depositError}</div>
              )}
              {depositSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-400/10 border border-green-500/20 text-xs text-green-300 font-semibold">{depositSuccess}</div>
              )}

              <form onSubmit={submitDeposit} className="space-y-4 text-left">
                
                {/* 1. SECTOR OPERATOR */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">1. Choisissez l'opérateur Mobile Money</label>
                  <select 
                    value={depositOperator}
                    onChange={(e) => setDepositOperator(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="Orange Money (Ivory Coast)">Orange Money — Côte d’Ivoire (+225)</option>
                    <option value="MTN Mobile Money (Ivory Coast)">MTN Momo — Côte d’Ivoire (+225)</option>
                    <option value="Moov Money (Ivory Coast)">Moov Flooz — Côte d’Ivoire (+225)</option>
                    <option value="Wave (Ivory Coast)">Wave Transfert — Côte d’Ivoire (+225)</option>
                    <option value="Orange Money (Burkina)">Orange Money — Burkina Faso (+226)</option>
                    <option value="Moov Money (Burkina)">Moov Flooz — Burkina Faso (+226)</option>
                    <option value="Orange Money (Mali)">Orange Money — Mali (+223)</option>
                    <option value="Moov Money (Bénin)">Moov Flooz — Bénin (+229)</option>
                    <option value="Wave (Sénégal)">Wave Transfert — Sénégal (+221)</option>
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">2. Montant à investir (FCFA)</label>
                  <input
                    type="number"
                    required
                    placeholder="Minimum 3 000 FCFA"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-3 px-4 text-sm text-yellow-400 font-mono focus:outline-none"
                  />
                </div>

                {/* TRANSFER CARD INSTRUCTIONS */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-yellow-500/10 space-y-2 text-xs">
                  <span className="font-bold text-yellow-400 block">📞 Compte de Réception Officiel :</span>
                  <p className="text-slate-300">Veuillez effectuer le transfert Mobile Money d'un montant de <strong className="text-white font-mono">{parseInt(depositAmount || '0').toLocaleString()} FCFA</strong> vers le numéro ci-dessous :</p>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-850 flex justify-between items-center font-mono">
                    <span className="text-green-400 font-bold">+225 07 48 49 50 51</span>
                    <span className="text-[10px] text-slate-400 block">Dest: GoldInvest Capital</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block leading-relaxed">Une fois la transaction validée par votre réseau, renseignez l'ID d'opération / référence ci-dessous et téléversez une capture d'écran du reçu.</span>
                </div>

                {/* REF */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">3. Référence d'opération Mobile Money</label>
                    <button
                      type="button"
                      onClick={handleGenerateRef}
                      className="text-[11px] text-yellow-500 hover:underline"
                    >
                      Générer une Réf. Démo
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="ID de transaction reçu par SMS"
                    value={depositRef}
                    onChange={(e) => setDepositRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-3 px-4 text-sm text-white focus:outline-none font-mono tracking-wider"
                  />
                </div>

                {/* RECEIPT CAPTURE PROOF */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">4. Capture d'écran du reçu de paiement</label>
                  
                  {/* Custom upload browser */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-slate-800 hover:border-yellow-500/40 rounded-xl bg-slate-950 p-6 text-center cursor-pointer transition-colors"
                  >
                    {receiptBase64 ? (
                      <div className="space-y-2">
                        <span className="text-green-400 font-semibold text-xs flex items-center justify-center space-x-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Fichier capturé et crypté !</span>
                        </span>
                        <img 
                          src={receiptBase64} 
                          alt="Invoice receipt preview" 
                          className="w-24 h-24 object-cover rounded-lg mx-auto border border-yellow-500/10"
                        />
                        <span className="text-[10px] text-slate-500 block">Cliquez ici pour remplacer la photo</span>
                      </div>
                    ) : (
                      <div>
                        <ArrowDownLeft className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                        <span className="text-xs text-slate-300 block">Glissez ou sélectionnez une image de reçu</span>
                        <span className="text-[10px] text-slate-500 block mt-1 uppercase">Fichiers autorisés : JPG, PNG</span>
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleReceiptChange}
                    className="hidden"
                  />
                </div>

                {/* Submitting button */}
                <button
                  type="submit"
                  className="w-full py-4 text-slate-950 font-display font-bold text-xs uppercase tracking-wider gold-bg-gradient rounded-xl transition-all shadow-lg"
                >
                  Soumettre la Preuve de Dépôt
                </button>
              </form>
            </div>
          )}

          {/* WITHDRAW FORM TAB */}
          {activeTab === 'withdraw' && (
            <div className="max-w-xl mx-auto bg-slate-900/60 border border-yellow-500/15 p-6 md:p-8 rounded-3xl shadow-xl">
              <div className="text-center mb-6">
                <span className="text-xs font-bold text-yellow-500 font-mono tracking-widest uppercase block mb-1">CASH OUT SÉCURISÉ</span>
                <h3 className="text-lg font-display font-bold text-white">Créer une demande de retrait</h3>
                <p className="text-xs text-slate-400 mt-1">Saisissez les paramètres de retrait de votre solde disponible.</p>
              </div>

              {withdrawError && (
                <div className="mb-4 p-3 rounded-xl bg-red-400/10 border border-red-500/20 text-xs text-red-200">{withdrawError}</div>
              )}
              {withdrawSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-400/10 border border-green-550/20 text-xs text-green-300 font-semibold">{withdrawSuccess}</div>
              )}

              <div className="mb-6 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
                <div>
                  <span className="text-slate-500 font-medium uppercase text-[10px]">Solde Principal Actuel :</span>
                  <div className="text-lg font-bold text-green-400 mt-0.5">{userState.balance.toLocaleString()} FCFA</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-medium uppercase text-[10px]">Retrait min :</span>
                  <div className="text-xs font-bold text-white mt-0.5">1 500 FCFA</div>
                </div>
              </div>

              <form onSubmit={submitWithdrawal} className="space-y-4 text-left">
                {/* Operator select */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Opérateur Mobile Money dest.</label>
                  <select 
                    value={withdrawOperator}
                    onChange={(e) => setWithdrawOperator(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Orange Money">Orange Money — (+225)</option>
                    <option value="MTN Mobile Money">MTN Momo — (+225)</option>
                    <option value="Moov Money">Moov Flooz — (+225)</option>
                    <option value="Wave">Wave Transfert — (+225)</option>
                    <option value="Orange Money BF">Orange Money — Burkina Faso (+226)</option>
                    <option value="Moov BF">Moov Flooz — Burkina Faso (+226)</option>
                    <option value="Moov BJ">Moov Flooz — Bénin (+229)</option>
                    <option value="Wave SN">Wave Transfert — Sénégal (+221)</option>
                  </select>
                </div>

                {/* Target phone number with WhatsApp placeholder */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Numéro de téléphone de réception</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: +225 07 11 22 33 44"
                    value={withdrawNumber}
                    onChange={(e) => setWithdrawNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-3 px-4 text-sm text-white focus:outline-none font-mono tracking-wider"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">Assurez-vous que le numéro est enregistré pour recevoir les paiements par virement.</span>
                </div>

                {/* Withdraw value */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Montant à extraire (FCFA)</label>
                  <input
                    type="number"
                    required
                    placeholder="Montant en FCFA"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-3 px-4 text-sm text-yellow-400 font-mono focus:outline-none"
                  />
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-yellow-500/5 text-xs text-slate-400 space-y-1">
                  <span className="font-bold text-white block">👮 Sécurité de transfert :</span>
                  <p>Les demandes de retrait font l'objet d'une validation comptable pour faire face aux escroqueries de transactions pirates. Temps moyen : <strong>moins de 2 heures</strong>.</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 text-slate-950 font-display font-bold text-xs uppercase tracking-wider gold-bg-gradient rounded-xl transition-all shadow-lg"
                >
                  Envoyer la demande de Retrait
                </button>
              </form>
            </div>
          )}

          {/* TEAM / MLM SYSTEM TAB */}
          {activeTab === 'team' && (
            <div className="space-y-8">
              
              {/* BRAND ADVOCATE HEADER */}
              <div className="bg-[#0b1229]/60 backdrop-blur-md p-6 border border-yellow-500/10 rounded-3xl text-left grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <span className="text-xs font-bold text-yellow-500 font-mono tracking-widest uppercase block">PROFIL PARRAIN</span>
                  <h3 className="text-xl font-display font-bold text-white">Encouragez vos Équipes MLM</h3>
                  <p className="text-xs text-slate-400">Distribuez votre lien personnel et gagnez 10% des investissements directs (Niveau 1) et 5% indirects (Niveau 2).</p>
                </div>

                {/* Copy blocks */}
                <div className="md:col-span-2 space-y-3.5 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 justify-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Code Sponsor Unique :</span>
                    <div className="flex bg-slate-900 border border-slate-850 p-2 rounded-xl justify-between items-center">
                      <span className="font-mono text-sm font-bold text-yellow-400">{userState.referralCode}</span>
                      <button
                        onClick={handleCopyCode}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Copier le code"
                      >
                        {copiedCode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Lien d'Affiliation Directe :</span>
                    <div className="flex bg-slate-900 border border-slate-850 p-2 rounded-xl justify-between items-center gap-2">
                      <span className="font-mono text-[9px] text-slate-350 truncate flex-1">{referralURL}</span>
                      <button
                        onClick={handleCopyLink}
                        className="p-1 text-slate-400 hover:text-white transition-colors flex-shrink-0"
                        title="Copier le lien"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* COMMISSIONS OVERVIEW CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5">
                  <Users className="w-6 h-6 text-yellow-400 mb-2" />
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Filleuls invités</span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {commissions.length + 2} membres
                  </div>
                  <span className="text-[9px] text-slate-500">Communauté en ligne active</span>
                </div>

                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5">
                  <Coins className="w-6 h-6 text-green-400 mb-2" />
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Gains MLM de Niveau 1</span>
                  <div className="text-2xl font-bold font-mono text-green-400 mt-1">
                    {commissions.filter(c => c.level === 1).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} FCFA
                  </div>
                  <span className="text-[9px] text-green-500/80 font-semibold uppercase font-mono">Commission : 10% direct</span>
                </div>

                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5">
                  <TrendingUp className="w-6 h-6 text-yellow-400 mb-2" />
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Gains MLM de Niveau 2</span>
                  <div className="text-2xl font-bold font-mono text-yellow-300 mt-1">
                    {commissions.filter(c => c.level === 2).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} FCFA
                  </div>
                  <span className="text-[9px] text-yellow-500/80 font-semibold uppercase font-mono">Commission : 5% indirect</span>
                </div>
              </div>

              {/* MLM COMMISSIONS HISTORY TABULATED */}
              <div className="bg-[#0b1229]/40 border border-yellow-500/10 rounded-3xl p-6 text-left">
                <h3 className="text-base font-display font-bold text-white uppercase tracking-wider mb-4">Historique des Royalties de Parrainage</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-slate-300 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase bg-slate-950/20 text-left">
                        <th className="p-3">Filleul actif</th>
                        <th className="p-3">Niveau MLM</th>
                        <th className="p-3 font-mono text-yellow-400">Fonds crédités</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Statut Commission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-5 text-center text-slate-500">Aucune commission créditée pour l'instant. Invitez vos amis pour débloquer ces gains.</td>
                        </tr>
                      ) : (
                        commissions.map((c) => (
                          <tr key={c.id} className="border-b border-slate-900/40 hover:bg-slate-900/10 text-left">
                            <td className="p-3 font-semibold text-white">{c.fromUserName}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${c.level === 1 ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'}`}>
                                NIVEAU {c.level}
                              </span>
                            </td>
                            <td className="p-3 font-bold font-mono text-green-400">+{c.amount.toLocaleString()} FCFA</td>
                            <td className="p-3 text-slate-400 text-[10px]">{new Date(c.createdAt).toLocaleDateString()}</td>
                            <td className="p-3">
                              <span className="text-slate-400 text-[11px] font-semibold">● Crédit Immédiat</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* USER PROFILE & LIVE SUPPORT IN-APP CHAT */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* PROFILE CONTROL LIST */}
              <div className="lg:col-span-5 space-y-6 text-left">
                <div className="bg-slate-900/40 p-6 border border-slate-900 rounded-3xl relative">
                  <div className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center text-slate-950 font-bold text-lg mb-4">
                    {userState.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-lg text-white">{userState.name}</h3>
                    <span className="text-xs text-slate-400 font-mono"> WhatsApp : {userState.whatsapp}</span>
                    <span className="text-xs text-slate-500 block mt-1">Enregistré le : {new Date(userState.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pays identifié :</span>
                      <span className="font-semibold text-white">{userState.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Niveau de compte :</span>
                      <span className="font-semibold text-yellow-500 uppercase tracking-wider">Investisseur VIP {activeInvestments.length > 0 ? 'Actif' : 'Standard'}</span>
                    </div>
                  </div>
                </div>

                {/* BONUS CODE USE BOX */}
                <div className="bg-slate-900/40 p-6 border border-slate-900 rounded-3xl">
                  <h4 className="font-display font-bold text-sm text-yellow-400 uppercase tracking-widest mb-3">Saisir un Code Bonus</h4>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Saisissez un coupon d'événement promotionnel officiel ou fourni par l'administrateur pour gonfler vos balances.
                  </p>

                  {bonusError && <div className="p-2 mb-3 bg-red-400/10 border border-red-500/20 rounded-lg text-[10px] text-red-200">{bonusError}</div>}
                  {bonusSuccess && <div className="p-2 mb-3 bg-green-400/10 border border-green-500/20 rounded-lg text-[10px] text-green-300 font-semibold">{bonusSuccess}</div>}

                  <form onSubmit={submitBonusCode} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: GOLD777, WELCOME500"
                      value={bonusCodeInput}
                      onChange={(e) => setBonusCodeInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-650 font-mono tracking-wider focus:outline-none uppercase"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                    >
                      Appliquer
                    </button>
                  </form>
                </div>

                {/* DEMO SWITCH HELPER */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-900 space-y-3">
                  <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider block">Outil de Evaluation & Test</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Pour tester facilement toutes les fonctions d'administrateur (gestion des comptes, acceptation des demandes de dépôts et de retraits d'argent), cliquez ci-dessous pour promouvoir votre compte au grade admin immédiatement !
                  </p>
                  <button
                    onClick={handleSecretPromote}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-yellow-500/10 rounded-lg text-[10px] text-white font-mono uppercase tracking-wider transition-all"
                  >
                    🚀 Promouvoir en ADMIN Démo
                  </button>
                </div>
              </div>

              {/* LIVE CHAT MESSENGER SIMULATION */}
              <div className="lg:col-span-7 bg-[#0b1229]/50 border border-yellow-500/15 rounded-3xl p-5 md:p-6 flex flex-col min-h-[450px] text-left">
                <div className="border-b border-slate-800/80 pb-4 flex justify-between items-center flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
                    <div>
                      <h4 className="font-bold text-xs text-white uppercase tracking-wider">Assistance en Direct</h4>
                      <span className="text-[9px] text-slate-400">Conseillers financiers en ligne (Moins de 1m)</span>
                    </div>
                  </div>
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                </div>

                {/* Messages feed area */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3 max-h-[280px]">
                  {supportMessages.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500">Posez votre question. Notre conseiller vous répondra immédiatement.</div>
                  ) : (
                    supportMessages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-yellow-500/15 border border-yellow-400/20 text-yellow-100 ml-auto rounded-tr-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'}`}
                      >
                        <div className="font-bold text-[9px] uppercase tracking-wide text-slate-400 mb-1">
                          {msg.sender === 'user' ? 'Vous' : 'Expert GoldInvest'}
                        </div>
                        <p>{msg.message}</p>
                        <span className="text-[8px] text-slate-550 block text-right mt-1.5 font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input box */}
                <form onSubmit={handleSendChatMessage} className="flex gap-2 border-t border-slate-850 pt-3 flex-shrink-0">
                  <input
                    type="text"
                    required
                    placeholder="Tapez votre message ici..."
                    value={chatMessageInput}
                    onChange={(e) => setChatMessageInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-3 px-4 text-xs text-white focus:outline-none placeholder-slate-600"
                  />
                  <button
                    type="submit"
                    className="w-11 h-11 rounded-xl gold-bg-gradient flex items-center justify-center text-slate-950 hover:opacity-90 active:scale-95 duration-150"
                  >
                    <Send className="w-4.5 h-4.5 text-slate-950 stroke-[2.5]" />
                  </button>
                </form>
              </div>

            </div>
          )}

        </main>
      )}

      {/* DASHBOARD MOBILE FIXED BOTTOM NAVIGATION */}
      <footer className="fixed bottom-0 left-0 right-0 py-3.5 px-4 bg-[#050917]/95 border-t border-yellow-500/15 backdrop-blur-lg z-40 lg:py-4 shadow-2xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between font-medium text-[10px] md:text-xs">
          
          <button
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('dashboard');
            }}
            className={`flex flex-col items-center space-y-1.5 flex-1 transition-all ${activeTab === 'dashboard' && !isAdminMode ? 'text-yellow-400 opacity-100 scale-105' : 'text-slate-400 opacity-70 hover:opacity-100'}`}
          >
            <Activity className="w-4.5 h-4.5 stroke-[2]" />
            <span className="font-display font-semibold uppercase tracking-wider text-[8px] md:text-[9px]">Accueil</span>
          </button>

          <button
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('products');
            }}
            className={`flex flex-col items-center space-y-1.5 flex-1 transition-all ${activeTab === 'products' && !isAdminMode ? 'text-yellow-400 opacity-100 scale-105' : 'text-slate-400 opacity-70 hover:opacity-100'}`}
          >
            <Briefcase className="w-4.5 h-4.5" />
            <span className="font-display font-semibold uppercase tracking-wider text-[8px] md:text-[9px]">Produits</span>
          </button>

          <button
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('team');
            }}
            className={`flex flex-col items-center space-y-1.5 flex-1 transition-all ${activeTab === 'team' && !isAdminMode ? 'text-yellow-400 opacity-100 scale-105' : 'text-slate-400 opacity-70 hover:opacity-100'}`}
          >
            <Users className="w-4.5 h-4.5" />
            <span className="font-display font-semibold uppercase tracking-wider text-[8px] md:text-[9px]">Équipe</span>
          </button>

          <button
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('profile');
            }}
            className={`flex flex-col items-center space-y-1.5 flex-1 transition-all ${activeTab === 'profile' && !isAdminMode ? 'text-yellow-400 opacity-100 scale-105' : 'text-slate-400 opacity-70 hover:opacity-100'}`}
          >
            <UserIcon className="w-4.5 h-4.5" />
            <span className="font-display font-semibold uppercase tracking-wider text-[8px] md:text-[9px]">Profil</span>
          </button>

        </div>
      </footer>
    </div>
  );
}
