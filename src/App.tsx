import { useState, useEffect } from 'react';
import Home from './components/Home';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { User, Product } from './types';
import { DataStore } from './dataStore';

export default function App() {
  // Navigation: 'home' | 'auth' | 'dashboard'
  const [currentScreen, setCurrentScreen] = useState<'home' | 'auth' | 'dashboard'>('home');
  const [isRegisterFlow, setIsRegisterFlow] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  // On page load, check for active session and URL MLM parameters
  useEffect(() => {
    // 1. Recover active user logs
    const active = DataStore.getCurrentUser();
    if (active) {
      setUser(active);
      setCurrentScreen('dashboard');
    }

    // 2. Fetch configured VIP levels
    setProducts(DataStore.getProducts());

    // 3. Catch referral tags in URL parameters to auto-fill MLM boxes later
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem('gi_captured_ref', refCode.toUpperCase());
    }
  }, []);

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    DataStore.saveCurrentUser(null);
    setUser(null);
    setCurrentScreen('home');
  };

  const navigateToAuth = (isRegister: boolean) => {
    setIsRegisterFlow(isRegister);
    setCurrentScreen('auth');
  };

  // Direct landing plan purchase fallback
  const handleSelectProductFromHome = (product: Product) => {
    if (user) {
      // If already logged in, go straight to the products tab in the dashboard
      setCurrentScreen('dashboard');
    } else {
      // Prompt register first
      navigateToAuth(true);
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans tracking-tight leading-normal overflow-x-hidden select-none">
      
      {/* 1. MARKETING PORTAL LANDING */}
      {currentScreen === 'home' && (
        <Home 
          products={products}
          onNavigateToAuth={navigateToAuth}
          onSelectProduct={handleSelectProductFromHome}
          isLoggedIn={!!user}
          onGoToDashboard={() => setCurrentScreen('dashboard')}
        />
      )}

      {/* 2. AUTHENTICATION SCREENS */}
      {currentScreen === 'auth' && (
        <Auth 
          initialIsRegister={isRegisterFlow}
          onAuthSuccess={handleAuthSuccess}
          onBackToHome={() => setCurrentScreen('home')}
        />
      )}

      {/* 3. INVESTOR DESKTOP & MOBILE DASHBOARD AREA */}
      {currentScreen === 'dashboard' && user && (
        <Dashboard 
          currentUser={user}
          onLogout={handleLogout}
          onRefreshUser={(updatedUser) => setUser(updatedUser)}
        />
      )}

    </div>
  );
}
