import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1]
    }
  }
};

const getVipImage = (vipLevel: number) => {
  switch (vipLevel) {
    case 1:
      return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400';
    case 2:
      return 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400';
    case 3:
      return 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&q=80&w=400';
    case 4:
      return 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400';
    case 5:
      return 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?auto=format&fit=crop&q=80&w=400';
    case 6:
      return 'https://images.unsplash.com/photo-1610312278520-bcc893a3ff1d?auto=format&fit=crop&q=80&w=400';
    case 7:
      return 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&q=80&w=400';
    default:
      return 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&q=80&w=400';
  }
};

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

  // Password change states
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [pwdError, setPwdError] = useState<string>('');
  const [pwdSuccess, setPwdSuccess] = useState<string>('');

  const [chatMessageInput, setChatMessageInput] = useState<string>('');

  // Clipboard copies
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Layout states
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAnnouncementDismissible, setShowAnnouncementDismissible] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('announcement_closed_goldinvest');
    } catch {
      return true;
    }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // MLM sponsorship dynamic calculation based on real user registration tree
  const allUsers = DataStore.getUsers();
  const level1Users = allUsers.filter(u => u.referredBy === userState.id);
  const level1Ids = level1Users.map(u => u.id);
  const level2Users = level1Ids.length > 0 ? allUsers.filter(u => u.referredBy && level1Ids.includes(u.referredBy)) : [];
  const level2Ids = level2Users.map(u => u.id);
  const level3Users = level2Ids.length > 0 ? allUsers.filter(u => u.referredBy && level2Ids.includes(u.referredBy)) : [];
  const totalReferrals = level1Users.length + level2Users.length + level3Users.length;

  // Sync state function from local storage
  const syncDashboardData = () => {
    // Process automatic chronological daily rewards on sync
    DataStore.processAutomaticDailyInstallments();

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

    // Setup periodic check interval to automatically credit of earnings in real-time
    const interval = setInterval(() => {
      const oldBal = userState.balance;
      DataStore.processAutomaticDailyInstallments();
      const fresh = DataStore.getCurrentUser();
      if (fresh && fresh.balance !== oldBal) {
        syncDashboardData();
      }
    }, 5000);

    // Listen to custom automated support response events
    const handleNewMessage = () => {
      syncDashboardData();
    };
    window.addEventListener('gi_new_message', handleNewMessage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('gi_new_message', handleNewMessage);
    };
  }, [currentUser.id, userState.balance]);

  useEffect(() => {
    // Scroll to bottom of support chat when opened or new messages spawn
    if (activeTab === 'profile') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [supportMessages, activeTab]);

  // Copy referral elements
  const getReferralBaseURL = () => {
    const origin = window.location.origin;
    if (!origin || origin.includes('aistudio.google.com')) {
      return 'https://ais-pre-gymdtdpbwifj6pqjbdravq-473372860465.europe-west1.run.app';
    }
    return origin;
  };
  const referralURL = `${getReferralBaseURL()}/?ref=${userState.referralCode}`;
  
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

  // Modify user password from account settings
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!oldPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setPwdError('Veuillez remplir tous les champs.');
      return;
    }

    const currentPwdExpected = userState.password || (userState.role === 'admin' ? 'admin' : 'user123');
    if (oldPassword !== currentPwdExpected) {
      setPwdError("L'ancien mot de passe est incorrect.");
      return;
    }

    if (newPassword.length < 5) {
      setPwdError('Le nouveau mot de passe doit contenir au moins 5 caractères.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPwdError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    if (newPassword === oldPassword) {
      setPwdError("Le nouveau mot de passe doit être différent de l'ancien.");
      return;
    }

    const success = DataStore.changeUserPassword(userState.id, newPassword);
    if (success) {
      setPwdSuccess('Mot de passe mis à jour avec succès !');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      syncDashboardData();
    } else {
      setPwdError('Erreur lors de la mise à jour du mot de passe.');
    }
  };

  // Invest Product Purchase
  const handleBuyProduct = (product: Product) => {
    if (product.isBlocked) {
      alert("Ce plan d'investissement VIP est actuellement bloqué ou suspendu temporairement par l'administration.");
      return;
    }

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

  const handleFastForwardTime = () => {
    DataStore.advanceAllActiveInvestmentsBy24Hours(userState.id);
    syncDashboardData();
    alert("⏱️ Voyage temporel effectué ! Vos plans d'investissement actifs ont vieilli de 24 Heures pour le test. Vos revenus quotidiens correspondants ont été crédités d'office ! Vous pouvez voir votre solde principal s'actualiser.");
  };

  return (
    <div className="min-h-screen bg-[#030611] text-white flex flex-col font-sans w-full max-w-full relative overflow-x-hidden">
      
      {/* GLOW DECORATIONS */}
      <div className="absolute top-0 left-0 w-full max-w-[500px] h-[300px] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* DASHBOARD TOP HEADER */}
      <header className="bg-[#030611]/90 border-b border-yellow-500/15 py-4 px-4 md:px-12 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-full mx-auto flex justify-between items-center">
          
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
        <main className="flex-grow w-full max-w-full px-4 md:px-12 xl:px-20 py-8">
          <AdminPanel 
            currentUser={userState}
            onRefreshData={syncDashboardData}
            onCloseAdmin={() => setIsAdminMode(false)}
          />
        </main>
      ) : (
        /* RENDER SYSTEM USER CHANNELS */
        <main className="flex-grow w-full max-w-full px-2 sm:px-6 md:px-12 xl:px-20 py-3.5 pb-24 overflow-x-hidden">
          
          {/* USER SUMMARY CARDS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">

              {/* WELCOME AREA */}

              {/* PRIMARY GOLD CARD & STATS ROW */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch"
              >
                
                {/* VIP CARD */}
                <motion.div 
                  variants={cardVariants}
                  className="md:col-span-12 lg:col-span-5 bg-gradient-to-tr from-[#0b1229] via-[#101b3a] to-[#040814] rounded-2xl p-4 border border-yellow-500/20 shadow-xl relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Brand mark */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-bl-full pointer-events-none" />
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-yellow-500/80 uppercase font-bold tracking-widest">Compte Courant</span>
                      <h4 className="text-base font-display font-bold text-white mt-0.5">Solde Principal</h4>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      🔑 Premium
                    </div>
                  </div>

                  <div className="my-3.5">
                    <div className="text-3xl font-display font-extrabold text-white tracking-tight">
                      {userState.balance.toLocaleString()} <span className="text-yellow-500 text-sm">FCFA</span>
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1 font-mono flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-yellow-500/80" />
                      <span>Rendement collectable sous 24h</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('deposit')}
                      className="flex-grow py-2.5 rounded-lg text-xs font-bold gold-bg-gradient text-slate-950 hover:opacity-95 transition-all text-center flex items-center justify-center space-x-1 shadow-md shadow-yellow-500/10"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Faire un Dépôt</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('withdraw')}
                      className="flex-grow py-2.5 rounded-lg text-xs font-bold bg-slate-950 hover:bg-slate-900 text-yellow-500 border border-yellow-500/30 transition-all text-center flex items-center justify-center space-x-1"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Retirer</span>
                    </button>
                  </div>
                </motion.div>

                {/* STATS BENTO CARDS */}
                <motion.div 
                  variants={containerVariants}
                  className="md:col-span-12 lg:col-span-7 grid grid-cols-2 gap-3"
                >
                  <motion.div 
                    variants={cardVariants}
                    className="bg-slate-900/40 border border-slate-900 rounded-2xl p-3 flex flex-col justify-between relative"
                  >
                    <div className="w-7 h-7 rounded-md bg-green-500/10 text-green-400 flex items-center justify-center mb-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-300 block uppercase font-bold tracking-wider">Gains Quotidiens</span>
                      <span className="text-lg md:text-xl font-bold font-mono text-green-400 block mt-0.5">+{userState.dailyEarnings.toLocaleString()} F</span>
                      <span className="text-[9px] text-slate-450 block font-mono mt-0.5">Plans actifs</span>
                    </div>
                  </motion.div>

                  <motion.div 
                    variants={cardVariants}
                    className="bg-slate-900/40 border border-slate-900 rounded-2xl p-3 flex flex-col justify-between relative"
                  >
                    <div className="w-7 h-7 rounded-md bg-yellow-500/10 text-yellow-400 flex items-center justify-center mb-1">
                      <Coins className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-300 block uppercase font-bold tracking-wider">Total Récolté</span>
                      <span className="text-lg md:text-xl font-bold font-mono text-white block mt-0.5">{userState.totalEarnings.toLocaleString()} F</span>
                      <span className="text-[9px] text-slate-450 block font-mono mt-0.5">Retirés nets</span>
                    </div>
                  </motion.div>

                  {/* LOYALTY DAILY BUTTON REWARD */}
                  <motion.div 
                    variants={cardVariants}
                    className="bg-gradient-to-br from-yellow-500/5 to-amber-600/5 border border-yellow-500/10 rounded-xl p-3 flex items-center justify-between gap-3 col-span-2 text-left"
                  >
                    <div className="flex-1">
                      <span className="text-[10px] text-yellow-500 block uppercase font-bold">Cadeau Journalier</span>
                      <span className="text-[11px] text-slate-300 block leading-tight">Bonus d'investisseur fidèle.</span>
                    </div>
                    <button
                      onClick={handleDailyCheckin}
                      className="py-1.5 px-3 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider transition-all shadow"
                    >
                      Réclamer +150 F
                    </button>
                  </motion.div>

                </motion.div>
              </motion.div>

              {/* COMPREHENSIVE DIRECT VIP SUGGESTIONS OR ACTIVE INVESTMENTS */}
              <div className="mt-4 pt-1 border-t border-slate-900">
                {activeInvestments.length === 0 ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <h4 className="text-[11px] font-bold text-yellow-500 uppercase tracking-widest">🔥 Packages VIP Recommandés</h4>
                      <button 
                        onClick={() => setActiveTab('products')}
                        className="text-[10px] text-yellow-400 font-bold hover:underline"
                      >
                        Voir tout →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {products.slice(0, 2).map((p) => (
                        <div 
                          key={p.id}
                          className="bg-[#0b1229]/60 border border-yellow-500/10 rounded-2xl p-3 flex flex-col justify-between text-left space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[8px] text-yellow-400 font-bold uppercase bg-yellow-500/10 px-1.5 py-0.5 rounded">Plan VIP {p.vipLevel}</span>
                              <h5 className="font-semibold text-xs text-white mt-1.5 leading-tight">{p.name}</h5>
                            </div>
                            <div className="text-right">
                              <span className="text-[8px] text-slate-400 block font-bold">Investissement</span>
                              <strong className="text-xs text-yellow-400 font-bold leading-tight">{p.price.toLocaleString()} F</strong>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-2 rounded-xl text-[10px] border border-slate-900">
                            <div>
                              <span className="text-slate-400 text-[8px] block uppercase">Revenu / Jour</span>
                              <span className="text-green-400 font-bold font-mono">+{p.dailyReturn.toLocaleString()} F</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[8px] block uppercase">Gains Totaux</span>
                              <span className="text-white font-bold font-mono">{(p.dailyReturn * p.durationDays).toLocaleString()} F</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleBuyProduct(p)}
                            className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-[10px] uppercase font-bold tracking-wider rounded-xl transition-all shadow-md shadow-yellow-500/5 text-center font-sans"
                          >
                            Activer pour {p.price.toLocaleString()} F
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <h4 className="text-[11px] font-bold text-yellow-500 uppercase tracking-widest leading-none">💼 Vos Investissements Actifs ({activeInvestments.length})</h4>
                      <button 
                        onClick={() => setActiveTab('products')}
                        className="text-[10px] text-yellow-400 font-bold hover:underline"
                      >
                        Gérer →
                      </button>
                    </div>

                    <div className="space-y-2">
                      {activeInvestments.slice(0, 3).map((inv) => (
                        <div 
                          key={inv.id}
                          className="bg-[#0b1229]/60 p-3 rounded-2xl border border-yellow-500/10 flex items-center justify-between gap-3 text-left"
                        >
                          <div className="space-y-0.5">
                            <span className="text-[8px] text-yellow-400 font-bold bg-yellow-400/5 border border-yellow-400/15 px-1 rounded uppercase">Plan VIP {inv.productName}</span>
                            <div className="text-[11px] font-semibold text-slate-200">
                              Investi : {inv.price.toLocaleString()} F | Gain/j : <span className="text-green-400 font-bold font-mono">+{inv.dailyReturn.toLocaleString()} F</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Progression : {inv.daysPassed} / {inv.durationDays} Jours
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleClaimReturn(inv.id)}
                            disabled={inv.isClaimedToday || inv.status === 'completed'}
                            className={`py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all shadow ${inv.isClaimedToday || inv.status === 'completed' ? 'bg-slate-950 border border-slate-900 text-slate-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-400 text-slate-950'}`}
                          >
                            {inv.isClaimedToday ? 'Récolté ✔' : 'Récolter'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* CATALOGUE PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="text-center max-w-xl mx-auto mb-2 animate-fade-in">
                <span className="text-[10px] font-bold text-yellow-500 tracking-wider uppercase block mb-0.5">Produits VIP Disponibles</span>
                <h3 className="text-base sm:text-lg font-semibold text-white">Activez des parts d'investissement durables</h3>
              </div>

              {/* STATS: NOMBRE DE PRODUITS À GAUCHE ET REVENU À DROITE */}
              <div className="grid grid-cols-2 gap-2.5 max-w-4xl mx-auto">
                {/* Nombre de produits à gauche */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2 text-left">
                  <div className="w-8 h-8 rounded-md bg-yellow-500/10 text-yellow-400 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block font-semibold">Produits Actifs</span>
                    <span className="text-sm font-bold text-white block">{activeInvestments.length}</span>
                  </div>
                </div>

                {/* Revenu à droite */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2 text-left">
                  <div className="w-8 h-8 rounded-md bg-green-500/10 text-green-400 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block font-semibold">Revenu Quotidien</span>
                    <span className="text-sm font-bold text-green-400 block">+{userState.dailyEarnings.toLocaleString()} F</span>
                  </div>
                </div>
              </div>

              {/* ACTIVE INVESTMENTS REAPING IF ANY */}
              {activeInvestments.length > 0 && (
                <div className="max-w-4xl mx-auto bg-slate-900/20 border border-slate-900 rounded-2xl p-3 mb-2 text-left">
                  <div className="mb-2">
                    <h4 className="text-xs font-bold text-yellow-500 tracking-wider">Collecte active de vos dividendes</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">Cliquez sur récolter pour verser vos gains disponibles.</p>
                  </div>
                  <div className="space-y-2">
                    {activeInvestments.map((inv) => (
                      <div 
                        key={inv.id}
                        className="bg-slate-900/60 p-2.5 rounded-xl border border-yellow-500/10 hover:border-yellow-500/20 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                      >
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-yellow-400 font-bold">Module VIP {inv.productName}</span>
                          <div className="text-[11px] font-semibold text-slate-200">
                            Investi : {inv.price.toLocaleString()} F | Gain/j : <span className="text-green-400">+{inv.dailyReturn.toLocaleString()} F</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Progression : {inv.daysPassed} / {inv.durationDays} Jours
                          </div>
                        </div>

                        <div>
                          {inv.status === 'completed' ? (
                            <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-semibold rounded-lg block text-center">
                              Cycle complété
                            </span>
                          ) : (
                            <button
                              onClick={() => handleClaimReturn(inv.id)}
                              className="px-3 py-1.5 bg-green-500 hover:bg-green-400 text-slate-950 text-[10px] font-bold rounded-lg transition-all shadow-md flex items-center space-x-1 cursor-pointer"
                            >
                              <Coins className="w-3 h-3" />
                              <span>Récolter ({inv.dailyReturn} F)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-w-7xl mx-auto">
                {products.map((p) => {
                  const isBlocked = p.isBlocked === true;
                  const formattedReopenTime = p.reopenDateTime 
                    ? new Date(p.reopenDateTime).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                    : null;

                  return (
                    <div 
                      key={p.id}
                      className={`bg-[#0b1229]/60 border rounded-xl overflow-hidden shadow-xl text-left flex flex-col justify-between group relative transition-all duration-200 ${isBlocked ? 'opacity-70 border-red-500/40' : 'border-yellow-500/25 hover:border-yellow-500/40'}`}
                    >
                      {/* Product Header */}
                      <div className="p-2 sm:p-2.5 border-b border-yellow-500/10">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] sm:text-[9px] text-yellow-400 font-bold">Plan VIP {p.vipLevel}</span>
                          {isBlocked ? (
                            <span className="text-[8px] bg-red-500/20 border border-red-500/40 text-red-400 font-bold px-1 py-0.5 rounded uppercase">Clos</span>
                          ) : p.tag ? (
                            <span className="text-[8px] bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-bold px-1 py-0.5 rounded truncate max-w-[65px]">{p.tag}</span>
                          ) : null}
                        </div>
                        <h4 className="text-xs font-semibold text-white mt-1 leading-tight">{p.name}</h4>
                      </div>

                      {/* Fluid image under the header */}
                      <div className="w-full h-14 sm:h-18 overflow-hidden relative bg-slate-950 border-b border-yellow-500/5">
                        <img 
                           src={getVipImage(p.vipLevel)} 
                          alt={p.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      </div>

                      {/* Compact Price / Required amount */}
                      <div className="p-1.5 text-center bg-slate-950/40 border-b border-yellow-500/5">
                        <span className="text-[9px] text-slate-400 block font-bold">Montant requis</span>
                        <strong className="text-xs sm:text-sm font-bold text-white block mt-0.5">
                          {p.price.toLocaleString()} <span className="text-[9px] text-yellow-400 font-bold">F</span>
                        </strong>
                      </div>

                      {/* Stats Table */}
                      <div className="p-2 space-y-1 text-[10px] sm:text-[11px] text-slate-200 flex-1">
                        <div className="flex justify-between pb-0.5 border-b border-slate-900/65">
                          <span className="text-slate-300">Revenu :</span>
                          <span className="text-green-400 font-bold">+{p.dailyReturn.toLocaleString()} F / j</span>
                        </div>
                        <div className="flex justify-between pb-0.5 border-b border-slate-900/65">
                          <span className="text-slate-300">Cycle :</span>
                          <span className="text-yellow-400 font-bold">{p.durationDays} jrs</span>
                        </div>
                        <div className="flex justify-between font-bold pt-0.5">
                          <span className="text-slate-200">Gain :</span>
                          <span className="text-white bg-yellow-500/10 px-1 py-0.5 rounded text-[9px] font-bold border border-yellow-500/10">
                            {(p.dailyReturn * p.durationDays).toLocaleString()} F
                          </span>
                        </div>
                        
                        {isBlocked && (
                          <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-1 mt-1 text-center">
                            <span className="block text-red-400 font-bold text-[8px] tracking-wide">Fermé</span>
                            {formattedReopenTime ? (
                              <span className="block text-[7px] text-slate-300">
                                {formattedReopenTime}
                              </span>
                            ) : null}
                          </div>
                        )}
                      </div>

                      {/* Compact Bottom Button wrapper */}
                      <div className="p-2 pt-0">
                        <button
                          onClick={() => handleBuyProduct(p)}
                          disabled={isBlocked}
                          className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition-all duration-150 tracking-wider ${isBlocked ? 'bg-[#0f152d] border border-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-500/15 to-amber-600/15 border border-yellow-500/25 text-yellow-400 hover:from-yellow-400 hover:to-amber-500 hover:text-slate-950 hover:border-yellow-400'}`}
                        >
                          {isBlocked ? 'Suspendu' : "Activer"}
                         </button>
                      </div>
                    </div>
                  );
                })}
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
            <div className="space-y-3 max-w-7xl mx-auto">
              
              {/* BRAND ADVOCATE HEADER */}
              <div className="bg-[#0b1229]/60 backdrop-blur-md p-3.5 border border-yellow-500/10 rounded-xl text-left grid grid-cols-1 md:grid-cols-4 gap-3.5">
                <div className="md:col-span-2 space-y-1 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-yellow-500 font-mono tracking-widest uppercase block">PROFIL PARRAIN</span>
                  <h3 className="text-base font-display font-bold text-white">Encouragez vos Équipes MLM</h3>
                  <p className="text-[11px] text-slate-300 leading-snug">Distribuez votre lien personnel et gagnez Niveau 1 : 20%, Niveau 2 : 3% et Niveau 3 : 1% sur les investissements de votre réseau.</p>
                </div>
 
                {/* Copy blocks */}
                <div className="md:col-span-2 space-y-2 bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 flex flex-col justify-center">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Code Sponsor Unique :</span>
                    <div className="flex bg-slate-900 border border-slate-850 p-1.5 rounded-md justify-between items-center">
                      <span className="font-mono text-xs font-bold text-yellow-400">{userState.referralCode}</span>
                      <button
                        onClick={handleCopyCode}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Copier le code"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
 
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Lien d'Affiliation Directe :</span>
                    <div className="flex bg-slate-900 border border-slate-850 p-1.5 rounded-md justify-between items-center gap-2">
                      <span className="font-mono text-[9px] text-slate-200 truncate flex-1">{referralURL}</span>
                      <button
                        onClick={handleCopyLink}
                        className="p-1 text-slate-400 hover:text-white transition-colors flex-shrink-0"
                        title="Copier le lien"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
 
              {/* COMMISSIONS OVERVIEW CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-left">
                <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-2.5">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Total Filleuls</span>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">
                    {totalReferrals} membres
                  </div>
                  <span className="text-[8px] text-slate-500 block mt-0.5">Membres actifs</span>
                </div>
 
                <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-2.5">
                  <span className="text-[9px] text-green-450 uppercase font-bold tracking-wider font-sans block">Niveau 1 (20%)</span>
                  <div className="text-sm font-bold font-mono text-green-400 mt-0.5">
                    {commissions.filter(c => c.level === 1).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} F
                  </div>
                  <span className="text-[8px] text-slate-500 block mt-0.5">1er cercle</span>
                </div>
 
                <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-2.5">
                  <span className="text-[9px] text-yellow-500 uppercase font-bold tracking-wider font-sans block">Niveau 2 (3%)</span>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">
                    {commissions.filter(c => c.level === 2).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} F
                  </div>
                  <span className="text-[8px] text-slate-500 block mt-0.5">2e cercle</span>
                </div>
 
                <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-2.5">
                  <span className="text-[9px] text-blue-400 uppercase font-bold tracking-wider font-sans block">Niveau 3 (1%)</span>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">
                    {commissions.filter(c => c.level === 3).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} F
                  </div>
                  <span className="text-[8px] text-slate-500 block mt-0.5">3e cercle</span>
                </div>
              </div>
 
              {/* MLM COMMISSIONS HISTORY TABULATED */}
              <div className="bg-[#0b1229]/40 border border-yellow-500/10 rounded-xl p-3 text-left">
                <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider mb-2">Historique des Royalties</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] text-slate-300 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase bg-slate-950/20 text-left">
                        <th className="p-2">Filleul</th>
                        <th className="p-2">Niveau MLM</th>
                        <th className="p-2 font-mono text-yellow-400">Gain</th>
                        <th className="p-2">Date</th>
                        <th className="p-2">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-3 text-center text-slate-400 text-xs">Aucune commission créditée pour l'instant. Invitez vos amis.</td>
                        </tr>
                      ) : (
                        commissions.map((c) => (
                          <tr key={c.id} className="border-b border-slate-900/40 hover:bg-slate-900/10 text-left">
                            <td className="p-2 font-semibold text-white">{c.fromUserName}</td>
                            <td className="p-2">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono ${c.level === 1 ? 'bg-green-500/10 text-green-400 border border-green-500/30' : c.level === 2 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'}`}>
                                LEVEL {c.level}
                              </span>
                            </td>
                            <td className="p-2 font-bold font-mono text-green-400">+{c.amount.toLocaleString()} F</td>
                            <td className="p-2 text-slate-400 text-[10px]">{new Date(c.createdAt).toLocaleDateString()}</td>
                            <td className="p-2">
                              <span className="text-slate-400 text-[9px] font-semibold">● Crédité</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* LIVE NETWORK STRUCTURE - DIRECT REFERRED USERS */}
              <div className="bg-[#0b1229]/40 border border-yellow-500/10 rounded-xl p-4 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>👥</span>
                    <span>Vos Filleuls Directs (Niveau 1)</span>
                  </h3>
                  <span className="text-[10px] bg-yellow-500/15 border border-yellow-500/35 px-2 py-0.5 rounded-md text-yellow-400 font-bold font-mono">
                    {level1Users.length} inscrit(s)
                  </span>
                </div>

                {level1Users.length === 0 ? (
                  <p className="text-[11px] text-slate-450 leading-relaxed text-center py-4 bg-slate-950/10 rounded-lg">
                    Vous n'avez pas encore de filleuls inscrits directement avec votre code de parrainage. Partagez votre lien d'invitation pour commencer à multiplier vos gains !
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {level1Users.map(u => (
                      <div key={u.id} className="p-3 bg-slate-950/80 border border-slate-900 rounded-xl flex flex-col justify-between hover:border-yellow-500/25 transition-all">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-100 text-xs truncate">{u.name}</span>
                            <span className="text-[9px] font-mono text-slate-500 uppercase">ID: {u.id.substring(0, 6)}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1">Sponsorisé le : {new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-900 flex justify-between items-center text-[10px]">
                          <span className="text-slate-450 italic">{u.country}</span>
                          <a 
                            href={`https://wa.me/${u.whatsapp.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-green-400 font-semibold flex items-center space-x-1 hover:text-green-350 transition-colors"
                          >
                            <span>💬 WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* USER PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto w-full space-y-4 text-left">
              
              <div className="bg-slate-900/40 p-4 border border-slate-900 rounded-xl relative">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-slate-950 font-bold text-base">
                    {userState.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-base text-white">{userState.name}</h3>
                    <span className="text-xs text-slate-400 font-mono"> WhatsApp : {userState.whatsapp}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1 text-xs">
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
              <div className="bg-slate-900/40 p-4 border border-slate-900 rounded-xl">
                <h4 className="font-display font-bold text-[11px] text-yellow-500 uppercase tracking-widest mb-1.5">Saisir un Code Bonus</h4>
                
                {bonusError && <div className="p-2 mb-2 bg-red-400/10 border border-red-500/20 rounded-lg text-[10px] text-red-200">{bonusError}</div>}
                {bonusSuccess && <div className="p-2 mb-2 bg-green-400/10 border border-green-500/20 rounded-lg text-[10px] text-green-300 font-semibold">{bonusSuccess}</div>}

                <form onSubmit={submitBonusCode} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: GOLD777, WELCOME500"
                    value={bonusCodeInput}
                    onChange={(e) => setBonusCodeInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-600 font-mono tracking-wider focus:outline-none uppercase"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-display font-bold text-[11px] uppercase tracking-wider rounded-lg transition-all"
                  >
                    Appliquer
                  </button>
                </form>
              </div>

              {/* PASSWORD CHANGE BOX */}
              <div className="bg-slate-900/40 p-4 border border-slate-900 rounded-xl">
                <h4 className="font-display font-bold text-[11px] text-yellow-500 uppercase tracking-widest mb-2">🔑 Modifier Votre Mot de Passe</h4>

                {pwdError && <div className="p-2 mb-2 bg-red-400/10 border border-red-500/20 rounded-lg text-[10px] text-red-200">{pwdError}</div>}
                {pwdSuccess && <div className="p-2 mb-2 bg-green-400/10 border border-green-500/20 rounded-lg text-[10px] text-green-300 font-semibold">{pwdSuccess}</div>}

                <form onSubmit={handlePasswordChange} className="space-y-2 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-0.5 uppercase tracking-wider text-[8px]">Ancien mot de passe</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5 uppercase tracking-wider text-[8px]">Nouveau mot de passe</label>
                    <input
                      type="password"
                      placeholder="Minimum 5 caractères"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-650 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5 uppercase tracking-wider text-[8px]">Nouveau de passe (confirmation)</label>
                    <input
                      type="password"
                      placeholder="Confirm"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-display font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all"
                  >
                    Enregistrer
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
