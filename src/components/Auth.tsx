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
import { DataStore } from '../dataStore';

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
  const [country, setCountry] = useState('Côte d’Ivoire');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // Sign in fields
  const [loginWhatsapp, setLoginWhatsapp] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Anti-spam simulation check
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaNum1, setCaptchaNum1] = useState(Math.floor(2 + Math.random() * 8));
  const [captchaNum2, setCaptchaNum2] = useState(Math.floor(1 + Math.random() * 9));
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [enteredCaptcha, setEnteredCaptcha] = useState('');

  // Regenerate simple math captcha for robot check
  const refreshCaptcha = () => {
    setCaptchaNum1(Math.floor(2 + Math.random() * 8));
    setCaptchaNum2(Math.floor(1 + Math.random() * 9));
    setEnteredCaptcha('');
    setCaptchaVerified(false);
  };

  const countriesList = [
    'Côte d’Ivoire',
    'Burkina Faso',
    'Mali',
    'Sénégal',
    'Togo',
    'Bénin',
    'Cameroun',
    'Niger',
    'Guinée',
    'France',
  ];

  // Form submission dispatcher
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Check captcha
    const sum = captchaNum1 + captchaNum2;
    if (parseInt(enteredCaptcha) !== sum) {
      setErrorMessage('La vérification de protection anti-robot a échoué. Veuillez essayer à nouveau.');
      refreshCaptcha();
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (isRegister) {
        // Registration validations
        if (name.trim().length < 3) {
          setErrorMessage('Veuillez entrer un nom et prénom complet valide (au moins 3 caractères).');
          setLoading(false);
          return;
        }
        if (!whatsapp.trim()) {
          setErrorMessage('Le numéro WhatsApp est requis.');
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

        // Call database
        const result = DataStore.register({
          name,
          whatsapp,
          country,
          referredByCode: referralCode
        });

        if (result.success && result.user) {
          setSuccessMessage(result.message);
          setTimeout(() => {
            onAuthSuccess(result.user);
            setLoading(false);
          }, 1500);
        } else {
          setErrorMessage(result.message || "Une erreur s'est produite lors de la création de votre compte d'investissement.");
          setLoading(false);
        }

      } else {
        // Login validations
        if (!loginWhatsapp.trim()) {
          setErrorMessage('Le numéro WhatsApp est requis.');
          setLoading(false);
          return;
        }
        if (!loginPassword.trim()) {
          setErrorMessage('Le mot de passe de connexion est requis.');
          setLoading(false);
          return;
        }

        const result = DataStore.login(loginWhatsapp, loginPassword);
        if (result.success && result.user) {
          setSuccessMessage(result.message);
          setTimeout(() => {
            onAuthSuccess(result.user);
            setLoading(false);
          }, 1500);
        } else {
          setErrorMessage(result.message);
          setLoading(false);
        }
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-slate-950">
      {/* Background gradients */}
      <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-80 h-80 bg-blue-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-lg bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-yellow-500/20 p-6 md:p-8 shadow-2xl relative">
        
        {/* Header navigation */}
        <button 
          onClick={onBackToHome}
          className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Fermer et retourner au site</span>
        </button>

        {/* Brand logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center mx-auto shadow-md shadow-yellow-500/10 mb-3">
            <Lock className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white">
            {isRegister ? 'Ouvrir un Compte Premium' : 'Connexion Investisseur'}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5">
            {isRegister 
              ? 'Créez votre dossier d\'affiliation et offrez-vous 1 000 FCFA gratuits' 
              : 'Accédez de manière cryptée et sécurisée à votre tableau de bord financier'
            }
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success notification */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-xs text-green-200 flex items-start space-x-2.5">
            <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister ? (
            /* REGISTRATION FIELDS */
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Nom et Prénom</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-500">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Alain Kouadio"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/50 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">WhatsApp (Sans indicatif)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-slate-500">
                      <Smartphone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 0708091011"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/50 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Pays de Résidence</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-slate-500">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/50 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white focus:outline-none transition-colors appearance-none cursor-pointer"
                    >
                      {countriesList.map((c, i) => (
                        <option key={i} value={c} className="bg-slate-900 text-white">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Mot de Passe</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/50 rounded-xl py-3.5 pl-4 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Confirmation</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/50 rounded-xl py-3.5 px-4 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Code de Parrainage (Optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex: GOLD777"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/50 rounded-xl py-3.5 px-4 text-sm text-yellow-300 font-mono focus:outline-none transition-colors"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Renseignez le code d'un ami pour lui reverser des commissions.</span>
              </div>
            </>
          ) : (
            /* LOGIN FIELDS */
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Numéro WhatsApp ou Email</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-500">
                    <Smartphone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Ex: +225 07 08 09 10 11"
                    value={loginWhatsapp}
                    onChange={(e) => setLoginWhatsapp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/50 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Mot de Passe</label>
                  <button 
                    type="button"
                    onClick={() => {
                      alert("Pour réinitialiser votre mot de passe d'investisseur, veuillez contacter notre équipe d'assistance WhatsApp officielle ou utiliser le code de démonstration par défaut (user123).");
                    }}
                    className="text-[10px] text-yellow-500 hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/50 rounded-xl py-3.5 pl-4 pr-10 text-sm text-white focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick tip demo credentials */}
              <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl text-[11px] text-yellow-400/85">
                <span className="font-semibold block mb-0.5">🔑 Identifiants d'essai (Démo) :</span>
                <ul className="list-disc pl-4 space-y-0.5 font-mono">
                  <li>Compte Admin: <strong className="text-white">+2250102030405</strong> / <strong className="text-white">admin</strong></li>
                  <li>Compte Client: <strong className="text-white">+2250708091011</strong> / <strong className="text-white">user123</strong></li>
                </ul>
              </div>
            </>
          )}

          {/* MATH SHIELD ANTI-BOT CHALLENGE */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-yellow-500/15">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Sécurité Anti-Robot Captcha</span>
              <button 
                type="button"
                onClick={refreshCaptcha}
                className="text-yellow-400 hover:rotate-180 transition-transform duration-500"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm font-bold bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-yellow-400 font-mono">
                {captchaNum1} + {captchaNum2} =
              </span>
              <input
                type="number"
                required
                placeholder="Ranger"
                value={enteredCaptcha}
                onChange={(e) => setEnteredCaptcha(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-lg p-2 text-sm text-center text-white font-mono placeholder-slate-700 focus:outline-none"
              />
            </div>
            <p className="text-[9px] text-slate-500 mt-1.5 uppercase tracking-wider">Résolvez cette addition mathématique simple pour valider la session.</p>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl text-slate-950 font-display font-medium text-sm flex items-center justify-center space-x-2 gold-bg-gradient hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer font-bold uppercase tracking-wider shadow-lg shadow-yellow-500/10 disabled:opacity-40"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Cryptage en cours...</span>
              </div>
            ) : (
              <span>{isRegister ? "Confirmer l'Inscription" : "Se Connecter en Sécurité"}</span>
            )}
          </button>
        </form>

        {/* TOGGLE AUTH */}
        <div className="mt-6 pt-4 border-t border-slate-800/60 text-center text-xs">
          <span className="text-slate-400">
            {isRegister ? 'Déjà membre de GoldInvest ?' : 'Nouveau sur notre plateforme ?'}
          </span>{' '}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage('');
              setSuccessMessage('');
              refreshCaptcha();
            }}
            className="text-yellow-400 font-bold hover:underline ml-1 focus:outline-none"
          >
            {isRegister ? 'Connectez-vous ici' : 'Inscrivez-vous maintenant (+1 000F)'}
          </button>
        </div>
      </div>
    </div>
  );
}
