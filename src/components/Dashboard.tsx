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
  AlertCircle,
  Headphones
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
  const [referralListTab, setReferralListTab] = useState<'level1' | 'level2' | 'level3'>('level1');

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
  const [simulationStatus, setSimulationStatus] = useState<string>('');
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
  
  const myIdUpper = userState.id.toUpperCase();
  const myCodeUpper = userState.referralCode ? userState.referralCode.trim().toUpperCase() : '';
  const myPhoneDigits = userState.whatsapp ? userState.whatsapp.replace(/\D/g, '') : '';

  const level1Users = allUsers.filter(u => {
    if (!u.referredBy) return false;
    const refClean = u.referredBy.trim().toUpperCase();
    const refDigits = refClean.replace(/\D/g, '');

    if (refClean === myIdUpper) return true;
    if (myCodeUpper && refClean === myCodeUpper) return true;
    if (myPhoneDigits && refDigits && (myPhoneDigits.endsWith(refDigits) || refDigits.endsWith(myPhoneDigits))) {
      return true;
    }
    return false;
  });

  const level1IdsUpper = level1Users.map(u => u.id.toUpperCase());
  const level1CodesUpper = level1Users.map(u => u.referralCode ? u.referralCode.trim().toUpperCase() : '').filter(Boolean);
  const level1WhatsAppDigits = level1Users.map(u => u.whatsapp ? u.whatsapp.replace(/\D/g, '') : '').filter(Boolean);

  const level2Users = (level1IdsUpper.length > 0 || level1CodesUpper.length > 0 || level1WhatsAppDigits.length > 0)
    ? allUsers.filter(u => {
        if (!u.referredBy) return false;
        const refClean = u.referredBy.trim().toUpperCase();
        const refDigits = refClean.replace(/\D/g, '');

        if (level1IdsUpper.includes(refClean) || level1CodesUpper.includes(refClean)) return true;
        if (refDigits && level1WhatsAppDigits.some(d => d.endsWith(refDigits) || refDigits.endsWith(d))) {
          return true;
        }
        return false;
      })
    : [];

  const level2IdsUpper = level2Users.map(u => u.id.toUpperCase());
  const level2CodesUpper = level2Users.map(u => u.referralCode ? u.referralCode.trim().toUpperCase() : '').filter(Boolean);
  const level2WhatsAppDigits = level2Users.map(u => u.whatsapp ? u.whatsapp.replace(/\D/g, '') : '').filter(Boolean);

  const level3Users = (level2IdsUpper.length > 0 || level2CodesUpper.length > 0 || level2WhatsAppDigits.length > 0)
    ? allUsers.filter(u => {
        if (!u.referredBy) return false;
        const refClean = u.referredBy.trim().toUpperCase();
        const refDigits = refClean.replace(/\D/g, '');

        if (level2IdsUpper.includes(refClean) || level2CodesUpper.includes(refClean)) return true;
        if (refDigits && level2WhatsAppDigits.some(d => d.endsWith(refDigits) || refDigits.endsWith(d))) {
          return true;
        }
        return false;
      })
    : [];

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
    setSimulationStatus("⏱️ Succès : Le temps a avancé de 24 Heures ! Vos revenus quotidiens ont été automatiquement crédités.");
    setTimeout(() => {
      setSimulationStatus('');
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1b64d9] to-[#03368a] text-white flex flex-col font-sans w-full max-w-full relative overflow-x-hidden">
      
      {/* SHIMMER BACKGROUND DECORATIONS */}
      <div className="absolute top-0 left-0 w-full max-w-[800px] h-[500px] bg-white/5 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse" />

      {/* DASHBOARD TOP HEADER */}
      <header className="bg-gradient-to-r from-[#1b64d9] to-[#044ab0] border-b border-white/10 py-5 px-4 md:px-12 sticky top-0 z-40 shadow-xl">
        <div className="max-w-full mx-auto flex justify-between items-center">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f7b03b] to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/15">
              <TrendingUp className="w-5.5 h-5.5 text-slate-900 stroke-[3]" />
            </div>
            <div>
              <span className="font-display font-black text-lg md:text-xl tracking-wide text-white block uppercase">GOLDINVEST ROYAL</span>
              <span className="text-[10px] text-amber-300 font-mono block tracking-widest uppercase font-bold">Finance Évolutive</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Display Indicator */}
            {userState.role === 'admin' && (
              <button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className="px-4 py-2 rounded-xl border-2 border-amber-400 bg-amber-400/10 text-amber-300 text-xs font-black tracking-wider uppercase hover:bg-amber-400 hover:text-slate-900 transition-all flex items-center space-x-1.5 shadow-md"
              >
                <ShieldCheck className="w-4.5 h-4.5 font-bold" />
                <span>{isAdminMode ? "Espace Client" : "Espace Admin"}</span>
              </button>
            )}

            <div className="text-right hidden sm:block">
              <div className="text-sm font-extrabold text-white tracking-wide">{userState.name}</div>
              <div className="text-[10px] font-mono text-white/70">ID: {userState.id} | {userState.country}</div>
            </div>

            <button
              onClick={onLogout}
              className="p-3 rounded-xl bg-white/10 hover:bg-red-500/20 border border-white/15 text-white hover:text-red-350 transition-all shadow-inner"
              title="Se déconnecter de la session"
            >
              <LogOut className="w-4.5 h-4.5 stroke-[2.5]" />
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
                  className="md:col-span-12 lg:col-span-5 bg-gradient-to-br from-[#1b64d9] via-[#1059d1] to-[#044ab0] rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between text-white border-0"
                >
                  {/* Brand mark */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none" />
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-mono text-amber-300 uppercase font-black tracking-widest">Compte Courant</span>
                      <h4 className="text-xl font-display font-extrabold text-white mt-1 uppercase">Solde Principal</h4>
                    </div>
                    <div className="bg-amber-400 text-slate-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
                      👑 Actif
                    </div>
                  </div>

                  <div className="my-6">
                    <span className="text-slate-200 text-xs font-medium block">FONDS DISPONIBLES</span>
                    <div className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight mt-1">
                      {userState.balance.toLocaleString()} <span className="text-amber-300 text-lg font-black uppercase font-sans">FCFA</span>
                    </div>
                    <div className="text-[11px] text-slate-100/95 mt-2 font-mono flex items-center space-x-1 font-bold">
                      <Clock className="w-4.5 h-4.5 text-amber-300" />
                      <span>Rendement collectable sous 24h</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab('deposit')}
                      className="flex-grow py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold bg-[#f7b03b] hover:bg-amber-500 text-slate-900 transition-all text-center flex items-center justify-center space-x-1.5 shadow-md active:scale-95"
                    >
                      <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
                      <span>Faire un Dépôt</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('withdraw')}
                      className="flex-grow py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold bg-transparent hover:bg-white/10 text-white border-2 border-white/40 transition-all text-center flex items-center justify-center space-x-1.5 active:scale-95"
                    >
                      <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                      <span>Retirer</span>
                    </button>
                  </div>
                </motion.div>

                {/* STATS BENTO CARDS */}
                <motion.div 
                  variants={containerVariants}
                  className="md:col-span-12 lg:col-span-7 grid grid-cols-2 gap-3.5"
                >
                  <motion.div 
                     variants={cardVariants}
                     className="bg-[#eef3fc] border-2 border-slate-200/40 rounded-3xl p-5 flex flex-col justify-between relative shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-[#00bd74]/10 text-[#00bd74] flex items-center justify-center mb-2">
                      <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block uppercase font-extrabold tracking-wider">Gains Quotidiens</span>
                      <span className="text-2xl sm:text-3.5xl font-display font-black text-[#00bd74] block mt-1.5 font-sans">
                        +{userState.dailyEarnings.toLocaleString()} F
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono mt-1 font-bold">Gains sur plans actifs</span>
                    </div>
                  </motion.div>

                  <motion.div 
                    variants={cardVariants}
                    className="bg-[#eef3fc] border-2 border-slate-200/40 rounded-3xl p-5 flex flex-col justify-between relative shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-[#1b64d9]/10 text-[#1b64d9] flex items-center justify-center mb-2">
                      <Coins className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block uppercase font-extrabold tracking-wider">Total Récolté</span>
                      <span className="text-2xl sm:text-3.5xl font-display font-black text-slate-800 block mt-1.5 font-sans">
                        {userState.totalEarnings.toLocaleString()} F
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono mt-1 font-bold">Retraits nets accumulés</span>
                    </div>
                  </motion.div>

                  {/* LOYALTY DAILY BUTTON REWARD */}
                   <motion.div 
                     variants={cardVariants}
                     className="bg-[#eef3fc] border-2 border-slate-200/40 rounded-3xl p-5 flex items-center justify-between gap-4 col-span-2 text-left shadow-sm"
                   >
                    <div className="flex-1 space-y-1">
                      <span className="text-xs text-amber-500 block uppercase font-extrabold tracking-wider flex items-center gap-1">🎁 Cadeau Journalier</span>
                      <span className="text-sm font-bold text-slate-700 block leading-tight">Bonus d'investisseur fidèle GoldInvest.</span>
                    </div>
                    <button
                      onClick={handleDailyCheckin}
                      className="py-3 px-5 rounded-2xl bg-gradient-to-r from-[#00d2c3] to-[#046fff] hover:opacity-95 text-white text-xs sm:text-sm font-black uppercase tracking-wide transition-all shadow-md active:scale-95 font-sans"
                    >
                      Réclamer +50 F
                    </button>
                  </motion.div>

                </motion.div>
              </motion.div>

              {/* COMPREHENSIVE DIRECT VIP SUGGESTIONS OR ACTIVE INVESTMENTS */}
              <div className="mt-6 pt-3 border-t border-white/10">
                {activeInvestments.length === 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <h4 className="text-sm font-black text-amber-300 uppercase tracking-widest">🔥 Packages VIP Recommandés</h4>
                      <button 
                        onClick={() => setActiveTab('products')}
                        className="text-xs text-white underline font-extrabold hover:text-amber-300 transition-colors"
                      >
                        Voir tout →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {products.slice(0, 2).map((p) => (
                        <div 
                          key={p.id}
                          className="bg-[#eef3fc] border-2 border-slate-205/30 rounded-3xl p-5 flex flex-col justify-between text-left space-y-4 shadow-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] text-white font-black uppercase bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 rounded-full shadow-sm">Plan VIP {p.vipLevel}</span>
                              <h5 className="font-sans font-black text-base text-slate-800 mt-2 leading-tight uppercase tracking-tight">{p.name}</h5>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-500 block uppercase font-black">Investissement</span>
                              <strong className="text-lg text-[#1b64d9] font-black leading-tight font-sans">{p.price.toLocaleString()} F</strong>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 bg-white/70 p-3 rounded-2xl text-xs border border-slate-100">
                            <div>
                              <span className="text-slate-500 text-[10px] block uppercase font-bold">Revenu / Jour</span>
                              <span className="text-[#00bd74] font-black font-sans text-sm">+{p.dailyReturn.toLocaleString()} F</span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] block uppercase font-bold">Gains Totaux</span>
                              <span className="text-slate-800 font-black font-sans text-sm">{(p.dailyReturn * p.durationDays).toLocaleString()} F</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleBuyProduct(p)}
                            className="w-full py-3.5 bg-gradient-to-r from-[#00d2c3] to-[#046fff] hover:opacity-95 text-white text-xs sm:text-xs uppercase font-black tracking-widest rounded-2xl transition-all shadow-md text-center font-sans active:scale-95"
                          >
                            Activer pour {p.price.toLocaleString()} F
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <h4 className="text-sm font-black text-amber-300 uppercase tracking-widest leading-none">💼 Vos Investissements Actifs ({activeInvestments.length})</h4>
                      <button 
                        onClick={() => setActiveTab('products')}
                        className="text-xs text-white underline font-extrabold hover:text-amber-300 transition-colors"
                      >
                        Gérer →
                      </button>
                    </div>

                    <div className="space-y-3">
                      {activeInvestments.slice(0, 3).map((inv) => (
                        <div 
                          key={inv.id}
                          className="bg-[#eef3fc] p-4 rounded-3xl border-2 border-slate-205/30 flex items-center justify-between gap-4 text-left shadow-sm animation-fade-in"
                        >
                          <div className="space-y-1">
                            <span className="text-[9px] text-white font-black bg-gradient-to-r from-[#1b64d9] to-[#044ab0] px-2 py-0.5 rounded-full uppercase">Plan VIP {inv.productName}</span>
                            <div className="text-xs sm:text-sm font-extrabold text-slate-800 font-sans">
                              Investi : <span className="text-[#1b64d9] font-black">{inv.price.toLocaleString()} F</span> | Gain quotidien : <span className="text-[#00bd74] font-black">+{inv.dailyReturn.toLocaleString()} F</span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono font-bold">
                              Progression temporelle : {inv.daysPassed} / {inv.durationDays} Jours
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleClaimReturn(inv.id)}
                            disabled={inv.isClaimedToday || inv.status === 'completed'}
                            className={`py-2.5 px-4 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95 ${inv.isClaimedToday || inv.status === 'completed' ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#00bd74] hover:bg-[#00a867] text-white'}`}
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
            <div className="space-y-5">
              <div className="text-center max-w-xl mx-auto mb-3 animate-fade-in">
                <span className="text-xs font-black text-amber-300 tracking-widest uppercase block mb-1">PRODUITS VIP ROYAL</span>
                <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight leading-none">Activez des parts d'investissement et récoltez vos gains</h3>
              </div>

              {/* STATS: NOMBRE DE PRODUITS À GAUCHE ET REVENU À DROITE */}
              <div className="grid grid-cols-2 gap-3.5 max-w-4xl mx-auto">
                {/* Nombre de produits à gauche */}
                <div className="bg-[#eef3fc] border-2 border-slate-200/40 rounded-3xl p-4 flex items-center space-x-3 text-left shadow-sm">
                  <div className="w-10 h-10 rounded-2xl bg-[#1b64d9]/10 text-[#1b64d9] flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5.5 h-5.5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs text-slate-500 block font-extrabold uppercase tracking-wide">Produits Actifs</span>
                    <span className="text-xl font-display font-black text-slate-800 block mt-0.5 leading-none">{activeInvestments.length}</span>
                  </div>
                </div>

                {/* Revenu à droite */}
                <div className="bg-[#eef3fc] border-2 border-slate-200/40 rounded-3xl p-4 flex items-center space-x-3 text-left shadow-sm">
                  <div className="w-10 h-10 rounded-2xl bg-[#00bd74]/10 text-[#00bd74] flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5.5 h-5.5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs text-slate-500 block font-extrabold uppercase tracking-wide">Revenu Quotidien</span>
                    <span className="text-xl font-display font-black text-[#00bd74] block mt-0.5 leading-none">+{userState.dailyEarnings.toLocaleString()} F</span>
                  </div>
                </div>
              </div>

              {/* ACTIVE INVESTMENTS REAPING IF ANY */}
              {activeInvestments.length > 0 && (
                <div className="max-w-4xl mx-auto bg-[#eef3fc] border-2 border-slate-200/40 rounded-3xl p-5 mb-3 text-left shadow-sm">
                  <div className="mb-3">
                    <h4 className="text-base font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                      <span>💰</span> Collecte active de vos dividendes
                    </h4>
                    <p className="text-xs text-slate-500 font-bold">Cliquez sur récolter pour verser vos gains disponibles dans votre solde principal.</p>
                  </div>
                  <div className="space-y-3.5">
                    {activeInvestments.map((inv) => (
                      <div 
                        key={inv.id}
                        className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] text-white font-black bg-gradient-to-r from-[#1b64d9] to-[#044ab0] px-2.5 py-0.5 rounded-full uppercase tracking-wide">Module VIP {inv.productName}</span>
                          <div className="text-xs sm:text-sm font-extrabold text-slate-800 font-sans">
                            Investi : {inv.price.toLocaleString()} F | Gain/j : <span className="text-[#00bd74] font-black font-sans text-sm sm:text-base">+{inv.dailyReturn.toLocaleString()} F</span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono font-bold">
                            Progression temporelle : {inv.daysPassed} / {inv.durationDays} Jours
                          </div>
                        </div>

                        <div>
                          {inv.status === 'completed' ? (
                            <span className="px-4 py-2 bg-slate-105 border border-slate-200 text-slate-400 text-xs font-black rounded-2xl block text-center uppercase tracking-wider">
                              Cycle complété
                            </span>
                          ) : (
                            <button
                              onClick={() => handleClaimReturn(inv.id)}
                              className="px-4 py-2.5 bg-[#00bd74] hover:bg-[#00a867] text-white text-xs font-black rounded-2xl transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer uppercase tracking-wider active:scale-95"
                            >
                              <Coins className="w-4 h-4 stroke-[2.5]" />
                              <span>Récolter ({inv.dailyReturn} F)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
                {products.map((p) => {
                  const isBlocked = p.isBlocked === true;
                  const formattedReopenTime = p.reopenDateTime 
                    ? new Date(p.reopenDateTime).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                    : null;

                  const cycleText = `${p.durationDays} jours`;
                  const totalReturnText = `${(p.dailyReturn * p.durationDays).toLocaleString()} FCFA`;
                  const dailyReturnText = `${p.dailyReturn.toLocaleString()} FCFA`;
                  const priceText = `${p.price.toLocaleString()} FCFA`;

                  return (
                    <div 
                      key={p.id}
                      className={`w-full relative bg-[#eef3fc] border border-slate-250/60 rounded-3xl p-4 md:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${isBlocked ? 'opacity-70 pointer-events-none' : ''}`}
                    >
                      {/* Orange Crown Tag aligned on top-left of the blue card box */}
                      <div className="absolute top-2.5 left-5 z-10 bg-[#f7b03b] hover:bg-amber-500 text-slate-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 border border-amber-400">
                        <span>👑</span> {p.name}
                      </div>

                      <div className="flex gap-4 items-center mb-4 mt-3">
                        {/* Inner blue card box with matching white text */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gradient-to-b from-[#1b64d9] to-[#044ab0] rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl shadow-inner relative overflow-hidden">
                          <span className="relative z-10">{p.name}</span>
                          {/* Subtle decorative glow */}
                          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                          <div className="absolute -top-6 -left-6 w-16 h-16 bg-white/15 rounded-full blur-xl" />
                        </div>

                        {/* List details on the right */}
                        <div className="flex-1 space-y-1.5 text-xs text-slate-700 font-sans">
                          <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                            <span className="text-slate-500 font-medium">Revenu quotidien</span>
                            <span className="font-extrabold text-[#00bd74] text-xs sm:text-sm">{dailyReturnText}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                            <span className="text-slate-500 font-medium">Revenu total</span>
                            <span className="font-bold text-slate-800 text-xs sm:text-sm">{totalReturnText}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                            <span className="text-slate-500 font-medium">Durée</span>
                            <span className="font-bold text-slate-800 text-xs sm:text-sm">{cycleText}</span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-500 font-medium">Prix</span>
                            <span className="font-bold text-slate-800 text-xs sm:text-sm">{priceText}</span>
                          </div>
                        </div>
                      </div>

                      {/* Buy action button with beautiful vibrant teal gradient */}
                      <button
                        onClick={() => handleBuyProduct(p)}
                        disabled={isBlocked}
                        className={`w-full py-3 sm:py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-extrabold text-white transition-all shadow-md active:scale-[0.98] flex items-center justify-center tracking-wide duration-150 relative overflow-hidden ${isBlocked ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-[#02bfa4] to-[#00bd74] hover:opacity-95'}`}
                      >
                        <span className="relative z-10 font-sans">{isBlocked ? 'SUSPENDU' : `${priceText} — Débloquer maintenant`}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-[shimmer_2s_infinite]" />
                      </button>
                      
                      {isBlocked && (
                        <div className="absolute inset-0 rounded-2xl bg-slate-950/30 flex flex-col items-center justify-center p-3">
                          <div className="bg-red-500 text-white font-bold text-xs uppercase px-2.5 py-1 rounded-lg shadow">
                            Fermé / Suspendu
                          </div>
                          {formattedReopenTime && (
                            <span className="text-[9px] text-white font-mono mt-1 bg-black/60 px-2 py-0.5 rounded">
                              Ouvre à: {formattedReopenTime}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DEPOSIT FORM TAB */}
          {activeTab === 'deposit' && (
            <div className="max-w-xl mx-auto bg-[#eef3fc] border-2 border-slate-200/40 p-6 md:p-8 rounded-3xl shadow-xl text-slate-800">
              <div className="text-center mb-6">
                <span className="text-xs font-black text-[#1b64d9] tracking-widest uppercase block mb-1">DÉPÔT ROYAL SÉCURISÉ</span>
                <h3 className="text-xl font-display font-black text-slate-800 uppercase tracking-tight">Versements de Recharge</h3>
                <p className="text-xs text-slate-500 font-bold mt-1">Suivez les consignes pour recharger instantanément votre solde principal GoldInvest.</p>
              </div>

              {depositError && (
                <div className="mb-4 p-3 rounded-xl bg-red-100 border border-red-200 text-xs text-red-700 font-bold">{depositError}</div>
              )}
              {depositSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-100 border border-green-200 text-xs text-green-700 font-bold">{depositSuccess}</div>
              )}

              <form onSubmit={submitDeposit} className="space-y-4 text-left">
                
                {/* 1. SECTOR OPERATOR */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">1. Choisissez l'opérateur Mobile Money</label>
                  <select 
                    value={depositOperator}
                    onChange={(e) => setDepositOperator(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200/45 rounded-2xl py-3 px-4 text-sm text-slate-800 font-bold focus:border-[#1b64d9] focus:outline-none appearance-none cursor-pointer shadow-sm"
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
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">2. Montant à investir (FCFA)</label>
                  <input
                    type="number"
                    required
                    placeholder="Minimum 3 000 FCFA"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200/45 focus:border-[#1b64d9] rounded-2xl py-3 px-4 text-sm text-[#1b64d9] font-black focus:outline-none shadow-sm placeholder:text-slate-400"
                  />
                </div>

                {/* TRANSFER CARD INSTRUCTIONS */}
                <div className="bg-white/85 p-5 rounded-2xl border border-slate-200 shadow-inner space-y-2.5 text-xs text-slate-600">
                  <span className="font-extrabold text-slate-800 block text-xs uppercase tracking-wide flex items-center gap-1">📞 Adresse de Paiement Officielle :</span>
                  <p className="text-slate-600 font-bold">Veuillez envoyer votre transfert Mobile Money d'un montant exact de <strong className="text-[#1b64d9] font-black text-sm">{parseInt(depositAmount || '0').toLocaleString()} FCFA</strong> vers :</p>
                  <div className="bg-[#eef3fc] p-3 rounded-xl border border-slate-200 flex justify-between items-center font-mono">
                    <span className="text-[#1b64d9] font-black text-sm">+225 07 48 49 50 51</span>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Dest: GoldInvest Capital</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-relaxed font-semibold">Une fois l'envoi validé depuis votre téléphone, copiez l'ID / référence de l'opération reçue par SMS, collez-la ci-dessous et téléversez une image de confirmation.</span>
                </div>

                {/* REF */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">3. Référence d'opération Mobile Money</label>
                    <button
                      type="button"
                      onClick={handleGenerateRef}
                      className="text-xs text-[#1b64d9] hover:text-[#044ab0] font-black underline"
                    >
                      Générer une Réf. Démo
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="ID ou référence de transaction reçue par SMS"
                    value={depositRef}
                    onChange={(e) => setDepositRef(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200/45 focus:border-[#1b64d9] rounded-2xl py-3 px-4 text-sm text-slate-800 focus:outline-none font-mono font-bold tracking-wider shadow-sm"
                  />
                </div>

                {/* RECEIPT CAPTURE PROOF */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">4. Capture d'écran du reçu de paiement</label>
                  
                  {/* Custom upload browser */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200/60 hover:border-[#1b64d9]/50 rounded-2xl bg-white p-6 text-center cursor-pointer transition-colors shadow-sm"
                  >
                    {receiptBase64 ? (
                      <div className="space-y-2">
                        <span className="text-[#00bd74] font-black text-xs flex items-center justify-center space-x-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>IMAGE ATTACHÉE AVEC SUCCÈS !</span>
                        </span>
                        <img 
                          src={receiptBase64} 
                          alt="Invoice receipt preview" 
                          className="w-24 h-24 object-cover rounded-xl mx-auto border border-slate-200 shadow"
                        />
                        <span className="text-[10px] text-slate-400 block font-bold">Cliquez ici pour remplacer la photo</span>
                      </div>
                    ) : (
                      <div>
                        <ArrowDownLeft className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <span className="text-xs text-slate-600 block font-black">Glissez ou sélectionnez la capture du reçu</span>
                        <span className="text-[10px] text-slate-400 block mt-1 uppercase font-bold">JPG, PNG ACCEPTÉS</span>
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
                  className="w-full py-4 text-white font-sans font-black text-xs uppercase tracking-widest bg-gradient-to-r from-[#00d2c3] to-[#046fff] rounded-2xl hover:opacity-95 transition-all shadow-md active:scale-95"
                >
                  Soumettre la Preuve de Dépôt
                </button>
              </form>
            </div>
          )}

          {/* WITHDRAW FORM TAB */}
          {activeTab === 'withdraw' && (
            <div className="max-w-xl mx-auto bg-[#eef3fc] border-2 border-slate-200/40 p-6 md:p-8 rounded-3xl shadow-xl text-slate-800">
              <div className="text-center mb-6">
                <span className="text-xs font-black text-[#1b64d9] tracking-widest uppercase block mb-1">CASH OUT SÉCURISÉ</span>
                <h3 className="text-xl font-display font-black text-slate-800 uppercase tracking-tight">Demande de Retrait</h3>
                <p className="text-xs text-slate-500 font-bold mt-1">Saisissez les paramètres de transfert de votre solde vers votre compte mobile.</p>
              </div>

              {withdrawError && (
                <div className="mb-4 p-3 rounded-xl bg-red-100 border border-red-200 text-xs text-red-700 font-bold">{withdrawError}</div>
              )}
              {withdrawSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-100 border border-green-200 text-xs text-green-700 font-bold">{withdrawSuccess}</div>
              )}

              <div className="mb-6 p-5 rounded-2xl bg-white border border-slate-200 text-xs flex justify-between items-center shadow-inner">
                <div>
                  <span className="text-slate-400 font-extrabold uppercase text-[10px] block">Solde Actuel :</span>
                  <div className="text-xl sm:text-2xl font-black text-[#00bd74] mt-0.5">{userState.balance.toLocaleString()} FCFA</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-extrabold uppercase text-[10px] block">Limite minimum :</span>
                  <div className="text-xs sm:text-sm font-black text-slate-800 mt-0.5">1 500 FCFA</div>
                </div>
              </div>

              <form onSubmit={submitWithdrawal} className="space-y-4 text-left">
                {/* Operator select */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Opérateur Mobile Money Destinataire</label>
                  <select 
                    value={withdrawOperator}
                    onChange={(e) => setWithdrawOperator(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200/45 rounded-2xl py-3 px-4 text-sm text-slate-800 font-bold focus:border-[#1b64d9] focus:outline-none cursor-pointer shadow-sm"
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
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Numéro de téléphone de réception</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: +225 07 11 22 33 44"
                    value={withdrawNumber}
                    onChange={(e) => setWithdrawNumber(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200/45 focus:border-[#1b64d9] rounded-2xl py-3 px-4 text-sm text-slate-800 font-mono font-bold tracking-wider shadow-sm"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1.5 font-bold">Assurez-vous que le numéro est parfaitement actif et lié à un compte Mobile Money.</span>
                </div>

                {/* Withdraw value */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Montant à extraire (FCFA)</label>
                  <input
                    type="number"
                    required
                    placeholder="Montant à retirer en FCFA"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200/45 focus:border-[#1b64d9] rounded-2xl py-3 px-4 text-sm text-[#1b64d9] font-black focus:outline-none font-mono shadow-sm"
                  />
                </div>

                <div className="bg-white/90 p-4 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-1 font-bold">
                  <span className="font-extrabold text-[#1b64d9] block">👮 Sécurité Comptable :</span>
                  <p>Toutes les demandes font l'objet d'un audit de sécurité pour écarter les transactions pirates. Traitement en : <strong>moins de 2 heures</strong>.</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 text-white font-sans font-black text-xs uppercase tracking-widest bg-gradient-to-r from-[#00d2c3] to-[#046fff] rounded-2xl hover:opacity-95 transition-all shadow-md active:scale-95"
                >
                  Envoyer la demande de Retrait
                </button>
              </form>
            </div>
          )}

          {/* TEAM / MLM SYSTEM TAB */}
          {activeTab === 'team' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              
              {/* BRAND ADVOCATE HEADER */}
              <div className="bg-[#0b1229]/70 backdrop-blur-md p-5 pb-6 border border-yellow-500/15 rounded-2xl text-left grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 space-y-2 flex flex-col justify-center">
                  <span className="text-xs font-black text-yellow-500 font-mono tracking-widest uppercase block">PROFIL PARRAIN</span>
                  <h3 className="text-lg font-sans font-black text-white uppercase tracking-tight">Encouragez vos Équipes MLM</h3>
                  <p className="text-xs text-slate-200 leading-relaxed">Distribuez votre lien personnel et gagnez Niveau 1 : 20%, Niveau 2 : 3% et Niveau 3 : 1% sur les investissements de votre réseau.</p>
                </div>
 
                {/* Copy blocks */}
                <div className="md:col-span-2 space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-center">
                  <div>
                    <span className="text-xs text-slate-300 uppercase font-black tracking-wide block mb-1">Code Sponsor Unique :</span>
                    <div className="flex bg-slate-900 border border-slate-800 p-2 px-3 rounded-lg justify-between items-center">
                      <span className="font-mono text-sm font-black text-yellow-400">{userState.referralCode}</span>
                      <button
                        onClick={handleCopyCode}
                        className="p-1 px-2 text-slate-400 hover:text-white transition-colors"
                        title="Copier le code"
                      >
                        {copiedCode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
 
                  <div>
                    <span className="text-xs text-slate-300 uppercase font-black tracking-wide block mb-1">Lien d'Affiliation Directe :</span>
                    <div className="flex bg-slate-900 border border-slate-800 p-2 px-3 rounded-lg justify-between items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-200 truncate flex-1">{referralURL}</span>
                      <button
                        onClick={handleCopyLink}
                        className="p-1 px-2 text-slate-400 hover:text-white transition-colors flex-shrink-0"
                        title="Copier le lien"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
 
              {/* COMMISSIONS OVERVIEW CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-left">
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-sm">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-extrabold block">Total Filleuls</span>
                  <div className="text-base sm:text-lg font-black font-mono text-white mt-1">
                    {totalReferrals} membres
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mt-1">Membres actifs</span>
                </div>
 
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-sm">
                  <span className="text-xs text-green-400 uppercase tracking-wider font-extrabold block">Niveau 1 (20%)</span>
                  <div className="text-base sm:text-lg font-black font-mono text-green-400 mt-1">
                    {commissions.filter(c => c.level === 1).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} F
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mt-1">1er cercle</span>
                </div>
 
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-sm">
                  <span className="text-xs text-yellow-500 uppercase tracking-wider font-extrabold block">Niveau 2 (3%)</span>
                  <div className="text-base sm:text-lg font-black font-mono text-white mt-1">
                    {commissions.filter(c => c.level === 2).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} F
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mt-1">2e cercle</span>
                </div>
 
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-sm">
                  <span className="text-xs text-blue-400 uppercase tracking-wider font-extrabold block">Niveau 3 (1%)</span>
                  <div className="text-base sm:text-lg font-black font-mono text-white mt-1">
                    {commissions.filter(c => c.level === 3).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} F
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mt-1">3e cercle</span>
                </div>
              </div>
 
              {/* MLM COMMISSIONS HISTORY TABULATED */}
              <div className="bg-[#0b1229]/65 border border-slate-800 rounded-2xl p-4 md:p-5 text-left">
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3">Historique des Royalties</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-slate-300 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-extrabold uppercase bg-slate-950/35 text-left">
                        <th className="p-3">Filleul</th>
                        <th className="p-3">Niveau MLM</th>
                        <th className="p-3 font-mono text-yellow-400">Gain</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400 text-xs sm:text-sm font-bold">Aucune commission créditée pour l'instant. Invitez vos amis.</td>
                        </tr>
                      ) : (
                        commissions.map((c) => (
                          <tr key={c.id} className="border-b border-slate-900/40 hover:bg-slate-900/15 text-left transition-colors">
                            <td className="p-3 font-black text-white">{c.fromUserName}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${c.level === 1 ? 'bg-green-500/15 text-green-400 border border-green-500/30' : c.level === 2 ? 'bg-yellow-500/15 text-yellow-500 border border-yellow-500/30' : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'}`}>
                                LEVEL {c.level}
                              </span>
                            </td>
                            <td className="p-3 font-black font-mono text-green-400">+{c.amount.toLocaleString()} F</td>
                            <td className="p-3 text-slate-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                            <td className="p-3">
                              <span className="text-slate-400 text-xs font-bold">● Crédité</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
 
              {/* LIVE NETWORK STRUCTURE - MULTI-LEVEL MLM REFERRALS DISPLAY */}
              <div className="bg-[#0b1229]/65 border border-slate-800 rounded-2xl p-4 md:p-5 text-left space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-900 pb-3 gap-3">
                  <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span>👥</span>
                    <span>Structure de vos Filleuls ({totalReferrals} membres)</span>
                  </h3>
                  
                  {/* LEVEL SUB-TABS */}
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 self-start sm:self-auto">
                    <button
                      onClick={() => setReferralListTab('level1')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all truncate ${referralListTab === 'level1' ? 'bg-[#00bd74] text-white' : 'text-slate-400 hover:text-white bg-transparent'}`}
                    >
                      Niveau 1 ({level1Users.length})
                    </button>
                    <button
                      onClick={() => setReferralListTab('level2')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all truncate ${referralListTab === 'level2' ? 'bg-yellow-500 text-slate-950' : 'text-slate-400 hover:text-white bg-transparent'}`}
                    >
                      Niveau 2 ({level2Users.length})
                    </button>
                    <button
                      onClick={() => setReferralListTab('level3')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all truncate ${referralListTab === 'level3' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white bg-transparent'}`}
                    >
                      Niveau 3 ({level3Users.length})
                    </button>
                  </div>
                </div>

                {/* LEVEL 1 VIEW */}
                {referralListTab === 'level1' && (
                  <>
                    {level1Users.length === 0 ? (
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-center py-6 bg-slate-950/20 rounded-xl font-medium">
                        Vous n'avez pas encore de filleuls inscrits directement (Niveau 1) avec votre code de parrainage. Partagez votre lien d'invitation pour commencer !
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {level1Users.map(u => (
                          <div key={u.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-[#00bd74]/25 transition-all duration-200">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-black text-slate-100 text-sm truncate">{u.name}</span>
                                <span className="text-[10px] font-black font-mono text-[#00bd74] uppercase tracking-wider bg-[#00bd74]/10 px-1.5 py-0.5 rounded border border-[#00bd74]/20">NIVEAU 1</span>
                              </div>
                              <span className="text-xs text-slate-400 block mt-1.5 font-medium">Sponsorisé le : {new Date(u.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-xs">
                              <span className="text-slate-350 font-bold italic">{u.country}</span>
                              <a 
                                href={`https://wa.me/${u.whatsapp.replace(/[^0-9]/g, '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-green-400 font-black flex items-center space-x-1.5 hover:text-green-350 transition-colors"
                              >
                                <span>💬 WhatsApp</span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* LEVEL 2 VIEW */}
                {referralListTab === 'level2' && (
                  <>
                    {level2Users.length === 0 ? (
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-center py-6 bg-slate-950/20 rounded-xl font-medium">
                        Aucun filleul de Niveau 2 pour le moment. Lorsque vos filleuls directs parraineront d'autres membres, ils apparaîtront ici et vous toucherez 3% de bonus.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {level2Users.map(u => {
                          const sponsor = allUsers.find(sp => sp.id === u.referredBy || sp.referralCode === u.referredBy);
                          return (
                            <div key={u.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-yellow-500/25 transition-all duration-200">
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-slate-100 text-sm truncate">{u.name}</span>
                                  <span className="text-[10px] font-black font-mono text-yellow-500 uppercase tracking-wider bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">NIVEAU 2</span>
                                </div>
                                <span className="text-xs text-slate-400 block mt-1.5 font-medium">Sponsorisé par : <strong className="text-slate-200">{sponsor ? sponsor.name : 'Un membre L1'}</strong></span>
                                <span className="text-xs text-slate-500 block mt-0.5">Le : {new Date(u.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-xs">
                                <span className="text-slate-350 font-bold italic">{u.country}</span>
                                <a 
                                  href={`https://wa.me/${u.whatsapp.replace(/[^0-9]/g, '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-green-400 font-black flex items-center space-x-1.5 hover:text-green-350 transition-colors"
                                >
                                  <span>💬 WhatsApp</span>
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {/* LEVEL 3 VIEW */}
                {referralListTab === 'level3' && (
                  <>
                    {level3Users.length === 0 ? (
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-center py-6 bg-slate-950/20 rounded-xl font-medium">
                        Aucun filleul de Niveau 3 pour le moment. Lorsque votre réseau de Niveau 2 parrainera leurs propres amis, ils s'afficheront ici et vous toucherez 1% de bonus.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {level3Users.map(u => {
                          const sponsor = allUsers.find(sp => sp.id === u.referredBy || sp.referralCode === u.referredBy);
                          return (
                            <div key={u.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-blue-500/25 transition-all duration-200">
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-slate-100 text-sm truncate">{u.name}</span>
                                  <span className="text-[10px] font-black font-mono text-blue-400 uppercase tracking-wider bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">NIVEAU 3</span>
                                </div>
                                <span className="text-xs text-slate-400 block mt-1.5 font-medium">Sponsorisé par : <strong className="text-slate-200">{sponsor ? sponsor.name : 'Un membre L2'}</strong></span>
                                <span className="text-xs text-slate-500 block mt-0.5">Le : {new Date(u.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-xs">
                                <span className="text-slate-350 font-bold italic">{u.country}</span>
                                <a 
                                  href={`https://wa.me/${u.whatsapp.replace(/[^0-9]/g, '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-green-400 font-black flex items-center space-x-1.5 hover:text-green-350 transition-colors"
                                >
                                  <span>💬 WhatsApp</span>
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
 
            </div>
          )}
 
          {/* USER PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto w-full space-y-4 text-left">
              
              <div className="bg-slate-900/60 p-5 border border-slate-800 rounded-2xl relative">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center text-slate-950 font-black text-xl shadow">
                    {userState.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-sans font-black text-white">{userState.name}</h3>
                    <span className="text-xs sm:text-sm text-slate-355 font-mono font-bold block mt-0.5">WhatsApp : {userState.whatsapp}</span>
                  </div>
                </div>
 
                <div className="mt-5 pt-4 border-t border-slate-800 space-y-2.5 text-xs sm:text-sm font-bold">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-medium">Pays identifié :</span>
                    <span className="font-extrabold text-white text-sm">{userState.country}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-medium">Niveau de compte :</span>
                    <span className="font-black text-yellow-500 uppercase tracking-wider text-sm">Investisseur VIP {activeInvestments.length > 0 ? 'Actif' : 'Standard'}</span>
                  </div>
                </div>
              </div>
 
              {/* BONUS CODE USE BOX */}
              <div className="bg-slate-900/60 p-5 border border-slate-800 rounded-2xl shadow-sm">
                <h4 className="text-xs sm:text-sm font-black text-yellow-500 uppercase tracking-widest mb-2.5">🎁 Saisir un Code Bonus</h4>
                
                {bonusError && <div className="p-2.5 mb-3 bg-red-400/10 border border-red-500/20 rounded-lg text-xs text-red-200 font-bold">{bonusError}</div>}
                {bonusSuccess && <div className="p-2.5 mb-3 bg-green-400/10 border border-green-500/20 rounded-lg text-xs text-green-300 font-black">{bonusSuccess}</div>}
 
                <form onSubmit={submitBonusCode} className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="Ex: GOLD777, WELCOME500"
                    value={bonusCodeInput}
                    onChange={(e) => setBonusCodeInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-yellow-500 rounded-xl py-3 px-4 text-xs sm:text-sm text-white placeholder-slate-600 font-mono font-black tracking-wider focus:outline-none uppercase"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-sans font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow"
                  >
                    Appliquer
                  </button>
                </form>
              </div>
 
              {/* SERVICE CLIENT & SUPPORT CARD */}
              <div className="bg-slate-900/60 p-5 border border-slate-800 rounded-2xl shadow-sm text-left space-y-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">Assistance & Service Clientèle</h4>
                    <span className="text-[10px] text-slate-400 font-mono block">Disponible 24h/7 pour valider vos dépôts/retraits</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Notre équipe de conseillers VIP est à votre écoute pour répondre à toutes vos interrogations, enregistrer vos captures de paiements, et accélérer vos versements/retraits.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <a
                    href="https://wa.me/2250708091011?text=Bonjour%20GoldInvest%20Premium%2C%20je%20souhaite%20contacter%20le%20Service%20Client%20VIP"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-black uppercase tracking-wide text-center flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
                  >
                    <span>💬 WhatsApp VIP 24h/7</span>
                  </a>
                  <a
                    href="https://t.me/+yNY88-unzgQyYmJk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wide text-center flex items-center justify-center space-x-2 shadow cursor-pointer"
                  >
                    <span>📢 Canal Telegram</span>
                  </a>
                </div>

                {/* IN-APP CHAT (SUPPORT EN LIGNE INTERACTIF) */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest font-mono block mb-2.5">💬 Support en Ligne Direct</span>
                  
                  {/* Chat message list */}
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-900 h-48 overflow-y-auto space-y-2.5">
                    {supportMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <span className="text-2xl mb-1">🤝</span>
                        <p className="text-[11px] text-slate-500 font-medium">Aucun message pour le moment. Saluez notre agent pour commencer la discussion !</p>
                      </div>
                    ) : (
                      supportMessages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                            msg.sender === 'user' 
                              ? 'bg-yellow-500 text-slate-950 rounded-br-none font-bold' 
                              : 'bg-slate-850 text-slate-100 rounded-bl-none border border-slate-800'
                          }`}>
                            {msg.message}
                          </div>
                          <span className="text-[9px] text-slate-400 mt-0.5 font-mono px-1">
                            {msg.sender === 'user' ? 'Vous' : 'Support VIP'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Chat input form */}
                  <form onSubmit={handleSendChatMessage} className="flex gap-2 mt-2.5">
                    <input
                      type="text"
                      placeholder="Tapez votre question ici..."
                      value={chatMessageInput}
                      onChange={(e) => setChatMessageInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-650 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer text-white flex items-center justify-center"
                    >
                      Envoyer
                    </button>
                  </form>
                </div>
              </div>

              {/* PASSWORD CHANGE BOX */}
              <div className="bg-slate-900/60 p-5 border border-slate-800 rounded-2xl shadow-sm">
                <h4 className="text-xs sm:text-sm font-black text-yellow-500 uppercase tracking-widest mb-3">🔑 Modifier Votre Mot de Passe</h4>
 
                {pwdError && <div className="p-2.5 mb-3 bg-red-400/10 border border-red-500/20 rounded-lg text-xs text-red-200 font-bold">{pwdError}</div>}
                {pwdSuccess && <div className="p-2.5 mb-3 bg-green-400/10 border border-green-500/20 rounded-lg text-xs text-green-300 font-black">{pwdSuccess}</div>}
 
                <form onSubmit={handlePasswordChange} className="space-y-3.5 text-xs sm:text-sm">
                  <div>
                    <label className="block text-slate-300 mb-1.5 uppercase tracking-wider text-[10px] font-black">Ancien mot de passe</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500 rounded-xl py-3 px-4 text-xs sm:text-sm text-white placeholder-slate-600 font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1.5 uppercase tracking-wider text-[10px] font-black">Nouveau mot de passe</label>
                    <input
                      type="password"
                      placeholder="Minimum 5 caractères"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500 rounded-xl py-3 px-4 text-xs sm:text-sm text-white placeholder-slate-650 font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1.5 uppercase tracking-wider text-[10px] font-black">Nouveau de passe (confirmation)</label>
                    <input
                      type="password"
                      placeholder="Confirm"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500 rounded-xl py-3 px-4 text-xs sm:text-sm text-white placeholder-slate-600 font-bold focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-sans font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl transition-all shadow"
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
      <footer className="fixed bottom-0 left-0 right-0 py-2.5 px-4 bg-white/95 border-t border-slate-200 backdrop-blur-md z-40 lg:py-3 shadow-[0_-5px_15px_rgba(0,0,0,0.04)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between font-bold text-[10px] md:text-xs">
          
          <button
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('dashboard');
            }}
            className={`flex flex-col items-center space-y-1 flex-1 transition-all ${activeTab === 'dashboard' && !isAdminMode ? 'text-[#00bd74] scale-105' : 'text-slate-400 opacity-80 hover:opacity-100'}`}
          >
            <Activity className="w-5 h-5 stroke-[2.5]" />
            <span className="font-sans font-black uppercase tracking-wider text-[8px] md:text-[9px]">Maison</span>
          </button>

          <button
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('products');
            }}
            className={`flex flex-col items-center space-y-1 flex-1 transition-all ${activeTab === 'products' && !isAdminMode ? 'text-[#00bd74] scale-105' : 'text-slate-400 opacity-80 hover:opacity-100'}`}
          >
            <Briefcase className="w-5 h-5 stroke-[2.5]" />
            <span className="font-sans font-black uppercase tracking-wider text-[8px] md:text-[9px]">VIP</span>
          </button>

          <button
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('team');
            }}
            className={`flex flex-col items-center space-y-1 flex-1 transition-all ${activeTab === 'team' && !isAdminMode ? 'text-[#00bd74] scale-105' : 'text-slate-400 opacity-80 hover:opacity-100'}`}
          >
            <Users className="w-5 h-5 stroke-[2.5]" />
            <span className="font-sans font-black uppercase tracking-wider text-[8px] md:text-[9px]">Équipe</span>
          </button>

          <button
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('profile');
            }}
            className={`flex flex-col items-center space-y-1 flex-1 transition-all ${activeTab === 'profile' && !isAdminMode ? 'text-[#00bd74] scale-105' : 'text-slate-400 opacity-80 hover:opacity-100'}`}
          >
            <UserIcon className="w-5 h-5 stroke-[2.5]" />
            <span className="font-sans font-black uppercase tracking-wider text-[8px] md:text-[9px]">Moi</span>
          </button>

        </div>
      </footer>

      {/* FOOTER NAVIGATION */}


    </div>
  );
}
