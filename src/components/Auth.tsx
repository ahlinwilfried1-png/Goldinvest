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
  RotateCw
} from 'lucide-react';
import { DataStore, syncWithBackend, safeLocalStorage } from '../dataStore';

export const eligibleCountries = [
  { name: 'Côte d\'Ivoire', code: '+225' },
  { name: 'Togo', code: '+228' },
  { name: 'Bénin', code: '+229' },
  { name: 'Burkina Faso', code: '+226' },
  { name: 'Cameroun', code: '+237' }
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

  // Pre-fill sponsor referral code if captured from a direct web link
  React.useEffect(() => {
    const captured = safeLocalStorage.getItem('gi_captured_ref');
    if (captured) {
      setReferralCode(captured);
    }
  }, []);

  // Sign up fields
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedCode, setSelectedCode] = useState('+225');
  const [country, setCountry] = useState('Côte d\'Ivoire');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

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
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-stone-50 overflow-hidden">
      {/* Absolute gold and warm ambient glow lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-yellow-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[0%] right-[-10%] w-[400px] h-[400px] bg-amber-400/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-yellow-300/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main card - completely White */}
      <div className="w-full max-w-lg bg-white border-2 border-amber-400/50 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(245,158,11,0.12)] relative overflow-hidden backdrop-blur-xl ring-1 ring-yellow-400/20">
        
        {/* Subtle decorative top gold line */}
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 opacity-90" />

        {/* Brand logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center mx-auto shadow-[0_8px_20px_rgba(245,158,11,0.25)] mb-3">
            <Lock className="w-5 h-5 text-stone-900 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-sans font-black text-stone-950 uppercase tracking-tight">
            {isRegister ? 'Créer un Compte' : 'Espace Investisseur'}
          </h2>
          <p className="text-[11px] text-amber-600 font-extrabold mt-1.5 leading-relaxed tracking-wider uppercase font-mono">
            {isRegister 
              ? `Bonus immédiat : 200 ${selectedCode === '+237' ? 'XAF' : 'XOF'} offert` 
              : 'Accès sécurisé et crypté à vos investissements AgroCapital'
            }
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-xs text-red-700 font-extrabold flex items-start space-x-2.5 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success notification */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-xs text-emerald-700 font-extrabold flex items-start space-x-2.5 shadow-sm">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister ? (
            /* REGISTRATION FIELDS */
            <>
              <div>
                <label className="block text-xs font-mono font-black text-stone-700 uppercase tracking-widest mb-1.5">Nom complet ou d’utilisateur</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-amber-500">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    placeholder="Ex: Alain Traore"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-2xl py-3 pl-10 pr-4 text-sm text-stone-900 font-extrabold focus:outline-none transition-all placeholder:text-stone-400 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-black text-stone-700 uppercase tracking-widest mb-1.5">WhatsApp / Téléphone Mobile</label>
                <div className="flex gap-2">
                  <select
                    value={selectedCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setSelectedCode(code);
                      const found = eligibleCountries.find(c => c.code === code);
                      if (found) setCountry(found.name);
                    }}
                    className="bg-stone-50 border border-stone-200 focus:border-amber-400 rounded-2xl py-3 px-3 text-xs md:text-sm text-stone-900 font-extrabold focus:outline-none transition-all cursor-pointer w-32 shrink-0 text-center shadow-sm"
                  >
                    {eligibleCountries.map((c, i) => (
                      <option key={i} value={c.code} className="bg-white text-stone-900">{c.code} ({c.name === 'Cameroun' ? 'XAF' : 'XOF'})</option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-3.5 text-amber-500">
                      <Smartphone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 0708091011"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-2xl py-3 pl-10 pr-4 text-sm text-stone-900 font-extrabold focus:outline-none transition-all placeholder:text-stone-400 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-black text-stone-700 uppercase tracking-widest mb-1.5">Mot de Passe</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-2xl py-3 pl-4 pr-10 text-sm text-stone-900 font-extrabold focus:outline-none transition-all placeholder:text-stone-400 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-stone-400 hover:text-amber-500"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-black text-stone-700 uppercase tracking-widest mb-1.5">Confirmation</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-2xl py-3 px-4 text-sm text-stone-900 font-extrabold focus:outline-none transition-all placeholder:text-stone-400 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-black text-stone-700 uppercase tracking-widest mb-1.5">Sponsor / Code Parrainage</label>
                <input
                  type="text"
                  placeholder="Ex: AGR72 (Optionnel)"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-2xl py-3 px-4 text-sm text-amber-600 font-black tracking-widest font-mono uppercase focus:outline-none transition-all placeholder:text-stone-400 shadow-sm"
                />
              </div>
            </>
          ) : (
            /* LOGIN FIELDS */
            <>
              <div>
                <label className="block text-xs font-mono font-black text-stone-700 uppercase tracking-widest mb-1.5">Sélectionner votre pays</label>
                <div className="flex gap-2">
                  <select
                    value={loginSelectedCode}
                    onChange={(e) => setLoginSelectedCode(e.target.value)}
                    className="bg-stone-50 border border-stone-200 focus:border-amber-400 rounded-2xl py-3 px-3 text-xs md:text-sm text-stone-900 font-extrabold focus:outline-none transition-all cursor-pointer w-32 shrink-0 text-center shadow-sm"
                  >
                    {eligibleCountries.map((c, i) => (
                      <option key={i} value={c.code} className="bg-white text-stone-900">{c.code} ({c.name === 'Cameroun' ? 'XAF' : 'XOF'})</option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-3.5 text-amber-500">
                      <Smartphone className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 0708091011 (ou admin)"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-2xl py-3 pl-10 pr-4 text-sm text-stone-900 font-extrabold focus:outline-none transition-all placeholder:text-stone-400 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-mono font-black text-stone-700 uppercase tracking-widest">Votre Mot de Passe</label>
                  <button 
                    type="button"
                    onClick={() => {
                      setResetTip(!resetTip);
                    }}
                    className="text-[10px] text-amber-600 font-black hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                {resetTip && (
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[10px] font-bold text-amber-800 leading-normal animate-pulse text-left font-sans">
                    💡 Pour réinitialiser votre compte d’investisseur, veuillez contacter l'assistance officielle AgroCapital via le support WhatsApp.
                  </div>
                )}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-2xl py-3 pl-4 pr-10 text-sm text-stone-900 font-extrabold focus:outline-none transition-all placeholder:text-stone-400 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-stone-400 hover:text-amber-500"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* SUBMIT BUTTON - Glowing Gold */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-stone-950 font-sans font-black text-xs flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer uppercase tracking-widest shadow-[0_8px_25px_rgba(245,158,11,0.25)] disabled:opacity-40"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-stone-955 border-t-transparent rounded-full animate-spin" />
                <span>Synchronisation cryptée de l’accès...</span>
              </div>
            ) : (
              <span>{isRegister ? "Créer mon Compte" : "Se Connecter Sécurisé"}</span>
            )}
          </button>
        </form>

        {/* TOGGLE AUTH */}
        <div className="mt-6 pt-4 border-t border-stone-200 text-center text-xs">
          <span className="text-stone-500 font-bold">
            {isRegister ? 'Déjà membre AgroCapital ?' : 'Nouveau investisseur ?'}
          </span>{' '}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className="text-amber-600 font-black hover:underline hover:text-amber-700 ml-1 focus:outline-none uppercase tracking-wider text-[11px]"
          >
            {isRegister ? 'Se connecter' : 'Créer un compte d’investissements'}
          </button>
        </div>
      </div>
    </div>
  );
}

