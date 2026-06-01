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
    <div className="w-full min-h-screen bg-[#030611] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-[30%] left-[30%] w-72 h-72 bg-gradient-to-tr from-yellow-500/10 to-amber-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full bg-[#eef3fc] border-2 border-slate-200/50 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1b64d9] to-[#046fff] flex items-center justify-center mx-auto shadow-md mb-4">
          <span className="text-xl">📈</span>
        </div>
        
        <h1 className="font-display font-black text-slate-850 text-2xl uppercase tracking-tight mb-2">
          AgroCapital
        </h1>
        <p className="text-xs text-slate-500 font-bold mb-6">
          Plateforme d'investissement agro-industriel moderne, sécurisée et professionnelle.
        </p>

        <div className="space-y-3">
          {isLoggedIn ? (
            <button
              onClick={onGoToDashboard}
              className="w-full py-4 rounded-xl font-bold bg-[#1b64d9] text-white hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 text-xs uppercase tracking-wide font-display cursor-pointer"
            >
              <span>Accéder au Tableau de Bord</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => onNavigateToAuth(true)}
                className="w-full py-4 rounded-xl font-bold bg-[#1b64d9] text-white hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 text-xs uppercase tracking-wide font-display cursor-pointer"
              >
                <span>Créer mon Compte (+200F)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigateToAuth(false)}
                className="w-full py-3.5 bg-slate-200/70 border-2 border-slate-350 hover:bg-slate-300 text-slate-850 rounded-xl text-xs font-bold transition-all"
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
