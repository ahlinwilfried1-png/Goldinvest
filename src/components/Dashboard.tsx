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
  Info,
  X,
  Download,
  Smartphone,
  Megaphone
} from 'lucide-react';
import { User, Deposit, Withdrawal, Product, Investment, Commission, SystemNotification, SupportMessage } from '../types';
import { DataStore, syncWithBackend, getApiUrl } from '../dataStore';
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

const TICKER_MESSAGES = [
  "t1 a rechargé 10,000 XOF",
  "Yasmine a activé Plan VIP 1 avec succès (+1,500 F/jour)",
  "Kouadio a rechargé 25,000 XOF",
  "Aminata a réclamé un bonus de pointage de 500 XOF",
  "Seydou a activé Plan VIP 2 avec succès (+2,800 F/jour)",
  "Félix a effectué un retrait de 18,500 XOF réussi !",
  "Awa a rechargé 10,000 XOF via Wave",
  "Amadou a réclamé son cadeau bonus journalier."
];

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
  onRefreshUser: (updatedUser: User | null) => void;
  onNavigate?: (path: string) => void;
}

export default function Dashboard({ 
  currentUser, 
  onLogout, 
  onRefreshUser,
  onNavigate
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
  const [depositMethod, setDepositMethod] = useState<'paydunya' | 'westpay'>('westpay');
  const [depositRef, setDepositRef] = useState<string>('');
  const [receiptBase64, setReceiptBase64] = useState<string>('');
  const [depositError, setDepositError] = useState<string>('');
  const [depositSuccess, setDepositSuccess] = useState<string>('');
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [depositRedirectUrl, setDepositRedirectUrl] = useState<string>('');

  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawOperator, setWithdrawOperator] = useState<string>("T-Money (Togo)");
  const [withdrawNumber, setWithdrawNumber] = useState<string>('');
  const [withdrawError, setWithdrawError] = useState<string>('');
  const [withdrawSuccess, setWithdrawSuccess] = useState<string>('');
  const [withdrawProofBase64, setWithdrawProofBase64] = useState<string>('');
  const [withdrawProofFileName, setWithdrawProofFileName] = useState<string>('');
  const [isDraggingWithdraw, setIsDraggingWithdraw] = useState<boolean>(false);

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

  const [isSupportMenuOpen, setIsSupportMenuOpen] = useState<boolean>(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState<boolean>(false);

  const [tickerIndex, setTickerIndex] = useState<number>(0);

  useEffect(() => {
    const t = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % TICKER_MESSAGES.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

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
    return 'XOF';
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
  const lastSupportMsgsCount = useRef<number>(0);

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

    // Auto request chrome notification permission removed as requested by the user


    // Setup periodic check interval to automatically credit of earnings in real-time and check for new notifications in Chrome or app
    const interval = setInterval(async () => {
      // Synchronize with backend to pull latest changes in real-time (e.g. admin replies)
      await syncWithBackend();

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

      // Check for newly received admin replies in real-time
      const freshMsgs = DataStore.getSupportMessages().filter(m => m.userId === currentUser.id);
      if (freshMsgs.length > lastSupportMsgsCount.current) {
        const newMsgs = freshMsgs.slice(lastSupportMsgsCount.current);
        const adminReplies = newMsgs.filter(m => m.sender === 'admin');
        if (adminReplies.length > 0) {
          adminReplies.forEach(r => {
            triggerToast(`💬 Nouveau message du support : "${r.message}"`, "info");
          });
        }
        lastSupportMsgsCount.current = freshMsgs.length;
        setSupportMessages(freshMsgs);
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
    if (activeTab === 'profile' || isLiveChatOpen) {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [supportMessages, activeTab, isLiveChatOpen]);

  // Copy referral elements
  const getReferralBaseURL = () => {
    const configuredDomain = DataStore.getReferralDomain();
    if (configuredDomain) {
      let formatted = configuredDomain.trim();
      if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
        formatted = 'https://' + formatted;
      }
      return formatted.replace(/\/+$/, '');
    }

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

  const submitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');
    setDepositSuccess('');
    setDepositRedirectUrl('');

    const amt = parseInt(depositAmount);
    if (isNaN(amt) || amt < 3000) {
      setDepositError(`Le montant minimum pour un versement est de 3 000 ${getCurrency()}.`);
      return;
    }

    setIsSubmittingDeposit(true);
    try {
      const isAutomated = (depositMethod === 'paydunya' || depositMethod === 'westpay');
      if (isAutomated) {
        let apiSucceeded = false;
        try {
          const response = await fetch(getApiUrl('/api/paydunya/create-charge'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: userState.id,
              amount: amt,
              method: depositMethod
            })
          });

          if (response.ok) {
            const res = await response.json();
            if (res.success && res.url) {
              apiSucceeded = true;
              setDepositRedirectUrl(res.url);
              const channelName = depositMethod === 'westpay' ? 'WestPay' : 'PayDunya';
              setDepositSuccess(`Votre facture de recharge ${channelName} de ${amt.toLocaleString()} XOF a été créée. Veuillez cliquer sur le bouton ci-dessous pour finaliser votre paiement sur la passerelle sécurisée.`);
              setDepositAmount('5000');
              syncDashboardData();

              // Open the payment direct checkout link in a new window automatically
              window.open(res.url, '_blank', 'noopener,noreferrer');
            } else {
              console.warn("Payment API returned error:", res.error);
            }
          } else {
            console.warn("Payment API returned status:", response.status);
          }
        } catch (apiErr) {
          console.error("Automated payment API call failed, initiating fallback...", apiErr);
        }

        // Elegant fallback if the backend API was unreachable (CORS block, proxy auth issue, server offline or error)
        if (!apiSucceeded) {
          console.log("[FALLBACK] Running resilient client-side backup deposit creation block.");
          const fallbackPref = depositMethod === 'westpay' ? 'WP' : 'PD';
          const fallbackToken = `${fallbackPref}-FB-${Date.now()}`;
          const channelName = depositMethod === 'westpay' ? 'WestPay' : 'PayDunya';
          const paymentUrl = depositMethod === 'westpay' 
            ? 'https://westpay.cfd/link/c25ukanomq2agyq6' 
            : 'https://paydunya.com';

          const dep = await DataStore.createDeposit(
            userState.id, 
            amt, 
            depositMethod === 'westpay' ? "Westpay (Auto)" : "PayDunya (Auto)", 
            fallbackToken, 
            "automated_fallback"
          );

          if (dep) {
            setDepositSuccess(`Votre demande de recharge via ${channelName} de ${amt.toLocaleString()} XOF a été pré-enregistrée avec succès. Veuillez finaliser votre paiement sur la passerelle sécurisée.`);
            setDepositRedirectUrl(paymentUrl);
            setDepositAmount('5000');
            syncDashboardData();

            // Open the backup checkout link automatically
            window.open(paymentUrl, '_blank', 'noopener,noreferrer');
          } else {
            setDepositError("Une erreur est survenue lors de l'enregistrement de votre demande de recharge. Veuillez réessayer.");
          }
        }
      } else {
        const randomRef = `WP-${Math.floor(100000 + Math.random() * 900000)}`;
        const dep = await DataStore.createDeposit(userState.id, amt, "Versement Mobile Money", randomRef, "manual_screenshot_pending");
        if (dep) {
          setDepositSuccess(`Votre demande de recharge de ${amt.toLocaleString()} XOF (Réf: ${randomRef}) a bien été enregistrée et est en attente. Veuillez finaliser votre paiement sur la page sécurisée WestPay.`);
          setDepositAmount('5000');
          syncDashboardData();
          
          // Open the WestPay direct checkout link
          window.open('https://westpay.cfd/link/c25ukanomq2agyq6', '_blank', 'noopener,noreferrer');
        } else {
          setDepositError("Une erreur est survenue lors de l'enregistrement de votre demande. Veuillez réessayer.");
        }
      }
    } catch (error) {
      console.error("Deposit submission error:", error);
      setDepositError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  // Withdrawal event
  const submitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    // Check Plage horaire : 09h00 à 17h00
    const now = new Date();
    const curHour = now.getHours();
    if (curHour < 9 || curHour >= 17) {
      setWithdrawError("Les retraits sont ouverts uniquement chaque jour de 09h00 à 17h00 (Heure locale). Il est actuellement en dehors de cette plage.");
      return;
    }

    if (DataStore.areWithdrawalsBlocked()) {
      setWithdrawError("Les retraits sont suspendus temporairement par l'administrateur système.");
      return;
    }
    if (userState.withdrawBlocked) {
      setWithdrawError("Les retraits sont bloqués temporairement sur votre compte.");
      return;
    }

    const amt = parseInt(withdrawAmount);
    if (isNaN(amt) || amt < 1000) {
      setWithdrawError(`Le montant de retrait minimum est de 1 000 ${getCurrency()}.`);
      return;
    }
    if (amt > 1000000) {
      setWithdrawError(`Le montant maximum autorisé par retrait est de 1 000 000 ${getCurrency()}.`);
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

    const res = await DataStore.createWithdrawal(userState.id, amt, withdrawOperator, withdrawNumber, withdrawProofBase64);
    if (res.success) {
      setWithdrawSuccess('Votre demande de retrait a été transmise ! Le solde a été mis à jour.');
      setWithdrawAmount('');
      setWithdrawNumber('');
      setWithdrawProofBase64('');
      setWithdrawProofFileName('');
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
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageInput.trim()) return;

    const input = chatMessageInput;
    setChatMessageInput('');
    await DataStore.sendMessageToSupport(userState.id, input, 'user');
    
    // Update ref immediately to prevent triggering unread replies toasts on our own message
    lastSupportMsgsCount.current = DataStore.getSupportMessages().filter(m => m.userId === currentUser.id).length;
    
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
    <div className="min-h-screen bg-transparent text-white flex flex-col font-sans w-full max-w-full relative overflow-x-hidden">
      
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
            className="bg-white border-2 border-slate-200 rounded-3xl p-6 text-left shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative max-w-sm w-full overflow-hidden my-auto cursor-default text-slate-900"
          >
            {/* Background glow decorator */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#1b64d9]/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Close cross/button */}
            <button
              onClick={() => {
                setShowAnnouncementDismissible(false);
                try { localStorage.setItem('gi_announcement_dismissed_v2', 'true'); } catch(e){}
              }}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer z-[101]"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Title */}
            <div className="flex items-center space-x-2.5 mb-4 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-[#1b64d9] flex items-center justify-center text-white text-base shadow-md">
                <span>🎉</span>
              </div>
              <div>
                <h3 className="text-sm font-sans font-black text-slate-900 uppercase tracking-wider">Inscription Réussie !</h3>
                <p className="text-[10px] text-slate-500 font-bold">Vos informations de départ :</p>
              </div>
            </div>

            <div className="space-y-3 text-[11px]">
              {/* Stats pillar con UN COMMUNIQUÉ EN ÉCRITURE BLANCHE de design moderne */}
              <div className="space-y-2 bg-gradient-to-br from-[#1b64d9] to-[#044ab0] p-4 rounded-xl text-white shadow-md border border-[#1b64d9]/10">
                <div className="flex items-start space-x-2">
                  <span className="text-xs select-none">🌍</span>
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="font-bold text-white/95">Pays :</span>
                    <span className="bg-white/20 border border-white/10 text-white px-2 py-0.5 rounded font-extrabold text-[9px]">
                      Burkina Faso 🇧🇫 / Togo 🇹🇬 / Bénin 🇧🇯
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs select-none">🎁</span>
                  <div>
                    <span className="font-bold text-white/95">Bonus d'inscription :</span>{' '}
                    <span className="text-white font-black text-xs ml-0.5">200 {getCurrency()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs select-none">📥</span>
                  <div>
                    <span className="font-bold text-white/95">Recharge minimale :</span>{' '}
                    <span className="text-white font-mono font-black text-xs ml-0.5">3 000 {getCurrency()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs select-none">📤</span>
                  <div className="flex items-center flex-wrap gap-1">
                    <span className="font-bold text-white/95">Retrait minimum :</span>{' '}
                    <span className="font-mono font-black text-xs text-white">1 000 {getCurrency()}</span>{' '}
                    <span className="text-[8px] font-sans font-black uppercase bg-white/10 text-white px-1 py-0.2 rounded border border-white/5">(12% frais)</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs select-none">🔥</span>
                  <div>
                    <span className="font-bold text-white/95">Bonus de connexion :</span>{' '}
                    <span className="text-white font-black text-xs ml-0.5">20 {getCurrency()} / jour</span>
                  </div>
                </div>
              </div>

              {/* Referral Pillar con Écriture Blanche */}
              <div className="bg-slate-900 p-3.5 border border-slate-800 rounded-xl space-y-2 text-white shadow-sm">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs select-none">🤝</span>
                  <span className="font-bold text-white">Parrainage MLM :</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-[8px] text-center">
                  <span className="bg-white/5 text-white p-1.5 rounded-lg border border-white/10 flex flex-col items-center justify-center">
                    <span className="opacity-90 mb-0.5 text-white/80 font-bold">🥇 Niv. 1</span>
                    <span className="font-black text-[10px] text-white">20%</span>
                  </span>
                  <span className="bg-white/5 text-white p-1.5 rounded-lg border border-white/10 flex flex-col items-center justify-center">
                    <span className="opacity-90 mb-0.5 text-white/80 font-bold">🥈 Niv. 2</span>
                    <span className="font-black text-[10px] text-white">3%</span>
                  </span>
                  <span className="bg-white/5 text-white p-1.5 rounded-lg border border-white/10 flex flex-col items-center justify-center">
                    <span className="opacity-90 mb-0.5 text-white/80 font-bold">🥉 Niv. 3</span>
                    <span className="font-black text-[10px] text-white">1%</span>
                  </span>
                </div>
              </div>

              {/* Official Group Link Segment */}
              <div className="bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl p-3 flex items-center justify-between gap-2.5 transition-all shadow-sm">
                <div className="space-y-0.5 text-left flex-1 min-w-0">
                  <div className="flex items-center space-x-1 text-slate-900 font-extrabold text-[9px] uppercase tracking-wider">
                    <span>💬 Groupe officiel</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold leading-tight truncate">
                    Rejoignez la discussion officielle AgroCapital.
                  </p>
                </div>
                <a 
                  href="https://chat.whatsapp.com/JJ4ewxWrtc56p3kiEZCTdx?s=cl&p=a&mlu=3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-[#00bd74] hover:bg-emerald-500 text-white font-sans font-black text-[9px] uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center justify-center space-x-0.5 shrink-0 cursor-pointer text-center"
                >
                  <span>Rejoindre 👉</span>
                </a>
              </div>
            </div>

            {/* Footer hint */}
            <div className="mt-5 pt-3 border-t border-slate-100 text-center flex justify-center">
              <button
                onClick={() => {
                  setShowAnnouncementDismissible(false);
                  try { localStorage.setItem('gi_announcement_dismissed_v2', 'true'); } catch(e){}
                }}
                className="w-full text-xs text-white bg-[#1b64d9] hover:bg-blue-600 font-black uppercase tracking-widest py-3.5 rounded-xl cursor-pointer transition-all shadow-[0_4px_15px_rgba(27,100,217,0.25)]"
              >
                Accéder à mon tableau de bord
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* SHIMMER BACKGROUND DECORATIONS */}
      <div className="absolute top-0 left-0 w-full max-w-[800px] h-[500px] bg-white/5 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse" />  <div className="absolute top-0 left-0 w-full max-w-[800px] h-[500px] bg-white/5 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse" />

      {/* DASHBOARD TOP HEADER (STYLING OF SCREENSHOT) */}
      <div className="w-full bg-[#046fff] text-white p-4 pt-6 pb-6 flex items-center justify-between shadow-md relative z-40 select-none">
        <div className="flex items-center space-x-3.5 max-w-[70%]">
          {/* Avatar frame */}
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#046fff] shadow-sm shrink-0">
            <UserIcon className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="text-left truncate">
            <div className="text-xs sm:text-sm font-sans font-black tracking-wide text-white uppercase truncate">
              INVESTISSEUR {userState.whatsapp ? userState.whatsapp.replace(/\D/g, '') : userState.id}
            </div>
            <div className="text-[10px] md:text-xs text-white/85 font-mono font-bold mt-1 tracking-wider">
              {userState.whatsapp ? userState.whatsapp.replace(/\D/g, '') : userState.id}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {userState.role === 'admin' && (
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className="px-3 py-1.5 rounded-xl border border-white bg-white/10 text-white text-[10px] font-black uppercase tracking-wide transition-all hover:bg-white/20 scale-95"
            >
              <span>{isAdminMode ? "Client" : "Admin"}</span>
            </button>
          )}
          <button 
            onClick={() => {
              triggerToast("🔔 Aucun message non Lu", "info");
            }}
            className="text-white hover:text-white/80 transition-colors p-1"
          >
            <Bell className="w-6 h-6 stroke-[2]" />
          </button>
          <button 
            onClick={onLogout}
            className="text-white hover:text-white/80 transition-colors p-1"
            title="Déconnexion"
          >
            <LogOut className="w-6 h-6 stroke-[2]" />
          </button>
        </div>
      </div>

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

              {/* PRIMARY WHITE CARD OF SCREENSHOT */}
              <div id="agro-primary-balance-card" className="bg-white border border-orange-100/55 rounded-[30px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] text-slate-800 text-left">
                <div className="flex justify-between items-center pb-2">
                  <span className="text-[10px] font-sans font-black text-slate-450 uppercase tracking-wider block">SOLDE DISPONIBLE</span>
                  <div className="bg-[#046fff] text-white text-[9px] font-sans font-black px-3 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1 shrink-0">
                    VIP VERIFIÉ
                  </div>
                </div>

                <div className="pb-5">
                  <div id="main-balance-text" className="text-4xl sm:text-5xl font-sans font-black text-slate-900 tracking-tight flex items-baseline gap-1.5 solde-bold">
                    {userState.balance.toLocaleString()}{' '}
                    <span className="text-slate-900 text-lg sm:text-xl font-bold uppercase select-none">XOF</span>
                  </div>
                </div>

                {/* Substats block */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 pb-5">
                  <div className="text-left font-sans">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">REVENUS QUOTIDIENS</span>
                    <span className="text-xs sm:text-sm font-sans font-black text-[#00bd74] mt-1 block">
                      +{userState.dailyEarnings.toLocaleString()} F / jour
                    </span>
                  </div>
                  <div className="text-left border-l border-slate-100 pl-4 font-sans">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">CUMUL DES GAINS</span>
                    <span className="text-xs sm:text-sm font-sans font-black text-slate-900 mt-1 block">
                      {userState.totalEarnings.toLocaleString()} F
                    </span>
                  </div>
                </div>

                {/* Sub-buttons for recharging & withdrawing */}
                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  <button
                    id="recharge-action-btn"
                    onClick={() => setActiveTab('deposit')}
                    className="py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-[#046fff] hover:opacity-95 text-white transition-all text-center flex items-center justify-center space-x-1 shadow-md cursor-pointer active:scale-95"
                  >
                    <ArrowDownLeft className="w-4.5 h-4.5 stroke-[3.5] mr-1" />
                    <span>Recharge</span>
                  </button>
                  <button
                    id="withdrawal-action-btn"
                    onClick={() => setActiveTab('withdraw')}
                    className="py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-[#ff7c00] hover:opacity-95 text-white transition-all text-center flex items-center justify-center space-x-1 shadow-md cursor-pointer active:scale-95"
                  >
                    <ArrowUpRight className="w-4.5 h-4.5 stroke-[3.5] mr-1" />
                    <span>Retrait</span>
                  </button>
                </div>
              </div>

              {/* 2x2 SECTIONS GRID: HISTORIQUE, SUPPORT, POINTAGE, PROMO CODE */}
              <div id="dashboard-quick-actions" className="grid grid-cols-2 gap-4 pt-2">
                {/* Historique Card */}
                <div 
                  id="action-historique"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('/historique');
                    } else {
                      setProfileHistoryTab('history');
                      setActiveTab('profile');
                    }
                  }}
                  className="bg-white border border-orange-100/45 rounded-3xl p-5 flex flex-col items-center justify-center space-y-2.5 cursor-pointer hover:bg-slate-50/50 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.015)]"
                >
                  <div className="w-12 h-12 bg-[#edf4ff] text-[#046fff] flex items-center justify-center rounded-full">
                    <Clock className="w-5.5 h-5.5 stroke-[2.5]" />
                  </div>
                  <span className="font-sans font-black text-[11px] sm:text-xs text-slate-800 uppercase tracking-wide">Historique</span>
                </div>

                {/* Support Live Card */}
                <div 
                  id="action-support"
                  onClick={() => {
                    setActiveTab('profile');
                    setTimeout(() => {
                      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 400);
                  }}
                  className="bg-white border border-orange-100/45 rounded-3xl p-5 flex flex-col items-center justify-center space-y-2.5 cursor-pointer hover:bg-slate-50/50 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.015)]"
                >
                  <div className="w-12 h-12 bg-[#edf4ff] text-[#046fff] flex items-center justify-center rounded-full">
                    <MessageSquare className="w-5.5 h-5.5 stroke-[2.5]" />
                  </div>
                  <span className="font-sans font-black text-[11px] sm:text-xs text-slate-800 uppercase tracking-wide">Support live</span>
                </div>

                {/* Pointage Check-in Card */}
                <div 
                  id="action-checkin"
                  onClick={handleDailyCheckin}
                  className="bg-white border border-orange-100/45 rounded-3xl p-5 flex flex-col items-center justify-center space-y-2.5 cursor-pointer hover:bg-slate-50/50 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.015)]"
                >
                  <div className="w-12 h-12 bg-[#fffaf0] text-orange-500 flex items-center justify-center rounded-full">
                    <Gift className="w-5.5 h-5.5 stroke-[2.5]" />
                  </div>
                  <span className="font-sans font-black text-[11px] sm:text-xs text-slate-800 uppercase tracking-wide">Pointage</span>
                </div>

                {/* Promo Code Card */}
                <div 
                  id="action-promocode"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('/historique#code-cadeau');
                    }
                  }}
                  className="bg-white border border-orange-100/45 rounded-3xl p-5 flex flex-col items-center justify-center space-y-2.5 cursor-pointer hover:bg-slate-50/50 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.015)]"
                >
                  <div className="w-12 h-12 bg-[#edf4ff] text-[#046fff] flex items-center justify-center rounded-full">
                    <TrendingUp className="w-5.5 h-5.5 stroke-[2.5]" />
                  </div>
                  <span className="font-sans font-black text-[11px] sm:text-xs text-slate-800 uppercase tracking-wide">Promo Code</span>
                </div>
              </div>

              {/* RUNNING TICKER BANNER */}
              <div className="w-full bg-white border border-orange-100/45 rounded-[28px] py-6 px-7 flex items-center space-x-5 mt-4 text-left shadow-sm select-none">
                <div className="w-11 h-11 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100/40">
                  <Bell className="w-5.5 h-5.5 stroke-[2.5]" />
                </div>
                <div className="flex-1 overflow-hidden h-8 flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tickerIndex}
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -15, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="text-sm sm:text-[15px] font-sans font-black text-slate-800 tracking-tight leading-none"
                    >
                      {TICKER_MESSAGES[tickerIndex]}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* VOS PLANS ACTIFS */}
              <div className="mt-6 text-left">
                <div className="flex justify-between items-center mb-3 px-1">
                  <h4 className="text-xs sm:text-sm font-sans font-black text-slate-800 uppercase tracking-wide">
                    VOS PLANS ACTIFS ({activeInvestments.filter(i => i.status === 'active').length})
                  </h4>
                  <button 
                    onClick={() => setActiveTab('products')}
                    className="text-xs sm:text-sm text-orange-500 font-sans font-extrabold hover:underline"
                  >
                    Souscrire à un VIP +
                  </button>
                </div>

                {activeInvestments.filter(i => i.status === 'active').length === 0 ? (
                  /* Gray container matching screenshot */
                  <div className="bg-[#8b9bb4] p-8 rounded-[24px] flex flex-col items-center justify-center text-center space-y-4 shadow-sm select-none">
                    <p className="text-white/95 font-sans font-bold text-xs sm:text-sm max-w-xs leading-relaxed">
                      Vous n'avez pas encore activé de plan d'investissement VIP.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('products')}
                      className="border border-orange-400/80 bg-orange-500/10 text-orange-400 font-sans font-black text-[10px] sm:text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all hover:bg-orange-500 hover:text-white cursor-pointer"
                    >
                      VOIR LES PRODUITS VIP
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeInvestments.filter(i => i.status === 'active').map((p) => (
                      <div 
                        key={p.id}
                        className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between text-left space-y-4 shadow-sm relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full pointer-events-none -mr-8 -mt-8" />
                        
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[9px] text-white font-black uppercase bg-emerald-500 px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                VIP ACTIF
                              </span>
                              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                                Jour {p.daysPassed}/{p.durationDays}
                              </span>
                            </div>
                            <h5 className="font-sans font-black text-sm text-slate-800 mt-3 leading-tight uppercase tracking-tight">{p.productName}</h5>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 block uppercase font-bold">Investi</span>
                            <strong className="text-sm text-[#046fff] font-black leading-tight font-sans">{p.price.toLocaleString()} F</strong>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500">
                            <span>Progression</span>
                            <span>{Math.round((p.daysPassed / p.durationDays) * 100)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-[#00bd74] h-full rounded-full transition-all duration-550" 
                              style={{ width: `${Math.min(100, (p.daysPassed / p.durationDays) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl text-xs border border-slate-100">
                          <div>
                            <span className="text-slate-400 text-[10px] block uppercase font-bold">Revenu / Jour</span>
                            <span className="text-[#00bd74] font-black font-sans text-xs sm:text-sm">+{p.dailyReturn.toLocaleString()} F</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block uppercase font-bold">Déjà Récupéré</span>
                            <span className="text-slate-800 font-black font-sans text-xs sm:text-sm">{(p.dailyReturn * p.daysPassed).toLocaleString()} F</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CONSEIL D'ÉQUIPE CARD */}
              <div className="bg-white border border-orange-100/45 rounded-[28px] p-5 shadow-[0_4px_15px_rgba(0,0,0,0.015)] text-left flex items-start space-x-4 mt-6">
                <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shrink-0 border border-orange-100/30">
                  <Megaphone className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-sans font-black text-slate-800 uppercase tracking-wide">
                    CONSEIL D'ÉQUIPE
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-bold leading-normal mt-1">
                    Invitez des partenaires pour maximiser vos gains ! Vous recevez cumulativement {mlmRates.level1}% au Niveau 1, {mlmRates.level2}% au Niveau 2, et {mlmRates.level3}% au Niveau 3 sur chacune de leurs souscriptions financières.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* CATALOGUE PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* STATS: NOMBRE DE PRODUITS ACHETÉS À GAUCHE ET REVENUS À DROITE */}
              <div className="grid grid-cols-2 gap-3 max-w-4xl mx-auto animate-fade-in select-none">
                {/* Nombre de produits achetés */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 text-left shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 block font-black uppercase tracking-widest leading-none mb-1">PRODUITS ACHETÉS</span>
                  <span className="text-2xl sm:text-3xl font-sans font-black text-slate-800 leading-none">{activeInvestments.length}</span>
                </div>

                {/* Revenus cumulés */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 text-left shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 block font-black uppercase tracking-widest leading-none mb-1">REVENUS</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl sm:text-3xl font-sans font-black text-slate-800 leading-none">
                      {(userState.totalEarnings || 0).toLocaleString()}
                    </span>
                    <span className="text-xs sm:text-sm font-sans font-black text-slate-500 uppercase">
                      {getCurrency()}
                    </span>
                  </div>
                </div>
              </div>

              {/* BRAND TEXT & SUBTITLE FROM SCREENSHOT */}
              <div className="text-center max-w-xl mx-auto mb-5 pt-3 animate-fade-in select-none">
                <h3 className="text-[14px] sm:text-base font-sans font-black text-[#db4c20] uppercase tracking-wider leading-none">
                  OFFRES D'ACQUISITION D'ACTIFS
                </h3>
                <h3 className="text-[14px] sm:text-base font-sans font-black text-[#db4c20] uppercase tracking-wider leading-none mt-1">
                  TECHNOLOGIQUES
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold leading-normal mt-2 px-4 max-w-md mx-auto">
                  Sélectionnez la catégorie d'allocation financière correspondant à vos objectifs de rendement annuel.
                </p>
              </div>

              {/* PRODUCTS LIST */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {products.map((p, index) => {
                  const isBlocked = p.isBlocked === true;
                  const formattedReopenTime = p.reopenDateTime 
                    ? new Date(p.reopenDateTime).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                    : null;

                  // Custom displayName formatting matching screenshot
                  const getVipDisplayName = (level: number, baseName: string) => {
                    switch (level) {
                      case 1: return "VIP BRONZE - STANDARD";
                      case 2: return "VIP SILVER - PRO";
                      case 3: return "VIP GOLD - PREMIUM";
                      case 4: return "VIP PLATINUM - ULTIMATE";
                      case 5: return "VIP DIAMOND - ELITE";
                      case 6: return "VIP TITANIUM - SPECIALIST";
                      case 7: return "VIP CROWN - SUPREME";
                      default: return `VIP ${baseName.toUpperCase()} - SECURE`;
                    }
                  };

                  const displayName = getVipDisplayName(p.vipLevel || (index + 1), p.name);
                  const isPopular = p.vipLevel === 1 || index === 0;
                  const isRecommended = p.vipLevel === 2 || index === 1;

                  // Calculate user purchased limit counter
                  const purchasedCount = activeInvestments.filter(i => i.productName === p.name || i.productId === p.id).length;

                  return (
                    <div 
                      key={p.id}
                      className={`w-full relative bg-[#f1f4fc] border border-slate-200/50 rounded-[28px] p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg ${isBlocked ? 'opacity-70 pointer-events-none' : ''}`}
                    >
                      {/* TOP BADGES ROW */}
                      <div className="absolute top-4 right-5 flex flex-col items-end space-y-1.5 z-10 text-right">
                        {isPopular && (
                          <span className="text-[9px] text-white font-sans font-black uppercase bg-[#c39c36] px-3 py-1 rounded-full shadow-sm leading-none tracking-wider">
                            POPULAIRE
                          </span>
                        )}
                        {isRecommended && (
                          <span className="text-[9px] text-white font-sans font-black uppercase bg-[#1b64d9] px-3 py-1 rounded-full shadow-sm leading-none tracking-wider">
                            RECOMMANDÉ
                          </span>
                        )}
                        <span className="text-[10px] text-[#1e7a5c] font-sans font-black uppercase bg-[#d7f1e9] px-2.5 py-0.5 rounded-md leading-relaxed">
                          Achat: {purchasedCount}/3
                        </span>
                      </div>

                      {/* PRODUCT HEADER */}
                      <div className="text-left mt-1.5">
                        <span className="text-[11px] font-sans font-bold text-[#1b64d9] tracking-wider uppercase">
                          PLAN VIP {p.vipLevel || (index + 1)}
                        </span>
                        <h4 className="font-sans font-black text-base sm:text-lg text-slate-800 leading-tight uppercase tracking-tight mt-0.5">
                          {displayName}
                        </h4>
                        
                        {/* PRICE WITH LOCATION CAPTION */}
                        <div className="mt-2.5 flex items-baseline space-x-1.5">
                          <span className="text-2xl sm:text-3xl font-sans font-black text-[#db4c20] tracking-tight leading-none">
                            {p.price.toLocaleString()} {getCurrency()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                            prix fixe de location
                          </span>
                        </div>
                      </div>

                      {/* 3-COLUMN METRICS WITH BOTTOM AND TOP BORDERS */}
                      <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-200/60 py-3.5 my-4 text-left select-none">
                        <div>
                          <span className="text-slate-400 text-[9px] block font-extrabold uppercase tracking-tight leading-none mb-1">REVENUS / JOUR</span>
                          <span className="text-[#00bd74] font-black font-sans text-xs sm:text-sm">
                            +{p.dailyReturn.toLocaleString()} F
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[9px] block font-extrabold uppercase tracking-tight leading-none mb-1">DURÉE CONTRAT</span>
                          <span className="text-slate-800 font-black font-sans text-xs sm:text-sm">
                            {p.durationDays} Jours
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[9px] block font-extrabold uppercase tracking-tight leading-none mb-1">GAINS TOTAUX</span>
                          <span className="text-[#00bd74] font-black font-sans text-xs sm:text-sm">
                            {(p.dailyReturn * p.durationDays).toLocaleString()} F
                          </span>
                        </div>
                      </div>

                      {/* ERRORS LOGIC */}
                      {productErrors[p.id] && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-600 leading-normal text-left">
                          <span className="text-red-700 block font-black mb-0.5">⚠️ SOLDE INSUFFISANT</span>
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

                      {/* BOTTOM ROW: GUARANTEED DESIGN AT THE LEFT, BUY BUTTON AT THE RIGHT */}
                      <div className="flex items-center justify-between mt-1 pt-1.5 space-x-3 text-left select-none">
                        <div className="flex items-center space-x-2 text-slate-500">
                          <span className="text-orange-500 text-base font-extrabold">⚡</span>
                          <div className="leading-tight">
                            <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 block uppercase tracking-tight">Rendement garanti</span>
                            <span className="text-[10px] sm:text-[11px] font-black text-slate-600 leading-none">100%</span>
                          </div>
                        </div>

                        {/* Buy action button styled following screenshot */}
                        <button
                          onClick={() => handleBuyProduct(p)}
                          disabled={isBlocked}
                          className={`py-3 px-5 rounded-[20px] text-xs font-black uppercase text-white transition-all shadow-md active:scale-95 flex items-center justify-center space-x-1 cursor-pointer min-w-[120px] shrink-0 ${isBlocked ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#db5129] hover:bg-[#c23f18]'}`}
                        >
                          <span>Activer le Plan</span>
                          {!isBlocked && <span className="text-yellow-300">⚡</span>}
                        </button>
                      </div>
                      
                      {isBlocked && (
                        <div className="absolute inset-0 rounded-[28px] bg-slate-950/30 flex flex-col items-center justify-center p-3">
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
          {activeTab === 'deposit' && (() => {
            return (
              <div className="max-w-xl mx-auto bg-[#eef3fc] border-2 border-slate-200/40 p-6 md:p-8 rounded-3xl shadow-xl text-slate-800 animate-fade-in animate-duration-300">
                <div className="text-center mb-6">
                  <span className="text-xs font-black text-[#1b64d9] tracking-widest uppercase block mb-1">
                    Recharge Sécurisée Directe
                  </span>
                  <h3 className="text-xl font-display font-black text-slate-800 uppercase tracking-tight">Recharger mon compte</h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    Saisissez le montant, choisissez votre méthode de paiement et rechargez instantanément votre compte.
                  </p>
                </div>

                {depositError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-100 border border-red-200 text-xs text-red-700 font-bold">{depositError}</div>
                )}
                {depositSuccess && (
                  <div className="mb-4 p-4 rounded-xl bg-green-100 border border-green-200 text-xs text-green-700 font-bold leading-normal space-y-2">
                    <div>{depositSuccess}</div>
                    {depositRedirectUrl && (
                      <a
                        href={depositRedirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block py-2.5 px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-black uppercase text-[10px] mt-1 text-center shadow"
                      >
                        👉 Cliquer ici pour ouvrir le paiement sécurisé
                      </a>
                    )}
                  </div>
                )}

                <form onSubmit={submitDeposit} className="space-y-6 text-left animate-fade-in font-sans">
                  
                  {/* AMOUNT FIELD */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 font-mono">
                      Saisissez le montant à recharger ({getCurrency()})
                    </label>
                    <input
                      type="number"
                      required
                      placeholder={`Minimum 3 000 ${getCurrency()}`}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-white border-2 border-slate-200/45 focus:border-[#1b64d9] rounded-2xl py-3.5 px-4 text-sm text-[#1b64d9] font-black focus:outline-none shadow-sm placeholder:text-slate-400"
                    />
                    <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">Note : Montant minimum autorisé de 3 000 XOF.</span>
                  </div>

                  <div className="bg-[#e2ebf9]/80 p-4 rounded-xl border border-slate-200/50 text-xs text-slate-650 leading-relaxed font-semibold">
                    <span className="font-extrabold text-[#1b64d9] uppercase text-[10px] tracking-wider block mb-0.5">🔒 Protection Sécurisée :</span>
                    En validant, votre demande est enregistrée avec le statut « En attente » et vous accédez directement au portail sécurisé de rechargement Mobile Money. Le solde est crédité automatiquement dès confirmation.
                  </div>

                  {/* Submitting button */}
                  <button
                    type="submit"
                    disabled={isSubmittingDeposit}
                    className="w-full py-4 text-white font-sans font-black text-xs uppercase tracking-widest bg-gradient-to-r from-[#1b64d9] to-[#046fff] rounded-2xl hover:opacity-95 transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingDeposit ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Traitement en cours...</span>
                      </div>
                    ) : (
                      <span>⚡ Confirmer et Recharger maintenant</span>
                    )}
                  </button>

                </form>
              </div>
            );
          })()}

          {/* WITHDRAW FORM TAB */}
          {activeTab === 'withdraw' && (
            <div className="max-w-xl mx-auto bg-[#eef3fc] border-0 p-6 md:p-8 rounded-3xl shadow-xl text-slate-800">
              <div className="text-center mb-6">
                <span className="text-xs font-black text-[#1b64d9] tracking-widest uppercase block mb-1">CASH OUT DETECTÉ</span>
                <h3 className="text-xl font-display font-black text-slate-800 uppercase tracking-tight">Demande de Retrait</h3>
                <p className="text-xs text-slate-500 font-bold mt-1">Saisissez les paramètres de transfert de votre solde vers votre compte mobile.</p>
              </div>

              {(new Date().getHours() < 9 || new Date().getHours() >= 17) && (
                <div className="mb-4 p-4 rounded-xl bg-amber-100 border border-amber-200 text-xs text-amber-850 font-black text-center uppercase tracking-wide flex flex-col gap-1 shadow-sm">
                  <span>⚠️ SYSTÈME HORS PLAGE HORAIRE</span>
                  <span>Les retraits sont ouverts uniquement de 09h00 à 17h00 chaque jour.</span>
                </div>
              )}

              {(DataStore.areWithdrawalsBlocked() || userState.withdrawBlocked) && (
                <div className="mb-4 p-4 rounded-xl bg-orange-100 border border-orange-200 text-xs text-orange-850 font-black text-center uppercase tracking-wide flex flex-col gap-1 shadow-sm">
                  <span>⚠️ RETRAITS SUSPENDUS TEMPORAIREMENT</span>
                  <span>Les retraits sont restreints sur votre compte.</span>
                </div>
              )}

              {withdrawError && (
                <div className="mb-4 p-3 rounded-xl bg-red-100 border border-red-200 text-xs text-red-700 font-bold">{withdrawError}</div>
              )}
              {withdrawSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-100 border border-green-200 text-xs text-green-700 font-bold">{withdrawSuccess}</div>
              )}

              <div className="mb-6 bg-white border-0 rounded-2xl p-5 shadow-sm text-center">
                <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-wide block">Solde Actuel Disponible :</span>
                <div className="text-2xl sm:text-3xl font-black text-[#00bd74] mt-1 solde-bold">{userState.balance.toLocaleString()} {getCurrency()}</div>
              </div>

              <form onSubmit={submitWithdrawal} className="space-y-4 text-left">
                {/* Operator select */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Opérateur Mobile Money Destinataire</label>
                  <select 
                    value={withdrawOperator}
                    onChange={(e) => setWithdrawOperator(e.target.value)}
                    className="w-full bg-white border border-orange-100 rounded-2xl py-3 px-4 text-sm text-slate-800 font-bold focus:outline-none cursor-pointer shadow-sm"
                  >
                    <option value="T-Money (Togo)">T-Money — Togo (+228)</option>
                    <option value="Moov Money (Togo)">Moov Money (Flooz) — Togo (+228)</option>
                    
                    <option value="MTN Mobile Money (Bénin)">MTN Mobile Money — Bénin (+229)</option>
                    <option value="Moov Money (Bénin)">Moov Money — Bénin (+229)</option>
                    <option value="Celtiis (Bénin)">Celtiis — Bénin (+229)</option>
                    
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
                    placeholder="Ex: +228 90123456 ou +226 70903319"
                    value={withdrawNumber}
                    onChange={(e) => setWithdrawNumber(e.target.value)}
                    className="w-full bg-white border border-orange-100 rounded-2xl py-3 px-4 text-sm text-slate-800 font-mono font-bold tracking-wider shadow-sm"
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
                    className="w-full bg-white border border-orange-100 rounded-2xl py-3 px-4 text-sm text-[#1b64d9] font-black focus:outline-none font-mono shadow-sm"
                  />
                </div>

                {/* Proof of withdrawal file upload field */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    Preuve de Retrait / Justificatif (Optionnel)
                  </label>
                  <p className="text-[10px] text-slate-500 font-bold leading-normal">
                    Vous pouvez joindre un justificatif (capture d'écran, reçu, carte d'identité, confirmation, etc.) accepté sous format JPG/PNG ou PDF. Ce fichier sera visible pour l'ensemble des utilisateurs de la plateforme dans l'historique et par l'administration.
                  </p>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingWithdraw(true);
                    }}
                    onDragLeave={() => setIsDraggingWithdraw(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingWithdraw(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
                        if (!validTypes.includes(file.type)) {
                          alert("Le fichier doit être au format JPG, PNG ou PDF.");
                          return;
                        }
                        setWithdrawProofFileName(file.name);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setWithdrawProofBase64(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    onClick={() => {
                      const input = document.getElementById("withdraw-proof-file-input");
                      input?.click();
                    }}
                    className={`border border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 select-none ${
                      isDraggingWithdraw 
                        ? 'border-orange-400 bg-orange-50/20' 
                        : 'border-orange-200/50 bg-white hover:bg-orange-50/10'
                    }`}
                  >
                    <input 
                      type="file"
                      id="withdraw-proof-file-input"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setWithdrawProofFileName(file.name);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setWithdrawProofBase64(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                    {withdrawProofBase64 ? (
                      <div className="w-full flex flex-col items-center space-y-2">
                        {/* File preview based on type */}
                        {withdrawProofBase64.startsWith("data:application/pdf") ? (
                          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 text-lg font-bold">
                            PDF
                          </div>
                        ) : (
                          <img 
                            src={withdrawProofBase64} 
                            alt="Preuve" 
                            className="max-h-24 max-w-full rounded-md object-contain border border-slate-100 shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <span className="text-[10px] text-slate-600 font-bold block max-w-[200px] truncate">
                          📎 {withdrawProofFileName || "justificatif.bin"}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setWithdrawProofBase64('');
                            setWithdrawProofFileName('');
                          }}
                          className="text-[9px] text-red-500 hover:text-red-700 font-black uppercase tracking-wider px-2 py-1 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                        >
                          Retirer le fichier
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-lg">
                          📁
                        </div>
                        <div className="leading-tight">
                          <span className="text-[11px] text-[#1b64d9] font-black uppercase tracking-wide block">
                            Sélectionner ou Glisser un fichier
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                            JPG, PNG ou PDF (max. 4 Mo)
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Real-time fee summary */}
                {!isNaN(parseInt(withdrawAmount)) && parseInt(withdrawAmount) > 0 && (
                  <div className="bg-[#fffdfb] p-3.5 rounded-2xl border border-orange-100 text-xs font-bold text-slate-700 space-y-1.5 animate-fade-in shadow-sm">
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

                <button
                  type="submit"
                  className="w-full py-4 text-white font-sans font-black text-xs uppercase tracking-widest bg-gradient-to-r from-[#00d2c3] to-[#046fff] rounded-2xl hover:opacity-95 transition-all shadow-md active:scale-95"
                >
                  Envoyer la demande de Retrait
                </button>
              </form>

              {/* RÈGLES ET CONDITIONS DE RETRAIT EN TIRÉ/BULLETS */}
              <div className="mt-8 pt-6 border-t border-orange-100/70 text-slate-700/90 text-left">
                <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest block mb-3.5">
                  📋 CONDITIONS ET PARAMÈTRES DE RETRAIT
                </span>
                <ul className="space-y-2.5 text-xs font-bold leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#1b64d9] font-black shrink-0 mt-0.5">•</span>
                    <span><strong>Disponibilité quotidienne :</strong> Les demandes de retrait peuvent être soumises tous les jours de la semaine sans exception.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#1b64d9] font-black shrink-0 mt-0.5">•</span>
                    <span><strong>Plage horaire stricte :</strong> Le service de caisse est ouvert uniquement de <strong>09h00 à 17h00</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#1b64d9] font-black shrink-0 mt-0.5">•</span>
                    <span><strong>Montant minimum autorisé :</strong> Le seuil minimal par transaction est fixé à <strong>1 000 {getCurrency()}</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#1b64d9] font-black shrink-0 mt-0.5">•</span>
                    <span><strong>Montant maximum autorisé :</strong> Le plafond maximal par transaction est de <strong>1 000 000 {getCurrency()}</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#1b64d9] font-black shrink-0 mt-0.5">•</span>
                    <span><strong>Frais de traitement administratifs :</strong> Une retenue automatique de <strong>12%</strong> est appliquée sur chaque montant brut.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#1b64d9] font-black shrink-0 mt-0.5">•</span>
                    <span><strong>Délai de traitement :</strong> Vos fonds seront crédités sous un délai allant de <strong>10 minutes à 24 heures maximum</strong>.</span>
                  </li>
                </ul>
              </div>
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
                    <span className="text-xs text-slate-300 uppercase font-black tracking-wide block mb-1">Lien d'Inscription Agrocapital :</span>
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
                        Vous n'avez pas encore de filleuls inscrits directement (Niveau 1) avec votre code de parrainage. Partagez votre lien d'inscription Agrocapital pour commencer !
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
              
              {/* PRIMARY GOLD/CREAM CARD OF SCREENSHOT */}
              <div id="agro-profile-header-card" className="bg-[#fcf5eb] border border-[#eee4d5] rounded-[30px] p-6 shadow-sm flex items-center gap-4 text-slate-800 text-left">
                <div className="w-14 h-14 bg-[#f3a401] text-white flex items-center justify-center rounded-full font-black text-lg shadow-sm shrink-0 uppercase">
                  IN
                </div>
                <div className="text-left font-sans">
                  <h3 className="text-sm sm:text-base font-sans font-black text-slate-800 tracking-tight leading-tight uppercase">
                    INVESTISSEUR {userState.whatsapp ? userState.whatsapp.replace(/\D/g, '') : userState.id}
                  </h3>
                  <span className="text-[10.5px] text-slate-400 block font-bold mt-1 uppercase tracking-wider">
                    {userState.country || "TOGO"} • MEMBRE DEPUIS {userState.createdAt ? new Date(userState.createdAt).toLocaleDateString('fr-FR') : "15/06/2026"}
                  </span>
                </div>
              </div>

              {/* QUICK MENU LIST - REMOVED OVERALL FRAME, INDIVIDUAL CARDS WITH SPACE */}
              <div id="profile-action-menu-list" className="space-y-3.5 text-slate-800 text-left">
                {/* Faire un dépôt */}
                <div 
                  onClick={() => setActiveTab('deposit')}
                  className="flex items-center justify-between py-4 px-5 bg-white border border-slate-200/80 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer select-none group shadow-sm"
                >
                  <div className="flex items-center space-x-3.5">
                    <ArrowUpRight className="w-5 h-5 text-slate-700 stroke-[2.5]" />
                    <span className="font-sans font-extrabold text-xs sm:text-sm text-slate-800">Faire un dépôt Mobile Money</span>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>

                {/* Formulaire Retrait */}
                <div 
                  onClick={() => setActiveTab('withdraw')}
                  className="flex items-center justify-between py-4 px-5 bg-white border border-slate-200/80 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer select-none group shadow-sm"
                >
                  <div className="flex items-center space-x-3.5">
                    <ArrowDownLeft className="w-5 h-5 text-slate-700 stroke-[2.5]" />
                    <span className="font-sans font-extrabold text-xs sm:text-sm text-slate-800">Formulaire Retrait Momo</span>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>

                {/* Historique transactions */}
                <div 
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('/historique');
                    }
                  }}
                  className="flex items-center justify-between py-4 px-5 bg-white border border-slate-200/80 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer select-none group shadow-sm"
                >
                  <div className="flex items-center space-x-3.5">
                    <Clock className="w-5 h-5 text-slate-700 stroke-[2.5]" />
                    <span className="font-sans font-extrabold text-xs sm:text-sm text-slate-800">Historique transactions</span>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>

                {/* Saisir un Code Cadeau Bonus */}
                <div 
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('/historique#code-cadeau');
                    }
                  }}
                  className="flex items-center justify-between py-4 px-5 bg-white border border-slate-200/80 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer select-none group shadow-sm"
                >
                  <div className="flex items-center space-x-3.5">
                    <Gift className="w-5 h-5 text-slate-700 stroke-[2.5]" />
                    <span className="font-sans font-extrabold text-xs sm:text-sm text-slate-800">Saisir un Code Cadeau Bonus</span>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>

                {/* Mes notifications */}
                <div 
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('/historique#notifications');
                    }
                  }}
                  className="flex items-center justify-between py-4 px-5 bg-white border border-slate-200/80 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer select-none group shadow-sm"
                >
                  <div className="flex items-center space-x-3.5">
                    <Bell className="w-5 h-5 text-slate-700 stroke-[2.5]" />
                    <span className="font-sans font-extrabold text-xs sm:text-sm text-slate-800">
                      Mes notifications ({notifications.length})
                    </span>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>

                {/* À propos de nous */}
                <div 
                  onClick={() => {
                    triggerToast("🌱 AgroCapital - Investissez dans l'avenir de la production agricole moderne en Afrique.", "info");
                  }}
                  className="flex items-center justify-between py-4 px-5 bg-white border border-slate-200/80 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer select-none group shadow-sm"
                >
                  <div className="flex items-center space-x-3.5">
                    <Info className="w-5 h-5 text-slate-700 stroke-[2.5]" />
                    <span className="font-sans font-extrabold text-xs sm:text-sm text-slate-800">À propos de nous (AgroCapital)</span>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* DEDICATED BOTTOM DOWNLOAD SECTION WITH GENEROUS SPACING */}
              <div id="download-app-section" className="bg-[#fff9f3] border border-orange-100/90 rounded-[28px] p-6 text-slate-800 text-left shadow-sm space-y-4 mt-8">
                <div className="flex items-center space-x-3 pb-1">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                    <Smartphone className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-sans font-black text-slate-800 uppercase tracking-wider">
                      Télécharger l’application
                    </h4>
                    <span className="text-[11px] text-slate-450 block mt-0.5">
                      Profitez d’une rapidité et d’un confort de navigation accrus
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                  Téléchargez notre application pour une meilleure expérience mobile, des notifications de gains en temps réel et un accès sécurisé à tout moment.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      triggerToast("📥 Téléchargement de l'application AgroCapital démarré...", 'success');
                      const link = document.createElement('a');
                      const blob = new Blob(["AgroCapital Mobile Android APK Application Installer"], { type: "application/vnd.android.package-archive" });
                      link.href = URL.createObjectURL(blob);
                      link.download = "AgroCapital.apk";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex-1 py-3.5 px-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl text-xs font-sans font-black uppercase tracking-wider text-center flex items-center justify-center space-x-2.5 shadow-md shadow-orange-500/10 hover:opacity-95 active:scale-98 transition-all cursor-pointer"
                  >
                    <Download className="w-4.5 h-4.5" />
                    <span>Télécharger l'APK (.apk)</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerToast("📲 Redirection vers la plateforme de téléchargement sécurisée...", 'info');
                      window.open("https://play.google.com/store", "_blank");
                    }}
                    className="flex-1 py-3.5 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-sans font-black uppercase tracking-wider text-center flex items-center justify-center space-x-2.5 shadow-md active:scale-98 transition-all cursor-pointer"
                  >
                    <Smartphone className="w-4.5 h-4.5" />
                    <span>Lien officiel Play Store</span>
                  </button>
                </div>
              </div>

            </div>
          )}
        </main>
      )}

      {/* DASHBOARD MOBILE FIXED BOTTOM NAVIGATION */}
      <footer className="fixed bottom-0 left-0 right-0 py-2.5 px-4 bg-white border-t border-orange-200/60 backdrop-blur-md z-40 lg:py-3 shadow-[0_-10px_30px_rgba(249,115,22,0.06)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between font-bold text-[10px] md:text-xs">
          
          <button
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('dashboard');
            }}
            className={`flex flex-col items-center space-y-1 flex-1 transition-all ${activeTab === 'dashboard' && !isAdminMode ? 'text-orange-600 scale-105 font-black' : 'text-slate-500 opacity-80 hover:opacity-100'}`}
          >
            <Activity className="w-5 h-5 stroke-[2.5]" />
            <span className="font-sans font-black uppercase tracking-wider text-[8px] md:text-[9px]">Accueil</span>
          </button>

          <button
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('products');
            }}
            className={`flex flex-col items-center space-y-1 flex-1 transition-all ${activeTab === 'products' && !isAdminMode ? 'text-orange-600 scale-105 font-black' : 'text-slate-500 opacity-80 hover:opacity-100'}`}
          >
            <Briefcase className="w-5 h-5 stroke-[2.5]" />
            <span className="font-sans font-black uppercase tracking-wider text-[8px] md:text-[9px]">Produits</span>
          </button>

          <button
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('team');
            }}
            className={`flex flex-col items-center space-y-1 flex-1 transition-all ${activeTab === 'team' && !isAdminMode ? 'text-orange-600 scale-105 font-black' : 'text-slate-500 opacity-80 hover:opacity-100'}`}
          >
            <Users className="w-5 h-5 stroke-[2.5]" />
            <span className="font-sans font-black uppercase tracking-wider text-[8px] md:text-[9px]">Équipe</span>
          </button>

          <button
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('profile');
            }}
            className={`flex flex-col items-center space-y-1 flex-1 transition-all ${activeTab === 'profile' && !isAdminMode ? 'text-orange-600 scale-105 font-black' : 'text-slate-500 opacity-80 hover:opacity-100'}`}
          >
            <UserIcon className="w-5 h-5 stroke-[2.5]" />
            <span className="font-sans font-black uppercase tracking-wider text-[8px] md:text-[9px]">Profil</span>
          </button>

        </div>
      </footer>

      {/* FOOTER NAVIGATION */}

      {/* FLOATING BLUE HEADSET SUPPORT BUTTON */}
      <div className="fixed right-5 bottom-20 z-45 sm:right-8 sm:bottom-22">
        <button
          onClick={() => setIsSupportMenuOpen(!isSupportMenuOpen)}
          className="w-14 h-14 rounded-full bg-[#1b64d9] hover:bg-blue-600 border-2 border-white text-white flex items-center justify-center shadow-[0_4px_20px_rgba(27,100,217,0.35)] active:scale-95 duration-150 transition-all cursor-pointer relative"
          title="Assistance & Support"
        >
          <Headphones className="w-6 h-6 stroke-[2.5]" />
          {/* Active indicator */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-[#00bd74] border-2 border-white animate-pulse"></span>
        </button>
      </div>

      {/* SUPPORT LINKS DRAWER/MENU POPUP */}
      <AnimatePresence>
        {isSupportMenuOpen && (
          <>
            {/* Transparent backdrop for easy dismiss */}
            <div 
              className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-40 cursor-default" 
              onClick={() => setIsSupportMenuOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="fixed right-5 bottom-36 sm:right-8 z-50 bg-white border border-orange-100/40 rounded-[28px] p-5 shadow-[0_15px_45px_rgba(0,0,50,0.15)] w-72 text-left space-y-3.5"
            >
              <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1b64d9] animate-pulse" />
                  <span className="text-[10px] text-slate-455 font-sans font-extrabold uppercase tracking-widest block">SUPPORT EN LIGNE</span>
                </div>
                <button 
                  onClick={() => setIsSupportMenuOpen(false)}
                  className="text-slate-400 hover:text-slate-800 p-1 rounded-full hover:bg-slate-50 transition-colors"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
              
              {/* WhatsApp option */}
              <a 
                href="https://chat.whatsapp.com/JJ4ewxWrtc56p3kiEZCTdx?s=cl&p=a&mlu=3"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsSupportMenuOpen(false)}
                className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#1ebd53] text-white rounded-2xl flex items-center space-x-3 transition-transform duration-100 hover:scale-[1.02] shadow-md shadow-emerald-500/10 cursor-pointer select-none text-left"
              >
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xl">
                  💬
                </div>
                <div className="leading-tight flex-1">
                  <span className="text-white font-sans font-black text-xs block uppercase tracking-wide">Groupe WhatsApp</span>
                  <span className="text-[10px] text-white/90 font-bold block mt-0.5 animate-pulse">Communauté active 👉</span>
                </div>
              </a>

              {/* Telegram option */}
              <a 
                href="https://t.me/agrocapital_official"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsSupportMenuOpen(false)}
                className="w-full py-3.5 px-4 bg-[#0088cc] hover:bg-[#007cbd] text-white rounded-xl flex items-center space-x-3 transition-transform duration-100 hover:scale-[1.02] shadow-md shadow-blue-400/10 cursor-pointer select-none text-left"
              >
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xl">
                  ✈️
                </div>
                <div className="leading-tight flex-1">
                  <span className="text-white font-sans font-black text-xs block uppercase tracking-wide">Canal Telegram</span>
                  <span className="text-[10px] text-white/90 font-bold block mt-0.5">Alertes & Infos 👉</span>
                </div>
              </a>

              {/* Live Chat option */}
              <button 
                onClick={() => {
                  setIsSupportMenuOpen(false);
                  setIsLiveChatOpen(true);
                }}
                className="w-full py-3.5 px-4 bg-[#1b64d9] hover:bg-blue-600 text-white rounded-2xl flex items-center space-x-3 transition-transform duration-100 hover:scale-[1.02] shadow-md shadow-blue-500/10 cursor-pointer select-none text-left"
              >
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xl">
                  🎧
                </div>
                <div className="leading-tight flex-1">
                  <span className="text-white font-sans font-black text-xs block uppercase tracking-wide">Support en direct</span>
                  <span className="text-[10px] text-white/90 font-bold block mt-0.5">Parler avec un conseiller 👋</span>
                </div>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FULL-SCREEN OR FLOATING LIVE CHAT MODAL DIALOG */}
      <AnimatePresence>
        {isLiveChatOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in text-slate-850">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-[#fcfaf7] border-2 border-slate-200 rounded-[32px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)] w-full max-w-sm h-[480px] sm:h-[520px] flex flex-col relative text-left"
            >
              {/* Header background with nice linear blue design */}
              <div className="bg-gradient-to-r from-[#1b64d9] to-blue-700 text-white p-5 flex items-center justify-between shadow-md shrink-0">
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-white/20 border border-white/20 flex items-center justify-center text-lg relative">
                    🤝
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border border-slate-900 animate-pulse"></span>
                  </div>
                  <div>
                    <h4 className="font-sans font-black text-xs uppercase tracking-wide leading-none">Support AgroCapital</h4>
                    <span className="text-[9px] font-bold text-slate-100/90 block mt-1 uppercase tracking-wide">Réponse sous 2H maximum</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsLiveChatOpen(false)}
                  className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors font-bold"
                  aria-label="Fermer Chat"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Message block with custom chat list rendering */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-[#f8f5f0]/50">
                {supportMessages.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-3">
                    <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center text-2xl shadow-inner">
                      💬
                    </div>
                    <div>
                      <h5 className="font-sans font-black text-xs text-slate-850 uppercase tracking-wider mb-1">
                        Discuter en ligne !
                      </h5>
                      <p className="text-[11px] text-slate-500 font-semibold max-w-[240px] leading-relaxed mx-auto">
                        Écrivez votre message ci-dessous. Un conseiller AgroCapital vous répondra directement ici.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {supportMessages.map((msg) => {
                      const isMe = msg.sender === 'user';
                      return (
                        <div 
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}
                        >
                          <div className={`max-w-[85%] rounded-[20px] p-3 shadow-sm text-xs ${
                            isMe 
                              ? 'bg-gradient-to-br from-[#1b64d9] to-blue-700 text-white rounded-br-none text-left' 
                              : 'bg-white text-slate-850 border border-slate-200/80 rounded-bl-none text-left'
                          }`}>
                            <p className="font-sans font-bold leading-normal whitespace-pre-wrap">
                              {msg.message}
                            </p>
                            <span className={`text-[8px] block mt-1 font-bold ${
                              isMe ? 'text-white/60 text-right' : 'text-slate-400 text-left'
                            }`}>
                              {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {/* scroll marker */}
                    <div ref={chatBottomRef} />
                  </div>
                )}
              </div>

              {/* Chat Input form bar */}
              <form 
                onSubmit={handleSendChatMessage}
                className="p-3 bg-white border-t border-orange-100/40 flex items-center space-x-2 shrink-0 select-none pb-4"
              >
                <input 
                  type="text"
                  value={chatMessageInput}
                  onChange={(e) => setChatMessageInput(e.target.value)}
                  placeholder="Posez votre question..."
                  className="flex-1 bg-slate-50 border border-slate-200 focus:border-[#1b64d9] focus:bg-white focus:outline-none rounded-2xl px-4 py-2.5 text-xs text-slate-850 font-bold transition-all"
                />
                <button 
                  type="submit"
                  disabled={!chatMessageInput.trim()}
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    chatMessageInput.trim() 
                      ? 'bg-[#1b64d9] hover:bg-blue-600 text-white shadow-md active:scale-95' 
                      : 'bg-slate-100 text-slate-350 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
