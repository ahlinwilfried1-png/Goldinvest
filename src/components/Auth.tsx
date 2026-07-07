import React, { useState } from 'react';
import { 
  Lock, 
  User as UserIcon, 
  Smartphone, 
  MapPin, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ChevronLeft,
  Mail,
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
  { name: 'Cameroun', code: '+237', flag: '🇨🇲' },
  { name: 'Togo', code: '+228', flag: '🇹🇬' },
  { name: 'Bénin', code: '+229', flag: '🇧🇯' },
  { name: 'Côte d’Ivoire', code: '+225', flag: '🇨🇮' },
  { name: 'Burkina Faso', code: '+226', flag: '🇧🇫' },
  { name: 'Sénégal', code: '+221', flag: '🇸🇳' },
  { name: 'Mali', code: '+223', flag: '🇲🇱' }
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
  const [selectedCode, setSelectedCode] = useState('+237');
  const [country, setCountry] = useState("Cameroun");
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
      const captured = safeLocalStorage.getItem('gi_captured_ref') || '72AGR';
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
  const [loginSelectedCode, setLoginSelectedCode] = useState('+237');
  // Sign in fields
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [resetTip, setResetTip] = useState(false);

  // Modal States
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

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
    <div className="min-h-screen flex flex-col justify-between py-6 p-4 relative overflow-y-auto overflow-x-hidden font-sans text-slate-900 select-none" id="auth-container">
      
      {/* Immersive blurred background gradient */}
      <div className={`absolute inset-0 z-0 overflow-hidden select-none pointer-events-none transition-all duration-700 ${isRegister ? 'bg-[#5b21b6]' : 'bg-[#da1e28]'}`}>
        {isRegister ? (
          <>
            {/* Soft purple and indigo glow bands with extreme blur for registration */}
            <div className="absolute top-0 left-0 w-2/3 h-full bg-[#7c3aed] filter blur-[70px] opacity-80 mix-blend-multiply" />
            <div className="absolute top-0 right-0 w-2/3 h-full bg-[#d8b4fe] filter blur-[70px] opacity-85 mix-blend-multiply" />
          </>
        ) : (
          <>
            {/* Soft horizontal/diagonal green and yellow bands with extreme blur */}
            <div className="absolute top-0 left-0 w-2/3 h-full bg-[#0d8253] filter blur-[70px] opacity-80 mix-blend-multiply" />
            <div className="absolute top-0 right-0 w-2/3 h-full bg-[#f7ca18] filter blur-[70px] opacity-85 mix-blend-multiply" />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/15" />
      </div>

      {/* Top Navigation Bar containing Back minimalist chevron and Language Selector text */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between relative z-10 mb-6 shrink-0 px-2">
        {onBackToHome ? (
          <button
            onClick={onBackToHome}
            type="button"
            className="text-slate-800 hover:text-slate-900 active:scale-95 transition-all cursor-pointer p-1"
            title="Retour"
          >
            <ChevronLeft className="w-8 h-8" strokeWidth={2.5} />
          </button>
        ) : (
          <div className="w-8 h-8" />
        )}

        <button
          type="button"
          onClick={() => setShowLanguageModal(true)}
          className="text-[14px] font-sans font-bold text-slate-800 hover:text-slate-900 active:scale-95 transition-colors cursor-pointer uppercase tracking-wider"
          title="Sélectionner la Langue"
        >
          Langue
        </button>
      </div>

      {/* Main Container Wrapper */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center relative z-10 py-2 px-1">
        
        {/* Centered Dreampod Bold Yellow Stylized Logo exactly as screenshot */}
        <div className="flex flex-col items-center mb-8 animate-fade-in select-none">
          <div 
            className="text-[44px] md:text-[52px] font-sans font-black italic tracking-tighter text-[#fbbf24] leading-none select-none drop-shadow-[0_4px_8px_rgba(0,122,94,0.7)]"
            style={{ textShadow: "2px 2px 0px #000, 3px 3px 0px #007a5e" }}
          >
            Dreampod
          </div>
        </div>

        {/* Error and Success alerts */}
        {errorMessage && (
          <div className="mb-5 p-4 rounded-3xl bg-white/95 border border-red-200 text-xs text-red-800 font-bold flex items-start space-x-2 shadow-lg backdrop-blur-md animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-4 rounded-3xl bg-white/95 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-start space-x-2 shadow-lg backdrop-blur-md animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form inputs styled exactly as white rounded pills on the colorful background */}
        <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
          
          {isRegister ? (
            /* REGISTRATION FIELDS */
            <>
              {/* Phone Input with pre-selected Cameroon country code */}
              <div className="bg-white rounded-3xl p-1.5 px-4 flex items-center gap-3 shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-transparent focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/25 transition-all">
                <Smartphone className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="flex items-center gap-1 cursor-pointer select-none relative shrink-0">
                  <span className="text-sm font-extrabold text-slate-700">{selectedCode}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    id="auth-country-select"
                    value={selectedCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setSelectedCode(code);
                      const found = eligibleCountries.find(c => c.code === code);
                      if (found) setCountry(found.name);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  >
                    {eligibleCountries.map((c, i) => (
                      <option key={i} value={c.code} className="bg-white text-slate-800 font-bold">
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="h-5 w-[1px] bg-slate-200 shrink-0 mx-1" />
                <input
                  type="tel"
                  required
                  placeholder="Veuillez saisir votre numéro de téléphone"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="flex-1 bg-transparent text-slate-800 text-sm font-semibold py-3 focus:outline-none placeholder:text-slate-400/90"
                />
              </div>

              {/* Password field */}
              <div className="bg-white rounded-3xl p-1.5 px-4 flex items-center gap-3 shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-transparent focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/25 transition-all">
                <Lock className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Veuillez saisir le mot de passe de connexion"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent text-slate-800 text-sm font-semibold py-3 focus:outline-none placeholder:text-slate-400/90"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Confirm password field */}
              <div className="bg-white rounded-3xl p-1.5 px-4 flex items-center gap-3 shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-transparent focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/25 transition-all">
                <Lock className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Veuillez confirmer votre mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flex-1 bg-transparent text-slate-800 text-sm font-semibold py-3 focus:outline-none placeholder:text-slate-400/90"
                />
              </div>

              {/* Invitation / Sponsor Code Field */}
              <div className="bg-white rounded-3xl p-1.5 px-4 flex items-center gap-3 shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-transparent focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/25 transition-all">
                <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Saisir le code d'invitation"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="flex-1 bg-transparent text-slate-800 text-sm font-bold tracking-widest font-mono uppercase py-3 focus:outline-none placeholder:text-slate-400/90"
                />
              </div>
            </>
          ) : (
            /* LOGIN SPECIFIC FIELDS */
            <>
              {/* Login Phone Input */}
              <div className="bg-white rounded-3xl p-1.5 px-4 flex items-center gap-3 shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-transparent focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/25 transition-all">
                <Smartphone className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="flex items-center gap-1 cursor-pointer select-none relative shrink-0">
                  <span className="text-sm font-extrabold text-slate-700">{loginSelectedCode}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    id="auth-login-country-select"
                    value={loginSelectedCode}
                    onChange={(e) => setLoginSelectedCode(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  >
                    {eligibleCountries.map((c, i) => (
                      <option key={i} value={c.code} className="bg-white text-slate-800 font-bold">
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="h-5 w-[1px] bg-slate-200 shrink-0 mx-1" />
                <input
                  type="text"
                  required
                  placeholder="Veuillez saisir votre numéro"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  className="flex-1 bg-transparent text-slate-800 text-sm font-semibold py-3 focus:outline-none placeholder:text-slate-400/90"
                />
              </div>

              {/* Login Password Input */}
              <div className="bg-white rounded-3xl p-1.5 px-4 flex items-center gap-3 shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-transparent focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/25 transition-all">
                <Lock className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Veuillez saisir le mot de passe de connexion"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="flex-1 bg-transparent text-slate-800 text-sm font-semibold py-3 focus:outline-none placeholder:text-slate-400/90"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Lost password option */}
              <div className="flex justify-end px-2">
                <button 
                  type="button"
                  onClick={() => setResetTip(!resetTip)}
                  className="text-xs text-white hover:text-amber-300 font-extrabold underline cursor-pointer hover:no-underline transition-colors uppercase tracking-wider font-sans"
                >
                  Mot de passe perdu ?
                </button>
              </div>

              {resetTip && (
                <div className="p-4 bg-white/95 rounded-3xl text-xs font-semibold text-slate-800 leading-relaxed text-left shadow-lg animate-fade-in border border-amber-200">
                  💡 Pour récupérer ou réinitialiser votre compte d’investisseur, veuillez contacter notre service client en cliquant sur l'icône de l'assistance en bas à droite de votre écran.
                </div>
              )}
            </>
          )}

          {/* Submit Action Button - Styled as a beautiful rounded orange gradient pill exactly like screenshot */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r ${isRegister ? 'from-[#7c3aed] to-[#5b21b6] shadow-[0_4px_20px_rgba(124,58,237,0.35)]' : 'from-[#f07b1b] to-[#df4b13] shadow-[0_4px_20px_rgba(223,75,19,0.35)]'} hover:brightness-105 active:scale-[0.99] text-white font-sans font-bold text-base py-4 px-4 rounded-full flex items-center justify-center transition-all select-none cursor-pointer disabled:opacity-50 mt-6`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Traitement en cours...</span>
              </div>
            ) : (
              <span>{isRegister ? "Inscrivez-vous maintenant" : "Vous connecter maintenant"}</span>
            )}
          </button>
        </form>

        {/* Toggle Mode Button - Styled as an identical rounded orange gradient pill exactly like screenshot */}
        <div className="mt-4">
          <button
            id="auth-toggle-mode-btn"
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`w-full bg-gradient-to-r ${isRegister ? 'from-[#7c3aed] to-[#5b21b6] shadow-[0_4px_20px_rgba(124,58,237,0.35)]' : 'from-[#f07b1b] to-[#df4b13] shadow-[0_4px_20px_rgba(223,75,19,0.35)]'} hover:brightness-105 active:scale-[0.99] text-white font-sans font-bold text-base py-4 px-4 rounded-full flex items-center justify-center transition-all select-none cursor-pointer`}
          >
            <span>{isRegister ? "Vous avez un compte? Se connecter" : "Pas encore de compte? S'inscrire"}</span>
          </button>
        </div>

      </div>

      {/* Footer Branding label */}
      <div className="w-full text-center relative z-10 py-2 shrink-0">
        <p className="text-[10px] font-mono font-bold text-white/90 uppercase tracking-widest drop-shadow-xs">
          Dreampod Cameroun • Système de Placement Sécurisé
        </p>
      </div>

      {/* Floating Support Representative Badge in the bottom right corner exactly like screenshot */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center select-none animate-bounce" style={{ animationDuration: '3s' }}>
        <button 
          type="button"
          onClick={() => setShowSupportModal(true)}
          className="w-16 h-16 rounded-full bg-white shadow-2xl border-2 border-white flex items-center justify-center p-0.5 cursor-pointer hover:scale-105 active:scale-95 transition-all relative group"
        >
          <img 
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150" 
            alt="Service Client"
            className="w-full h-full rounded-full object-cover"
          />
          {/* Small pulsing green online indicator dot */}
          <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
        </button>
        <span className="text-[9px] font-sans font-black text-slate-700 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-md border border-slate-100 mt-1 uppercase tracking-wider">
          Service client
        </span>
      </div>

      {/* Modern interactive Language Selector Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative border border-slate-100 animate-scale-up">
            <button 
              onClick={() => setShowLanguageModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-slate-900 mb-4 pr-6 flex items-center gap-2 uppercase tracking-wide">
              <Globe className="w-5 h-5 text-[#f07b1b]" />
              Choisir la Langue
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Français', flag: '🇫🇷', active: true },
                { name: 'English', flag: '🇬🇧', active: false },
                { name: 'Español', flag: '🇪🇸', active: false },
                { name: 'Português', flag: '🇵🇹', active: false }
              ].map((lang, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (lang.active) {
                      setShowLanguageModal(false);
                    } else {
                      alert("Cette langue sera très bientôt disponible !");
                    }
                  }}
                  className={`w-full p-4 rounded-2xl flex items-center justify-between font-bold text-sm transition-all border ${
                    lang.active 
                      ? 'bg-amber-50 border-amber-200 text-[#df4b13]' 
                      : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl leading-none">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                  {lang.active && <span className="w-2.5 h-2.5 rounded-full bg-[#df4b13]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modern interactive Customer Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative border border-slate-100 text-slate-800 text-left animate-scale-up">
            <button 
              onClick={() => setShowSupportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 relative shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150" 
                  alt="Service Client"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-none">Support Client Dreampod</h3>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Conseillers disponibles en continu
                </span>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-500 leading-relaxed mb-5">
              Besoin d'aide pour votre inscription, votre dépôt ou pour obtenir votre code d'invitation ? Veuillez rejoindre notre canal d'entraide ou discuter en direct avec un conseiller de garde.
            </p>

            <div className="space-y-3 mb-5">
              <a
                href="https://wa.me/237600000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-4 rounded-2xl flex items-center justify-between bg-emerald-50 border border-emerald-100 text-emerald-800 hover:bg-emerald-100 transition-all font-bold text-sm"
              >
                <span className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Discussion WhatsApp Directe</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-200/60 uppercase">En ligne</span>
              </a>

              <a
                href="https://t.me/mdb_cameroon"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-4 rounded-2xl flex items-center justify-between bg-sky-50 border border-sky-100 text-sky-800 hover:bg-sky-100 transition-all font-bold text-sm"
              >
                <span className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-sky-600" />
                  <span>Canal Officiel Telegram</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-200/60 uppercase">Rejoindre</span>
              </a>
            </div>

            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all text-center"
            >
              Fermer l'Assistance
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

