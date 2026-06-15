import { ArrowRight } from 'lucide-react';

interface HomeProps {
  onNavigateToAuth: (isRegister: boolean) => void;
  isLoggedIn: boolean;
  onGoToDashboard: () => void;
}

export default function Home({ 
  onNavigateToAuth, 
  isLoggedIn, 
  onGoToDashboard 
}: HomeProps) {
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#ffffff] to-[#fff6ed] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-gradient-to-tr from-orange-500/10 to-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-80 h-80 bg-gradient-to-tr from-orange-400/10 to-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full bg-white border-2 border-orange-200/60 rounded-3xl p-8 shadow-[0_20px_50px_rgba(249,115,22,0.08)] relative z-10 transition-all hover:shadow-[0_25px_60px_rgba(249,115,22,0.12)]">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-orange-600 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20 mb-4 transform hover:scale-105 transition-all">
          <span className="text-2xl select-none">🌱</span>
        </div>
        
        <h1 className="font-display font-black text-slate-900 text-3xl uppercase tracking-wider mb-2">
          AgroCapital
        </h1>
        <p className="text-xs text-slate-500 font-bold mb-6 uppercase tracking-wide">
          Plateforme d'investissement agro-industriel moderne, sécurisée et professionnelle.
        </p>

        <div className="space-y-3">
          {isLoggedIn ? (
            <button
              onClick={onGoToDashboard}
              className="w-full py-4 rounded-full font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 text-xs uppercase tracking-wider font-display cursor-pointer shadow-md shadow-orange-500/15"
            >
              <span>Accéder au Tableau de Bord</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          ) : (
            <>
              <button
                onClick={() => onNavigateToAuth(true)}
                className="w-full py-4 rounded-full font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 text-xs uppercase tracking-wider font-display cursor-pointer shadow-md shadow-orange-500/15"
              >
                <span>Créer mon Compte (+200F)</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => onNavigateToAuth(false)}
                className="w-full py-3.5 bg-orange-50 hover:bg-orange-100 border border-orange-200/80 text-orange-700 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm tracking-wider"
              >
                Déjà membre ? Se connecter
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
