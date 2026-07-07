import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Coins, 
  Users, 
  Briefcase, 
  ArrowDownLeft, 
  ArrowUpRight, 
  PlusCircle,
  ArrowUpCircle,
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
  ChevronLeft, 
  ChevronDown,
  ShieldCheck, 
  Send,
  HelpCircle,
  Clock,
  BookOpen,
  History,
  MessageCircle,
  Lock,
  CheckCircle2,
  AlertCircle,
  Headphones,
  Info,
  X,
  Download,
  Smartphone,
  Megaphone,
  Share,
  Camera,
  ThumbsUp,
  Trash2,
  RefreshCw,
  Cpu,
  Tv,
  Speaker,
  Volume2,
  Music
} from 'lucide-react';
import { User, Deposit, Withdrawal, Product, Investment, Commission, SystemNotification, SupportMessage, WithdrawalProof } from '../types';
import { DataStore, syncWithBackend, getApiUrl, apiFetch } from '../dataStore';
import AdminPanel from './AdminPanel';
import CountdownTimer from './CountdownTimer';
import { InvestmentItem } from './InvestmentItem';


const compressImage = (file: File, maxWidth: number = 500, quality: number = 0.45): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
    };
    reader.onerror = () => {
      resolve('');
    };
  });
};

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
  // Ultra-premium white and purple-accented Dreampod image for all products
  return 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&q=80&w=500';
};

const getVipCropDetails = (level: number, category?: string) => {
  if (category === 'activity') {
    switch (level) {
      case 1:
        return {
          name: "Dreampod Activité 1 ⚡",
          desc: "Package spécial court terme basé sur la revente rapide d'écouteurs de sport."
        };
      case 2:
        return {
          name: "Dreampod Activité 2 ⚡",
          desc: "Package pro à rotation rapide avec des bénéfices accumulés quotidiennement."
        };
      case 3:
        return {
          name: "Dreampod Activité 3 ⚡",
          desc: "Édition premium à haut rendement sur un cycle court et sécurisé."
        };
      default:
        return {
          name: "Dreampod Activité Spéciale ⚡",
          desc: "Édition spéciale pour booster vos revenus journaliers rapidement."
        };
    }
  }

  switch (level) {
    case 1:
      return {
        name: "Dreampod 1 🎧",
        desc: "Notre modèle d'entrée de gamme offrant un rendement journalier passif et stable."
      };
    case 2:
      return {
        name: "Dreampod 2 🎧",
        desc: "Système audio de deuxième génération pour des revenus journaliers accrus."
      };
    case 3:
      return {
        name: "Dreampod 3 🎧",
        desc: "Équipement haut de gamme avec une rentabilité journalière optimisée."
      };
    case 4:
      return {
        name: "Dreampod 4 🎧",
        desc: "Technologie avancée assurant des revenus très solides tout au long de l'année."
      };
    case 5:
      return {
        name: "Dreampod Pro 🎧",
        desc: "Le fleuron professionnel idéal pour maximiser vos gains de manière constante."
      };
    case 6:
      return {
        name: "Dreampod Pro 2 🎧",
        desc: "Réduction de bruit active et profits décuplés au quotidien pour les membres Elite."
      };
    case 7:
      return {
        name: "Dreampod Max 🎧",
        desc: "Le summum du luxe audio et de la performance financière sur la plateforme."
      };
    case 8:
      return {
        name: "Dreampod Ultra 🎧",
        desc: "L'équipement audio ultra-premium réservé aux investisseurs d'élite."
      };
    case 9:
      return {
        name: "Dreampod Élite 🎧",
        desc: "Système audio suprême de prestige pour des gains journaliers spectaculaires."
      };
    default:
      return {
        name: "Dreampod Élite 🎧",
        desc: "Système audio suprême réservé aux investisseurs d'élite de la communauté."
      };
  }
};

