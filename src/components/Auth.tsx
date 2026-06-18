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
  Tractor,
  Shield,
  Sprout,
  Sparkles,
  ChevronDown,
  Share,
  X,
  ChevronUp
} from 'lucide-react';
import { DataStore, syncWithBackend, safeLocalStorage } from '../dataStore';

export const eligibleCountries = [
  { name: "Côte d'Ivoire", code: '+225', flag: '🇨🇮' },
  { name: 'Burkina Faso', code: '+226', flag: '🇧🇫' },
  { name: 'Togo', code: '+228', flag: '🇹🇬' },
  { name: 'Bénin', code: '+229', flag: '🇧🇯' }
];

interface AuthProps {
  initialIsRegister?: boolean;
  onAuthSuccess: (user: any) => void;
  onBackToHome: () => void;
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
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedCode, setSelectedCode] = useState('+225');
  const [country, setCountry] = useState("Côte d'Ivoire");
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // Pre-fill sponsor referral code if captured from a direct web link
  React.useEffect(() => {
    const captured = safeLocalStorage.getItem('gi_captured_ref');
    if (captured) {
      setReferralCode(captured);
    }
  }, []);

  // Sign in fields
  const [loginSelectedCode, setLoginSelectedCode] = useState('+225');
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
      if (name.trim().length < 3) {
        setErrorMessage("Veuillez entrer un nom d'utilisateur valide (au moins 3 caractères).");
        setLoading(false);
        return;
      }
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

      // Detect current device type
      const ua = navigator.userAgent;
      let detectedDevice = 'Ordinateur';
      if (/android/i.test(ua)) detectedDevice = 'Android';
      else if (/iPad|iPhone|iPod/.test(ua)) detectedDevice = 'iPhone';
      else if (/tablet/i.test(ua)) detectedDevice = 'Tablette';
      else if (/mobile/i.test(ua)) detectedDevice = 'Mobile';

      // Call database
      const result = await DataStore.register({
        name: name.trim(),
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-[#fffaf5] overflow-hidden font-sans" id="auth-container">
      {/* Background agricultural image with a bright, warm, soft overlay */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1200&auto=format&fit=crop" 
          alt="Agriculture Background"
          className="w-full h-full object-cover filter brightness-[0.92] saturate-[1.05]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-orange-50/35 to-[#fffaf5]/90 backdrop-blur-[1.5px]" />
      </div>

      {/* Background glow effects to create a prestigious tech-agricultural ambient depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-orange-200/40 rounded-full blur-[120px] pointer-events-none z-1" />
      <div className="absolute bottom-[0%] right-[-10%] w-[400px] h-[400px] bg-emerald-200/30 rounded-full blur-[140px] pointer-events-none z-1" />

      {/* Main Container Wrapper */}
      <div className="w-full max-w-sm flex flex-col items-center relative z-10">

        {/* LOGO PROFESSIONNEL AGROPROFIT */}
        <div className="flex flex-col items-center mb-6 text-center select-none animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-orange-500 flex items-center justify-center shadow-xl shadow-orange-500/10 mb-2 transform hover:rotate-6 transition-transform">
            <Tractor className="w-8 h-8 text-white stroke-[2]" />
          </div>
          <h1 className="text-[22px] font-sans font-black tracking-tight text-slate-900 uppercase">
            Agro<span className="text-orange-500">Profit</span>
          </h1>
          <span className="text-[9.5px] text-emerald-700 font-extrabold tracking-widest uppercase block mt-1">
            L'excellence agro-technologique
          </span>
        </div>

        {/* 2. Main Card Form - Beautiful White & Orange theme */}
        <div className="w-full bg-white border border-orange-200/60 rounded-3xl p-6 md:p-8 shadow-[0_25px_60px_-15px_rgba(249,115,22,0.18)] relative overflow-hidden" id="auth-card">
          
          {/* Decorative Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 opacity-90" />

          {/* 3. Panel Title Card with Icon badge (Looks like "Création de Portefeuille") */}
          <div className="flex items-center gap-3 bg-orange-50/70 p-3 rounded-2xl border border-orange-100 mb-5">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white select-none">
              {isRegister ? <UserIcon className="w-5 h-5 text-white" /> : <Lock className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="text-slate-900 font-sans font-black text-sm uppercase tracking-wider">
                {isRegister ? "Création de Portefeuille" : "Ouverture de Session"}
              </h3>
              <p className="text-[9px] text-orange-600 font-bold uppercase tracking-wider font-mono">
                {isRegister ? "Nouveau compte d'investisseur" : "Accéder à vos placements"}
              </p>
            </div>
          </div>

          {/* Special Signup Bonus Badge */}
          {isRegister && (
            <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-200/80 text-[10px] text-orange-700 font-extrabold flex items-center justify-center gap-1.5 uppercase tracking-wider font-mono mb-4 text-center select-none">
              <span>🎁</span> Bonus de départ : 200 FCFA Offerts !
            </div>
          )}

          {/* Error and Success alerts */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 font-bold flex items-start space-x-2 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 font-bold flex items-start space-x-2 shadow-sm">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 4. Form inputs styled with custom containers & inner white pills */}
          <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
            
            {isRegister ? (
              /* REGISTRATION SPECIFIC FIELDS */
              <>
                {/* Full name input */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-slate-700 uppercase tracking-widest pl-1 font-sans">Nom complet d’utilisateur</label>
                  <div className="bg-orange-50/50 border border-orange-200/80 rounded-3xl p-1.5 px-3 flex items-center justify-between gap-2 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500/20 transition-all shadow-inner">
                    <div className="flex items-center gap-1.5 shrink-0 text-orange-500 pl-1">
                      <UserIcon className="w-4 h-4" />
                      <div className="h-5 w-[1px] bg-orange-200 ml-1.5" />
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={20}
                      placeholder="Ex: Alain Traoré"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 bg-white text-slate-900 text-sm font-semibold px-4 py-2 rounded-full placeholder:text-slate-400 focus:outline-none transition-all w-full min-w-0"
                    />
                  </div>
                </div>

                {/* Country-coded phone input */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-slate-700 uppercase tracking-widest pl-1 font-sans">Numéro de Téléphone WhatsApp</label>
                  <div className="bg-orange-50/50 border border-orange-200/80 rounded-3xl p-1.5 px-3 flex items-center justify-between gap-1 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500/20 transition-all shadow-inner">
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
                          <option key={i} value={c.code} className="bg-white text-slate-900">
                            {c.code}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="h-5 w-[1px] bg-orange-200 mx-1 shrink-0" />
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="Numéro de téléphone"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="flex-1 bg-white text-slate-900 text-sm font-semibold px-4 py-2 rounded-full placeholder:text-slate-400 focus:outline-none transition-all w-full min-w-0"
                    />
                  </div>
                </div>

                {/* Password fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-slate-700 uppercase tracking-widest pl-1 font-sans">Mot de Passe</label>
                    <div className="bg-orange-50/50 border border-orange-200/80 rounded-3xl p-1.5 px-3 flex items-center justify-between gap-2 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500/20 transition-all shadow-inner">
                      <div className="flex items-center gap-1.5 shrink-0 text-orange-500 pl-1">
                        <Lock className="w-4 h-4" />
                        <div className="h-5 w-[1px] bg-orange-200 ml-1.5" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 bg-white text-slate-900 text-sm font-semibold px-4 py-2 rounded-full placeholder:text-slate-400 focus:outline-none transition-all w-full min-w-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-slate-700 uppercase tracking-widest pl-1 font-sans">Confirmation</label>
                    <div className="bg-orange-50/50 border border-orange-200/80 rounded-3xl p-1.5 px-3 flex items-center justify-between gap-2 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500/20 transition-all shadow-inner">
                      <div className="flex items-center gap-1.5 shrink-0 text-orange-500 pl-1">
                        <Lock className="w-4 h-4" />
                        <div className="h-5 w-[1px] bg-orange-200 ml-1.5" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Confirmez"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="flex-1 bg-white text-slate-900 text-sm font-semibold px-4 py-2 rounded-full placeholder:text-slate-400 focus:outline-none transition-all w-full min-w-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Sponsor code */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-slate-700 uppercase tracking-widest pl-1 font-sans">Sponsor / Code Parrainage</label>
                  <div className="bg-orange-50/50 border border-orange-200/80 rounded-3xl p-1.5 px-3 flex items-center justify-between gap-2 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500/20 transition-all shadow-inner">
                    <div className="flex items-center gap-1.5 shrink-0 text-orange-500 pl-1">
                      <Shield className="w-4 h-4" />
                      <div className="h-5 w-[1px] bg-orange-200 ml-1.5" />
                    </div>
                    <input
                      type="text"
                      placeholder="ADMIN228"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="flex-1 bg-white text-slate-900 text-sm font-bold tracking-widest font-mono uppercase px-4 py-2 rounded-full placeholder:text-slate-400 focus:outline-none transition-all w-full min-w-0"
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
                  <label className="block text-[10px] font-mono font-bold text-slate-700 uppercase tracking-widest pl-1 font-sans">Numéro de Téléphone</label>
                  <div className="bg-orange-50/50 border border-orange-200/80 rounded-3xl p-1.5 px-3 flex items-center justify-between gap-1 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500/20 transition-all shadow-inner">
                    <div className="flex items-center gap-1 select-none text-slate-800 font-bold text-sm shrink-0 pl-1">
                      <span className="text-base select-none leading-none">
                        {eligibleCountries.find(c => c.code === loginSelectedCode)?.flag || '🇧🇫'}
                      </span>
                      <select
                        id="auth-login-country-select"
                        value={loginSelectedCode}
                        onChange={(e) => setLoginSelectedCode(e.target.value)}
                        className="bg-transparent text-slate-200 font-bold text-xs md:text-sm focus:outline-none cursor-pointer pr-1"
                      >
                        {eligibleCountries.map((c, i) => (
                          <option key={i} value={c.code} className="bg-white text-slate-900">
                            {c.code}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="h-5 w-[1px] bg-orange-200 mx-1 shrink-0" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Numéro de téléphone"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="flex-1 bg-white text-slate-900 text-sm font-semibold px-4 py-2 rounded-full placeholder:text-slate-400 focus:outline-none transition-all w-full min-w-0"
                    />
                  </div>
                </div>

                {/* Password field with forget pass option */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center mb-1 px-1">
                    <label className="block text-[10px] font-mono font-bold text-slate-700 uppercase tracking-widest font-sans">Mot de Passe</label>
                    <button 
                      type="button"
                      onClick={() => setResetTip(!resetTip)}
                      className="text-[9px] text-orange-600 hover:text-orange-850 font-bold underline cursor-pointer hover:no-underline transition-colors select-none uppercase font-mono tracking-wider font-sans"
                    >
                      Perdu ?
                    </button>
                  </div>

                  {resetTip && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[10px] font-bold text-amber-700 leading-relaxed text-left font-mono">
                      💡 Pour réinitialiser votre compte d’investisseur, veuillez contacter l'assistance officielle AgroProfit via le support WhatsApp.
                    </div>
                  )}

                  <div className="bg-orange-50/50 border border-orange-200/80 rounded-3xl p-1.5 px-3 flex items-center justify-between gap-2 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500/20 transition-all shadow-inner font-sans">
                    <div className="flex items-center gap-1.5 shrink-0 text-orange-500 pl-1">
                      <Lock className="w-4 h-4" />
                      <div className="h-5 w-[1px] bg-orange-200 ml-1.5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Mot de passe"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="flex-1 bg-white text-slate-900 text-sm font-semibold px-4 py-2 rounded-full placeholder:text-slate-400 focus:outline-none transition-all w-full min-w-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors mr-1 shrink-0"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Submit button (Pure elegant orange with Sprout icon) */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/25 active:scale-[0.98] text-white font-sans font-black text-xs py-3.5 px-4 rounded-full flex items-center justify-center space-x-2 transition-all shadow-lg uppercase tracking-wider select-none cursor-pointer disabled:opacity-40"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Traitement sécurisé...</span>
                </div>
              ) : (
                <>
                  <Sprout className="w-4 h-4 text-white shrink-0" />
                  <span>{isRegister ? "Créer mon compte" : "Se connecter"}</span>
                </>
              )}
            </button>
          </form>

          {/* 5. Under-form toggle action (Standard lowercase like photo but very polished) */}
          <div className="mt-6 pt-4 border-t border-orange-100/80 text-center font-sans">
            <button
               id="auth-toggle-mode-btn"
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-[#ea580c] hover:text-orange-900 transition-colors text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer lowercase"
            >
              <span>🔑</span>
              <span className="underline select-none">
                {isRegister ? "déjà un compte? se connecter ➔" : "nouveau investisseur? s'inscrire ➔"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

