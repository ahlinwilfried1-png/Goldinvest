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
  Globe,
  Link
} from 'lucide-react';
import { DataStore, syncWithBackend, safeLocalStorage } from '../dataStore';

export const eligibleCountries = [
  { name: 'Togo', code: '+228', flag: '🇹🇬' },
  { name: 'Cameroun', code: '+237', flag: '🇨🇲' },
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
  initialIsRegister = true, 
  onAuthSuccess, 
  onBackToHome 
}: AuthProps) {
  const [isRegister, setIsRegister] = useState(initialIsRegister);

  React.useEffect(() => {
    setIsRegister(initialIsRegister);
  }, [initialIsRegister]);
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

  // New inputs matching the visual design
  const [nickname, setNickname] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [sentOtpCode, setSentOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

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
        setReferralCode(refCode.toUpperCase());
      } else {
        const captured = safeLocalStorage.getItem('gi_captured_ref') || '72AGR';
        setReferralCode(captured);
      }
    };

    parseUrlAndSync();
  }, []);

  // Sign in fields
  const [loginSelectedCode, setLoginSelectedCode] = useState('+228');
  // Sign in fields
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [resetTip, setResetTip] = useState(false);

  // Modal States
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const [officialBanners, setOfficialBanners] = useState(() => DataStore.getOfficialBanners());
  React.useEffect(() => {
    const handleUpdate = () => {
      setOfficialBanners(DataStore.getOfficialBanners());
    };
    window.addEventListener('gi_store_updated', handleUpdate);
    return () => window.removeEventListener('gi_store_updated', handleUpdate);
  }, []);

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

  // OTP Countdown timer decay
  React.useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Handle sending interactive verification OTP
  const handleSendOTP = () => {
    if (!whatsapp.trim()) {
      setErrorMessage("Veuillez saisir votre numéro de téléphone avant d'envoyer l'OTP.");
      return;
    }
    setSendingOtp(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSentOtpCode(code);
      setSendingOtp(false);
      setOtpCountdown(60);
      setSuccessMessage(`🔑 CODE OTP ENVOYÉ : Saisissez le code ${code} pour finaliser votre inscription.`);
    }, 1000);
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
      if (!nickname.trim()) {
        setErrorMessage('Le surnom est requis.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Le mot de passe doit contenir au moins 6 caractères pour garantir la sécurité de votre capital.');
        setLoading(false);
        return;
      }
      if (!sentOtpCode) {
        setErrorMessage("Veuillez d'abord cliquer sur ENVOYER pour obtenir votre code de vérification (OTP).");
        setLoading(false);
        return;
      }
      if (otpCode !== sentOtpCode) {
        setErrorMessage('Le code de vérification (OTP) est incorrect.');
        setLoading(false);
        return;
      }

      const fullWhatsapp = getCleanWhatsappNumber(whatsapp, selectedCode);

      // Detect current device type
      const ua = navigator.userAgent;
      let detectedDevice = 'Ordinateur';
      if (/android/i.test(ua)) detectedDevice = 'Android';
      else if (/iPad|iPhone|iPod/.test(ua)) detectedDevice = 'iPhone';
      else if (/tablet/i.test(ua)) detectedDevice = 'Tablette';
      else if (/mobile/i.test(ua)) detectedDevice = 'Mobile';

      // Call database
      const result = await DataStore.register({
        name: nickname.trim(),
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
      <div className={`absolute inset-0 z-0 overflow-hidden select-none pointer-events-none transition-all duration-700 ${isRegister ? 'bg-gradient-to-tr from-slate-100 via-slate-50 to-blue-50/50' : 'bg-gradient-to-tr from-slate-100 via-slate-50 to-amber-50/40'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10" />
      </div>

      {/* Top Navigation Bar containing Back minimalist chevron and Language Selector text */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between relative z-10 mb-6 shrink-0 px-2">
        {onBackToHome ? (
          <button
            onClick={onBackToHome}
            type="button"
            className="text-slate-700 hover:text-slate-900 active:scale-95 transition-all cursor-pointer p-1"
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
          className="text-[14px] font-sans font-bold text-slate-600 hover:text-slate-800 active:scale-95 transition-colors cursor-pointer uppercase tracking-wider"
          title="Sélectionner la Langue"
        >
          Langue
        </button>
      </div>

      {/* Main Container Wrapper styled for clean centered single-column layout */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center items-center relative z-10 py-2 px-1 mb-8">
        
        <div className="w-full flex flex-col justify-center shrink-0">
          
          {/* Centered Goldspeed Bold Golden Stylized Logo */}
          <div className="flex flex-col items-center mb-6 animate-fade-in select-none">
            <div 
              className="text-[40px] md:text-[48px] font-sans font-black italic tracking-tighter text-[#d97706] leading-none select-none drop-shadow-sm"
            >
              Goldspeed
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Placement Sécurisé</span>
          </div>

          {/* Floating Auth Card matching modern app styles - styled conditional to be cardless on register as requested */}
          <div className={`w-full relative z-10 animate-fade-in transition-all ${isRegister ? 'p-1' : 'bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100/90'}`}>
          
          {!isRegister && (
            <div className="mb-6">
              <h1 className="text-xl font-sans font-black text-slate-800 tracking-tight">
                Connexion à votre espace
              </h1>
              <p className="text-xs text-slate-400 font-bold mt-1">
                Entrez vos identifiants pour accéder à vos placements
              </p>
            </div>
          )}

          {/* Error and Success alerts */}
          {errorMessage && (
            <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-100 text-xs text-red-800 font-bold flex items-start space-x-2 animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 font-bold flex items-start space-x-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                {sentOtpCode && successMessage.includes(sentOtpCode) ? (
                  <span>
                    🔑 CODE OTP ENVOYÉ : Saisissez le code{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setOtpCode(sentOtpCode);
                        setSuccessMessage("🔑 Code OTP rempli automatiquement dans le cadre !");
                      }}
                      className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-sans font-black px-2.5 py-1 rounded-md cursor-pointer transition-colors mx-1 inline-block animate-pulse border border-emerald-300 shadow-sm"
                      title="Cliquez pour insérer automatiquement le code"
                    >
                      {sentOtpCode}
                    </button>{" "}
                    (Cliquez sur le code pour le remplir automatiquement)
                  </span>
                ) : (
                  <span>{successMessage}</span>
                )}
              </div>
            </div>
          )}

          {/* Form inputs styled exactly as gray rounded boxes with top labels as requested */}
          <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
            
            {isRegister ? (
              /* REGISTRATION FIELDS - STYLED EXACTLY TO MATCH THE UPLOADED SCREENSHOT */
              <>
                {/* Pays Selector Box */}
                <div className="space-y-1">
                  <label className="text-[13px] font-sans font-bold text-slate-500 block">Pays</label>
                  <div className="border-b-2 border-slate-200/80 py-3 px-1 flex items-center justify-between relative cursor-pointer hover:border-[#0b5cd5] transition-colors">
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span className="text-lg leading-none">
                        {eligibleCountries.find(c => c.code === selectedCode)?.flag || '🇹🇬'}
                      </span>
                      {eligibleCountries.find(c => c.code === selectedCode)?.name || 'Togo'} ({selectedCode})
                    </span>
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                    <select
                      id="auth-country-select"
                      value={selectedCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        setSelectedCode(code);
                        const found = eligibleCountries.find(c => c.code === code);
                        if (found) setCountry(found.name);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    >
                      {eligibleCountries.map((c, i) => (
                        <option key={i} value={c.code} className="bg-white text-slate-800 font-bold">
                          {c.flag} {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Phone Input Box */}
                <div className="space-y-1">
                  <label className="text-[13px] font-sans font-bold text-slate-500 block">Numéro de téléphone</label>
                  <div className="border-b-2 border-slate-200/80 px-1 py-0.5 flex items-center focus-within:border-[#0b5cd5] transition-all">
                    <input
                      type="tel"
                      required
                      placeholder="Numéro de téléphone"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-transparent text-slate-800 text-sm font-bold py-3 focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Nickname (Surnom) Box */}
                <div className="space-y-1">
                  <label className="text-[13px] font-sans font-bold text-slate-500 block">Surnom</label>
                  <div className="border-b-2 border-slate-200/80 px-1 py-0.5 flex items-center focus-within:border-[#0b5cd5] transition-all">
                    <input
                      type="text"
                      required
                      placeholder="Surnom"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full bg-transparent text-slate-800 text-sm font-bold py-3 focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-1">
                  <label className="text-[13px] font-sans font-bold text-slate-500 block">Mot de passe</label>
                  <div className="border-b-2 border-slate-200/80 px-1 py-0.5 flex items-center justify-between focus-within:border-[#0b5cd5] transition-all">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Mot de passe de connexion (min. 6 caract)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 bg-transparent text-slate-800 text-sm font-bold py-3 focus:outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Invitation / Sponsor Code Field */}
                <div className="space-y-1">
                  <label className="text-[13px] font-sans font-bold text-slate-500 block">Code d'invitation</label>
                  <div className="border-b-2 border-slate-200/80 px-1 py-0.5 flex items-center justify-between focus-within:border-[#0b5cd5] transition-all">
                    <input
                      type="text"
                      placeholder="Veuillez entrer le code d'invitation (requis)"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="flex-1 bg-transparent text-slate-800 text-sm font-bold py-3 focus:outline-none placeholder:text-slate-400 uppercase tracking-widest"
                    />
                    <Link className="w-5 h-5 text-slate-400 shrink-0" />
                  </div>
                  {referralCode && (
                    <p className="text-[10px] font-sans font-bold text-amber-600 bg-amber-500/5 border border-amber-500/10 rounded-lg px-2.5 py-1 mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-amber-500 animate-ping"></span>
                      Sponsor actif : <span className="text-[#0b5cd5] font-black">{referralCode}</span> (Rempli automatiquement)
                    </p>
                  )}
                </div>

                {/* Code de vérification (OTP) Field with ENVOYER action */}
                <div className="space-y-1">
                  <label className="text-[13px] font-sans font-bold text-slate-500 block">Code de vérification (OTP)</label>
                  <div className="border-b-2 border-slate-200/80 px-1 py-0.5 flex items-center justify-between focus-within:border-[#0b5cd5] transition-all">
                    <input
                      type="text"
                      required
                      placeholder="Veuillez entrer le code de vérific"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="flex-1 bg-transparent text-slate-800 text-sm font-bold py-3 focus:outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={sendingOtp || otpCountdown > 0}
                      className="text-[#0b5cd5] hover:text-[#0a4fb9] active:scale-95 disabled:opacity-50 text-xs md:text-sm font-black uppercase tracking-wider bg-transparent border-none py-1 px-2 cursor-pointer transition-all shrink-0"
                    >
                      {otpCountdown > 0 ? `${otpCountdown}s` : "ENVOYER"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* LOGIN SPECIFIC FIELDS */
              <>
                {/* Pays Selector Box */}
                <div className="space-y-1">
                  <label className="text-[13px] font-sans font-bold text-slate-500 block">Pays</label>
                  <div className="border-b-2 border-slate-200/80 py-3 px-1 flex items-center justify-between relative cursor-pointer hover:border-[#0b5cd5] transition-colors">
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <span className="text-lg leading-none">
                        {eligibleCountries.find(c => c.code === loginSelectedCode)?.flag || '🇹🇬'}
                      </span>
                      {eligibleCountries.find(c => c.code === loginSelectedCode)?.name || 'Togo'} ({loginSelectedCode})
                    </span>
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                    <select
                      id="auth-login-country-select"
                      value={loginSelectedCode}
                      onChange={(e) => setLoginSelectedCode(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    >
                      {eligibleCountries.map((c, i) => (
                        <option key={i} value={c.code} className="bg-white text-slate-800 font-bold">
                          {c.flag} {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Login Phone Input */}
                <div className="space-y-1">
                  <label className="text-[13px] font-sans font-bold text-slate-500 block">Numéro de téléphone</label>
                  <div className="border-b-2 border-slate-200/80 px-1 py-0.5 flex items-center focus-within:border-[#0b5cd5] transition-all">
                    <input
                      type="text"
                      required
                      placeholder="Numéro de téléphone"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="w-full bg-transparent text-slate-800 text-sm font-bold py-3 focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Login Password Input */}
                <div className="space-y-1">
                  <label className="text-[13px] font-sans font-bold text-slate-500 block">Mot de passe</label>
                  <div className="border-b-2 border-slate-200/80 px-1 py-0.5 flex items-center justify-between focus-within:border-[#0b5cd5] transition-all">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Mot de passe de connexion"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="flex-1 bg-transparent text-slate-800 text-sm font-bold py-3 focus:outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Lost password option */}
                <div className="flex justify-end px-1">
                  <button 
                    type="button"
                    onClick={() => setResetTip(!resetTip)}
                    className="text-xs text-[#0b5cd5] hover:text-[#0a4fb9] font-black underline cursor-pointer hover:no-underline transition-colors uppercase tracking-wider font-sans"
                  >
                    Mot de passe perdu ?
                  </button>
                </div>

                {resetTip && (
                  <div className="p-4 bg-slate-50 rounded-2xl text-xs font-semibold text-slate-600 leading-relaxed text-left border border-slate-100 animate-fade-in">
                    💡 Pour récupérer ou réinitialiser votre compte d’investisseur, veuillez contacter notre service client en cliquant sur l'icône de l'assistance en bas à droite de votre écran.
                  </div>
                )}
              </>
            )}

            {/* Primary Submit Button - Styled as solid blue rounded pill exactly like screenshot */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#0b5cd5] hover:bg-[#0a4fb9] active:scale-[0.98] text-white font-sans font-extrabold text-sm uppercase tracking-wider py-4 px-4 rounded-full flex items-center justify-center transition-all select-none cursor-pointer disabled:opacity-50 mt-6 shadow-[0_8px_24px_rgba(11,92,213,0.2)]"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Traitement en cours...</span>
                </div>
              ) : (
                <span>{isRegister ? "S'inscrire" : "Se connecter"}</span>
              )}
            </button>

            {/* Secondary Toggle Mode Button - Styled as outlined blue rounded pill exactly like screenshot */}
            <div className="mt-3">
              <button
                id="auth-toggle-mode-btn"
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="w-full border-2 border-[#0b5cd5] hover:bg-blue-50/50 active:scale-[0.98] text-[#0b5cd5] font-sans font-extrabold text-sm uppercase tracking-wider py-4 px-4 rounded-full flex items-center justify-center transition-all select-none cursor-pointer"
              >
                <span>{isRegister ? "Se connecter maintenant" : "Créer un compte maintenant"}</span>
              </button>
            </div>
          </form>

        </div>



      </div>

    </div>

      {/* Footer Branding label */}
      <div className="w-full text-center relative z-10 py-2 shrink-0">
        <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest drop-shadow-xs">
          Goldspeed • Système de Placement Sécurisé
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
            src="https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&q=80&w=150" 
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
                  src="https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&q=80&w=150" 
                  alt="Service Client"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-none">Support Client Goldspeed</h3>
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

