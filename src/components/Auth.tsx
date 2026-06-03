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
import { DataStore, syncWithBackend } from '../dataStore';

export const eligibleCountries = [
  { name: 'Cameroun', code: '+237' },
  { name: 'Burkina Faso', code: '+226' }
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
    const captured = localStorage.getItem('gi_captured_ref');
    if (captured) {
      setReferralCode(captured);
    }
  }, []);

  // Sign up fields
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedCode, setSelectedCode] = useState('+237');
  const [country, setCountry] = useState('Cameroun');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // Sign in fields
  const [loginSelectedCode, setLoginSelectedCode] = useState('+237');
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

      // Call database
      const result = await DataStore.register({
        name: name.trim(),
        whatsapp: fullWhatsapp,
        country,
        password,
        referredByCode: referralCode
      });

      if (result.success && result.user) {
        setSuccessMessage(result.message);
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
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-slate-950">
      {/* Background gradients */}
      <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-[#1b64d9]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-80 h-80 bg-[#1b64d9]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-lg bg-[#eef3fc] border-2 border-slate-200/50 rounded-3xl p-6 md:p-8 shadow-2xl relative">
        
        {/* Brand logo */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1b64d9] to-[#046fff] flex items-center justify-center mx-auto shadow-md mb-2">
            <Lock className="w-4 h-4 text-white stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-sans font-black text-slate-800 uppercase tracking-tight">
            {isRegister ? 'Inscription' : 'Connexion Premium'}
          </h2>
          <p className="text-[11px] text-slate-500 font-bold mt-1 leading-relaxed">
            {isRegister 
              ? 'Recevez 200 XAF gratuit immédiatement' 
              : 'Accédez de manière entièrement cryptée à vos investissements passifs'
            }
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border-2 border-red-200 text-xs text-red-700 font-bold flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success notification */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border-2 border-green-200 text-xs text-green-700 font-bold flex items-start space-x-2.5">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister ? (
            /* REGISTRATION FIELDS */
            <>
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">Nom d'utilisateur</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Ex: alain225"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 focus:border-[#1b64d9] focus:ring-1 focus:ring-[#1b64d9] rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-800 font-bold focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">WhatsApp / Téléphone</label>
                <div className="flex gap-2">
                  <select
                    value={selectedCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setSelectedCode(code);
                      const found = eligibleCountries.find(c => c.code === code);
                      if (found) setCountry(found.name);
                    }}
                    className="bg-white border-2 border-slate-200 focus:border-[#1b64d9] rounded-2xl py-3 px-3 text-xs md:text-sm text-slate-800 font-black focus:outline-none transition-colors cursor-pointer w-32 shrink-0 text-center"
                  >
                    {eligibleCountries.map((c, i) => (
                      <option key={i} value={c.code}>{c.code} ({c.name})</option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-3.5 text-slate-400">
                      <Smartphone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 0708091011"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-white border-2 border-slate-200 focus:border-[#1b64d9] rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-800 font-bold focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">Mot de Passe</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border-2 border-slate-200 focus:border-[#1b64d9] rounded-2xl py-3 pl-4 pr-10 text-sm text-slate-800 font-bold focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-[#1b64d9]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">Confirmer le passe</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 focus:border-[#1b64d9] rounded-2xl py-3 px-4 text-sm text-slate-800 font-bold focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">Code de Parrainage (Optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex: AGRO777"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 focus:border-[#1b64d9] rounded-2xl py-3 px-4 text-sm text-[#1b64d9] font-black tracking-widest font-mono uppercase focus:outline-none transition-colors"
                />
                <span className="text-[10px] text-slate-500 font-bold mt-1 block">Renseignez le code d'un parrain si vous en avez un.</span>
              </div>
            </>
          ) : (
            /* LOGIN FIELDS */
            <>
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">Pays et Numéro de téléphone</label>
                <div className="flex gap-2">
                  <select
                    value={loginSelectedCode}
                    onChange={(e) => setLoginSelectedCode(e.target.value)}
                    className="bg-white border-2 border-slate-200 focus:border-[#1b64d9] rounded-2xl py-3 px-3 text-xs md:text-sm text-slate-800 font-black focus:outline-none transition-colors cursor-pointer w-32 shrink-0 text-center"
                  >
                    {eligibleCountries.map((c, i) => (
                      <option key={i} value={c.code}>{c.code} ({c.name})</option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-3.5 text-slate-400">
                      <Smartphone className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 0708091011 (ou email/admin)"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="w-full bg-white border-2 border-slate-200 focus:border-[#1b64d9] rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-800 font-bold focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-wider">Mot de Passe</label>
                  <button 
                    type="button"
                    onClick={() => {
                      setResetTip(!resetTip);
                    }}
                    className="text-[10px] text-[#1b64d9] font-black hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                {resetTip && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-2xl text-[11px] font-bold text-red-700 leading-normal animate-pulse text-left">
                    Pour réinitialiser votre mot de passe d'investisseur, veuillez contacter notre groupe d'assistance WhatsApp officielle.
                  </div>
                )}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 focus:border-[#1b64d9] rounded-2xl py-3 pl-4 pr-10 text-sm text-slate-800 font-bold focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-[#1b64d9]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-sans font-black text-xs flex items-center justify-center space-x-2 bg-gradient-to-r from-[#1b64d9] to-[#046fff] hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer uppercase tracking-widest shadow-lg disabled:opacity-40"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Traitement sécurisé...</span>
              </div>
            ) : (
              <span>{isRegister ? "Créer mon Compte" : "Se Connecter Maintenant"}</span>
            )}
          </button>
        </form>

        {/* TOGGLE AUTH */}
        <div className="mt-6 pt-4 border-t border-slate-200 text-center text-xs">
          <span className="text-slate-500 font-bold">
            {isRegister ? 'Déjà membre de AgroCapital ?' : 'Nouveau sur notre plateforme ?'}
          </span>{' '}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className="text-[#1b64d9] font-black hover:underline ml-1 focus:outline-none uppercase tracking-wider text-[11px]"
          >
            {isRegister ? 'Connectez-vous' : 'Inscrivez-vous (+200F)'}
          </button>
        </div>
      </div>
    </div>
  );
}
