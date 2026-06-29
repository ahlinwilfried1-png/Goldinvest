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
import { DataStore, syncWithBackend, getApiUrl } from '../dataStore';
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
  switch (vipLevel) {
    case 1:
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400';
    case 2:
      return 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=400';
    case 3:
      return 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=400';
    case 4:
      return 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=400';
    case 5:
      return 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&q=80&w=400';
    case 6:
      return 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=400';
    case 7:
      return 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&q=80&w=400';
    default:
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400';
  }
};

const getVipCropDetails = (level: number, category?: string) => {
  if (category === 'activity') {
    switch (level) {
      case 1:
        return {
          name: "Aiprods Activité 1 ⚡",
          desc: "Package spécial court terme basé sur la revente rapide d'écouteurs de sport."
        };
      case 2:
        return {
          name: "Aiprods Activité 2 ⚡",
          desc: "Package pro à rotation rapide avec des bénéfices accumulés quotidiennement."
        };
      case 3:
        return {
          name: "Aiprods Activité 3 ⚡",
          desc: "Édition premium à haut rendement sur un cycle court et sécurisé."
        };
      default:
        return {
          name: "Aiprods Activité Spéciale ⚡",
          desc: "Édition spéciale pour booster vos revenus journaliers rapidement."
        };
    }
  }

  switch (level) {
    case 1:
      return {
        name: "Aiprods 1 🎧",
        desc: "Notre modèle d'entrée de gamme offrant un rendement journalier passif et stable."
      };
    case 2:
      return {
        name: "Aiprods 2 🎧",
        desc: "Système audio de deuxième génération pour des revenus journaliers accrus."
      };
    case 3:
      return {
        name: "Aiprods 3 🎧",
        desc: "Équipement haut de gamme avec une rentabilité journalière optimisée."
      };
    case 4:
      return {
        name: "Aiprods 4 🎧",
        desc: "Technologie avancée assurant des revenus très solides tout au long de l'année."
      };
    case 5:
      return {
        name: "Aiprods Pro 🎧",
        desc: "Le fleuron professionnel idéal pour maximiser vos gains de manière constante."
      };
    case 6:
      return {
        name: "Aiprods Pro 2 🎧",
        desc: "Réduction de bruit active et profits décuplés au quotidien pour les membres Elite."
      };
    case 7:
      return {
        name: "Aiprods Max 🎧",
        desc: "Le summum du luxe audio et de la performance financière sur la plateforme."
      };
    case 8:
      return {
        name: "Aiprods Ultra 🎧",
        desc: "L'équipement audio ultra-premium réservé aux investisseurs d'élite."
      };
    case 9:
      return {
        name: "Aiprods Élite 🎧",
        desc: "Système audio suprême de prestige pour des gains journaliers spectaculaires."
      };
    default:
      return {
        name: "Aiprods Élite 🎧",
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
  const level = Number(vipLevel) || 1;
  const [errorCount, setErrorCount] = useState(0);

  const getVipImageAlternate = (lvl: number, attempt: number) => {
    // Attempt 0: Level-specific premium AirPods images
    if (attempt === 0) {
      if (category === 'activity') {
        switch (lvl) {
          case 1: return 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&q=80&w=400';
          case 2: return 'https://images.unsplash.com/photo-1627989580309-bfaf3e58af6f?auto=format&fit=crop&q=80&w=400';
          case 3: return 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=400';
          default: return 'https://images.unsplash.com/photo-1588449668365-d15e397f6787?auto=format&fit=crop&q=80&w=400';
        }
      } else {
        switch (lvl) {
          case 1: return 'https://images.unsplash.com/photo-1588449668365-d15e397f6787?auto=format&fit=crop&q=80&w=400';
          case 2: return 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=400';
          case 3: return 'https://images.unsplash.com/photo-1592921894725-786faf336c17?auto=format&fit=crop&q=80&w=400';
          case 4: return 'https://images.unsplash.com/photo-1627989580309-bfaf3e58af6f?auto=format&fit=crop&q=80&w=400';
          case 5: return 'https://images.unsplash.com/photo-1610438235354-a6fa5523c584?auto=format&fit=crop&q=80&w=400';
          case 6: return 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=400';
          case 7: return 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&q=80&w=400';
          case 8: return 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=400';
          case 9: return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400';
          default: return 'https://images.unsplash.com/photo-1588449668365-d15e397f6787?auto=format&fit=crop&q=80&w=400';
        }
      }
    }

    // Attempt 1: Safe fallback 1 (Highly reliable Airpods Pro image)
    if (attempt === 1) {
      return 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&q=80&w=400';
    }

    // Attempt 2: Safe fallback 2 (Airpods case image)
    if (attempt === 2) {
      return 'https://images.unsplash.com/photo-1592921894725-786faf336c17?auto=format&fit=crop&q=80&w=400';
    }

    // Attempt 3+: Ultimate reliable headphones/AirPods image
    return 'https://images.unsplash.com/photo-1588449668365-d15e397f6787?auto=format&fit=crop&q=80&w=400';
  };

  const currentSrc = getVipImageAlternate(level, errorCount);

  return (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center overflow-hidden relative">
      <img
        src={currentSrc}
        alt={alt}
        className={className}
        onError={() => {
          // Increment error count so we try fallback images instead of displaying blank or emoji
          setErrorCount(prev => Math.min(prev + 1, 4));
        }}
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
  const [productSubTab, setProductSubTab] = useState<'stability' | 'activity'>('stability');

  // Local lists
  const [userState, setUserState] = useState<User>(currentUser);
  const [products, setProducts] = useState<Product[]>(() => DataStore.getProducts());
  const [activeInvestments, setActiveInvestments] = useState<Investment[]>([]);

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

  // Form states
  const SENDAVAPAY_COUNTRIES = [
    { code: 'TG', name: 'Togo 🇹🇬', currency: 'XOF' },
    { code: 'CI', name: "Côte d'Ivoire 🇨🇮", currency: 'XOF' },
    { code: 'BJ', name: 'Bénin 🇧🇯', currency: 'XOF' },
    { code: 'SN', name: 'Sénégal 🇸🇳', currency: 'XOF' },
    { code: 'ML', name: 'Mali 🇲🇱', currency: 'XOF' },
    { code: 'BF', name: 'Burkina Faso 🇧🇫', currency: 'XOF' },
    { code: 'CM', name: 'Cameroun 🇨🇲', currency: 'XAF' },
    { code: 'GN', name: 'Guinée 🇬🇳', currency: 'GNF' },
    { code: 'COD', name: 'RD Congo 🇨🇩', currency: 'CDF' },
    { code: 'COG', name: 'Congo Brazzaville 🇨🇬', currency: 'XAF' },
  ];

  const SENDAVAPAY_OPERATORS: Record<string, { id: string; name: string; slug: string; requiresOtp?: boolean }[]> = {
    TG: [
      { id: '37', name: 'TMoney', slug: 't-money-togo' },
      { id: '38', name: 'Moov Money', slug: 'moov-togo' }
    ],
    CI: [
      { id: '29', name: 'Orange Money', slug: 'orange-money-ci', requiresOtp: true },
      { id: '30', name: 'MTN Money', slug: 'mtn-ci' },
      { id: '31', name: 'Moov Money', slug: 'moov-ci' },
      { id: '32', name: 'Wave', slug: 'wave-ci' }
    ],
    BJ: [
      { id: '35', name: 'MTN Money', slug: 'mtn-benin' },
      { id: '36', name: 'Moov Money', slug: 'moov-benin' }
    ],
    SN: [
      { id: '57', name: 'Orange Money', slug: 'new-orange-money-senegal' },
      { id: '58', name: 'Wave', slug: 'wave-senegal' },
      { id: '59', name: 'Mixx', slug: 'mixx-sn' }
    ],
    ML: [
      { id: '60', name: 'Orange Money', slug: 'orange-money-mali' }
    ],
    BF: [
      { id: '34', name: 'Orange Money', slug: 'orange-money-burkina', requiresOtp: true },
      { id: '33', name: 'Moov Money', slug: 'moov-burkina-faso' }
    ],
    CM: [],
    GN: [],
    COD: [
      { id: '52', name: 'Vodacom M-Pesa', slug: 'vodacom-cod' },
      { id: '53', name: 'Airtel Money', slug: 'airtel-cod' },
      { id: '54', name: 'Orange Money', slug: 'orange-cod' }
    ],
    COG: [
      { id: '55', name: 'Airtel Money', slug: 'airtel-cog' },
      { id: '56', name: 'MTN Money', slug: 'mtn-cog' }
    ]
  };

  const getInitialSpCountry = () => {
    const userCountryStr = String(userState.country || "").toLowerCase();
    if (userCountryStr.includes('togo')) return 'TG';
    if (userCountryStr.includes('benin') || userCountryStr.includes('bénin')) return 'BJ';
    if (userCountryStr.includes('senegal') || userCountryStr.includes('sénégal')) return 'SN';
    if (userCountryStr.includes('mali')) return 'ML';
    if (userCountryStr.includes('burkina')) return 'BF';
    if (userCountryStr.includes('cameroun')) return 'CM';
    if (userCountryStr.includes('guinée') || userCountryStr.includes('guinee')) return 'GN';
    if (userCountryStr.includes('congo d') || userCountryStr.includes('rdc') || userCountryStr.includes('rd congo')) return 'COD';
    if (userCountryStr.includes('congo b') || userCountryStr.includes('brazzaville')) return 'COG';
    return 'CI'; // default to Cote d'Ivoire
  };

  const [depositAmount, setDepositAmount] = useState<string>('5000');
  const [depositOperator, setDepositOperator] = useState<string>('Orange Money');
  const [depositMethod, setDepositMethod] = useState<'sendavapay'>('sendavapay');
  const [depositRef, setDepositRef] = useState<string>('');
  const [receiptBase64, setReceiptBase64] = useState<string>('');
  const [depositError, setDepositError] = useState<string>('');
  const [depositSuccess, setDepositSuccess] = useState<string>('');
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [depositRedirectUrl, setDepositRedirectUrl] = useState<string>('');
  const [depositCountry, setDepositCountry] = useState<string>(userState.country || "Côte d'Ivoire 🇨🇮");
  const [depositPhone, setDepositPhone] = useState<string>(userState.whatsapp || '');

  // SendavaPay specific states
  const [spCountryCode, setSpCountryCode] = useState<string>(getInitialSpCountry());
  const [spOperatorId, setSpOperatorId] = useState<string>('');
  const [spOtpToken, setSpOtpToken] = useState<string | null>(null);
  const [spOtpCode, setSpOtpCode] = useState<string>('');
  const [spOtpModalOpen, setSpOtpModalOpen] = useState<boolean>(false);
  const [spStatusMessage, setSpStatusMessage] = useState<string | null>(null);
  const [spReference, setSpReference] = useState<string | null>(null);
  const [isPollingSp, setIsPollingSp] = useState<boolean>(false);

  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawOperator, setWithdrawOperator] = useState<string>("Wave (CI)");
  const [withdrawNumber, setWithdrawNumber] = useState<string>('');
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

  useEffect(() => {
    if (depositMethod === 'sendavapay' && spCountryCode) {
      const operators = SENDAVAPAY_OPERATORS[spCountryCode] || [];
      if (operators.length > 0) {
        setSpOperatorId(operators[0].id);
      }
    }
  }, [spCountryCode, depositMethod]);

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
    link.href = '/Aiprods_v2.6.apk';
    link.download = 'Aiprods_v2.6.apk';
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
      "Le téléchargement de l'application 'Aiprods_v2.6.apk' a commencé ! Ouvrez le fichier téléchargé pour l'installer.\n\n⚠️ IMPORTANT : Si l'installation refuse ou dit 'Application non installée', désinstallez d'abord TOUTE ancienne version (comme l'application AgroProfit ou une version précédente d'Aiprods) de votre téléphone, puis réessayez. Cela résout 100% des erreurs d'installation !",
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
            body: "Notifications de bureau Chrome activées sur Aiprods ! 🔔"
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
      try {
        await syncWithBackend();
      } catch (err) {
        console.warn('Periodic background sync failed:', err);
      }

      const oldBal = userStateRef.current.balance;
      const oldUsersLen = allUsersRef.current.length;
      const oldProductsStr = JSON.stringify(productsRef.current);
      DataStore.processAutomaticDailyInstallments();
      
      const fresh = DataStore.getCurrentUser();
      const freshUsers = DataStore.getUsers();
      const freshProducts = DataStore.getProducts();
      const freshProductsStr = JSON.stringify(freshProducts);
      
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
        freshProductsStr !== oldProductsStr
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
        const response = await fetch(getApiUrl('/api/sendavapay/verify-deposit'), {
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

    if (!depositPhone || depositPhone.trim() === '') {
      setDepositError("Veuillez saisir votre numéro Mobile Money pour effectuer le dépôt.");
      return;
    }

    setIsSubmittingDeposit(true);
    try {
      if (!spOperatorId) {
        setDepositError("Veuillez sélectionner un opérateur Mobile Money.");
        setIsSubmittingDeposit(false);
        return;
      }

      const response = await fetch(getApiUrl('/api/sendavapay/create-charge'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userState.id,
          amount: amt,
          country: spCountryCode,
          phone: depositPhone,
          operatorId: spOperatorId
        })
      });

      if (response.ok) {
        const res = await response.json();
        if (res.success) {
          setSpReference(res.reference);
          setDepositAmount('5000');
          syncDashboardData();

          if (res.requiresOtp) {
            setSpOtpToken(res.otpToken);
            setSpOtpModalOpen(true);
            setSpStatusMessage(res.message);
            setDepositSuccess(`Validation OTP Requise : ${res.message}. Veuillez saisir le code reçu par SMS ci-dessous.`);
          } else if (res.requiresRedirect && res.redirectUrl) {
            setDepositRedirectUrl(res.redirectUrl);
            setDepositSuccess(`Votre demande de recharge via SendavaPay de ${amt.toLocaleString()} F a été créée. Veuillez cliquer sur le bouton ci-dessous pour finaliser votre paiement.`);
            window.open(res.redirectUrl, '_blank', 'noopener,noreferrer');
            pollSendavaPayStatus(res.reference);
          } else {
            setDepositSuccess(res.message || "Votre demande de paiement Mobile Money Push a été envoyée sur votre téléphone. Veuillez saisir votre code secret Mobile Money pour finaliser la recharge.");
            pollSendavaPayStatus(res.reference);
          }
        } else {
          setDepositError(res.error || "L'initialisation du paiement a échoué.");
        }
      } else {
        const errText = await response.text().catch(() => "Erreur de lecture du serveur");
        let parsedMessage = errText;
        try {
          const errObj = JSON.parse(errText);
          if (errObj && errObj.error) parsedMessage = errObj.error;
          else if (errObj && errObj.message) parsedMessage = errObj.message;
        } catch (e) {}
        setDepositError(`Erreur API : ${parsedMessage}`);
      }
    } catch (error: any) {
      console.error("Deposit submission error:", error);
      setDepositError(`Erreur de connexion : ${error?.message || error || "Veuillez réessayer."}`);
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  const submitSpOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spOtpToken || !spOtpCode.trim()) return;
    setIsSubmittingDeposit(true);
    setDepositError('');
    try {
      const response = await fetch(getApiUrl('/api/sendavapay/submit-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          otpToken: spOtpToken,
          otp: spOtpCode
        })
      });
      const data = await response.json();
      if (data.success) {
        setDepositSuccess("Code OTP validé avec succès ! Votre transaction est en cours de traitement. Votre solde sera crédité automatiquement dès confirmation.");
        setSpOtpModalOpen(false);
        setSpOtpToken(null);
        setSpOtpCode('');
        setDepositAmount('5000');
        syncDashboardData();
        if (spReference) {
          pollSendavaPayStatus(spReference);
        }
      } else {
        setDepositError(data.error || "La validation du code OTP a échoué. Veuillez vérifier le code saisi.");
      }
    } catch (err: any) {
      console.error("OTP validation error:", err);
      setDepositError("Une erreur est survenue lors de la validation de l'OTP.");
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

    const isStability = product.category !== 'activity';
    if (!isStability && !hasStabilityActivation) {
      openAlert(
        'Accès Restreint',
        "Vous devez obligatoirement achetez et activer au moins un produit de la catégorie Stabilité avant d'avoir accès aux produits d'Activités.",
        'error'
      );
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
                      Côte d'Ivoire 🇨🇮 / Burkina Faso 🇧🇫 / Togo 🇹🇬 / Bénin 🇧🇯 / Cameroun 🇨🇲
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
                    Rejoignez la discussion officielle Aiprods.
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
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-orange-500 rounded-xl shrink-0">
              <Bell className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[10px] font-sans font-black uppercase text-orange-400 tracking-wider">Alerte Aiprods 🔔</span>
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
          
          {/* USER SUMMARY CARDS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">

              {/* AirPods Pro 2026 Premium Welcome & Visual Showcase with Background AirPods Image */}
              <div className="w-full h-44 sm:h-48 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.03)] relative z-10 border border-slate-200/40 flex items-end">
                {/* Background AirPods Image */}
                <img 
                  src="https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=1200&q=85" 
                  alt="AirPods Pro Background" 
                  className="absolute inset-0 w-full h-full object-cover select-none"
                  referrerPolicy="no-referrer"
                />
                
                {/* Dark gradient overlay to guarantee perfect text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />

                {/* Welcome text block layered on top of the image */}
                <div className="p-5 sm:p-6 relative z-20 text-left w-full">
                  <h3 className="text-xl sm:text-3xl font-sans font-black text-white tracking-tight leading-tight">
                    Bienvenue, <span className="text-[#ff7c00]">{userState.name || "Cher Investisseur"}</span>
                  </h3>
                </div>
              </div>


              {/* PRIMARY WHITE CARD OF SCREENSHOT */}
              <div id="agro-primary-balance-card" className="bg-white border border-orange-100/55 rounded-[30px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] text-slate-800 text-left">
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
                    className="py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-[#1b64d9] hover:opacity-95 text-white transition-all text-center flex items-center justify-center space-x-1 shadow-md cursor-pointer active:scale-95"
                  >
                    <PlusCircle className="w-4.5 h-4.5 stroke-[3] mr-1" />
                    <span>Recharge</span>
                  </button>
                  <button
                    id="withdrawal-action-btn"
                    onClick={() => setActiveTab('withdraw')}
                    className="py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-[#ff7c00] hover:opacity-95 text-white transition-all text-center flex items-center justify-center space-x-1 shadow-md cursor-pointer active:scale-95"
                  >
                    <ArrowUpCircle className="w-4.5 h-4.5 stroke-[3] mr-1" />
                    <span>Retrait</span>
                  </button>
                </div>
              </div>

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
                  className="bg-white border border-orange-100/45 rounded-3xl p-5 flex flex-col items-center justify-center space-y-2.5 cursor-pointer hover:bg-slate-50/50 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.015)]"
                >
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 flex items-center justify-center rounded-full">
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
                  className="bg-white border border-orange-100/45 rounded-3xl p-5 flex flex-col items-center justify-center space-y-2.5 cursor-pointer hover:bg-slate-50/50 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.015)]"
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
                      : 'bg-white border-orange-100/45 hover:bg-slate-50/50 text-slate-800'
                  }`}
                >
                  <div className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors ${
                    hasCheckedInToday 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-[#fffaf0] text-orange-500'
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

              {/* BANNER FLUX EN DIRECT (Va-et-vient de gauche à droite) */}
              <div className="w-full bg-white border border-slate-200/60 rounded-2xl p-3 shadow-xs mt-3 overflow-hidden relative" id="live-ticker-container">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Flux d'activité en direct
                    </span>
                  </div>
                  <span className="text-[8px] font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase tracking-wider">
                    En direct 🔴
                  </span>
                </div>

                <div className="relative w-full overflow-hidden py-1">
                  {/* Edge fades */}
                  <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                  <div className="animate-marquee-ltr flex items-center gap-4 whitespace-nowrap">
                    {dynamicLiveTransactions.map((tx, idx) => (
                      <div 
                        key={`tx-${idx}`} 
                        className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5 shrink-0"
                      >
                        <span className="text-xs select-none">{tx.flag}</span>
                        <span className="text-[11px] font-bold text-slate-800">{tx.name}</span>
                        
                        {tx.type === "recharge" ? (
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20">
                            a rechargé ⚡
                          </span>
                        ) : (
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
                            a retiré 💸
                          </span>
                        )}
                        
                        <span className="text-[11.5px] font-extrabold text-slate-900">{tx.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* USINES ET CONSTRUCTEURS AIRPRODS EN MOUVEMENT */}
              <div className="w-full mb-2 mt-6 select-none text-left border-t border-slate-100/60 pt-6">
                <div className="px-1 mb-4">
                  <span className="text-[10px] text-red-600 font-black uppercase tracking-widest block mb-0.5">PARTENAIRES INDUSTRIELS 🎧</span>
                  <h4 className="text-xs sm:text-sm font-sans font-black text-slate-800 uppercase tracking-wide">
                    Usines de Fabrication
                  </h4>
                  <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed mt-1">
                    Les leaders mondiaux de la technologie audio qui conçoivent et assemblent nos équipements Airprods.
                  </p>
                </div>

                {/* Marquee Wrapper with fading edges */}
                <div className="relative w-full overflow-hidden bg-slate-50 py-4 rounded-2xl border border-slate-100/80">
                  {/* Gradients to fade edges */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

                  <div className="animate-marquee-ltr flex items-center gap-6 whitespace-nowrap">
                    {/* First Set of Logos */}
                    {[
                      { name: "Apple Audio", slug: "apple", color: "1e293b", bg: "bg-slate-100", detail: "California" },
                      { name: "Sony Corp", slug: "sony", color: "000000", bg: "bg-slate-100/80", detail: "Tokyo" },
                      { name: "Bose Prof", slug: "bose", color: "000000", bg: "bg-zinc-100", detail: "Boston" },
                      { name: "Sennheiser", slug: "sennheiser", color: "000000", bg: "bg-zinc-50", detail: "Germany" },
                      { name: "JBL Audio", slug: "jbl", color: "FF6600", bg: "bg-orange-50", detail: "Los Angeles" },
                      { name: "Beats Elec", slug: "beatsbydre", color: "E30000", bg: "bg-red-50", detail: "Culver City" },
                      { name: "Samsung", slug: "samsung", color: "1428A0", bg: "bg-blue-50", detail: "Seoul" },
                      { name: "Xiaomi", slug: "xiaomi", color: "FF6700", bg: "bg-amber-50", detail: "Beijing" }
                    ].map((brand, idx) => (
                      <div key={`brand-1-${idx}`} className="inline-flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm shrink-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${brand.bg} p-1.5`}>
                          <img 
                            src={`https://cdn.simpleicons.org/${brand.slug}/${brand.color}`} 
                            alt={brand.name} 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[10px] font-black uppercase text-slate-800 leading-none">{brand.name}</span>
                          <span className="text-[7.5px] font-extrabold uppercase text-slate-400 tracking-wider mt-0.5">{brand.detail}</span>
                        </div>
                      </div>
                    ))}

                    {/* Duplicate Set for Seamless Loop */}
                    {[
                      { name: "Apple Audio", slug: "apple", color: "1e293b", bg: "bg-slate-100", detail: "California" },
                      { name: "Sony Corp", slug: "sony", color: "000000", bg: "bg-slate-100/80", detail: "Tokyo" },
                      { name: "Bose Prof", slug: "bose", color: "000000", bg: "bg-zinc-100", detail: "Boston" },
                      { name: "Sennheiser", slug: "sennheiser", color: "000000", bg: "bg-zinc-50", detail: "Germany" },
                      { name: "JBL Audio", slug: "jbl", color: "FF6600", bg: "bg-orange-50", detail: "Los Angeles" },
                      { name: "Beats Elec", slug: "beatsbydre", color: "E30000", bg: "bg-red-50", detail: "Culver City" },
                      { name: "Samsung", slug: "samsung", color: "1428A0", bg: "bg-blue-50", detail: "Seoul" },
                      { name: "Xiaomi", slug: "xiaomi", color: "FF6700", bg: "bg-amber-50", detail: "Beijing" }
                    ].map((brand, idx) => (
                      <div key={`brand-2-${idx}`} className="inline-flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm shrink-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${brand.bg} p-1.5`}>
                          <img 
                            src={`https://cdn.simpleicons.org/${brand.slug}/${brand.color}`} 
                            alt={brand.name} 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[10px] font-black uppercase text-slate-800 leading-none">{brand.name}</span>
                          <span className="text-[7.5px] font-extrabold uppercase text-slate-400 tracking-wider mt-0.5">{brand.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
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

              {/* DYNAMIC PRODUCTS CONTAINER LIST */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto pt-6">
                {products
                  .filter((p) => {
                    const isCyclic = p.isCyclic === true;
                    if (isCyclic) return false; // Supprimer complètement les produits de bien-être (cycliques)
                    return p.category !== 'activity';
                  })
                  .map((p, index) => {
                    const isBlocked = p.isBlocked === true;
                    const formattedReopenTime = p.reopenDateTime 
                      ? new Date(p.reopenDateTime).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                      : null;

                    // Custom displayName formatting based on type
                    const getVipDisplayName = (prod: Product, defaultVipLevel: number) => {
                      if (prod.isCyclic) {
                        return `SYSTÈME AIPRODS BIEN-ÊTRE 🌸`;
                      }
                      
                      if (prod.category === 'activity') {
                        return `SYSTÈME AIPRODS ACTIVITÉ ${prod.vipLevel || defaultVipLevel} ⚡`;
                      }

                      switch (prod.vipLevel) {
                        case 1: return "SYSTÈME AIPRODS 1 🎧";
                        case 2: return "SYSTÈME AIPRODS 2 🎧";
                        case 3: return "SYSTÈME AIPRODS 3 🎧";
                        case 4: return "SYSTÈME AIPRODS 4 🎧";
                        case 5: return "SYSTÈME AIPRODS PRO 🎧";
                        case 6: return "SYSTÈME AIPRODS PRO 2 🎧";
                        case 7: return "SYSTÈME AIPRODS MAX 🎧";
                        default: return `SYSTÈME AIPRODS ${prod.vipLevel || defaultVipLevel} 🎧`;
                      }
                    };

                    const displayName = getVipDisplayName(p, p.vipLevel || (index + 1));
                    
                    // Card accent styles
                    const isCyclicCard = p.isCyclic === true;
                    const isActivityCard = p.category === 'activity';
                    
                    let bgStyle = "bg-[#f1f4fc]/70 backdrop-blur-md border-slate-300/60";
                    let badgeBg = "bg-[#1b64d9]";
                    let btnColor = "bg-[#db5129] hover:bg-[#c23f18]";
                    let statusLabel = "Rendement garanti";
                    let statusIcon = "⚡";
                    let statusLabelColor = "text-[#1b64d9]";
                    
                    if (isCyclicCard) {
                      bgStyle = "bg-[#f1fcf9]/70 backdrop-blur-md border-emerald-200/60";
                      badgeBg = "bg-emerald-600";
                      btnColor = "bg-emerald-600 hover:bg-emerald-700";
                      statusLabel = "Rendement Bien-être";
                      statusIcon = "🌸";
                      statusLabelColor = "text-emerald-700";
                    } else if (isActivityCard) {
                      bgStyle = "bg-[#fffcf4]/70 backdrop-blur-md border-[#ffe6bf]/60";
                      badgeBg = "bg-amber-600";
                      btnColor = "bg-amber-655 hover:bg-amber-700";
                      statusLabel = "Rendement Événementiel";
                      statusIcon = "🔥";
                      statusLabelColor = "text-amber-700";
                    }

                    const isPopular = !p.isCyclic && (p.vipLevel === 1 || index === 0);
                    const isRecommended = !p.isCyclic && (p.vipLevel === 2 || index === 1);
                    const purchasedCount = activeInvestments.filter(i => i.productName === p.name || i.productId === p.id).length;

                    return (
                      <div 
                        key={p.id}
                        className={`w-full relative border rounded-[28px] p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg ${bgStyle} ${isBlocked ? 'opacity-70 pointer-events-none' : ''}`}
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
                          {isCyclicCard && (
                            <span className="text-[9px] text-white font-sans font-black uppercase bg-emerald-600 px-3 py-1 rounded-full shadow-sm leading-none tracking-wider">
                              BIEN-ÊTRE
                            </span>
                          )}
                          {isActivityCard && (
                            <span className="text-[9px] text-white font-sans font-black uppercase bg-amber-600 px-3 py-1 rounded-full shadow-sm leading-none tracking-wider">
                              SPÉCIAL ACTIVITÉ
                            </span>
                          )}
                          <span className="text-[10px] text-[#1e7a5c] font-sans font-black uppercase bg-[#d7f1e9] px-2.5 py-0.5 rounded-md leading-relaxed">
                            Achat: {purchasedCount}/3
                          </span>
                        </div>

                        {/* PRODUCT IMAGE CARD THUMBNAIL */}
                        <div className="w-full h-36 rounded-[20px] overflow-hidden mb-3.5 relative shadow-sm border border-slate-200/40 bg-slate-100 select-none">
                          <ProductImage 
                            vipLevel={p.vipLevel || (index + 1)}
                            alt={displayName}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                            category={p.category}
                          />
                          <div className="absolute bottom-2 left-2.5 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[9px] font-sans font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                            <span>{getVipCropDetails(p.vipLevel || (index + 1), p.category).name}</span>
                          </div>
                        </div>

                        {/* PRODUCT HEADER */}
                        <div className="text-left mt-1.5">
                          <div className="flex items-center justify-between">
                            <span className={`text-[11px] font-sans font-bold tracking-wider uppercase ${statusLabelColor}`}>
                              {isCyclicCard ? 'PLAN BIEN-ÊTRE' : isActivityCard ? 'PLAN ACTIVITÉS' : `PLAN VIP ${p.vipLevel || (index + 1)}`}
                            </span>
                            <span className="text-[10px] text-emerald-650 font-bold font-sans">
                              {getVipCropDetails(p.vipLevel || (index + 1), p.category).name.split(' ').pop()} Projet Actif
                            </span>
                          </div>
                          <h4 className="font-sans font-black text-base sm:text-lg text-slate-800 leading-tight uppercase tracking-tight mt-0.5">
                            {displayName}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                            {isCyclicCard ? "Faites fructifier vos fonds avec nos packages bien-être générateurs d'actifs." : getVipCropDetails(p.vipLevel || (index + 1), p.category).desc}
                          </p>

                          {/* DYNAMIC LIST OF TARGET GENERATED PRODUCTS FOR CYCLIC */}
                          {isCyclicCard && p.generatedProductIds && p.generatedProductIds.length > 0 && (
                            <div className="mt-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-3">
                              <span className="text-[9px] text-emerald-700 font-black uppercase block mb-1.5">🚀 Produits générés à la complétion :</span>
                              <div className="flex flex-wrap gap-1">
                                {p.generatedProductIds.map(childId => {
                                  const child = products.find(x => x.id === childId);
                                  return (
                                    <span key={childId} className="px-2 py-0.5 bg-white border border-emerald-100 text-emerald-705 font-black rounded text-[9px] leading-relaxed shadow-sm">
                                      VIP {child ? child.vipLevel : ''} : {child ? child.name : childId}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {/* PRICE */}
                          <div className="mt-2.5 flex items-baseline space-x-1.5">
                            <span className="text-2xl sm:text-3xl font-sans font-black text-[#db4c20] tracking-tight leading-none">
                              {p.price.toLocaleString()} {getCurrency()}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                              {isCyclicCard ? "prix d'activation bien-être" : "prix fixe de location"}
                            </span>
                          </div>
                        </div>

                        {/* 3-COLUMN METRICS */}
                        <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-200/60 py-3.5 my-4 text-left select-none">
                          <div>
                            <span className="text-slate-400 text-[9px] block font-extrabold uppercase tracking-tight leading-none mb-1">REVENUS / JOUR</span>
                            <span className="text-[#00bd74] font-black font-sans text-xs sm:text-sm block">
                              +{p.dailyReturn.toLocaleString()} F
                            </span>
                            <span className="text-orange-600 font-extrabold font-sans text-[10px] block mt-0.5">
                              {((p.dailyReturn / p.price) * 100).toFixed(1)}% / jour
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
                            <span className="text-[#00bd74] font-black font-sans text-xs sm:text-sm block">
                              {(p.dailyReturn * p.durationDays).toLocaleString()} F
                            </span>
                            <span className="text-emerald-600 font-extrabold font-sans text-[10px] block mt-0.5">
                              {Math.round(((p.dailyReturn * p.durationDays) / p.price) * 100)}% total
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

                        {/* BOTTOM ROW */}
                        <div className="flex items-center justify-between mt-1 pt-1.5 space-x-3 text-left select-none">
                          <div className="flex items-center space-x-2 text-slate-500">
                            <span className="text-base font-extrabold">{statusIcon}</span>
                            <div className="leading-tight">
                              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 block uppercase tracking-tight">{statusLabel}</span>
                              <span className={`text-[10px] sm:text-[11px] font-black leading-none ${statusLabelColor}`}>100% active</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleBuyProduct(p)}
                            disabled={isBlocked}
                            className={`py-3 px-5 rounded-[20px] text-xs font-black uppercase text-white transition-all shadow-md active:scale-95 flex items-center justify-center space-x-1 cursor-pointer min-w-[125px] shrink-0 ${btnColor} disabled:opacity-50`}
                          >
                            <span>{isCyclicCard ? 'Activer le Cycle' : 'Activer le Plan'}</span>
                            {!isBlocked && <span className="text-yellow-300">⚡</span>}
                          </button>
                        </div>
                        
                        {isBlocked && (
                          <div className="absolute inset-0 rounded-[28px] bg-slate-950/30 flex flex-col items-center justify-center p-3">
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

                {products.filter((p) => {
                  const isCyclic = p.isCyclic === true;
                  if (isCyclic) return false;
                  return p.category !== 'activity';
                }).length === 0 && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 px-4 text-center rounded-3xl bg-slate-50 border border-dashed border-slate-200/60 max-w-sm mx-auto">
                    <span className="text-3xl">📭</span>
                    <h5 className="font-sans font-black text-slate-700 uppercase tracking-wider text-xs mt-3">Aucun produit disponible</h5>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      Aucun plan d'investissement n'est actif dans cette catégorie pour le moment.
                    </p>
                  </div>
                )}
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
                    Choisissez votre méthode préférée et recharger instantanément et automatiquement votre solde de compte.
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
                    {isPollingSp && (
                      <div className="flex items-center justify-center space-x-2 p-3 bg-white/60 rounded-xl border border-green-300 text-[11px] text-emerald-800 font-bold mt-2 shadow-sm">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                        </span>
                        <span>Vérification automatique de votre paiement en cours...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* OTP Validation Form (Inline) */}
                {spOtpModalOpen ? (
                  <form onSubmit={submitSpOtp} className="space-y-4 font-sans animate-fade-in">
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-center">
                      <span className="text-xl">💬</span>
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mt-1">Validation OTP Obligatoire</h4>
                      <p className="text-[11px] text-slate-500 font-semibold mt-1">
                        {spStatusMessage || "Veuillez entrer le code secret de validation temporaire envoyé par SMS pour valider votre recharge Mobile Money."}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 font-mono">
                        Code secret temporaire SMS 🔑
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 123456"
                        value={spOtpCode}
                        onChange={(e) => setSpOtpCode(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 focus:border-[#1b64d9] rounded-2xl py-3.5 px-4 text-center text-lg font-black tracking-widest text-slate-850 focus:outline-none shadow-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingDeposit}
                      className="w-full py-4 text-white font-sans font-black text-xs uppercase tracking-widest bg-[#1b64d9] hover:bg-blue-700 rounded-2xl hover:opacity-95 transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingDeposit ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Vérification du code...</span>
                        </div>
                      ) : (
                        <span>✓ Valider et Créditer mon compte</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSpOtpModalOpen(false);
                        setSpOtpToken(null);
                        setSpOtpCode('');
                        setDepositSuccess('');
                        setDepositError('');
                      }}
                      className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wider underline cursor-pointer"
                    >
                      Annuler et modifier les informations
                    </button>
                  </form>
                ) : (
                  <form onSubmit={submitDeposit} className="space-y-5 text-left animate-fade-in font-sans">
                    
                    {/* AMOUNT PRESETS */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 font-mono">
                        Étape 1 : Choisissez ou cliquez un montant rapide 💵
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                        {[3000, 5000, 10000, 25000, 50000, 100000, 250000, 500000].map((amt) => {
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

                    {/* AMOUNT FIELD */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 font-mono">
                        Ou saisissez votre propre montant ({getCurrency()})
                      </label>
                      <input
                        type="number"
                        required
                        placeholder={`Minimum 3 000 ${getCurrency()}`}
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200/45 focus:border-[#1b64d9] rounded-2xl py-3.5 px-4 text-sm text-[#1b64d9] font-black focus:outline-none shadow-sm placeholder:text-slate-400"
                      />
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1">Note : Montant minimum autorisé de 3 000 XOF.</span>
                    </div>

                    {/* SENDAVAPAY COUNTRY SELECT */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 font-mono">
                        Étape 2 : Choisissez votre pays d'origine 🌍
                      </label>
                      <select
                        value={spCountryCode}
                        onChange={(e) => setSpCountryCode(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200/45 focus:border-[#1b64d9] rounded-2xl py-3.5 px-4 text-sm text-slate-800 font-bold focus:outline-none shadow-sm cursor-pointer"
                      >
                        {SENDAVAPAY_COUNTRIES.map((cnt) => (
                          <option key={cnt.code} value={cnt.code}>
                            {cnt.name} ({cnt.currency})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* SENDAVAPAY OPERATOR SELECT */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 font-mono">
                        Étape 3 : Choisissez votre opérateur Mobile Money 📲
                      </label>
                      <select
                        value={spOperatorId}
                        onChange={(e) => setSpOperatorId(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200/45 focus:border-[#1b64d9] rounded-2xl py-3.5 px-4 text-sm text-slate-800 font-bold focus:outline-none shadow-sm cursor-pointer"
                      >
                        <option value="">-- Sélectionner l'opérateur --</option>
                        {(SENDAVAPAY_OPERATORS[spCountryCode] || []).map((op) => (
                          <option key={op.id} value={op.id}>
                            {op.name} {op.requiresOtp ? "(Demande OTP SMS)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* PHONE NUMBER FIELD */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 font-mono">
                        Étape 4 : Saisissez votre numéro Mobile Money 📱
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ex: 0708091011 ou 60616263"
                        value={depositPhone}
                        onChange={(e) => setDepositPhone(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200/45 focus:border-[#1b64d9] rounded-2xl py-3.5 px-4 text-sm text-slate-800 font-bold focus:outline-none shadow-sm placeholder:text-slate-400 font-mono"
                      />
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                        Pour les opérateurs avec OTP, un SMS vous sera expédié. Saisissez bien le numéro de votre compte mobile.
                      </span>
                    </div>

                    <div className="bg-[#e2ebf9]/80 p-4 rounded-xl border border-slate-200/50 text-xs text-slate-650 leading-relaxed font-semibold">
                      <span className="font-extrabold text-[#1b64d9] uppercase text-[10px] tracking-wider block mb-0.5">🔒 Protection Sécurisée :</span>
                      Avec SendavaPay, le traitement est 100% automatique. Dès que vous validez le paiement ou entrez le code OTP, votre solde de compte AgroProfit est crédité instantanément.
                    </div>

                    {/* Submitting button */}
                    <button
                      type="submit"
                      disabled={isSubmittingDeposit}
                      className="w-full py-4 text-white font-sans font-black text-xs uppercase tracking-widest bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] rounded-2xl hover:opacity-95 transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                )}
              </div>
            );
          })()}

          {/* WITHDRAW FORM TAB */}
          {activeTab === 'withdraw' && (
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
                <div className="mb-3 p-3 rounded-xl bg-orange-100 border border-orange-200 text-[10.5px] text-orange-850 font-black text-center uppercase tracking-wide flex flex-col gap-0.5 shadow-sm">
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
                    className="w-full bg-white border border-orange-100 rounded-xl py-2 px-3 text-xs text-slate-800 font-bold focus:outline-none cursor-pointer shadow-sm"
                  >
                    <option value="Wave (CI)">Wave (CI)</option>
                    <option value="MTN (CI)">MTN (CI)</option>
                    <option value="Orange (CI)">Orange (CI)</option>
                    <option value="Moov (CI)">Moov (CI)</option>

                    <option value="T-Money (TG)">T-Money (TG)</option>
                    <option value="Moov (TG)">Moov (TG)</option>
                    
                    <option value="MTN (BJ)">MTN (BJ)</option>
                    <option value="Moov (BJ)">Moov (BJ)</option>
                    
                    <option value="Orange (BF)">Orange (BF)</option>
                    <option value="Moov (BF)">Moov (BF)</option>

                    <option value="MTN (CM)">MTN (CM)</option>
                    <option value="Orange (CM)">Orange (CM)</option>
                  </select>
                </div>

                {/* Target phone number with WhatsApp placeholder */}
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1">Numéro de téléphone de réception</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: +225 0707123456 ou +228 90123456"
                    value={withdrawNumber}
                    onChange={(e) => setWithdrawNumber(e.target.value)}
                    className="w-full bg-white border border-orange-100 rounded-xl py-2 px-3 text-xs text-slate-800 font-mono font-bold tracking-wider shadow-sm"
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
                    className="w-full bg-white border border-orange-100 rounded-xl py-2 px-3 text-xs text-[#1b64d9] font-black focus:outline-none"
                  />
                </div>

                {/* Real-time fee summary */}
                {!isNaN(parseInt(withdrawAmount)) && parseInt(withdrawAmount) > 0 && (
                  <div className="bg-[#fffdfb] p-2.5 rounded-xl border border-orange-100 text-[10.5px] font-bold text-slate-700 space-y-1 animate-fade-in shadow-sm">
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

          {/* WITHDRAWAL PROOFS FEED TAB REMOVED */}
          {false && activeTab === 'proofs' && (
            <div className="space-y-6 max-w-4xl mx-auto text-left bg-white p-6 sm:p-8 rounded-[34px] border border-orange-100 shadow-[0_12px_45px_rgba(249,115,22,0.04)]">
              
              {/* BRAND HEADER CARD */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-[28px] p-6 sm:p-8 shadow-sm text-slate-800 text-left relative overflow-hidden">
                {/* Decorative background visual blob */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
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
                      Découvrez les reçus réels reçus et publiés en direct par nos investisseurs Aiprods.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsPublishFormOpen(!isPublishFormOpen)}
                    className="self-start sm:self-center px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-2xl shadow-[0_4px_15px_rgba(249,115,22,0.25)] flex items-center gap-2 duration-150 transition-all cursor-pointer select-none active:scale-95 shrink-0 uppercase tracking-widest font-mono"
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
                    <div className="bg-slate-50/50 border border-orange-100 rounded-3xl p-5 sm:p-6 shadow-md text-slate-800">
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
                              className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:outline-[#f97316] rounded-xl text-xs sm:text-sm text-slate-800 p-3.5 font-bold transition-all focus:ring-2 focus:ring-orange-500/20 placeholder-slate-400"
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
                                  ? 'border-orange-500 bg-orange-500/10' 
                                  : proofImage 
                                    ? 'border-emerald-500 bg-emerald-500/10' 
                                    : 'border-slate-250 bg-white hover:border-orange-400 hover:bg-slate-50/50'
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
                                  <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100/50 text-orange-600 flex items-center justify-center text-sm shrink-0">
                                    📸
                                  </div>
                                  <div className="text-left leading-tight">
                                    <span className="text-[10px] sm:text-[11px] text-orange-600 font-black uppercase tracking-wide block">
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
                            className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:outline-[#f97316] rounded-xl text-xs sm:text-sm text-slate-800 p-3.5 font-bold transition-all focus:ring-2 focus:ring-orange-500/20 placeholder-slate-400 resize-none"
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
                                ? 'bg-orange-400 opacity-80 cursor-not-allowed' 
                                : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/10 active:scale-95 transition-all'
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
                      'from-orange-500 to-amber-500', 
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
                        className="bg-white border border-slate-150 hover:border-orange-200 hover:shadow-lg transition-all rounded-3xl p-5 text-left relative overflow-hidden group shadow-sm"
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
                                <span className="text-[10px] text-orange-600 font-black uppercase tracking-wider block opacity-95">
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
                          <div className="mt-4 max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 hover:border-orange-200 transition-colors">
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
                                ? 'bg-orange-50 text-orange-600 font-black saturate-150 border border-orange-200' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent'
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-orange-550 stroke-orange-550' : ''}`} />
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
                          className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
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
          {activeTab === 'team' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              
              {/* BRAND ADVOCATE HEADER */}
              <div className="bg-[#0b1229]/70 backdrop-blur-md p-5 pb-6 border border-yellow-500/15 rounded-2xl text-left grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 space-y-2 flex flex-col justify-center">
                  <span className="text-xs font-black text-yellow-500 font-mono tracking-widest uppercase block">PROFIL PARRAIN</span>
                  <h3 className="text-lg font-sans font-black text-white uppercase tracking-tight">Encouragez vos Équipes MLM</h3>
                  <p className="text-xs text-slate-200 leading-relaxed">Distribuez votre lien personnel et gagnez des bonus de parrainage sur 3 niveaux d'investissements de votre réseau.</p>
                </div>
 
                {/* Copy blocks */}
                <div className="md:col-span-2 space-y-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-center">
                  <div>
                    <span className="text-xs text-slate-300 uppercase font-black tracking-wide block mb-1">Code Sponsor Unique :</span>
                    <div className="flex bg-slate-900 border border-slate-800 p-2.5 px-3 rounded-lg justify-between items-center relative">
                      <span className="font-mono text-sm font-black text-yellow-400 select-all">{userState.referralCode}</span>
                      <button
                        onClick={handleCopyCode}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors text-slate-300 rounded-md flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                        title="Copier le code"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span>Copié</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copier</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
 
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 p-4 rounded-xl border-2 border-yellow-500/30 space-y-3.5" id="referral-high-visibility-system">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-yellow-400 uppercase font-black tracking-wide block">
                        🔗 LIEN DE PARRAINAGE EXCLUSIF
                      </span>
                      <span className="bg-yellow-500 text-slate-950 font-mono text-[8.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                        Actif
                      </span>
                    </div>

                    <div className="space-y-2">
                      {/* Fully visible responsive URL box (untruncated, wrapping / break-all to avoid cutting) */}
                      <div className="relative">
                        <textarea
                          readOnly
                          rows={2}
                          value={referralURL}
                          onClick={(e) => {
                            (e.target as HTMLTextAreaElement).select();
                            handleCopyLink();
                          }}
                          className="w-full font-mono text-xs font-bold text-yellow-300 bg-slate-900 border border-yellow-500/30 hover:border-yellow-500 p-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer shadow-inner transition-all select-all block resize-none text-center break-all"
                        />
                        <button
                          onClick={handleCopyLink}
                          className="absolute right-2.5 top-2.5 p-2 bg-yellow-500 hover:bg-yellow-400 active:scale-90 text-slate-950 rounded-lg transition-all flex items-center justify-center shadow-md cursor-pointer border-0"
                          title="Copier le lien de parrainage"
                        >
                          {copiedLink ? <Check className="w-4 h-4 text-slate-950 font-bold" /> : <Copy className="w-4 h-4 text-slate-950" />}
                        </button>
                      </div>
                      
                      <p className="text-[10px] text-slate-300 text-center font-medium leading-tight">
                        💡 <span className="text-yellow-400 font-black">Astuce :</span> Taper une fois sur la zone ci-dessus pour copier automatiquement !
                      </p>
                    </div>

                    {/* QR Code section & big button */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div className="bg-white p-1.5 rounded-lg flex-shrink-0 shadow-md">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=95x95&data=${encodeURIComponent(referralURL)}&color=0-14-38`}
                          alt="QR Code Parrainage"
                          className="w-[80px] h-[80px]"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="text-center sm:text-left flex-1 space-y-1.5 w-full">
                        <h4 className="text-[11px] font-black text-white uppercase tracking-tight">Votre QR Code d'équipe</h4>
                        <p className="text-[9.5px] text-slate-300 leading-tight">Laissez vos filleuls scanner ce QR code pour s'inscrire sous votre parrainage instantanément.</p>
                        
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black uppercase text-[10px] tracking-wider py-2 px-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 border-0 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copiedLink ? 'Lien de Parrainage Copié !' : 'Copier le Lien Principal'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SOCIAL SHARING OPTIONS */}
                  <div className="pt-3.5 border-t border-slate-800/80 mt-1">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-2 text-left">Partager sur :</span>
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:flex sm:flex-wrap gap-2">
                      {/* WhatsApp */}
                      <a 
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Rejoignez Aiprods et gagnez des revenus quotidiens sécurisés ! Utilisez mon lien d'inscription : ${referralURL}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 transition-all text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm text-center"
                      >
                        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 1.975 14.069 1.953 12.01 1.953c-5.438 0-9.863 4.372-9.867 9.802-.001 1.83.49 3.619 1.423 5.191l-.991 3.616 3.702-.971zm11.367-7.251c-.33-.164-1.952-.955-2.253-1.064-.3-.11-.52-.164-.74.164-.22.33-.85 1.064-1.04 1.283-.19.22-.38.246-.71.082-.33-.164-1.393-.51-2.653-1.627-.98-.868-1.64-1.94-1.83-2.268-.19-.33-.02-.508.145-.671.15-.148.33-.384.495-.576.16-.192.21-.33.32-.548.11-.219.05-.411-.02-.576-.07-.164-.74-1.765-1.01-2.422-.26-.632-.53-.547-.73-.557-.19-.01-.41-.01-.62-.01-.21 0-.55.08-.84.4-.29.32-1.12 1.083-1.12 2.641 0 1.558 1.14 3.065 1.3 3.282.16.218 2.24 3.393 5.43 4.757.76.324 1.35.518 1.81.662.76.241 1.45.207 2 .126.61-.09 1.95-.79 2.23-1.558.28-.767.28-1.422.2-1.558-.09-.137-.3-.21-.63-.375z" />
                        </svg>
                        <span>WhatsApp</span>
                      </a>

                      {/* Facebook */}
                      <a 
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralURL)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 bg-[#1877F2] hover:bg-[#166fe5] active:scale-95 transition-all text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm text-center"
                      >
                        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span>Facebook</span>
                      </a>

                      {/* Instagram */}
                      <button 
                        onClick={() => {
                          handleCopyLink();
                          openAlert('Partager sur Instagram', 'Le lien a été copié ! Collez-le dans votre bio, story ou messages directs sur Instagram.', 'info');
                          setTimeout(() => {
                            window.open('https://instagram.com', '_blank', 'noopener,noreferrer');
                          }, 1500);
                        }}
                        className="flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:brightness-110 active:scale-95 transition-all text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm border-0 cursor-pointer text-center"
                      >
                        <svg className="w-3.5 h-3.5 fill-none stroke-white stroke-[2]" viewBox="0 0 24 24">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </svg>
                        <span>Instagram</span>
                      </button>

                      {/* Twitter (X) */}
                      <a 
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Rejoignez Aiprods et gagnez des revenus quotidiens sécurisés ! Utilisez mon lien : `)}&url=${encodeURIComponent(referralURL)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 bg-[#000000] border border-slate-800 hover:bg-[#111] active:scale-95 transition-all text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm text-center"
                      >
                        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        <span>Twitter</span>
                      </a>

                      {/* YouTube */}
                      <button 
                        onClick={() => {
                          handleCopyLink();
                          openAlert('Partager sur YouTube', 'Le lien de parrainage a été copié ! Collez-le dans la description ou les commentaires de votre vidéo/Short YouTube pour attirer des filleuls.', 'info');
                          setTimeout(() => {
                            window.open('https://youtube.com', '_blank', 'noopener,noreferrer');
                          }, 1500);
                        }}
                        className="flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 bg-[#FF0000] hover:bg-[#e60000] active:scale-95 transition-all text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm border-0 cursor-pointer text-center"
                      >
                        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11C4.482 20.5 12 20.5 12 20.5s7.518 0-9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        <span>YouTube</span>
                      </button>

                      {/* Telegram */}
                      <a 
                        href={`https://t.me/share/url?url=${encodeURIComponent(referralURL)}&text=${encodeURIComponent(`Rejoignez Aiprods et obtenez des rendements quotidiens exceptionnels sur vos équipements audio !`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 bg-[#0088cc] hover:bg-[#0077b3] active:scale-95 transition-all text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm text-center"
                      >
                        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                          <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.578.193l-8.534 7.701-.33 4.953c.485 0 .7-.223.972-.485l2.333-2.269 4.85 3.583c.893.492 1.535.239 1.758-.826l3.18-14.986c.325-1.3-.497-1.892-1.35-1.493z" />
                        </svg>
                        <span>Telegram</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              {/* COMMISSIONS OVERVIEW CARDS */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-sm">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-extrabold block">Total Filleuls</span>
                  <div className="text-lg sm:text-xl font-black font-mono text-white mt-1">
                    {totalReferrals} membres
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mt-1">Réseau actif</span>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-sm">
                  <span className="text-xs text-orange-400 uppercase tracking-wider font-extrabold block">Commission Totale</span>
                  <div className="text-lg sm:text-xl font-black font-mono text-orange-400 mt-1">
                    {commissions.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} F CFA
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mt-1">Gains parrainage</span>
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

                {/* RÉCAPITULATIF DES NIVEAUX DE PARRAINAGE AVEC MONTANT INVESTI */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-1" id="referrals-levels-investments-summary">
                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-black uppercase tracking-wider text-[#00bd74]">Niveau 1</span>
                      <span className="text-[10px] font-mono font-black text-white bg-[#00bd74]/15 px-2 py-0.5 rounded-full border border-[#00bd74]/20">{level1Users.length} membres</span>
                    </div>
                    <div className="text-xs font-bold text-slate-300 mt-2">
                      Total Investi : <span className="text-[#00bd74] font-black font-mono">{getLevelInvestedAmount(level1Users).toLocaleString()} F CFA</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-black uppercase tracking-wider text-yellow-500">Niveau 2</span>
                      <span className="text-[10px] font-mono font-black text-white bg-yellow-500/15 px-2 py-0.5 rounded-full border border-yellow-500/20">{level2Users.length} membres</span>
                    </div>
                    <div className="text-xs font-bold text-slate-300 mt-2">
                      Total Investi : <span className="text-yellow-500 font-black font-mono">{getLevelInvestedAmount(level2Users).toLocaleString()} F CFA</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-black uppercase tracking-wider text-blue-400">Niveau 3</span>
                      <span className="text-[10px] font-mono font-black text-white bg-blue-500/15 px-2 py-0.5 rounded-full border border-blue-500/20">{level3Users.length} membres</span>
                    </div>
                    <div className="text-xs font-bold text-slate-300 mt-2">
                      Total Investi : <span className="text-blue-400 font-black font-mono">{getLevelInvestedAmount(level3Users).toLocaleString()} F CFA</span>
                    </div>
                  </div>
                </div>

                {/* LEVEL 1 VIEW */}
                {referralListTab === 'level1' && (
                  <>
                    {level1Users.length === 0 ? (
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-center py-6 bg-slate-950/20 rounded-xl font-medium">
                        Vous n'avez pas encore de filleuls inscrits directement (Niveau 1) avec votre code de parrainage. Partagez votre lien d'inscription Aiprods pour commencer !
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

                              <div className="mt-1.5 text-xs font-mono text-slate-300 flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-900">
                                <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Montant Investi</span>
                                <span className="text-white text-[11px] font-bold font-mono">{getUserInvestedAmount(u.id).toLocaleString()} F CFA</span>
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

                                <div className="mt-1.5 text-xs font-mono text-slate-300 flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-900">
                                  <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Montant Investi</span>
                                  <span className="text-white text-[11px] font-bold font-mono">{getUserInvestedAmount(u.id).toLocaleString()} F CFA</span>
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

                                <div className="mt-1.5 text-xs font-mono text-slate-300 flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-900">
                                  <span className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Montant Investi</span>
                                  <span className="text-white text-[11px] font-bold font-mono">{getUserInvestedAmount(u.id).toLocaleString()} F CFA</span>
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
            <div className="bg-transparent -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-24 min-h-[90vh] text-slate-800 text-left">
              <div className="max-w-2xl mx-auto w-full space-y-5">
                
                {/* SOLDE DE RETRAIT CARD */}
                <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[24px] p-5 shadow-lg space-y-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Solde de retrait</span>
                      <h2 className="text-2xl sm:text-3xl font-black text-[#006fff] font-sans mt-1.5">
                        {userState.balance.toLocaleString()} <span className="text-sm font-extrabold text-[#006fff]">FCFA</span>
                      </h2>
                    </div>
                    <button 
                      onClick={() => setActiveTab('withdraw')}
                      className="bg-[#0086ff] hover:bg-[#0076ee] text-white text-[11px] font-black px-5 py-2.5 rounded-full transition-all active:scale-95 shadow-md flex items-center gap-1 cursor-pointer border-0 outline-none"
                    >
                      Retirer &gt;
                    </button>
                  </div>

                  {/* 3 Grid items inside card: Commissions, Bonus, Revenus/jour */}
                  <div className="grid grid-cols-3 gap-2.5 pt-1.5">
                    {/* Commissions card */}
                    <div className="bg-slate-50/70 backdrop-blur-sm border border-slate-100/60 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                      <span className="text-xl sm:text-2xl" role="img" aria-label="commissions">🤝</span>
                      <span className="text-[10px] sm:text-xs text-slate-450 font-bold block mt-1 leading-tight">Commissions</span>
                      <span className="text-[11px] sm:text-xs font-black text-slate-700 block mt-0.5">{(userState.totalEarnings || 0).toLocaleString()} F</span>
                    </div>

                    {/* Bonus card */}
                    <div className="bg-slate-50/70 backdrop-blur-sm border border-slate-100/60 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                      <span className="text-xl sm:text-2xl" role="img" aria-label="bonus">🎁</span>
                      <span className="text-[10px] sm:text-xs text-slate-450 font-bold block mt-1 leading-tight">Bonus</span>
                      <span className="text-[11px] sm:text-xs font-black text-slate-700 block mt-0.5">{(userState.bonus || 0).toLocaleString()} F</span>
                    </div>

                    {/* Revenus/jour card */}
                    <div className="bg-slate-50/70 backdrop-blur-sm border border-slate-100/60 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                      <span className="text-xl sm:text-2xl" role="img" aria-label="revenus">⚡</span>
                      <span className="text-[10px] sm:text-xs text-slate-450 font-bold block mt-1 leading-tight">Revenus/jour</span>
                      <span className="text-[11px] sm:text-xs font-black text-slate-700 block mt-0.5">{(userState.dailyEarnings || 0).toLocaleString()} F</span>
                    </div>
                  </div>
                </div>

                {/* RETRAIT, HISTORIQUE, POINTAGE CARD (GRID OF 3 ROUNDED CONTAINERS) */}
                <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[24px] p-5 shadow-md grid grid-cols-3 gap-3">
                  {/* Retrait */}
                  <button 
                    onClick={() => setActiveTab('withdraw')}
                    className="flex flex-col items-center justify-center text-center p-2 group hover:scale-105 transition-all cursor-pointer border-0 bg-transparent"
                  >
                    <div className="w-12 h-12 bg-sky-50 text-sky-600 flex items-center justify-center rounded-full shadow-xs group-hover:bg-sky-100 transition-all">
                      <ArrowUpCircle className="w-5.5 h-5.5 stroke-[2.5]" />
                    </div>
                    <span className="font-sans font-extrabold text-[11px] sm:text-xs text-slate-700 mt-2.5">Retrait</span>
                  </button>

                  {/* Historique */}
                  <button 
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('/historique');
                      }
                    }}
                    className="flex flex-col items-center justify-center text-center p-2 group hover:scale-105 transition-all cursor-pointer border-0 bg-transparent"
                  >
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 flex items-center justify-center rounded-full shadow-xs group-hover:bg-purple-100 transition-all">
                      <History className="w-5.5 h-5.5 stroke-[2.5]" />
                    </div>
                    <span className="font-sans font-extrabold text-[11px] sm:text-xs text-slate-700 mt-2.5">Historique</span>
                  </button>

                  {/* Pointage */}
                  <button 
                    onClick={handleDailyCheckin}
                    className="flex flex-col items-center justify-center text-center p-2 group hover:scale-105 transition-all cursor-pointer border-0 bg-transparent"
                  >
                    <div className={`w-12 h-12 flex items-center justify-center rounded-full shadow-xs transition-all ${
                      hasCheckedInToday 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
                    }`}>
                      <Calendar className="w-5.5 h-5.5 stroke-[2.5]" />
                    </div>
                    <span className="font-sans font-extrabold text-[11px] sm:text-xs text-slate-700 mt-2.5">
                      {hasCheckedInToday ? 'Fait ✓' : 'Pointage'}
                    </span>
                  </button>
                </div>

                {/* MES PRODUITS BANNER (NO BACKGROUND IMAGE, JUST WRITING/TEXT) */}
                <div 
                  className="bg-white/70 backdrop-blur-md rounded-[24px] p-5 shadow-sm space-y-4 text-left border border-slate-200/60"
                >
                  <div 
                    onClick={() => setShowStabilityOrders(!showStabilityOrders)}
                    className="flex justify-between items-center cursor-pointer select-none group"
                  >
                    <div>
                      <h3 className="font-sans font-black text-sm sm:text-base text-slate-800 uppercase tracking-tight">Mes produits</h3>
                      <p className="text-[11px] sm:text-xs text-slate-400 font-extrabold mt-1 group-hover:text-slate-500 transition-colors">
                        Achetez plus d'appareils, gagnez plus de revenus
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

                {/* PLUS SECTION */}
                <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[24px] p-5 shadow-md space-y-4">
                  <h4 className="text-xs text-slate-400 font-extrabold uppercase tracking-widest px-1">Plus</h4>
                  
                  <div className="grid grid-cols-4 gap-y-5 gap-x-2">
                    {/* À propos */}
                    <button 
                      onClick={() => setIsAboutModalOpen(true)}
                      className="flex flex-col items-center justify-center text-center group hover:scale-105 transition-transform cursor-pointer border-0 bg-transparent"
                    >
                      <div className="w-11 h-11 bg-sky-50 text-sky-600 flex items-center justify-center rounded-full shadow-xs group-hover:bg-sky-100 transition-colors">
                        <Info className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="font-sans font-extrabold text-[10px] sm:text-[11px] text-slate-655 mt-2 leading-tight">À propos</span>
                    </button>

                    {/* Règlement */}
                    <button 
                      onClick={() => setIsRulesModalOpen(true)}
                      className="flex flex-col items-center justify-center text-center group hover:scale-105 transition-transform cursor-pointer border-0 bg-transparent"
                    >
                      <div className="w-11 h-11 bg-purple-50 text-purple-600 flex items-center justify-center rounded-full shadow-xs group-hover:bg-purple-100 transition-colors">
                        <BookOpen className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="font-sans font-extrabold text-[10px] sm:text-[11px] text-slate-655 mt-2 leading-tight">Règlement</span>
                    </button>

                    {/* Historique */}
                    <button 
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate('/historique');
                        }
                      }}
                      className="flex flex-col items-center justify-center text-center group hover:scale-105 transition-transform cursor-pointer border-0 bg-transparent"
                    >
                      <div className="w-11 h-11 bg-teal-50 text-teal-600 flex items-center justify-center rounded-full shadow-xs group-hover:bg-teal-100 transition-colors">
                        <History className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="font-sans font-extrabold text-[10px] sm:text-[11px] text-slate-655 mt-2 leading-tight">Historique</span>
                    </button>

                    {/* Service client */}
                    <button 
                      onClick={() => setIsLiveChatOpen(true)}
                      className="flex flex-col items-center justify-center text-center group hover:scale-105 transition-transform cursor-pointer border-0 bg-transparent"
                    >
                      <div className="w-11 h-11 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-full shadow-xs group-hover:bg-emerald-100 transition-colors">
                        <Headphones className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="font-sans font-extrabold text-[10px] sm:text-[11px] text-slate-655 mt-2 leading-tight">Service client</span>
                    </button>

                    {/* Installer l'App */}
                    <button 
                      onClick={() => setIsInstallModalOpen(true)}
                      className="flex flex-col items-center justify-center text-center group hover:scale-105 transition-transform cursor-pointer border-0 bg-transparent"
                    >
                      <div className="w-11 h-11 bg-orange-50 text-orange-600 flex items-center justify-center rounded-full shadow-xs group-hover:bg-orange-100 transition-colors">
                        <Smartphone className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="font-sans font-extrabold text-[10px] sm:text-[11px] text-slate-655 mt-2 leading-tight">Installer l'App</span>
                    </button>

                    {/* Canal */}
                    <button 
                      onClick={() => window.open(DataStore.getWhatsAppChannel(), '_blank')}
                      className="flex flex-col items-center justify-center text-center group hover:scale-105 transition-transform cursor-pointer border-0 bg-transparent"
                    >
                      <div className="w-11 h-11 bg-red-50 text-red-600 flex items-center justify-center rounded-full shadow-xs group-hover:bg-red-100 transition-colors">
                        <MessageCircle className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="font-sans font-extrabold text-[10px] sm:text-[11px] text-slate-655 mt-2 leading-tight">Canal</span>
                    </button>

                    {/* Modifier MDP */}
                    <button 
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="flex flex-col items-center justify-center text-center group hover:scale-105 transition-transform cursor-pointer border-0 bg-transparent"
                    >
                      <div className="w-11 h-11 bg-slate-100 text-slate-600 flex items-center justify-center rounded-full shadow-xs group-hover:bg-slate-200 transition-colors">
                        <Lock className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="font-sans font-extrabold text-[10px] sm:text-[11px] text-slate-655 mt-2 leading-tight">Modifier MDP</span>
                    </button>

                    {/* Déconnexion */}
                    <button 
                      onClick={onLogout}
                      className="flex flex-col items-center justify-center text-center group hover:scale-105 transition-transform cursor-pointer border-0 bg-transparent"
                    >
                      <div className="w-11 h-11 bg-pink-50 text-pink-600 flex items-center justify-center rounded-full shadow-xs group-hover:bg-pink-100 transition-colors">
                        <LogOut className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="font-sans font-extrabold text-[10px] sm:text-[11px] text-slate-655 mt-2 leading-tight">Déconnexion</span>
                    </button>
                  </div>
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
              setShowAnnouncementDismissible(true);
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
                    <h4 className="font-sans font-black text-xs uppercase tracking-wide leading-none">Support Aiprods</h4>
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
                        Écrivez votre message ci-dessous. Un conseiller Aiprods vous répondra directement ici.
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
              className="bg-white border-2 border-orange-200/60 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(249,115,22,0.12)] relative overflow-hidden flex flex-col max-h-[90vh]"
              id="agro-about-modal"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500" />
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100/60 flex items-center justify-center text-orange-600 border border-orange-200/50 shrink-0">
                    <Info className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-sm uppercase tracking-wider text-slate-800" style={{ fontWeight: '900' }}>
                      À Propos de Nous
                    </h3>
                    <p className="text-[9px] text-[#ea580c] font-black uppercase tracking-wider font-mono">
                      Fonctionnement Aiprods
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
                  <span className="text-[10px] sm:text-xs font-black text-orange-600 block uppercase tracking-widest">PROPULSER LE COMMERCE TECHNOLOGIQUE EN AFRIQUE 🎧</span>
                  <p className="text-[11.5px] leading-relaxed text-slate-600 font-medium">
                    <strong className="text-slate-850 font-black" style={{ fontWeight: '800' }}>Aiprods</strong> est la première interface d'investissement technologique en ligne conçue pour démocratiser la distribution de systèmes audio haut de gamme modernes en Afrique de l'Ouest et Centrale (Côte d'Ivoire, Togo, Bénin, Burkina Faso, Cameroun). Nous canalisons votre épargne vers des stocks réels d'Aiprods connectés de dernière génération afin de générer pour vous des profits stables de manière continue.
                  </p>
                </div>

                {/* HOW IT WORKS / FONCTIONNEMENT - Clean Steps layout with Montserrat bold */}
                <div className="space-y-4">
                  <h4 className="font-sans font-black text-xs uppercase tracking-widest text-[#ea580c] border-b border-orange-100/55 pb-1.5" style={{ fontWeight: '900' }}>
                    COMMENT FONCTIONNE NOTRE SYSTÈME INTERACTIF ?
                  </h4>

                  <div className="space-y-3.5">
                    {/* Step 1 */}
                    <div className="flex gap-3.5 items-start bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl" id="about-step-1">
                      <div className="w-7 h-7 bg-orange-500 text-white rounded-lg flex items-center justify-center text-xs font-black font-sans shrink-0" style={{ fontWeight: '900' }}>
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
                      <div className="w-7 h-7 bg-orange-500 text-white rounded-lg flex items-center justify-center text-xs font-black font-sans shrink-0" style={{ fontWeight: '900' }}>
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
                      <div className="w-7 h-7 bg-orange-500 text-white rounded-lg flex items-center justify-center text-xs font-black font-sans shrink-0" style={{ fontWeight: '900' }}>
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
                      <div className="w-7 h-7 bg-orange-500 text-white rounded-lg flex items-center justify-center text-xs font-black font-sans shrink-0" style={{ fontWeight: '900' }}>
                        4
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="text-[11px] sm:text-xs font-black uppercase text-slate-800 tracking-wider" style={{ fontWeight: '800' }}>
                          Retraits Automatisés Instantanés vers votre Mobile Money
                        </h5>
                        <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed">
                          À tout moment, soumettez votre demande de retrait depuis votre Profil vers votre numéro Momo local. Aiprods valide les flux financiers intelligemment pour créditer votre compte sans délai !
                        </p>
                      </div>
                    </div>

                    {/* Step 5 */}
                    <div className="flex gap-3.5 items-start bg-amber-550/5 border border-amber-550/10 p-3 rounded-2xl" id="about-step-5">
                      <div className="w-7 h-7 bg-orange-500 text-white rounded-lg flex items-center justify-center text-xs font-black font-sans shrink-0" style={{ fontWeight: '900' }}>
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
                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/15 border border-orange-200/55 p-4 rounded-2xl flex items-center gap-3 select-none">
                  <ShieldCheck className="w-8 h-8 text-orange-600 shrink-0" />
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
                <span className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Aiprods &copy; 2026. Tous droits réservés.</span>
                <button 
                  onClick={() => setIsAboutModalOpen(false)}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-95 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
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
              id="aiprods-pin-modal"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500" />
              
              {/* Header */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 shrink-0">
                    <Smartphone className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-xs uppercase tracking-wider text-white" style={{ fontWeight: '900' }}>
                      Épingler l'application
                    </h3>
                    <p className="text-[9px] text-orange-500 font-black uppercase tracking-wider font-mono">
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
                    🚀 <strong className="text-orange-400">La solution définitive :</strong> Épinglez l'application sur votre écran d'accueil en suivant le guide ci-dessous. Elle s'ouvrira directement dans votre navigateur officiel sans aucun blocage !
                  </p>
                </div>

                {/* Tabs selection: Android vs iOS */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-slate-850">
                  <button
                    onClick={() => setActiveInstallTab('android')}
                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                      activeInstallTab === 'android'
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'bg-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    🤖 Android (Chrome)
                  </button>
                  <button
                    onClick={() => setActiveInstallTab('ios')}
                    className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                      activeInstallTab === 'ios'
                        ? 'bg-orange-600 text-white shadow-sm'
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
                            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-95 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 text-center cursor-pointer border-0"
                            style={{ fontWeight: '900' }}
                          >
                            <Smartphone className="w-4 h-4 stroke-[3]" />
                            Ajouter à l'Écran d'Accueil Maintenant
                          </button>
                          <p className="text-[9px] text-slate-400 text-center font-medium">
                            En un clic, l'icône Aiprods sera ajoutée à votre écran.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex gap-3 items-start bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                            <div className="w-6 h-6 bg-slate-800 text-orange-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                              1
                            </div>
                            <p className="text-[10.5px] font-medium leading-relaxed">
                              Ouvrez l'application dans votre navigateur <strong className="text-orange-400">Google Chrome</strong> (ou tapez l'adresse dans Chrome).
                            </p>
                          </div>

                          <div className="flex gap-3 items-start bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                            <div className="w-6 h-6 bg-slate-800 text-orange-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                              2
                            </div>
                            <p className="text-[10.5px] font-medium leading-relaxed">
                              Appuyez sur le menu <strong className="text-white">Option ⋮ (les 3 points verticaux)</strong> en haut à droite de Chrome.
                            </p>
                          </div>

                          <div className="flex gap-3 items-start bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                            <div className="w-6 h-6 bg-slate-800 text-orange-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                              3
                            </div>
                            <p className="text-[10.5px] font-medium leading-relaxed">
                              Sélectionnez l'option <strong className="text-white font-bold">"Ajouter à l'écran d'accueil"</strong> ou <strong className="text-white font-bold">"Installer l'application"</strong>.
                            </p>
                          </div>

                          <div className="flex gap-3 items-start bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
                            <span className="text-sm">✨</span>
                            <p className="text-[10.5px] font-bold text-emerald-300 leading-relaxed">
                              Félicitations ! L'application s'installe en arrière-plan. Vous trouverez l'icône Aiprods sur votre écran d'accueil avec vos autres applications.
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
                          link.href = '/Aiprods_v2.6.apk';
                          link.download = 'Aiprods_v2.6.apk';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          openAlert(
                            "Téléchargement APK !",
                            "Le téléchargement de l'APK Aiprods a commencé. N'oubliez pas de désinstaller les anciennes versions de votre téléphone avant d'installer ce fichier !",
                            "success"
                          );
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all border border-slate-700 cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-orange-500" />
                        Télécharger le Fichier APK (Direct)
                      </button>
                      <p className="text-[9px] text-slate-500 leading-tight">
                        ⚠️ <strong className="text-amber-400">Rappel :</strong> Pour éviter l'erreur de package ou l'échec de l'installation, supprimez l'ancienne application <strong className="text-yellow-400">"AgroProfit"</strong> ou <strong className="text-yellow-400">"Aiprods"</strong> de votre appareil au préalable.
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
                          <div className="w-6 h-6 bg-slate-800 text-orange-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                            1
                          </div>
                          <p className="text-[10.5px] font-medium leading-relaxed">
                            Ouvrez obligatoirement l'application dans le navigateur officiel <strong className="text-orange-400">Safari</strong> de votre iPhone.
                          </p>
                        </div>

                        <div className="flex gap-3 items-start bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <div className="w-6 h-6 bg-slate-800 text-orange-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                            2
                          </div>
                          <p className="text-[10.5px] font-medium leading-relaxed">
                            Appuyez sur le bouton de <strong className="text-white">Partage 📤</strong> (l'icône de carré avec une flèche vers le haut, située au milieu en bas de votre écran Safari).
                          </p>
                        </div>

                        <div className="flex gap-3 items-start bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <div className="w-6 h-6 bg-slate-800 text-orange-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                            3
                          </div>
                          <p className="text-[10.5px] font-medium leading-relaxed">
                            Faites défiler le menu des options vers le bas et sélectionnez l'option <strong className="text-white font-bold">"Sur l'écran d'accueil"</strong> (ou "Ajouter sur l'écran d'accueil").
                          </p>
                        </div>

                        <div className="flex gap-3 items-start bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <div className="w-6 h-6 bg-slate-800 text-orange-500 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                            4
                          </div>
                          <p className="text-[10.5px] font-medium leading-relaxed">
                            Appuyez sur le bouton <strong className="text-orange-400 font-bold">"Ajouter"</strong> situé dans le coin supérieur droit.
                          </p>
                        </div>

                        <div className="flex gap-3 items-start bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
                          <span className="text-sm">✨</span>
                          <p className="text-[10.5px] font-bold text-emerald-300 leading-relaxed">
                            Terminé ! L'application Aiprods s'affiche sur l'écran d'accueil de votre iPhone. Ouvrez-la pour vous connecter normalement et en toute sécurité.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
              
              {/* Footer */}
              <div className="border-t border-slate-800 pt-4 mt-4 flex items-center justify-between">
                <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider">Aiprods © 2026</span>
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
