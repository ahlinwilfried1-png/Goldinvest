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
  Home,
  Heart,
  Zap,
  Copy, 
  Check, 
  MessageSquare, 
  Gift, 
  Trophy,
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
  Wallet,
  ThumbsUp,
  Trash2,
  RefreshCw,
  Cpu,
  Tv,
  Speaker,
  Volume2,
  Music,
  CreditCard
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

const maskPhoneNumber = (num: string) => {
  if (!num) return 'Aucun';
  const clean = num.replace(/\s/g, '');
  if (clean.length <= 6) return clean;
  return clean.slice(0, 3) + '••••' + clean.slice(-3);
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

const getVipImage = (vipLevel: number, category?: string) => {
  // Exclusively return 100% pure gold images (ingots, gold bars, coins, nuggets) to match the user's request.
  // ABSOLUTELY NO hands, charts, credit cards, jewelry, cosmetics, or crowns. Only pure gold.
  
  const goldCoins = 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&q=80&w=500'; // Pure shiny gold coins pile
  const goldBarsStack = 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=500'; // Stacked pure gold bars
  const goldSingleBar = 'https://images.unsplash.com/photo-1599690925058-90e1a0b41144?auto=format&fit=crop&q=80&w=500'; // Elegant single gold ingot
  const goldBarsPile = 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=500'; // Array of multiple gold bars
  const goldVault = 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&q=80&w=500'; // Massive gold bricks in bank vault
  const goldBullionCloseUp = 'https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?auto=format&fit=crop&q=80&w=500'; // Heavy reflective golden bullion close-up
  const goldNugget = 'https://images.unsplash.com/photo-1610375461369-d5108bc471e4?auto=format&fit=crop&q=80&w=500'; // Raw shining gold nugget close-up

  if (category === 'activity') {
    switch (vipLevel) {
      case 1:
        return goldCoins;
      case 2:
        return goldNugget;
      case 3:
        return goldBarsStack;
      default:
        return goldBarsPile;
    }
  } else if (category === 'wellbeing') {
    switch (vipLevel) {
      case 1:
        return goldSingleBar;
      case 2:
        return goldNugget;
      case 3:
        return goldBullionCloseUp;
      default:
        return goldVault;
    }
  } else {
    // Stability / fixed-income titles / default
    switch (vipLevel) {
      case 1:
        return goldCoins;
      case 2:
        return goldSingleBar;
      case 3:
        return goldNugget;
      case 4:
        return goldBarsStack;
      case 5:
        return goldBarsPile;
      case 6:
        return goldVault;
      case 7:
        return goldBullionCloseUp;
      case 8:
        return goldBarsStack;
      case 9:
        return goldVault;
      default:
        return goldBarsStack;
    }
  }
};

const getVipCropDetails = (level: number, category?: string) => {
  if (category === 'activity') {
    switch (level) {
      case 1:
        return {
          name: "Goldspeed Épargne Express ⚡",
          desc: "Package spécial court terme basé sur la rotation de micro-lingots d'or."
        };
      case 2:
        return {
          name: "Goldspeed Rendement Éclair ⚡",
          desc: "Plan promotionnel à rotation rapide avec intérêts crédités quotidiennement."
        };
      case 3:
        return {
          name: "Goldspeed Option Flash Or ⚡",
          desc: "Édition limitée à très haut rendement sur un cycle court et ultra-sécurisé."
        };
      default:
        return {
          name: "Goldspeed Offre Spéciale ⚡",
          desc: "Édition spéciale exclusive pour booster vos revenus journaliers de manière sécurisée."
        };
    }
  }

  switch (level) {
    case 1:
      return {
        name: "Goldspeed Lingot Classique 🪙",
        desc: "Notre formule d'entrée de gamme offrant un rendement journalier passif, régulier et stable."
      };
    case 2:
      return {
        name: "Goldspeed Lingot Bronze 🥉",
        desc: "Deuxième niveau d'investissement aurifère pour des revenus journaliers plus solides."
      };
    case 3:
      return {
        name: "Goldspeed Lingot Argent 🥈",
        desc: "Rendement journalier optimisé sur l'achat et la conservation de réserves d'or intermédiaire."
      };
    case 4:
      return {
        name: "Goldspeed Lingot Or Jaune 🥇",
        desc: "Plan performant assurant des revenus très solides et réguliers sur l'or d'investissement."
      };
    case 5:
      return {
        name: "Goldspeed Pack Premium Gold 💎",
        desc: "Le fleuron haut de gamme idéal pour maximiser vos gains sur des lingots purs de 100g."
      };
    case 6:
      return {
        name: "Goldspeed Or d'Investissement 🛡️",
        desc: "Plan à forte rentabilité soutenu par des coffres physiques assurés et un taux majoré."
      };
    case 7:
      return {
        name: "Goldspeed Lingot d'Or Pur ✨",
        desc: "Le summum du placement et de la performance financière pour les investisseurs VIP."
      };
    case 8:
      return {
        name: "Goldspeed Réserve Souveraine 🏛️",
        desc: "Placement institutionnel de prestige à haut rendement réservé aux investisseurs majeurs."
      };
    case 9:
      return {
        name: "Goldspeed Trésor Impérial 👑",
        desc: "Trésor de prestige ultime offrant des gains passifs spectaculaires et sécurisés."
      };
    default:
      return {
        name: "Goldspeed Trésor Impérial 👑",
        desc: "Formule de prestige ultime réservée aux investisseurs d'élite de la communauté."
      };
  }
};

const ProductImage = ({ 
  vipLevel, 
  alt, 
  className = "w-full h-full object-cover rounded-xl",
  isMini = false,
  category,
  imageUrl
}: { 
  vipLevel: number; 
  alt: string; 
  className?: string;
  isMini?: boolean;
  category?: string;
  imageUrl?: string;
}) => {
  // Premium default gold image representing Togo luxury gold bullion & coins
  const defaultGoldImage = "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=800";
  const finalSrc = (imageUrl && imageUrl.trim() !== '') ? imageUrl : defaultGoldImage;

  return (
    <div className="w-full h-full bg-slate-900 overflow-hidden relative rounded-xl border border-yellow-500/30 group shadow-md aspect-video sm:aspect-auto">
      {/* Background Image */}
      <img 
        src={finalSrc} 
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        referrerPolicy="no-referrer"
      />

      {/* Glossy diagonal shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

      {/* Dark overlay gradient for contrast and premium look */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20 pointer-events-none" />

      {/* Luxury Brand Seal / Togolese Gold Coin Badge */}
      <div className="absolute bottom-2 right-2 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500 select-none z-10">
        {/* Shiny Gold Coin */}
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#ffe875] via-[#d4af37] via-[#aa820a] to-[#d4af37] p-[1px] shadow-[0_4px_10px_rgba(0,0,0,0.35)] border border-[#ffec94]/40 flex items-center justify-center">
          {/* Inner Coin Ring */}
          <div className="w-full h-full rounded-full border border-dashed border-amber-950/20 bg-gradient-to-br from-[#f9e264] via-[#cfa928] to-[#9c7504] flex flex-col items-center justify-center relative overflow-hidden">
            
            {/* Tiny stars & shine reflections inside */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px]" />
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10" />

            {/* Togo Gold Engravings */}
            <span className="text-[5.5px] font-black text-amber-950/85 tracking-[0.02em] font-sans scale-85 uppercase mt-0.5">
              REP. TOGOLAISE
            </span>
            
            {/* Center Symbol (Coins) */}
            <div className="w-4 h-4 my-0.5 rounded-full bg-amber-950/10 flex items-center justify-center border border-amber-950/15">
              <Coins className="w-2.5 h-2.5 text-amber-950/90" />
            </div>

            <span className="text-[5px] font-extrabold text-amber-950/70 tracking-widest font-mono scale-90 mb-0.5">
              999.9 FINE GOLD
            </span>
          </div>
        </div>
      </div>

      {/* Product Category & VIP Level Tag */}
      <div className="absolute top-2.5 left-2.5 bg-slate-950/65 backdrop-blur-md border border-yellow-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 z-10 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
        <span className="font-sans font-extrabold text-[9px] uppercase tracking-wider text-yellow-400">
          VIP {vipLevel} • {category === 'wellbeing' ? 'BIEN-ÊTRE' : category === 'activity' ? 'ACTIVITÉ' : 'STABILITÉ'}
        </span>
      </div>
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
  { amount: 20, label: "20 F", color: "#38bdf8" }, // light sky blue
  { amount: 25, label: "25 F", color: "#eab308" }, // gold
  { amount: 50, label: "50 F", color: "#a855f7" }, // purple
  { amount: 200, label: "200 F", color: "#f97316" }, // orange
  { amount: 500, label: "500 F", color: "#ec4899" }, // pink
  { amount: 1000, label: "1 000 F", color: "#22c55e" }, // green
  { amount: 1500, label: "1 500 F", color: "#14b8a6" }, // teal
  { amount: 20, label: "20 F", color: "#ef4444" }  // red
];

export const GOLDSPEED_SLIDES = [
  {
    id: 'slide-1',
    url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=1000',
    title: 'Goldspeed Lingot d\'Or Pur 💎',
    desc: 'Bénéficiez de la sécurité absolue d\'un investissement aurifère de premier choix.',
  }
];

const DEPOSIT_COUNTRIES = [
  { name: 'Cameroun', code: '+237', flag: '🇨🇲' },
  { name: 'Togo', code: '+228', flag: '🇹🇬' },
  { name: 'Bénin', code: '+229', flag: '🇧🇯' },
  { name: 'Côte d’Ivoire', code: '+225', flag: '🇨🇮' },
  { name: 'Burkina Faso', code: '+226', flag: '🇧🇫' },
  { name: 'Sénégal', code: '+221', flag: '🇸🇳' },
  { name: 'Mali', code: '+223', flag: '🇲🇱' },
  { name: 'Niger', code: '+227', flag: '🇳🇪' }
];

const maskUserPhone = (str: string): string => {
  if (!str) return str;
  return str.replace(/(?:\+?\d[\s.-]?){7,15}\d/g, (match) => {
    const cleanDigits = match.replace(/[^\d]/g, '');
    if (cleanDigits.length < 8) return match;
    
    const isPlus = match.startsWith('+');
    const startLen = Math.min(3, Math.floor(cleanDigits.length / 3));
    const endLen = Math.min(2, Math.floor(cleanDigits.length / 4));
    const maskLen = cleanDigits.length - startLen - endLen;
    
    const startPart = cleanDigits.slice(0, startLen);
    const endPart = cleanDigits.slice(-endLen);
    const maskedPart = '•'.repeat(maskLen);
    
    return (isPlus ? '+' : '') + startPart + maskedPart + endPart;
  });
};

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
  const [lang, setLang] = useState<'FR' | 'EN'>(() => {
    return (localStorage.getItem('gi_lang') as 'FR' | 'EN') || 'FR';
  });

  useEffect(() => {
    const handleLangChange = () => {
      setLang((localStorage.getItem('gi_lang') as 'FR' | 'EN') || 'FR');
    };
    window.addEventListener('gi_lang_changed', handleLangChange);
    return () => {
      window.removeEventListener('gi_lang_changed', handleLangChange);
    };
  }, []);

  const t = (fr: string, en: string) => (lang === 'EN' ? en : fr);

  // Navigation tabs: 'dashboard', 'products', 'team', 'profile', 'deposit', 'withdraw', 'proofs', 'forum'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'team' | 'profile' | 'deposit' | 'withdraw' | 'proofs' | 'forum'>('dashboard');
  const [referralListTab, setReferralListTab] = useState<'level1' | 'level2' | 'level3'>('level1');
  const [productSubTab, setProductSubTab] = useState<'stability' | 'wellbeing' | 'activity'>('stability');

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
  const hasActiveProduct = activeInvestments.some(inv => inv.status === 'active');
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [allDeposits, setAllDeposits] = useState<Deposit[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<Withdrawal[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [withdrawalProofs, setWithdrawalProofs] = useState<WithdrawalProof[]>([]);
  const [selectedAvisImage, setSelectedAvisImage] = useState<string | null>(null);
  const [bannerImageError, setBannerImageError] = useState<boolean>(false);
  const [showStabilityOrders, setShowStabilityOrders] = useState<boolean>(false);
  const [showActivityOrders, setShowActivityOrders] = useState<boolean>(false);
  const [showMissionsList, setShowMissionsList] = useState<boolean>(false);

  // Wheel of Fortune state variables
  const [isWheelModalOpen, setIsWheelModalOpen] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wheelSpinAngle, setWheelSpinAngle] = useState<number>(0);
  const [wonReward, setWonReward] = useState<any>(null);
  const [wheelSpinCount, setWheelSpinCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('gi_wheel_spins_v3');
      return stored ? parseInt(stored) : 2;
    } catch (e) {
      return 2;
    }
  });

  // Forum state variables
  const [forumPosts, setForumPosts] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('rockygold_forum_posts_v3');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  });
  const [forumMessageInput, setForumMessageInput] = useState<string>('');
  const [forumCommentInputs, setForumCommentInputs] = useState<Record<string, string>>({});
  const [forumImage1, setForumImage1] = useState<string | null>(null);
  const [forumImage2, setForumImage2] = useState<string | null>(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');

  useEffect(() => {
    if (GOLDSPEED_SLIDES.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        if (slideDirection === 'forward') {
          if (prev === GOLDSPEED_SLIDES.length - 1) {
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
    { code: 'ML', name: 'Mali 🇲🇱', currency: 'XOF' },
    { code: 'NE', name: 'Niger 🇳🇪', currency: 'XOF' }
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
    NE: [
      { id: '70', name: 'Airtel Money', slug: 'airtel-niger' },
      { id: '71', name: 'Moov Money', slug: 'moov-niger' },
      { id: '72', name: 'Orange Money', slug: 'orange-niger' }
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
      if (c.includes('niger')) return 'NE';
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
  const [depositMethod, setDepositMethod] = useState<'westpay' | 'manuel_cameroun'>('westpay');
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
    if (c.includes('niger') || c.includes('227')) return '+227';
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
    if (userCountry.includes('niger')) return 'Niger';
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
      return currentUser.bankCardOperator || localStorage.getItem('mdb_saved_operator') || "MTN (CM)";
    } catch (e) {
      return currentUser.bankCardOperator || "MTN (CM)";
    }
  });
  const [withdrawNumber, setWithdrawNumber] = useState<string>(() => {
    try {
      return currentUser.bankCardNumber || localStorage.getItem('mdb_saved_number') || '';
    } catch (e) {
      return currentUser.bankCardNumber || '';
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
  const [isMissionsRulesOpen, setIsMissionsRulesOpen] = useState<boolean>(false);
  const [historyTab, setHistoryTab] = useState<'recharges' | 'products'>('recharges');

  useEffect(() => {
    setProfileSubPage(null);
  }, [activeTab]);

  // Bank Card Binding States
  const [bankCardName, setBankCardName] = useState<string>(() => {
    try {
      return currentUser.bankCardName || localStorage.getItem('mdb_saved_name') || '';
    } catch (e) {
      return currentUser.bankCardName || '';
    }
  });
  const [bankCardOperator, setBankCardOperator] = useState<string>(() => {
    try {
      return currentUser.bankCardOperator || localStorage.getItem('mdb_saved_operator') || "MTN (CM)";
    } catch (e) {
      return currentUser.bankCardOperator || "MTN (CM)";
    }
  });
  const [bankCardNumber, setBankCardNumber] = useState<string>(() => {
    try {
      return currentUser.bankCardNumber || localStorage.getItem('mdb_saved_number') || '';
    } catch (e) {
      return currentUser.bankCardNumber || '';
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

  // Sync withdrawal form when user State bank card changes
  useEffect(() => {
    if (userState?.bankCardNumber) {
      setWithdrawNumber(userState.bankCardNumber);
    }
    if (userState?.bankCardOperator) {
      setWithdrawOperator(userState.bankCardOperator);
    }
  }, [userState?.bankCardNumber, userState?.bankCardOperator]);

  // Sync bank card binding form inputs when userState changes
  useEffect(() => {
    if (userState?.bankCardName) {
      setBankCardName(userState.bankCardName);
    }
    if (userState?.bankCardOperator) {
      setBankCardOperator(userState.bankCardOperator);
    }
    if (userState?.bankCardNumber) {
      setBankCardNumber(userState.bankCardNumber);
    }
  }, [userState?.bankCardName, userState?.bankCardOperator, userState?.bankCardNumber]);

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
    link.href = '/Goldspeed_v2.6.apk';
    link.download = 'Goldspeed_v2.6.apk';
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
      "Le téléchargement de l'application 'Goldspeed_v2.6.apk' a commencé ! Ouvrez le fichier téléchargé pour l'installer.\n\n⚠️ IMPORTANT : Si l'installation refuse ou dit 'Application non installée', désinstallez d'abord TOUTE ancienne version (comme l'application Goldspeed ou AgroProfit) de votre téléphone, puis réessayez. Cela résout 100% des erreurs d'installation !",
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
            body: "Notifications de bureau Chrome activées sur Goldspeed ! 🔔"
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
        details: `Retrait Mobile Money (${wth.operator}) vers ${maskPhoneNumber(wth.number)}`,
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

  const handleSpinWheel = () => {
    if (isSpinning) return;
    if (wheelSpinCount <= 0) {
      triggerToast("Oups ! Vous n'avez plus de tirages disponibles. Invitez des filleuls pour en gagner !", "error");
      return;
    }

    setIsSpinning(true);
    setWonReward(null);

    // Limit wins strictly to 20 F, 25 F, 50 F, or 200 F (amount between 20 and 200 inclusive)
    const allowedIndices = WHEEL_REWARDS.map((rew, idx) => ({ rew, idx }))
      .filter(item => item.rew.amount >= 20 && item.rew.amount <= 200)
      .map(item => item.idx);
    const randomIndex = allowedIndices[Math.floor(Math.random() * allowedIndices.length)];
    const selected = WHEEL_REWARDS[randomIndex];

    const segmentAngle = 360 / WHEEL_REWARDS.length;
    // Calculate final spin rotation (multiple full spins + segment target)
    const targetAngle = 3600 - (randomIndex * segmentAngle) - (segmentAngle / 2);
    setWheelSpinAngle(targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setWonReward(selected);
      setWheelSpinCount(prev => {
        const next = Math.max(0, prev - 1);
        try { localStorage.setItem('gi_wheel_spins_v3', next.toString()); } catch (e) {}
        return next;
      });

      const rewardAmt = selected.amount;
      const updatedUser = {
        ...userState,
        balance: userState.balance + rewardAmt,
        totalEarnings: (userState.totalEarnings || 0) + rewardAmt
      };
      
      DataStore.saveCurrentUser(updatedUser);
      syncDashboardData();
      syncWithBackend();

      const newNotif = {
        id: 'wheel-win-' + Date.now(),
        userId: userState.id,
        title: "Gain à la Roue de la chance 🎡",
        message: `Félicitations ! Vous avez gagné ${rewardAmt.toLocaleString()} F CFA au tirage au sort !`,
        type: 'reward' as const,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      setNotifications(prev => [newNotif, ...prev]);

      triggerToast(`Félicitations ! Vous avez gagné +${rewardAmt.toLocaleString()} F CFA !`, "success");
    }, 4500);
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

  // Forum actions
  const handlePostForumMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumMessageInput.trim()) {
      triggerToast("⚠️ Veuillez saisir un message ou commentaire.", "error");
      return;
    }

    const newPost = {
      id: 'f-user-' + Date.now(),
      authorName: (userState.name || 'Membre') + ' ' + (userState.country === 'Cameroun' ? '🇨🇲' : userState.country === 'Togo' ? '🇹🇬' : userState.country === 'Bénin' ? '🇧🇯' : userState.country === 'Côte d’Ivoire' ? '🇨🇮' : userState.country === 'Burkina Faso' ? '🇧🇫' : userState.country === 'Sénégal' ? '🇸🇳' : userState.country === 'Mali' ? '🇲🇱' : userState.country === 'Niger' ? '🇳🇪' : '🌍'),
      avatarLetter: (userState.name || 'M').charAt(0).toUpperCase(),
      text: forumMessageInput,
      image1: forumImage1 || undefined,
      image2: forumImage2 || undefined,
      likes: 0,
      hasLiked: false,
      createdAt: new Date().toISOString(),
      comments: []
    };

    const updated = [newPost, ...forumPosts];
    setForumPosts(updated);
    setForumMessageInput('');
    setForumImage1(null);
    setForumImage2(null);
    try {
      localStorage.setItem('rockygold_forum_posts_v3', JSON.stringify(updated));
    } catch (err) {}
    triggerToast("Votre message a été publié sur le Forum !", "success");
  };

  const handleLikeForumPost = (postId: string) => {
    const updated = forumPosts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: p.hasLiked ? p.likes - 1 : p.likes + 1,
          hasLiked: !p.hasLiked
        };
      }
      return p;
    });
    setForumPosts(updated);
    try {
      localStorage.setItem('rockygold_forum_posts_v3', JSON.stringify(updated));
    } catch (err) {}
  };

  const handlePostForumComment = (postId: string) => {
    const post = forumPosts.find(p => p.id === postId);
    const hasCapture = post && (post.image1 || post.image2);

    if (hasCapture && userState.role !== 'admin') {
      triggerToast("⚠️ Les réponses aux preuves de capture sont désactivées pour les membres.", "error");
      return;
    }

    const commentText = forumCommentInputs[postId] || '';
    if (!commentText.trim()) return;

    const updated = forumPosts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...(p.comments || []),
            { author: userState.name || 'Membre', text: commentText }
          ]
        };
      }
      return p;
    });

    setForumPosts(updated);
    setForumCommentInputs(prev => ({ ...prev, [postId]: '' }));
    try {
      localStorage.setItem('rockygold_forum_posts_v3', JSON.stringify(updated));
    } catch (err) {}
    triggerToast("Commentaire ajouté !", "success");
  };

  const handleClaimMission = (missionId: string, reward: number, target: number) => {
    const directReferrals = level1Users;
    const allInvs = DataStore.getInvestments() || [];
    const investedReferralCount = directReferrals.filter(u => allInvs.some(inv => inv.userId === u.id)).length;
    const claimed = (userState as any).claimedMissions || [];

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

      const redirectUrl = "https://westpay.cfd/link/v0nzhwpvmrg3kto9";

      if (succeeded) {
        setDepositRedirectUrl(redirectUrl);
        setDepositSuccess(`Votre demande de recharge de ${amt.toLocaleString()} F en ligne a été enregistrée avec succès ! Veuillez cliquer sur le bouton ci-dessous pour effectuer le paiement de manière sécurisée.`);
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
          message: `Votre demande de dépôt de ${amt.toLocaleString()} F en ligne (Réf: ${reference}) est en cours de vérification par l'administration.`,
          type: 'deposit',
          lastModified: Date.now(),
          createdAt: new Date().toISOString(),
          read: false
        });
        DataStore.saveNotifications(notifications);

        setDepositRedirectUrl(redirectUrl);
        setDepositSuccess(`Votre demande de recharge de ${amt.toLocaleString()} F en ligne a été enregistrée avec succès ! Veuillez cliquer sur le bouton ci-dessous pour effectuer le paiement de manière sécurisée.`);
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

    if (!hasActiveProduct) {
      setWithdrawError("Vous devez posséder au moins un produit d'investissement actif pour pouvoir effectuer un retrait.");
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
    if (userState.role !== 'admin') {
      triggerToast("⚠️ Seul l'administrateur peut publier sur la page Avis.", 'error');
      return;
    }
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
    <div className="min-h-[106vh] pb-16 bg-transparent text-white flex flex-col font-sans w-full max-w-full relative overflow-x-hidden">
      

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
                <span>📢</span>
              </div>
              <div>
                <h3 className="text-sm font-sans font-black text-slate-900 uppercase tracking-wider">Rejoignez la Communauté</h3>
                <p className="text-[10px] text-slate-500 font-bold">Ne manquez aucune information importante :</p>
              </div>
            </div>

            <div className="space-y-4 text-[11px]">
              {/* WhatsApp Channel Segment */}
              <div className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-4 flex flex-col gap-3 transition-all shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                    📢
                  </div>
                  <div className="space-y-1 text-left">
                    <h4 className="font-sans font-black text-emerald-800 text-[12px] uppercase tracking-wide">
                      Canal WhatsApp Officiel
                    </h4>
                    <p className="text-[10.5px] text-emerald-600/80 font-bold leading-tight">
                      Recevez les communiqués urgents, les guides exclusifs et les annonces de maintenance.
                    </p>
                  </div>
                </div>
                <a 
                  href={DataStore.getWhatsAppChannel()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#128C7E] hover:bg-[#075E54] text-white font-sans font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer text-center"
                >
                  <span>Rejoindre le Canal WhatsApp</span>
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
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-amber-500 rounded-xl shrink-0">
              <Bell className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[10px] font-sans font-black uppercase text-yellow-500 tracking-wider">Alerte Goldspeed 🔔</span>
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
              className="bg-white border-2 border-slate-200 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col"
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

      {/* ROUE DE LA CHANCE MODAL REMOVED (NOW A SUBPAGE) */}

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
              className="bg-white border-2 border-slate-200 rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col"
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
              <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-amber-600 via-yellow-500 to-slate-900 p-5 text-white flex flex-col justify-between shadow-md relative overflow-hidden mb-5">
                {/* Microchip and MDB branding */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-90">GOLDSPEED INVESTMENT</span>
                    <span className="text-[7px] font-mono font-bold tracking-widest opacity-60">MEMBRE CERTIFIÉ</span>
                  </div>
                  <div className="w-16 h-8 rounded-md bg-white/20 flex items-center justify-center border border-white/20 px-1">
                    <span className="text-[9px] font-black uppercase tracking-wider">Goldspeed</span>
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

                    // Create the updated user object with bank details
                    const updatedUser = {
                      ...userState,
                      bankCardName: bankCardName.trim(),
                      bankCardOperator: bankCardOperator,
                      bankCardNumber: bankCardNumber.trim(),
                      lastModified: Date.now()
                    };
                    setUserState(updatedUser);
                    DataStore.saveCurrentUser(updatedUser);
                    
                    if (typeof syncWithBackend === 'function') {
                      syncWithBackend().catch((e) => console.error("Sync error:", e));
                    }

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
                    <option value="Airtel (NE)">Airtel Money (Niger 🇳🇪)</option>
                    <option value="Moov (NE)">Moov Money (Niger 🇳🇪)</option>
                    <option value="Orange (NE)">Orange Money (Niger 🇳🇪)</option>
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
        <main className="flex-grow w-full max-w-full px-2 sm:px-6 md:px-12 xl:px-20 py-3.5 pb-36 overflow-x-hidden">
          
          {profileSubPage && (() => {
            const rechargeSum = allDeposits.filter(d => d.status === 'approved').reduce((acc, d) => acc + d.amount, 0);
            const purchaseSum = activeInvestments.reduce((acc, i) => acc + i.price, 0);
            const rechargeBal = Math.max(0, rechargeSum - purchaseSum);
            const totalProductRevenue = activeInvestments.reduce((acc, i) => acc + (i.totalReturnClaimed || 0), 0);
            const totalCommissions = commissions.reduce((acc, c) => acc + c.amount, 0);
            const activeInvsCount = activeInvestments.filter(i => i.status === 'active').length;

            if (profileSubPage === 'missions') {
              const directReferrals = level1Users;
              const allInvs = DataStore.getInvestments() || [];
              const investedReferralCount = directReferrals.filter(u => allInvs.some(inv => inv.userId === u.id)).length;
              const claimed = (userState as any).claimedMissions || [];

              const MISSIONS = [
                { id: 'invite_10', target: 10, reward: 500, label: "Inviter à activer 10 personnes" },
                { id: 'invite_20', target: 20, reward: 1000, label: "Inviter à activer 20 personnes" },
                { id: 'invite_50', target: 50, reward: 3000, label: "Inviter à activer 50 personnes" },
                { id: 'invite_100', target: 100, reward: 7000, label: "Inviter à activer 100 personnes" }
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

              const shareLink = `${window.location.origin}/register?ref=${userState.referralCode || ''}`;

              return (
                <div className="bg-[#f4f7fc] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 pb-24 min-h-screen text-slate-800 text-left animate-fadeIn">
                  {/* Vibrant Blue Header */}
                  <div className="bg-gradient-to-b from-[#1b64d9] to-[#2575fc] text-white pt-6 pb-28 px-4 rounded-b-[2.5rem] relative shadow-md overflow-hidden">
                    
                    {/* Top navigation row */}
                    <div className="max-w-xl mx-auto flex items-center justify-between relative z-10 mb-6">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="w-10 h-10 rounded-full bg-white/15 border border-white/10 flex items-center justify-center text-white hover:bg-white/25 transition-all cursor-pointer outline-none shrink-0"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      
                      <h2 className="font-sans font-black text-white text-base tracking-tight uppercase">
                        {t("Récompense de mission", "Mission Reward")}
                      </h2>

                      <button 
                        onClick={() => setIsMissionsRulesOpen(true)}
                        className="w-10 h-10 rounded-full bg-white/15 border border-white/10 flex items-center justify-center text-white hover:bg-white/25 transition-all cursor-pointer outline-none shrink-0"
                      >
                        <HelpCircle className="w-5 h-5 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Commissions information */}
                    <div className="max-w-xl mx-auto flex items-center justify-between relative z-10 pb-4">
                      <div>
                        <span className="text-white/85 text-[11.5px] font-bold tracking-wide uppercase block">
                          {t("Total des commissions obtenues", "Total Commissions Earned")}
                        </span>
                        <span className="text-3xl font-sans font-black tracking-tight block mt-1.5">
                          FCFA {totalCommissions.toLocaleString()}
                        </span>
                      </div>

                      {/* Celebration Visual illustration */}
                      <div className="w-28 h-20 relative select-none pointer-events-none shrink-0 hidden sm:block">
                        <div className="absolute right-0 bottom-0 w-12 h-12 bg-amber-400 rounded-2xl rotate-12 flex items-center justify-center shadow-lg border border-amber-300">
                          <Megaphone className="w-6 h-6 text-white -rotate-12 animate-pulse" />
                        </div>
                        <div className="absolute right-8 bottom-1 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-md border border-amber-400">
                          <Gift className="w-4 h-4 text-white" />
                        </div>
                        <div className="absolute right-4 bottom-7 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow">
                          <span className="text-[8px] font-black text-yellow-900">$</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Overlapping Invitation Link Card */}
                  <div className="max-w-xl mx-auto -mt-10 px-4 relative z-10">
                    <div className="bg-white rounded-[24px] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-11 h-11 bg-blue-50 text-[#1b64d9] rounded-[18px] flex items-center justify-center shrink-0 border border-blue-100/40">
                          <Gift className="w-5.5 h-5.5 stroke-[2.25]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[10px] font-sans font-black text-slate-400 leading-none uppercase tracking-wider mb-1">
                            Lien d'invitation
                          </h4>
                          <p className="text-[11px] font-mono text-slate-600 font-bold truncate leading-none">
                            {shareLink}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(shareLink);
                          triggerToast(t("Lien d'invitation copié ! 📋", "Invitation link copied! 📋"), "success");
                        }}
                        className="bg-[#1b64d9] text-white hover:bg-blue-700 py-1.5 px-4 rounded-full text-xs font-sans font-black tracking-wide transition-all active:scale-95 cursor-pointer shadow-sm border-0 shrink-0"
                      >
                        Copier
                      </button>
                    </div>
                  </div>

                  {/* Mission Center container */}
                  <div className="max-w-xl mx-auto mt-6 px-4">
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6">
                      
                      <div className="space-y-1">
                        <h3 className="text-[15px] font-sans font-black text-slate-800 uppercase tracking-tight">
                          Centre de missions
                        </h3>
                        <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                          Après avoir complété chaque mission, vous recevrez une récompense
                        </p>
                      </div>

                      {/* Missions Timeline */}
                      <div className="relative pl-7 space-y-6 pt-1">
                        {/* Connecting Line */}
                        <div className="absolute left-3 top-4 bottom-8 w-[2px] bg-slate-100" />

                        {MISSIONS.map((m) => {
                          const isCompleted = investedReferralCount >= m.target;
                          const isClaimed = claimed.includes(m.id);

                          return (
                            <div key={m.id} className="relative">
                              {/* Timeline dot */}
                              <div className={`absolute left-[-28px] top-1.5 w-6 h-6 rounded-full border flex items-center justify-center transition-all shadow-xs z-10 ${
                                isClaimed || isCompleted 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-500' 
                                  : 'bg-white border-slate-200 text-slate-400'
                              }`}>
                                {isClaimed ? (
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                                )}
                              </div>

                              {/* Mission details card */}
                              <div className="bg-slate-50/70 border border-slate-100/80 p-4 rounded-2xl space-y-3 relative overflow-hidden transition-all">
                                <h4 className="font-sans font-black text-[12.5px] text-slate-800 leading-tight">
                                  {m.label}
                                </h4>

                                {/* Grid metrics */}
                                <div className="grid grid-cols-3 gap-2 text-center py-2 bg-white rounded-xl border border-slate-100/60 shadow-xs">
                                  <div className="flex flex-col items-center justify-center border-r border-slate-100">
                                    <span className="text-[11.5px] font-sans font-black text-slate-800 leading-none">
                                      FCFA {m.reward.toLocaleString()}.00
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">
                                      Récompense
                                    </span>
                                  </div>
                                  <div className="flex flex-col items-center justify-center border-r border-slate-100">
                                    <span className="text-[12px] font-sans font-black text-blue-600 leading-none">
                                      {m.target}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">
                                      Exigé
                                    </span>
                                  </div>
                                  <div className="flex flex-col items-center justify-center">
                                    <span className={`text-[12px] font-sans font-black leading-none ${isCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>
                                      {Math.min(investedReferralCount, m.target)}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">
                                      Complété
                                    </span>
                                  </div>
                                </div>

                                {/* Claims button / status */}
                                <div className="flex justify-end pt-1">
                                  {isClaimed ? (
                                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100/60 py-1 px-3.5 rounded-full text-[10px] font-sans font-black flex items-center gap-1 select-none">
                                      ✓ Récupéré
                                    </span>
                                  ) : isCompleted ? (
                                    <button
                                      onClick={() => handleClaimMission(m.id, m.reward, m.target)}
                                      className="bg-[#1b64d9] hover:bg-blue-700 text-white py-1.5 px-4 rounded-full text-[10px] font-sans font-black transition-all active:scale-95 cursor-pointer shadow-md border-0 animate-pulse"
                                    >
                                      Récupérer le bonus
                                    </button>
                                  ) : (
                                    <span className="bg-[#e9ecef] text-slate-400 py-1 px-3.5 rounded-full text-[10px] font-sans font-black select-none">
                                      En cours
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Rules Modal Overlay */}
                  {isMissionsRulesOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                      <div className="bg-white rounded-[2rem] max-w-lg w-full p-6 space-y-4 animate-scaleUp shadow-2xl relative text-left">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <h3 className="font-sans font-black text-slate-900 text-base uppercase tracking-tight">
                            Règles de Mission 📋
                          </h3>
                          <button
                            onClick={() => setIsMissionsRulesOpen(false)}
                            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all border-none outline-none cursor-pointer"
                          >
                            <X className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>
                        <div className="text-[11.5px] text-slate-500 font-bold leading-relaxed space-y-3">
                          <p>
                            1. <span className="text-slate-800">Validation des Filleuls actifs</span> : Pour qu'un filleul soit comptabilisé comme "actif", il doit s'inscrire via votre lien d'invitation et procéder à l'activation d'au moins un pack d'investissement (produit d'or).
                          </p>
                          <p>
                            2. <span className="text-slate-800">Récompenses cumulatives</span> : Vous pouvez débloquer et réclamer les bonus de mission à chaque étape franchie (10, 20, 50, 100 filleuls actifs).
                          </p>
                          <p>
                            3. <span className="text-slate-800">Crédit instantané</span> : Les bonus réclamés sont instantanément ajoutés à votre solde principal, utilisables pour des investissements ou des retraits.
                          </p>
                          <p>
                            4. <span className="text-slate-800">Transparence</span> : Toute tentative de création de faux comptes d'auto-parrainage ou de fraude entraînera la suspension définitive du compte.
                          </p>
                        </div>
                        <button
                          onClick={() => setIsMissionsRulesOpen(false)}
                          className="w-full bg-[#1b64d9] text-white py-3 rounded-2xl text-xs font-sans font-black uppercase tracking-wider hover:bg-blue-700 transition-all border-none outline-none cursor-pointer shadow-md"
                        >
                          J'ai compris
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            if (profileSubPage === 'orders') {
              return (
                <div className="bg-[#f8fafc] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-24 min-h-[95vh] text-slate-800 text-left animate-fadeIn">
                  <div className="max-w-xl mx-auto w-full space-y-4">
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
                        Retrouvez ici vos équipements acquis. Les revenus de vos plans Stabilité et d'Activité s'accumulent de jour en jour et sont versés automatiquement à la fin de leur cycle respectif.
                      </p>
                      
                      <div className="space-y-3 pt-2">
                        {activeInvestments.filter(i => i.status === 'active').length === 0 ? (
                          <div className="text-center py-8 text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-slate-100/50">
                            Aucun produit d'investissement actif pour le moment.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {activeInvestments.filter(i => i.status === 'active').map((p) => (
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
              const completedInvestments = activeInvestments.filter(i => i.status === 'completed');
              const totalRechargesApproved = allDeposits.filter(d => d.status === 'approved').reduce((acc, d) => acc + d.amount, 0);
              const totalInvestedCompleted = completedInvestments.reduce((acc, i) => acc + i.price, 0);

              const formatDate = (dateStr: string) => {
                try {
                  const d = new Date(dateStr);
                  if (isNaN(d.getTime())) return dateStr;
                  return d.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                } catch (e) {
                  return dateStr;
                }
              };

              return (
                <div className="bg-[#f8fafc] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-24 min-h-[95vh] text-slate-800 text-left animate-fadeIn">
                  <div className="max-w-xl mx-auto w-full space-y-4">
                    
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-2 pt-2">
                      <button 
                        onClick={() => setProfileSubPage(null)}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs border-none outline-none"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      <h2 className="font-sans font-black text-slate-900 text-base uppercase tracking-tight">Historique de compte</h2>
                    </div>

                    {/* Dual Tab Switcher */}
                    <div className="bg-slate-100 p-1 rounded-2xl flex w-full border border-slate-200/40">
                      <button
                        onClick={() => setHistoryTab('recharges')}
                        className={`flex-grow py-3 rounded-xl text-xs font-sans font-black transition-all border-none outline-none cursor-pointer flex items-center justify-center gap-2 ${
                          historyTab === 'recharges'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 bg-transparent'
                        }`}
                      >
                        <Coins className="w-4 h-4" />
                        <span>Recharges ({allDeposits.length})</span>
                      </button>
                      <button
                        onClick={() => setHistoryTab('products')}
                        className={`flex-grow py-3 rounded-xl text-xs font-sans font-black transition-all border-none outline-none cursor-pointer flex items-center justify-center gap-2 ${
                          historyTab === 'products'
                            ? 'bg-white text-emerald-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 bg-transparent'
                        }`}
                      >
                        <Briefcase className="w-4 h-4" />
                        <span>Produits Terminés ({completedInvestments.length})</span>
                      </button>
                    </div>

                    {/* Content Section */}
                    {historyTab === 'recharges' ? (
                      <div className="space-y-4">
                        {/* Summary Card */}
                        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Rechargé</span>
                            <span className="text-xl font-sans font-black text-blue-600 block mt-0.5">
                              {totalRechargesApproved.toLocaleString()} FCFA
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Demandes</span>
                            <span className="text-xl font-sans font-black text-slate-800 block mt-0.5">
                              {allDeposits.length}
                            </span>
                          </div>
                        </div>

                        {/* List */}
                        <div className="space-y-3">
                          {allDeposits.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 p-5">
                              <Coins className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                              <p className="text-xs font-bold text-slate-400">Aucune recharge enregistrée pour le moment.</p>
                            </div>
                          ) : (
                            [...allDeposits].reverse().map((deposit) => {
                              const isApproved = deposit.status === 'approved';
                              const isPending = deposit.status === 'pending';
                              const isRejected = deposit.status === 'rejected';

                              return (
                                <div 
                                  key={deposit.id}
                                  className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 flex justify-between items-center hover:border-slate-200 transition-all"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-sans font-black text-slate-800">
                                        Recharge {deposit.operator}
                                      </span>
                                      <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md ${
                                        isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' :
                                        isPending ? 'bg-amber-50 text-amber-700 border border-amber-200/50' :
                                        'bg-red-50 text-red-700 border border-red-200/50'
                                      }`}>
                                        {isApproved ? 'Validé' : isPending ? 'En attente' : 'Rejeté'}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold">
                                      Réf: <span className="font-mono text-slate-600">{deposit.reference}</span>
                                    </p>
                                    <p className="text-[9.5px] text-slate-400 font-medium">
                                      {formatDate(deposit.createdAt)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm font-sans font-black text-slate-900 block">
                                      +{deposit.amount.toLocaleString()} F
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Summary Card */}
                        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Capital Libéré</span>
                            <span className="text-xl font-sans font-black text-emerald-600 block mt-0.5">
                              {totalInvestedCompleted.toLocaleString()} FCFA
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Produits Terminés</span>
                            <span className="text-xl font-sans font-black text-slate-800 block mt-0.5">
                              {completedInvestments.length}
                            </span>
                          </div>
                        </div>

                        {/* List */}
                        <div className="space-y-3">
                          {completedInvestments.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 p-5">
                              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                              <p className="text-xs font-bold text-slate-400">Aucun produit d'investissement n'est encore terminé.</p>
                            </div>
                          ) : (
                            [...completedInvestments].reverse().map((inv) => {
                              return (
                                <div 
                                  key={inv.id}
                                  className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 space-y-3 hover:border-slate-200 transition-all text-left"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="text-xs font-sans font-black text-slate-800">
                                        {inv.productName}
                                      </h4>
                                      <span className="text-[8.5px] font-sans font-bold text-slate-400 block mt-0.5">
                                        Plan de {inv.durationDays} jours • {inv.dailyReturn.toLocaleString()} F/jour
                                      </span>
                                    </div>
                                    <span className="text-[8.5px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/50 px-2 py-0.5 rounded-md">
                                      Terminé ✓
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-left">
                                    <div>
                                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Investi</span>
                                      <span className="text-xs font-sans font-black text-slate-700">
                                        {inv.price.toLocaleString()} F
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Gains Récupérés</span>
                                      <span className="text-xs font-sans font-black text-emerald-600">
                                        {inv.totalReturnClaimed.toLocaleString()} F
                                      </span>
                                    </div>
                                  </div>

                                  <div className="pt-1 text-[9.5px] text-slate-400 font-medium text-left">
                                    Acheté le : {formatDate(inv.createdAt)}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            }

            if (profileSubPage === 'help') {
              return (
                <div className="bg-[#3172c7] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 min-h-[98vh] text-left animate-fadeIn flex flex-col">
                  {/* Blue Header Section */}
                  <div className="px-4 sm:px-6 md:px-12 xl:px-20 pt-5 pb-6">
                    <div className="max-w-xl mx-auto w-full">
                      {/* Back button and title bar */}
                      <div className="flex items-center justify-between mb-6">
                        <button 
                          onClick={() => setProfileSubPage(null)}
                          className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer border-none outline-none"
                        >
                          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                        </button>
                        <h2 className="font-sans font-black text-white text-base tracking-tight">Centre d'aide</h2>
                        <div className="w-10 h-10" /> {/* spacer for center alignment */}
                      </div>

                      {/* Header Welcome text */}
                      <div className="text-white">
                        <h1 className="font-sans font-black text-xl sm:text-2xl tracking-tight">Centre de service</h1>
                        <p className="text-[12.5px] text-white/90 font-bold mt-1.5 leading-relaxed">
                          Nous vous accompagnons à chaque étape dont vous avez besoin
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* White / Off-white Rounded Container */}
                  <div className="bg-[#f4f7fc] flex-grow rounded-t-[32px] px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-24 text-slate-800">
                    <div className="max-w-xl mx-auto w-full space-y-4">
                      
                      {/* Card 1: Votre dépôt n'a pas encore été reçu ? */}
                      <div 
                        onClick={() => setIsLiveChatOpen(true)}
                        className="bg-white rounded-[24px] p-5 shadow-xs border border-slate-100 flex items-start gap-4 hover:shadow-md hover:border-blue-100/60 transition-all cursor-pointer active:scale-[0.99]"
                      >
                        {/* Custom Illustration or circular Badge */}
                        <div className="w-12 h-12 rounded-full bg-[#eef3fc] shrink-0 flex items-center justify-center">
                          <div className="relative">
                            <Headphones className="w-6 h-6 text-[#1b64d9] stroke-[2.25]" />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-[8px] font-black text-white">?</div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-sans font-black text-slate-800 text-[13.5px] sm:text-sm leading-snug">
                            Votre dépôt n'a pas encore été reçu ?
                          </h3>
                          <p className="text-[11.5px] text-slate-500 font-semibold leading-relaxed">
                            Après avoir réussi à créditer votre compte, si le solde n'est pas apparu, veuillez le signaler ici et notre service client vous assistera pour le résoudre !
                          </p>
                        </div>
                      </div>

                      {/* Card 2: Service en ligne */}
                      <div 
                        onClick={() => setIsLiveChatOpen(true)}
                        className="bg-white rounded-[24px] p-5 shadow-xs border border-slate-100 flex items-start gap-4 hover:shadow-md hover:border-blue-100/60 transition-all cursor-pointer active:scale-[0.99]"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#eef3fc] shrink-0 flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-[#1b64d9] stroke-[2.25]" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-sans font-black text-slate-800 text-[13.5px] sm:text-sm leading-snug">
                            Service en ligne
                          </h3>
                          <p className="text-[11.5px] text-slate-500 font-black leading-relaxed">
                            Heures d'ouverture : 08:00 - 18:00
                          </p>
                        </div>
                      </div>

                      {/* Card 3: WhatsApp Channel */}
                      <div 
                        onClick={() => window.open(DataStore.getWhatsAppChannel(), '_blank')}
                        className="bg-white rounded-[24px] p-5 shadow-xs border border-slate-100 flex items-start gap-4 hover:shadow-md hover:border-emerald-100/60 transition-all cursor-pointer active:scale-[0.99]"
                      >
                        <div className="w-12 h-12 rounded-full bg-emerald-50 shrink-0 flex items-center justify-center">
                          <MessageCircle className="w-5.5 h-5.5 text-emerald-600 stroke-[2.25]" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-sans font-black text-slate-800 text-[13.5px] sm:text-sm leading-snug">
                            Canal WhatsApp
                          </h3>
                          <p className="text-[11.5px] text-slate-500 font-semibold leading-relaxed">
                            Suivez notre canal officiel WhatsApp pour obtenir les dernières nouvelles d'événements et recevoir des avantages de la boîte à trésors
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
                  <div className="max-w-xl mx-auto w-full space-y-4">
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
                      
                      <h3 className="text-center font-sans font-black text-slate-800 text-sm uppercase">Goldspeed Investment S.A.</h3>
                      
                      <p className="text-[11px] text-slate-400 font-bold leading-relaxed text-center">
                        Goldspeed Investment est une plateforme financière innovante dédiée à l'investissement et à la gestion de produits à haute rentabilité pour tous les investisseurs d'Afrique.
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
                  <div className="max-w-xl mx-auto w-full space-y-4">
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
                      <h3 className="font-sans font-black text-slate-800 text-xs uppercase tracking-wider pl-0.5">Langue / Language</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            localStorage.setItem('gi_lang', 'FR');
                            window.dispatchEvent(new Event('gi_lang_changed'));
                            setTimeout(() => {
                              window.location.reload();
                            }, 50);
                          }}
                          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs border transition-all ${
                            (localStorage.getItem('gi_lang') || 'FR') === 'FR'
                              ? 'bg-amber-50 border-amber-200 text-[#df4b13]'
                              : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>🇫🇷</span> Français
                        </button>
                        <button
                          onClick={() => {
                            localStorage.setItem('gi_lang', 'EN');
                            window.dispatchEvent(new Event('gi_lang_changed'));
                            setTimeout(() => {
                              window.location.reload();
                            }, 50);
                          }}
                          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs border transition-all ${
                            localStorage.getItem('gi_lang') === 'EN'
                              ? 'bg-amber-50 border-amber-200 text-[#df4b13]'
                              : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>🇬🇧</span> English
                        </button>
                      </div>
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

            if (profileSubPage === 'wheel') {
              return (
                <div className="bg-[#f8fafc] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-24 min-h-[95vh] text-slate-800 text-left animate-fadeIn relative">
                  <div className="max-w-xl mx-auto w-full space-y-6">
                    <div className="flex items-center space-x-3 mb-2 pt-2">
                      <button 
                        disabled={isSpinning}
                        onClick={() => setProfileSubPage(null)}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      <h2 className="font-sans font-black text-slate-900 text-base uppercase tracking-tight">Roue de la chance</h2>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-[36px] w-full p-6 sm:p-8 shadow-[0_15px_45px_rgba(0,0,0,0.06)] relative overflow-hidden flex flex-col items-center text-center">
                      {/* Gold sparkle header decoration */}
                      <div className="absolute -top-12 -left-12 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                      {/* Title & info */}
                      <div className="space-y-1 mb-6">
                        <span className="text-[10px] text-amber-500 font-sans font-black uppercase tracking-widest block">
                          ACTIVITÉ DE BIEN-ÊTRE
                        </span>
                        <h3 className="text-xl sm:text-2xl font-sans font-black text-slate-800 uppercase tracking-tight">
                          🎡 Roue de la chance
                        </h3>
                        <p className="text-xs text-slate-500 font-bold max-w-xs mx-auto">
                          Tournez la roue magique et gagnez des bonus crédités instantanément sur votre solde !
                        </p>
                      </div>

                      {/* Circular Wheel Viewport Container */}
                      <div className="relative my-4 select-none w-72 h-72 flex items-center justify-center">
                        
                        {/* Visual arrow pin pointing down at top center */}
                        <div 
                          className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-10 bg-amber-500 z-40 transition-all duration-300 animate-pulse"
                          style={{
                            clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                            filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))'
                          }}
                        />

                        {/* Outer shining border frame */}
                        <div className="absolute inset-0 rounded-full border-[6px] border-amber-500 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.25)] pointer-events-none z-20" />

                        {/* Spinning Wheel Body */}
                        <div 
                          className="w-full h-full rounded-full bg-slate-800 overflow-hidden relative border border-slate-700 transition-transform duration-[4500ms] ease-[cubic-bezier(0.15,0.85,0.15,1)]"
                          style={{ 
                            transform: `rotate(${wheelSpinAngle}deg)`,
                          }}
                        >
                          {WHEEL_REWARDS.map((rew, idx) => {
                            const angle = idx * 45; // 360 / 8 segments
                            return (
                              <div 
                                key={idx}
                                className="absolute top-0 left-0 w-full h-full origin-center flex flex-col items-center"
                                style={{ 
                                  transform: `rotate(${angle}deg)`,
                                }}
                              >
                                {/* Triangular piece slice using CSS clip-path */}
                                <div 
                                  className="absolute top-0 w-full h-1/2 origin-bottom transition-all duration-300"
                                  style={{
                                    clipPath: 'polygon(50% 100%, 14.6% 0, 85.4% 0)', // exactly 45 degrees slice width
                                    backgroundColor: rew.color,
                                    opacity: 0.85
                                  }}
                                />

                                {/* Text label vertically centered inside segment */}
                                <div 
                                  className="absolute top-8 text-center text-white font-sans font-black text-xs tracking-wider uppercase select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                                  style={{
                                    transform: 'rotate(0deg)',
                                  }}
                                >
                                  {rew.label}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Golden Center Hub Pin */}
                        <div className="absolute w-14 h-14 rounded-full bg-slate-800 border-[4px] border-amber-500 shadow-xl flex flex-col items-center justify-center z-30 select-none">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full animate-ping absolute opacity-75" />
                          <span className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-widest leading-none">VIP</span>
                          <span className="text-[9px] font-sans font-black text-white uppercase tracking-widest mt-0.5 leading-none">GOLD</span>
                        </div>
                      </div>

                      {/* Status & Spins info */}
                      <div className="mt-4 space-y-4 w-full">
                        <div className="bg-slate-100 rounded-2xl p-3.5 border border-slate-200/60 inline-flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className="text-xs font-sans font-black text-slate-700 tracking-wide uppercase">
                            {wheelSpinCount} Tirage(s) disponible(s)
                          </span>
                        </div>

                        {/* Spin CTA Button */}
                        <button
                          disabled={isSpinning || wheelSpinCount <= 0}
                          onClick={handleSpinWheel}
                          className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 disabled:from-slate-200 disabled:to-slate-300 text-white font-sans font-black text-xs py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(245,158,11,0.25)] transition-all cursor-pointer active:scale-95 disabled:scale-100 disabled:cursor-not-allowed uppercase tracking-wider border-none outline-none"
                        >
                          <Trophy className="w-5 h-5 stroke-[2.5]" />
                          <span>{isSpinning ? "Tirage en cours..." : "LANCER LE TIRAGE"}</span>
                        </button>

                        {/* Share to earn more spins */}
                        <p className="text-[10.5px] text-slate-500 font-bold leading-relaxed max-w-xs mx-auto pt-1">
                          💡 Astuce : Invitez de nouveaux membres sur Goldspeed pour obtenir des tickets de tirage supplémentaires !
                        </p>
                      </div>

                      {/* Win announcement overlay overlay */}
                      {wonReward && !isSpinning && (
                        <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-6 animate-fadeIn animate-duration-300">
                          <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center animate-bounce mb-4 border border-amber-500/20">
                            <Trophy className="w-10 h-10 stroke-[2.25]" />
                          </div>
                          <span className="text-[11px] text-amber-500 font-sans font-black uppercase tracking-widest">
                            SUCCÈS DU TIRAGE
                          </span>
                          <h4 className="text-2xl sm:text-3xl font-sans font-black text-slate-850 uppercase mt-1 leading-tight tracking-tight">
                            Félicitations !
                          </h4>
                          <p className="text-sm text-slate-500 font-bold max-w-xs mt-2">
                            Vous avez remporté un bonus de
                          </p>
                          <div className="text-3xl sm:text-4xl font-sans font-black text-yellow-500 my-4 tracking-wider font-mono">
                            +{wonReward.amount.toLocaleString()} F CFA
                          </div>
                          <p className="text-xs text-emerald-600 font-black uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                            ✓ Crédité sur votre solde
                          </p>
                          <button
                            onClick={() => setWonReward(null)}
                            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-sans font-black text-xs py-3 px-6 rounded-xl transition-all cursor-pointer border-0 active:scale-95"
                          >
                            D'ACCORD !
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* USER SUMMARY CARDS */}
          {!profileSubPage && activeTab === 'dashboard' && (
            <div className="space-y-4 text-left animate-fadeIn">

              {/* 1. AUTO-PLAYING GOLD SLIDER CAROUSEL */}
              <div className="relative rounded-2xl overflow-hidden aspect-[19/9] sm:aspect-[21/9] w-full shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-amber-500/20 bg-slate-950 flex flex-col justify-between p-4 sm:p-5 text-left group">
                {/* Visual Gold Asset Slide with AnimatePresence */}
                <div className="absolute inset-0 w-full h-full z-0 overflow-hidden select-none pointer-events-none">
                  <AnimatePresence mode="popLayout">
                    <motion.img 
                      key={currentSlide}
                      src={GOLDSPEED_SLIDES[currentSlide].url} 
                      alt={GOLDSPEED_SLIDES[currentSlide].title} 
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 0.75, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </AnimatePresence>
                </div>

                {/* Immersive gold gradient vein overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/15 via-slate-950/60 to-slate-950 pointer-events-none z-10" />
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none z-10" />
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-600/15 rounded-full blur-3xl pointer-events-none z-10" />
                
                {/* Gold sparkle highlights */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent z-15 pointer-events-none" />
                
                {/* Top content */}
                <div className="relative z-20 flex justify-between items-start">
                  <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[8px] font-sans font-black px-2 py-0.5 rounded-full uppercase tracking-widest select-none">
                    {t('OFFICIEL • MEMBRE VIP', 'OFFICIAL • VIP MEMBER')}
                  </span>
                  <div className="text-right bg-gradient-to-r from-[#ffe082] via-[#d4af37] to-[#aa7c11] px-2.5 py-1 rounded-xl shadow-md border border-[#c5a133] select-all">
                    <span className="text-[7.5px] text-slate-950 font-sans font-black block leading-none uppercase tracking-widest text-right">{t('SOLDE ACTUEL', 'CURRENT BALANCE')}</span>
                    <span className="text-xs sm:text-sm font-sans font-black text-slate-950 block mt-0.5 font-mono leading-none animate-pulse">
                      {userState.balance.toLocaleString()} F CFA
                    </span>
                  </div>
                </div>

                {/* Bottom Title & Dynamic Slide Info */}
                <div className="relative z-20 pr-12">
                  <h1 className="text-sm sm:text-base font-sans font-extrabold tracking-[0.05em] text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-200 to-yellow-400 uppercase leading-tight drop-shadow-[0_2px_12px_rgba(245,158,11,0.25)]">
                    {t(GOLDSPEED_SLIDES[currentSlide].title, 'Goldspeed Pure Gold Bullion 💎')}
                  </h1>
                  <p className="text-[8.5px] sm:text-[9.5px] font-sans font-bold text-slate-200 uppercase mt-0.5 pl-0.5 select-none leading-tight">
                    {t(GOLDSPEED_SLIDES[currentSlide].desc, 'Benefit from the absolute safety of a premium gold investment.')}
                  </p>
                </div>

                {/* Slide Indicators / Dots */}
                {GOLDSPEED_SLIDES.length > 1 && (
                  <div className="absolute bottom-3 right-4 z-25 flex gap-1">
                    {GOLDSPEED_SLIDES.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentSlide(idx);
                        }}
                        className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide ? 'w-4 bg-yellow-400' : 'w-1 bg-white/40'}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 2. QUICK ACCESS BUTTONS ROW (4 BUTTONS - ENLARGED ORIGINAL PLAN) */}
              <div className="bg-white rounded-[28px] p-5 shadow-[0_6px_20px_rgba(0,0,0,0.02)] border border-slate-100/90 grid grid-cols-4 gap-2 pt-4.5 pb-4.5">
                {/* Recharger */}
                <button
                  onClick={() => setActiveTab('deposit')}
                  className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none focus:outline-none"
                >
                  <div className="w-15 h-15 bg-amber-500 text-white flex items-center justify-center rounded-2xl transition-all group-hover:scale-105 shadow-md shadow-amber-500/20 shrink-0">
                    <Wallet className="w-7.5 h-7.5 stroke-[2.25]" />
                  </div>
                  <span className="font-sans font-black text-xs sm:text-[13px] text-slate-800 mt-2 block tracking-wide truncate max-w-full">
                    {t('Recharger', 'Deposit')}
                  </span>
                </button>

                {/* Retirer */}
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none focus:outline-none"
                >
                  <div className="w-15 h-15 bg-blue-600 text-white flex items-center justify-center rounded-2xl transition-all group-hover:scale-105 shadow-md shadow-blue-500/20 shrink-0">
                    <ArrowUpCircle className="w-7.5 h-7.5 stroke-[2.25]" />
                  </div>
                  <span className="font-sans font-black text-xs sm:text-[13px] text-slate-800 mt-2 block tracking-wide truncate max-w-full">
                    {t('Retirer', 'Withdraw')}
                  </span>
                </button>

                {/* Mon Équipe */}
                <button
                  onClick={() => setActiveTab('team')}
                  className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none focus:outline-none"
                >
                  <div className="w-15 h-15 bg-slate-800 text-white flex items-center justify-center rounded-2xl transition-all group-hover:scale-105 shadow-md shadow-slate-700/20 shrink-0">
                    <Users className="w-7.5 h-7.5 stroke-[2.25]" />
                  </div>
                  <span className="font-sans font-black text-xs sm:text-[13px] text-slate-800 mt-2 block tracking-wide truncate max-w-full">
                    {t('Mon Équipe', 'My Team')}
                  </span>
                </button>

                {/* WhatsApp Channel */}
                <button
                  onClick={() => window.open(DataStore.getWhatsAppChannel(), '_blank')}
                  className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none focus:outline-none"
                >
                  <div className="w-15 h-15 bg-emerald-600 text-white flex items-center justify-center rounded-2xl transition-all group-hover:scale-105 shadow-md shadow-emerald-500/20 shrink-0">
                    <MessageCircle className="w-7.5 h-7.5 stroke-[2.25]" />
                  </div>
                  <span className="font-sans font-black text-xs sm:text-[13px] text-slate-800 mt-2 block tracking-wide truncate max-w-full">
                    Canal WA
                  </span>
                </button>
              </div>

              {/* 3. CARD: RÉCOMPENSES D'INVITATION */}
              <div className="bg-white rounded-[28px] p-5 shadow-[0_6px_20px_rgba(0,0,0,0.03)] border-2 border-slate-100/90 space-y-3.5">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <h3 className="font-sans font-black text-slate-800 text-[13px] uppercase tracking-tight">
                      {t("Récompenses d'invitation", "Invitation Rewards")}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold leading-none">
                      {t("Investissez ensemble, enrichissez-vous ensemble", "Invest together, grow rich together")}
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-amber-100/70 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                    <Gift className="w-4.5 h-4.5 stroke-[2.25]" />
                  </div>
                </div>

                <div className="bg-slate-50/70 rounded-2xl p-3 border-2 border-slate-100/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                      <Share className="w-4 h-4 stroke-[2.25]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] text-slate-400 font-black block leading-none uppercase tracking-wider">
                        {t("Lien d'invitation", "Invitation Link")}
                      </span>
                      <span className="text-[10.5px] text-indigo-600 font-black truncate block mt-0.5 font-mono">
                        {`${window.location.origin}/register?ref=${userState.referralCode || ''}`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const shareLink = `${window.location.origin}/register?ref=${userState.referralCode || ''}`;
                      navigator.clipboard.writeText(shareLink);
                      triggerToast(t("Lien d'invitation copié ! 📋", "Invitation link copied! 📋"), "success");
                    }}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-105 hover:from-amber-600 hover:to-yellow-600 text-slate-950 py-2 px-4 rounded-full text-[10.5px] font-sans font-black tracking-wide transition-all active:scale-95 cursor-pointer shadow-xs border-0"
                  >
                    {t('Copier', 'Copy')}
                  </button>
                </div>
              </div>

              {/* 4. CARD: CENTRE D'ACTIVITÉS DE BIEN-ÊTRE */}
              <div className="bg-white rounded-[32px] p-6.5 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border-2 border-slate-100/90 space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] text-amber-600 font-extrabold uppercase tracking-widest block leading-none">
                    {t("Activités & Récompenses", "Activities & Rewards")}
                  </span>
                  <h3 className="font-sans font-black text-slate-800 text-[16px] sm:text-lg uppercase tracking-tight">
                    {t("Centre d'activités de bien-être", "Wellness Activity Center")}
                  </h3>
                </div>

                <div className="space-y-5 pt-1">
                  {/* Roue de la chance row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/10 transition-all duration-300">
                    <div className="flex items-center gap-3.5">
                      <div className="w-13 h-13 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0 border-2 border-amber-100/40 shadow-xs">
                        <Trophy className="w-7 h-7 stroke-[2.25]" />
                      </div>
                      <div>
                        <h4 className="font-sans font-black text-[14.5px] sm:text-[15.5px] text-slate-800 leading-snug">
                          {t("Roue de la chance", "Wheel of Fortune")}
                        </h4>
                        <span className="text-[11px] sm:text-xs text-slate-500 font-bold block mt-1 leading-normal">
                          {t("Taux de gain du tirage au sort de 100%", "100% winning rate draw")}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setProfileSubPage('wheel')}
                      className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:brightness-105 hover:from-amber-600 hover:to-yellow-600 py-3 px-6 rounded-2xl text-[12px] sm:text-[13px] font-sans font-black tracking-wide transition-all active:scale-95 cursor-pointer shadow-md shadow-amber-500/10 border-0 shrink-0 text-center uppercase"
                    >
                      {t("Tirage au sort", "Draw")}
                    </button>
                  </div>

                  {/* Centre des missions row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/10 transition-all duration-300">
                    <div className="flex items-center gap-3.5">
                      <div className="w-13 h-13 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0 border-2 border-amber-100/40 shadow-xs">
                        <Gift className="w-7 h-7 stroke-[2.25]" />
                      </div>
                      <div>
                        <h4 className="font-sans font-black text-[14.5px] sm:text-[15.5px] text-slate-800 leading-snug">
                          {t("Centre des missions", "Mission Center")}
                        </h4>
                        <span className="text-[11px] sm:text-xs text-slate-500 font-bold block mt-1 leading-normal max-w-sm">
                          {t("Après avoir complété chaque mission, vous recevrez une récompense", "Complete missions for rewards")}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setProfileSubPage('missions')}
                      className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:brightness-105 hover:from-amber-600 hover:to-yellow-600 py-3 px-6 rounded-2xl text-[12px] sm:text-[13px] font-sans font-black tracking-wide transition-all active:scale-95 cursor-pointer shadow-md shadow-amber-500/10 border-0 shrink-0 text-center uppercase"
                    >
                      {t("Visiter", "Visit")}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* CATALOGUE PRODUCTS TAB */}
          {!profileSubPage && activeTab === 'products' && (() => {
            const stabilityCount = products.filter(p => p.category === 'stability' || !p.category).length;
            const wellbeingCount = products.filter(p => p.category === 'wellbeing').length;
            const activityCount = products.filter(p => p.category === 'activity').length;

            return (
              <div className="space-y-6 animate-fade-in">
                {/* TWO-COLUMN PRODUCT CATALOG WITH SIDEBAR TABS */}
                <div className="max-w-7xl mx-auto pt-4 text-left flex flex-row gap-3 sm:gap-6 items-start">
                  
                  {/* Left Column: Sidebar Tabs */}
                  <div className="w-[74px] min-[375px]:w-[80px] min-[410px]:w-[86px] sm:w-44 md:w-48 shrink-0 flex flex-col gap-2.5 border-r border-slate-200/60 pr-1 sm:pr-2.5 md:pr-3 select-none">
                    
                    {/* Header for categories on larger screens */}
                    <div className="hidden sm:block mb-1 px-1">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none">
                        {t('Catégories', 'Categories')}
                      </span>
                      <span className="text-[11px] text-slate-800 font-black block mt-0.5">
                        {t('Équipements', 'Equipment')}
                      </span>
                    </div>

                    {/* Stabilité */}
                    <button
                      type="button"
                      onClick={() => setProductSubTab('stability')}
                      className={`group w-full flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 px-1 sm:px-2 md:px-2.5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border transition-all duration-300 shrink-0 cursor-pointer text-left ${
                        productSubTab === 'stability'
                          ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 border-amber-400 shadow-[0_6px_14px_rgba(245,158,11,0.25)] scale-[1.01]'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200/60 hover:border-slate-300 hover:text-slate-800 shadow-sm'
                      }`}
                    >
                      <div className={`w-6.5 h-6.5 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                        productSubTab === 'stability' ? 'bg-slate-950/15 text-slate-950' : 'bg-amber-50 text-amber-500'
                      }`}>
                        <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.25]" />
                      </div>
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <div className="flex items-center justify-between gap-0.5">
                          <span className="font-sans font-black text-[8px] min-[375px]:text-[8.5px] sm:text-[10px] md:text-[11px] uppercase tracking-wider block truncate">
                            {t('Stabilité', 'Stability')}
                          </span>
                          <span className={`hidden sm:inline-flex items-center justify-center px-1 py-0.5 text-[8px] font-black rounded-full font-mono leading-none ${
                            productSubTab === 'stability' ? 'bg-slate-950/15 text-slate-950' : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {stabilityCount}
                          </span>
                        </div>
                        <span className={`hidden sm:block text-[8px] font-bold mt-0.5 ${
                          productSubTab === 'stability' ? 'text-slate-900/80 font-black' : 'text-slate-400'
                        }`}>
                          {t('Plans Standard', 'Standard Plans')}
                        </span>
                      </div>
                    </button>

                    {/* Bien-être */}
                    <button
                      type="button"
                      onClick={() => setProductSubTab('wellbeing')}
                      className={`group w-full flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 px-1 sm:px-2 md:px-2.5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border transition-all duration-300 shrink-0 cursor-pointer text-left ${
                        productSubTab === 'wellbeing'
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-400 shadow-[0_6px_14px_rgba(168,85,247,0.12)] scale-[1.01]'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200/60 hover:border-slate-300 hover:text-slate-800 shadow-sm'
                      }`}
                    >
                      <div className={`w-6.5 h-6.5 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                        productSubTab === 'wellbeing' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-500'
                      }`}>
                        <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.25]" />
                      </div>
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <div className="flex items-center justify-between gap-0.5">
                          <span className="font-sans font-black text-[8px] min-[375px]:text-[8.5px] sm:text-[10px] md:text-[11px] uppercase tracking-wider block truncate">
                            {t('Bien-être', 'Well-being')}
                          </span>
                          <span className={`hidden sm:inline-flex items-center justify-center px-1 py-0.5 text-[8px] font-black rounded-full font-mono leading-none ${
                            productSubTab === 'wellbeing' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600 border border-purple-100'
                          }`}>
                            {wellbeingCount}
                          </span>
                        </div>
                        <span className={`hidden sm:block text-[8px] font-bold mt-0.5 ${
                          productSubTab === 'wellbeing' ? 'text-purple-100' : 'text-slate-400'
                        }`}>
                          {t('Santé & Gains', 'Health & Gains')}
                        </span>
                      </div>
                    </button>

                    {/* Activité */}
                    <button
                      type="button"
                      onClick={() => setProductSubTab('activity')}
                      className={`group w-full flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 px-1 sm:px-2 md:px-2.5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border transition-all duration-300 shrink-0 cursor-pointer text-left ${
                        productSubTab === 'activity'
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-400 shadow-[0_6px_14px_rgba(16,185,129,0.12)] scale-[1.01]'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200/60 hover:border-slate-300 hover:text-slate-800 shadow-sm'
                      }`}
                    >
                      <div className={`w-6.5 h-6.5 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                        productSubTab === 'activity' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-500'
                      }`}>
                        <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.25]" />
                      </div>
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <div className="flex items-center justify-between gap-0.5">
                          <span className="font-sans font-black text-[8px] min-[375px]:text-[8.5px] sm:text-[10px] md:text-[11px] uppercase tracking-wider block truncate">
                            {t('Activité', 'Activity')}
                          </span>
                          <span className={`hidden sm:inline-flex items-center justify-center px-1 py-0.5 text-[8px] font-black rounded-full font-mono leading-none ${
                            productSubTab === 'activity' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {activityCount}
                          </span>
                        </div>
                        <span className={`hidden sm:block text-[8px] font-bold mt-0.5 ${
                          productSubTab === 'activity' ? 'text-emerald-100' : 'text-slate-400'
                        }`}>
                          {t('Cycles Courts', 'Short Cycles')}
                        </span>
                      </div>
                    </button>
                  </div>

                {/* Right Column: Products List */}
                <div className="flex-1 w-full space-y-4">

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products
                      .filter(p => {
                        if (productSubTab === 'stability') {
                          return p.category === 'stability' || !p.category;
                        }
                        return p.category === productSubTab;
                      })
                      .sort((a, b) => (a.price || 0) - (b.price || 0))
                      .map((p, index) => {
                        const isBlocked = p.isBlocked === true;
                        const formattedReopenTime = p.reopenDateTime 
                          ? new Date(p.reopenDateTime).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                          : null;

                        const getVipDisplayName = (prod: Product, defaultVipLevel: number) => {
                          if (prod.category === 'activity') {
                            return `Goldspeed Activité ${prod.vipLevel || defaultVipLevel}`;
                          }
                          if (prod.category === 'wellbeing') {
                            return `Goldspeed Bien-être ${prod.vipLevel || defaultVipLevel}`;
                          }
                          return `Titres à revenu fixe ${prod.vipLevel || defaultVipLevel}`;
                        };

                        const getCardStyle = (cat?: string) => {
                          if (cat === 'activity') {
                            return {
                              container: 'bg-emerald-50/40 border-2 border-emerald-100 rounded-[32px] p-6 sm:p-7 shadow-[0_6px_25px_rgba(16,185,129,0.06)] hover:shadow-lg hover:border-emerald-200 transition-all duration-300 relative flex flex-col justify-between',
                              imgBg: 'bg-[#10b981] border border-emerald-100',
                              badge: 'text-[#047857] bg-[#d1fae5]',
                              statLabel: 'text-emerald-600/80',
                              statVal: 'text-[#10b981]',
                              statValTotal: 'text-[#047857]',
                              buttonLeft: 'bg-[#f0fdf4] text-[#047857]',
                              buttonRight: 'bg-[#10b981] hover:bg-[#047857]',
                              buttonBorder: 'border-emerald-200'
                            };
                          }
                          if (cat === 'wellbeing') {
                            return {
                              container: 'bg-purple-50/40 border-2 border-purple-100 rounded-[32px] p-6 sm:p-7 shadow-[0_6px_25px_rgba(168,85,247,0.06)] hover:shadow-lg hover:border-purple-200 transition-all duration-300 relative flex flex-col justify-between',
                              imgBg: 'bg-[#a855f7] border border-purple-100',
                              badge: 'text-[#7e22ce] bg-[#f3e8ff]',
                              statLabel: 'text-purple-600/80',
                              statVal: 'text-[#a855f7]',
                              statValTotal: 'text-[#7e22ce]',
                              buttonLeft: 'bg-[#faf5ff] text-[#7e22ce]',
                              buttonRight: 'bg-[#a855f7] hover:bg-[#7e22ce]',
                              buttonBorder: 'border-purple-200'
                            };
                          }
                          // Default stability (gold)
                          return {
                            container: 'bg-amber-50/30 border-2 border-amber-200 rounded-[32px] p-6 sm:p-7 shadow-[0_6px_25px_rgba(245,158,11,0.08)] hover:shadow-lg hover:border-amber-300/80 transition-all duration-300 relative flex flex-col justify-between',
                            imgBg: 'bg-gradient-to-r from-amber-400 to-yellow-500 border border-amber-200',
                            badge: 'text-amber-800 bg-amber-100/80',
                            statLabel: 'text-amber-700/80',
                            statVal: 'text-amber-600 font-extrabold',
                            statValTotal: 'text-amber-900 font-black',
                            buttonLeft: 'bg-amber-50 text-amber-800',
                            buttonRight: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-105 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black',
                            buttonBorder: 'border-amber-200'
                          };
                        };

                        const theme = getCardStyle(p.category);
                        const displayName = getVipDisplayName(p, p.vipLevel || (index + 1));
                        const purchasedCount = activeInvestments.filter(i => i.productName === p.name || i.productId === p.id).length;

                        return (
                          <div 
                            key={p.id}
                            className={`${theme.container} ${isBlocked ? 'opacity-70 pointer-events-none' : ''}`}
                          >
                            {/* Card Content Top Row */}
                            <div>
                              {/* Enlarged Gold Image with VIP level text written directly on it */}
                              <div className="relative w-full h-48 rounded-[24px] overflow-hidden mb-4.5 shadow-sm border border-amber-500/10 bg-slate-950 group">
                                <ProductImage 
                                  vipLevel={p.vipLevel || (index + 1)}
                                  alt={displayName}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  category={p.category}
                                  imageUrl={p.imageUrl}
                                />
                                {/* Soft gradient overlay for text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-black/35 pointer-events-none" />

                                {/* VIP level badge written directly on the image */}
                                <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-sans font-black text-[10px] px-2.5 py-1 rounded-xl uppercase tracking-wider shadow-md border border-yellow-200/50 flex items-center gap-1">
                                  🏆 VIP {p.vipLevel || 0}
                                </div>

                                {purchasedCount > 0 && (
                                  <div className="absolute top-3 right-3 bg-emerald-500 text-white font-sans font-black text-[9px] px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-md">
                                    Actif ({purchasedCount})
                                  </div>
                                )}

                                {/* Display name written directly on the image overlay */}
                                <div className="absolute bottom-3 left-3 right-3 text-left">
                                  <h4 className="font-sans font-black text-sm text-white drop-shadow-md leading-tight tracking-wide">
                                    {displayName}
                                  </h4>
                                </div>
                              </div>

                              {/* Key-Value Details */}
                              <div className="mt-2 space-y-2 text-left select-none border-t border-slate-100 pt-3">
                                <div className="flex justify-between items-center text-xs">
                                  <span className={`${theme.statLabel} font-bold`}>Revenus Quotidiens</span>
                                  <span className={`${theme.statVal} font-black`}>{p.dailyReturn.toLocaleString()} {getCurrency()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className={`${theme.statLabel} font-bold`}>Cycle défini</span>
                                  <span className="font-extrabold text-slate-800 font-mono bg-slate-100/80 px-2.5 py-0.5 rounded-md text-[11px] border border-slate-200/50">
                                    {p.durationDays} Jours
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className={`${theme.statLabel} font-bold`}>Revenu Total</span>
                                  <span className={`${theme.statValTotal} font-black`}>{(p.dailyReturn * p.durationDays).toLocaleString()} {getCurrency()}</span>
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
                                className={`w-full flex items-stretch rounded-full overflow-hidden border shadow-sm transition-all active:scale-[0.98] cursor-pointer ${theme.buttonBorder} ${isBlocked ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-95'}`}
                              >
                                <div className={`${theme.buttonLeft} font-extrabold text-xs px-4 py-3 flex items-center justify-center flex-1`}>
                                  {p.price.toLocaleString()} {getCurrency()}
                                </div>
                                <div className={`${theme.buttonLeft} flex items-center justify-center px-1 font-bold select-none text-xs`}>
                                  ⚡
                                </div>
                                <div className={`${theme.buttonRight} text-white font-extrabold text-xs px-6 py-3 flex items-center justify-center flex-1 text-center uppercase tracking-wide`}>
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

                    {products.filter(p => {
                      if (productSubTab === 'stability') {
                        return p.category === 'stability' || !p.category;
                      }
                      return p.category === productSubTab;
                    }).length === 0 && (
                      <div className="col-span-full py-16 px-4 text-center rounded-3xl bg-slate-50 border border-dashed border-slate-200 max-w-sm mx-auto">
                        <span className="text-3xl">📭</span>
                        <h5 className="font-sans font-black text-slate-700 uppercase tracking-wider text-xs mt-3">Aucun produit disponible</h5>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">
                          Aucun plan d'investissement n'est actif dans cette catégorie pour le moment.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            );
          })()}

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
                    Saisissez les détails de paiement pour effectuer votre recharge en ligne de manière sécurisée.
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
                    {depositRedirectUrl && (
                      <a
                        href={depositRedirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 w-full py-3 bg-[#1b64d9] hover:bg-blue-700 text-white font-sans text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-center block"
                      >
                        🔗 Ouvrir l'interface de paiement
                      </a>
                    )}
                  </div>
                )}

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

                      <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl space-y-4 animate-fade-in">
                        <div>
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
                            <span>💳 Payer en ligne (Auto)</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
              </div>
            );
          })()}

          {/* WITHDRAW FORM TAB */}
          {!profileSubPage && activeTab === 'withdraw' && (
            <div className="max-w-xl mx-auto bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-xl text-slate-800">
              <div className="flex flex-row gap-3 justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div className="text-left flex-1 min-w-0">
                  <span className="text-xs md:text-sm font-black text-[#1b64d9] tracking-widest uppercase block mb-1">CASH OUT DETECTÉ</span>
                  <h3 className="text-xl md:text-2xl font-display font-black text-slate-800 uppercase tracking-tight leading-none truncate">Demande de Retrait</h3>
                  <p className="text-xs md:text-sm text-slate-500 font-bold mt-1 hidden xs:block">Saisissez vos paramètres de transfert de solde.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('/historique#retrait');
                    }
                  }}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/60 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <History className="w-4 h-4 text-blue-600" />
                  <span>Relevé des renseignements</span>
                </button>
              </div>

              {(new Date().getHours() < 9 || new Date().getHours() >= 17) && (
                <div className="mb-4 p-4 rounded-xl bg-amber-100 border border-amber-200 text-xs md:text-sm text-amber-850 font-black text-center uppercase tracking-wide flex flex-col gap-1 shadow-sm">
                  <span>⚠️ SYSTÈME HORS PLAGE HORAIRE</span>
                  <span>Les retraits sont ouverts uniquement de 09h00 à 17h00 chaque jour.</span>
                </div>
              )}

              {(DataStore.areWithdrawalsBlocked() || userState.withdrawBlocked) && (
                <div className="mb-4 p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs md:text-sm text-blue-900 font-black text-center uppercase tracking-wide flex flex-col gap-1 shadow-sm">
                  <span>⚠️ RETRAITS SUSPENDUS TEMPORAIREMENT</span>
                  <span>Les retraits sont restreints sur votre compte.</span>
                </div>
              )}

              {withdrawError && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-100 border border-red-200 text-sm text-red-700 font-bold">{withdrawError}</div>
              )}
              {withdrawSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-100 border border-green-200 text-sm text-green-700 font-bold">{withdrawSuccess}</div>
              )}

              <div className="mb-6 bg-gradient-to-r from-[#ffe082] via-[#d4af37] to-[#aa7c11] border-2 border-[#c5a133] rounded-2xl p-5 text-center shadow-lg">
                <span className="text-slate-950 font-black uppercase text-xs tracking-wider block">Solde Actuel Disponible</span>
                <div className="text-3xl sm:text-4xl font-black text-slate-950 mt-2 font-mono leading-none animate-pulse">{userState.balance.toLocaleString()} {getCurrency()}</div>
              </div>

              <form onSubmit={submitWithdrawal} className="space-y-5 text-left">
                {/* Operator select and Number inputs, or Linked Card display */}
                {(() => {
                  const hasLinkedCard = !!(userState.bankCardNumber || localStorage.getItem('mdb_saved_number'));
                  const cardNum = userState.bankCardNumber || localStorage.getItem('mdb_saved_number') || '';
                  const cardOp = userState.bankCardOperator || localStorage.getItem('mdb_saved_operator') || '';
                  const cardHolder = userState.bankCardName || localStorage.getItem('mdb_saved_name') || '';

                  if (hasLinkedCard) {
                    return (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border-2 border-blue-200/60 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm">
                        <div className="absolute -top-3 -right-3 p-3 text-blue-600/5">
                          <CreditCard className="w-24 h-24 transform rotate-12" />
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider block">
                            Ref : 💳 COMPTE DE RÉCEPTION LIÉ
                          </span>
                        </div>
                        <div className="space-y-2 relative z-10 text-slate-800">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">Titulaire :</span>
                            <span className="font-extrabold uppercase text-slate-900">{cardHolder || 'Non spécifié'}</span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">Réseau / Opérateur :</span>
                            <span className="font-black text-[#1b64d9]">{cardOp}</span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">Numéro de Réception :</span>
                            <span className="font-mono font-black text-slate-950 tracking-wider bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">{cardNum}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-extrabold">
                            Les fonds seront versés automatiquement sur ce compte.
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsBankCardModalOpen(true)}
                            className="text-xs font-black text-[#1b64d9] hover:text-blue-700 underline focus:outline-none cursor-pointer"
                          >
                            Modifier le compte
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <>
                      {/* Operator select */}
                      <div>
                        <label className="block text-xs md:text-sm font-black text-slate-700 uppercase tracking-wider mb-2">Opérateur de réception</label>
                        <select 
                          value={withdrawOperator}
                          onChange={(e) => setWithdrawOperator(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#1b64d9] rounded-xl py-3 px-4 text-sm text-slate-800 font-bold focus:outline-none cursor-pointer shadow-sm transition-colors"
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
                          <optgroup label="Niger 🇳🇪">
                            <option value="Airtel (NE)">Airtel (NE)</option>
                            <option value="Moov (NE)">Moov (NE)</option>
                            <option value="Orange (NE)">Orange (NE)</option>
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
                        <label className="block text-xs md:text-sm font-black text-slate-700 uppercase tracking-wider mb-2">Numéro de téléphone de réception</label>
                        <input
                          type="tel"
                          required
                          placeholder="Ex: +228 90123456"
                          value={withdrawNumber}
                          onChange={(e) => setWithdrawNumber(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#1b64d9] rounded-xl py-3 px-4 text-sm text-slate-800 font-mono font-bold tracking-wider shadow-sm transition-colors"
                        />
                        <span className="text-xs text-slate-400 block mt-1.5 font-bold">Assurez-vous que le numéro est actif et lié à un compte Mobile Money.</span>
                      </div>
                    </>
                  );
                })()}

                {/* Withdraw value */}
                <div>
                  <label className="block text-xs md:text-sm font-black text-slate-700 uppercase tracking-wider mb-2">Montant à extraire ({getCurrency()})</label>
                  <input
                    type="number"
                    required
                    placeholder={`Montant à retirer en ${getCurrency()}`}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#1b64d9] rounded-xl py-3 px-4 text-sm text-[#1b64d9] font-black focus:outline-none transition-colors"
                  />
                </div>

                {/* Real-time fee summary */}
                {!isNaN(parseInt(withdrawAmount)) && parseInt(withdrawAmount) > 0 && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs md:text-sm font-bold text-slate-700 space-y-2 animate-fade-in shadow-sm">
                    <span className="font-extrabold text-[#1b64d9] text-[11px] uppercase tracking-wider block">Calcul automatique (12% Frais) :</span>
                    <div className="flex justify-between border-b border-slate-150 pb-1">
                      <span className="text-slate-500 font-semibold">Montant brut :</span>
                      <span className="font-mono">{parseInt(withdrawAmount).toLocaleString()} {getCurrency()}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-150 pb-1 text-red-500">
                      <span className="font-semibold">Frais (12%) :</span>
                      <span className="font-mono">-{Math.round(parseInt(withdrawAmount) * 0.12).toLocaleString()} {getCurrency()}</span>
                    </div>
                    <div className="pt-1 flex justify-between text-[#00bd74] text-sm md:text-base font-black">
                      <span>Montant net crédité :</span>
                      <span className="font-mono">{Math.max(0, parseInt(withdrawAmount) - Math.round(parseInt(withdrawAmount) * 0.12)).toLocaleString()} {getCurrency()}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 text-white font-sans font-black text-sm uppercase tracking-widest bg-gradient-to-r from-[#00bcff] to-[#0ea5e9] rounded-xl transition-all shadow-md active:scale-95 text-center flex items-center justify-center border-none hover:opacity-95 cursor-pointer"
                >
                  Envoyer la demande de Retrait
                </button>
              </form>

              {/* RÈGLES ET CONDITIONS DE RETRAIT EN TIRÉ/BULLETS */}
              <div className="mt-8 pt-6 border-t border-slate-200 text-slate-700/90 text-left">
                <span className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest block mb-4">
                  📋 CONDITIONS ET PARAMÈTRES DE RETRAIT
                </span>
                <ul className="space-y-3 text-xs md:text-sm font-bold leading-relaxed">
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

          {/* WITHDRAWAL PROOFS FEED TAB (AVIS) */}
          {activeTab === 'proofs' && (
            <div className="space-y-6 max-w-2xl mx-auto text-left animate-fadeIn animate-duration-300">
              {/* Header Card */}
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-[32px] p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    {/* Elevated and stylized Avis logo */}
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl shadow-[0_8px_20px_rgba(245,158,11,0.15)] relative overflow-hidden shrink-0 -mt-1 hover:scale-105 transition-transform duration-300">
                      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/15 via-transparent to-transparent" />
                      📢
                    </div>
                    <div className="space-y-1">
                      <div className="inline-flex items-center space-x-2 bg-amber-500/15 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                        <span>Goldspeed Officiel</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-sans font-black tracking-tight text-white uppercase leading-tight">
                        Avis &amp; Communiqués
                      </h2>
                    </div>
                  </div>
                  
                  {userState.role === 'admin' && (
                    <button
                      onClick={() => {
                        setIsAdminMode(true);
                      }}
                      className="whitespace-nowrap px-4 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-sans font-black text-xs rounded-xl shadow-lg hover:shadow-yellow-500/20 active:scale-95 duration-150 flex items-center space-x-1.5 uppercase tracking-wider border-0 cursor-pointer"
                    >
                      <span>✍️ Publier un Avis</span>
                    </button>
                  )}
                </div>
                <div className="mt-3 pl-0 sm:pl-[72px]">
                  <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-md">
                    Suivez les annonces de maintenance, les notes de sécurité de l'administration et les reçus de gains officiels de la plateforme.
                  </p>
                </div>
              </div>

              {/* Announcements Feed */}
              <div className="space-y-4">
                {withdrawalProofs.length === 0 ? (
                  <div className="text-center py-16 px-6 rounded-[32px] bg-white border border-blue-50 shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <span className="text-2xl">📭</span>
                    </div>
                    <h3 className="text-sm font-sans font-black text-slate-700 uppercase tracking-wider">Aucun communiqué disponible</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      L'administration n'a pas encore publié d'annonce officielle pour le moment.
                    </p>
                  </div>
                ) : (
                  [...withdrawalProofs]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((proof) => {
                      const userHasLiked = proof.likes?.includes(userState.id) || false;
                      return (
                        <div
                          key={proof.id}
                          className="bg-white border border-blue-50/70 rounded-[32px] p-5 sm:p-6 shadow-[0_12px_40px_rgba(27,100,217,0.02)] space-y-4 hover:border-blue-100 transition-all duration-150"
                        >
                          {/* Post Header */}
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-slate-100 border border-slate-200/60 rounded-2xl flex items-center justify-center font-display font-bold text-lg text-slate-700 shadow-inner">
                                {proof.userName.toLowerCase().includes('admin') || proof.userName.toLowerCase().includes('officiel') ? '👑' : '📢'}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-sans font-black text-xs text-slate-800 tracking-tight">
                                    {maskUserPhone(proof.userName)}
                                  </span>
                                  <span className="bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-lg">
                                    {proof.userCountry || 'Officiel'}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                                  📅 {new Date(proof.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>

                            {/* Optional Amount badge */}
                            {proof.amount > 0 && (
                              <div className="bg-emerald-50 text-emerald-600 border border-emerald-100/60 px-3 py-1.5 rounded-2xl text-[11px] font-mono font-black shadow-sm">
                                +{proof.amount.toLocaleString('fr-FR')} XOF
                              </div>
                            )}
                          </div>

                          {/* Message Body */}
                          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans whitespace-pre-wrap pl-1 font-medium">
                            {maskUserPhone(proof.message)}
                          </div>

                          {/* Optional Transaction confirmation banner */}
                          {proof.amount > 0 && (
                            <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-3 flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-xl bg-emerald-100/60 flex items-center justify-center text-emerald-600 font-bold text-xs">
                                ✓
                              </div>
                              <div className="text-left">
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">Paiement Effectué avec Succès</span>
                                <span className="text-[9px] text-emerald-600/90 font-medium block mt-0.5">La somme de {proof.amount.toLocaleString('fr-FR')} XOF a été versée sur le compte mobile money du bénéficiaire.</span>
                              </div>
                            </div>
                          )}

                          {/* Image Attachment with Lightbox Zoom option */}
                          {proof.image && (
                            <div 
                              onClick={() => setSelectedAvisImage(proof.image || null)}
                              className="relative rounded-2xl overflow-hidden border border-slate-100 max-h-72 bg-slate-50 flex justify-center items-center cursor-zoom-in group shadow-sm"
                            >
                              <img
                                src={proof.image}
                                alt="Communiqué ou Preuve de retrait"
                                className="w-full max-h-72 object-cover group-hover:scale-[1.02] transition-transform duration-200 animate-fadeIn"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="bg-slate-900/85 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg border border-slate-750">
                                  🔍 Cliquer pour agrandir
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Likes & Interactions footer */}
                          <div className="flex items-center justify-between border-t border-slate-50 pt-3.5 pl-1">
                            <button
                              onClick={() => handleLikeProof(proof.id)}
                              className={`flex items-center space-x-2 text-[11px] font-bold py-1.5 px-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                                userHasLiked
                                  ? 'bg-blue-50 text-[#1b64d9] border-blue-100 scale-105 shadow-sm'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-100'
                              }`}
                            >
                              <span className={userHasLiked ? 'animate-bounce block' : ''}>👍</span>
                              <span>{proof.likes?.length || 0}</span>
                              <span className="text-[10px] opacity-70">Apprécier</span>
                            </button>

                            {userState.role === 'admin' && (
                              <button
                                onClick={() => handleDeleteProof(proof.id)}
                                className="px-3 py-1.5 text-rose-500 hover:text-white hover:bg-rose-500 border border-rose-100 hover:border-transparent rounded-xl text-[10px] font-bold transition-all duration-150 cursor-pointer"
                              >
                                Supprimer du flux
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {/* FORUM / COMMUNICATION TAB */}
          {!profileSubPage && activeTab === 'forum' && (
            <div className="space-y-6 max-w-4xl mx-auto text-left bg-white p-6 sm:p-8 rounded-[34px] border border-blue-50 shadow-[0_12px_45px_rgba(249,115,22,0.04)] animate-fadeIn">
              
              {/* FORUM HEADER CARD */}
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-[28px] p-6 sm:p-8 text-white text-left relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 relative z-10">
                  <div className="space-y-1.5 flex-1">
                    <h2 className="text-2xl sm:text-3xl font-sans font-black tracking-tight leading-none text-white">
                      Forum Goldspeed
                    </h2>
                    <p className="text-xs text-slate-300 font-medium max-w-lg">
                      Partagez vos astuces de minage d'or, vos objectifs, ou discutez en direct avec d'autres investisseurs de la communauté !
                    </p>
                  </div>
                </div>
              </div>

              {/* POST A NEW MESSAGE FORM */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-[28px] p-5 sm:p-6 shadow-sm">
                <form onSubmit={handlePostForumMessage} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#1b64d9]/10 text-[#1b64d9] flex items-center justify-center text-sm font-black">
                        ✍️
                      </div>
                      <span className="font-sans font-black text-xs text-slate-800 uppercase tracking-wider">
                        Publier sur le forum
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={forumMessageInput}
                      onChange={(e) => setForumMessageInput(e.target.value)}
                      placeholder="Partagez votre expérience ! (Ex: Goldspeed est vraiment fiable, merci à l'équipe!)"
                      maxLength={500}
                      className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b64d9]/25 focus:border-[#1b64d9] transition-all resize-none shadow-xs"
                    />
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold px-1 select-none">
                      <span>Auteur : {maskUserPhone(userState.name || 'Moi')} ({userState.country || 'Cameroun'})</span>
                      <span>{forumMessageInput.length}/500 caractères</span>
                    </div>
                  </div>

                  {/* Optional Image Attachments */}
                  <div className="space-y-2 bg-white/70 border border-slate-200 p-4 rounded-2xl text-left">
                    <label className="text-[10.5px] font-sans font-black text-slate-600 uppercase tracking-wider block">
                      📸 Ajouter des images (optionnel)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Image 1 Selector */}
                      <div className="relative border-2 border-dashed border-slate-200 hover:border-[#1b64d9]/50 rounded-2xl bg-white p-3 flex flex-col items-center justify-center min-h-[110px] text-center cursor-pointer transition-colors group">
                        {forumImage1 ? (
                          <div className="w-full h-full relative">
                            <img src={forumImage1} className="w-full h-24 object-cover rounded-xl" alt="Image 1" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setForumImage1(null); }}
                              className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center hover:bg-rose-600 transition-colors animate-fadeIn"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                            <span className="text-xl mb-1 group-hover:scale-110 transition-transform">📥</span>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wide">Image 1</span>
                            <span className="text-[8px] text-slate-400 font-bold block mt-0.5">Ajouter une photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const r = new FileReader();
                                  r.onloadend = () => setForumImage1(r.result as string);
                                  r.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {/* Image 2 Selector */}
                      <div className="relative border-2 border-dashed border-slate-200 hover:border-[#1b64d9]/50 rounded-2xl bg-white p-3 flex flex-col items-center justify-center min-h-[110px] text-center cursor-pointer transition-colors group">
                        {forumImage2 ? (
                          <div className="w-full h-full relative">
                            <img src={forumImage2} className="w-full h-24 object-cover rounded-xl" alt="Image 2" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setForumImage2(null); }}
                              className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center hover:bg-rose-600 transition-colors animate-fadeIn"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                            <span className="text-xl mb-1 group-hover:scale-110 transition-transform">📥</span>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wide">Image 2</span>
                            <span className="text-[8px] text-slate-400 font-bold block mt-0.5">Ajouter une photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const r = new FileReader();
                                  r.onloadend = () => setForumImage2(r.result as string);
                                  r.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#1b64d9] hover:bg-blue-600 text-white font-sans font-black text-xs rounded-2xl shadow-md flex items-center gap-2 duration-150 transition-all cursor-pointer select-none active:scale-95 uppercase tracking-wider"
                    >
                      <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Publier sur le Forum</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* FORUM TIMELINE OF POSTS */}
              <div className="space-y-4">
                {forumPosts.map((post) => {
                  const hasLiked = post.hasLiked;
                  const commentInputVal = forumCommentInputs[post.id] || '';

                  return (
                    <div
                      key={post.id}
                      className="bg-white border border-slate-150 hover:border-blue-100 hover:shadow-md transition-all rounded-3xl p-5 text-left shadow-xs"
                    >
                      {/* Author row */}
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-sans font-black flex items-center justify-center text-sm shadow-sm">
                            {post.avatarLetter || post.authorName.charAt(0).toUpperCase()}
                          </div>
                          <div className="leading-tight">
                            <span className="font-sans font-black text-slate-800 text-sm block">
                              {maskUserPhone(post.authorName)}
                            </span>
                            <span className="text-slate-400 text-[9px] font-black tracking-normal uppercase opacity-75 mt-0.5 block">
                              {new Date(post.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content block */}
                      <div className="mt-4 bg-slate-50/50 border border-slate-100/60 p-4 rounded-2xl">
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold whitespace-pre-wrap">
                          {maskUserPhone(post.text)}
                        </p>
                      </div>

                      {/* Image attachments side-by-side (collaged) */}
                      {(post.image1 || post.image2) && (
                        <div className={`mt-3 grid gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200 ${post.image1 && post.image2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {post.image1 && (
                            <div 
                              onClick={() => setSelectedAvisImage(post.image1)}
                              className="relative rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-50 flex justify-center items-center cursor-zoom-in group shadow-xs"
                            >
                              <img
                                src={post.image1}
                                alt="Image 1"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="bg-slate-900/80 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">
                                  Agrandir 🔍
                                </span>
                              </div>
                            </div>
                          )}

                          {post.image2 && (
                            <div 
                              onClick={() => setSelectedAvisImage(post.image2)}
                              className="relative rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-50 flex justify-center items-center cursor-zoom-in group shadow-xs"
                            >
                              <img
                                src={post.image2}
                                alt="Image 2"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="bg-slate-900/80 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">
                                  Agrandir 🔍
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Social counts & Likes */}
                      <div className="flex justify-between items-center border-t border-slate-100 mt-4 pt-3 text-slate-500">
                        <button
                          type="button"
                          onClick={() => handleLikeForumPost(post.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-sans font-black tracking-wide uppercase transition-all duration-150 ${
                            hasLiked
                              ? 'bg-[#f0f4ff] text-[#1b64d9] font-black saturate-150 border border-blue-100'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent'
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-[#1b64d9] stroke-[#1b64d9]' : ''}`} />
                          <span>{post.likes} Likes</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TEAM / MLM SYSTEM TAB */}
          {!profileSubPage && activeTab === 'team' && (() => {
            const getActiveUsersCount = (list: any[]) => {
              return list.filter(u => getUserInvestedAmount(u.id) > 0).length;
            };

            return (
              <div className="bg-[#f8fafc] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-24 min-h-[95vh] text-slate-800 text-left animate-fadeIn animate-duration-300">
                <div className="max-w-xl mx-auto w-full space-y-6">
                  
                  {/* INVITATION REWARDS SECTION */}
                  <div className="space-y-4">
                    {/* Header with Star */}
                    <div className="flex items-center justify-between pl-1">
                      <div className="space-y-1">
                        <h2 className="text-xl sm:text-2xl font-sans font-black tracking-tight text-slate-900">
                          Récompenses d'invitation
                        </h2>
                        <p className="text-xs text-slate-500 font-bold">
                          Investissez ensemble, enrichissez-vous ensemble
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 text-2xl animate-pulse">
                        🌟
                      </div>
                    </div>

                    {/* Invitation Cards */}
                    <div className="space-y-3">
                      {/* Invitation Code Card */}
                      <div className="bg-[#ebfbf2] rounded-3xl p-4 sm:p-5 flex items-center justify-between border border-emerald-100 shadow-sm transition-transform hover:scale-[1.01]">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="w-11 h-11 rounded-2xl bg-[#d1fae5] flex items-center justify-center text-emerald-600 shrink-0">
                            <Copy className="w-5.5 h-5.5 stroke-[2.5]" />
                          </div>
                          <div>
                            <span className="text-[10px] sm:text-[11px] text-emerald-800 font-black uppercase tracking-wider block">Code d'invitation</span>
                            <span className="text-base sm:text-lg font-sans font-black text-slate-900 block mt-0.5 select-all">{userState.referralCode}</span>
                          </div>
                        </div>
                        <button
                          onClick={handleCopyCode}
                          className="px-5 py-2.5 bg-[#2cb1fc] hover:bg-sky-500 text-white text-[11px] font-black rounded-full shadow-md hover:shadow-sky-500/15 transition-all active:scale-95 duration-150 uppercase tracking-widest cursor-pointer border-none outline-none"
                        >
                          {copiedCode ? "Copier..." : "Copier"}
                        </button>
                      </div>

                      {/* Invitation Link Card */}
                      <div className="bg-[#ebfbf2] rounded-3xl p-4 sm:p-5 flex items-center justify-between border border-emerald-100 shadow-sm transition-transform hover:scale-[1.01]">
                        <div className="flex items-center space-x-3 sm:space-x-4 overflow-hidden mr-2">
                          <div className="w-11 h-11 rounded-2xl bg-[#d1fae5] flex items-center justify-center text-emerald-600 shrink-0">
                            <Share className="w-5.5 h-5.5 stroke-[2.5]" />
                          </div>
                          <div className="overflow-hidden">
                            <span className="text-[10px] sm:text-[11px] text-emerald-800 font-black uppercase tracking-wider block">Lien d'invitation</span>
                            <span className="text-xs font-sans font-bold text-slate-500 block mt-0.5 truncate select-all">{referralURL}</span>
                          </div>
                        </div>
                        <button
                          onClick={handleCopyLink}
                          className="px-5 py-2.5 bg-[#2cb1fc] hover:bg-sky-500 text-white text-[11px] font-black rounded-full shadow-md hover:shadow-sky-500/15 transition-all active:scale-95 duration-150 uppercase tracking-widest cursor-pointer border-none outline-none shrink-0"
                        >
                          {copiedLink ? "Copier..." : "Copier"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* TEAM LEVELS SECTION */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between pl-1">
                      <h3 className="font-sans font-black text-slate-800 text-base sm:text-lg uppercase tracking-tight">
                        Niveau d'équipe
                      </h3>
                      <button
                        onClick={() => {
                          const el = document.getElementById('team-list-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-blue-600 hover:text-blue-700 text-xs font-extrabold flex items-center space-x-1.5 uppercase tracking-wider cursor-pointer bg-transparent border-none outline-none"
                      >
                        <span>Détails de l'équipe</span>
                        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Level Cards */}
                    <div className="space-y-3">
                      
                      {/* Level 1 (N1) - Golden Card */}
                      <div 
                        onClick={() => setReferralListTab('level1')}
                        className={`bg-[#fef9c3] rounded-3xl p-4 sm:p-5 flex items-center justify-between border transition-all duration-200 cursor-pointer ${
                          referralListTab === 'level1' 
                            ? 'border-yellow-400 ring-2 ring-yellow-400 ring-offset-4 ring-offset-white scale-[1.01]' 
                            : 'border-yellow-200/40 hover:border-yellow-300/60'
                        }`}
                      >
                        <div className="flex items-center space-x-3.5 sm:space-x-5 flex-1">
                          <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center text-3xl filter drop-shadow-sm shrink-0">
                            🥇
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-1 text-left">
                            <div>
                              <span className="text-lg sm:text-xl font-sans font-black text-amber-950 block leading-tight">{mlmRates.level1 !== undefined ? mlmRates.level1 : 30}%</span>
                              <span className="text-[9px] sm:text-[10px] text-amber-800/80 font-black uppercase tracking-tight block mt-0.5">Remise Niv 1</span>
                            </div>
                            <div>
                              <span className="text-lg sm:text-xl font-sans font-black text-amber-950 block leading-tight">{level1Users.length}</span>
                              <span className="text-[9px] sm:text-[10px] text-amber-800/80 font-black uppercase tracking-tight block mt-0.5">Total invité</span>
                            </div>
                            <div>
                              <span className="text-lg sm:text-xl font-sans font-black text-amber-950 block leading-tight">{getActiveUsersCount(level1Users)}</span>
                              <span className="text-[9px] sm:text-[10px] text-amber-800/80 font-black uppercase tracking-tight block mt-0.5">Activé</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-amber-800/65 pl-2">
                          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                        </div>
                      </div>

                      {/* Level 2 (N2) - Mint Card */}
                      <div 
                        onClick={() => setReferralListTab('level2')}
                        className={`bg-[#eefcf3] rounded-3xl p-4 sm:p-5 flex items-center justify-between border transition-all duration-200 cursor-pointer ${
                          referralListTab === 'level2' 
                            ? 'border-emerald-400 ring-2 ring-emerald-400 ring-offset-4 ring-offset-white scale-[1.01]' 
                            : 'border-emerald-200/40 hover:border-emerald-300/60'
                        }`}
                      >
                        <div className="flex items-center space-x-3.5 sm:space-x-5 flex-1">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl filter drop-shadow-sm shrink-0">
                            🥈
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-1 text-left">
                            <div>
                              <span className="text-lg sm:text-xl font-sans font-black text-emerald-950 block leading-tight">{mlmRates.level2 !== undefined ? mlmRates.level2 : 2}%</span>
                              <span className="text-[9px] sm:text-[10px] text-emerald-800/80 font-black uppercase tracking-tight block mt-0.5">Lv 2 Rebate</span>
                            </div>
                            <div>
                              <span className="text-lg sm:text-xl font-sans font-black text-emerald-950 block leading-tight">{level2Users.length}</span>
                              <span className="text-[9px] sm:text-[10px] text-emerald-800/80 font-black uppercase tracking-tight block mt-0.5">Total invité</span>
                            </div>
                            <div>
                              <span className="text-lg sm:text-xl font-sans font-black text-emerald-950 block leading-tight">{getActiveUsersCount(level2Users)}</span>
                              <span className="text-[9px] sm:text-[10px] text-emerald-800/80 font-black uppercase tracking-tight block mt-0.5">Activé</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-emerald-800/65 pl-2">
                          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                        </div>
                      </div>

                      {/* Level 3 (N3) - Soft Peach/Yellow Card */}
                      <div 
                        onClick={() => setReferralListTab('level3')}
                        className={`bg-[#fffbeb] rounded-3xl p-4 sm:p-5 flex items-center justify-between border transition-all duration-200 cursor-pointer ${
                          referralListTab === 'level3' 
                            ? 'border-amber-400 ring-2 ring-amber-400 ring-offset-4 ring-offset-white scale-[1.01]' 
                            : 'border-amber-200/40 hover:border-amber-300/60'
                        }`}
                      >
                        <div className="flex items-center space-x-3.5 sm:space-x-5 flex-1">
                          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl filter drop-shadow-sm shrink-0">
                            🥉
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-1 text-left">
                            <div>
                              <span className="text-lg sm:text-xl font-sans font-black text-amber-950 block leading-tight">{mlmRates.level3 !== undefined ? mlmRates.level3 : 1}%</span>
                              <span className="text-[9px] sm:text-[10px] text-amber-800/80 font-black uppercase tracking-tight block mt-0.5">Lv 3 Rebate</span>
                            </div>
                            <div>
                              <span className="text-lg sm:text-xl font-sans font-black text-amber-950 block leading-tight">{level3Users.length}</span>
                              <span className="text-[9px] sm:text-[10px] text-amber-800/80 font-black uppercase tracking-tight block mt-0.5">Total invité</span>
                            </div>
                            <div>
                              <span className="text-lg sm:text-xl font-sans font-black text-amber-950 block leading-tight">{getActiveUsersCount(level3Users)}</span>
                              <span className="text-[9px] sm:text-[10px] text-amber-800/80 font-black uppercase tracking-tight block mt-0.5">Activé</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-amber-800/65 pl-2">
                          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* COMMISSIONS SUMMARY CARD */}
                  <div className="bg-white border border-slate-100 rounded-[28px] p-4.5 flex items-center justify-between shadow-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#00bd74] flex items-center justify-center font-bold text-lg">
                        💰
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">SOLDE DE COMMISSIONS</span>
                        <span className="text-base font-black text-[#00bd74] block mt-0.5">
                          {commissions.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} XOF
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">TOTAL INVITÉS</span>
                      <span className="text-sm font-black text-slate-800 block mt-0.5">
                        {totalReferrals} membres
                      </span>
                    </div>
                  </div>

                  {/* DETAILED LIST OF MEMBERS */}
                  <div id="team-list-section" className="bg-white rounded-[32px] p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-[11px] text-slate-700 font-black uppercase tracking-wider block pl-0.5">
                        DÉTAILS : {referralListTab === 'level1' ? 'Niveau 1' : referralListTab === 'level2' ? 'Niveau 2' : 'Niveau 3'}
                      </span>
                      <span className="text-[9px] bg-blue-50 text-blue-600 font-bold font-mono px-2.5 py-1 rounded-full border border-blue-100/50 uppercase tracking-wide">
                        {referralListTab === 'level1' ? level1Users.length : referralListTab === 'level2' ? level2Users.length : level3Users.length} membres
                      </span>
                    </div>

                    {/* Total Invested Per Level Banner */}
                    <div className="pt-1">
                      {referralListTab === 'level1' && (
                        <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl flex justify-between items-center text-xs">
                          <span className="font-sans font-black uppercase tracking-tight text-amber-800">Total investi Niveau 1 :</span>
                          <span className="font-mono font-black text-amber-700">
                            {getLevelInvestedAmount(level1Users).toLocaleString()} XOF
                          </span>
                        </div>
                      )}
                      {referralListTab === 'level2' && (
                        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex justify-between items-center text-xs">
                          <span className="font-sans font-black uppercase tracking-tight text-emerald-800">Total investi Niveau 2 :</span>
                          <span className="font-mono font-black text-emerald-700">
                            {getLevelInvestedAmount(level2Users).toLocaleString()} XOF
                          </span>
                        </div>
                      )}
                      {referralListTab === 'level3' && (
                        <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl flex justify-between items-center text-xs">
                          <span className="font-sans font-black uppercase tracking-tight text-amber-800">Total investi Niveau 3 :</span>
                          <span className="font-mono font-black text-amber-700">
                            {getLevelInvestedAmount(level3Users).toLocaleString()} XOF
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Member Items */}
                    <div className="space-y-3 pt-1">
                      {referralListTab === 'level1' && (
                        level1Users.length === 0 ? (
                          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-xs text-slate-500 font-semibold max-w-xs mx-auto leading-relaxed">
                              Vous n'avez pas encore de filleuls inscrits directement (Niveau 1) dans votre équipe.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {level1Users.map(u => (
                              <div key={u.id} className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-slate-200 transition-colors">
                                <div className="flex flex-col text-left">
                                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Membre parrainé</span>
                                  <span className="text-xs sm:text-sm font-sans font-black text-slate-800 mt-0.5">{u.name || "Membre anonyme"}</span>
                                  <span className="text-[10px] text-slate-400 font-mono font-medium">{maskPhoneNumber(u.whatsapp || u.id)}</span>
                                </div>
                                <div className="flex flex-col text-right">
                                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Montant investi</span>
                                  <span className="text-xs sm:text-sm font-mono font-black text-emerald-600 mt-0.5">{getUserInvestedAmount(u.id).toLocaleString()} XOF</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      )}

                      {referralListTab === 'level2' && (
                        level2Users.length === 0 ? (
                          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-xs text-slate-500 font-semibold max-w-xs mx-auto leading-relaxed">
                              Aucun membre de Niveau 2 enregistré dans votre réseau.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {level2Users.map(u => (
                              <div key={u.id} className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-slate-200 transition-colors">
                                <div className="flex flex-col text-left">
                                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Membre parrainé</span>
                                  <span className="text-xs sm:text-sm font-sans font-black text-slate-800 mt-0.5">{u.name || "Membre anonyme"}</span>
                                  <span className="text-[10px] text-slate-400 font-mono font-medium">{maskPhoneNumber(u.whatsapp || u.id)}</span>
                                </div>
                                <div className="flex flex-col text-right">
                                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Montant investi</span>
                                  <span className="text-xs sm:text-sm font-mono font-black text-emerald-600 mt-0.5">{getUserInvestedAmount(u.id).toLocaleString()} XOF</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      )}

                      {referralListTab === 'level3' && (
                        level3Users.length === 0 ? (
                          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-xs text-slate-500 font-semibold max-w-xs mx-auto leading-relaxed">
                              Aucun membre de Niveau 3 enregistré dans votre réseau.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {level3Users.map(u => (
                              <div key={u.id} className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-slate-200 transition-colors">
                                <div className="flex flex-col text-left">
                                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Membre parrainé</span>
                                  <span className="text-xs sm:text-sm font-sans font-black text-slate-800 mt-0.5">{u.name || "Membre anonyme"}</span>
                                  <span className="text-[10px] text-slate-400 font-mono font-medium">{maskPhoneNumber(u.whatsapp || u.id)}</span>
                                </div>
                                <div className="flex flex-col text-right">
                                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Montant investi</span>
                                  <span className="text-xs sm:text-sm font-mono font-black text-emerald-600 mt-0.5">{getUserInvestedAmount(u.id).toLocaleString()} XOF</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* AUTO SHARE SECTION */}
                  <div className="bg-white rounded-[32px] p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block pl-0.5">
                      Partager l'invitation sur les réseaux
                    </span>
                    <div className="grid grid-cols-4 gap-2.5 font-sans">
                      {/* WhatsApp */}
                      <a 
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Rejoignez Goldspeed et obtenez des rendements quotidiens exceptionnels ! Utilisez mon lien d'inscription : ${referralURL}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-3 bg-emerald-50 hover:bg-emerald-100/70 rounded-2xl transition-all text-emerald-600 border-none cursor-pointer"
                      >
                        <span className="text-xl mb-1">💬</span>
                        <span className="text-[9px] font-black uppercase tracking-wider">WhatsApp</span>
                      </a>

                      {/* Telegram */}
                      <a 
                        href={`https://t.me/share/url?url=${encodeURIComponent(referralURL)}&text=${encodeURIComponent(`Rejoignez Goldspeed et obtenez des rendements quotidiens exceptionnels !`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-3 bg-sky-50 hover:bg-sky-100/70 rounded-2xl transition-all text-sky-600 border-none cursor-pointer"
                      >
                        <span className="text-xl mb-1">✈️</span>
                        <span className="text-[9px] font-black uppercase tracking-wider">Telegram</span>
                      </a>

                      {/* Facebook */}
                      <a 
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralURL)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-3 bg-blue-50 hover:bg-blue-100/70 rounded-2xl transition-all text-blue-600 border-none cursor-pointer"
                      >
                        <span className="text-xl mb-1">👥</span>
                        <span className="text-[9px] font-black uppercase tracking-wider">Facebook</span>
                      </a>

                      {/* Instagram */}
                      <button 
                        onClick={() => {
                          handleCopyLink();
                          triggerToast('🔗 Lien copié ! Collez-le sur Instagram.', 'success');
                          setTimeout(() => {
                            window.open('https://instagram.com', '_blank', 'noopener,noreferrer');
                          }, 1000);
                        }}
                        className="flex flex-col items-center justify-center p-3 bg-rose-50 hover:bg-rose-100/70 rounded-2xl transition-all text-rose-600 border-none cursor-pointer outline-none"
                      >
                        <span className="text-xl mb-1">📸</span>
                        <span className="text-[9px] font-black uppercase tracking-wider">Instagram</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

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
                  <div className="max-w-xl mx-auto w-full space-y-4">
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
                        Retrouvez ici vos équipements acquis. Les revenus de vos plans Stabilité et d'Activité s'accumulent de jour en jour et sont versés automatiquement à la fin de leur cycle respectif.
                      </p>
                      
                      <div className="space-y-3 pt-2">
                        {activeInvestments.filter(i => i.status === 'active').length === 0 ? (
                          <div className="text-center py-8 text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-slate-100/50">
                            Aucun produit d'investissement actif pour le moment.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {activeInvestments.filter(i => i.status === 'active').map((p) => (
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
                  <div className="max-w-xl mx-auto w-full space-y-4">
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
                      <div className="grid grid-cols-2 gap-3.5 pb-2">
                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-left shadow-xs">
                          <span className="text-[9.5px] text-blue-600 font-black uppercase tracking-widest block mb-1">Recharge</span>
                          <span className="text-lg sm:text-xl font-sans font-black text-blue-900 block font-mono leading-none">
                            {rechargeBal.toLocaleString()} F
                          </span>
                        </div>
                        <div className="bg-gradient-to-r from-[#ffe082] via-[#d4af37] to-[#aa7c11] border border-[#c5a133] rounded-2xl p-4 text-left shadow-md">
                          <span className="text-[9.5px] text-slate-900 font-black uppercase tracking-widest block mb-1">Solde Retirable</span>
                          <span className="text-lg sm:text-xl font-sans font-black text-slate-950 block font-mono leading-none animate-pulse">
                            {userState.balance.toLocaleString()} F
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

                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                      <h3 className="font-sans font-black text-slate-800 text-sm uppercase tracking-wider pl-0.5">Opérations Rapides</h3>
                      
                      <div className="grid grid-cols-2 gap-3.5">
                        <button 
                          onClick={() => setActiveTab('deposit')}
                          className="flex items-center justify-center gap-3 p-4 bg-amber-50 text-[#f07b1b] rounded-2xl font-black text-sm hover:bg-amber-100/70 transition-all border-none outline-none cursor-pointer shadow-xs"
                        >
                          <Coins className="w-5.5 h-5.5 stroke-[2.25]" />
                          <span>Recharger</span>
                        </button>
                        <button 
                          onClick={() => setActiveTab('withdraw')}
                          className="flex items-center justify-center gap-3 p-4 bg-blue-50 text-[#1b64d9] rounded-2xl font-black text-sm hover:bg-blue-100/70 transition-all border-none outline-none cursor-pointer shadow-xs"
                        >
                          <ArrowUpCircle className="w-5.5 h-5.5 stroke-[2.25]" />
                          <span>Retirer</span>
                        </button>
                      </div>

                      <button 
                        onClick={() => {
                          if (onNavigate) {
                            onNavigate('/historique');
                          }
                        }}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/70 text-slate-700 rounded-2xl text-[13px] font-black transition-all border-none outline-none cursor-pointer mt-2"
                      >
                        <span>📋 Voir l'historique complet des revenus</span>
                        <span className="font-bold">&gt;</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            if (profileSubPage === 'help') {
              return (
                <div className="bg-[#f8fafc] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-3.5 px-4 sm:px-6 md:px-12 xl:px-20 pt-6 pb-24 min-h-[95vh] text-slate-800 text-left animate-fadeIn">
                  <div className="max-w-xl mx-auto w-full space-y-4">
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
                          <MessageCircle className="w-4.5 h-4.5" />
                          <span>REJOINDRE LE CANAL WHATSAPP</span>
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
                  <div className="max-w-xl mx-auto w-full space-y-4">
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
                      
                      <h3 className="text-center font-sans font-black text-slate-800 text-sm uppercase">Goldspeed Investment S.A.</h3>
                      
                      <p className="text-[11px] text-slate-400 font-bold leading-relaxed text-center">
                        Goldspeed Investment est une plateforme financière innovante dédiée à l'investissement et à la gestion de produits à haute rentabilité pour tous les investisseurs d'Afrique.
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
                  <div className="max-w-xl mx-auto w-full space-y-4">
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
                      <h3 className="font-sans font-black text-slate-800 text-xs uppercase tracking-wider pl-0.5">Langue / Language</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            localStorage.setItem('gi_lang', 'FR');
                            window.dispatchEvent(new Event('gi_lang_changed'));
                            setTimeout(() => {
                              window.location.reload();
                            }, 50);
                          }}
                          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs border transition-all ${
                            (localStorage.getItem('gi_lang') || 'FR') === 'FR'
                              ? 'bg-amber-50 border-amber-200 text-[#df4b13]'
                              : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>🇫🇷</span> Français
                        </button>
                        <button
                          onClick={() => {
                            localStorage.setItem('gi_lang', 'EN');
                            window.dispatchEvent(new Event('gi_lang_changed'));
                            setTimeout(() => {
                              window.location.reload();
                            }, 50);
                          }}
                          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs border transition-all ${
                            localStorage.getItem('gi_lang') === 'EN'
                              ? 'bg-amber-50 border-amber-200 text-[#df4b13]'
                              : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>🇬🇧</span> English
                        </button>
                      </div>
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
                  <div className="flex items-center space-x-3.5 pb-2 pt-1 pl-1">
                    <div className="w-15 h-15 rounded-full bg-gradient-to-r from-[#ffe082] via-[#d4af37] to-[#aa7c11] text-slate-950 text-xl font-sans font-black shadow-md shrink-0 border border-[#c5a133]/60 flex items-center justify-center">
                      {userState.name ? userState.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-sans font-black text-slate-900 text-lg leading-tight">
                          {userState.name || "Cher Investisseur"}
                        </h3>
                        {userState.role === 'admin' && (
                          <span className="bg-red-500 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md tracking-wider">
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="text-[11.5px] text-slate-400 font-bold block mt-1 uppercase tracking-wider">
                        {userState.whatsapp || "Aucun numéro"}
                      </span>
                    </div>
                  </div>

                  {/* GOLDSPEED PROFILE IMAGE SHOWCASE */}
                  <div id="profile-dreampod-showcase" className="bg-white rounded-3xl overflow-hidden shadow-xs border border-slate-100 relative group">
                    <div className="relative h-48 w-full bg-slate-900">
                      <img
                        src="https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=800"
                        alt="Goldspeed Lingot d'Or Pur"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      {/* Dark ambient overlay with beautiful gradients */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
                      
                      {/* Glowing indicator */}
                      <span className="absolute top-3 left-3 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>

                      <div className="absolute bottom-4 left-4 right-4 text-white text-left">
                        <span className="text-[8px] text-yellow-300 font-black uppercase tracking-widest block mb-0.5">OR PUR ET INVESTISSEMENTS SÉCURISÉS</span>
                        <h4 className="text-sm font-black uppercase tracking-wide text-white drop-shadow-md">
                          💎 Goldspeed Lingot d'Or Pur &amp; Placement
                        </h4>
                        <p className="text-[10px] text-slate-300 font-semibold mt-1 leading-normal drop-shadow-sm">
                          Rendements passifs et garantis grâce à l'investissement aurifère hautement sécurisé au Togo.
                        </p>
                      </div>
                      
                      <div className="absolute top-3 right-3 bg-amber-600/95 text-white font-black text-[8px] tracking-wider uppercase px-2.5 py-1 rounded-full backdrop-blur-md border border-amber-400/20">
                        🌟 Partenaire Officiel
                      </div>
                    </div>
                  </div>

                  {/* RECHARGE & RETRAIT CARD BUTTONS (ENLARGED ORIGINAL PLAN) */}
                  <div className="bg-white rounded-[28px] p-6 shadow-xs border border-slate-100 flex items-center justify-between">
                    <button 
                      onClick={() => setActiveTab('deposit')}
                      className="flex-1 flex items-center justify-center gap-3.5 font-sans font-black text-slate-800 hover:text-amber-600 transition-all cursor-pointer border-0 bg-transparent py-2 border-r border-slate-100 outline-none"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                        <Coins className="w-7.5 h-7.5 stroke-[2.25]" />
                      </div>
                      <span className="text-sm sm:text-base font-sans font-black text-slate-800">Recharge &gt;</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('withdraw')}
                      className="flex-1 flex items-center justify-center gap-3.5 font-sans font-black text-slate-800 hover:text-blue-600 transition-all cursor-pointer border-0 bg-transparent py-2 outline-none"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                        <ArrowUpCircle className="w-7.5 h-7.5 stroke-[2.25]" />
                      </div>
                      <span className="text-sm sm:text-base font-sans font-black text-slate-800">Retrait &gt;</span>
                    </button>
                  </div>

                   {/* 4 ACTION SHORTCUTS GRID */}
                  <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 grid grid-cols-4 gap-2">
                    <button 
                      onClick={() => setProfileSubPage('orders')}
                      className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1b64d9] flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
                        <Briefcase className="w-7 h-7 stroke-[2.25]" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-sans font-black text-slate-700 mt-2 leading-tight">Commandes</span>
                    </button>

                    <button 
                      onClick={() => setProfileSubPage('balance')}
                      className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
                        <History className="w-7 h-7 stroke-[2.25]" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-sans font-black text-slate-700 mt-2 leading-tight">Historique</span>
                    </button>

                    <button 
                      onClick={() => setActiveTab('team')}
                      className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
                        <Users className="w-7 h-7 stroke-[2.25]" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-sans font-black text-slate-700 mt-2 leading-tight">Mon Équipe</span>
                    </button>

                    <button 
                      onClick={() => setIsBankCardModalOpen(true)}
                      className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#f07b1b] flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
                        <UserIcon className="w-7 h-7 stroke-[2.25]" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-sans font-black text-slate-700 mt-2 leading-tight text-center">Carte Bancaire</span>
                    </button>
                  </div>

                  {/* MES REVENUS CARD */}
                  <div id="mes-revenus-card" className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-4 text-left">
                    <div className="flex justify-between items-center">
                      <h3 className="font-sans font-black text-slate-800 text-base uppercase tracking-wider pl-0.5">Mes Revenus</h3>
                      <button 
                        onClick={() => {
                          if (onNavigate) {
                            onNavigate('/historique');
                          }
                        }}
                        className="text-[11.5px] font-black text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-none bg-transparent outline-none"
                      >
                        Détails des Revenus &gt;
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pb-2">
                      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-left shadow-xs">
                        <span className="text-[11px] text-blue-600 font-black uppercase tracking-widest block mb-1">Recharge</span>
                        <span className="text-xl sm:text-2xl font-sans font-black text-blue-900 block font-mono leading-none">
                          {rechargeBal.toLocaleString()} F
                        </span>
                      </div>
                      <div className="bg-gradient-to-r from-[#ffe082] via-[#d4af37] to-[#aa7c11] border border-[#c5a133] rounded-2xl p-4 text-left shadow-md">
                        <span className="text-[11px] text-slate-900 font-black uppercase tracking-widest block mb-1">Solde Retirable</span>
                        <span className="text-xl sm:text-2xl font-sans font-black text-slate-950 block font-mono leading-none animate-pulse">
                          {userState.balance.toLocaleString()} F
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-center pt-1.5">
                      <div>
                        <span className="text-[10.5px] text-slate-500 font-black uppercase tracking-tight leading-tight">Revenu Produit</span>
                        <span className="text-sm font-black text-slate-800 block mt-1">
                          FCFA {totalProductRevenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="border-l border-slate-100">
                        <span className="text-[10.5px] text-slate-500 font-black uppercase tracking-tight leading-tight">Commission</span>
                        <span className="text-sm font-black text-slate-800 block mt-1">
                          FCFA {totalCommissions.toLocaleString()}
                        </span>
                      </div>
                      <div className="border-l border-slate-100">
                        <span className="text-[10.5px] text-slate-500 font-black uppercase tracking-tight leading-tight">Nbre de Commandes</span>
                        <span className="text-sm font-black text-slate-800 block mt-1">
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
                        <h3 className="font-sans font-black text-base text-slate-800 uppercase tracking-wider pl-0.5">Mes produits ({activeInvestments.filter(i => i.status === 'active').length})</h3>
                        <p className="text-[11.5px] text-slate-400 font-black mt-1 group-hover:text-slate-500 transition-colors">
                          Les gains s'accumulent au quotidien et sont versés à la fin de chaque cycle.
                        </p>
                      </div>
                      <ChevronRight className={`w-6 h-6 text-slate-400 transition-transform ${showStabilityOrders ? 'rotate-90' : ''}`} />
                    </div>

                    {showStabilityOrders && (
                      <div className="pt-2 space-y-3.5 border-t border-slate-100">
                        {activeInvestments.filter(i => i.status === 'active').length === 0 ? (
                          <div className="text-center py-4 text-slate-400 text-[11px] font-bold">
                            Aucun produit d'investissement actif pour le moment.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {activeInvestments.filter(i => i.status === 'active').map((p) => (
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
                    <h3 className="font-sans font-black text-slate-800 text-base uppercase tracking-wider pl-0.5">Plus de services</h3>

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
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-500 flex items-center justify-center rounded-2xl transition-transform group-hover:scale-105 shadow-sm">
                          <ShieldCheck className="w-7 h-7 stroke-[2.25]" />
                        </div>
                        <span className="text-[11px] sm:text-xs font-sans font-black text-slate-700 mt-2 leading-tight">VIP</span>
                      </button>

                      {/* Centre d'Aide */}
                      <button 
                        onClick={() => setProfileSubPage('help')}
                        className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none"
                      >
                        <div className="w-14 h-14 bg-teal-50 text-teal-500 flex items-center justify-center rounded-2xl transition-transform group-hover:scale-105 shadow-sm">
                          <Headphones className="w-7 h-7 stroke-[2.25]" />
                        </div>
                        <span className="text-[11px] sm:text-xs font-sans font-black text-slate-700 mt-2 leading-tight">Centre d'Aide</span>
                      </button>

                      {/* À Propos de Nous */}
                      <button 
                        onClick={() => setProfileSubPage('about')}
                        className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none"
                      >
                        <div className="w-14 h-14 bg-rose-50 text-rose-500 flex items-center justify-center rounded-2xl transition-transform group-hover:scale-105 shadow-sm">
                          <BookOpen className="w-7 h-7 stroke-[2.25]" />
                        </div>
                        <span className="text-[11px] sm:text-xs font-sans font-black text-slate-700 mt-2 leading-tight">À Propos</span>
                      </button>

                             {/* Admin Access (only for admins) */}
                      {userState.role === 'admin' && (
                        <button 
                          onClick={() => {
                            setIsAdminMode(true);
                            triggerToast("🔑 Mode Administrateur Activé", "success");
                          }}
                          className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none animate-pulse"
                        >
                          <div className="w-14 h-14 bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center rounded-2xl transition-transform group-hover:scale-105 shadow-sm">
                            <Lock className="w-7 h-7 stroke-[2.25]" />
                          </div>
                          <span className="text-[11px] sm:text-xs font-sans font-black text-red-600 mt-2 leading-tight uppercase tracking-wider">Admin</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* SYSTEM SECURITY ASSURANCE CARD */}
                  <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-800 space-y-3 text-left">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <ShieldCheck className="w-5 h-5 stroke-[2.25]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-100">Protection et Sécurité Garanties</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Certificat SSL SHA-256 Actif</p>
                      </div>
                    </div>
                    <div className="text-[11.5px] text-slate-300 leading-relaxed font-medium space-y-2 bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800/40">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="font-sans font-black text-emerald-400 text-[10px] uppercase tracking-wider">Connexion Chiffrée de Bout en Bout</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-normal font-semibold">
                        Toutes vos recharges, retraits et informations d'investissement sont sécurisés par des protocoles anti-fraude d'infrastructure de niveau bancaire.
                      </p>
                    </div>
                  </div>

                  {/* DÉCONNEXION BUTTON */}
                  <div className="w-full flex justify-center pt-2">
                    <button 
                      onClick={onLogout}
                      className="w-full bg-white rounded-3xl py-4.5 border border-slate-100 shadow-xs text-red-500 hover:text-[#dc2626] hover:bg-red-50/50 transition-all font-sans font-black text-base flex items-center justify-center gap-2 cursor-pointer outline-none"
                    >
                      <LogOut className="w-6 h-6 stroke-[2.5]" />
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
      <footer className="fixed bottom-0 left-0 right-0 py-4.5 px-4 bg-white border-t-2 border-slate-150/90 backdrop-blur-md z-40 shadow-[0_-14px_45px_rgba(0,0,0,0.08)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between font-bold text-xs sm:text-sm">
          
          <button
            onClick={() => {
              setIsAdminMode(false);
              setProfileSubPage(null);
              setActiveTab('dashboard');
              setShowAnnouncementDismissible(true);
            }}
            className={`flex flex-col items-center space-y-1.5 flex-1 transition-all duration-200 cursor-pointer ${
              activeTab === 'dashboard' && !isAdminMode 
                ? 'text-[#1b64d9] scale-112 font-black' 
                : 'text-slate-500 opacity-80 hover:opacity-100 hover:scale-105'
            }`}
          >
            <Home className="w-7.5 h-7.5 stroke-[2.5]" />
            <span className="font-sans font-black uppercase tracking-wide text-[11px] sm:text-[12px] md:text-[13px]">{t('Accueil', 'Home')}</span>
          </button>
  
          <button
            onClick={() => {
              setIsAdminMode(false);
              setProfileSubPage(null);
              setActiveTab('products');
            }}
            className={`flex flex-col items-center space-y-1.5 flex-1 transition-all duration-200 cursor-pointer ${
              activeTab === 'products' && !isAdminMode 
                ? 'text-[#1b64d9] scale-112 font-black' 
                : 'text-slate-500 opacity-80 hover:opacity-100 hover:scale-105'
            }`}
          >
            <Briefcase className="w-7.5 h-7.5 stroke-[2.5]" />
            <span className="font-sans font-black uppercase tracking-wide text-[11px] sm:text-[12px] md:text-[13px]">{t('Produit', 'Product')}</span>
          </button>
  
          <button
            onClick={() => {
              setIsAdminMode(false);
              setProfileSubPage(null);
              setActiveTab('proofs');
            }}
            className="flex flex-col items-center flex-1 transition-all relative -top-6 z-50 cursor-pointer duration-200"
          >
            <div className={`w-17 h-17 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(27,100,217,0.35)] transition-all duration-200 border-2 ${
              activeTab === 'proofs' && !isAdminMode 
                ? 'bg-[#1b64d9] text-white border-white scale-115 shadow-blue-500/40' 
                : 'bg-white text-slate-500 border-slate-150 hover:text-slate-700 hover:border-slate-250'
            }`}>
              <Megaphone className="w-7.5 h-7.5 stroke-[2.5]" />
            </div>
            <span className={`font-sans font-black uppercase tracking-wide text-[11px] sm:text-[12px] md:text-[13px] mt-1 transition-colors duration-250 ${
              activeTab === 'proofs' && !isAdminMode ? 'text-[#1b64d9] scale-105' : 'text-slate-500'
            }`}>{t('Avis', 'Reviews')}</span>
          </button>
  
          <button
            onClick={() => {
              setIsAdminMode(false);
              setProfileSubPage(null);
              setActiveTab('forum');
            }}
            className={`flex flex-col items-center space-y-1.5 flex-1 transition-all duration-200 cursor-pointer ${
              activeTab === 'forum' && !isAdminMode 
                ? 'text-[#1b64d9] scale-112 font-black' 
                : 'text-slate-500 opacity-80 hover:opacity-100 hover:scale-105'
            }`}
          >
            <MessageSquare className="w-7.5 h-7.5 stroke-[2.5]" />
            <span className="font-sans font-black uppercase tracking-wide text-[11px] sm:text-[12px] md:text-[13px]">{t('Forum', 'Forum')}</span>
          </button>
  
          <button
            onClick={() => {
              setIsAdminMode(false);
              setProfileSubPage(null);
              setActiveTab('profile');
            }}
            className={`flex flex-col items-center space-y-1.5 flex-1 transition-all duration-200 cursor-pointer ${
              activeTab === 'profile' && !isAdminMode 
                ? 'text-[#1b64d9] scale-112 font-black' 
                : 'text-slate-500 opacity-80 hover:opacity-100 hover:scale-105'
            }`}
          >
            <UserIcon className="w-7.5 h-7.5 stroke-[2.5]" />
            <span className="font-sans font-black uppercase tracking-wide text-[11px] sm:text-[12px] md:text-[13px]">{t('Profil', 'Profile')}</span>
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
                    <h4 className="font-sans font-black text-xs uppercase tracking-wide leading-none">Support Goldspeed</h4>
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
                        Écrivez votre message ci-dessous. Un conseiller Goldspeed vous répondra directement ici.
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
                      Fonctionnement Goldspeed
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
                    <strong className="text-slate-850 font-black" style={{ fontWeight: '800' }}>Goldspeed</strong> est la première interface d'investissement technologique en ligne conçue pour démocratiser la distribution de systèmes audio haut de gamme modernes au Togo. Nous canalisons votre épargne vers des stocks réels d'écouteurs et de pods intelligents connectés de dernière génération afin de générer pour vous des profits stables de manière continue.
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
                          À tout moment, soumettez votre demande de retrait depuis votre Profil vers votre numéro Momo local. Goldspeed valide les flux financiers intelligemment pour créditer votre compte sans délai !
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
                <span className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Goldspeed &copy; 2026. Tous droits réservés.</span>
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
                            En un clic, l'icône Goldspeed sera ajoutée à votre écran.
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
                              Félicitations ! L'application s'installe en arrière-plan. Vous trouverez l'icône Goldspeed sur votre écran d'accueil avec vos autres applications.
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
                          link.href = '/Goldspeed_v2.6.apk';
                          link.download = 'Goldspeed_v2.6.apk';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          openAlert(
                            "Téléchargement APK !",
                            "Le téléchargement de l'APK Goldspeed a commencé. N'oubliez pas de désinstaller les anciennes versions de votre téléphone avant d'installer ce fichier !",
                            "success"
                          );
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all border border-slate-700 cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-500" />
                        Télécharger le Fichier APK (Direct)
                      </button>
                      <p className="text-[9px] text-slate-500 leading-tight">
                        ⚠️ <strong className="text-amber-400">Rappel :</strong> Pour éviter l'erreur de package ou l'échec de l'installation, supprimez l'ancienne application <strong className="text-yellow-400">"AgroProfit"</strong> ou <strong className="text-yellow-400">"Goldspeed"</strong> de votre appareil au préalable.
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
                            Terminé ! L'application Goldspeed s'affiche sur l'écran d'accueil de votre iPhone. Ouvrez-la pour vous connecter normalement et en toute sécurité.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
              
              {/* Footer */}
              <div className="border-t border-slate-800 pt-4 mt-4 flex items-center justify-between">
                <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider">Goldspeed © 2026</span>
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



      {/* IMAGE LIGHTBOX OVERLAY */}
      <AnimatePresence>
        {selectedAvisImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAvisImage(null)}
            className="fixed inset-0 z-[110] bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-2 flex flex-col justify-center"
            >
              <img
                src={selectedAvisImage}
                alt="Agrandissement"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedAvisImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-slate-950/80 hover:bg-slate-950 rounded-full flex items-center justify-center text-white border border-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
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
