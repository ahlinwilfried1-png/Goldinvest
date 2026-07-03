import React, { useState } from 'react';
import { 
  Lock, 
  User as UserIcon, 
  Smartphone, 
  MapPin, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Check, 
  Info, 
  AlertTriangle,
  RotateCw,
  Headphones,
  Shield,
  Sprout,
  Sparkles,
  ChevronDown,
  Share,
  X,
  ChevronUp,
  Globe
} from 'lucide-react';
import { DataStore, syncWithBackend, safeLocalStorage } from '../dataStore';

export const eligibleCountries = [
  { name: 'Togo', code: '+228', flag: '🇹🇬' },
  { name: 'Bénin', code: '+229', flag: '🇧🇯' },
  { name: 'Côte d’Ivoire', code: '+225', flag: '🇨🇮' },
  { name: 'Burkina Faso', code: '+226', flag: '🇧🇫' },
  { name: 'Sénégal', code: '+221', flag: '🇸🇳' },
  { name: 'Mali', code: '+223', flag: '🇲🇱' },
  { name: 'Cameroun', code: '+237', flag: '🇨🇲' }
];

interface AuthProps {
  initialIsRegister?: boolean;
  onAuthSuccess: (user: any) => void;
  onBackToHome?: () => void;
}

export default function Auth({ 
  initialIsRegister = false, 
  onAuthSuccess, 
  onBackToHome 
}: AuthProps) {
  const [isRegister, setIsRegister] = useState(initialIsRegister);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sign up fields
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedCode, setSelectedCode] = useState('+228');
  const [country, setCountry] = useState("Togo");
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // Pre-fill sponsor referral code if captured from a direct web link
  React.useEffect(() => {
    const parseUrlAndSync = () => {
      // 1. Parse current URL params
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '');
      
      const getParamInsensitive = (key: string) => {
        const lowerKey = key.toLowerCase();
        for (const [k, v] of searchParams.entries()) {
          if (k.toLowerCase() === lowerKey) return v;
        }
        for (const [k, v] of hashParams.entries()) {
          if (k.toLowerCase() === lowerKey) return v;
        }
        return null;
      };

      const refCode = getParamInsensitive('ref') || 
                      getParamInsensitive('code') || 
                      getParamInsensitive('r') || 
                      getParamInsensitive('parrain') || 
                      getParamInsensitive('sponsor');
      if (refCode) {
        safeLocalStorage.setItem('gi_captured_ref', refCode.toUpperCase());
      }

      // 2. Synchronize with state
      const captured = safeLocalStorage.getItem('gi_captured_ref') || 'AGR72';
      if (captured !== referralCode) {
        setReferralCode(captured);
      }
    };

    parseUrlAndSync();
    
    // Listen to all link clicks and storage checks
    window.addEventListener('click', parseUrlAndSync);
    window.addEventListener('popstate', parseUrlAndSync);
    window.addEventListener('hashchange', parseUrlAndSync);
    const interval = setInterval(parseUrlAndSync, 500);

    return () => {
      window.removeEventListener('click', parseUrlAndSync);
      window.removeEventListener('popstate', parseUrlAndSync);
      window.removeEventListener('hashchange', parseUrlAndSync);
      clearInterval(interval);
    };
  }, [referralCode]);

  // Sign in fields
  const [loginSelectedCode, setLoginSelectedCode] = useState('+228');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [resetTip, setResetTip] = useState(false);

  // Helper to extract clean WhatsApp number with country code, removing spaces, duplicate prefixes, leading zeros
  const getCleanWhatsappNumber = (rawNumber: string, prefixCode: string) => {
    let clean = rawNumber.replace(/[\s\-\(\)\+]/g, '');
    if (clean.startsWith('00')) {
      clean = clean.slice(2);
    }
    const prefixDigits = prefixCode.replace(/\D/g, '');
    if (clean.startsWith(prefixDigits)) {
      clean = clean.slice(prefixDigits.length);
    }
    clean = clean.replace(/^0+/, '');
    return `${prefixCode}${clean}`;
  };

  // Form submission dispatcher
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // Force loading the latest data from server first
      await syncWithBackend();
    } catch (err) {
      console.error('Failed to sync before login/register:', err);
    }

    await new Promise(resolve => setTimeout(resolve, 1200));

    if (isRegister) {
      // Registration validations
      if (!whatsapp.trim()) {
        setErrorMessage('Le numéro de téléphone est requis.');
        setLoading(false);
        return;
      }
      if (password.length < 5) {
        setErrorMessage('Le mot de passe doit contenir au moins 5 caractères pour garantir la sécurité de votre capital.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Les mots de passe saisis ne correspondent pas.');
        setLoading(false);
        return;
      }

      const fullWhatsapp = getCleanWhatsappNumber(whatsapp, selectedCode);
      const autoName = "Membre " + whatsapp.trim();

      // Detect current device type
      const ua = navigator.userAgent;
      let detectedDevice = 'Ordinateur';
      if (/android/i.test(ua)) detectedDevice = 'Android';
      else if (/iPad|iPhone|iPod/.test(ua)) detectedDevice = 'iPhone';
      else if (/tablet/i.test(ua)) detectedDevice = 'Tablette';
      else if (/mobile/i.test(ua)) detectedDevice = 'Mobile';

      // Call database
      const result = await DataStore.register({
        name: autoName,
        whatsapp: fullWhatsapp,
        country,
        password,
        referredByCode: referralCode,
        device: detectedDevice
      });

      if (result.success && result.user) {
        setSuccessMessage(result.message);
        try {
          sessionStorage.setItem('gi_just_registered', 'true');
        } catch (e) {
          console.error(e);
        }
        setTimeout(() => {
          onAuthSuccess(result.user!);
          setLoading(false);
        }, 1500);
      } else {
        setErrorMessage(result.message || "Une erreur s'est produite lors de la création de votre compte d'investissement.");
        setLoading(false);
      }

    } else {
      // Login validations
      if (!loginPhone.trim()) {
        setErrorMessage('Le numéro de téléphone est requis.');
        setLoading(false);
        return;
      }
      if (!loginPassword.trim()) {
        setErrorMessage('Le mot de passe de connexion est requis.');
        setLoading(false);
        return;
      }

      let finalLoginWhatsapp = loginPhone.trim();
      if (finalLoginWhatsapp !== 'admin' && !finalLoginWhatsapp.includes('@')) {
        finalLoginWhatsapp = getCleanWhatsappNumber(finalLoginWhatsapp, loginSelectedCode);
      }

      const result = await DataStore.login(finalLoginWhatsapp, loginPassword);
      if (result.success && result.user) {
        setSuccessMessage(result.message);
        setTimeout(() => {
          onAuthSuccess(result.user!);
          setLoading(false);
        }, 1500);
      } else {
        setErrorMessage(result.message);
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between py-6 p-4 relative bg-slate-50 overflow-y-auto overflow-x-hidden font-sans text-slate-900 select-none" id="auth-container">
      {/* Immersive white AirPods background image */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=1200&q=85" 
          alt="Airprods Immersive Background White"
          className="w-full h-full object-cover filter brightness-[1.04] contrast-[1.02]"
          referrerPolicy="no-referrer"
        />
        {/* Soft elegant white overlay and gradients to guarantee perfect legibility of text */}
        <div className="absolute inset-0 bg-white/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/50 to-white/95" />
      </div>

      {/* Top Navigation Bar containing Back and Language Selector */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between relative z-10 mb-4 shrink-0">
        {onBackToHome ? (
          <button
            onClick={onBackToHome}
            type="button"
            className="w-10 h-10 rounded-full bg-white/85 hover:bg-white border border-slate-200 flex items-center justify-center text-slate-800 transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-10 h-10 invisible" />
        )}

        {/* Brand label center */}
        <div className="flex items-center gap-1.5">
          <Headphones className="w-4 h-4 text-[#ff7c00] animate-pulse" />
          <span className="font-sans font-black tracking-tight text-[15px] uppercase text-slate-950">
            Ai<span className="text-[#ff7c00]">prods</span>
          </span>
        </div>

        <button
          type="button"
          className="w-10 h-10 rounded-full bg-white/85 border border-slate-200 flex items-center justify-center text-[#ff7c00] hover:text-slate-950 transition-colors shadow-sm"
          title="Langue"
        >
          <Globe className="w-5 h-5" />
        </button>
      </div>

      {/* Main Container Wrapper */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center relative z-10 py-2">
        
        {/* Header Title Section exactly like screenshot */}
        <div className="mb-6 animate-fade-in text-left">
          <h1 className="text-[36px] font-sans font-black tracking-tight text-slate-900 leading-tight uppercase">
            {isRegister ? "Inscription" : "Connexion"}
          </h1>
          <p className="text-slate-600 text-sm font-semibold mt-1">
            {isRegister ? "Créez votre compte d’investisseur Aiprods" : "Accédez à votre portefeuille de placements"}
          </p>
        </div>

        {/* Premium Airprods Product Image directly under the writings */}
        <div className="mb-6 rounded-[24px] overflow-hidden relative border border-slate-200 shadow-xl group bg-white/60 backdrop-blur-sm" id="auth-airprods-promo-card">
          {/* Subtle glowing orange-violet brand gradients */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#7c3aed]/10 via-transparent to-[#ff7c00]/10 pointer-events-none" />
          <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-[#ff7c00]/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-24 h-24 rounded-full bg-[#7c3aed]/10 blur-2xl pointer-events-none" />

          <img 
            src="https://images.unsplash.com/photo-1608156639585-b3a032ef9689?q=80&w=600&auto=format&fit=crop" 
            alt="Airpods Pro Wireless"
            className="w-full h-44 object-cover filter brightness-[0.98] contrast-[1.02] transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />

          {/* Holographic glowing overlay strip */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-white via-[#ff7c00] to-[#7c3aed]" />

          {/* Translucent premium label pill on top of the image */}
          <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-2 px-3 border border-slate-200/80 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                Aiprods Smart Series 🎧
              </span>
            </div>
            <span className="text-[9px] font-black uppercase text-white px-2 py-0.5 rounded bg-gradient-to-r from-[#ff7c00] to-[#7c3aed] shadow-xs">
              Technologie Pro
            </span>
          </div>
        </div>

        {/* Error and Success alerts */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-semibold flex items-start space-x-2 shadow-sm backdrop-blur-md">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-start space-x-2 shadow-sm backdrop-blur-md">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 4. Form inputs styled exactly as translucent fields but white/light themed */}
        <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
          
          {isRegister ? (
            /* REGISTRATION FIELDS */
            <>
              {/* Country-coded phone input */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 tracking-wide pl-1">
                  Numéro de téléphone WhatsApp
                </label>
                <div className="bg-white border border-slate-200 rounded-2xl p-1 px-3 flex items-center justify-between gap-1 focus-within:border-[#ff7c00] focus-within:ring-1 focus-within:ring-[#ff7c00]/20 transition-all shadow-xs">
                  <div className="flex items-center gap-1 select-none text-slate-800 font-bold text-sm shrink-0 pl-1">
                    <span className="text-base select-none leading-none">
                      {eligibleCountries.find(c => c.code === selectedCode)?.flag || '🇧🇫'}
                    </span>
                    <select
                      id="auth-country-select"
                      value={selectedCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        setSelectedCode(code);
                        const found = eligibleCountries.find(c => c.code === code);
                        if (found) setCountry(found.name);
                      }}
                      className="bg-transparent text-slate-800 font-bold text-xs md:text-sm focus:outline-none cursor-pointer pr-1"
                    >
                      {eligibleCountries.map((c, i) => (
                        <option key={i} value={c.code} className="bg-white text-slate-800">
                          {c.code}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div className="h-5 w-[1px] bg-slate-200 mx-1 shrink-0" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="Entrez votre numéro"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="flex-1 bg-transparent text-slate-900 text-sm font-semibold px-2 py-3 rounded-xl placeholder:text-slate-400 focus:outline-none transition-all w-full min-w-0"
                  />
                </div>
              </div>

              {/* Password fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide pl-1">
                    Mot de passe
                  </label>
                  <div className="bg-white border border-slate-200 rounded-2xl p-1 px-3 flex items-center justify-between gap-2 focus-within:border-[#ff7c00] focus-within:ring-1 focus-within:ring-[#ff7c00]/20 transition-all shadow-xs">
                    <div className="flex items-center gap-1.5 shrink-0 text-slate-400 pl-1">
                      <Lock className="w-4 h-4 text-[#ff7c00]" />
                      <div className="h-5 w-[1px] bg-slate-200 ml-1.5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Entrez votre mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 bg-transparent text-slate-900 text-sm font-semibold px-2 py-3 rounded-xl placeholder:text-slate-400 focus:outline-none transition-all w-full min-w-0"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide pl-1">
                    Confirmer le mot de passe
                  </label>
                  <div className="bg-white border border-slate-200 rounded-2xl p-1 px-3 flex items-center justify-between gap-2 focus-within:border-[#ff7c00] focus-within:ring-1 focus-within:ring-[#ff7c00]/20 transition-all shadow-xs">
                    <div className="flex items-center gap-1.5 shrink-0 text-slate-400 pl-1">
                      <Lock className="w-4 h-4 text-[#ff7c00]" />
                      <div className="h-5 w-[1px] bg-slate-200 ml-1.5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Confirmez votre mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="flex-1 bg-transparent text-slate-900 text-sm font-semibold px-2 py-3 rounded-xl placeholder:text-slate-400 focus:outline-none transition-all w-full min-w-0"
                    />
                  </div>
                </div>
              </div>

              {/* Sponsor code */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 tracking-wide pl-1">
                  Code d'invitation (Sponsor)
                </label>
                <div className="bg-white border border-slate-200 rounded-2xl p-1 px-3 flex items-center justify-between gap-2 focus-within:border-[#ff7c00] focus-within:ring-1 focus-within:ring-[#ff7c00]/20 transition-all shadow-xs">
                  <div className="flex items-center gap-1.5 shrink-0 text-slate-400 pl-1">
                    <Shield className="w-4 h-4 text-[#ff7c00]" />
                    <div className="h-5 w-[1px] bg-slate-200 ml-1.5" />
                  </div>
                  <input
                    type="text"
                    placeholder="ADMIN228"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="flex-1 bg-transparent text-orange-600 text-sm font-bold tracking-widest font-mono uppercase px-2 py-3 rounded-xl placeholder:text-slate-400 focus:outline-none transition-all w-full min-w-0"
                  />
                  <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mr-1 animate-pulse" />
                </div>
              </div>
            </>
          ) : (
            /* LOGIN SPECIFIC FIELDS */
            <>
              {/* Phone & Country selection nested */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 tracking-wide pl-1">
                  Numéro de téléphone
                </label>
                <div className="bg-white border border-slate-200 rounded-2xl p-1 px-3 flex items-center justify-between gap-1 focus-within:border-[#ff7c00] focus-within:ring-1 focus-within:ring-[#ff7c00]/20 transition-all shadow-xs">
                  <div className="flex items-center gap-1 select-none text-slate-800 font-bold text-sm shrink-0 pl-1">
                    <span className="text-base select-none leading-none">
                      {eligibleCountries.find(c => c.code === loginSelectedCode)?.flag || '🇧🇫'}
                    </span>
                    <select
                      id="auth-login-country-select"
                      value={loginSelectedCode}
                      onChange={(e) => setLoginSelectedCode(e.target.value)}
                      className="bg-transparent text-slate-800 font-bold text-xs md:text-sm focus:outline-none cursor-pointer pr-1"
                    >
                      {eligibleCountries.map((c, i) => (
                        <option key={i} value={c.code} className="bg-white text-slate-800">
                          {c.code}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div className="h-5 w-[1px] bg-slate-200 mx-1 shrink-0" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Entrez votre numéro"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className="flex-1 bg-transparent text-slate-900 text-sm font-semibold px-2 py-3 rounded-xl placeholder:text-slate-400 focus:outline-none transition-all w-full min-w-0"
                  />
                </div>
              </div>

              {/* Password field with forget pass option */}
              <div className="space-y-1">
                <div className="flex justify-between items-center mb-1 px-1">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide pl-1">
                    Mot de passe
                  </label>
                  <button 
                    type="button"
                    onClick={() => setResetTip(!resetTip)}
                    className="text-[10px] text-orange-600 hover:text-orange-700 font-bold underline cursor-pointer hover:no-underline transition-colors select-none uppercase font-mono tracking-wider font-sans"
                  >
                    Perdu ?
                  </button>
                </div>

                {resetTip && (
                  <div className="p-3 bg-white border border-orange-200 rounded-2xl text-[10px] font-bold text-slate-700 leading-relaxed text-left font-mono shadow-md mb-2">
                    💡 Pour réinitialiser votre compte d’investisseur, veuillez contacter l'assistance officielle Aiprods via le support WhatsApp.
                  </div>
                )}

                <div className="bg-white border border-slate-200 rounded-2xl p-1 px-3 flex items-center justify-between gap-2 focus-within:border-[#ff7c00] focus-within:ring-1 focus-within:ring-[#ff7c00]/20 transition-all shadow-xs">
                  <div className="flex items-center gap-1.5 shrink-0 text-slate-400 pl-1">
                    <Lock className="w-4 h-4 text-[#ff7c00]" />
                    <div className="h-5 w-[1px] bg-slate-200 ml-1.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Entrez votre mot de passe"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="flex-1 bg-transparent text-slate-900 text-sm font-semibold px-2 py-3 rounded-xl placeholder:text-slate-400 focus:outline-none transition-all w-full min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-[#ff7c00] transition-colors mr-1 shrink-0"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Submit button - Vibrant premium orange-red gradient matching brand exactly */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#ff7c00] to-[#e11d48] hover:opacity-95 active:scale-[0.98] text-white font-sans font-black text-sm py-4 px-4 rounded-full flex items-center justify-center space-x-2 transition-all shadow-[0_4px_25px_rgba(255,124,0,0.25)] uppercase tracking-widest select-none cursor-pointer disabled:opacity-40 mt-6"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Traitement sécurisé...</span>
              </div>
            ) : (
              <>
                <Sprout className="w-4 h-4 text-white shrink-0" />
                <span>{isRegister ? "S'inscrire" : "Se connecter"}</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle option exactly like bottom link in screenshot */}
        <div className="mt-8 text-center select-none">
          <p className="text-slate-600 text-xs md:text-sm font-semibold">
            {isRegister ? "Vous avez déjà un compte ? " : "Nouveau sur la plateforme ? "}
            <button
              id="auth-toggle-mode-btn"
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-[#ff7c00] hover:text-[#e11d48] transition-colors font-bold underline cursor-pointer hover:no-underline ml-1"
            >
              {isRegister ? "Connectez-vous" : "Inscrivez-vous ici"}
            </button>
          </p>
        </div>

      </div>

      {/* Footer Branding label */}
      <div className="w-full text-center relative z-10 py-2 shrink-0">
        <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
          Aiprods Global • Placements Audio-Technologiques Sécurisés
        </p>
      </div>
    </div>
  );
}