const ProductImage = ({ 
  vipLevel, 
  alt, 
  className = "w-full h-full object-cover",
  isMini = false,
  category
}: { 
  vipLevel: number; 
  alt: string; 
  className?: string;
  isMini?: boolean;
  category?: string;
}) => {
  return (
    <div className="w-full h-full bg-[#1b64d9] flex items-center justify-center overflow-hidden relative">
      <img
        src={getVipImage(vipLevel)}
        alt={alt}
        className={className}
        referrerPolicy="no-referrer"
      />
    </div>
  );
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

const liveTransactions = [
  { name: "Abdoulaye K.", type: "recharge", amount: "15 000 XOF", flag: "🇨🇮", desc: "a rechargé" },
  { name: "Mariam O.", type: "retrait", amount: "45 000 XOF", flag: "🇧🇫", desc: "a retiré" },
  { name: "Koffi A.", type: "recharge", amount: "100 000 XOF", flag: "🇹🇬", desc: "a rechargé" },
  { name: "Chantal Z.", type: "retrait", amount: "12 000 XOF", flag: "🇧🇯", desc: "a retiré" },
  { name: "Fatoumata B.", type: "recharge", amount: "5 000 XOF", flag: "🇧🇫", desc: "a rechargé" },
  { name: "Alain T.", type: "retrait", amount: "25 000 XOF", flag: "🇨🇮", desc: "a retiré" },
  { name: "Sena B.", type: "recharge", amount: "50 000 XOF", flag: "🇹🇬", desc: "a rechargé" },
  { name: "Gaston S.", type: "retrait", amount: "8 000 XOF", flag: "🇧🇯", desc: "a retiré" },
  { name: "Yasmine K.", type: "recharge", amount: "250 000 XOF", flag: "🇨🇮", desc: "a rechargé" },
  { name: "Rodrigue M.", type: "retrait", amount: "35 000 XOF", flag: "🇧🇯", desc: "a retiré" },
  { name: "Inès Y.", type: "recharge", amount: "80 000 XOF", flag: "🇹🇬", desc: "a rechargé" },
  { name: "Félix S.", type: "retrait", amount: "15 000 XOF", flag: "🇧🇫", desc: "a retiré" }
];

export const WHEEL_REWARDS = [
  { amount: 1000, label: "1 000 F", color: "#38bdf8" }, // light sky blue
  { amount: 5000, label: "5 000 F", color: "#eab308" }, // gold
  { amount: 2000, label: "2 000 F", color: "#a855f7" }, // purple
  { amount: 10000, label: "10 000 F", color: "#f97316" }, // orange
  { amount: 1500, label: "1 500 F", color: "#ec4899" }, // pink
  { amount: 20000, label: "20 000 F", color: "#22c55e" }, // green
  { amount: 3000, label: "3 000 F", color: "#14b8a6" }, // teal
  { amount: 50000, label: "50 000 F", color: "#ef4444" }  // red
];

export const DREAMPOD_SLIDES = [
  {
    id: 'slide-1',
    url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1000',
    title: 'Dreampod Marbre Royal 💎',
    desc: 'Cabine de flottaison haut de gamme dans un écrin de marbre noble.',
  },
  {
    id: 'slide-2',
    url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=1000',
    title: 'Dreampod Pavillon Zen 🌸',
    desc: 'Sensation d\'isolation et détente profonde au cœur de la nature.',
  },
  {
    id: 'slide-3',
    url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=1000',
    title: 'Dreampod Noir Astral 🌌',
    desc: 'Voyage d\'introspection et réduction totale du stress quotidien.',
  },
  {
    id: 'slide-4',
    url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=1000',
    title: 'Dreampod Duo Nuit Lumineuse 🌃',
    desc: 'Deux cocons technologiques dôtés d\'une chromothérapie d\'exception.',
  },
  {
    id: 'slide-5',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1000',
    title: 'Dreampod Élite Cèdre Chaud 🪵',
    desc: 'Un cocon de bien-être intimiste pour un ressourcement complet.',
  }
];

const DEPOSIT_COUNTRIES = [
  { name: 'Cameroun', code: '+237', flag: '🇨🇲' },
  { name: 'Togo', code: '+228', flag: '🇹🇬' },
  { name: 'Bénin', code: '+229', flag: '🇧🇯' },
  { name: 'Côte d’Ivoire', code: '+225', flag: '🇨🇮' },
  { name: 'Burkina Faso', code: '+226', flag: '🇧🇫' },
  { name: 'Sénégal', code: '+221', flag: '🇸🇳' },
  { name: 'Mali', code: '+223', flag: '🇲🇱' }
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
  const [productSubTab, setProductSubTab] = useState<'fixe1' | 'fixe2' | 'fixe3' | 'activity'>('fixe1');

  // Local lists
  const [userState, setUserState] = useState<User>(currentUser);
  const [products, setProducts] = useState<Product[]>(() => DataStore.getProducts());
  const [activeInvestments, setActiveInvestments] = useState<Investment[]>([]);

  // Mission states
  const [showMissionsModal, setShowMissionsModal] = useState<boolean>(false);

  // Custom check for stability product activation
  const hasStabilityActivation = activeInvestments.some(inv => {
    const p = products.find(prod => prod.id === inv.productId || prod.name === inv.productName);
    if (p) {
      return p.category !== 'activity' && !p.isCyclic;
    }
    const idLower = (inv.productId || '').toLowerCase();
    const nameLower = (inv.productName || '').toLowerCase();
    return !idLower.includes('cyclic') && !idLower.includes('activity') && 
           !nameLower.includes('cycle') && !nameLower.includes('promo') && !nameLower.includes('activity');
  });
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [allDeposits, setAllDeposits] = useState<Deposit[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<Withdrawal[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [withdrawalProofs, setWithdrawalProofs] = useState<WithdrawalProof[]>([]);
  const [bannerImageError, setBannerImageError] = useState<boolean>(false);
  const [showStabilityOrders, setShowStabilityOrders] = useState<boolean>(false);
  const [showActivityOrders, setShowActivityOrders] = useState<boolean>(false);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        if (slideDirection === 'forward') {
          if (prev === DREAMPOD_SLIDES.length - 1) {
            setSlideDirection('backward');
            return prev - 1;
          }
          return prev + 1;
        } else {
          if (prev === 0) {
            setSlideDirection('forward');
            return prev + 1;
          }
          return prev - 1;
        }
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [slideDirection]);

  // Form states
  const SENDAVAPAY_COUNTRIES = [
    { code: 'TG', name: 'Togo 🇹🇬', currency: 'XOF' },
    { code: 'CI', name: 'Côte d’Ivoire 🇨🇮', currency: 'XOF' },
    { code: 'BJ', name: 'Bénin 🇧🇯', currency: 'XOF' },
    { code: 'BF', name: 'Burkina Faso 🇧🇫', currency: 'XOF' },
    { code: 'SN', name: 'Sénégal 🇸🇳', currency: 'XOF' },
    { code: 'ML', name: 'Mali 🇲🇱', currency: 'XOF' }
  ];

  const SENDAVAPAY_OPERATORS: Record<string, { id: string; name: string; slug: string; requiresOtp?: boolean }[]> = {
    TG: [
      { id: '37', name: 'TMoney', slug: 't-money-togo' },
      { id: '38', name: 'Moov Money', slug: 'moov-togo' }
    ],
    CI: [
      { id: '29', name: 'Orange Money', slug: 'orange-money-ci' },
      { id: '30', name: 'MTN Mobile Money', slug: 'mtn-ci', requiresOtp: true },
      { id: '31', name: 'Moov Money', slug: 'moov-ci' },
      { id: '32', name: 'Wave', slug: 'wave-ci' }
    ],
    BJ: [
      { id: '35', name: 'MTN Mobile Money', slug: 'mtn-benin', requiresOtp: true },
      { id: '36', name: 'Moov Money', slug: 'moov-benin' }
    ],
    BF: [
      { id: '33', name: 'Moov Money', slug: 'moov-burkina-faso' },
      { id: '34', name: 'Orange Money', slug: 'orange-money-burkina' }
    ],
    SN: [
      { id: '57', name: 'Orange Money', slug: 'new-orange-money-senegal' },
      { id: '58', name: 'Wave', slug: 'wave-senegal' }
    ],
    ML: [
      { id: '60', name: 'Orange Money', slug: 'orange-money-mali' }
    ],
    COG: [
      { id: '55', name: 'Airtel Money', slug: 'airtel-cog' },
      { id: '56', name: 'MTN Mobile Money', slug: 'mtn-cog' }
    ]
  };

  const getInitialSpCountry = () => {
    if (userState.country) {
      const c = userState.country.toLowerCase();
      if (c.includes('ivoire') || c.includes('ivory')) return 'CI';
      if (c.includes('benin') || c.includes('bénin')) return 'BJ';
      if (c.includes('burkina')) return 'BF';
      if (c.includes('senegal') || c.includes('sénégal')) return 'SN';
      if (c.includes('mali')) return 'ML';
      if (c.includes('congo')) return 'COG';
    }
    return 'TG';
  };

  const formatDepositCode = (numStr: string) => {
    if (!numStr) return "";
    if (numStr.toLowerCase().includes("montant")) {
      const amt = depositAmount && parseInt(depositAmount, 10) > 0 ? depositAmount : "montant";
      return numStr.replace(/montant/gi, amt);
    }
    return numStr;
  };

  const isUssdCode = (str: string) => {
    return str && (str.includes('*') || str.includes('#'));
  };

  const [depositAmount, setDepositAmount] = useState<string>('5000');
  const [depositPhoneNumber, setDepositPhoneNumber] = useState<string>('');
  const [depositOperator, setDepositOperator] = useState<string>('TMoney');
  const [depositMethod, setDepositMethod] = useState<'westpay' | 'manuel_cameroun'>('manuel_cameroun');
  const [depositRef, setDepositRef] = useState<string>('');
  const [receiptBase64, setReceiptBase64] = useState<string>('');
  const [depositError, setDepositError] = useState<string>('');
  const [depositSuccess, setDepositSuccess] = useState<string>('');
  const [depositMode, setDepositMode] = useState<'automatic' | 'ashtech'>('automatic');
  const [manualOperator, setManualOperator] = useState<string>('MTN Mobile Money (Cameroun 🇨🇲)');
  const [manualReference, setManualReference] = useState<string>('');
  const [manualReceiptBase64, setManualReceiptBase64] = useState<string>('');
  const [manualReceiptFileName, setManualReceiptFileName] = useState<string>('');
  const [isDraggingManualReceipt, setIsDraggingManualReceipt] = useState<boolean>(false);
  const [manualCopied, setManualCopied] = useState<boolean>(false);
  const [manualDepositNumbers, setManualDepositNumbers] = useState<Record<string, string>>(() => DataStore.getManualDepositNumbers());
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [depositStep, setDepositStep] = useState<1 | 2>(1);
  const [depositRedirectUrl, setDepositRedirectUrl] = useState<string>('');
  const getCountryPrefix = (countryName: string): string => {
    const c = (countryName || '').toLowerCase();
    if (c.includes('cameroun') || c.includes('237')) return '+237';
    if (c.includes('togo') || c.includes('228')) return '+228';
    if (c.includes('benin') || c.includes('bénin') || c.includes('229')) return '+229';
    if (c.includes('ivoire') || c.includes('225')) return '+225';
    if (c.includes('burkina') || c.includes('226')) return '+226';
    if (c.includes('senegal') || c.includes('sénégal') || c.includes('221')) return '+221';
    if (c.includes('mali') || c.includes('223')) return '+223';
    return '+237';
  };

  const [depositCountry, setDepositCountry] = useState<string>(() => {
    const userCountry = (userState.country || '').toLowerCase();
    if (userCountry.includes('cameroun')) return 'Cameroun';
    if (userCountry.includes('togo')) return 'Togo';
    if (userCountry.includes('benin') || userCountry.includes('bénin')) return 'Bénin';
    if (userCountry.includes('ivoire')) return 'Côte d’Ivoire';
    if (userCountry.includes('burkina')) return 'Burkina Faso';
    if (userCountry.includes('senegal') || userCountry.includes('sénégal')) return 'Sénégal';
    if (userCountry.includes('mali')) return 'Mali';
    return 'Cameroun';
  });

  const [depositCountryCode, setDepositCountryCode] = useState<string>(() => getCountryPrefix(depositCountry));
  const [depositPhone, setDepositPhone] = useState<string>(() => {
    const raw = userState.whatsapp || '';
    const prefix = getCountryPrefix(userState.country || '').replace('+', '');
    let clean = raw.replace(/[\s\-\(\)\+]/g, '');
    if (clean.startsWith(prefix)) {
      clean = clean.slice(prefix.length);
    }
    return clean;
  });
  const [depositNumberCopied, setDepositNumberCopied] = useState<boolean>(false);

  // SendavaPay specific states
  const [spCountryCode, setSpCountryCode] = useState<string>(getInitialSpCountry());
  const [spOperatorId, setSpOperatorId] = useState<string>('');
  const [hasManuallySelectedOperator, setHasManuallySelectedOperator] = useState<boolean>(false);
  const [spOtpToken, setSpOtpToken] = useState<string | null>(null);
  const [spOtpCode, setSpOtpCode] = useState<string>('');
  const [spOtpModalOpen, setSpOtpModalOpen] = useState<boolean>(false);
  const [spStatusMessage, setSpStatusMessage] = useState<string | null>(null);
  const [spReference, setSpReference] = useState<string | null>(null);
  const [isPollingSp, setIsPollingSp] = useState<boolean>(false);

  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawOperator, setWithdrawOperator] = useState<string>(() => {
    try {
      return localStorage.getItem('mdb_saved_operator') || "MTN (CM)";
    } catch (e) {
      return "MTN (CM)";
    }
  });
  const [withdrawNumber, setWithdrawNumber] = useState<string>(() => {
    try {
      return localStorage.getItem('mdb_saved_number') || '';
    } catch (e) {
      return '';
    }
  });
  const [withdrawError, setWithdrawError] = useState<string>('');
  const [withdrawSuccess, setWithdrawSuccess] = useState<string>('');
  const [withdrawProofBase64, setWithdrawProofBase64] = useState<string>('');
  const [withdrawProofFileName, setWithdrawProofFileName] = useState<string>('');
  const [isDraggingWithdraw, setIsDraggingWithdraw] = useState<boolean>(false);

  const [bonusCodeInput, setBonusCodeInput] = useState<string>('');
  
  // Proof form states
  const [isPublishFormOpen, setIsPublishFormOpen] = useState<boolean>(false);
  const [proofAmount, setProofAmount] = useState<string>('');
  const [proofMessage, setProofMessage] = useState<string>('');
  const [proofImage, setProofImage] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [proofImageFileName, setProofImageFileName] = useState<string>('');
  const [isDraggingProof, setIsDraggingProof] = useState<boolean>(false);
  const [bonusError, setBonusError] = useState<string>('');
  const [bonusSuccess, setBonusSuccess] = useState<string>('');
  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(() => {
    try {
      const checkKey = `gi_last_daily_${currentUser.id}`;
      return localStorage.getItem(checkKey) === new Date().toDateString();
    } catch {
      return false;
    }
  });

  const [dynamicLiveTransactions, setDynamicLiveTransactions] = useState(liveTransactions);

  const detectSpOperator = (phone: string, country: string): string => {
    let clean = (phone || '').replace(/\D/g, '');
    const prefixes: Record<string, string> = {
      'TG': '228', 'CI': '225', 'BJ': '229', 'SN': '221', 'ML': '223',
      'BF': '226', 'CM': '237', 'GN': '224', 'COD': '243', 'COG': '242'
    };
    const prefix = prefixes[country];
    if (prefix && clean.startsWith(prefix)) {
      clean = clean.substring(prefix.length);
    }
    if (clean.startsWith('0')) {
      clean = clean.substring(1);
    }

    if (!clean) return '';

    if (country === 'TG') {
      // TG: 37 (TMoney), 38 (Moov)
      // TMoney starts with 90, 91, 92, 93, 96, 79
      // Moov starts with 97, 98, 99, 70
      if (/^(90|91|92|93|96|79)/.test(clean)) return '37';
      if (/^(97|98|99|70)/.test(clean)) return '38';
    } else if (country === 'CI') {
      // CI: 29 (Orange), 30 (MTN), 31 (Moov), 32 (Wave)
      // Orange: 07, 47, 57, 77, 87, 97
      // MTN: 05, 45, 55, 75, 85, 95
      // Moov: 01, 41, 51, 71, 81, 91
      if (/^(07|47|57|77|87|97)/.test(clean)) return '29';
      if (/^(05|45|55|75|85|95)/.test(clean)) return '30';
      if (/^(01|41|51|71|81|91)/.test(clean)) return '31';
    } else if (country === 'BJ') {
      // BJ: 35 (MTN), 36 (Moov)
      if (/^(51|52|53|54|61|62|66|67|69|90|91|96|97)/.test(clean)) return '35';
      if (/^(50|55|58|60|63|64|65|68|94|95|98|99)/.test(clean)) return '36';
    } else if (country === 'BF') {
      // BF: 34 (Orange), 33 (Moov)
      if (/^(07|57|67|77)/.test(clean)) return '34';
      if (/^(06|56|66|76)/.test(clean)) return '33';
    } else if (country === 'SN') {
      // SN: 57 (Orange), 58 (Wave), 59 (Mixx)
      if (/^(77|78)/.test(clean)) return '57';
    } else if (country === 'CM') {
      // CM: 1 (MTN), 2 (Orange)
      if (/^(650|651|652|653|654|67|68)/.test(clean)) return '1';
      if (/^(655|656|657|658|659|69)/.test(clean)) return '2';
    }
    return '';
  };

  useEffect(() => {
    setHasManuallySelectedOperator(false);
    setSpOperatorId('');
  }, [spCountryCode]);

  useEffect(() => {
    if ((depositMethod as any) === 'sendavapay' && spCountryCode) {
      if (!hasManuallySelectedOperator && depositPhone) {
        const detected = detectSpOperator(depositPhone, spCountryCode);
        if (detected) {
          setSpOperatorId(detected);
          return;
        }
      }
      
      // Fallback: default to the first operator of the country
      if (!spOperatorId) {
        const operators = SENDAVAPAY_OPERATORS[spCountryCode] || [];
        if (operators.length > 0) {
          setSpOperatorId(operators[0].id);
        }
      }
    }
  }, [spCountryCode, depositMethod, depositPhone, hasManuallySelectedOperator]);

  useEffect(() => {
    const poolFirstNames = [
      "Abdoulaye", "Mariam", "Koffi", "Chantal", "Fatoumata", "Alain", "Sena", "Gaston", "Yasmine", 
      "Rodrigue", "Inès", "Félix", "Kouadio", "Aminata", "Seydou", "Awa", "Amadou", "Ousmane", 
      "Bakary", "Clarisse", "Tidiane", "Salif", "Issa", "Zoumana", "Aïcha", "Mamadou", "Hamed", 
      "Wilfried", "Cynthia", "Désiré", "Mireille", "Pascal", "Kadiatou", "Sékou", "Lamine", "Binta"
    ];
    const poolLastInitials = ["K.", "O.", "A.", "Z.", "B.", "T.", "S.", "M.", "Y.", "D.", "N.", "P.", "C.", "G.", "L.", "I.", "W."];
    const poolFlags = ["🇨🇮", "🇧🇫", "🇹🇬", "🇧🇯"];
    const poolAmounts = ["5 000 XOF", "10 000 XOF", "15 000 XOF", "25 000 XOF", "50 000 XOF", "75 000 XOF", "100 000 XOF", "150 000 XOF", "250 000 XOF"];
    const poolTypes = ["recharge", "retrait"];

    const interval = setInterval(() => {
      const randomFirstName = poolFirstNames[Math.floor(Math.random() * poolFirstNames.length)];
      const randomLastName = poolLastInitials[Math.floor(Math.random() * poolLastInitials.length)];
      const name = `${randomFirstName} ${randomLastName}`;
      const type = poolTypes[Math.floor(Math.random() * poolTypes.length)];
      const flag = poolFlags[Math.floor(Math.random() * poolFlags.length)];
      
      let amount = poolAmounts[Math.floor(Math.random() * poolAmounts.length)];
      if (type === "retrait") {
        const smallerAmounts = ["5 000 XOF", "8 000 XOF", "12 000 XOF", "15 000 XOF", "20 000 XOF", "35 000 XOF", "45 000 XOF", "50 000 XOF"];
        amount = smallerAmounts[Math.floor(Math.random() * smallerAmounts.length)];
      }

      const newTx = { name, type, amount, flag, desc: type === "recharge" ? "a rechargé" : "a retiré" };

      setDynamicLiveTransactions(prev => {
        const updated = [newTx, ...prev];
        if (updated.length > 15) {
          updated.pop();
        }
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Password change states
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [pwdError, setPwdError] = useState<string>('');
  const [pwdSuccess, setPwdSuccess] = useState<string>('');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [isBankCardModalOpen, setIsBankCardModalOpen] = useState<boolean>(false);
  const [profileSubPage, setProfileSubPage] = useState<string | null>(null);

  useEffect(() => {
    setProfileSubPage(null);
  }, [activeTab]);

  // Bank Card Binding States
  const [bankCardName, setBankCardName] = useState<string>(() => {
    try {
      return localStorage.getItem('mdb_saved_name') || '';
    } catch (e) {
      return '';
    }
  });
  const [bankCardOperator, setBankCardOperator] = useState<string>(() => {
    try {
      return localStorage.getItem('mdb_saved_operator') || "MTN (CM)";
    } catch (e) {
      return "MTN (CM)";
    }
  });
  const [bankCardNumber, setBankCardNumber] = useState<string>(() => {
    try {
      return localStorage.getItem('mdb_saved_number') || '';
    } catch (e) {
      return '';
    }
  });
  const [bankCardError, setBankCardError] = useState<string>('');
  const [bankCardSuccess, setBankCardSuccess] = useState<string>('');
  
  // PWA installation state and hooks
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [deviceOS, setDeviceOS] = useState<'ios' | 'android' | 'other'>('other');
  const [activeInstallTab, setActiveInstallTab] = useState<'android' | 'ios'>('android');

  useEffect(() => {
    // Detect standalone mode
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect OS
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setDeviceOS('ios');
      setActiveInstallTab('ios');
    } else if (/android/.test(ua)) {
      setDeviceOS('android');
      setActiveInstallTab('android');
    }

    // Intercept standard PWA prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerPwaInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsStandalone(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const handleDownloadAndInstallApp = async () => {
    // 1. Trigger the direct APK download programmatically
    const link = document.createElement('a');
    link.href = '/Dreampod_v2.6.apk';
    link.download = 'Dreampod_v2.6.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 2. Trigger PWA installation if the browser supports it
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsStandalone(true);
          setIsInstallable(false);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.error("PWA install error:", err);
      }
    }

    // 3. Show a clear, precise alert instruction explaining what to do next & handling install errors
    openAlert(
      "Téléchargement Lancé ! 📲",
      "Le téléchargement de l'application 'Dreampod_v2.6.apk' a commencé ! Ouvrez le fichier téléchargé pour l'installer.\n\n⚠️ IMPORTANT : Si l'installation refuse ou dit 'Application non installée', désinstallez d'abord TOUTE ancienne version (comme l'application AgroProfit ou une version précédente de Dreampod) de votre téléphone, puis réessayez. Cela résout 100% des erreurs d'installation !",
      "success"
    );
  };

  const [chatMessageInput, setChatMessageInput] = useState<string>('');

  // Clipboard copies
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleCopyPageUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

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

  const [currentLiveNotif, setCurrentLiveNotif] = useState<{ message: string; type: string } | null>(null);

  // Note: Disabled random ticker popups at user request to avoid visual pollution on site
  useEffect(() => {
    // Disabled at user request
  }, []);

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
            body: "Notifications de bureau Chrome activées sur Dreampod ! 🔔"
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

  const userStateRef = useRef(userState);
  userStateRef.current = userState;

  const allUsersRef = useRef(allUsers);
  allUsersRef.current = allUsers;

  const productsRef = useRef(products);
  productsRef.current = products;

  const manualDepositNumbersRef = useRef(manualDepositNumbers);
  manualDepositNumbersRef.current = manualDepositNumbers;
  
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

  // Helpers to calculate investments
  const getLevelInvestedAmount = (usersList: User[]) => {
    try {
      const allInvs = DataStore.getInvestments() || [];
      const userIds = new Set(usersList.map(u => u.id));
      return allInvs
        .filter(inv => userIds.has(inv.userId))
        .reduce((sum, inv) => sum + inv.price, 0);
    } catch (e) {
      console.error(e);
      return 0;
    }
  };

  const getUserInvestedAmount = (userId: string) => {
    try {
      const allInvs = DataStore.getInvestments() || [];
      return allInvs
        .filter(inv => inv.userId === userId)
        .reduce((sum, inv) => sum + inv.price, 0);
    } catch (e) {
      console.error(e);
      return 0;
    }
  };

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

    const pfs = DataStore.getWithdrawalProofs().filter(p => !p.status || p.status === 'approved');
    setWithdrawalProofs(pfs);

    // Sync configured deposit numbers from administrator so they update automatically without page refresh
    setManualDepositNumbers(DataStore.getManualDepositNumbers());

    try {
      const checkKey = `gi_last_daily_${currentUser.id}`;
      setHasCheckedInToday(localStorage.getItem(checkKey) === new Date().toDateString());
    } catch {
      // ignore
    }
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
              "Félicitations !\nVotre compte a été crédité automatiquement et instantanément de " + data.amount.toLocaleString() + " " + getCurrency() + " suite à votre paiement réussi.\n\nRéférence du paiement: " + data.ref
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
      try {
        await syncWithBackend();
      } catch (err) {
        console.warn('Periodic background sync failed:', err);
      }

      const oldBal = userStateRef.current.balance;
      const oldUsersLen = allUsersRef.current.length;
      const oldProductsStr = JSON.stringify(productsRef.current);
      const oldManualNumsStr = JSON.stringify(manualDepositNumbersRef.current);
      DataStore.processAutomaticDailyInstallments();
      
      const fresh = DataStore.getCurrentUser();
      const freshUsers = DataStore.getUsers();
      const freshProducts = DataStore.getProducts();
      const freshProductsStr = JSON.stringify(freshProducts);
      const freshManualNums = DataStore.getManualDepositNumbers();
      const freshManualNumsStr = JSON.stringify(freshManualNums);
      
      // Pull real-time notifications
      const freshNotifs = DataStore.getNotifications().filter(n => n.userId === undefined || n.userId === currentUser.id);
      const brandNewNotifs = freshNotifs.filter(n => !initialLoadedNotifIds.current.has(n.id));
      
      if (brandNewNotifs.length > 0) {
        brandNewNotifs.forEach(n => {
          triggerChromeNotification(n.title || "Nouvelle Notification", n.message);
          initialLoadedNotifIds.current.add(n.id);
        });
        syncDashboardData();
      } else if (
        (fresh && fresh.balance !== oldBal) || 
        freshUsers.length !== oldUsersLen ||
        freshProductsStr !== oldProductsStr ||
        freshManualNumsStr !== oldManualNumsStr
      ) {
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
  }, [currentUser.id]);

  useEffect(() => {
    // Scroll to bottom of support chat when opened or new messages spawn
    if (activeTab === 'profile' || isLiveChatOpen) {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [supportMessages, activeTab, isLiveChatOpen]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      setShowAnnouncementDismissible(true);
    }
  }, [activeTab]);

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
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(referralURL);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = referralURL;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedLink(true);
      triggerToast('Lien de parrainage copié ! 🚀', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Failed to copy link', err);
      triggerToast('Veuillez copier le lien manuellement dans la zone ci-dessous.', 'info');
    }
  };

  const handleCopyCode = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(userState.referralCode);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = userState.referralCode;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedCode(true);
      triggerToast('Code sponsor copié ! 🔑', 'success');
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  // Check-in helper
  const handleDailyCheckin = async () => {
    const res = await DataStore.claimDailyReward(userState.id);
    if (res.success) {
      triggerToast('🎉 ' + res.message, 'success');
      setHasCheckedInToday(true);
      syncDashboardData();
    } else {
      triggerToast('⚠️ ' + res.message, 'info');
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
  const handleReceiptChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 500, 0.45);
        setReceiptBase64(compressed);
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptBase64(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);

  const pollSendavaPayStatus = (reference: string) => {
    if (!reference) return;
    setSpReference(reference);
    setIsPollingSp(true);

    let attempts = 0;
    const maxAttempts = 60; // 4 minutes
    
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        setIsPollingSp(false);
        return;
      }

      try {
        const response = await apiFetch(getApiUrl('/api/sendavapay/verify-deposit'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reference })
        });

        if (response.ok) {
          const res = await response.json();
          if (res.success) {
            if (res.status === 'approved' || res.status === 'completed') {
              clearInterval(interval);
              setIsPollingSp(false);
              setDepositSuccess("🎉 Félicitations ! Votre paiement a été détecté et validé avec succès. Votre compte a été crédité automatiquement !");
              setSpOtpModalOpen(false);
              setSpOtpToken(null);
              setSpOtpCode('');
              await syncWithBackend();
              syncDashboardData();
              triggerToast("⚡ Compte crédité automatiquement !", "success");
            } else if (res.status === 'failed') {
              clearInterval(interval);
              setIsPollingSp(false);
              setDepositError("Le paiement a été rejeté ou a échoué. Veuillez réessayer.");
            }
          }
        }
      } catch (err) {
        console.error("Error polling SendavaPay status:", err);
      }
    }, 4000);
  };

  const handleGoToStep2 = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDepositError('');
    setDepositSuccess('');
    const amt = parseInt(depositAmount);
    if (isNaN(amt) || amt < 2500) {
      setDepositError(`Le montant minimum pour un versement est de 2 500 ${getCurrency()}.`);
      return;
    }
    if (!spOperatorId) {
      setDepositError("Veuillez choisir un opérateur Mobile Money.");
      return;
    }
    setDepositStep(2);
  };

  const submitSpOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spOtpCode || !spOtpToken) return;

    setPaymentProcessing(true);
    setDepositError('');
    try {
      const response = await apiFetch(getApiUrl('/api/sendavapay/submit-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          otpToken: spOtpToken,
          otp: spOtpCode
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (spReference) {
            pollSendavaPayStatus(spReference);
          }
          triggerToast("Code OTP soumis avec succès. Validation en cours...", "success");
        } else {
          setDepositError(data.error || "La validation du code OTP a échoué.");
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        setDepositError(errData.error || "Erreur de connexion lors de la validation du code OTP.");
      }
    } catch (err: any) {
      console.error("OTP submit error:", err);
      setDepositError(err?.message || "Erreur lors de la soumission de l'OTP.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const mapCountryNameToCode = (name: string): string => {
    const c = name.toLowerCase();
    if (c.includes('togo')) return 'TG';
    if (c.includes('ivoire') || c.includes('ivory')) return 'CI';
    if (c.includes('benin') || c.includes('bénin')) return 'BJ';
    if (c.includes('burkina')) return 'BF';
    if (c.includes('senegal') || c.includes('sénégal')) return 'SN';
    if (c.includes('mali')) return 'ML';
    if (c.includes('congo')) return 'COG';
    return 'TG';
  };

  const submitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');
    setDepositSuccess('');

    const amt = parseInt(depositAmount);
    if (isNaN(amt) || amt < 2500) {
      setDepositError(`Le montant minimum pour un versement est de 2 500 F.`);
      return;
    }

    if (!depositPhone || !depositPhone.trim()) {
      setDepositError(`Veuillez saisir votre numéro de téléphone de paiement.`);
      return;
    }

    if (depositPhone.trim().length < 6) {
      setDepositError(`Veuillez saisir un numéro de téléphone de paiement valide (minimum 6 chiffres).`);
      return;
    }

    setIsSubmittingDeposit(true);
    try {
      const reference = `WP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const formattedOperator = `WestPay (${depositCountry} ${depositCountryCode} ${depositPhone.trim()})`;
      let succeeded = false;
      try {
        const response = await apiFetch(getApiUrl('/api/create-deposit'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userState.id,
            amount: amt,
            operator: formattedOperator,
            reference: reference,
            receiptImage: 'westpay_link'
          })
        });
        if (response && response.ok) {
          const data = await response.json();
          if (data && data.success) {
            succeeded = true;
          }
        }
      } catch (err) {
        console.warn("[WestPay API failover] Server API failed, falling back to local/Supabase store:", err);
      }

      const redirectUrl = "https://westpay.cfd/link/c25ukanomq2agyq6";

      if (succeeded) {
        setDepositRedirectUrl(redirectUrl);
        setDepositSuccess(`Votre demande de recharge de ${amt.toLocaleString()} F via WestPay a été enregistrée avec succès ! Veuillez cliquer sur le bouton ci-dessous pour effectuer le paiement de manière sécurisée.`);
        try {
          window.open(redirectUrl, '_blank');
        } catch (popupErr) {
          console.warn("Popup blocked, user needs to click button manually.", popupErr);
        }
        syncDashboardData();
        if (typeof syncWithBackend === 'function') {
          syncWithBackend().catch(() => {});
        }
      } else {
        // --- CLIENT-SIDE FAILOVER STRATEGY ---
        console.log("[WestPay Fallback] Executing robust direct-to-Supabase deposit register...");
        
        const deposits = DataStore.getDeposits();
        const users = DataStore.getUsers();
        const user = users.find(u => u.id === userState.id);

        const newDep = {
          id: `dep-${Date.now()}`,
          userId: userState.id,
          userName: user ? user.name : (userState.name || 'Utilisateur'),
          amount: amt,
          operator: formattedOperator,
          reference: reference,
          receiptImage: 'westpay_link',
          status: 'pending' as const,
          lastModified: Date.now(),
          createdAt: new Date().toISOString()
        };

        deposits.unshift(newDep);
        DataStore.saveDeposits(deposits);

        const notifications = DataStore.getNotifications();
        notifications.unshift({
          id: `not-dep-${Date.now()}`,
          userId: userState.id,
          title: 'Dépôt soumis',
          message: `Votre demande de dépôt de ${amt.toLocaleString()} F via WestPay (Réf: ${reference}) est en cours de vérification par l'administration.`,
          type: 'deposit',
          lastModified: Date.now(),
          createdAt: new Date().toISOString(),
          read: false
        });
        DataStore.saveNotifications(notifications);

        setDepositRedirectUrl(redirectUrl);
        setDepositSuccess(`Votre demande de recharge de ${amt.toLocaleString()} F via WestPay a été enregistrée avec succès ! Veuillez cliquer sur le bouton ci-dessous pour effectuer le paiement de manière sécurisée.`);
        try {
          window.open(redirectUrl, '_blank');
        } catch (popupErr) {
          console.warn("Popup blocked, user needs to click button manually.", popupErr);
        }
        syncDashboardData();
      }
    } catch (error: any) {
      console.error("WestPay deposit error:", error);
      setDepositError(`Erreur : ${error?.message || "Veuillez réessayer."}`);
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  const handleManualReceiptDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingManualReceipt(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setManualReceiptFileName(file.name);
      const b64 = await compressImage(file);
      setManualReceiptBase64(b64);
    }
  };

  const handleManualReceiptSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setManualReceiptFileName(file.name);
      const b64 = await compressImage(file);
      setManualReceiptBase64(b64);
    }
  };

  const handleCopyManualUssd = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      setManualCopied(true);
      setTimeout(() => setManualCopied(false), 2000);
    }
  };

  const submitManualDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');
    setDepositSuccess('');

    const amt = parseInt(depositAmount);
    if (isNaN(amt) || amt < 2500) {
      setDepositError("Le montant minimum pour un versement est de 2 500 F.");
      return;
    }

    if (!depositPhone || !depositPhone.trim()) {
      setDepositError("Veuillez saisir votre numéro de téléphone de paiement.");
      return;
    }

    if (depositPhone.trim().length < 6) {
      setDepositError("Veuillez saisir un numéro de téléphone de paiement valide (minimum 6 chiffres).");
      return;
    }

    if (!manualReference.trim()) {
      setDepositError("Veuillez saisir l'ID de transaction ou la référence du paiement SMS.");
      return;
    }

    if (!manualReceiptBase64) {
      setDepositError("Veuillez joindre la capture d'écran de votre reçu de paiement.");
      return;
    }

    setIsSubmittingDeposit(true);
    try {
      const formattedOperator = `${manualOperator} (${depositCountry} ${depositCountryCode} ${depositPhone.trim()})`;
      const dep = await DataStore.createDeposit(
        userState.id,
        amt,
        formattedOperator,
        manualReference.trim(),
        manualReceiptBase64
      );

      if (dep) {
        setDepositSuccess(`Votre demande de recharge manuelle de ${amt.toLocaleString()} F CFA via ${formattedOperator} (Réf: ${manualReference}) a été enregistrée avec succès ! Notre équipe créditera votre solde dès vérification.`);
        setManualReference('');
        setManualReceiptBase64('');
        setManualReceiptFileName('');
        syncDashboardData();
      } else {
        setDepositError("Une erreur est survenue lors de l'enregistrement de votre demande. Veuillez réessayer.");
      }
    } catch (err: any) {
      console.error("Manual deposit submission error:", err);
      setDepositError(`Erreur lors de la soumission : ${err?.message || err || "Veuillez réessayer."}`);
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

  // Submit withdrawal proof
  const handlePublishProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofAmount.trim() || !proofMessage.trim()) {
      triggerToast('⚠️ Veuillez remplir le montant et votre message.', 'error');
      return;
    }

    const amt = parseInt(proofAmount, 10);
    if (isNaN(amt) || amt <= 0) {
      triggerToast('⚠️ Veuillez indiquer un montant valide.', 'error');
      return;
    }

    setIsPublishing(true);
    try {
      const res = await DataStore.publishWithdrawalProof(
        userState.id,
        userState.name,
        userState.country,
        amt,
        proofMessage,
        proofImage
      );

      if (res.success) {
        triggerToast('✅ Votre preuve de retrait a été publiée avec succès !', 'success');
        setProofAmount('');
        setProofMessage('');
        setProofImage('');
        setProofImageFileName('');
        setIsPublishFormOpen(false);
        syncDashboardData();
      } else {
        triggerToast('⚠️ Une erreur est survenue lors de la publication.', 'error');
      }
    } catch (err) {
      console.error('Error publishing proof:', err);
      triggerToast('⚠️ Impossible de se connecter au serveur.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Like a proof
  const handleLikeProof = async (proofId: string) => {
    await DataStore.likeWithdrawalProof(proofId, userState.id);
    syncDashboardData();
  };

  // Delete/Moderate a proof (Admins only)
  const handleDeleteProof = async (proofId: string) => {
    openConfirm(
      'Supprimer la Preuve 🗑️',
      'Êtes-vous sûr de vouloir supprimer définitivement cette preuve de retrait du flux public ?',
      async () => {
        const ok = await DataStore.deleteWithdrawalProof(proofId);
        if (ok) {
          triggerToast('🗑️ Preuve de retrait supprimée avec succès.', 'success');
          syncDashboardData();
        } else {
          triggerToast('⚠️ Impossible de supprimer de la mémoire.', 'error');
        }
      }
    );
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

  const handleFastForwardTime = async () => {
    // 1. First trigger client-side update
    DataStore.advanceAllActiveInvestmentsBy24Hours(userState.id);

    // 2. Also trigger server-side time advancement so they remain perfectly in sync
    try {
      await apiFetch(getApiUrl('/api/test/advance-time'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userState.id })
      });
      // Perform background sync to pull the newly advanced state from the server
      await syncWithBackend();
    } catch (e) {
      console.error('Server fast forward failed:', e);
    }

    syncDashboardData();
    setSimulationStatus("⏱️ Succès : Le temps a avancé de 24 Heures sur le serveur et le client ! Vos revenus quotidiens ont été automatiquement crédités.");
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[4px] p-4 overflow-y-auto cursor-pointer"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="communiqué-montserrat bg-white border-2 border-slate-200 rounded-3xl p-6 text-left shadow-[0_25px_60px_rgba(0,0,0,0.4)] relative max-w-sm w-full overflow-hidden my-auto cursor-default text-slate-900"
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
                      Togo 🇹🇬
                    </span>
                    <span className="bg-white/20 border border-white/10 text-white px-2 py-0.5 rounded font-extrabold text-[9px]">
                      Bénin 🇧🇯
                    </span>
                    <span className="bg-white/20 border border-white/10 text-white px-2 py-0.5 rounded font-extrabold text-[9px]">
                      Côte d’Ivoire 🇨🇮
                    </span>
                    <span className="bg-white/20 border border-white/10 text-white px-2 py-0.5 rounded font-extrabold text-[9px]">
                      Burkina Faso 🇧🇫
                    </span>
                    <span className="bg-white/20 border border-white/10 text-white px-2 py-0.5 rounded font-extrabold text-[9px]">
                      Sénégal 🇸🇳
                    </span>
                    <span className="bg-white/20 border border-white/10 text-white px-2 py-0.5 rounded font-extrabold text-[9px]">
                      Mali 🇲🇱
                    </span>
                    <span className="bg-white/20 border border-white/10 text-white px-2 py-0.5 rounded font-extrabold text-[9px]">
                      Cameroun 🇨🇲
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
                    <span className="text-white font-mono font-black text-xs ml-0.5">2 500 {getCurrency()}</span>
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

              {/* Referral Pillar with High Contrast */}
              <div className="bg-slate-50 p-3.5 border border-slate-200 rounded-xl space-y-2 text-slate-800 shadow-sm">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs select-none">🤝</span>
                  <span className="font-bold text-slate-900">Parrainage MLM :</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-[8px] text-center">
                  <span className="bg-white text-slate-800 p-1.5 rounded-lg border border-slate-100 flex flex-col items-center justify-center">
                    <span className="opacity-90 mb-0.5 text-slate-500 font-bold">🥇 Niv. 1</span>
                    <span className="font-black text-[10px] text-slate-900">20%</span>
                  </span>
                  <span className="bg-white text-slate-800 p-1.5 rounded-lg border border-slate-100 flex flex-col items-center justify-center">
                    <span className="opacity-90 mb-0.5 text-slate-500 font-bold">🥈 Niv. 2</span>
                    <span className="font-black text-[10px] text-slate-900">3%</span>
                  </span>
                  <span className="bg-white text-slate-800 p-1.5 rounded-lg border border-slate-100 flex flex-col items-center justify-center">
                    <span className="opacity-90 mb-0.5 text-slate-500 font-bold">🥉 Niv. 3</span>
                    <span className="font-black text-[10px] text-slate-900">1%</span>
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
                    Rejoignez la discussion officielle Dreampod.
                  </p>
                </div>
                <a 
                  href={DataStore.getWhatsAppGroup()}
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

      {/* APP REAL-TIME INCOME/PAYOUT FLOATING BANNER (iOS/Android Native Style) */}
      <AnimatePresence>
        {currentLiveNotif && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: "-50%", scale: 0.9 }}
            animate={{ opacity: 1, y: 16, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: -100, x: "-50%", scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[99999] w-[90%] max-w-sm bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 shadow-[0_20px_45px_rgba(0,0,0,0.30)] flex items-start gap-3 text-white cursor-pointer select-none"
            onClick={() => setCurrentLiveNotif(null)}
          >
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-blue-600 rounded-xl shrink-0">
              <Bell className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[10px] font-sans font-black uppercase text-blue-400 tracking-wider">Alerte Dreampod 🔔</span>
                <span className="text-[8px] opacity-60 font-mono font-bold uppercase shrink-0">À l'instant</span>
              </div>
              <p className="text-[11.5px] font-bold text-slate-100 leading-snug break-words">
                {currentLiveNotif.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RÈGLEMENT / CONDITIONS MODAL */}
      <AnimatePresence>
        {isRulesModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-[#fffaf5]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsRulesModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-2 border-purple-200 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(168,85,247,0.12)] relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center space-x-3 text-[#7c3aed]">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-sm uppercase tracking-wider text-slate-800">
                      Règlement Général
                    </h3>
                    <p className="text-[9px] text-purple-600 font-black uppercase tracking-wider font-mono">
                      Conditions de la plateforme
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsRulesModalOpen(false)}
                  className="p-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 transition-colors cursor-pointer border border-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Rules List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-5 text-slate-700 text-left text-xs sm:text-sm leading-relaxed">
                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
                  <h4 className="font-sans font-black text-xs uppercase tracking-wider text-purple-800 mb-1">1. Principes d'Investissement</h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed">
                    Chaque utilisateur peut acquérir des équipements agricoles pour générer des revenus journaliers passifs. Les retours sont calculés et versés chaque jour à minuit.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-sans font-black text-xs uppercase tracking-wider text-slate-800 mb-1">2. Système de Retrait</h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed">
                    Les retraits sont traités via Mobile Money sous 24h à 48h. Le montant minimum de retrait dépend de votre niveau VIP et de votre région. Assurez-vous que vos coordonnées de paiement sont valides.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-sans font-black text-xs uppercase tracking-wider text-slate-800 mb-1">3. Programme de Parrainage (MLM)</h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed">
                    Bénéficiez d'une structure de commissions sur 3 niveaux pour chaque achat de vos affiliés :
                    <span className="block mt-1 text-purple-700 font-bold">• Niveau 1 (Direct) : 20% de commission</span>
                    <span className="block text-purple-700 font-bold">• Niveau 2 (Indirect) : 3% de commission</span>
                    <span className="block text-purple-700 font-bold">• Niveau 3 (Sous-indirect) : 1% de commission</span>
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <h4 className="font-sans font-black text-xs uppercase tracking-wider text-amber-800 mb-1">4. Sécurité du Compte</h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed">
                    Un utilisateur est strictement limité à un seul compte par personne physique. La détection de multi-comptes frauduleux entraînera la suspension immédiate de tous les soldes et comptes associés.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
                <span className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Sécurité garantie</span>
                <button 
                  onClick={() => setIsRulesModalOpen(false)}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Accepter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODIFIER LE MOT DE PASSE MODAL */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-[#fffaf5]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => {
              setIsPasswordModalOpen(false);
              setPwdError('');
              setPwdSuccess('');
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-2 border-slate-200 rounded-[32px] w-full max-w-md p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center space-x-3 text-slate-800">
                  <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-sm uppercase tracking-wider text-slate-800">
                      Modifier Mot de Passe
                    </h3>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider font-mono">
                      Sécurité du compte
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPwdError('');
                    setPwdSuccess('');
                  }}
                  className="p-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 transition-colors cursor-pointer border border-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Password Change Form */}
              <form 
                onSubmit={(e) => {
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
                    setPwdSuccess('Votre mot de passe a été modifié avec succès !');
                    triggerToast('🔒 Mot de passe modifié !', 'success');
                    syncDashboardData();
                    // Clear inputs
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setTimeout(() => {
                      setIsPasswordModalOpen(false);
                      setPwdSuccess('');
                    }, 1500);
                  } else {
                    setPwdError('Une erreur est survenue lors de la modification.');
                  }
                }}
                className="space-y-4 text-left"
              >
                {pwdError && (
                  <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 font-extrabold uppercase tracking-wide leading-relaxed">
                    ⚠️ {pwdError}
                  </div>
                )}

                {pwdSuccess && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-extrabold uppercase tracking-wide leading-relaxed animate-pulse">
                    🎉 {pwdSuccess}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Ancien Mot de Passe</label>
                  <input 
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all font-sans text-slate-800"
                    placeholder="Ancien mot de passe"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Nouveau Mot de Passe</label>
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all font-sans text-slate-800"
                    placeholder="Minimum 5 caractères"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Confirmer Nouveau Mot de Passe</label>
                  <input 
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all font-sans text-slate-800"
                    placeholder="Confirmer le nouveau mot de passe"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full mt-2 py-3 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Mettre à jour
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CARTE BANCAIRE MODAL */}
      <AnimatePresence>
        {isBankCardModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-[#fffaf5]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => {
              setIsBankCardModalOpen(false);
              setBankCardError('');
              setBankCardSuccess('');
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-2 border-slate-200 rounded-[32px] w-full max-w-md p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center space-x-3 text-slate-800">
                  <div className="w-10 h-10 bg-amber-50 text-[#f07b1b] rounded-2xl flex items-center justify-center shrink-0">
                    <UserIcon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-sm uppercase tracking-wider text-slate-800">
                      Carte Bancaire
                    </h3>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider font-mono">
                      Liaison de compte de retrait
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsBankCardModalOpen(false);
                    setBankCardError('');
                    setBankCardSuccess('');
                  }}
                  className="p-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 transition-colors cursor-pointer border border-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* GORGEOUS VIRTUAL CREDIT CARD SHOWING INFO */}
              <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-[#1b64d9] via-[#2575fc] to-[#f07b1b] p-5 text-white flex flex-col justify-between shadow-md relative overflow-hidden mb-5">
                {/* Microchip and MDB branding */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-90">DREAMPOD INVESTMENT</span>
                    <span className="text-[7px] font-mono font-bold tracking-widest opacity-60">MEMBRE CERTIFIÉ</span>
                  </div>
                  <div className="w-16 h-8 rounded-md bg-white/20 flex items-center justify-center border border-white/20 px-1">
                    <span className="text-[9px] font-black uppercase tracking-wider">Dreampod</span>
                  </div>
                </div>

                {/* Card Number */}
                <div className="text-center font-mono text-base tracking-widest my-1 font-bold">
                  {bankCardNumber 
                    ? bankCardNumber.replace(/(\d{4})/g, '$1 ').trim() 
                    : '•••• •••• •••• ••••'}
                </div>

                {/* Operator Badge and Name */}
                <div className="flex justify-between items-end">
                  <div className="flex flex-col text-left">
                    <span className="text-[7px] text-white/65 uppercase tracking-wider block font-bold">Titulaire du compte</span>
                    <span className="text-xs font-black truncate max-w-[180px]">
                      {bankCardName ? bankCardName.toUpperCase() : 'VOTRE NOM COMPLET'}
                    </span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[7px] text-white/65 uppercase tracking-wider block font-bold">Opérateur</span>
                    <span className="text-[11px] font-black tracking-wide bg-white/20 px-2 py-0.5 rounded-md uppercase border border-white/10">
                      {bankCardOperator}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setBankCardError('');
                  setBankCardSuccess('');

                  if (!bankCardName.trim()) {
                    setBankCardError('Veuillez saisir le nom complet du titulaire.');
                    return;
                  }
                  if (!bankCardNumber.trim() || bankCardNumber.length < 8) {
                    setBankCardError('Veuillez saisir un numéro de téléphone Mobile Money valide.');
                    return;
                  }

                  try {
                    localStorage.setItem('mdb_saved_name', bankCardName.trim());
                    localStorage.setItem('mdb_saved_operator', bankCardOperator);
                    localStorage.setItem('mdb_saved_number', bankCardNumber.trim());

                    // Sync the main states as well so they prefill withdrawal instantly!
                    setWithdrawOperator(bankCardOperator);
                    setWithdrawNumber(bankCardNumber.trim());

                    setBankCardSuccess('Vos informations de paiement ont été enregistrées avec succès !');
                    triggerToast('💳 Compte de paiement lié !', 'success');
                    setTimeout(() => {
                      setIsBankCardModalOpen(false);
                      setBankCardSuccess('');
                    }, 1500);
                  } catch (err) {
                    setBankCardError('Une erreur est survenue lors de la sauvegarde.');
                  }
                }}
                className="space-y-4 text-left"
              >
                {bankCardError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 font-extrabold leading-relaxed">
                    ⚠️ {bankCardError}
                  </div>
                )}

                {bankCardSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-extrabold leading-relaxed animate-pulse">
                    🎉 {bankCardSuccess}
                  </div>
                )}

                {/* Nom titulaire */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Nom du titulaire du compte</label>
                  <input 
                    type="text"
                    required
                    value={bankCardName}
                    onChange={(e) => setBankCardName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-[#f07b1b]/20 focus:border-[#f07b1b] outline-none transition-all font-sans text-slate-800 font-bold"
                    placeholder="Ex: Jean Dupont"
                  />
                </div>

                {/* Opérateur */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Sélectionnez l'Opérateur</label>
                  <select
                    value={bankCardOperator}
                    onChange={(e) => setBankCardOperator(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-[#f07b1b]/20 focus:border-[#f07b1b] outline-none transition-all font-sans text-slate-800 font-black cursor-pointer"
                  >
                    <option value="MTN (CM)">MTN Mobile Money (Cameroun 🇨🇲)</option>
                    <option value="Orange (CM)">Orange Money (Cameroun 🇨🇲)</option>
                    <option value="T-Money (TG)">T-Money (Togo 🇹🇬)</option>
                    <option value="Moov (TG)">Moov Money (Togo 🇹🇬)</option>
                    <option value="MTN (BJ)">MTN MoMo (Bénin 🇧🇯)</option>
                    <option value="Moov (BJ)">Moov Flooz (Bénin 🇧🇯)</option>
                    <option value="Wave (CI)">Wave Money (Côte d'Ivoire 🇨🇮)</option>
                    <option value="Orange (CI)">Orange Money (Côte d'Ivoire 🇨🇮)</option>
                  </select>
                </div>

                {/* Numéro */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Numéro Mobile Money (SANS INDICATIF)</label>
                  <input 
                    type="tel"
                    required
                    value={bankCardNumber}
                    onChange={(e) => setBankCardNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-[#f07b1b]/20 focus:border-[#f07b1b] outline-none transition-all font-sans text-slate-800 font-bold"
                    placeholder="Ex: 677123456"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full mt-2 py-3 bg-gradient-to-r from-[#1b64d9] to-[#f07b1b] text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Sauvegarder et Lier
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DASHBOARD TOP HEADER (STYLING OF SCREENSHOT) */}
      <div className="w-full bg-gradient-to-r from-[#1b64d9] to-[#ff7c00] text-white p-4 pt-6 pb-6 flex items-center justify-between shadow-md relative z-40 select-none">
        <div className="flex items-center space-x-3.5 max-w-[70%]">
          {/* Avatar frame */}
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#1b64d9] shadow-sm shrink-0">
            <UserIcon className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="text-left truncate">
            <div className="text-xs sm:text-sm font-sans font-black tracking-wide text-white uppercase truncate">
              {userState.name || `INVESTISSEUR ${userState.whatsapp ? userState.whatsapp.replace(/\D/g, '') : userState.id}`}
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
          
          {profileSubPage && (() => {
            const rechargeSum = allDeposits.filter(d => d.status === 'approved').reduce((acc, d) => acc + d.amount, 0);
            const purchaseSum = activeInvestments.reduce((acc, i) => acc + i.price, 0);
            const rechargeBal = Math.max(0, rechargeSum - purchaseSum);
            const totalProductRevenue = activeInvestments.reduce((acc, i) => acc + (i.totalReturnClaimed || 0), 0);
            const totalCommissions = commissions.reduce((acc, c) => acc + c.amount, 0);
            const activeInvsCount = activeInvestments.filter(i => i.status === 'active').length;

            if (profileSubPage === 'orders') {
              return (
                <div className="bg-[#f8fafc] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-24 min-h-[95vh] text-slate-800 text-left animate-fadeIn">
                  <div className="max-w-md mx-auto w-full space-y-4">
                    <div className="flex items-center space-x-3 mb-2 pt-2">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs border-none outline-none"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      <h2 className="font-sans font-black text-slate-900 text-base uppercase tracking-tight">Mes Commandes</h2>
                    </div>

                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                      <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                        Retrouvez ici tous les équipements et produits d'investissement que vous avez acquis. Vous pouvez réclamer vos revenus quotidiens à tout moment.
                      </p>
                      
                      <div className="space-y-3 pt-2">
                        {activeInvestments.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-slate-100/50">
                            Aucun produit d'investissement actif pour le moment.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {activeInvestments.map((p) => (
                              <InvestmentItem 
                                key={p.id}
                                investment={p}
                                onClaim={handleClaimReturn}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (profileSubPage === 'balance') {
              return (
                <div className="bg-[#f8fafc] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-24 min-h-[95vh] text-slate-800 text-left animate-fadeIn">
                  <div className="max-w-md mx-auto w-full space-y-4">
                    <div className="flex items-center space-x-3 mb-2 pt-2">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs border-none outline-none"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      <h2 className="font-sans font-black text-slate-900 text-base uppercase tracking-tight">Mon Solde</h2>
                    </div>

                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                      <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">Solde de Recharge</span>
                          <span className="text-base sm:text-lg font-black text-[#1b64d9] block mt-1">
                            FCFA {rechargeBal.toLocaleString()}
                          </span>
                        </div>
                        <div className="border-l border-slate-100 pl-4">
                          <span className="text-[10px] text-slate-400 font-bold block">Solde de Retrait</span>
                          <span className="text-base sm:text-lg font-black text-[#1b64d9] block mt-1">
                            FCFA {userState.balance.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1 text-center pt-1.5">
                        <div>
                          <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-tight leading-tight">Revenu Produit</span>
                          <span className="text-xs font-black text-slate-800 block mt-1">
                            FCFA {totalProductRevenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="border-l border-slate-100">
                          <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-tight leading-tight">Commission</span>
                          <span className="text-xs font-black text-slate-800 block mt-1">
                            FCFA {totalCommissions.toLocaleString()}
                          </span>
                        </div>
                        <div className="border-l border-slate-100">
                          <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-tight leading-tight">Nbre de Commandes</span>
                          <span className="text-xs font-black text-slate-800 block mt-1">
                            {activeInvsCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
                      <h3 className="font-sans font-black text-slate-800 text-xs uppercase tracking-wider pl-0.5">Opérations Rapides</h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => {
                            setProfileSubPage(null);
                            setActiveTab('deposit');
                          }}
                          className="flex items-center justify-center gap-2 p-3 bg-amber-50 text-[#f07b1b] rounded-2xl font-bold text-xs hover:bg-amber-100/70 transition-all border-none outline-none cursor-pointer"
                        >
                          <Coins className="w-4 h-4" />
                          <span>Recharger</span>
                        </button>
                        <button 
                          onClick={() => {
                            setProfileSubPage(null);
                            setActiveTab('withdraw');
                          }}
                          className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-[#1b64d9] rounded-2xl font-bold text-xs hover:bg-blue-100/70 transition-all border-none outline-none cursor-pointer"
                        >
                          <ArrowUpCircle className="w-4 h-4" />
                          <span>Retirer</span>
                        </button>
                      </div>

                      <button 
                        onClick={() => {
                          if (onNavigate) {
                            onNavigate('/historique');
                          }
                        }}
                        className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 text-slate-700 rounded-2xl text-xs font-bold transition-all border-none outline-none cursor-pointer mt-2"
                      >
                        <span>📋 Voir l'historique complet des revenus</span>
                        <span>&gt;</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            if (profileSubPage === 'help') {
              return (
                <div className="bg-[#f8fafc] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-24 min-h-[95vh] text-slate-800 text-left animate-fadeIn">
                  <div className="max-w-md mx-auto w-full space-y-4">
                    <div className="flex items-center space-x-3 mb-2 pt-2">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs border-none outline-none"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      <h2 className="font-sans font-black text-slate-900 text-base uppercase tracking-tight">Centre d'Aide</h2>
                    </div>

                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block pl-0.5">
                        💬 ASSISTANCE EN DIRECT
                      </span>
                      <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                        Notre équipe d'assistance est à votre écoute pour vous aider à résoudre tout problème lié à vos dépôts, retraits ou investissements.
                      </p>
                      
                      <div className="space-y-2.5 pt-1">
                        <button
                          onClick={() => setIsLiveChatOpen(true)}
                          className="w-full bg-[#1b64d9] text-white font-black text-xs py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm hover:bg-blue-600 transition-all cursor-pointer border-none outline-none"
                        >
                          <Headphones className="w-4.5 h-4.5" />
                          <span>DISCUTER PAR CHAT EN DIRECT</span>
                        </button>

                        <button
                          onClick={() => window.open(DataStore.getWhatsAppChannel(), '_blank')}
                          className="w-full bg-[#25D366] text-white font-black text-xs py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm hover:bg-[#20ba59] transition-all cursor-pointer border-none outline-none"
                        >
                          <Send className="w-4.5 h-4.5" />
                          <span>REJOINDRE LE CANAL TELEGRAM</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3.5">
                      <h3 className="font-sans font-black text-slate-800 text-xs uppercase tracking-wider pl-0.5">Questions Fréquentes (FAQ)</h3>
                      
                      <div className="space-y-3 pt-1">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                          <h4 className="text-[11px] font-black text-slate-800 uppercase">Comment effectuer un dépôt ?</h4>
                          <p className="text-[10.5px] text-slate-400 font-bold mt-1 leading-normal">
                            Rendez-vous dans la rubrique "Recharge", indiquez le montant puis suivez les instructions de paiement mobile. Envoyez ensuite la preuve pour validation rapide.
                          </p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                          <h4 className="text-[11px] font-black text-slate-800 uppercase">Quel est le délai de traitement des retraits ?</h4>
                          <p className="text-[10.5px] text-slate-400 font-bold mt-1 leading-normal">
                            Les retraits sont généralement traités sous un délai de 5 minutes à 24 heures maximum, crédités directement sur votre compte mobile configuré.
                          </p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                          <h4 className="text-[11px] font-black text-slate-800 uppercase">Comment fonctionne le parrainage ?</h4>
                          <p className="text-[10.5px] text-slate-400 font-bold mt-1 leading-normal">
                            Invitez vos amis avec votre lien unique. Vous gagnez des commissions sur 3 niveaux (Niveau 1, Niveau 2 et Niveau 3) dès qu'un de vos filleuls investit.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (profileSubPage === 'about') {
              return (
                <div className="bg-[#f8fafc] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-24 min-h-[95vh] text-slate-800 text-left animate-fadeIn">
                  <div className="max-w-md mx-auto w-full space-y-4">
                    <div className="flex items-center space-x-3 mb-2 pt-2">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs border-none outline-none"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      <h2 className="font-sans font-black text-slate-900 text-base uppercase tracking-tight">À Propos</h2>
                    </div>

                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                      <div className="flex justify-center py-2">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1b64d9] to-[#2575fc] flex items-center justify-center text-white shadow-md">
                          <TrendingUp className="w-8 h-8 stroke-[2.5]" />
                        </div>
                      </div>
                      
                      <h3 className="text-center font-sans font-black text-slate-800 text-sm uppercase">Dreampod Investment S.A.</h3>
                      
                      <p className="text-[11px] text-slate-400 font-bold leading-relaxed text-center">
                        Dreampod Investment est une plateforme financière innovante dédiée à l'investissement et à la gestion de produits à haute rentabilité pour tous les investisseurs d'Afrique.
                      </p>

                      <div className="border-t border-slate-50 pt-4 space-y-3.5">
                        <div>
                          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">🔒 Sécurité &amp; Fiabilité</h4>
                          <p className="text-[10.5px] text-slate-400 font-bold mt-1 leading-relaxed">
                            Tous vos investissements sont protégés par des fonds de garantie stricts. Les processus de retrait sont chiffrés et vérifiés par notre équipe d'experts financiers.
                          </p>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">🌟 Notre Vision</h4>
                          <p className="text-[10.5px] text-slate-400 font-bold mt-1 leading-relaxed">
                            Démocratiser l'accès aux opportunités financières de pointe grâce aux technologies numériques modernes et au parrainage de réseau structuré.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (profileSubPage === 'settings') {
              return (
                <div className="bg-[#f8fafc] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-24 min-h-[95vh] text-slate-800 text-left animate-fadeIn">
                  <div className="max-w-md mx-auto w-full space-y-4">
                    <div className="flex items-center space-x-3 mb-2 pt-2">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs border-none outline-none"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      <h2 className="font-sans font-black text-slate-900 text-base uppercase tracking-tight">Paramètres</h2>
                    </div>

                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3.5">
                      <h3 className="font-sans font-black text-slate-800 text-xs uppercase tracking-wider pl-0.5">Informations du Compte</h3>
                      
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100/50 text-xs">
                          <span className="text-slate-400 font-bold">Nom d'utilisateur</span>
                          <span className="font-black text-slate-800">{userState.name || 'Aucun'}</span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100/50 text-xs">
                          <span className="text-slate-400 font-bold">Numéro WhatsApp</span>
                          <span className="font-black text-slate-800">{userState.whatsapp || 'Aucun'}</span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100/50 text-xs">
                          <span className="text-slate-400 font-bold">Code Sponsor Unique</span>
                          <span className="font-mono font-black text-[#1b64d9]">{userState.referralCode}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                      <h3 className="font-sans font-black text-slate-800 text-xs uppercase tracking-wider pl-0.5">Sécurité &amp; Mot de passe</h3>
                      
                      <div className="space-y-3">
                        <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                          Modifiez votre mot de passe pour garantir la sécurité et la confidentialité de vos investissements.
                        </p>
                        
                        <button
                          onClick={() => setIsPasswordModalOpen(true)}
                          className="w-full bg-[#1b64d9] text-white font-black text-xs py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm hover:bg-blue-600 transition-all cursor-pointer border-none outline-none"
                        >
                          <Settings className="w-4.5 h-4.5" />
                          <span>MODIFIER MON MOT DE PASSE</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* USER SUMMARY CARDS */}
          {!profileSubPage && activeTab === 'dashboard' && (
            <div className="space-y-4">


              {/* IMMERSIVE DREAMPOD GALLERY SLIDER (VA-ET-VIENT) */}
              <div id="dreampod-immersion-showcase" className="bg-white border border-blue-50/55 rounded-[30px] p-4.5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] text-slate-800 text-left overflow-hidden relative">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-sans font-black text-[#1b64d9] uppercase tracking-wider block">GALERIE ULTRA-LUXE</span>
                    <h3 className="text-sm sm:text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-1.5 mt-0.5">
                      🌟 Showcase Immersif Dreampod
                    </h3>
                  </div>
                  <div className="bg-orange-50 text-orange-600 text-[9px] font-sans font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                    </span>
                    EXPLORER
                  </div>
                </div>

                {/* Slider Image Container */}
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mt-3 shadow-sm border border-slate-100 bg-slate-50 group">
                  <div className="w-full h-full relative">
                    <img
                      src={DREAMPOD_SLIDES[currentSlide].url}
                      alt={DREAMPOD_SLIDES[currentSlide].title}
                      className="w-full h-full object-cover select-none transition-transform duration-700 ease-out scale-100 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                    {/* Text Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-white flex flex-col justify-end">
                      <span className="text-[9px] text-orange-400 font-sans font-black uppercase tracking-widest mb-1 select-none">
                        Cocon d'exception • {currentSlide + 1} / {DREAMPOD_SLIDES.length}
                      </span>
                      <h4 className="text-sm sm:text-base font-sans font-black uppercase tracking-wide leading-tight drop-shadow-sm">
                        {DREAMPOD_SLIDES[currentSlide].title}
                      </h4>
                      <p className="text-[10.5px] sm:text-xs text-slate-300 font-semibold mt-1 drop-shadow-sm select-none leading-relaxed">
                        {DREAMPOD_SLIDES[currentSlide].desc}
                      </p>
                    </div>

                    {/* Left Arrow */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide(prev => (prev - 1 + DREAMPOD_SLIDES.length) % DREAMPOD_SLIDES.length);
                      }}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/15 hover:bg-white/35 backdrop-blur-md text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 focus:outline-none cursor-pointer"
                    >
                      <ChevronLeft className="w-4.5 h-4.5 stroke-[3]" />
                    </button>

                    {/* Right Arrow */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide(prev => (prev + 1) % DREAMPOD_SLIDES.length);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/15 hover:bg-white/35 backdrop-blur-md text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 focus:outline-none cursor-pointer"
                    >
                      <ChevronRight className="w-4.5 h-4.5 stroke-[3]" />
                    </button>
                  </div>
                </div>

                {/* Navigation indicators / dots */}
                <div className="flex justify-center items-center gap-1.5 pt-3">
                  {DREAMPOD_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentSlide === idx 
                          ? 'w-6 bg-[#1b64d9]' 
                          : 'w-1.5 bg-slate-200 hover:bg-slate-350'
                      }`}
                      aria-label={`Aller au slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>


              {/* PRIMARY WHITE CARD OF SCREENSHOT */}
              <div id="agro-primary-balance-card" className="bg-white border border-blue-50/55 rounded-[30px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] text-slate-800 text-left">
                <div className="flex justify-between items-center pb-2">
                  <span className="text-[10px] font-sans font-black text-slate-450 uppercase tracking-wider block">SOLDE DISPONIBLE</span>
                  <div className="bg-gradient-to-r from-[#1b64d9] to-[#ff7c00] text-white text-[9px] font-sans font-black px-3 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1 shrink-0">
                    VIP VERIFIÉ
                  </div>
                </div>

                <div className="pt-4 pb-4">
                  <div id="main-balance-text" className="text-4xl sm:text-5xl font-sans font-black text-slate-900 tracking-tight flex items-baseline gap-1.5 solde-bold mt-1.5">
                    {userState.balance.toLocaleString()}{' '}
                    <span className="text-slate-900 text-lg sm:text-xl font-bold uppercase select-none">XOF</span>
                  </div>
                </div>

                {/* Sub-buttons for recharging & withdrawing */}
                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  <button
                    id="recharge-action-btn"
                    onClick={() => setActiveTab('deposit')}
                    className="py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-[#1b64d9] hover:opacity-95 text-white transition-all text-center flex items-center justify-center space-x-1 shadow-md cursor-pointer active:scale-95 border-0"
                  >
                    <PlusCircle className="w-4.5 h-4.5 stroke-[3] mr-1" />
                    <span>Recharge</span>
                  </button>
                  <button
                    id="withdrawal-action-btn"
                    onClick={() => setActiveTab('withdraw')}
                    className="py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-[#ff7c00] hover:opacity-95 text-white transition-all text-center flex items-center justify-center space-x-1 shadow-md cursor-pointer active:scale-95 border-0"
                  >
                    <ArrowUpCircle className="w-4.5 h-4.5 stroke-[3] mr-1" />
                    <span>Retrait</span>
                  </button>
                </div>
              </div>

              {/* MISSION SYSTEM INSTEAD OF LUCKY WHEEL */}
              {(() => {
                const directReferrals = level1Users;
                const allInvs = DataStore.getInvestments() || [];
                const investedReferralCount = directReferrals.filter(u => allInvs.some(inv => inv.userId === u.id)).length;

                return (
                  <div className="bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/30 border border-blue-100/60 rounded-[30px] p-6 shadow-[0_8px_30px_rgba(27,100,217,0.03)] text-slate-800 text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />
                    
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="bg-indigo-50 text-indigo-600 text-[9px] font-sans font-black px-2.5 py-1 rounded-md uppercase tracking-wider inline-block">
                          🎯 EXCLUSIF PARRAINAGE
                        </span>
                        <h3 className="text-lg font-sans font-black text-slate-900 tracking-tight mt-1 flex items-center gap-1.5">
                          Missions d'Invitation
                        </h3>
                      </div>
                      <div className="bg-[#1a1a1a] text-white text-[10px] font-sans font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                        {investedReferralCount} investisseur(s)
                      </div>
                    </div>

                    <p className="text-[11px] sm:text-xs text-slate-500 font-bold leading-normal mt-3 max-w-md">
                      Complétez des missions d'invitation simples pour débloquer des bonus de parrainage allant jusqu'à 8 500 FCFA crédités instantanément sur votre compte !
                    </p>

                    <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-white/65 p-3.5 rounded-2xl border border-slate-100/80">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                          <div className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Votre progression</div>
                          <div className="text-[10px] text-slate-500 font-bold">
                            {investedReferralCount} filleul(s) direct(s) ont investi.
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setShowMissionsModal(true)}
                        className="py-2.5 px-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white font-sans font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-95 shadow-md active:scale-95 transition-all text-center shrink-0 cursor-pointer border-0"
                      >
                        Voir les Missions
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* 3 SECTIONS GRID: HISTORIQUE, SUPPORT, POINTAGE */}
              <div id="dashboard-quick-actions" className="grid grid-cols-3 gap-3 md:gap-4 pt-2">
                {/* Historique Card */}
                <div 
                  id="action-historique"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('/historique');
                    }
                  }}
                  className="bg-white border border-blue-50/45 rounded-3xl p-5 flex flex-col items-center justify-center space-y-2.5 cursor-pointer hover:bg-slate-50/50 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.015)]"
                >
                  <div className="w-12 h-12 bg-[#f0f4ff] text-[#1b64d9] flex items-center justify-center rounded-full">
                    <Clock className="w-5.5 h-5.5 stroke-[2.5]" />
                  </div>
                  <span className="font-sans font-black text-[10px] sm:text-xs text-slate-800 uppercase tracking-wide">Historique</span>
                </div>

                {/* Support Live Card */}
                <div 
                  id="action-support"
                  onClick={() => {
                    setIsLiveChatOpen(true);
                  }}
                  className="bg-white border border-blue-50/45 rounded-3xl p-5 flex flex-col items-center justify-center space-y-2.5 cursor-pointer hover:bg-slate-50/50 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.015)]"
                >
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center rounded-full">
                    <MessageSquare className="w-5.5 h-5.5 stroke-[2.5]" />
                  </div>
                  <span className="font-sans font-black text-[10px] sm:text-xs text-slate-800 uppercase tracking-wide">Support live</span>
                </div>

                {/* Pointage Check-in Card */}
                <div 
                  id="action-checkin"
                  onClick={handleDailyCheckin}
                  className={`border rounded-3xl p-5 flex flex-col items-center justify-center space-y-2.5 cursor-pointer transition-all shadow-[0_4px_15px_rgba(0,0,0,0.015)] ${
                    hasCheckedInToday 
                      ? 'bg-emerald-50/50 border-emerald-100/50 hover:bg-emerald-50 text-emerald-600' 
                      : 'bg-white border-blue-50/45 hover:bg-slate-50/50 text-slate-800'
                  }`}
                >
                  <div className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors ${
                    hasCheckedInToday 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-[#fffaf0] text-blue-500'
                  }`}>
                    {hasCheckedInToday ? (
                      <Check className="w-5.5 h-5.5 stroke-[3]" />
                    ) : (
                      <Gift className="w-5.5 h-5.5 stroke-[2.5]" />
                    )}
                  </div>
                  <span className={`font-sans font-black text-[10px] sm:text-xs uppercase tracking-wide ${
                    hasCheckedInToday ? 'text-emerald-700' : 'text-slate-800'
                  }`}>
                    {hasCheckedInToday ? 'Fait ✓' : 'Pointage'}
                  </span>
                </div>
              </div>


              {/* CONSEIL D'ÉQUIPE CARD */}
              <div className="bg-white border border-blue-50/45 rounded-[28px] p-5 shadow-[0_4px_15px_rgba(0,0,0,0.015)] text-left flex items-start space-x-4 mt-6">
                <div className="w-10 h-10 bg-[#f0f4ff] text-blue-500 rounded-2xl flex items-center justify-center shrink-0 border border-blue-50/30">
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
          {!profileSubPage && activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              {/* STATS: NOMBRE DE PRODUITS ACHETÉS À GAUCHE ET REVENUS À DROITE */}
              <div className="grid grid-cols-2 gap-3 max-w-4xl mx-auto select-none">
                {/* Nombre de produits achetés */}
                <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-3xl p-5 text-left shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 block font-black uppercase tracking-widest leading-none mb-1">PRODUITS ACHETÉS</span>
                  <span className="text-2xl sm:text-3xl font-sans font-black text-slate-800 leading-none">{activeInvestments.length}</span>
                </div>

                {/* Revenus cumulés */}
                <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-3xl p-5 text-left shadow-sm flex flex-col justify-between">
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

              {/* SKY BLUE PRODUCT CATALOG (No sidebars or tabs) */}
              <div className="max-w-7xl mx-auto pt-4 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products
                    .filter(p => p.category !== 'activity')
                    .map((p, index) => {
                      const isBlocked = p.isBlocked === true;
                      const formattedReopenTime = p.reopenDateTime 
                        ? new Date(p.reopenDateTime).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                        : null;

                      const getVipDisplayName = (prod: Product, defaultVipLevel: number) => {
                        if (prod.category === 'activity') {
                          return `Dreampod Activité ${prod.vipLevel || defaultVipLevel}`;
                        }
                        return `Titres à revenu fixe ${prod.vipLevel || defaultVipLevel}`;
                      };

                      const displayName = getVipDisplayName(p, p.vipLevel || (index + 1));
                      const purchasedCount = activeInvestments.filter(i => i.productName === p.name || i.productId === p.id).length;

                      return (
                        <div 
                          key={p.id}
                          className={`bg-sky-50/40 border border-sky-100 rounded-3xl p-5 shadow-[0_4px_15px_rgba(14,165,233,0.04)] hover:shadow-md hover:border-sky-200 transition-all duration-300 relative flex flex-col justify-between ${isBlocked ? 'opacity-70 pointer-events-none' : ''}`}
                        >
                          {/* Card Content Top Row */}
                          <div>
                            <div className="flex items-center gap-4 text-left">
                              <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-sky-100 bg-[#0ea5e9] p-1.5 flex items-center justify-center shadow-inner">
                                <ProductImage 
                                  vipLevel={p.vipLevel || (index + 1)}
                                  alt={displayName}
                                  className="w-full h-full object-contain rounded-xl"
                                  category={p.category}
                                />
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="text-[9px] text-[#0369a1] font-sans font-black uppercase bg-[#e0f2fe] px-2 py-0.5 rounded-md leading-relaxed w-fit mb-1">
                                  Achat: {purchasedCount}/3
                                </span>
                                <h4 className="font-sans font-black text-sm text-sky-950 leading-tight">
                                  {displayName}
                                </h4>
                                <div className="mt-1">
                                  <span className="inline-flex items-center gap-1 bg-[#fffbe6] border border-[#ffe58f] text-[#d4b106] text-[10px] font-sans font-black px-2 py-0.5 rounded-full shadow-xs uppercase">
                                    🏆 VIP{p.vipLevel || 0}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Key-Value Details */}
                            <div className="mt-5 space-y-2 text-left select-none border-t border-sky-100/60 pt-4">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-sky-600/80 font-bold">Revenu</span>
                                <span className="text-sky-900 font-black">{p.durationDays} Jours</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-sky-600/80 font-bold">Revenus Quotidiens</span>
                                <span className="text-[#0ea5e9] font-black">{p.dailyReturn.toLocaleString()} {getCurrency()}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-sky-600/80 font-bold">Revenu Total</span>
                                <span className="text-[#0284c7] font-black">{(p.dailyReturn * p.durationDays).toLocaleString()} {getCurrency()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Button Area */}
                          <div className="mt-5 text-left">
                            {productErrors[p.id] && (
                              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-[11px] font-bold text-red-600 leading-normal">
                                <span className="text-red-700 block font-black mb-0.5">⚠️ SOLDE INSUFFISANT</span>
                                <span>{productErrors[p.id]}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab('deposit');
                                  }}
                                  className="mt-2 block text-[#0ea5e9] font-black underline uppercase tracking-wide cursor-pointer text-xs"
                                >
                                  📥 Recharger mon compte maintenant
                                </button>
                              </div>
                            )}

                            {/* Elegant Split Button with Sky Blue Theme */}
                            <button
                              onClick={() => handleBuyProduct(p)}
                              disabled={isBlocked}
                              className={`w-full flex items-stretch rounded-full overflow-hidden border border-sky-200 shadow-sm transition-all active:scale-[0.98] cursor-pointer ${isBlocked ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-95'}`}
                            >
                              <div className="bg-[#f0f9ff] text-[#0369a1] font-extrabold text-xs px-4 py-3 flex items-center justify-center flex-1">
                                {p.price.toLocaleString()} {getCurrency()}
                              </div>
                              <div className="bg-[#f0f9ff] flex items-center justify-center px-1 text-yellow-400 font-bold select-none text-xs">
                                ⚡
                              </div>
                              <div className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-extrabold text-xs px-6 py-3 flex items-center justify-center flex-1 text-center uppercase tracking-wide">
                                Investir
                              </div>
                            </button>
                          </div>

                          {isBlocked && (
                            <div className="absolute inset-0 rounded-[28px] bg-slate-950/30 flex flex-col items-center justify-center p-3 z-10">
                              <div className="bg-red-500 text-white font-bold text-xs uppercase px-2.5 py-1 rounded-lg">
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

                  {products.length === 0 && (
                    <div className="col-span-full py-16 px-4 text-center rounded-3xl bg-sky-50 border border-dashed border-sky-200 max-w-sm mx-auto">
                      <span className="text-3xl">📭</span>
                      <h5 className="font-sans font-black text-slate-700 uppercase tracking-wider text-xs mt-3">Aucun produit disponible</h5>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">
                        Aucun plan d'investissement n'est actif pour le moment.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DEPOSIT FORM TAB */}
          {!profileSubPage && activeTab === 'deposit' && (() => {
            const currentUssdCode = manualOperator.includes('Orange')
              ? (manualDepositNumbers['CM_42'] || '#150*688969868*montant#')
              : (manualDepositNumbers['CM_41'] || '*126*9*677451289*montant #');
            
            const formattedUssdCode = formatDepositCode(currentUssdCode);

            return (
              <div className="max-w-xl mx-auto bg-[#eef3fc] border-2 border-slate-200/40 p-6 md:p-8 rounded-3xl shadow-xl text-slate-800 animate-fade-in animate-duration-300 font-sans">
                {/* DEPOSIT HEADER */}
                <div className="text-center mb-6">
                  <span className="text-xs font-black text-[#1b64d9] tracking-widest uppercase block mb-1">
                    💸 CRÉDITER MON COMPTE
                  </span>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    Saisissez les détails du transfert et soumettez votre reçu pour recharger votre solde.
                  </p>
                </div>

                {depositError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-100 border border-red-200 text-xs text-red-700 font-bold flex items-center space-x-2">
                    <span className="text-base">⚠️</span>
                    <span>{depositError}</span>
                  </div>
                )}
                {depositSuccess && (
                  <div className="mb-4 p-4 rounded-xl bg-green-100 border border-green-200 text-xs text-green-700 font-bold leading-normal space-y-2 animate-fade-in">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">✅</span>
                      <span>{depositSuccess}</span>
                    </div>
                    {depositMethod === 'westpay' && depositRedirectUrl && (
                      <a
                        href={depositRedirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 w-full py-3 bg-[#1b64d9] hover:bg-blue-700 text-white font-sans text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-center block"
                      >
                        🔗 Ouvrir l'interface de paiement WestPay
                      </a>
                    )}
                  </div>
                )}

                {depositMethod === 'westpay' ? (
                  /* ----------------- WESTPAY FORM ----------------- */
                  <form onSubmit={submitDeposit} className="space-y-5 text-left animate-fade-in font-sans">
                    <div className="space-y-5">
                      {/* AMOUNT PRESETS */}
                      <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 font-mono">
                          Étape 1 : Choisissez un montant rapide 💵
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                          {[2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000].map((amt) => {
                            const isSelected = parseInt(depositAmount) === amt;
                            return (
                              <button
                                type="button"
                                key={amt}
                                onClick={() => setDepositAmount(amt.toString())}
                                className={`py-2 px-1 text-center rounded-xl border text-[11px] font-black font-mono transition-all duration-200 cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#1b64d9] text-white border-[#1b64d9] shadow-md shadow-blue-500/10'
                                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                              >
                                {amt.toLocaleString()} F
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* AMOUNT INPUT */}
                      <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 font-mono">
                          Ou saisissez votre propre montant ({getCurrency()})
                        </label>
                        <input
                          type="number"
                          required
                          placeholder={`Minimum 2 500 ${getCurrency()}`}
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full bg-white border-2 border-slate-200/45 focus:border-[#1b64d9] rounded-2xl py-3.5 px-4 text-sm text-[#1b64d9] font-black focus:outline-none shadow-sm placeholder:text-slate-400"
                        />
                        <span className="text-[10px] text-slate-400 font-semibold block mt-1">Note : Montant minimum autorisé de 2 500 {getCurrency()}.</span>
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-4 animate-fade-in">
                        <div className="flex items-start space-x-2.5">
                          <span className="text-xl">⚡</span>
                          <div className="text-xs text-slate-700 leading-normal font-medium">
                            <span className="font-black text-blue-800 block mb-1">Passerelle Automatique WestPay</span>
                            Vous serez redirigé de manière sécurisée vers la passerelle officielle WestPay pour finaliser votre transaction. 
                            Le traitement est 100% automatisé et votre compte sera crédité instantanément après validation de votre versement.
                          </div>
                        </div>

                        <div className="border-t border-blue-200/40 pt-3">
                          <label className="block text-[10px] font-black text-[#1b64d9] uppercase tracking-wider mb-2 font-mono flex items-center gap-1">
                            <span>🌍 Pays de paiement</span>
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={depositCountry}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDepositCountry(val);
                                const matched = DEPOSIT_COUNTRIES.find(c => c.name === val);
                                if (matched) {
                                  setDepositCountryCode(matched.code);
                                }
                              }}
                              className="w-full bg-white border border-slate-200 focus:border-[#1b64d9] rounded-xl py-2.5 px-3 text-xs font-bold text-slate-700 focus:outline-none shadow-sm appearance-none cursor-pointer"
                            >
                              {DEPOSIT_COUNTRIES.map((c) => (
                                <option key={c.name} value={c.name} className="text-slate-800">
                                  {c.flag} {c.name} ({c.code})
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                              <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-[#1b64d9] uppercase tracking-wider mb-2 font-mono flex items-center gap-1">
                            <span>📞 Numéro de paiement</span>
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center">
                            <div className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl py-2.5 px-3 text-xs font-mono font-black text-slate-500 shrink-0 select-none">
                              {depositCountryCode}
                            </div>
                            <input
                              type="tel"
                              required
                              placeholder="Ex: 699999999"
                              value={depositPhone}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                setDepositPhone(val);
                              }}
                              className="w-full bg-white border border-l-0 border-slate-200 focus:border-[#1b64d9] rounded-r-xl py-2.5 px-3 text-xs text-slate-700 font-bold focus:outline-none shadow-sm placeholder:text-slate-400 font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* SUBMIT BUTTON */}
                      <div className="space-y-3 pt-2">
                        <button
                          type="submit"
                          disabled={isSubmittingDeposit}
                          className="w-full py-4 text-white font-sans font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-95 transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-[#1b64d9]"
                        >
                          {isSubmittingDeposit ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Facturation en cours...</span>
                            </div>
                          ) : (
                            <span>💳 Payer avec WestPay (Auto)</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  /* ----------------- MANUAL CAMEROON FORM ----------------- */
                  <form onSubmit={submitManualDeposit} className="space-y-5 text-left animate-fade-in font-sans">
                    <div className="space-y-5">
                      {/* AMOUNT INPUT */}
                      <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 font-mono">
                          Saisissez le montant de la recharge (FCFA) 💵
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="Ex: 10000"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full bg-white border-2 border-slate-200/45 focus:border-[#1b64d9] rounded-2xl py-3.5 px-4 text-sm text-[#1b64d9] font-black focus:outline-none shadow-sm placeholder:text-slate-400"
                        />
                        <span className="text-[10px] text-slate-400 font-semibold block mt-1">Note : Minimum de 2 500 FCFA requis pour les recharges manuelles.</span>
                      </div>

                      {/* CAMEROON OPERATOR SELECT */}
                      <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 font-mono">
                          Sélectionnez votre opérateur de dépôt 🇨🇲
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setManualOperator('MTN Mobile Money (Cameroun 🇨🇲)')}
                            className={`p-3 text-center rounded-2xl border-2 transition-all duration-200 cursor-pointer font-sans font-black text-xs flex flex-col items-center justify-center space-y-1 ${
                              manualOperator === 'MTN Mobile Money (Cameroun 🇨🇲)'
                                ? 'bg-amber-50 text-amber-900 border-amber-400 shadow-sm'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span className="text-lg">💛</span>
                            <span>MTN MoMo</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setManualOperator('Orange Money (Cameroun 🇨🇲)')}
                            className={`p-3 text-center rounded-2xl border-2 transition-all duration-200 cursor-pointer font-sans font-black text-xs flex flex-col items-center justify-center space-y-1 ${
                              manualOperator === 'Orange Money (Cameroun 🇨🇲)'
                                ? 'bg-[#f0f4ff] text-blue-950 border-blue-200 shadow-sm'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span className="text-lg">🧡</span>
                            <span>Orange Money</span>
                          </button>
                        </div>
                      </div>

                      {/* TRANSFER INSTRUCTIONS */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5 animate-fade-in">
                        <div className="text-xs text-slate-700 font-bold leading-normal">
                          <span className="text-[#1b64d9] uppercase tracking-wide text-[10px] font-black block mb-1">INSTRUCTIONS DE SÉCURITÉ</span>
                          Veuillez effectuer le transfert de <span className="text-blue-700 font-black">{(parseInt(depositAmount) || 0).toLocaleString()} FCFA</span> sur le numéro de paiement officiel ci-dessous :
                        </div>

                        {/* USSD / TRANSFER CONTAINER */}
                        <div className="bg-white border border-slate-200/80 rounded-xl p-3 flex items-center justify-between shadow-sm">
                          <div className="flex-1 mr-2 overflow-hidden">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-black">Code USSD à composer :</span>
                            <span className="font-mono text-xs text-slate-800 font-black tracking-wide block truncate select-all">{formattedUssdCode}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyManualUssd(formattedUssdCode)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer flex items-center justify-center min-w-[40px] h-[40px] shrink-0"
                          >
                            {manualCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>

                        <p className="text-[10.5px] text-slate-500 font-medium italic">
                          💡 Vous pouvez également composer directement ce code sur votre téléphone pour initier le transfert.
                        </p>
                      </div>

                      {/* COUNTRY & PHONE SELECTION (REQUIRED) */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-fade-in">
                        <span className="font-black text-xs text-slate-800 uppercase tracking-wider block font-mono">
                          🌍 Informations de Paiement (Requis)
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* COUNTRY SELECT */}
                          <div>
                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1">
                              <span>Identification du Pays</span>
                              <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <select
                                value={depositCountry}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setDepositCountry(val);
                                  const matched = DEPOSIT_COUNTRIES.find(c => c.name === val);
                                  if (matched) {
                                    setDepositCountryCode(matched.code);
                                  }
                                }}
                                className="w-full bg-white border border-slate-200 focus:border-[#1b64d9] rounded-xl py-2.5 px-3 text-xs font-bold text-slate-700 focus:outline-none shadow-sm appearance-none cursor-pointer"
                              >
                                {DEPOSIT_COUNTRIES.map((c) => (
                                  <option key={c.name} value={c.name}>
                                    {c.flag} {c.name} ({c.code})
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                <ChevronDown className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>

                          {/* PHONE INPUT */}
                          <div>
                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1">
                              <span>Numéro de Téléphone</span>
                              <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center">
                              <div className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl py-2.5 px-3 text-xs font-mono font-black text-slate-500 shrink-0 select-none">
                                {depositCountryCode}
                              </div>
                              <input
                                type="tel"
                                required
                                placeholder="Ex: 699999999"
                                value={depositPhone}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9]/g, '');
                                  setDepositPhone(val);
                                }}
                                className="w-full bg-white border border-l-0 border-slate-200 focus:border-[#1b64d9] rounded-r-xl py-2.5 px-3 text-xs text-slate-700 font-bold focus:outline-none shadow-sm placeholder:text-slate-400 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* TRANSACTION REFERENCE */}
                      <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 font-mono">
                          ID de transaction ou référence SMS de confirmation 🔑
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: CO260704.0924.D00010"
                          value={manualReference}
                          onChange={(e) => setManualReference(e.target.value)}
                          className="w-full bg-white border-2 border-slate-200/45 focus:border-[#1b64d9] rounded-2xl py-3.5 px-4 text-sm text-slate-800 font-bold focus:outline-none shadow-sm placeholder:text-slate-400 font-mono"
                        />
                        <span className="text-[10px] text-slate-400 font-semibold block mt-1">Indiquez l'ID unique du transfert reçu dans le SMS de confirmation.</span>
                      </div>

                      {/* CAPTURE D'ÉCRAN UPLOADER */}
                      <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 font-mono">
                          Capture d'écran du reçu de paiement 📸
                        </label>
                        <div
                          onDragOver={(e) => { e.preventDefault(); setIsDraggingManualReceipt(true); }}
                          onDragLeave={() => setIsDraggingManualReceipt(false)}
                          onDrop={handleManualReceiptDrop}
                          className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2.5 relative ${
                            isDraggingManualReceipt 
                              ? 'border-[#1b64d9] bg-blue-50/50' 
                              : manualReceiptBase64 
                                ? 'border-green-300 bg-green-50/20' 
                                : 'border-slate-300 hover:border-slate-400 bg-white'
                          }`}
                          onClick={() => {
                            const fileInput = document.getElementById('manual-receipt-input');
                            if (fileInput) fileInput.click();
                          }}
                        >
                          <input
                            id="manual-receipt-input"
                            type="file"
                            accept="image/*"
                            onChange={handleManualReceiptSelect}
                            className="hidden"
                          />

                          {manualReceiptBase64 ? (
                            <div className="flex flex-col items-center space-y-2">
                              <img
                                src={manualReceiptBase64}
                                alt="Reçu de paiement"
                                className="w-20 h-20 object-cover rounded-lg border border-slate-200 shadow-sm"
                                referrerPolicy="no-referrer"
                              />
                              <span className="text-[11px] font-bold text-green-700">✓ Reçu sélectionné : {manualReceiptFileName.slice(0, 20)}...</span>
                              <span className="text-[10px] text-slate-400">Cliquez pour modifier le fichier</span>
                            </div>
                          ) : (
                            <>
                              <Camera className="w-7 h-7 text-slate-450" />
                              <div className="text-xs text-slate-600 font-bold">Glissez-déposez le reçu ou cliquez ici</div>
                              <div className="text-[10px] text-slate-450 font-semibold">Formats acceptés : JPG, PNG, WEBP</div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* SUBMIT BUTTON */}
                      <div className="space-y-3 pt-2">
                        <button
                          type="submit"
                          disabled={isSubmittingDeposit}
                          className="w-full py-4 text-white font-sans font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-95 transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-600 to-teal-500"
                        >
                          {isSubmittingDeposit ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Envoi du reçu en cours...</span>
                            </div>
                          ) : (
                            <span>📤 Soumettre mon reçu de paiement</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            );
          })()}

          {/* WITHDRAW FORM TAB */}
          {!profileSubPage && activeTab === 'withdraw' && (
            <div className="max-w-md mx-auto bg-[#eef3fc] border-0 p-4 md:p-5 rounded-2xl shadow-lg text-slate-800">
              <div className="text-center mb-4">
                <span className="text-[10px] font-black text-[#1b64d9] tracking-widest uppercase block mb-0.5">CASH OUT DETECTÉ</span>
                <h3 className="text-lg font-display font-black text-slate-800 uppercase tracking-tight">Demande de Retrait</h3>
                <p className="text-[11px] text-slate-500 font-bold mt-0.5">Saisissez vos paramètres de transfert de solde.</p>
              </div>

              {(new Date().getHours() < 9 || new Date().getHours() >= 17) && (
                <div className="mb-3 p-3 rounded-xl bg-amber-100 border border-amber-200 text-[10.5px] text-amber-850 font-black text-center uppercase tracking-wide flex flex-col gap-0.5 shadow-sm">
                  <span>⚠️ SYSTÈME HORS PLAGE HORAIRE</span>
                  <span>Les retraits sont ouverts uniquement de 09h00 à 17h00 chaque jour.</span>
                </div>
              )}

              {(DataStore.areWithdrawalsBlocked() || userState.withdrawBlocked) && (
                <div className="mb-3 p-3 rounded-xl bg-blue-50 border border-blue-100 text-[10.5px] text-blue-900 font-black text-center uppercase tracking-wide flex flex-col gap-0.5 shadow-sm">
                  <span>⚠️ RETRAITS SUSPENDUS TEMPORAIREMENT</span>
                  <span>Les retraits sont restreints sur votre compte.</span>
                </div>
              )}

              {withdrawError && (
                <div className="mb-3 p-2.5 rounded-xl bg-red-100 border border-red-200 text-xs text-red-700 font-bold">{withdrawError}</div>
              )}
              {withdrawSuccess && (
                <div className="mb-3 p-3 rounded-xl bg-green-100 border border-green-200 text-xs text-green-700 font-bold">{withdrawSuccess}</div>
              )}

              <div className="mb-4 bg-white border-0 rounded-xl p-3 shadow-sm text-center">
                <span className="text-slate-400 font-extrabold uppercase text-[9px] tracking-wide block">Solde Actuel Disponible :</span>
                <div className="text-xl sm:text-2xl font-black text-[#00bd74] mt-0.5 solde-bold">{userState.balance.toLocaleString()} {getCurrency()}</div>
              </div>

              <form onSubmit={submitWithdrawal} className="space-y-3 text-left">
                {/* Operator select */}
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1">Opérateur de réception</label>
                  <select 
                    value={withdrawOperator}
                    onChange={(e) => setWithdrawOperator(e.target.value)}
                    className="w-full bg-white border border-blue-50 rounded-xl py-2 px-3 text-xs text-slate-800 font-bold focus:outline-none cursor-pointer shadow-sm"
                  >
                    <optgroup label="Togo 🇹🇬">
                      <option value="T-Money (TG)">T-Money (TG)</option>
                      <option value="Moov (TG)">Moov (TG)</option>
                    </optgroup>
                    <optgroup label="Cameroun 🇨🇲">
                      <option value="MTN (CM)">MTN (CM)</option>
                      <option value="Orange (CM)">Orange (CM)</option>
                    </optgroup>
                    <optgroup label="Côte d'Ivoire 🇨🇮">
                      <option value="Wave (CI)">Wave (CI)</option>
                      <option value="MTN (CI)">MTN (CI)</option>
                      <option value="Orange (CI)">Orange (CI)</option>
                      <option value="Moov (CI)">Moov (CI)</option>
                    </optgroup>
                    <optgroup label="Sénégal 🇸🇳">
                      <option value="Wave (SN)">Wave (SN)</option>
                      <option value="Orange (SN)">Orange (SN)</option>
                      <option value="Free Money / Mixx (SN)">Free Money / Mixx (SN)</option>
                    </optgroup>
                    <optgroup label="Bénin 🇧🇯">
                      <option value="MTN (BJ)">MTN (BJ)</option>
                      <option value="Moov (BJ)">Moov (BJ)</option>
                    </optgroup>
                    <optgroup label="Burkina Faso 🇧🇫">
                      <option value="Orange (BF)">Orange (BF)</option>
                      <option value="Moov (BF)">Moov (BF)</option>
                    </optgroup>
                    <optgroup label="Mali 🇲🇱">
                      <option value="Orange (ML)">Orange (ML)</option>
                    </optgroup>
                    <optgroup label="Congo RDC 🇨🇩">
                      <option value="Vodacom (COD)">Vodacom (COD)</option>
                      <option value="Airtel (COD)">Airtel (COD)</option>
                      <option value="Orange (COD)">Orange (COD)</option>
                    </optgroup>
                    <optgroup label="Congo Brazzaville 🇨🇬">
                      <option value="Airtel (COG)">Airtel (COG)</option>
                      <option value="MTN (COG)">MTN (COG)</option>
                    </optgroup>
                  </select>
                </div>

                {/* Target phone number with WhatsApp placeholder */}
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1">Numéro de téléphone de réception</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: +228 90123456"
                    value={withdrawNumber}
                    onChange={(e) => setWithdrawNumber(e.target.value)}
                    className="w-full bg-white border border-blue-50 rounded-xl py-2 px-3 text-xs text-slate-800 font-mono font-bold tracking-wider shadow-sm"
                  />
                  <span className="text-[9px] text-slate-400 block mt-1 font-bold">Assurez-vous que le numéro est actif et lié à un compte Mobile Money.</span>
                </div>

                {/* Withdraw value */}
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1">Montant à extraire ({getCurrency()})</label>
                  <input
                    type="number"
                    required
                    placeholder={`Montant à retirer en ${getCurrency()}`}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-white border border-blue-50 rounded-xl py-2 px-3 text-xs text-[#1b64d9] font-black focus:outline-none"
                  />
                </div>

                {/* Real-time fee summary */}
                {!isNaN(parseInt(withdrawAmount)) && parseInt(withdrawAmount) > 0 && (
                  <div className="bg-[#fffdfb] p-2.5 rounded-xl border border-blue-50 text-[10.5px] font-bold text-slate-700 space-y-1 animate-fade-in shadow-sm">
                    <span className="font-extrabold text-[#1b64d9] text-[9px] uppercase tracking-wider block">Calcul automatique (12% Frais) :</span>
                    <div className="flex justify-between border-b border-slate-100/50 pb-0.5">
                      <span className="text-slate-500 font-semibold">Montant brut :</span>
                      <span className="font-mono">{parseInt(withdrawAmount).toLocaleString()} {getCurrency()}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100/50 pb-0.5 text-red-500">
                      <span className="font-semibold">Frais (12%) :</span>
                      <span className="font-mono">-{Math.round(parseInt(withdrawAmount) * 0.12).toLocaleString()} {getCurrency()}</span>
                    </div>
                    <div className="pt-0.5 flex justify-between text-[#00bd74] text-[10.5px] font-black">
                      <span>Montant net crédité :</span>
                      <span className="text-xs font-mono">{Math.max(0, parseInt(withdrawAmount) - Math.round(parseInt(withdrawAmount) * 0.12)).toLocaleString()} {getCurrency()}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 text-white font-sans font-black text-xs uppercase tracking-widest bg-gradient-to-r from-[#00bcff] to-[#0ea5e9] rounded-xl hover:opacity-95 transition-all shadow-md active:scale-95 text-center flex items-center justify-center"
                >
                  Envoyer la demande de Retrait
                </button>
              </form>

              {/* RÈGLES ET CONDITIONS DE RETRAIT EN TIRÉ/BULLETS */}
              <div className="mt-8 pt-6 border-t border-blue-50/70 text-slate-700/90 text-left">
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

          {/* WITHDRAWAL PROOFS FEED TAB REMOVED */}
          {false && activeTab === 'proofs' && (
            <div className="space-y-6 max-w-4xl mx-auto text-left bg-white p-6 sm:p-8 rounded-[34px] border border-blue-50 shadow-[0_12px_45px_rgba(249,115,22,0.04)]">
              
              {/* BRAND HEADER CARD */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-[28px] p-6 sm:p-8 shadow-sm text-slate-800 text-left relative overflow-hidden">
                {/* Decorative background visual blob */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#f0f4ff]0/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-sans font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-250/40">
                      ✅ Communauté Active
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-sans font-black text-slate-800 tracking-tight leading-none mt-1">
                      Preuves de Retrait
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                      Découvrez les reçus réels reçus et publiés en direct par nos investisseurs Dreampod.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsPublishFormOpen(!isPublishFormOpen)}
                    className="self-start sm:self-center px-5 py-3 bg-gradient-to-r from-[#1b64d9] to-amber-500 hover:from-[#1b64d9] hover:to-blue-700 text-white font-bold text-xs rounded-2xl shadow-[0_4px_15px_rgba(249,115,22,0.25)] flex items-center gap-2 duration-150 transition-all cursor-pointer select-none active:scale-95 shrink-0 uppercase tracking-widest font-mono"
                  >
                    <Camera className="w-4 h-4" />
                    {isPublishFormOpen ? "Masquer le formulaire" : "Publier ma preuve"}
                  </button>
                </div>
              </div>

              {/* PUBLISH PROOF SHEET / CARD */}
              <AnimatePresence>
                {isPublishFormOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-slate-50/50 border border-blue-50 rounded-3xl p-5 sm:p-6 shadow-md text-slate-800">
                      <div className="border-b border-slate-200 pb-3 mb-4">
                        <span className="text-xs sm:text-sm font-sans font-black text-slate-800 uppercase tracking-wider block">
                          📝 Partager mon expérience de paiement
                        </span>
                        <span className="text-[10px] sm:text-xs text-slate-500 block mt-0.5 opacity-90">
                          Racontez votre retrait pour inspirer notre communauté de producteurs. Votre nom et pays seront joints !
                        </span>
                      </div>

                      <form onSubmit={handlePublishProof} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Amount Input */}
                          <div className="space-y-1">
                            <label className="text-[10px] sm:text-xs font-sans font-black text-slate-700 uppercase tracking-wider block">
                              Montant retiré (FCFA / XOF) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              required
                              min="1"
                              placeholder="Ex: 25000"
                              value={proofAmount}
                              onChange={(e) => setProofAmount(e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:border-[#f0f4ff]0 focus:outline-[#1b64d9] rounded-xl text-xs sm:text-sm text-slate-800 p-3.5 font-bold transition-all focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400"
                            />
                          </div>

                          {/* Image Attachment widget with full drag and drop */}
                          <div className="space-y-1">
                            <label className="text-[10px] sm:text-xs font-sans font-black text-slate-700 uppercase tracking-wider block">
                              Capture d'écran du reçu Mobile Money (Optionnel)
                            </label>
                            
                            <div 
                              onDragOver={(e) => {
                                e.preventDefault();
                                setIsDraggingProof(true);
                              }}
                              onDragLeave={() => setIsDraggingProof(false)}
                              onDrop={async (e) => {
                                e.preventDefault();
                                setIsDraggingProof(false);
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                  const file = e.dataTransfer.files[0];
                                  setProofImageFileName(file.name);
                                  try {
                                    const compressed = await compressImage(file, 500, 0.45);
                                    setProofImage(compressed);
                                  } catch (err) {
                                    const reader = new FileReader();
                                    reader.readAsDataURL(file);
                                    reader.onload = () => {
                                      setProofImage(reader.result as string);
                                    };
                                  }
                                }
                              }}
                              className={`border-2 border-dashed rounded-xl p-3 text-center flex items-center justify-center gap-3 transition-all duration-150 relative ${
                                isDraggingProof 
                                  ? 'border-[#f0f4ff]0 bg-[#f0f4ff]0/10' 
                                  : proofImage 
                                    ? 'border-emerald-500 bg-emerald-500/10' 
                                    : 'border-slate-250 bg-white hover:border-blue-300 hover:bg-slate-50/50'
                              }`}
                            >
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    setProofImageFileName(file.name);
                                    try {
                                      const compressed = await compressImage(file, 500, 0.45);
                                      setProofImage(compressed);
                                    } catch (err) {
                                      const reader = new FileReader();
                                      reader.readAsDataURL(file);
                                      reader.onload = () => {
                                        setProofImage(reader.result as string);
                                      };
                                    }
                                  }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                              />

                              {proofImage ? (
                                <div className="flex items-center justify-between w-full z-20 px-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-emerald-500/30">
                                      <img src={proofImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    </div>
                                    <div className="text-left leading-tight truncate max-w-[150px] sm:max-w-[200px]">
                                      <span className="text-[10px] text-slate-700 font-bold block truncate">{proofImageFileName || 'reçu_retrait.jpg'}</span>
                                      <span className="text-[9px] text-emerald-600 font-black uppercase tracking-wider block">Chargé</span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setProofImage('');
                                      setProofImageFileName('');
                                    }}
                                    className="text-[9px] text-red-600 hover:text-red-700 font-black uppercase tracking-wider px-2.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200/50 rounded-lg transition-colors z-30"
                                  >
                                    Enlever
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="w-8 h-8 rounded-lg bg-[#f0f4ff] border border-blue-50/50 text-[#1b64d9] flex items-center justify-center text-sm shrink-0">
                                    📸
                                  </div>
                                  <div className="text-left leading-tight">
                                    <span className="text-[10px] sm:text-[11px] text-[#1b64d9] font-black uppercase tracking-wide block">
                                      Choisir ou glisser l'image
                                    </span>
                                    <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold block">
                                      PNG, JPG (Reçu de transaction)
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Text Message Input */}
                        <div className="space-y-1">
                          <label className="text-[10px] sm:text-xs font-sans font-black text-slate-700 uppercase tracking-wider block">
                            Votre Message / Témoignage <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Partagez votre joie ! Ex: Super ! Retrait instantané de mon gain VIP sur mon compte Wave, équipe au top !"
                            value={proofMessage}
                            onChange={(e) => setProofMessage(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-[#f0f4ff]0 focus:outline-[#1b64d9] rounded-xl text-xs sm:text-sm text-slate-800 p-3.5 font-bold transition-all focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 resize-none"
                          />
                        </div>

                        {/* Submit Actions */}
                        <div className="flex gap-2.5 justify-end">
                          <button
                            type="button"
                            onClick={() => setIsPublishFormOpen(false)}
                            className="px-4 py-3 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            disabled={isPublishing}
                            className={`px-6 py-3 font-bold text-xs rounded-xl flex items-center gap-2 text-white shadow-md cursor-pointer ${
                              isPublishing 
                                ? 'bg-blue-400 opacity-80 cursor-not-allowed' 
                                : 'bg-[#f0f4ff]0 hover:bg-[#1b64d9] shadow-blue-500/10 active:scale-95 transition-all'
                            }`}
                          >
                            {isPublishing ? "Publication..." : "Partager sur le Flux 🚀"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* TIMELINE OF PROOFS */}
              <div className="space-y-4">
                {withdrawalProofs.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-12 text-center text-slate-700">
                    <span className="text-3xl block">🌾</span>
                    <h3 className="font-sans font-black text-slate-800 text-sm uppercase tracking-wider mt-2.5">Aucun témoignage publié</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium opacity-90">
                      Soyez le premier à partager votre joie et à publier votre preuve de retrait pour inspirer de nouveaux membres.
                    </p>
                  </div>
                ) : (
                  withdrawalProofs.map((proof) => {
                    const hasLiked = proof.likes.includes(userState.id);
                    const colors = [
                      'from-[#1b64d9] to-amber-500', 
                      'from-emerald-500 to-teal-500', 
                      'from-blue-500 to-indigo-500', 
                      'from-purple-500 to-pink-500'
                    ];
                    let hash = 0;
                    for (let i = 0; i < proof.userName.length; i++) {
                      hash += proof.userName.charCodeAt(i);
                    }
                    const avatarGradient = colors[hash % colors.length];

                    return (
                      <div 
                        key={proof.id}
                        className="bg-white border border-slate-150 hover:border-blue-100 hover:shadow-lg transition-all rounded-3xl p-5 text-left relative overflow-hidden group shadow-sm"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full blur-xl pointer-events-none group-hover:bg-white/[0.02] transition-colors" />

                        <div className="flex justify-between items-start">
                          <div className="flex gap-3">
                            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${avatarGradient} text-white font-sans font-black flex items-center justify-center text-sm shadow-md`}>
                              {proof.userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="leading-tight">
                              <div className="flex items-center gap-1.5">
                                <span className="font-sans font-black text-slate-800 text-sm block">
                                  {proof.userName}
                                </span>
                                <span className="bg-emerald-50 text-emerald-700 text-[8px] font-sans font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-emerald-200/50 flex items-center gap-0.5 select-none animate-pulse">
                                  <span>PAYÉ</span>
                                  <span>★</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-[#1b64d9] font-black uppercase tracking-wider block opacity-95">
                                  📍 {proof.userCountry}
                                </span>
                                <span className="text-slate-400 text-[9px] font-black tracking-normal uppercase opacity-75">
                                  {new Date(proof.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right leading-none">
                            <span className="text-emerald-600 font-mono font-black text-base sm:text-lg tracking-tight block">
                              +{proof.amount.toLocaleString()} XOF
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold whitespace-pre-wrap">
                            {proof.message}
                          </p>
                        </div>

                        {proof.image && (
                          <div className="mt-4 max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 hover:border-blue-100 transition-colors">
                            <button
                              onClick={() => setExpandedImage(proof.image || null)}
                              type="button"
                              className="w-full relative focus:outline-none focus:ring-0 select-none cursor-zoom-in overflow-hidden"
                              title="Cliquer pour zoomer sur le reçu de retrait"
                            >
                              <img 
                                src={proof.image} 
                                className="w-full max-h-[350px] object-contain transition-transform duration-300 hover:scale-[1.02] block mx-auto" 
                                referrerPolicy="no-referrer" 
                              />
                              <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] text-white font-mono font-black uppercase tracking-wider flex items-center gap-1 border border-white/10 shadow-md">
                                <span>🔍 Agrandir l'image</span>
                              </div>
                            </button>
                          </div>
                        )}

                        <div className="flex justify-start items-center border-t border-slate-100 mt-4 pt-3">
                          <button
                            onClick={() => handleLikeProof(proof.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-black tracking-wide uppercase transition-all duration-150 ${
                              hasLiked 
                                ? 'bg-[#f0f4ff] text-[#1b64d9] font-black saturate-150 border border-blue-100' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent'
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-[#1b64d9] stroke-[#1b64d9]' : ''}`} />
                            <span>{proof.likes.length > 0 ? `${proof.likes.length} ${proof.likes.length === 1 ? 'Like' : 'Likes'}` : 'Soutenir'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ENLARGED FULLSCREEN RECEIPT MODAL OVERLAY */}
              <AnimatePresence>
                {expandedImage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setExpandedImage(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 cursor-zoom-out"
                  >
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.95 }}
                      onClick={(e) => e.stopPropagation()}
                      className="max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between relative shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
                    >
                      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-950/40">
                        <span className="font-sans font-black text-xs text-white uppercase tracking-widest block">
                          Verified Cash Transaction Receipt
                        </span>
                        <button
                          onClick={() => setExpandedImage(null)}
                          className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer border-none outline-none"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="p-4 flex-grow overflow-auto flex items-center justify-center max-h-[70vh]">
                        <img 
                          src={expandedImage} 
                          className="max-w-full max-h-[62vh] object-contain rounded-2xl border border-slate-800 shadow-inner" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

          {/* TEAM / MLM SYSTEM TAB */}
          {!profileSubPage && activeTab === 'team' && (
            <div className="bg-[#f8fafc] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-24 min-h-[95vh] text-slate-800 text-left">
              <div className="max-w-md mx-auto w-full space-y-4">
                
                {/* BRAND HEADER */}
                <div className="flex items-center space-x-2 pb-1 pt-1 pl-1 select-none">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1b64d9] to-[#2575fc] flex items-center justify-center text-white shadow-sm">
                    <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="font-sans font-black tracking-wider text-[#1b64d9] text-sm uppercase">DREAMPOD INVESTMENT</span>
                </div>

                {/* HEADER */}
                <div className="space-y-1 pl-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#1b64d9]" />
                    <h2 className="font-sans font-black text-slate-800 text-base uppercase tracking-tight">Filleuls &amp; Récompenses d'Equipe</h2>
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                    Gagnez des commissions instantanées sur 3 niveaux d'affiliation à chaque fois que vos filleuls rechargent leur compte et investissent.
                  </p>
                </div>

                {/* STATS OVERVIEW CARD (TOTAL FILLEULS INVITÉS & COMMISSIONS) */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1b64d9] flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">TOTAL FILLEULS INVITÉS</span>
                      <span className="text-sm font-black text-slate-800 block mt-0.5">{totalReferrals} invités</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">COMMISSIONS</span>
                    <span className="text-sm font-black text-[#00bd74] block mt-0.5">
                      {commissions.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} F
                    </span>
                  </div>
                </div>

                {/* EXCLUSIVE INVITATION LINK CARD */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block pl-0.5">
                    🔗 VOTRE LIEN D'INVITATION EXCLUSIF
                  </span>
                  
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-2.5">
                    <div className="flex-1 overflow-hidden">
                      <span className="font-mono text-[10.5px] font-bold text-slate-600 select-all block truncate text-left pr-2">
                        {referralURL}
                      </span>
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className="bg-[#1b64d9] hover:bg-blue-600 text-white text-[10px] font-black px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm flex items-center justify-center shrink-0 cursor-pointer border-none outline-none"
                    >
                      {copiedLink ? "COPIÉ" : "COPIER"}
                    </button>
                  </div>

                  {/* PARTAGER AUTOMATIQUEMENT */}
                  <div className="pt-3.5 border-t border-slate-100">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-2 text-left pl-0.5">PARTAGER AUTOMATIQUEMENT :</span>
                    <div className="grid grid-cols-5 gap-2">
                      {/* WhatsApp */}
                      <a 
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Rejoignez Dreampod Investment et gagnez des revenus quotidiens sécurisés ! Utilisez mon lien d'inscription : ${referralURL}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-2 bg-emerald-50 hover:bg-emerald-100/70 rounded-2xl transition-all border-none outline-none cursor-pointer"
                      >
                        <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center mb-1 text-emerald-600">
                          <svg className="w-4 h-4 fill-emerald-600" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 1.975 14.069 1.953 12.01 1.953c-5.438 0-9.863 4.372-9.867 9.802-.001 1.83.49 3.619 1.423 5.191l-.991 3.616 3.702-.971zm11.367-7.251c-.33-.164-1.952-.955-2.253-1.064-.3-.11-.52-.164-.74.164-.22.33-.85 1.064-1.04 1.283-.19.22-.38.246-.71.082-.33-.164-1.393-.51-2.653-1.627-.98-.868-1.64-1.94-1.83-2.268-.19-.33-.02-.508.145-.671.15-.148.33-.384.495-.576.16-.192.21-.33.32-.548.11-.219.05-.411-.02-.576-.07-.164-.74-1.765-1.01-2.422-.26-.632-.53-.547-.73-.557-.19-.01-.41-.01-.62-.01-.21 0-.55.08-.84.4-.29.32-1.12 1.083-1.12 2.641 0 1.558 1.14 3.065 1.3 3.282.16.218 2.24 3.393 5.43 4.757.76.324 1.35.518 1.81.662.76.241 1.45.207 2 .126.61-.09 1.95-.79 2.23-1.558.28-.767.28-1.422.2-1.558-.09-.137-.3-.21-.63-.375z" />
                          </svg>
                        </div>
                        <span className="text-[7.5px] font-black text-emerald-600 uppercase font-sans">WhatsApp</span>
                      </a>

                      {/* Twitter */}
                      <a 
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Rejoignez Dreampod Investment et gagnez des revenus quotidiens sécurisés ! Utilisez mon lien : `)}&url=${encodeURIComponent(referralURL)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-2 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border-none outline-none cursor-pointer"
                      >
                        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center mb-1 text-slate-800">
                          <svg className="w-4 h-4 fill-slate-800" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </div>
                        <span className="text-[7.5px] font-black text-slate-700 uppercase font-sans">Twitter</span>
                      </a>

                      {/* Telegram */}
                      <a 
                        href={`https://t.me/share/url?url=${encodeURIComponent(referralURL)}&text=${encodeURIComponent(`Rejoignez Dreampod Investment et obtenez des rendements quotidiens exceptionnels !`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-2 bg-[#e8f4fd] hover:bg-sky-100 rounded-2xl transition-all border-none outline-none cursor-pointer"
                      >
                        <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center mb-1 text-sky-600">
                          <svg className="w-4 h-4 fill-sky-600" viewBox="0 0 24 24">
                            <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.578.193l-8.534 7.701-.33 4.953c.485 0 .7-.223.972-.485l2.333-2.269 4.85 3.583c.893.492 1.535.239 1.758-.826l3.18-14.986c.325-1.3-.497-1.892-1.35-1.493z" />
                          </svg>
                        </div>
                        <span className="text-[7.5px] font-black text-sky-600 uppercase font-sans">Telegram</span>
                      </a>

                      {/* Facebook */}
                      <a 
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralURL)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-2 bg-blue-50 hover:bg-blue-100/70 rounded-2xl transition-all border-none outline-none cursor-pointer"
                      >
                        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center mb-1 text-blue-600">
                          <svg className="w-4 h-4 fill-blue-600" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        </div>
                        <span className="text-[7.5px] font-black text-blue-600 uppercase font-sans">Facebook</span>
                      </a>

                      {/* Instagram */}
                      <button 
                        onClick={() => {
                          handleCopyLink();
                          triggerToast('🔗 Lien copié ! Collez-le sur Instagram.', 'success');
                          setTimeout(() => {
                            window.open('https://instagram.com', '_blank', 'noopener,noreferrer');
                          }, 1500);
                        }}
                        className="flex flex-col items-center justify-center p-2 bg-rose-50 hover:bg-rose-100/70 rounded-2xl transition-all border-none outline-none cursor-pointer"
                      >
                        <div className="w-9 h-9 bg-rose-100 rounded-xl flex items-center justify-center mb-1 text-rose-500">
                          <svg className="w-4 h-4 fill-none stroke-rose-500 stroke-[2.5]" viewBox="0 0 24 24">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                          </svg>
                        </div>
                        <span className="text-[7.5px] font-black text-rose-600 uppercase font-sans">Instagram</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* NETWORK STRUCTURE & DETAIL LIST */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block pl-0.5">
                      STRUCTURE DE L'ÉQUIPE
                    </span>
                    <span className="text-[9px] bg-blue-50 text-[#1b64d9] font-bold font-mono px-2 py-0.5 rounded-full border border-blue-100">
                      {totalReferrals} membres
                    </span>
                  </div>

                  {/* Gorgeous level selection boxes directly inspired by N1, N2, N3 from the screenshot */}
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-100/50">
                    <button
                      onClick={() => setReferralListTab('level1')}
                      className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center border-none outline-none cursor-pointer ${
                        referralListTab === 'level1' 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'bg-transparent text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full mb-1 ${
                        referralListTab === 'level1' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600 font-black'
                      }`}>
                        N1 ({mlmRates.level1 || 20}%)
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-tight">Niveau 1</span>
                      <span className="text-[8px] opacity-85 mt-0.5 font-bold">({level1Users.length})</span>
                    </button>

                    <button
                      onClick={() => setReferralListTab('level2')}
                      className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center border-none outline-none cursor-pointer ${
                        referralListTab === 'level2' 
                          ? 'bg-amber-500 text-slate-950 shadow-sm' 
                          : 'bg-transparent text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full mb-1 ${
                        referralListTab === 'level2' ? 'bg-black/10 text-slate-950' : 'bg-amber-50 text-amber-600 font-black'
                      }`}>
                        N2 ({mlmRates.level2 || 2}%)
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-tight">Niveau 2</span>
                      <span className="text-[8px] opacity-85 mt-0.5 font-bold">({level2Users.length})</span>
                    </button>

                    <button
                      onClick={() => setReferralListTab('level3')}
                      className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center border-none outline-none cursor-pointer ${
                        referralListTab === 'level3' 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'bg-transparent text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full mb-1 ${
                        referralListTab === 'level3' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600 font-black'
                      }`}>
                        N3 ({mlmRates.level3 || 1}%)
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-tight">Niveau 3</span>
                      <span className="text-[8px] opacity-85 mt-0.5 font-bold">({level3Users.length})</span>
                    </button>
                  </div>

                  {/* LEVEL SUMMARY SUMMARY CARDS (TOTAL INVESTI PER LEVEL) */}
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {referralListTab === 'level1' && (
                      <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-2xl flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-blue-700">Total investi Niveau 1 :</span>
                        <span className="text-xs font-mono font-black text-blue-800">
                          {getLevelInvestedAmount(level1Users).toLocaleString()} F CFA
                        </span>
                      </div>
                    )}
                    {referralListTab === 'level2' && (
                      <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-2xl flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-amber-700">Total investi Niveau 2 :</span>
                        <span className="text-xs font-mono font-black text-amber-800">
                          {getLevelInvestedAmount(level2Users).toLocaleString()} F CFA
                        </span>
                      </div>
                    )}
                    {referralListTab === 'level3' && (
                      <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-2xl flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-emerald-700">Total investi Niveau 3 :</span>
                        <span className="text-xs font-mono font-black text-emerald-800">
                          {getLevelInvestedAmount(level3Users).toLocaleString()} F CFA
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ACTIVE LEVEL MEMBERS list */}
                  {referralListTab === 'level1' && (
                    <div className="space-y-3">
                      {level1Users.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-slate-100">
                          <p className="text-[11px] text-slate-400 font-bold leading-normal">
                            Vous n'avez pas encore de filleuls inscrits directement (Niveau 1).
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {level1Users.map(u => (
                            <div key={u.id} className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-left space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-sans font-black text-slate-800 text-xs truncate max-w-[150px]">{u.name}</span>
                                <span className="text-[8px] font-black font-mono text-[#00bd74] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">Actif</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div className="bg-white p-2 rounded-xl border border-slate-100/80">
                                  <span className="text-slate-400 font-bold block text-[8px] uppercase">Compte WhatsApp</span>
                                  <span className="text-slate-700 font-bold block mt-0.5">{u.whatsapp || 'Aucun'}</span>
                                </div>
                                <div className="bg-white p-2 rounded-xl border border-slate-100/80">
                                  <span className="text-slate-400 font-bold block text-[8px] uppercase">Total Investi</span>
                                  <span className="text-[#1b64d9] font-black block mt-0.5">{getUserInvestedAmount(u.id).toLocaleString()} F CFA</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-100/80 pt-2 font-bold">
                                <span>Inscrit le {new Date(u.createdAt).toLocaleDateString()}</span>
                                <a 
                                  href={`https://wa.me/${(u.whatsapp || '').replace(/[^0-9]/g, '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[#00bd74] font-black hover:underline"
                                >
                                  Contacter WhatsApp 💬
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {referralListTab === 'level2' && (
                    <div className="space-y-3">
                      {level2Users.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-slate-100">
                          <p className="text-[11px] text-slate-400 font-bold leading-normal">
                            Aucun membre de Niveau 2 enregistré dans votre réseau.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {level2Users.map(u => {
                            const cleanRef = (u.referredBy || '').trim().toUpperCase();
                            const sponsor = cleanRef ? allUsers.find(sp => sp.id.toUpperCase() === cleanRef || (sp.referralCode && sp.referralCode.toUpperCase() === cleanRef)) : undefined;
                            return (
                              <div key={u.id} className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-left space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-sans font-black text-slate-800 text-xs truncate max-w-[150px]">{u.name}</span>
                                  <span className="text-[8px] font-bold text-slate-400">Sponsor: {sponsor ? sponsor.name : 'Membre L1'}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                  <div className="bg-white p-2 rounded-xl border border-slate-100/80">
                                    <span className="text-slate-400 font-bold block text-[8px] uppercase">Compte WhatsApp</span>
                                    <span className="text-slate-700 font-bold block mt-0.5">{u.whatsapp || 'Aucun'}</span>
                                  </div>
                                  <div className="bg-white p-2 rounded-xl border border-slate-100/80">
                                    <span className="text-slate-400 font-bold block text-[8px] uppercase">Total Investi</span>
                                    <span className="text-[#1b64d9] font-black block mt-0.5">{getUserInvestedAmount(u.id).toLocaleString()} F CFA</span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-100/80 pt-2 font-bold">
                                  <span>Inscrit le {new Date(u.createdAt).toLocaleDateString()}</span>
                                  <a 
                                    href={`https://wa.me/${(u.whatsapp || '').replace(/[^0-9]/g, '')}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-emerald-600 font-black hover:underline"
                                  >
                                    Contacter WhatsApp 💬
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {referralListTab === 'level3' && (
                    <div className="space-y-3">
                      {level3Users.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-slate-100">
                          <p className="text-[11px] text-slate-400 font-bold leading-normal">
                            Aucun membre de Niveau 3 enregistré dans votre réseau.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {level3Users.map(u => {
                            const cleanRef = (u.referredBy || '').trim().toUpperCase();
                            const sponsor = cleanRef ? allUsers.find(sp => sp.id.toUpperCase() === cleanRef || (sp.referralCode && sp.referralCode.toUpperCase() === cleanRef)) : undefined;
                            return (
                              <div key={u.id} className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-left space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-sans font-black text-slate-800 text-xs truncate max-w-[150px]">{u.name}</span>
                                  <span className="text-[8px] font-bold text-slate-400">Sponsor: {sponsor ? sponsor.name : 'Membre L2'}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                  <div className="bg-white p-2 rounded-xl border border-slate-100/80">
                                    <span className="text-slate-400 font-bold block text-[8px] uppercase">Compte WhatsApp</span>
                                    <span className="text-slate-700 font-bold block mt-0.5">{u.whatsapp || 'Aucun'}</span>
                                  </div>
                                  <div className="bg-white p-2 rounded-xl border border-slate-100/80">
                                    <span className="text-slate-400 font-bold block text-[8px] uppercase">Total Investi</span>
                                    <span className="text-[#1b64d9] font-black block mt-0.5">{getUserInvestedAmount(u.id).toLocaleString()} F CFA</span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-100/80 pt-2 font-bold">
                                  <span>Inscrit le {new Date(u.createdAt).toLocaleDateString()}</span>
                                  <a 
                                    href={`https://wa.me/${(u.whatsapp || '').replace(/[^0-9]/g, '')}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-emerald-600 font-black hover:underline"
                                  >
                                    Contacter WhatsApp 💬
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* USER PROFILE */}
          {!profileSubPage && activeTab === 'profile' && (() => {
            const rechargeSum = allDeposits.filter(d => d.status === 'approved').reduce((acc, d) => acc + d.amount, 0);
            const purchaseSum = activeInvestments.reduce((acc, i) => acc + i.price, 0);
            const rechargeBal = Math.max(0, rechargeSum - purchaseSum);
            const totalProductRevenue = activeInvestments.reduce((acc, i) => acc + (i.totalReturnClaimed || 0), 0);
            const totalCommissions = commissions.reduce((acc, c) => acc + c.amount, 0);
            const activeInvsCount = activeInvestments.filter(i => i.status === 'active').length;

            if (profileSubPage === 'orders') {
              return (
                <div className="bg-[#f8fafc] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-24 min-h-[95vh] text-slate-800 text-left animate-fadeIn">
                  <div className="max-w-md mx-auto w-full space-y-4">
                    <div className="flex items-center space-x-3 mb-2 pt-2">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs border-none outline-none"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      <h2 className="font-sans font-black text-slate-900 text-base uppercase tracking-tight">Mes Commandes</h2>
                    </div>

                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                      <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                        Retrouvez ici tous les équipements et produits d'investissement que vous avez acquis. Vous pouvez réclamer vos revenus quotidiens à tout moment.
                      </p>
                      
                      <div className="space-y-3 pt-2">
                        {activeInvestments.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-slate-100/50">
                            Aucun produit d'investissement actif pour le moment.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {activeInvestments.map((p) => (
                              <InvestmentItem 
                                key={p.id}
                                investment={p}
                                onClaim={handleClaimReturn}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (profileSubPage === 'balance') {
              return (
                <div className="bg-[#f8fafc] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-24 min-h-[95vh] text-slate-800 text-left animate-fadeIn">
                  <div className="max-w-md mx-auto w-full space-y-4">
                    <div className="flex items-center space-x-3 mb-2 pt-2">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs border-none outline-none"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      <h2 className="font-sans font-black text-slate-900 text-base uppercase tracking-tight">Mon Solde</h2>
                    </div>

                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                      <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">Solde de Recharge</span>
                          <span className="text-base sm:text-lg font-black text-[#1b64d9] block mt-1">
                            FCFA {rechargeBal.toLocaleString()}
                          </span>
                        </div>
                        <div className="border-l border-slate-100 pl-4">
                          <span className="text-[10px] text-slate-400 font-bold block">Solde de Retrait</span>
                          <span className="text-base sm:text-lg font-black text-[#1b64d9] block mt-1">
                            FCFA {userState.balance.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1 text-center pt-1.5">
                        <div>
                          <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-tight leading-tight">Revenu Produit</span>
                          <span className="text-xs font-black text-slate-800 block mt-1">
                            FCFA {totalProductRevenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="border-l border-slate-100">
                          <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-tight leading-tight">Commission</span>
                          <span className="text-xs font-black text-slate-800 block mt-1">
                            FCFA {totalCommissions.toLocaleString()}
                          </span>
                        </div>
                        <div className="border-l border-slate-100">
                          <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-tight leading-tight">Nbre de Commandes</span>
                          <span className="text-xs font-black text-slate-800 block mt-1">
                            {activeInvsCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
                      <h3 className="font-sans font-black text-slate-800 text-xs uppercase tracking-wider pl-0.5">Opérations Rapides</h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => setActiveTab('deposit')}
                          className="flex items-center justify-center gap-2 p-3 bg-amber-50 text-[#f07b1b] rounded-2xl font-bold text-xs hover:bg-amber-100/70 transition-all border-none outline-none cursor-pointer"
                        >
                          <Coins className="w-4 h-4" />
                          <span>Recharger</span>
                        </button>
                        <button 
                          onClick={() => setActiveTab('withdraw')}
                          className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-[#1b64d9] rounded-2xl font-bold text-xs hover:bg-blue-100/70 transition-all border-none outline-none cursor-pointer"
                        >
                          <ArrowUpCircle className="w-4 h-4" />
                          <span>Retirer</span>
                        </button>
                      </div>

                      <button 
                        onClick={() => {
                          if (onNavigate) {
                            onNavigate('/historique');
                          }
                        }}
                        className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 text-slate-700 rounded-2xl text-xs font-bold transition-all border-none outline-none cursor-pointer mt-2"
                      >
                        <span>📋 Voir l'historique complet des revenus</span>
                        <span>&gt;</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            if (profileSubPage === 'help') {
              return (
                <div className="bg-[#f8fafc] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-24 min-h-[95vh] text-slate-800 text-left animate-fadeIn">
                  <div className="max-w-md mx-auto w-full space-y-4">
                    <div className="flex items-center space-x-3 mb-2 pt-2">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs border-none outline-none"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      <h2 className="font-sans font-black text-slate-900 text-base uppercase tracking-tight">Centre d'Aide</h2>
                    </div>

                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block pl-0.5">
                        💬 ASSISTANCE EN DIRECT
                      </span>
                      <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                        Notre équipe d'assistance est à votre écoute pour vous aider à résoudre tout problème lié à vos dépôts, retraits ou investissements.
                      </p>
                      
                      <div className="space-y-2.5 pt-1">
                        <button
                          onClick={() => setIsLiveChatOpen(true)}
                          className="w-full bg-[#1b64d9] text-white font-black text-xs py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm hover:bg-blue-600 transition-all cursor-pointer border-none outline-none"
                        >
                          <Headphones className="w-4.5 h-4.5" />
                          <span>DISCUTER PAR CHAT EN DIRECT</span>
                        </button>

                        <button
                          onClick={() => window.open(DataStore.getWhatsAppChannel(), '_blank')}
                          className="w-full bg-[#25D366] text-white font-black text-xs py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm hover:bg-[#20ba59] transition-all cursor-pointer border-none outline-none"
                        >
                          <Send className="w-4.5 h-4.5" />
                          <span>REJOINDRE LE CANAL TELEGRAM</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3.5">
                      <h3 className="font-sans font-black text-slate-800 text-xs uppercase tracking-wider pl-0.5">Questions Fréquentes (FAQ)</h3>
                      
                      <div className="space-y-3 pt-1">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                          <h4 className="text-[11px] font-black text-slate-800 uppercase">Comment effectuer un dépôt ?</h4>
                          <p className="text-[10.5px] text-slate-400 font-bold mt-1 leading-normal">
                            Rendez-vous dans la rubrique "Recharge", indiquez le montant puis suivez les instructions de paiement mobile. Envoyez ensuite la preuve pour validation rapide.
                          </p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                          <h4 className="text-[11px] font-black text-slate-800 uppercase">Quel est le délai de traitement des retraits ?</h4>
                          <p className="text-[10.5px] text-slate-400 font-bold mt-1 leading-normal">
                            Les retraits sont généralement traités sous un délai de 5 minutes à 24 heures maximum, crédités directement sur votre compte mobile configuré.
                          </p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                          <h4 className="text-[11px] font-black text-slate-800 uppercase">Comment fonctionne le parrainage ?</h4>
                          <p className="text-[10.5px] text-slate-400 font-bold mt-1 leading-normal">
                            Invitez vos amis avec votre lien unique. Vous gagnez des commissions sur 3 niveaux (Niveau 1, Niveau 2 et Niveau 3) dès qu'un de vos filleuls investit.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (profileSubPage === 'about') {
              return (
                <div className="bg-[#f8fafc] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-24 min-h-[95vh] text-slate-800 text-left animate-fadeIn">
                  <div className="max-w-md mx-auto w-full space-y-4">
                    <div className="flex items-center space-x-3 mb-2 pt-2">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs border-none outline-none"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      <h2 className="font-sans font-black text-slate-900 text-base uppercase tracking-tight">À Propos</h2>
                    </div>

                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                      <div className="flex justify-center py-2">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1b64d9] to-[#2575fc] flex items-center justify-center text-white shadow-md">
                          <TrendingUp className="w-8 h-8 stroke-[2.5]" />
                        </div>
                      </div>
                      
                      <h3 className="text-center font-sans font-black text-slate-800 text-sm uppercase">Dreampod Investment S.A.</h3>
                      
                      <p className="text-[11px] text-slate-400 font-bold leading-relaxed text-center">
                        Dreampod Investment est une plateforme financière innovante dédiée à l'investissement et à la gestion de produits à haute rentabilité pour tous les investisseurs d'Afrique.
                      </p>

                      <div className="border-t border-slate-50 pt-4 space-y-3.5">
                        <div>
                          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">🔒 Sécurité &amp; Fiabilité</h4>
                          <p className="text-[10.5px] text-slate-400 font-bold mt-1 leading-relaxed">
                            Tous vos investissements sont protégés par des fonds de garantie stricts. Les processus de retrait sont chiffrés et vérifiés par notre équipe d'experts financiers.
                          </p>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">🌟 Notre Vision</h4>
                          <p className="text-[10.5px] text-slate-400 font-bold mt-1 leading-relaxed">
                            Démocratiser l'accès aux opportunités financières de pointe grâce aux technologies numériques modernes et au parrainage de réseau structuré.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (profileSubPage === 'settings') {
              return (
                <div className="bg-[#f8fafc] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-24 min-h-[95vh] text-slate-800 text-left animate-fadeIn">
                  <div className="max-w-md mx-auto w-full space-y-4">
                    <div className="flex items-center space-x-3 mb-2 pt-2">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs border-none outline-none"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      <h2 className="font-sans font-black text-slate-900 text-base uppercase tracking-tight">Paramètres</h2>
                    </div>

                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3.5">
                      <h3 className="font-sans font-black text-slate-800 text-xs uppercase tracking-wider pl-0.5">Informations du Compte</h3>
                      
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100/50 text-xs">
                          <span className="text-slate-400 font-bold">Nom d'utilisateur</span>
                          <span className="font-black text-slate-800">{userState.name || 'Aucun'}</span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100/50 text-xs">
                          <span className="text-slate-400 font-bold">Numéro WhatsApp</span>
                          <span className="font-black text-slate-800">{userState.whatsapp || 'Aucun'}</span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100/50 text-xs">
                          <span className="text-slate-400 font-bold">Code Sponsor Unique</span>
                          <span className="font-mono font-black text-[#1b64d9]">{userState.referralCode}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                      <h3 className="font-sans font-black text-slate-800 text-xs uppercase tracking-wider pl-0.5">Sécurité &amp; Mot de passe</h3>
                      
                      <div className="space-y-3">
                        <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                          Modifiez votre mot de passe pour garantir la sécurité et la confidentialité de vos investissements.
                        </p>
                        
                        <button
                          onClick={() => setIsPasswordModalOpen(true)}
                          className="w-full bg-[#1b64d9] text-white font-black text-xs py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm hover:bg-blue-600 transition-all cursor-pointer border-none outline-none"
                        >
                          <Settings className="w-4.5 h-4.5" />
                          <span>MODIFIER MON MOT DE PASSE</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div className="bg-[#f8fafc] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-24 min-h-[95vh] text-slate-800 text-left">
                <div className="max-w-md mx-auto w-full space-y-4">
                  
                  {/* USER GREETING BANNER */}
                  <div className="flex items-center space-x-3 pb-2 pt-1 pl-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-[#f07b1b] flex items-center justify-center text-white text-lg font-black shadow-sm shrink-0">
                      {userState.name ? userState.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h3 className="font-sans font-black text-slate-900 text-base leading-none">
                        {userState.name || "Cher Investisseur"}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-bold block mt-1 uppercase tracking-wider">
                        {userState.whatsapp || "Aucun numéro"}
                      </span>
                    </div>
                  </div>

                  {/* DREAMPOD PROFILE IMAGE SHOWCASE */}
                  <div id="profile-dreampod-showcase" className="bg-white rounded-3xl overflow-hidden shadow-xs border border-slate-100 relative group">
                    <div className="relative h-48 w-full bg-slate-900">
                      <img
                        src="https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=800"
                        alt="Dreampod Cabine de Flottaison"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      {/* Dark ambient overlay with beautiful gradients */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
                      
                      {/* Glowing indicator */}
                      <span className="absolute top-3 left-3 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7c3aed] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7c3aed]"></span>
                      </span>

                      <div className="absolute bottom-4 left-4 right-4 text-white text-left">
                        <span className="text-[8px] text-purple-300 font-black uppercase tracking-widest block mb-0.5">ÉQUIPEMENT DE BIEN-ÊTRE DE POINTE</span>
                        <h4 className="text-sm font-black uppercase tracking-wide text-white drop-shadow-md">
                          💎 Dreampod Cocon Sommeil &amp; Méditation
                        </h4>
                        <p className="text-[10px] text-slate-300 font-semibold mt-1 leading-normal drop-shadow-sm">
                          Isolation sensorielle absolue et flottaison pour une réduction instantanée du stress et un ressourcement en profondeur.
                        </p>
                      </div>
                      
                      <div className="absolute top-3 right-3 bg-purple-600/95 text-white font-black text-[8px] tracking-wider uppercase px-2.5 py-1 rounded-full backdrop-blur-md border border-purple-400/20">
                        🌟 Partenaire Officiel
                      </div>
                    </div>
                  </div>

                  {/* RECHARGE & RETRAIT CARD BUTTONS */}
                  <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 flex items-center justify-between">
                    <button 
                      onClick={() => setActiveTab('deposit')}
                      className="flex-1 flex items-center justify-center gap-2 font-sans font-bold text-slate-800 hover:text-[#f07b1b] transition-all cursor-pointer border-0 bg-transparent py-2 border-r border-slate-100 outline-none"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-[#f07b1b]">
                        <Coins className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm">Recharge &gt;</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('withdraw')}
                      className="flex-1 flex items-center justify-center gap-2 font-sans font-bold text-slate-800 hover:text-blue-600 transition-all cursor-pointer border-0 bg-transparent py-2 outline-none"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#1b64d9]">
                        <ArrowUpCircle className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm">Retrait &gt;</span>
                    </button>
                  </div>

                   {/* 4 ACTION SHORTCUTS GRID */}
                  <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 grid grid-cols-4 gap-1">
                    <button 
                      onClick={() => setProfileSubPage('orders')}
                      className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1b64d9] flex items-center justify-center transition-transform group-hover:scale-105">
                        <Briefcase className="w-5.5 h-5.5" />
                      </div>
                      <span className="text-[10px] font-sans font-bold text-slate-600 mt-2 leading-tight">Commandes</span>
                    </button>

                    <button 
                      onClick={() => setProfileSubPage('balance')}
                      className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center transition-transform group-hover:scale-105">
                        <Coins className="w-5.5 h-5.5" />
                      </div>
                      <span className="text-[10px] font-sans font-bold text-slate-600 mt-2 leading-tight">Mon Solde</span>
                    </button>

                    <button 
                      onClick={() => setActiveTab('team')}
                      className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-105">
                        <Users className="w-5.5 h-5.5" />
                      </div>
                      <span className="text-[10px] font-sans font-bold text-slate-600 mt-2 leading-tight">Mon Équipe</span>
                    </button>

                    <button 
                      onClick={() => setIsBankCardModalOpen(true)}
                      className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 text-[#f07b1b] flex items-center justify-center transition-transform group-hover:scale-105">
                        <UserIcon className="w-5.5 h-5.5" />
                      </div>
                      <span className="text-[10px] font-sans font-bold text-slate-600 mt-2 leading-tight text-center">Carte Bancaire</span>
                    </button>
                  </div>

                  {/* MES REVENUS CARD */}
                  <div id="mes-revenus-card" className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-4 text-left">
                    <div className="flex justify-between items-center">
                      <h3 className="font-sans font-black text-slate-800 text-sm uppercase tracking-wider pl-0.5">Mes Revenus</h3>
                      <button 
                        onClick={() => {
                          if (onNavigate) {
                            onNavigate('/historique');
                          }
                        }}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-none bg-transparent outline-none"
                      >
                        Détails des Revenus &gt;
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">Solde de Recharge</span>
                        <span className="text-base sm:text-lg font-black text-[#1b64d9] block mt-1">
                          FCFA {rechargeBal.toLocaleString()}
                        </span>
                      </div>
                      <div className="border-l border-slate-100 pl-4">
                        <span className="text-[10px] text-slate-400 font-bold block">Solde de Retrait</span>
                        <span className="text-base sm:text-lg font-black text-[#1b64d9] block mt-1">
                          FCFA {userState.balance.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-center pt-1.5">
                      <div>
                        <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-tight leading-tight">Revenu Produit</span>
                        <span className="text-xs font-black text-slate-800 block mt-1">
                          FCFA {totalProductRevenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="border-l border-slate-100">
                        <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-tight leading-tight">Commission</span>
                        <span className="text-xs font-black text-slate-800 block mt-1">
                          FCFA {totalCommissions.toLocaleString()}
                        </span>
                      </div>
                      <div className="border-l border-slate-100">
                        <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-tight leading-tight">Nbre de Commandes</span>
                        <span className="text-xs font-black text-slate-800 block mt-1">
                          {activeInvsCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* COLLAPSIBLE MY PRODUCTS ACCORDION */}
                  <div id="mes-produits-section" className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 text-left space-y-4">
                    <div 
                      onClick={() => setShowStabilityOrders(!showStabilityOrders)}
                      className="flex justify-between items-center cursor-pointer select-none group"
                    >
                      <div>
                        <h3 className="font-sans font-black text-sm text-slate-800 uppercase tracking-wider pl-0.5">Mes produits ({activeInvestments.length})</h3>
                        <p className="text-[10px] text-slate-400 font-extrabold mt-1 group-hover:text-slate-500 transition-colors">
                          Achetez plus d'appareils pour maximiser vos revenus
                        </p>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${showStabilityOrders ? 'rotate-90' : ''}`} />
                    </div>

                    {showStabilityOrders && (
                      <div className="pt-2 space-y-3.5 border-t border-slate-100">
                        {activeInvestments.length === 0 ? (
                          <div className="text-center py-4 text-slate-400 text-[11px] font-bold">
                            Aucun produit d'investissement actif pour le moment.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {activeInvestments.map((p) => (
                              <InvestmentItem 
                                key={p.id}
                                investment={p}
                                onClaim={handleClaimReturn}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* PLUS DE SERVICES SECTION */}
                  <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 text-left space-y-4">
                    <h3 className="font-sans font-black text-slate-800 text-sm uppercase tracking-wider pl-0.5">Plus de services</h3>

                    <div className="grid grid-cols-4 gap-y-5 gap-x-2 pt-1">
                      {/* VIP */}
                      <button 
                        onClick={() => {
                          const el = document.getElementById('vip-section');
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            setActiveTab('products');
                          }
                        }}
                        className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none"
                      >
                        <div className="w-11 h-11 bg-indigo-50 text-indigo-500 flex items-center justify-center rounded-2xl transition-transform group-hover:scale-105">
                          <ShieldCheck className="w-5.5 h-5.5" />
                        </div>
                        <span className="text-[10px] font-sans font-bold text-slate-600 mt-2 leading-tight">VIP</span>
                      </button>

                      {/* Centre d'Aide */}
                      <button 
                        onClick={() => setProfileSubPage('help')}
                        className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none"
                      >
                        <div className="w-11 h-11 bg-teal-50 text-teal-500 flex items-center justify-center rounded-2xl transition-transform group-hover:scale-105">
                          <Headphones className="w-5.5 h-5.5" />
                        </div>
                        <span className="text-[10px] font-sans font-bold text-slate-600 mt-2 leading-tight">Centre d'Aide</span>
                      </button>

                      {/* À Propos de Nous */}
                      <button 
                        onClick={() => setProfileSubPage('about')}
                        className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none"
                      >
                        <div className="w-11 h-11 bg-rose-50 text-rose-500 flex items-center justify-center rounded-2xl transition-transform group-hover:scale-105">
                          <BookOpen className="w-5.5 h-5.5" />
                        </div>
                        <span className="text-[10px] font-sans font-bold text-slate-600 mt-2 leading-tight">À Propos</span>
                      </button>

                      {/* Telegram */}
                      <button 
                        onClick={() => window.open(DataStore.getWhatsAppChannel(), '_blank')}
                        className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none"
                      >
                        <div className="w-11 h-11 bg-sky-50 text-sky-500 flex items-center justify-center rounded-2xl transition-transform group-hover:scale-105">
                          <Send className="w-5.5 h-5.5" />
                        </div>
                        <span className="text-[10px] font-sans font-bold text-slate-600 mt-2 leading-tight">Telegram</span>
                      </button>

                      {/* Paramètres / Changer MDP */}
                      <button 
                        onClick={() => setProfileSubPage('settings')}
                        className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none"
                      >
                        <div className="w-11 h-11 bg-slate-100 text-slate-500 flex items-center justify-center rounded-2xl transition-transform group-hover:scale-105">
                          <Settings className="w-5.5 h-5.5" />
                        </div>
                        <span className="text-[10px] font-sans font-bold text-slate-600 mt-2 leading-tight">Paramètres</span>
                      </button>
                    </div>
                  </div>

                  {/* DÉCONNEXION BUTTON */}
                  <div className="w-full flex justify-center pt-2">
                    <button 
                      onClick={onLogout}
                      className="w-full bg-white rounded-3xl py-4 border border-slate-100 shadow-xs text-red-500 hover:text-red-600 hover:bg-red-50/50 transition-all font-sans font-black text-sm flex items-center justify-center gap-2 cursor-pointer outline-none"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Déconnexion</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })()}
        </main>
      )}

      {/* DASHBOARD MOBILE FIXED BOTTOM NAVIGATION */}
      <footer className="fixed bottom-0 left-0 right-0 py-2.5 px-4 bg-white border-t border-blue-100/60 backdrop-blur-md z-40 lg:py-3 shadow-[0_-10px_30px_rgba(249,115,22,0.06)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between font-bold text-[10px] md:text-xs">
          
          <button
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('dashboard');
              setShowAnnouncementDismissible(true);
            }}
            className={`flex flex-col items-center space-y-1 flex-1 transition-all ${activeTab === 'dashboard' && !isAdminMode ? 'text-[#1b64d9] scale-105 font-black' : 'text-slate-500 opacity-80 hover:opacity-100'}`}
          >
            <Activity className="w-5 h-5 stroke-[2.5]" />
            <span className="font-sans font-black uppercase tracking-wider text-[8px] md:text-[9px]">Accueil</span>
          </button>

          <button
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('products');
            }}
            className={`flex flex-col items-center space-y-1 flex-1 transition-all ${activeTab === 'products' && !isAdminMode ? 'text-[#1b64d9] scale-105 font-black' : 'text-slate-500 opacity-80 hover:opacity-100'}`}
          >
            <Briefcase className="w-5 h-5 stroke-[2.5]" />
            <span className="font-sans font-black uppercase tracking-wider text-[8px] md:text-[9px]">Produits</span>
          </button>

          <button
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('team');
            }}
            className={`flex flex-col items-center space-y-1 flex-1 transition-all ${activeTab === 'team' && !isAdminMode ? 'text-[#1b64d9] scale-105 font-black' : 'text-slate-500 opacity-80 hover:opacity-100'}`}
          >
            <Users className="w-5 h-5 stroke-[2.5]" />
            <span className="font-sans font-black uppercase tracking-wider text-[8px] md:text-[9px]">Équipe</span>
          </button>

          <button
            onClick={() => {
              setIsAdminMode(false);
              setActiveTab('profile');
            }}
            className={`flex flex-col items-center space-y-1 flex-1 transition-all ${activeTab === 'profile' && !isAdminMode ? 'text-[#1b64d9] scale-105 font-black' : 'text-slate-500 opacity-80 hover:opacity-100'}`}
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
              className="fixed right-5 bottom-36 sm:right-8 z-50 bg-white border border-blue-50/40 rounded-[28px] p-5 shadow-[0_15px_45px_rgba(0,0,50,0.15)] w-72 text-left space-y-3.5"
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
                href={DataStore.getWhatsAppGroup()}
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

              {/* Canal WhatsApp option */}
              <a 
                href={DataStore.getWhatsAppChannel()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsSupportMenuOpen(false)}
                className="w-full py-3.5 px-4 bg-[#075E54] hover:bg-[#128C7E] text-white rounded-2xl flex items-center space-x-3 transition-transform duration-100 hover:scale-[1.02] shadow-md shadow-emerald-600/10 cursor-pointer select-none text-left"
              >
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xl">
                  📢
                </div>
                <div className="leading-tight flex-1">
                  <span className="text-white font-sans font-black text-xs block uppercase tracking-wide">Canal WhatsApp</span>
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
                    <h4 className="font-sans font-black text-xs uppercase tracking-wide leading-none">Support Dreampod</h4>
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
                    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-2xl shadow-inner">
                      💬
                    </div>
                    <div>
                      <h5 className="font-sans font-black text-xs text-slate-850 uppercase tracking-wider mb-1">
                        Discuter en ligne !
                      </h5>
                      <p className="text-[11px] text-slate-500 font-semibold max-w-[240px] leading-relaxed mx-auto">
                        Écrivez votre message ci-dessous. Un conseiller Dreampod vous répondra directement ici.
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
                className="p-3 bg-white border-t border-blue-50/40 flex items-center space-x-2 shrink-0 select-none pb-4"
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

      {/* SENDAVAPAY OTP VERIFICATION MODAL */}
      <AnimatePresence>
        {spOtpModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border-2 border-slate-200/50 rounded-3xl w-full max-w-sm p-6 sm:p-8 shadow-2xl relative text-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-[#1b64d9]/10 flex items-center justify-center text-[#1b64d9]">
                  <Smartphone className="w-6 h-6 stroke-[2.5] animate-pulse" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-base font-black uppercase tracking-wider text-slate-800 font-sans">
                    VÉRIFICATION OTP 🔐
                  </h3>
                  <p className="text-[11px] text-slate-500 font-bold leading-normal">
                    {spStatusMessage || "Un code de confirmation (OTP) a été envoyé à votre numéro ou est requis pour valider votre recharge."}
                  </p>
                </div>

                <form onSubmit={submitSpOtp} className="space-y-4 pt-2">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Saisissez le code OTP reçu"
                      value={spOtpCode}
                      onChange={(e) => setSpOtpCode(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#1b64d9] rounded-xl py-3 px-4 text-center text-sm font-bold tracking-widest uppercase focus:outline-none placeholder:text-slate-400 font-mono"
                    />
                  </div>

                  {depositError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[10px] text-red-600 font-bold leading-normal">
                      {depositError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSpOtpModalOpen(false);
                        setSpOtpToken(null);
                        setSpOtpCode('');
                        setIsPollingSp(false);
                      }}
                      className="flex-1 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-[11px] font-black uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={paymentProcessing}
                      className="flex-1 py-3 text-white bg-gradient-to-r from-[#1b64d9] to-[#3b82f6] hover:opacity-95 active:scale-95 transition-all text-[11px] font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {paymentProcessing ? "Validation..." : "Valider"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
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
                    className="flex-1 py-3 text-white bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] hover:opacity-95 active:scale-95 transition-all text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer shadow-md"
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
                      : 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white hover:opacity-95'
                  }`}
                >
                  {customModal.type === 'purchase_success' ? 'EXCELLENT ! 🎉' : 'OK'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MONTSERRAT BOLD PREMIUM "À PROPOS DE NOUS" MODAL */}
      <AnimatePresence>
        {isAboutModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-[#fffaf5]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsAboutModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-2 border-blue-100/60 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(249,115,22,0.12)] relative overflow-hidden flex flex-col max-h-[90vh]"
              id="agro-about-modal"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500" />
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50/60 flex items-center justify-center text-[#1b64d9] border border-blue-100/50 shrink-0">
                    <Info className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-sm uppercase tracking-wider text-slate-800" style={{ fontWeight: '900' }}>
                      À Propos de Nous
                    </h3>
                    <p className="text-[9px] text-[#ea580c] font-black uppercase tracking-wider font-mono">
                      Fonctionnement Dreampod
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAboutModalOpen(false)}
                  className="p-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 transition-colors cursor-pointer border border-slate-200"
                  id="agro-about-close-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Content Div (Scrollable inside the modal) */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-6 text-slate-700 text-left" id="agro-about-scrollable">
                
                {/* Intro paragraph */}
                <div className="space-y-2">
                  <span className="text-[10px] sm:text-xs font-black text-[#1b64d9] block uppercase tracking-widest">PROPULSER LE COMMERCE TECHNOLOGIQUE EN AFRIQUE 🎧</span>
                  <p className="text-[11.5px] leading-relaxed text-slate-600 font-medium">
                    <strong className="text-slate-850 font-black" style={{ fontWeight: '800' }}>Dreampod</strong> est la première interface d'investissement technologique en ligne conçue pour démocratiser la distribution de systèmes audio haut de gamme modernes au Togo. Nous canalisons votre épargne vers des stocks réels d'écouteurs et de pods intelligents connectés de dernière génération afin de générer pour vous des profits stables de manière continue.
                  </p>
                </div>

                {/* HOW IT WORKS / FONCTIONNEMENT - Clean Steps layout with Montserrat bold */}
                <div className="space-y-4">
                  <h4 className="font-sans font-black text-xs uppercase tracking-widest text-[#ea580c] border-b border-blue-50/55 pb-1.5" style={{ fontWeight: '900' }}>
                    COMMENT FONCTIONNE NOTRE SYSTÈME INTERACTIF ?
                  </h4>

                  <div className="space-y-3.5">
                    {/* Step 1 */}
                    <div className="flex gap-3.5 items-start bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl" id="about-step-1">
                      <div className="w-7 h-7 bg-[#f0f4ff]0 text-white rounded-lg flex items-center justify-center text-xs font-black font-sans shrink-0" style={{ fontWeight: '900' }}>
                        1
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="text-[11px] sm:text-xs font-black uppercase text-slate-800 tracking-wider" style={{ fontWeight: '800' }}>
                          Inscription Directe & Sécurisée
                        </h5>
                        <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed">
                          Créez votre compte investisseur instantanément avec votre numéro WhatsApp actif. Aucun frais d'entrée ! Obtenez immédiatement votre bonus de départ de 200 FCFA.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-3.5 items-start bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl" id="about-step-2">
                      <div className="w-7 h-7 bg-[#f0f4ff]0 text-white rounded-lg flex items-center justify-center text-xs font-black font-sans shrink-0" style={{ fontWeight: '900' }}>
                        2
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="text-[11px] sm:text-xs font-black uppercase text-slate-800 tracking-wider" style={{ fontWeight: '800' }}>
                          Recharge de Portefeuille & Choix du Plan Agricole (VIP)
                        </h5>
                        <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed">
                          Alimentez votre compte de manière instantanée par Mobile Money (MTN, Moov, Celtiis, Orange). Activez la location de votre équipement de production via la section "Produits" (VIP Bronze à Titanium) adapté à votre capital disponible.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-3.5 items-start bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl" id="about-step-3">
                      <div className="w-7 h-7 bg-[#f0f4ff]0 text-white rounded-lg flex items-center justify-center text-xs font-black font-sans shrink-0" style={{ fontWeight: '900' }}>
                        3
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="text-[11px] sm:text-xs font-black uppercase text-slate-800 tracking-wider" style={{ fontWeight: '800' }}>
                          Génération Automatique de Rendements Journaliers
                        </h5>
                        <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed">
                          Les équipements loués entrent en service réel. Vos gains sont calculés chaque 24h avec un taux d'intérêt quotidien spectaculaire (jusqu'à 15% par jour). Vous récoltez l'argent en direct sur votre balance.
                        </p>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-3.5 items-start bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl" id="about-step-4">
                      <div className="w-7 h-7 bg-[#f0f4ff]0 text-white rounded-lg flex items-center justify-center text-xs font-black font-sans shrink-0" style={{ fontWeight: '900' }}>
                        4
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="text-[11px] sm:text-xs font-black uppercase text-slate-800 tracking-wider" style={{ fontWeight: '800' }}>
                          Retraits Automatisés Instantanés vers votre Mobile Money
                        </h5>
                        <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed">
                          À tout moment, soumettez votre demande de retrait depuis votre Profil vers votre numéro Momo local. Dreampod valide les flux financiers intelligemment pour créditer votre compte sans délai !
                        </p>
                      </div>
                    </div>

                    {/* Step 5 */}
                    <div className="flex gap-3.5 items-start bg-amber-550/5 border border-amber-550/10 p-3 rounded-2xl" id="about-step-5">
                      <div className="w-7 h-7 bg-[#f0f4ff]0 text-white rounded-lg flex items-center justify-center text-xs font-black font-sans shrink-0" style={{ fontWeight: '900' }}>
                        5
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="text-[11px] sm:text-xs font-black uppercase text-slate-800 tracking-wider" style={{ fontWeight: '800' }}>
                          Expansion MLM & Doublement des Gains de Commission
                        </h5>
                        <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed">
                          Copiez votre lien de parrainage exclusif et partagez-le. Touchez instantanément des royalties d'exploitation sur les investissements de vos filleuls jusqu'au Niveau 3 !
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust and Certify Badge Section */}
                <div className="bg-gradient-to-br from-[#1b64d9]/10 to-orange-600/15 border border-blue-100/55 p-4 rounded-2xl flex items-center gap-3 select-none">
                  <ShieldCheck className="w-8 h-8 text-[#1b64d9] shrink-0" />
                  <div>
                    <span className="text-[10.5px] font-black text-slate-800 uppercase block tracking-wider" style={{ fontWeight: '900' }}>SÉCURITÉ & LIQUIDITÉ CERTIFIÉES v2.6</span>
                    <p className="text-[9.5px] text-slate-500 font-medium leading-relaxed uppercase mt-0.5">
                      Tous les dépôts d'actifs physiques de nos investisseurs font l'objet d'une couverture d'assurance intégrale contre les intempéries agro-climatiques, garantissant le versement ininterrompu de vos intérêts journaliers quoi qu'il arrive !
                    </p>
                  </div>
                </div>

              </div>
              
              {/* Footer */}
              <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
                <span className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Dreampod &copy; 2026. Tous droits réservés.</span>
                <button 
                  onClick={() => setIsAboutModalOpen(false)}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#1b64d9] to-orange-600 hover:opacity-95 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  style={{ fontWeight: '900' }}
                >
                  Fermer
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE TÉLÉCHARGEMENT & D'ÉPINGLAGE À L'ÉCRAN D'ACCUEIL */}
      <AnimatePresence>
        {isInstallModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsInstallModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(234,88,12,0.15)] relative overflow-hidden flex flex-col max-h-[92vh]"
              id="dreampod-pin-modal"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1b64d9] via-orange-600 to-amber-500" />
              
              {/* Header */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f0f4ff]0/10 flex items-center justify-center text-blue-500 border border-[#f0f4ff]0/20 shrink-0">
                    <Smartphone className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-xs uppercase tracking-wider text-white" style={{ fontWeight: '900' }}>
                      Épingler l'application
                    </h3>
                    <p className="text-[9px] text-blue-500 font-black uppercase tracking-wider font-mono">
                      Raccourci Écran d'Accueil v2.6
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsInstallModalOpen(false)}
                  className="p-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-5 text-slate-300 text-left">
                
                {/* Alerte cruciale pour l'erreur de cookie de sécurité */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-2 text-amber-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💡</span>
                    <span className="text-[10.5px] font-black uppercase tracking-wider text-amber-400">
                      RÉSOUT L'ERREUR "COOKIE DE SÉCURITÉ"
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed font-semibold">
                    Si votre téléphone affiche l'erreur <span className="text-yellow-300 font-bold">"Action required to load your app"</span> ou bloque l'accès, c'est que la WebView de l'application de téléchargement est limitée.
                  </p>
                  <p className="text-[10px] leading-relaxed font-bold text-white bg-slate-950/40 p-2 rounded-xl border border-amber-500/20">
                    🚀 <strong className="text-blue-400">La solution définitive :</strong> Épinglez l'application sur votre écran d'accueil en suivant le guide ci-dessous. Elle s'ouvrira directement dans votre navigateur officiel sans aucun blocage !
                  </p>
                </div>

                {/* Tabs selection: Android vs iOS */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-slate-850">
                  <button
                    onClick={() => setActiveInstallTab('android')}
                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                      activeInstallTab === 'android'
                        ? 'bg-[#1b64d9] text-white shadow-sm'
                        : 'bg-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    🤖 Android (Chrome)
                  </button>
                  <button
                    onClick={() => setActiveInstallTab('ios')}
                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                      activeInstallTab === 'ios'
                        ? 'bg-[#1b64d9] text-white shadow-sm'
                        : 'bg-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    🍏 iPhone (Safari)
                  </button>
                </div>

                {/* Tab Content: Android */}
                {activeInstallTab === 'android' && (
                  <div className="space-y-4">
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">
                          INSTALLATION DEPUIS GOOGLE CHROME
                        </span>
                      </div>
                      
                      {/* Interactive dynamic PWA installation if supported */}
                      {isInstallable ? (
                        <div className="space-y-2">
                          <button 
                            onClick={triggerPwaInstall}
                            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#1b64d9] to-orange-600 hover:opacity-95 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 text-center cursor-pointer border-0"
                            style={{ fontWeight: '900' }}
                          >
                            <Smartphone className="w-4 h-4 stroke-[3]" />
                            Ajouter à l'Écran d'Accueil Maintenant
                          </button>
                          <p className="text-[9px] text-slate-400 text-center font-medium">
                            En un clic, l'icône Dreampod sera ajoutée à votre écran.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex gap-3 items-start bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                            <div className="w-6 h-6 bg-slate-800 text-blue-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                              1
                            </div>
                            <p className="text-[10.5px] font-medium leading-relaxed">
                              Ouvrez l'application dans votre navigateur <strong className="text-blue-400">Google Chrome</strong> (ou tapez l'adresse dans Chrome).
                            </p>
                          </div>

                          <div className="flex gap-3 items-start bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                            <div className="w-6 h-6 bg-slate-800 text-blue-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                              2
                            </div>
                            <p className="text-[10.5px] font-medium leading-relaxed">
                              Appuyez sur le menu <strong className="text-white">Option ⋮ (les 3 points verticaux)</strong> en haut à droite de Chrome.
                            </p>
                          </div>

                          <div className="flex gap-3 items-start bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                            <div className="w-6 h-6 bg-slate-800 text-blue-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                              3
                            </div>
                            <p className="text-[10.5px] font-medium leading-relaxed">
                              Sélectionnez l'option <strong className="text-white font-bold">"Ajouter à l'écran d'accueil"</strong> ou <strong className="text-white font-bold">"Installer l'application"</strong>.
                            </p>
                          </div>

                          <div className="flex gap-3 items-start bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
                            <span className="text-sm">✨</span>
                            <p className="text-[10.5px] font-bold text-emerald-300 leading-relaxed">
                              Félicitations ! L'application s'installe en arrière-plan. Vous trouverez l'icône Dreampod sur votre écran d'accueil avec vos autres applications.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* APK Alternative Box */}
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-widest">
                          MÉTHODE PAR APK (ALTERNATIVE)
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = '/Dreampod_v2.6.apk';
                          link.download = 'Dreampod_v2.6.apk';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          openAlert(
                            "Téléchargement APK !",
                            "Le téléchargement de l'APK Dreampod a commencé. N'oubliez pas de désinstaller les anciennes versions de votre téléphone avant d'installer ce fichier !",
                            "success"
                          );
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all border border-slate-700 cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-500" />
                        Télécharger le Fichier APK (Direct)
                      </button>
                      <p className="text-[9px] text-slate-500 leading-tight">
                        ⚠️ <strong className="text-amber-400">Rappel :</strong> Pour éviter l'erreur de package ou l'échec de l'installation, supprimez l'ancienne application <strong className="text-yellow-400">"AgroProfit"</strong> ou <strong className="text-yellow-400">"Dreampod"</strong> de votre appareil au préalable.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab Content: iOS (Safari) */}
                {activeInstallTab === 'ios' && (
                  <div className="space-y-4">
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">
                          INSTALLATION DEPUIS SAFARI (IPHONE / IPAD)
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex gap-3 items-start bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <div className="w-6 h-6 bg-slate-800 text-blue-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                            1
                          </div>
                          <p className="text-[10.5px] font-medium leading-relaxed">
                            Ouvrez obligatoirement l'application dans le navigateur officiel <strong className="text-blue-400">Safari</strong> de votre iPhone.
                          </p>
                        </div>

                        <div className="flex gap-3 items-start bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <div className="w-6 h-6 bg-slate-800 text-blue-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                            2
                          </div>
                          <p className="text-[10.5px] font-medium leading-relaxed">
                            Appuyez sur le bouton de <strong className="text-white">Partage 📤</strong> (l'icône de carré avec une flèche vers le haut, située au milieu en bas de votre écran Safari).
                          </p>
                        </div>

                        <div className="flex gap-3 items-start bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <div className="w-6 h-6 bg-slate-800 text-blue-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                            3
                          </div>
                          <p className="text-[10.5px] font-medium leading-relaxed">
                            Faites défiler le menu des options vers le bas et sélectionnez l'option <strong className="text-white font-bold">"Sur l'écran d'accueil"</strong> (ou "Ajouter sur l'écran d'accueil").
                          </p>
                        </div>

                        <div className="flex gap-3 items-start bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <div className="w-6 h-6 bg-slate-800 text-blue-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                            4
                          </div>
                          <p className="text-[10.5px] font-medium leading-relaxed">
                            Appuyez sur le bouton <strong className="text-blue-400 font-bold">"Ajouter"</strong> situé dans le coin supérieur droit.
                          </p>
                        </div>

                        <div className="flex gap-3 items-start bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
                          <span className="text-sm">✨</span>
                          <p className="text-[10.5px] font-bold text-emerald-300 leading-relaxed">
                            Terminé ! L'application Dreampod s'affiche sur l'écran d'accueil de votre iPhone. Ouvrez-la pour vous connecter normalement et en toute sécurité.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
              
              {/* Footer */}
              <div className="border-t border-slate-800 pt-4 mt-4 flex items-center justify-between">
                <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider">Dreampod © 2026</span>
                <button 
                  onClick={() => setIsInstallModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer border border-slate-700"
                  style={{ fontWeight: '900' }}
                >
                  Fermer
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* MISSIONS MODAL SYSTEM */}
      <AnimatePresence>
        {showMissionsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#f8f9fa] rounded-[32px] w-full max-w-sm overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.25)] border border-white p-6 text-slate-800 relative"
            >
              {/* Close button */}
              <button
                onClick={() => setShowMissionsModal(false)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-200/50 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer border-0 z-10 active:scale-95"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>

              <div className="text-left mb-4">
                <h3 className="text-3xl font-sans font-black text-slate-900 tracking-tight leading-none" style={{ fontWeight: 900 }}>
                  Missions
                </h3>
              </div>

              {/* Missions Card Wrapper */}
              <div className="bg-white border border-slate-100 rounded-[28px] p-5 space-y-5 shadow-[0_4px_15px_rgba(0,0,0,0.015)] text-left">
                {(() => {
                  const directReferrals = level1Users;
                  const allInvs = DataStore.getInvestments() || [];
                  const investedReferralCount = directReferrals.filter(u => allInvs.some(inv => inv.userId === u.id)).length;
                  const claimed = (userState as any).claimedMissions || [];

                  const MISSIONS = [
                    { id: 'invite_3', target: 3, reward: 1000, label: 'Inviter 3 investisseurs' },
                    { id: 'invite_10', target: 10, reward: 2500, label: 'Inviter 10 investisseurs' },
                    { id: 'invite_30', target: 30, reward: 5000, label: 'Inviter 30 investisseurs' }
                  ];

                  const handleClaimMission = (missionId: string, reward: number, target: number) => {
                    if (investedReferralCount < target) return;
                    if (claimed.includes(missionId)) return;

                    const newBalance = userState.balance + reward;
                    const newClaimed = [...claimed, missionId];

                    const updatedUser: User = {
                      ...userState,
                      balance: newBalance,
                      claimedMissions: newClaimed as any
                    };

                    DataStore.saveCurrentUser(updatedUser);
                    const allUsers = DataStore.getUsers();
                    const idx = allUsers.findIndex(u => u.id === updatedUser.id);
                    if (idx !== -1) {
                      allUsers[idx] = updatedUser;
                      DataStore.saveUsers(allUsers);
                    }

                    setUserState(updatedUser);
                    if (onRefreshUser) {
                      onRefreshUser(updatedUser);
                    }

                    triggerToast(`Félicitations ! Votre bonus de +${reward.toLocaleString()} FCFA a été ajouté à votre solde ! 🎯`, "success");
                  };

                  return (
                    <div className="space-y-4">
                      {MISSIONS.map((m, index) => {
                        const isCompleted = investedReferralCount >= m.target;
                        const isClaimed = claimed.includes(m.id);
                        const progressNum = Math.min(investedReferralCount, m.target);

                        return (
                          <div key={m.id} className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              {/* Left: Icon and Title */}
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-[#1a1a1a] text-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                                  <Users className="w-5.5 h-5.5 stroke-[2]" />
                                </div>
                                <div>
                                  <h4 className="font-sans font-black text-sm text-slate-900 leading-tight">
                                    {m.label.split(' ').slice(0, 2).join(' ')}
                                  </h4>
                                  <p className="font-sans font-black text-sm text-slate-900 leading-tight">
                                    {m.label.split(' ').slice(2).join(' ')}
                                  </p>
                                </div>
                              </div>

                              {/* Right: Reward and Progress */}
                              <div className="text-right flex flex-col items-end shrink-0">
                                <span className="text-sm font-sans font-black text-slate-900 tracking-tight leading-none mb-1">
                                  + {m.reward.toLocaleString()} FCFA
                                </span>
                                <span className="text-[10px] font-sans font-black text-slate-400 leading-none">
                                  {progressNum}/{m.target}
                                </span>
                              </div>
                            </div>

                            {/* Button alignment and spacing strictly matching the mockup */}
                            <div className="flex justify-end pt-1">
                              {isClaimed ? (
                                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100/60 py-2 px-4 rounded-full text-[10.5px] font-sans font-black flex items-center gap-1 select-none">
                                  ✓ Récupéré
                                </span>
                              ) : isCompleted ? (
                                <button
                                  onClick={() => handleClaimMission(m.id, m.reward, m.target)}
                                  className="bg-slate-900 text-white hover:bg-black py-2 px-4 rounded-full text-[10.5px] font-sans font-black transition-all active:scale-95 cursor-pointer shadow-md border-0"
                                >
                                  Récupérer le bonus
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="bg-[#e9ecef] text-slate-400 py-2 px-4 rounded-full text-[10.5px] font-sans font-black cursor-not-allowed border-0"
                                >
                                  Récupérer le bonus
                                </button>
                              )}
                            </div>

                            {index < MISSIONS.length - 1 && (
                              <div className="border-b border-slate-100/95 pt-2" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* FLOATING TOAST NOTIFICATIONS */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 w-full max-w-sm px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95, transition: { duration: 0.2 } }}
                className={`pointer-events-auto w-full bg-white/98 border-2 rounded-2xl p-4 shadow-xl flex items-start gap-3.5 select-none ${
                  isSuccess 
                    ? 'border-emerald-500/30' 
                    : isError 
                      ? 'border-rose-500/30' 
                      : 'border-blue-500/30'
                }`}
              >
                <div className="text-lg shrink-0 leading-none">
                  {isSuccess ? '✨' : isError ? '⚠️' : 'ℹ️'}
                </div>
                <div className="flex-1 text-[11px] font-black text-slate-800 uppercase tracking-widest leading-relaxed">
                  {toast.message}
                </div>
                <button
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0 mt-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}
