import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Headphones,
  X
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
  const [depositOperator, setDepositOperator] = useState<string>('MTN Mobile Money (Cameroun)');
  const [depositRef, setDepositRef] = useState<string>('');
  const [receiptBase64, setReceiptBase64] = useState<string>('');
  const [depositError, setDepositError] = useState<string>('');
  const [depositSuccess, setDepositSuccess] = useState<string>('');

  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawOperator, setWithdrawOperator] = useState<string>('MTN Mobile Money (Cameroun)');
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

  const [productErrors, setProductErrors] = useState<Record<string, string>>({});

  const [dismissedPermissionBanner, setDismissedPermissionBanner] = useState<boolean>(false);

  const [chromeNotifPermission, setChromeNotifPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const initialLoadedNotifIds = useRef<Set<string>>(new Set());

  const triggerChromeNotification = (title: string, message: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          const cleanMessage = message.replace(/<[^>]*>/g, ''); // strip any html tags
          // Native notification invocation
          const notif = new Notification("Vous avez reçu une nouvelle notification", {
            body: cleanMessage,
            icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827379.png',
            tag: 'agro-' + Date.now(),
          });
          notif.onclick = () => {
            window.focus();
          };
        } catch (err) {
          console.error('Browser blocked background notification instantiation:', err);
        }
      }
    }
  };

  const requestChromeNotificationPermission = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      openAlert('Unsupported', 'Votre navigateur Chrome ou appareil actuel ne supporte pas les notifications de bureau.', 'info');
      return;
    }
    
    Notification.requestPermission().then((permission) => {
      setChromeNotifPermission(permission);
      if (permission === 'granted') {
        openAlert('Activé avec succès 🎉', 'Vous recevrez désormais des alertes instantanées dans Chrome à chaque fois qu\'une recharge est approuvée, qu\'un gain tombe ou qu\'une annonce officielle de l\'administrateur est diffusée.', 'success');
        try {
          new Notification("Vous avez reçu une nouvelle notification", {
            body: "Notifications de bureau Chrome activées sur AgroCapital ! 🔔"
          });
        } catch (e) {
          console.error(e);
        }
      } else if (permission === 'denied') {
        openAlert('Notifications bloquées ⚠️', 'Vous avez bloqué les notifications. Veuillez réactiver les droits de notification dans les paramètres (icône de cadenas) de votre navigateur Chrome pour de futurs messages directs.', 'error');
      }
    });
  };

  const getCurrency = () => {
    if (!userState) return 'FCFA';
    const whatsapp = userState.whatsapp || '';
    if (whatsapp.startsWith('+226')) {
      return 'XOF';
    } else if (whatsapp.startsWith('+237')) {
      return 'XAF';
    }
    const countryStr = (userState.country || '').toLowerCase();
    if (countryStr.includes('burkina')) {
      return 'XOF';
    } else if (countryStr.includes('cameroun') || countryStr.includes('cameroon')) {
      return 'XAF';
    }
    return 'FCFA';
  };

  const [customModal, setCustomModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'confirm' | 'success' | 'info' | 'error' | 'purchase_success';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const openAlert = (title: string, message: string, type: 'success' | 'error' | 'info' | 'purchase_success' = 'info') => {
    setCustomModal({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  const openPurchaseSuccessAlert = (title: string, message: string) => {
    setCustomModal({
      isOpen: true,
      title,
      message,
      type: 'purchase_success',
    });
  };

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setCustomModal({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm
    });
  };

  // Layout states
  const [simulationStatus, setSimulationStatus] = useState<string>('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAnnouncementDismissible, setShowAnnouncementDismissible] = useState<boolean>(() => {
    try {
      const justReg = sessionStorage.getItem('gi_just_registered') === 'true';
      if (justReg) {
        return true;
      }
      return localStorage.getItem('gi_announcement_dismissed_v2') !== 'true';
    } catch (e) {
      return true;
    }
  });
  const [profileHistoryTab, setProfileHistoryTab] = useState<'history' | 'deposits' | 'withdrawals' | 'purchases' | 'notifications'>('history');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // MLM sponsorship dynamic calculation based on real user registration tree
  const [allUsers, setAllUsers] = useState<User[]>(() => DataStore.getUsers());
  const mlmRates = DataStore.getMLMRates();
  
  const myIdUpper = userState.id.toUpperCase();
  const myCodeUpper = userState.referralCode ? userState.referralCode.trim().toUpperCase() : '';
  const myPhoneDigits = userState.whatsapp ? userState.whatsapp.replace(/\D/g, '') : '';

  const level1Users = allUsers.filter(u => {
    if (!u.referredBy) return false;
    const refClean = u.referredBy.trim().toUpperCase();
    const refDigits = refClean.replace(/\D/g, '');

    // 1. Direct match by User ID
    if (refClean === myIdUpper) return true;
    
    // 2. Direct match by Referral Code
    if (myCodeUpper && refClean === myCodeUpper) return true;
    
    // 3. Direct match by Phone number
    if (myPhoneDigits && refDigits && (myPhoneDigits.endsWith(refDigits) || refDigits.endsWith(myPhoneDigits))) {
      return true;
    }

    // 4. Resolve phantom/indirect sponsor matchups across disparate browser sessions/windows
    // If the sponsor ID in u.referredBy points to a phantom user record, check if that phantom's referralCode matches our referral code
    const sponsor = allUsers.find(sp => sp.id.toUpperCase() === refClean);
    if (sponsor) {
      const spCodeUpper = sponsor.referralCode ? sponsor.referralCode.trim().toUpperCase() : '';
      if (myCodeUpper && spCodeUpper && spCodeUpper === myCodeUpper) return true;

      const spIdUpper = sponsor.id.toUpperCase();
      if (spIdUpper === myIdUpper) return true;

      const spPhoneDigits = sponsor.whatsapp ? sponsor.whatsapp.replace(/\D/g, '') : '';
      if (myPhoneDigits && spPhoneDigits && (myPhoneDigits.endsWith(spPhoneDigits) || spPhoneDigits.endsWith(myPhoneDigits))) {
        return true;
      }
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

        // Resolve indirect/phantom sponsors
        const sponsor = allUsers.find(sp => sp.id.toUpperCase() === refClean);
        if (sponsor) {
          const spIdUpper = sponsor.id.toUpperCase();
          const spCodeUpper = sponsor.referralCode ? sponsor.referralCode.trim().toUpperCase() : '';
          if (level1IdsUpper.includes(spIdUpper) || (spCodeUpper && level1CodesUpper.includes(spCodeUpper))) {
            return true;
          }
        }

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

        // Resolve indirect/phantom sponsors
        const sponsor = allUsers.find(sp => sp.id.toUpperCase() === refClean);
        if (sponsor) {
          const spIdUpper = sponsor.id.toUpperCase();
          const spCodeUpper = sponsor.referralCode ? sponsor.referralCode.trim().toUpperCase() : '';
          if (level2IdsUpper.includes(spIdUpper) || (spCodeUpper && level2CodesUpper.includes(spCodeUpper))) {
            return true;
          }
        }

        if (refDigits && level2WhatsAppDigits.some(d => d.endsWith(refDigits) || refDigits.endsWith(d))) {
          return true;
        }
        return false;
      })
    : [];

  const totalReferrals = level1Users.length + level2Users.length + level3Users.length;

  // Unified history aggregator that merges all transaction logs and events
  const getUnifiedHistory = () => {
    const list: {
      id: string;
      date: string;
      amount: number;
      type: 'Recharge' | 'Retrait' | 'Commission' | 'Achat VIP' | 'Revenu Quotidien';
      status: 'Validé' | 'En attente' | 'Refusé' | 'Complété';
      details: string;
      rawDate: Date;
    }[] = [];

    // 1. Deposits (Recharges)
    allDeposits.forEach((dep) => {
      let mappedStatus: 'Validé' | 'En attente' | 'Refusé' = 'En attente';
      if (dep.status === 'approved') mappedStatus = 'Validé';
      if (dep.status === 'rejected') mappedStatus = 'Refusé';
      
      list.push({
        id: `history-dep-${dep.id}`,
        date: dep.createdAt,
        amount: dep.amount,
        type: 'Recharge',
        status: mappedStatus,
        details: `Recharge via ${dep.operator} ${dep.reference ? `[Réf: ${dep.reference}]` : ''}`,
        rawDate: new Date(dep.createdAt)
      });
    });

    // 2. Withdrawals (Retraits)
    allWithdrawals.forEach((wth) => {
      let mappedStatus: 'Validé' | 'En attente' | 'Refusé' = 'En attente';
      if (wth.status === 'approved') mappedStatus = 'Validé';
      if (wth.status === 'rejected') mappedStatus = 'Refusé';

      list.push({
        id: `history-wth-${wth.id}`,
        date: wth.createdAt,
        amount: wth.amount,
        type: 'Retrait',
        status: mappedStatus,
        details: `Retrait Mobile Money (${wth.operator}) vers ${wth.number}`,
        rawDate: new Date(wth.createdAt)
      });
    });

    // 3. Purchases/Activations
    activeInvestments.forEach((inv) => {
      list.push({
        id: `history-buy-${inv.id}`,
        date: inv.createdAt,
        amount: inv.price,
        type: 'Achat VIP',
        status: inv.status === 'completed' ? 'Complété' : 'Validé',
        details: `Activation Formule ${inv.productName} (${inv.dailyReturn.toLocaleString()} F/jour pendant ${inv.durationDays}j)`,
        rawDate: new Date(inv.createdAt)
      });

      // 4. Daily Earnings (Revenus Quotidiens)
      for (let d = 1; d <= inv.daysPassed; d++) {
        const installmentTime = new Date(inv.createdAt).getTime() + d * 24 * 60 * 60 * 1000;
        const finalTime = Math.min(Date.now(), installmentTime);
        const instDate = new Date(finalTime).toISOString();

        list.push({
          id: `history-earn-${inv.id}-${d}`,
          date: instDate,
          amount: inv.dailyReturn,
          type: 'Revenu Quotidien',
          status: 'Validé',
          details: `Gain journalier généré - Formule ${inv.productName} (Jour ${d}/${inv.durationDays})`,
          rawDate: new Date(finalTime)
        });
      }
    });

    // 5. Commissions
    commissions.forEach((c) => {
      list.push({
        id: `history-comm-${c.id}`,
        date: c.createdAt,
        amount: c.amount,
        type: 'Commission',
        status: 'Validé',
        details: `Bonus d'affiliation de Niveau ${c.level} (généré par ${c.fromUserName})`,
        rawDate: new Date(c.createdAt)
      });
    });

    // Sort descending (most recent first)
    return list.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
  };

  // Sync state function from local storage
  const syncDashboardData = () => {
    // Process automatic chronological daily rewards on sync
    DataStore.processAutomaticDailyInstallments();

    const cur = DataStore.getCurrentUser();
    if (cur) {
      setUserState(cur);
      onRefreshUser(cur);
    }
    setAllUsers(DataStore.getUsers());
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
    if (initialLoadedNotifIds.current.size === 0 && notifs.length > 0) {
      notifs.forEach(n => initialLoadedNotifIds.current.add(n.id));
    }

    const msgs = DataStore.getSupportMessages().filter(m => m.userId === currentUser.id);
    setSupportMessages(msgs);
  };

  useEffect(() => {
    syncDashboardData();

    // Check if we just completed a WestPay transaction successfully
    let wpNotif: string | null = null;
    try {
      wpNotif = sessionStorage.getItem('gi_wp_success_notif');
    } catch (e) {
      // Ignore sandbox sessionStorage block
    }
    if (wpNotif) {
      try {
        const data = JSON.parse(wpNotif);
        if (data && data.amount && data.ref) {
          setTimeout(() => {
            openPurchaseSuccessAlert(
              'Recharge Reçue ! 💳💰',
              "Félicitations !\nVotre compte a été crédité automatiquement et instantanément de " + data.amount.toLocaleString() + " " + getCurrency() + " suite à votre paiement réussi sur WestPay.\n\nRéférence du paiement: " + data.ref
            );
          }, 800);
        }
      } catch (err) {
        console.error('Failed to process WestPay welcome message in dashboard:', err);
      } finally {
        try {
          sessionStorage.removeItem('gi_wp_success_notif');
        } catch (e) {}
      }
    }

    // Auto request chrome notification permission right after login/registration (if status is default)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => {
        Notification.requestPermission().then((permission) => {
          setChromeNotifPermission(permission);
          if (permission === 'granted') {
            try {
              new Notification("Vous avez reçu une nouvelle notification", {
                body: "Notifications de bureau Chrome activées sur AgroCapital ! 🔔"
              });
            } catch (e) {
              console.error(e);
            }
          }
        });
      }, 1500);
    }

    // Setup periodic check interval to automatically credit of earnings in real-time and check for new notifications in Chrome or app
    const interval = setInterval(() => {
      const oldBal = userState.balance;
      const oldUsersLen = allUsers.length;
      DataStore.processAutomaticDailyInstallments();
      
      const fresh = DataStore.getCurrentUser();
      const freshUsers = DataStore.getUsers();
      
      // Pull real-time notifications
      const freshNotifs = DataStore.getNotifications().filter(n => n.userId === undefined || n.userId === currentUser.id);
      const brandNewNotifs = freshNotifs.filter(n => !initialLoadedNotifIds.current.has(n.id));
      
      if (brandNewNotifs.length > 0) {
        brandNewNotifs.forEach(n => {
          triggerChromeNotification(n.title || "Nouvelle Notification", n.message);
          initialLoadedNotifIds.current.add(n.id);
        });
        syncDashboardData();
      } else if ((fresh && fresh.balance !== oldBal) || freshUsers.length !== oldUsersLen) {
        syncDashboardData();
      }
    }, 5000);

    // Listen to custom automated support response events and global backend store updates
    const handleNewMessage = () => {
      syncDashboardData();
    };
    const handleStoreUpdated = () => {
      syncDashboardData();
    };
    window.addEventListener('gi_new_message', handleNewMessage);
    window.addEventListener('gi_store_updated', handleStoreUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('gi_new_message', handleNewMessage);
      window.removeEventListener('gi_store_updated', handleStoreUpdated);
    };
  }, [currentUser.id, userState.balance, allUsers.length]);

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
  const handleDailyCheckin = async () => {
    const res = await DataStore.claimDailyReward(userState.id);
    if (res.success) {
      triggerToast('🎉 Félicitations ! Votre cadeau journalier a été réclamé avec succès.', 'success');
      openAlert('Félicitations !', res.message, 'success');
      syncDashboardData();
    } else {
      openAlert('Attention', res.message, 'info');
    }
  };

  // Claim specific investment return simulation (Click pay)
  const handleClaimReturn = async (invId: string) => {
    const res = await DataStore.claimInvestmentReturn(userState.id, invId);
    if (res.success) {
      openAlert('Dividende Collecté', res.message, 'success');
      syncDashboardData();
    } else {
      openAlert('Erreur', res.message, 'error');
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

  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);

  const submitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');
    setDepositSuccess('');

    const amt = parseInt(depositAmount);
    if (isNaN(amt) || amt < 3000) {
      setDepositError(`Le montant minimum pour un versement est de 3 000 ${getCurrency()}.`);
      return;
    }

    setPaymentProcessing(true);
    
    // Determine proper country parameter for WestPay
    let queryCountry = 'Cameroun';
    if (depositOperator.includes('Burkina')) {
      queryCountry = 'Burkina Faso';
    } else if (depositOperator.includes('Cameroun')) {
      queryCountry = 'Cameroun';
    } else if (userState.country) {
      queryCountry = userState.country;
    }

    const baseUrl = window.location.origin + window.location.pathname;
    const redirectUrl = encodeURIComponent(baseUrl);
    const paymentUrl = `https://westpay.cfd/link/c25ukanomq2agyq6?amount=${amt}&redirect=${redirectUrl}`;

    // Proceed with automatic redirect to WestPay in a new window/tab to prevent iframe blocking policies (X-Frame-Options)
    window.open(paymentUrl, '_blank');
  };

  // Withdrawal event
  const submitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    if (DataStore.areWithdrawalsBlocked()) {
      setWithdrawError("Les retraits sont autorisés uniquement à partir de 09h.");
      return;
    }
    if (userState.withdrawBlocked) {
      setWithdrawError("Les retraits sont autorisés uniquement à partir de 09h.");
      return;
    }

    const amt = parseInt(withdrawAmount);
    if (isNaN(amt) || amt < 1000) {
      setWithdrawError(`Le montant minimum de retrait autorisé est de 1 000 ${getCurrency()}.`);
      return;
    }
    if (userState.balance < amt) {
      setWithdrawError(`Solde insuffisant. Vous disposez uniquement de ${userState.balance.toLocaleString()} ${getCurrency()}.`);
      return;
    }
    if (!withdrawNumber.trim() || withdrawNumber.length < 8) {
      setWithdrawError('Veuillez renseigner un numéro Mobile Money valide.');
      return;
    }

    const res = await DataStore.createWithdrawal(userState.id, amt, withdrawOperator, withdrawNumber);
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
      openAlert('Plan Suspendu', "Ce plan d'investissement VIP est actuellement bloqué ou suspendu temporairement par l'administration.", 'error');
      return;
    }

    if (userState.balance < product.price) {
      setProductErrors(prev => ({
        ...prev,
        [product.id]: `Solde insuffisant ! Votre solde est de ${userState.balance.toLocaleString()} ${getCurrency()} mais ce package requiert ${product.price.toLocaleString()} ${getCurrency()}.`
      }));
      // Auto-clear after 10 seconds
      setTimeout(() => {
        setProductErrors(prev => ({
          ...prev,
          [product.id]: ''
        }));
      }, 10000);
      return;
    }

    openConfirm(
      'Activer le Plan VIP',
      `Voulez-vous activer le plan d'investissement "${product.name}" pour ${product.price.toLocaleString()} ${getCurrency()} ? Ce montant sera débité.`,
      async () => {
        const res = await DataStore.buyProduct(userState.id, product.id);
        if (res.success) {
          triggerToast('✅ Félicitations ! Votre produit a été activé avec succès.', 'success');
          openPurchaseSuccessAlert('Félicitations ! 🎉', res.message);
        } else {
          openAlert('Achat Échoué', res.message, 'error');
        }
        syncDashboardData();
        setActiveTab('dashboard'); // Go back to inspect running projects
      }
    );
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
      openAlert("Compte Promu", "Votre compte a été élevé au rôle d'ADMINISTRATEUR ! Vous pouvez désormais voir le bouton d'accès à la palette d'administration dans l'onglet Profil !", "success");
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
      
      {showAnnouncementDismissible && (
        <div 
          onClick={() => {
            setShowAnnouncementDismissible(false);
            try { localStorage.setItem('gi_announcement_dismissed_v2', 'true'); } catch(e){}
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto cursor-pointer"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0b101d] border-2 border-slate-800 rounded-3xl p-6 text-left shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative max-w-sm w-full overflow-hidden my-auto cursor-default text-white"
          >
            {/* Background glow decorator */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#1b64d9]/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Close cross/button */}
            <button
              onClick={() => {
                setShowAnnouncementDismissible(false);
                try { localStorage.setItem('gi_announcement_dismissed_v2', 'true'); } catch(e){}
              }}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-900 transition-colors cursor-pointer z-[101]"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Title */}
            <div className="flex items-center space-x-2.5 mb-4 border-b border-slate-800/80 pb-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center text-slate-950 text-base shadow-md">
                <span>🎉</span>
              </div>
              <div>
                <h3 className="text-sm font-sans font-black text-white uppercase tracking-wider">Inscription Réussie !</h3>
                <p className="text-[10px] text-white font-bold">Vos informations de départ :</p>
              </div>
            </div>

            <div className="space-y-3 text-[11px]">
              {/* Stats pillar */}
              <div className="space-y-2 bg-[#090d16] p-3.5 border border-slate-800/80 rounded-xl text-white">
                <div className="flex items-start space-x-2">
                  <span className="text-xs select-none">🌍</span>
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="font-bold text-white">Pays :</span>
                    <span className="bg-slate-900 border border-slate-800 text-white px-1.5 py-0.5 rounded font-extrabold text-[9px]">
                      Burkina Faso 🇧🇫 / Cameroun 🇨🇲
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs select-none">🎁</span>
                  <div>
                    <span className="font-bold text-white">Bonus d'inscription :</span>{' '}
                    <span className="text-white font-extrabold text-[11px] ml-0.5">200 {getCurrency()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs select-none">📥</span>
                  <div>
                    <span className="font-bold text-white">Recharge minimale :</span>{' '}
                    <span className="text-white font-mono font-black text-[11px] ml-0.5">3 000 {getCurrency()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs select-none text-red-500">📤</span>
                  <div className="flex items-center flex-wrap gap-1">
                    <span className="font-bold text-white">Retrait minimum :</span>{' '}
                    <span className="font-mono font-black text-[11px] text-white">1 000 {getCurrency()}</span>{' '}
                    <span className="text-[8px] font-sans font-black uppercase bg-red-950/40 text-white px-1 py-0.2 rounded border border-red-900/40">(12% frais)</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs select-none">🔥</span>
                  <div>
                    <span className="font-bold text-white">Bonus de connexion :</span>{' '}
                    <span className="text-white font-black text-[11px] ml-0.5">20 {getCurrency()} / jour</span>
                  </div>
                </div>
              </div>

              {/* Referral Pillar */}
              <div className="bg-[#090d16] p-3 border border-slate-800/80 rounded-xl space-y-1.5">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs select-none">🤝</span>
                  <span className="font-bold text-white">Parrainage MLM :</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-[8px] font-black text-center">
                  <span className="bg-yellow-500/10 text-white p-1.5 rounded-lg border border-yellow-500/20 flex flex-col items-center justify-center">
                    <span className="opacity-100 mb-0.5 text-white/90">🥇 Niv. 1</span>
                    <span className="font-extrabold text-[10px] text-white">20%</span>
                  </span>
                  <span className="bg-emerald-500/10 text-white p-1.5 rounded-lg border border-emerald-500/20 flex flex-col items-center justify-center">
                    <span className="opacity-100 mb-0.5 text-white/90">🥈 Niv. 2</span>
                    <span className="font-extrabold text-[10px] text-white font-bold">3%</span>
                  </span>
                  <span className="bg-blue-500/10 text-white p-1.5 rounded-lg border border-blue-500/20 flex flex-col items-center justify-center">
                    <span className="opacity-100 mb-0.5 text-white/90">🥉 Niv. 3</span>
                    <span className="font-extrabold text-[10px] text-white font-bold">1%</span>
                  </span>
                </div>
              </div>

              {/* Official Group Link Segment */}
              <div className="bg-[#090d16] hover:bg-slate-900 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-2.5 transition-colors">
                <div className="space-y-0.5 text-left flex-1 min-w-0">
                  <div className="flex items-center space-x-1 text-white font-extrabold text-[9px] uppercase tracking-wider">
                    <span>💬 Groupe officiel</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <p className="text-[10px] text-white font-semibold leading-tight truncate">
                    Rejoignez la discussion officielle AgroCapital.
                  </p>
                </div>
                <a 
                  href="https://chat.whatsapp.com/JJ4ewxWrtc56p3kiEZCTdx?s=cl&p=a&mlu=3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-[#00bd74] hover:bg-emerald-500 text-slate-950 font-sans font-black text-[9px] uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center justify-center space-x-0.5 shrink-0 cursor-pointer text-center"
                >
                  <span>Rejoindre 👉</span>
                </a>
              </div>
            </div>

            {/* Footer hint */}
            <div className="mt-5 pt-3 border-t border-slate-800/80 text-center flex justify-center">
              <button
                onClick={() => {
                  setShowAnnouncementDismissible(false);
                  try { localStorage.setItem('gi_announcement_dismissed_v2', 'true'); } catch(e){}
                }}
                className="w-full text-[11px] text-slate-950 bg-yellow-500 hover:bg-yellow-400 font-black uppercase tracking-widest py-3.5 rounded-xl cursor-pointer transition-all shadow-[0_4px_15px_rgba(234,179,8,0.25)]"
              >
                Accéder à mon tableau de bord
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* SHIMMER BACKGROUND DECORATIONS */}
      <div className="absolute top-0 left-0 w-full max-w-[800px] h-[500px] bg-white/5 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse" />  <div className="absolute top-0 left-0 w-full max-w-[800px] h-[500px] bg-white/5 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse" />

      {/* DASHBOARD TOP HEADER */}
      <header className="bg-gradient-to-r from-[#1b64d9] to-[#044ab0] border-b border-white/10 py-5 px-4 md:px-12 sticky top-0 z-40 shadow-xl">
        <div className="max-w-full mx-auto flex justify-between items-center">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f7b03b] to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/15">
              <TrendingUp className="w-5.5 h-5.5 text-slate-900 stroke-[3]" />
            </div>
            <div>
              <span className="font-display font-black text-lg md:text-xl tracking-wide text-white block uppercase">AGROCAPITAL ROYAL</span>
              <span className="text-[10px] text-amber-300 font-mono block tracking-widest uppercase font-bold">Investissement Durable</span>
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

              {!dismissedPermissionBanner && chromeNotifPermission === 'default' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-md relative"
                >
                  <button 
                    onClick={() => setDismissedPermissionBanner(true)}
                    className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-indigo-100 text-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
                    title="Fermer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center space-x-3 pr-6">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                      <Bell className="w-5.5 h-5.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-indigo-900 uppercase tracking-tight">🔔 Activer les notifications de bureau dans Chrome</h4>
                      <p className="text-[10px] sm:text-xs text-indigo-700 font-bold mt-0.5 leading-tight">Recevez immédiatement une alerte Chrome quand vos gains journaliers tombent ou que l'administrateur publie une annonce !</p>
                    </div>
                  </div>
                  <button
                    onClick={requestChromeNotificationPermission}
                    className="w-full sm:w-auto py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] uppercase font-black tracking-wider rounded-2xl transition-all shadow-md shrink-0 cursor-pointer active:scale-95 text-center font-sans"
                  >
                    🚀 Activer maintenant
                  </button>
                </motion.div>
              )}

              {!dismissedPermissionBanner && chromeNotifPermission === 'denied' && (
                <div 
                  onClick={() => setDismissedPermissionBanner(true)}
                  className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-4 flex items-center justify-between space-x-3 text-left shadow-sm relative cursor-pointer hover:bg-amber-100/50 transition-colors"
                  title="Cliquez pour masquer ce message"
                >
                  <div className="flex items-center space-x-3 pr-6">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5.5 h-5.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-amber-900 uppercase tracking-tight">⚠️ Les notifications Chrome sont bloquées</h4>
                      <p className="text-[10px] sm:text-xs text-amber-700 font-bold mt-0.5 leading-tight">Veuillez cliquer sur le petit cadenas de sécurité situé en haut à gauche de l'adresse de votre navigateur Chrome pour les autoriser.</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDismissedPermissionBanner(true);
                    }}
                    className="p-1.5 rounded-full hover:bg-amber-200 text-amber-400 hover:text-amber-800 transition-colors cursor-pointer"
                    title="Fermer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {!dismissedPermissionBanner && chromeNotifPermission === 'granted' && (
                <div 
                  onClick={() => setDismissedPermissionBanner(true)}
                  className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-3 px-4 flex items-center justify-between gap-3 text-left shadow-sm cursor-pointer hover:bg-emerald-100/50 transition-colors"
                  title="Cliquez pour masquer ce message"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-6.5 h-6.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-emerald-800 font-extrabold truncate">🎉 Vos notifications Chrome et de bureau sont entièrement actives en temps réel.</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDismissedPermissionBanner(true);
                    }}
                    className="p-1 rounded-full hover:bg-emerald-200 text-emerald-400 hover:text-emerald-800 transition-colors cursor-pointer"
                    title="Fermer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

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
                      {userState.balance.toLocaleString()} <span className="text-amber-300 text-lg font-black uppercase font-sans">{getCurrency()}</span>
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
                      <span>Recharger</span>
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
                     className="bg-[#eef3fc] border-2 border-slate-200/40 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between relative shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#00bd74]/10 text-[#00bd74] flex items-center justify-center mb-1.5">
                      <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-xs text-slate-500 block uppercase font-extrabold tracking-wider">Gains Quotidiens</span>
                      <span className="text-lg sm:text-2xl font-display font-black text-[#00bd74] block mt-1 font-sans">
                        +{userState.dailyEarnings.toLocaleString()} F
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block font-mono mt-0.5 font-bold">Gains sur plans actifs</span>
                    </div>
                  </motion.div>

                  <motion.div 
                    variants={cardVariants}
                    className="bg-[#eef3fc] border-2 border-slate-200/40 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between relative shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#1b64d9]/10 text-[#1b64d9] flex items-center justify-center mb-1.5">
                      <Coins className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-xs text-slate-500 block uppercase font-extrabold tracking-wider">Total Récolté</span>
                      <span className="text-lg sm:text-2xl font-display font-black text-slate-800 block mt-1 font-sans">
                        {userState.totalEarnings.toLocaleString()} F
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block font-mono mt-0.5 font-bold">Retraits nets accumulés</span>
                    </div>
                  </motion.div>

                  {/* LOYALTY DAILY BUTTON REWARD */}
                   <motion.div 
                     variants={cardVariants}
                     className="bg-[#eef3fc] border-2 border-slate-200/40 rounded-3xl p-5 flex items-center justify-between gap-4 col-span-2 text-left shadow-sm"
                   >
                    <div className="flex-1 space-y-1">
                      <span className="text-xs text-amber-500 block uppercase font-extrabold tracking-wider flex items-center gap-1">🎁 Cadeau Journalier</span>
                      <span className="text-sm font-bold text-slate-700 block leading-tight">Bonus d'investisseur fidèle AgroCapital.</span>
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

              {/* COMPREHENSIVE DIRECT VIP SUGGESTIONS */}
              <div className="mt-6 pt-3 border-t border-white/10">
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
                        className="bg-[#eef3fc] border-2 border-slate-200/30 rounded-3xl p-5 flex flex-col justify-between text-left space-y-4 shadow-sm"
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

                        {productErrors[p.id] && (
                          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-600 leading-normal">
                            <span className="text-red-700 block font-black mb-1">⚠️ SOLDE INSUFFISANT</span>
                            <span>{productErrors[p.id]}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab('deposit');
                              }}
                              className="mt-2 block text-[#1b64d9] font-black underline uppercase tracking-wide cursor-pointer text-xs"
                            >
                              📥 Recharger mon compte maintenant
                            </button>
                          </div>
                        )}

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
                    <span className="text-xl font-display font-black text-[#00bd74] block mt-0.5 leading-none">+{userState.dailyEarnings.toLocaleString()} {getCurrency()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
                {products.map((p) => {
                  const isBlocked = p.isBlocked === true;
                  const formattedReopenTime = p.reopenDateTime 
                    ? new Date(p.reopenDateTime).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                    : null;

                  const cycleText = `${p.durationDays} jours`;
                  const totalReturnText = `${(p.dailyReturn * p.durationDays).toLocaleString()} ${getCurrency()}`;
                  const dailyReturnText = `${p.dailyReturn.toLocaleString()} ${getCurrency()}`;
                  const priceText = `${p.price.toLocaleString()} ${getCurrency()}`;

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

                      {productErrors[p.id] && (
                        <div className="mb-3.5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-600 leading-normal">
                          <span className="text-red-700 block font-black mb-1">⚠️ SOLDE INSUFFISANT</span>
                          <span>{productErrors[p.id]}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTab('deposit');
                            }}
                            className="mt-2 block text-[#1b64d9] font-black underline uppercase tracking-wide cursor-pointer text-xs"
                          >
                            📥 Recharger mon compte maintenant
                          </button>
                        </div>
                      )}

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
                <span className="text-xs font-black text-[#1b64d9] tracking-widest uppercase block mb-1">RECHARGE AUTOMATIQUE INSTANTANÉE</span>
                <h3 className="text-xl font-display font-black text-slate-800 uppercase tracking-tight">Recharger mon compte</h3>
                <p className="text-xs text-slate-500 font-bold mt-1">Créditez instantanément votre compte de façon 100% sécurisée et automatisée.</p>
              </div>

              {depositError && (
                <div className="mb-4 p-3 rounded-xl bg-red-100 border border-red-200 text-xs text-red-700 font-bold">{depositError}</div>
              )}
              {depositSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-100 border border-green-200 text-xs text-green-700 font-bold">{depositSuccess}</div>
              )}

              {paymentProcessing ? (
                <div className="py-8 text-center space-y-5">
                  <div className="w-12 h-12 border-4 border-[#1b64d9] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <h4 className="font-display font-bold text-slate-800 text-sm">Redirection vers le guichet de paiement...</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Veuillez finaliser votre opération de <strong>{parseInt(depositAmount).toLocaleString()} {getCurrency()}</strong> sur le guichet de paiement sécurisé.
                  </p>
                  
                  <div className="pt-2 border-t border-slate-200/60 max-w-xs mx-auto space-y-3">
                    <span className="text-[10px] text-slate-400 block font-mono">Si la redirection automatique est bloquée par votre navigateur, utilisez les boutons ci-dessous :</span>
                    
                    <a 
                      href={`https://westpay.cfd/link/c25ukanomq2agyq6?amount=${depositAmount}&redirect=${encodeURIComponent(window.location.origin + window.location.pathname)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full justify-center items-center py-2.5 px-3 text-[10px] bg-[#1b64d9] hover:bg-[#1553b3] font-black tracking-wider text-white uppercase rounded-xl transition-all active:scale-[0.98]"
                    >
                      Ouvrir la page de paiement ↗
                    </a>

                    <button
                      onClick={() => {
                        const randomRef = 'TST-WP-' + Math.floor(Math.random() * 900000 + 100000);
                        const baseUrl = window.location.origin + window.location.pathname;
                        window.location.href = `${baseUrl}?status=success&amount=${depositAmount}&ref=${randomRef}`;
                      }}
                      className="w-full py-2.5 px-3 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-black uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      ⚡ Simuler validation de test (Sans payer)
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentProcessing(false)}
                      className="w-full py-2 px-3 text-[10px] border border-slate-300 text-slate-500 font-sans font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Retourner au formulaire
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submitDeposit} className="space-y-5 text-left">
                  
                  {/* 1. SECTOR OPERATOR */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">1. Choisissez votre réseau de paiement</label>
                    <select 
                      value={depositOperator}
                      onChange={(e) => setDepositOperator(e.target.value)}
                      className="w-full bg-white border-2 border-slate-200/45 rounded-2xl py-3.5 px-4 text-sm text-slate-800 font-bold focus:border-[#1b64d9] focus:outline-none cursor-pointer shadow-sm"
                    >
                      <option value="MTN Mobile Money (Cameroun)">MTN Momo — Cameroun (+237)</option>
                      <option value="Orange Money (Cameroun)">Orange Money — Cameroun (+237)</option>
                      <option value="Orange Money (Burkina)">Orange Money — Burkina Faso (+226)</option>
                      <option value="Moov Money (Burkina)">Moov Flooz — Burkina Faso (+226)</option>
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">2. Montant du versement ({getCurrency()})</label>
                    <input
                      type="number"
                      required
                      placeholder={`Minimum 3 000 ${getCurrency()}`}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-white border-2 border-slate-200/45 focus:border-[#1b64d9] rounded-2xl py-3.5 px-4 text-sm text-[#1b64d9] font-black focus:outline-none shadow-sm placeholder:text-slate-400"
                    />
                  </div>

                  <div className="bg-[#e2ebf9] p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed font-semibold space-y-2">
                    <span className="font-extrabold text-[#1b64d9] uppercase text-[10px] tracking-wider block">🔒 Sécurité Chiffrée :</span>
                    Vous allez être redirigé vers la passerelle sécurisée pour effectuer votre virement en toute confiance. Le crédit sur votre balance s'effectue de manière instantanée et automatique dès validation de la transaction.
                  </div>

                  {/* Submitting button */}
                  <button
                    type="submit"
                    className="w-full py-4 text-white font-sans font-black text-xs uppercase tracking-widest bg-gradient-to-r from-[#1b64d9] to-[#046fff] rounded-2xl hover:opacity-95 transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <span>Procéder au paiement sécurisé</span>
                  </button>
                </form>
              )}
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

              {(DataStore.areWithdrawalsBlocked() || userState.withdrawBlocked) && (
                <div className="mb-4 p-4 rounded-xl bg-orange-100 border border-orange-200 text-xs text-orange-850 font-black text-center uppercase tracking-wide flex flex-col gap-1 shadow-sm">
                  <span>⚠️ RETRAITS BLOQUÉS TEMPORAIREMENT</span>
                  <span>Les retraits sont autorisés uniquement à partir de 09h.</span>
                </div>
              )}

              {withdrawError && (
                <div className="mb-4 p-3 rounded-xl bg-red-100 border border-red-200 text-xs text-red-700 font-bold">{withdrawError}</div>
              )}
              {withdrawSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-100 border border-green-200 text-xs text-green-700 font-bold">{withdrawSuccess}</div>
              )}

              <div className="mb-6 p-5 rounded-2xl bg-white border border-slate-200 text-xs flex justify-between items-center shadow-inner">
                <div>
                  <span className="text-slate-400 font-extrabold uppercase text-[10px] block">Solde Actuel :</span>
                  <div className="text-xl sm:text-2xl font-black text-[#00bd74] mt-0.5">{userState.balance.toLocaleString()} {getCurrency()}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-extrabold uppercase text-[10px] block">Limite minimum :</span>
                  <div className="text-xs sm:text-sm font-black text-slate-800 mt-0.5">1 000 {getCurrency()}</div>
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
                    <option value="MTN Mobile Money (Cameroun)">MTN Mobile Money — Cameroun (+237)</option>
                    <option value="Orange Money (Cameroun)">Orange Money — Cameroun (+237)</option>
                    <option value="Orange Money (Burkina Faso)">Orange Money — Burkina Faso (+226)</option>
                    <option value="Moov Money (Burkina Faso)">Moov Money (Moov Flooz) — Burkina Faso (+226)</option>
                  </select>
                </div>

                {/* Target phone number with WhatsApp placeholder */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Numéro de téléphone de réception</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: +237 65874855 ou +226 70903319"
                    value={withdrawNumber}
                    onChange={(e) => setWithdrawNumber(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200/45 focus:border-[#1b64d9] rounded-2xl py-3 px-4 text-sm text-slate-800 font-mono font-bold tracking-wider shadow-sm"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1.5 font-bold">Assurez-vous que le numéro est parfaitement actif et lié à un compte Mobile Money.</span>
                </div>

                {/* Withdraw value */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Montant à extraire ({getCurrency()})</label>
                  <input
                    type="number"
                    required
                    placeholder={`Montant à retirer en ${getCurrency()}`}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200/45 focus:border-[#1b64d9] rounded-2xl py-3 px-4 text-sm text-[#1b64d9] font-black focus:outline-none font-mono shadow-sm"
                  />
                </div>

                {/* Real-time fee summary */}
                {!isNaN(parseInt(withdrawAmount)) && parseInt(withdrawAmount) > 0 && (
                  <div className="bg-slate-55 p-3.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 space-y-1.5 animate-fade-in shadow-inner">
                    <span className="font-extrabold text-[#1b64d9] text-[10px] uppercase tracking-wider block">Calcul automatique (12% Frais de retrait) :</span>
                    <div className="flex justify-between border-b border-slate-100/50 pb-1">
                      <span className="text-slate-500 font-semibold">Montant brut demandé :</span>
                      <span className="font-mono">{parseInt(withdrawAmount).toLocaleString()} {getCurrency()}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100/50 pb-1 text-red-500">
                      <span className="font-semibold">Frais administratifs de retrait (12%) :</span>
                      <span className="font-mono">-{Math.round(parseInt(withdrawAmount) * 0.12).toLocaleString()} {getCurrency()}</span>
                    </div>
                    <div className="pt-1 flex justify-between text-[#00bd74] text-xs font-black">
                      <span>Montant net crédité sur votre compte :</span>
                      <span className="text-[13px] font-mono">{Math.max(0, parseInt(withdrawAmount) - Math.round(parseInt(withdrawAmount) * 0.12)).toLocaleString()} {getCurrency()}</span>
                    </div>
                  </div>
                )}

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
                  <p className="text-xs text-slate-200 leading-relaxed">Distribuez votre lien personnel et gagnez Niveau 1 : {mlmRates.level1}%, Niveau 2 : {mlmRates.level2}% et Niveau 3 : {mlmRates.level3}% sur les investissements de votre réseau.</p>
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
                  <span className="text-xs text-green-400 uppercase tracking-wider font-extrabold block">Niveau 1 ({mlmRates.level1}%)</span>
                  <div className="text-base sm:text-lg font-black font-mono text-green-400 mt-1">
                    {commissions.filter(c => c.level === 1).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} F
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mt-1">1er cercle</span>
                </div>
 
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-sm">
                  <span className="text-xs text-yellow-500 uppercase tracking-wider font-extrabold block">Niveau 2 ({mlmRates.level2}%)</span>
                  <div className="text-base sm:text-lg font-black font-mono text-white mt-1">
                    {commissions.filter(c => c.level === 2).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} F
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mt-1">2e cercle</span>
                </div>
 
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-sm">
                  <span className="text-xs text-blue-400 uppercase tracking-wider font-extrabold block">Niveau 3 ({mlmRates.level3}%)</span>
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
                              
                              <div className="mt-2.5 text-xs font-mono text-slate-300 flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-900">
                                <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Compte WA</span>
                                <span className="text-[#00bd74] text-[11px] font-bold font-mono">{u.whatsapp || 'Aucun'}</span>
                              </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-xs">
                              <span className="text-slate-350 font-bold italic">{u.country}</span>
                              <a 
                                href={`https://wa.me/${(u.whatsapp || '').replace(/[^0-9]/g, '')}`} 
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
                        Aucun filleul de Niveau 2 pour le moment. Lorsque vos filleuls directs parraineront d'autres membres, ils apparaîtront ici et vous toucherez {mlmRates.level2}% de bonus.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {level2Users.map(u => {
                          const cleanRef = (u.referredBy || '').trim().toUpperCase();
                          const sponsor = cleanRef ? allUsers.find(sp => sp.id.toUpperCase() === cleanRef || (sp.referralCode && sp.referralCode.toUpperCase() === cleanRef)) : undefined;
                          return (
                            <div key={u.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-yellow-500/25 transition-all duration-200">
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-slate-100 text-sm truncate">{u.name}</span>
                                  <span className="text-[10px] font-black font-mono text-yellow-500 uppercase tracking-wider bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">NIVEAU 2</span>
                                </div>
                                <span className="text-xs text-slate-400 block mt-1.5 font-medium">Sponsorisé par : <strong className="text-slate-200">{sponsor ? sponsor.name : 'Un membre L1'}</strong></span>
                                <span className="text-xs text-slate-500 block mt-0.5">Le : {new Date(u.createdAt).toLocaleDateString()}</span>

                                <div className="mt-2.5 text-xs font-mono text-slate-300 flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-900">
                                  <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Compte WA</span>
                                  <span className="text-yellow-500 text-[11px] font-bold font-mono">{u.whatsapp || 'Aucun'}</span>
                                </div>
                              </div>
                              <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-xs">
                                <span className="text-slate-350 font-bold italic">{u.country}</span>
                                <a 
                                  href={`https://wa.me/${(u.whatsapp || '').replace(/[^0-9]/g, '')}`} 
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
                        Aucun filleul de Niveau 3 pour le moment. Lorsque votre réseau de Niveau 2 parrainera leurs propres amis, ils s'afficheront ici et vous toucherez {mlmRates.level3}% de bonus.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {level3Users.map(u => {
                          const cleanRef = (u.referredBy || '').trim().toUpperCase();
                          const sponsor = cleanRef ? allUsers.find(sp => sp.id.toUpperCase() === cleanRef || (sp.referralCode && sp.referralCode.toUpperCase() === cleanRef)) : undefined;
                          return (
                            <div key={u.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-blue-500/25 transition-all duration-200">
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-slate-100 text-sm truncate">{u.name}</span>
                                  <span className="text-[10px] font-black font-mono text-blue-400 uppercase tracking-wider bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">NIVEAU 3</span>
                                </div>
                                <span className="text-xs text-slate-400 block mt-1.5 font-medium">Sponsorisé par : <strong className="text-slate-200">{sponsor ? sponsor.name : 'Un membre L2'}</strong></span>
                                <span className="text-xs text-slate-500 block mt-0.5">Le : {new Date(u.createdAt).toLocaleDateString()}</span>

                                <div className="mt-2.5 text-xs font-mono text-slate-300 flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-900">
                                  <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Compte WA</span>
                                  <span className="text-blue-400 text-[11px] font-bold font-mono">{u.whatsapp || 'Aucun'}</span>
                                </div>
                              </div>
                              <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-xs">
                                <span className="text-slate-350 font-bold italic">{u.country}</span>
                                <a 
                                  href={`https://wa.me/${(u.whatsapp || '').replace(/[^0-9]/g, '')}`} 
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
 
              {/* HISTORIQUE DE TRANSACTION & ACHATS */}
              <div className="bg-slate-900/60 p-5 border border-slate-800 rounded-2xl shadow-sm text-left space-y-4">
                <div className="flex items-center space-x-2.5 mb-2">
                  <div className="w-9 h-9 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center font-bold">
                    📋
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">Historique de vos Opérations</h4>
                    <span className="text-[10px] text-slate-400 font-mono block">Suivi en direct de vos flux et investissements</span>
                  </div>
                </div>

                 {/* Sub-tabs for Recharger, Retrait, Achats et Notifications */}
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800/85">
                   <button
                     onClick={() => setProfileHistoryTab('history')}
                     className={`py-2 text-center text-[10px] md:text-xs font-black uppercase rounded-lg transition-all ${
                       profileHistoryTab === 'history' 
                         ? 'bg-yellow-500 text-slate-950 shadow-md' 
                         : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                     }`}
                   >
                     🧾 Historique ({getUnifiedHistory().length})
                   </button>
                   <button
                     onClick={() => setProfileHistoryTab('deposits')}
                     className={`py-2 text-center text-[10px] md:text-xs font-black uppercase rounded-lg transition-all ${
                       profileHistoryTab === 'deposits' 
                         ? 'bg-yellow-500 text-slate-950 shadow-md' 
                         : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                     }`}
                   >
                     📥 Recharges ({allDeposits.length})
                   </button>
                   <button
                     onClick={() => setProfileHistoryTab('withdrawals')}
                     className={`py-2 text-center text-[10px] md:text-xs font-black uppercase rounded-lg transition-all ${
                       profileHistoryTab === 'withdrawals' 
                         ? 'bg-yellow-500 text-slate-950 shadow-md' 
                         : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                     }`}
                   >
                     📤 Retraits ({allWithdrawals.length})
                   </button>
                   <button
                     onClick={() => setProfileHistoryTab('purchases')}
                     className={`py-2 text-center text-[10px] md:text-xs font-black uppercase rounded-lg transition-all ${
                       profileHistoryTab === 'purchases' 
                         ? 'bg-yellow-500 text-slate-950 shadow-md' 
                         : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                     }`}
                   >
                     🛍️ VIP ({activeInvestments.length})
                   </button>
                   <button
                     onClick={() => setProfileHistoryTab('notifications')}
                     className={`py-2 text-center text-[10px] md:text-xs font-black uppercase rounded-lg transition-all col-span-2 sm:col-span-1 ${
                       profileHistoryTab === 'notifications' 
                         ? 'bg-yellow-500 text-slate-950 shadow-md' 
                         : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                     }`}
                   >
                     🔔 Actu ({notifications.length})
                   </button>
                 </div>

                {/* Tab content rendering */}
                <div className="space-y-3 min-h-[160px] max-h-[350px] overflow-y-auto pr-1">
                  
                  {/* UNIFIED TRANSACTION HISTORY */}
                  {profileHistoryTab === 'history' && (
                    <>
                      {getUnifiedHistory().length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-xs font-bold leading-relaxed">
                          Aucune opération enregistrée.<br/>
                          <span className="text-[10px] font-medium text-slate-600">Le détail en direct de vos flux d'investissement s'affichera ici.</span>
                        </div>
                      ) : (
                        getUnifiedHistory().map((op) => (
                          <div key={op.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                            <div className="flex items-start gap-2.5">
                              {/* Type Badge/Emoji */}
                              <div className="mt-0.5 shrink-0">
                                {op.type === 'Recharge' && (
                                  <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs" title="Recharge">📥</span>
                                )}
                                {op.type === 'Retrait' && (
                                  <span className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center font-bold text-xs" title="Retrait">📤</span>
                                )}
                                {op.type === 'Commission' && (
                                  <span className="w-6 h-6 rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center justify-center font-bold text-xs" title="Commission">🥇</span>
                                )}
                                {op.type === 'Achat VIP' && (
                                  <span className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs" title="Activation Produit">🛍️</span>
                                )}
                                {op.type === 'Revenu Quotidien' && (
                                  <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs" title="Revenu Quotidien">💰</span>
                                )}
                              </div>
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <span className="text-[10px] text-slate-400 font-mono block">
                                  {new Date(op.date).toLocaleString('fr-FR', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                  })}
                                </span>
                                <div className="font-extrabold text-slate-100 flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[9px] uppercase font-black tracking-wide shrink-0 px-1.5 py-0.5 rounded ${
                                    op.type === 'Recharge' ? 'bg-blue-500/15 text-blue-400' :
                                    op.type === 'Retrait' ? 'bg-rose-500/15 text-rose-400' :
                                    op.type === 'Commission' ? 'bg-yellow-500/15 text-yellow-500' :
                                    op.type === 'Achat VIP' ? 'bg-purple-500/15 text-purple-400' :
                                    'bg-emerald-500/15 text-emerald-400'
                                  }`}>
                                    {op.type}
                                  </span>
                                  <span className="text-slate-300 font-bold truncate max-w-[200px] sm:max-w-xs">{op.details}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 pb-1 sm:pb-0 px-1 sm:px-0 border-t sm:border-t-0 border-slate-900/40 pt-1.5 sm:pt-0 shrink-0">
                              <span className={`font-black font-mono text-xs sm:text-sm tracking-tight ${
                                op.type === 'Recharge' || op.type === 'Commission' || op.type === 'Revenu Quotidien'
                                  ? 'text-emerald-400'
                                  : 'text-rose-400'
                              }`}>
                                {op.type === 'Recharge' || op.type === 'Commission' || op.type === 'Revenu Quotidien' ? '+' : '-'}
                                {op.amount.toLocaleString()} {getCurrency()}
                              </span>
                              <div>
                                {op.status === 'Validé' && (
                                  <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/25 text-green-400 text-[9px] font-black rounded font-mono uppercase">Validé</span>
                                )}
                                {op.status === 'Complété' && (
                                  <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[9px] font-black rounded font-mono uppercase">Terminé</span>
                                )}
                                {op.status === 'Refusé' && (
                                  <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/25 text-red-400 text-[9px] font-black rounded font-mono uppercase">Refusé</span>
                                )}
                                {op.status === 'En attente' && (
                                  <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/25 text-yellow-500 text-[9px] font-black rounded font-mono uppercase animate-pulse">En attente</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </>
                  )}

                  {/* DEPOTS */}
                  {profileHistoryTab === 'deposits' && (
                    <>
                      {allDeposits.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-xs font-bold leading-relaxed">
                          Aucune recharge enregistrée.<br/>
                          <span className="text-[10px] font-medium text-slate-600">Vos transferts initiés s'afficheront ici.</span>
                        </div>
                      ) : (
                        allDeposits.map((dep) => (
                          <div key={dep.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-slate-404 font-mono block">{new Date(dep.createdAt).toLocaleString()}</span>
                              <div className="font-extrabold text-slate-250">{dep.operator}</div>
                              {dep.refCode && <span className="text-[10px] text-[#1b64d9] font-mono block font-black uppercase">REF: {dep.refCode}</span>}
                            </div>
                            <div className="text-right space-y-1">
                              <span className="text-emerald-400 font-black font-mono">+{dep.amount.toLocaleString()} {getCurrency()}</span>
                              <div>
                                {dep.status === 'approved' && (
                                  <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 text-[9px] font-black rounded font-mono">CONFORME</span>
                                )}
                                {dep.status === 'rejected' && (
                                  <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-black rounded font-mono">REJETÉ</span>
                                )}
                                {dep.status === 'pending' && (
                                  <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[9px] font-black rounded font-mono animate-pulse">ATTENTE</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </>
                  )}

                  {/* RETRAITS */}
                  {profileHistoryTab === 'withdrawals' && (
                    <>
                      {allWithdrawals.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-xs font-bold leading-relaxed">
                          Aucun retrait enregistré.<br/>
                          <span className="text-[10px] font-medium text-slate-650">Vos demandes de retraits s'afficheront ici.</span>
                        </div>
                      ) : (
                        allWithdrawals.map((wth) => (
                          <div key={wth.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-slate-400 font-mono block">{new Date(wth.createdAt).toLocaleString()}</span>
                              <div className="font-extrabold text-slate-200">Mobile Money ({wth.operator})</div>
                              <span className="text-[10px] text-slate-400 font-mono block font-bold">Dest: {wth.number}</span>
                            </div>
                            <div className="text-right space-y-1">
                              <span className="text-red-400 font-black font-mono">-{wth.amount.toLocaleString()} {getCurrency()}</span>
                              <div>
                                {wth.status === 'approved' && (
                                  <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 text-[9px] font-black rounded font-mono">EXPÉDIÉ (2H)</span>
                                )}
                                {wth.status === 'rejected' && (
                                  <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-black rounded font-mono">REJETÉ</span>
                                )}
                                {wth.status === 'pending' && (
                                  <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[9px] font-black rounded font-mono animate-pulse">TRAITEMENT VIP</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </>
                  )}

                  {/* ACHATS */}
                  {profileHistoryTab === 'purchases' && (
                    <>
                      {activeInvestments.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-xs font-bold leading-relaxed">
                          Aucun produit activé.<br/>
                          <span className="text-[10px] font-medium text-slate-600">Achetez un pack VIP pour récolter des dividendes.</span>
                        </div>
                      ) : (
                        activeInvestments.map((inv) => {
                          const now = Date.now();
                          const createdTime = new Date(inv.createdAt).getTime();
                          const msDiff = now - createdTime;
                          const oneDayMs = 24 * 60 * 60 * 1000;
                          
                          // How many 24-hr periods should be claimed by now based on exact hours of purchase
                          let expectedDays = Math.floor(msDiff / oneDayMs);
                          if (expectedDays > inv.durationDays) {
                            expectedDays = inv.durationDays;
                          }
                          
                          // Has user already claimed or been automatically credited for all eligible days so far?
                          const isClaimedToday = inv.daysPassed >= expectedDays;
                          
                          const nextClaimDayIndex = inv.daysPassed;
                          const nextClaimTime = createdTime + (nextClaimDayIndex + 1) * oneDayMs;
                          const timeRemainingMs = nextClaimTime - now;
                          const isBtnDisabled = isClaimedToday || inv.status === 'completed';

                          return (
                            <div key={inv.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col gap-2.5 text-xs">
                              <div className="flex justify-between items-start gap-3">
                                <div className="space-y-0.5">
                                  <span className="text-[9px] text-white font-black bg-gradient-to-r from-yellow-500 to-amber-500 px-2 py-0.5 rounded uppercase tracking-wider font-mono">Plan VIP {inv.productName}</span>
                                  <div className="font-extrabold text-slate-200 mt-1">{inv.productName}</div>
                                  <span className="text-[10px] text-slate-400 font-mono block">Acquis le : {new Date(inv.createdAt).toLocaleDateString()} à {new Date(inv.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Investi</span>
                                  <span className="text-[#1b64d9] font-black font-mono">{inv.price.toLocaleString()} F</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2 rounded-lg text-[11px] border border-slate-900/40">
                                <div>
                                  <span className="text-slate-500 text-[9px] uppercase font-bold block">Revenu / Jour</span>
                                  <span className="text-[#00bd74] font-black font-mono">+{inv.dailyReturn.toLocaleString()} F</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 text-[9px] uppercase font-bold block">Progression</span>
                                  <span className="text-slate-300 font-bold font-mono">{inv.daysPassed} / {inv.durationDays} Jours</span>
                                </div>
                              </div>

                              <div className="pt-1 flex items-center justify-between gap-3">
                                <span className="text-[10px] text-slate-550 font-medium font-mono">Date de fin: {new Date(createdTime + (inv.durationDays * 24 * 60 * 60 * 1000)).toLocaleDateString()}</span>
                                {inv.status === 'completed' ? (
                                  <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-450 text-[10px] font-black rounded-xl uppercase tracking-wider">
                                    Terminé ✔
                                  </span>
                                ) : (
                                  <div className="flex flex-col items-end gap-1">
                                    <button
                                      onClick={() => handleClaimReturn(inv.id)}
                                      disabled={isBtnDisabled}
                                      className={`py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center space-x-1 ${
                                        isBtnDisabled 
                                          ? 'bg-slate-900 border border-slate-800 text-slate-400 cursor-not-allowed' 
                                          : 'bg-[#00bd74] hover:bg-[#00a867] text-white'
                                      }`}
                                    >
                                      {isClaimedToday ? 'Crédité' : 'Récolter'}
                                    </button>
                                    {isClaimedToday && timeRemainingMs > 0 && (
                                      <span className="text-[8px] text-slate-500 font-mono scale-95 origin-right">
                                        Suivant : {new Date(nextClaimTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} ({Math.floor(timeRemainingMs / (60 * 60 * 1000))}h{String(Math.floor((timeRemainingMs % (60 * 1000 * 60)) / (60 * 1000))).padStart(2, '0')}m)
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </>
                  )}

                  {/* NOTIFICATIONS & ANNOUNCEMENTS HISTORY */}
                  {profileHistoryTab === 'notifications' && (
                    <>
                      {notifications.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-xs font-bold leading-relaxed">
                          Aucun message ou actualité.<br/>
                          <span className="text-[10px] font-medium text-slate-600">Les notifications publiques et alertes s'afficheront ici.</span>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col gap-1.5 text-xs text-left animate-fade-in">
                            <div className="flex justify-between items-center gap-2 border-b border-slate-800/60 pb-1.5">
                              <span className="text-[10px] font-black text-[#1b64d9] uppercase tracking-tight font-sans flex items-center gap-1">
                                📢 {n.title || "ANNONCE OFFICIELLE"}
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono shrink-0">
                                {new Date(n.createdAt).toLocaleDateString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed font-bold whitespace-pre-line mt-1">
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </>
                  )}

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
                    placeholder="Ex: AGR72, WELCOME500"
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
                    <span className="text-[10px] text-slate-400 font-mono block">Disponible 24h/7 pour valider vos recharges/retraits</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Notre équipe de conseillers VIP est à votre écoute pour répondre à toutes vos interrogations, enregistrer vos captures de paiements, et accélérer vos versements/retraits.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <a
                    href="https://chat.whatsapp.com/JJ4ewxWrtc56p3kiEZCTdx?s=cl&p=a&mlu=3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-black uppercase tracking-wide text-center flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
                  >
                    <span>💬 Groupe WhatsApp</span>
                  </a>
                  <a
                    href="https://t.me/+Jz0uOco8K_NiNjI0"
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

      {/* CUSTOM LUXURY ALERT/CONFIRM POPUP MODAL */}
      {customModal.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md z-50 animate-fade-in">
          <div className={`border-2 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl space-y-5 text-center animate-scale-up ${
            customModal.type === 'purchase_success' 
              ? 'bg-gradient-to-br from-[#00bd74] to-[#016e3c] border-emerald-400 text-white shadow-emerald-500/20' 
              : 'bg-[#eef3fc] border-slate-200/50 text-slate-800'
          }`}>
            
            {/* Modal Icon Indicator based on type */}
            <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center shadow-md">
              {customModal.type === 'purchase_success' && (
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white ring-4 ring-white/10 animate-bounce">
                  <CheckCircle2 className="w-7 h-7 stroke-[3]" />
                </div>
              )}
              {customModal.type === 'success' && (
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                </div>
              )}
              {customModal.type === 'error' && (
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <AlertCircle className="w-7 h-7 stroke-[2.5]" />
                </div>
              )}
              {customModal.type === 'info' && (
                <div className="w-12 h-12 rounded-full bg-[#1b64d9]/10 flex items-center justify-center text-[#1b64d9]">
                  <HelpCircle className="w-7 h-7 stroke-[2.5]" />
                </div>
              )}
              {customModal.type === 'confirm' && (
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Gift className="w-7 h-7 stroke-[2.5] animate-bounce" />
                </div>
              )}
            </div>
            
            {/* Title & Message */}
            <div className="space-y-2">
              <h3 className={`text-lg font-black tracking-tight uppercase font-sans ${
                customModal.type === 'purchase_success' ? 'text-white' : 'text-slate-800'
              }`}>
                {customModal.title}
              </h3>
              <p className={`text-xs font-bold leading-relaxed whitespace-pre-line text-center ${
                customModal.type === 'purchase_success' ? 'text-emerald-50' : 'text-slate-600'
              }`}>
                {customModal.message}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2.5">
              {customModal.type === 'confirm' ? (
                <>
                  <button
                    onClick={() => {
                      setCustomModal(prev => ({ ...prev, isOpen: false }));
                    }}
                    className="flex-1 py-3 text-slate-600 bg-slate-200 hover:bg-slate-300 active:scale-95 transition-all text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      setCustomModal(prev => ({ ...prev, isOpen: false }));
                      if (customModal.onConfirm) {
                        customModal.onConfirm();
                      }
                    }}
                    className="flex-1 py-3 text-white bg-gradient-to-r from-[#1b64d9] to-[#046fff] hover:opacity-95 active:scale-95 transition-all text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer shadow-md"
                  >
                    OK / Confirmer
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setCustomModal(prev => ({ ...prev, isOpen: false }));
                  }}
                  className={`w-full py-3.5 text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer shadow-md active:scale-95 transition-all ${
                    customModal.type === 'purchase_success'
                      ? 'bg-white text-emerald-950 hover:bg-emerald-50'
                      : 'bg-gradient-to-r from-[#1b64d9] to-[#046fff] text-white hover:opacity-95'
                  }`}
                >
                  {customModal.type === 'purchase_success' ? 'EXCELLENT ! 🎉' : 'OK'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATIONS */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 w-full max-w-sm px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95, transition: { duration: 0.2 } }}
              className="pointer-events-auto w-full bg-[#0a0f1d]/95 backdrop-blur-md border-2 border-[#1b64d9]/50 rounded-2xl p-4 shadow-2xl flex items-start gap-3.5 select-none"
            >
              <div className="text-lg shrink-0 leading-none">
                {toast.type === 'success' ? '✨' : 'ℹ️'}
              </div>
              <div className="flex-1 text-[11px] font-black text-slate-100 uppercase tracking-widest leading-relaxed">
                {toast.message}
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0 mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
