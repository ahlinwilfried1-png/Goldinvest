import { useState, useEffect } from 'react';
import { 
  Shield, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  ChevronDown, 
  Globe, 
  HelpCircle, 
  CheckCircle2, 
  Briefcase, 
  Award, 
  Coins,
  DollarSign,
  MessageCircle,
  Send,
  Headphones
} from 'lucide-react';
import { Product } from '../types';

interface HomeProps {
  products: Product[];
  onNavigateToAuth: (isRegister: boolean) => void;
  onSelectProduct: (product: Product) => void;
  isLoggedIn: boolean;
  onGoToDashboard: () => void;
}

export default function Home({ 
  products, 
  onNavigateToAuth, 
  onSelectProduct, 
  isLoggedIn, 
  onGoToDashboard 
}: HomeProps) {
  // Live simulation variables
  const [onlineUsers, setOnlineUsers] = useState(384);
  const [totalDepositsSim, setTotalDepositsSim] = useState(48293500);
  const [totalWithdrawalsSim, setTotalWithdrawalsSim] = useState(25102500);

  // Live Payouts Ticker
  const [tickerIndex, setTickerIndex] = useState(0);
  const tickers = [
    { country: '🇨🇮', phone: '07 •••• 12', type: 'Dépôt', amount: '25 000 FCFA', plan: 'VIP 3' },
    { country: '🇧🇫', phone: '70 •••• 98', type: 'Retrait du gain', amount: '45 000 FCFA', time: 'il y a 2m' },
    { country: '🇲🇱', phone: '66 •••• 54', type: 'Investissement', amount: '50 000 FCFA', plan: 'VIP 4' },
    { country: '🇸🇳', phone: '77 •••• 11', type: 'Retrait réussi', amount: '120 000 FCFA', time: 'il y a 5m' },
    { country: '🇹🇬', phone: '90 •••• 32', type: 'Dépôt', amount: '10 000 FCFA', plan: 'VIP 2' },
    { country: '🇨🇮', phone: '05 •••• 45', type: 'Nouveau Parrainage', amount: '2 500 FCFA', level: 'Bonus Niveau 1' },
    { country: '🇧🇯', phone: '97 •••• 89', type: 'Investissement', amount: '100 000 FCFA', plan: 'VIP 5' },
  ];

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Testimonials list
  const testimonials = [
    { name: 'Kouassi Marc Arthur', country: 'Côte d’Ivoire', comment: 'Une plateforme stable avec des retraits rapides via Wave. J\'ai commencé avec 25,000 FCFA et j\'ai déjà doublé mon capital en quelques semaines.', date: 'Mai 2026', stars: 5 },
    { name: 'Idriss Traoré', country: 'Cameroun', comment: 'Le système de parrainage sur trois niveaux est ultra généreux. Mes affiliés adorent le VIP 2, et je reçois 20% instantanément sur le premier niveau.', date: 'Mai 2026', stars: 5 },
    { name: 'Fatou Diop', country: 'Sénégal', comment: 'Rien à redire sur la sécurité et la clarté. L\'assistance WhatsApp m\'a débloqué mon premier dépôt de Mobile money en 3 minutes.', date: 'Mi-Mai 2026', stars: 5 }
  ];

  // FAQ content
  const faqs = [
    { q: 'Comment fonctionne GoldInvest Premium ?', a: 'GoldInvest est une plateforme de placement automatisée à haut rendement. Vous louez un module d\'investissement VIP, qui génère des dividendes fixes payés chaque jour à heure régulière. Après expiration du plan (10 jours), vos profits cumulés peuvent être extraits instantanément.' },
    { q: 'Quels sont les montants de dépôt minimum et maximum ?', a: 'Vous pouvez participer à partir de 3 000 FCFA (VIP 1). Les dépôts s\'effectuent par les réseaux locaux Mobile Money (MTN, Orange, Moov, Wave, Wave, etc.) sans frais supplémentaires.' },
    { q: 'Comment fonctionnent les commissions de parrainage ?', a: 'Notre programme MLM vous récompense pour l\'expansion de notre écosystème sur 3 niveaux. Vous gagnez 20% de commission immédiate sur tous les achats VIP de vos amis invités de Niveau 1, 3% sur tous les achats de Niveau 2, et 1% sur tous les achats de Niveau 3.' },
    { q: 'Quel est le délai de validation des dépôts et retraits ?', a: 'Les dépôts requis sont examinés automatiquement ou manuellement par les modérateurs sous 5 à 30 minutes après vérification de la pièce justificative. Les demandes de retraits sont traitées instantanément en moins de 2 heures directement sur votre portefeuille mobile.' },
    { q: 'La plateforme est-elle sécurisée contre la perte ?', a: 'Absolument. GoldInvest s\'appuie sur des réserves physiques d\'or et des placements structurés à capital garanti pour amortir les fluctuations du marché. Vos fonds principaux restent protégés.' }
  ];

  useEffect(() => {
    // Oscillating active users for lifelike display
    const userInterval = setInterval(() => {
      setOnlineUsers(prev => {
        const offset = Math.floor(Math.random() * 11) - 5; // -5 to +5
        const next = prev + offset;
        return next < 300 ? 300 : next > 500 ? 500 : next;
      });
    }, 4000);

    // Live financial tickers scrolling
    const tickerInterval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % tickers.length);
    }, 3000);

    // Increment simulated statistics slowly
    const statInterval = setInterval(() => {
      setTotalDepositsSim(prev => prev + Math.floor(Math.random() * 15000) + 1000);
      setTotalWithdrawalsSim(prev => prev + Math.floor(Math.random() * 12000) + 500);
    }, 5000);

    return () => {
      clearInterval(userInterval);
      clearInterval(tickerInterval);
      clearInterval(statInterval);
    };
  }, []);

  return (
    <div className="w-full relative bg-[#030611] overflow-x-hidden">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-0 right-0 w-full max-w-[600px] h-[600px] bg-yellow-400/5 blur-[150px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute top-[800px] left-0 w-full max-w-[500px] h-[500px] bg-night-blue-light/10 blur-[130px] rounded-full -z-10 pointer-events-none" />

      {/* TOP NAVIGATION BAR FOR LANDING */}
      <nav className="w-full flex justify-between items-center py-5 px-4 md:px-12 border-b border-yellow-500/15 bg-[#030611]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/10">
            <TrendingUp className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-tight gold-gradient-text">GOLDINVEST</span>
            <span className="text-[10px] block text-yellow-400/80 font-mono tracking-wider">PREMIUM CAPITAL</span>
          </div>
        </div>

        {/* Desktop Quick Nav Menu */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <a href="#about" className="hover:text-yellow-400 transition-colors">À Propos</a>
          <a href="#plans" className="hover:text-yellow-400 transition-colors">Produits VIP</a>
          <a href="#testimonials" className="hover:text-yellow-400 transition-colors">Témoignages</a>
          <a href="#faq" className="hover:text-yellow-400 transition-colors">FAQ</a>
        </div>

        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <button
              onClick={onGoToDashboard}
              className="px-5 py-2 rounded-xl text-xs font-semibold gold-bg-gradient text-slate-950 hover:opacity-90 transition-all flex items-center space-x-1 shadow-md shadow-yellow-500/10"
              id="btn-goto-dash"
            >
              <span>Espace Client</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button
                onClick={() => onNavigateToAuth(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all"
                id="btn-login"
              >
                Connexion
              </button>
              <button
                onClick={() => onNavigateToAuth(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold gold-bg-gradient text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-yellow-500/20 font-display"
                id="btn-register"
              >
                S'inscrire (+200F)
              </button>
            </>
          )}
        </div>
      </nav>

      {/* LIVE INTERACTIVE WINNER TICKER */}
      <div className="w-full bg-[#070e24]/80 border-b border-yellow-500/15 py-3 px-4 overflow-hidden relative">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between text-xs font-medium">
          <div className="flex items-center space-x-2 text-yellow-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
            <span className="font-mono text-[11px] text-slate-300">
              <strong className="text-white">{onlineUsers}</strong> investisseurs en ligne
            </span>
          </div>

          <div className="flex-1 md:flex justify-all px-4 overflow-hidden">
            <div className="flex items-center space-x-2 bg-black/95 px-4 py-1.5 rounded-full border border-yellow-500/25 mx-auto max-w-xl animate-pulse">
              <span className="text-yellow-400 font-bold font-mono text-[10px] uppercase">LIVE</span>
              <span className="text-[11px] text-slate-200">
                {tickers[tickerIndex].country} Inv. <b className="text-yellow-300">{tickers[tickerIndex].phone}</b> a initié un <span className="text-green-400 font-semibold">{tickers[tickerIndex].type}</span> de <b className="text-white font-display">{tickers[tickerIndex].amount}</b> ({tickers[tickerIndex].plan || tickers[tickerIndex].level || 'Traité'})
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-1.5 text-slate-400 text-[11px]">
            <Globe className="w-3.5 h-3.5 text-yellow-500" />
            <span>Afrique Francophone</span>
          </div>
        </div>
      </div>

      {/* HERO SECTION / BANNIÈRE ANIMÉE */}
      <section className="relative pt-16 pb-20 px-4 md:px-12 max-w-[1600px] mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[11px] font-semibold tracking-wider uppercase mb-6 animate-bounce">
          <Award className="w-3.5 h-3.5" />
          <span>GARANTIE DE SÉCURITÉ VIP</span>
        </div>

        <h1 className="font-display font-bold text-4xl md:text-6xl text-white tracking-tight leading-tight max-w-4xl">
          Faites Fructifier Votre Capital Simplement avec <span className="gold-gradient-text font-extrabold block md:inline">GoldInvest Premium</span>
        </h1>

        <p className="mt-6 text-slate-400 text-sm md:text-lg max-w-2xl leading-relaxed">
          La plateforme internationale leader d'actifs durables en Afrique Francophone. Générez des gains passifs quotidiens stables garantis de 20% à 25% et retirez sous 2 heures par Mobile Money.
        </p>

        {/* HERO CTA BUTTONS */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          {isLoggedIn ? (
            <button
              onClick={onGoToDashboard}
              className="w-full sm:w-60 justify-center py-4 px-8 rounded-xl font-semibold text-slate-950 gold-bg-gradient hover:opacity-90 transition-all shadow-xl shadow-yellow-500/20 flex items-center space-x-2 text-sm uppercase tracking-wide font-display cursor-pointer"
            >
              <span>Accéder au Tableau de Bord</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => onNavigateToAuth(true)}
                className="w-full sm:w-60 justify-center py-4 px-8 rounded-xl font-semibold text-slate-950 gold-bg-gradient hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-500/20 flex items-center space-x-2 text-sm uppercase tracking-wide font-display cursor-pointer"
              >
                <span>Commencer à Investir</span>
                <ArrowRight className="w-4 h-4 animate-pulse" />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('plans');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-60 py-4 px-8 rounded-xl font-semibold text-slate-200 bg-slate-900 border border-slate-700/60 hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 text-sm"
              >
                <span>Découvrir nos Offres VIP</span>
              </button>
            </>
          )}
        </div>

        {/* LIVE PLATFORM METRICS */}
        <div className="mt-10 w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" id="about">
          <div className="bg-[#070e24]/70 backdrop-blur-md rounded-xl p-4 border border-yellow-500/15 text-center relative overflow-hidden group hover:border-yellow-500/35 transition-all">
            <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-tr from-yellow-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="mx-auto w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400 mb-2 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">
              45 820 +
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5 uppercase font-semibold">Investisseurs Actifs</div>
          </div>

          <div className="bg-[#070e24]/70 backdrop-blur-md rounded-xl p-4 border border-yellow-500/15 text-center relative overflow-hidden group hover:border-yellow-500/35 transition-all">
            <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-tr from-yellow-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="mx-auto w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400 mb-2 group-hover:scale-110 transition-transform">
              <Coins className="w-4 h-4" />
            </div>
            <div className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">
              {totalDepositsSim.toLocaleString()} <span className="text-[10px] text-yellow-500">F</span>
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5 uppercase font-semibold">Volume Déposé</div>
          </div>

          <div className="bg-[#070e24]/70 backdrop-blur-md rounded-xl p-4 border border-yellow-500/15 text-center relative overflow-hidden group hover:border-yellow-500/35 transition-all">
            <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-tr from-yellow-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="mx-auto w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400 mb-2 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">
              {totalWithdrawalsSim.toLocaleString()} <span className="text-[10px] text-yellow-450">F</span>
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5 uppercase font-semibold">Retraits Payés</div>
          </div>

          <div className="bg-[#070e24]/70 backdrop-blur-md rounded-xl p-4 border border-yellow-500/15 text-center relative overflow-hidden group hover:border-yellow-500/35 transition-all">
            <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-tr from-yellow-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="mx-auto w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400 mb-2 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-xl md:text-2xl font-display font-bold text-green-400 tracking-tight">
              99.85 %
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5 uppercase font-semibold">Taux Ponctualité</div>
          </div>
        </div>
      </section>

      {/* INVESTMENT ADVANTAGES */}
      <section className="bg-[#050b1d]/40 py-10 border-t border-b border-yellow-500/10 px-4 md:px-12">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-xl md:text-2xl text-white">Pourquoi Choisir Notre Plateforme Fintech ?</h2>
            <p className="text-slate-400 mt-1 text-xs max-w-xl mx-auto">Un environnement d'investissement conçu avec les meilleurs protocoles de sécurité financière.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#070e24]/60 p-4 rounded-xl border border-yellow-500/15 flex space-x-3 hover:border-yellow-500/35 transition-all">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                <Shield className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">Gains Automatiques</h3>
                <p className="text-xs text-slate-350 mt-1.5 leading-relaxed">
                  Pas besoin de trading complexe ni d'expérience préalable. Vos gains sont calculés automatiquement et ajoutés quotidiennement à votre solde.
                </p>
              </div>
            </div>

            <div className="bg-[#070e24]/60 p-4 rounded-xl border border-yellow-500/15 flex space-x-3 hover:border-yellow-500/35 transition-all">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                <Briefcase className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">Portefeuilles Diversifiés</h3>
                <p className="text-xs text-slate-350 mt-1.5 leading-relaxed">
                  Nous couvrons nos engagements financiers par des investissements sûrs dans des mines d'Or industrielles et des opérations d’arbitrage d'actifs.
                </p>
              </div>
            </div>

            <div className="bg-[#070e24]/60 p-4 rounded-xl border border-yellow-500/15 flex space-x-3 hover:border-yellow-500/35 transition-all">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                <Coins className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">Retraits instantanés</h3>
                <p className="text-xs text-slate-350 mt-1.5 leading-relaxed">
                  Fini l'attente pendant des jours. Soumettez votre demande et recevez vos fonds Mobile Money directement sur votre numéro personnel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INVESTMENT PLANS DISPLAY */}
      <section className="py-10 px-4 md:px-12 max-w-[1600px] mx-auto animate-fade-in" id="plans">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-yellow-500 tracking-wider uppercase block mb-1">CATALOGUE</span>
          <h2 className="font-bold text-2xl text-white tracking-tight">Nos Packages d'Investissement VIP</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">Choisissez le package adapté à vos objectifs financiers et commencez à percevoir vos dividendes dans 24 heures.</p>
        </div>

        {/* VIP PRODUCTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div 
              key={product.id}
              className="bg-[#070e24]/70 backdrop-blur-md border border-yellow-500/15 rounded-3xl overflow-hidden shadow-xl hover:shadow-yellow-500/10 hover:border-yellow-400 hover:-translate-y-1.5 transition-all text-left flex flex-col group relative"
            >
              {/* Product Header Highlight */}
              <div className="p-5 border-b border-yellow-500/10 relative">
                <div className="absolute top-4 right-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-450 text-[10px] font-bold px-2 py-1 rounded-md">
                  {product.tag || 'Actif'}
                </div>
                <div className="text-[11px] text-yellow-400/80 font-bold uppercase tracking-wider mb-1">MODULE FINANCIER</div>
                <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors uppercase">{product.name}</h3>
              </div>

              {/* Product price big text */}
              <div className="p-5 bg-[#030611]/60 text-center border-b border-yellow-500/10">
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Prix d'acquisition</div>
                <div className="text-3xl font-extrabold text-white mt-1 group-hover:scale-105 transition-transform duration-300">
                  {product.price.toLocaleString()} <span className="text-sm text-yellow-450 font-sans font-extrabold">FCFA</span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5 space-y-3 flex-1 text-slate-300">
                <div className="flex justify-between text-xs py-1.5 border-b border-slate-900">
                  <span className="text-slate-400">Revenus Quotidiens :</span>
                  <span className="text-green-400 font-bold">+{product.dailyReturn.toLocaleString()} FCFA / jour</span>
                </div>
                <div className="flex justify-between text-xs py-1.5 border-b border-slate-900">
                  <span className="text-slate-400">Durée du cycle :</span>
                  <span className="text-yellow-400 font-bold">{product.durationDays} Jours</span>
                </div>
                <div className="flex justify-between text-xs py-1.5 font-bold">
                  <span className="text-slate-200">Gain Total Garanti :</span>
                  <span className="text-white bg-yellow-500/15 border border-yellow-500/20 px-2.5 py-1 rounded-lg text-[11px]">
                    {product.totalReturn.toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              {/* Invest CTA */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => onSelectProduct(product)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-500/15 to-amber-600/15 border border-yellow-500/35 text-yellow-400 text-xs font-bold hover:from-yellow-400 hover:to-amber-500 hover:text-slate-950 transition-all uppercase tracking-widest shadow-md shine-gold group-hover:border-yellow-400"
                >
                  Activer ce Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MLM MULTI-LEVEL INCOME & MLM STATISTICS */}
      <section className="bg-[#030611] py-10 border-t border-b border-yellow-500/10 px-4 md:px-12">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold text-yellow-500 font-mono tracking-widest uppercase block mb-1">CROISSANCE MLM</span>
            <h2 className="font-display font-bold text-2xl text-white">Système de Parrainage sur 3 Niveaux</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Rentabilisez votre cercle social en partageant votre lien de promotion personnel. Chaque affilié qui s'inscrit et active un module VIP d'investissement vous génère instantanément des commissions.
            </p>

            <div className="mt-5 space-y-3">
              <div className="flex items-start space-x-3 bg-[#070e24]/80 p-3 rounded-lg border border-yellow-500/15">
                <div className="w-8 h-8 rounded-lg gold-bg-gradient flex items-center justify-center text-slate-950 font-bold font-display text-xs flex-shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-yellow-400 text-xs">Niveau 1 : 20 % de Commission Directe</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">Vous touchez 20% du montant investi par vos filleuls directs.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-[#070e24]/80 p-3 rounded-lg border border-yellow-500/15">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-100 font-bold font-display text-xs flex-shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-yellow-300 text-xs">Niveau 2 : 3 % de Commission Indirecte</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">Vous touchez 3% sur les investissements de deuxième génération.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-[#070e24]/80 p-3 rounded-lg border border-yellow-500/15">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-100 font-bold font-display text-xs flex-shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-yellow-300 text-xs">Niveau 3 : 1 % de Commission Indirecte</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">Vous touchez 1% sur la troisième génération d'affiliés.</p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={() => onNavigateToAuth(true)}
                className="px-5 py-3 rounded-xl text-xs font-bold bg-[#070e24] hover:bg-black text-white border border-yellow-500/30 font-display uppercase tracking-wider transition-all"
              >
                Générer mon lien d'invitation
              </button>
            </div>
          </div>

          {/* Visual simulation box for Referral Growth */}
          <div className="bg-[#070e24]/95 p-5 rounded-xl border border-yellow-500/15 relative overflow-hidden">
            <div className="mb-3 flex justify-between items-center border-b border-slate-900 pb-2">
              <span className="text-[11px] font-mono text-slate-300">Exemple de gain MLM cumulé</span>
              <span className="text-[11px] text-green-400 font-mono tracking-wider font-bold">Calculateur</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-left text-xs">
                <span className="text-slate-300">Si 5 filleuls achètent le <strong>VIP 3 (25k)</strong> (Niv. 1) :</span>
                <span className="text-[11px] font-mono text-white bg-black px-2 py-0.5 rounded border border-yellow-500/10">25 000 F (20%)</span>
              </div>
              <div className="flex justify-between items-center text-left text-xs">
                <span className="text-slate-300">Si ces filleuls invitent 15 personnes (Niv. 2) :</span>
                <span className="text-[11px] font-mono text-white bg-black px-2 py-0.5 rounded border border-yellow-500/10">11 250 F (3%)</span>
              </div>
              <div className="flex justify-between items-center text-left text-xs">
                <span className="text-slate-300">Si ces derniers invitent 30 personnes (Niv. 3) :</span>
                <span className="text-[11px] font-mono text-white bg-black px-2 py-0.5 rounded border border-yellow-500/10">7 500 F (1%)</span>
              </div>

              <div className="pt-3 border-t border-slate-900 flex justify-between items-center font-display">
                <span className="text-sm text-white font-bold">Bonus Total de Réseau :</span>
                <span className="text-base font-bold text-yellow-400">43 750 FCFA</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-[10.5px] text-slate-350 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span>Crédité instantanément et retirable sans conditions !</span>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS & TESTIMONIALS/ TÉMOIGNAGES */}
      <section className="py-10 px-4 md:px-12 max-w-[1600px] mx-auto" id="testimonials">
        <div className="text-center mb-6">
          <span className="text-[11px] font-bold text-yellow-500 font-mono tracking-widest uppercase block mb-1">SATISFACTION</span>
          <h2 className="font-display font-bold text-2xl text-white">Ce qu'en Disent Nos Investisseurs</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">Rejoignez une communauté grandissante d'investisseurs qui ont franchi le pas de la liberté financière.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((test, index) => (
            <div key={index} className="bg-[#070e24]/70 p-4 rounded-xl border border-yellow-500/15 flex flex-col justify-between text-left group hover:border-yellow-500/35 transition-all">
              <div>
                <div className="flex space-x-1 text-yellow-400 mb-2">
                  {Array.from({ length: test.stars }).map((_, i) => (
                    <span key={i} className="text-base">★</span>
                  ))}
                </div>
                <p className="text-slate-200 text-xs leading-relaxed italic">"{test.comment}"</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-white">{test.name}</h4>
                  <span className="text-[10px] text-slate-400">{test.country}</span>
                </div>
                <span className="text-[9px] text-yellow-400 font-mono tracking-wider">{test.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-10 bg-[#050b1d]/40 border-t border-yellow-500/10 px-4 md:px-12" id="faq">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="font-display font-bold text-2xl text-white">Questions Fréquemment Posées</h2>
            <p className="text-xs text-slate-400 mt-1">Retrouvez toutes les réponses pour débuter dans les meilleures conditions.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-[#070e24]/75 rounded-xl border border-yellow-500/15 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full py-3 px-4 flex justify-between items-center text-left text-xs font-semibold text-white focus:outline-none hover:text-yellow-400 transition-colors"
                >
                  <span className="font-display">{faq.q}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-yellow-500 transition-transform duration-300 ${openFaq === idx ? 'transform rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-[11px] text-slate-350 leading-relaxed border-t border-yellow-500/10 bg-black/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* EXTRA CTA BANNER */}
          <div className="mt-10 bg-gradient-to-r from-yellow-500/10 to-amber-600/10 border border-yellow-500/20 rounded-xl p-5 text-center">
            <h3 className="text-base font-display font-bold text-white">Prêt à récolter vos premiers rendements ?</h3>
            <p className="text-[11px] text-slate-350 mt-1 max-w-md mx-auto">Inscrivez-vous maintenant pour obtenir gratuitement 200 XAF crédités immédiatement sur votre balance d'accueil !</p>
            <div className="mt-3">
              <button
                onClick={() => onNavigateToAuth(true)}
                className="px-5 py-2 rounded-xl font-display font-bold text-slate-950 gold-bg-gradient text-[11px] uppercase tracking-wider hover:opacity-90 font-semibold cursor-pointer"
              >
                Créer mon compte Gratuitement
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#030611] border-t border-yellow-500/10 py-10 px-4 text-center">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center space-x-2 text-left">
            <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <span className="font-display font-bold text-white block">GOLDINVEST PREMIUM</span>
              <span className="text-[10px]">© 2026 GoldInvest Inc. Tous droits réservés.</span>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-slate-400">
            <span>Politique de Confidentialité</span>
            <span>Conditions d'Utilisation</span>
            <span>Garantie Financière AMF</span>
            <span>Support Officiel</span>
          </div>
          <div className="text-slate-400 flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-900">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="font-mono text-[10px]">Serveur Principal: Opérationnel</span>
          </div>
        </div>
      </footer>

      {/* FLOATING SOCIAL & CUSTOMER SUPPORT SIDE BAR */}
      <div className="fixed right-3 md:right-5 top-1/2 -translate-y-1/2 z-[100] flex flex-col space-y-4" id="floating-support-bar">
        {/* Support floating button 1 - Service Client VIP */}
        <a 
          href="https://wa.me/2250708091011?text=Bonjour%20GoldInvest%20Premium%2C%20je%20souhaite%20contacter%20le%20Service%20Client%20VIP"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-black/90 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.15)] hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:border-yellow-400 hover:scale-110 active:scale-95 transition-all duration-300"
          id="btn-service-client-floating"
        >
          {/* Active status pulse dot */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500 font-bold"></span>
          </span>
          <Headphones className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 hover:rotate-12 transition-transform" />
          
          {/* Tooltip popping on the left */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black/95 text-white border border-yellow-500/20 px-3 py-2 rounded-xl text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 shadow-2xl flex items-center space-x-2 whitespace-nowrap translate-x-2 group-hover:translate-x-0 z-50">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <div className="text-left">
              <span className="font-bold text-yellow-400 block text-[10px] uppercase font-mono tracking-wider">Assistance 24h/7</span>
              <span className="text-[11px] text-slate-200">Service Client Support VIP</span>
            </div>
          </div>
        </a>

        {/* Support floating button 2 - WhatsApp Discussion Group */}
        <a 
          href="https://chat.whatsapp.com/G0ldInvestPremiumOfficialGroup"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-black/90 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] shadow-[0_0_15px_rgba(37,211,102,0.15)] hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:border-[#25D366] hover:scale-110 active:scale-95 transition-all duration-300"
          id="btn-whatsapp-group-floating"
        >
          {/* Active status pulse dot */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#25D366] font-bold"></span>
          </span>
          <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-[#25D366] hover:rotate-12 transition-transform" />
          
          {/* Tooltip popping on the left */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black/95 text-white border border-[#25D366]/20 px-3 py-2 rounded-xl text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 shadow-2xl flex items-center space-x-2 whitespace-nowrap translate-x-2 group-hover:translate-x-0 z-50">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <div className="text-left">
              <span className="font-bold text-[#25D366] block text-[10px] uppercase font-mono tracking-wider">Discussions Membres</span>
              <span className="text-[11px] text-slate-200">Groupe Officiel WhatsApp</span>
            </div>
          </div>
        </a>

        {/* Support floating button 3 - Telegram Channel */}
        <a 
          href="https://t.me/GoldInvestPremiumOfficial"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-black/90 border border-[#0088cc]/30 flex items-center justify-center text-[#0088cc] shadow-[0_0_15px_rgba(0,136,204,0.15)] hover:shadow-[0_0_20px_rgba(0,136,204,0.4)] hover:border-[#0088cc] hover:scale-110 active:scale-95 transition-all duration-300"
          id="btn-telegram-canal-floating"
        >
          <Send className="w-5 h-5 md:w-6 md:h-6 text-[#0088cc] hover:translate-x-0.5 hover:-translate-y-0.5 transition-transform" />
          
          {/* Tooltip popping on the left */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black/95 text-white border border-[#0088cc]/25 px-3 py-2 rounded-xl text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 shadow-2xl flex items-center space-x-2 whitespace-nowrap translate-x-2 group-hover:translate-x-0 z-50">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            <div className="text-left">
              <span className="font-bold text-[#0088cc] block text-[10px] uppercase font-mono tracking-wider">Alertes & Annonces</span>
              <span className="text-[11px] text-slate-200">Canal Telegram Officiel</span>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
