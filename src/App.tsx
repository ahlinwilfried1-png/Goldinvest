import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { User, Product } from './types';
import { DataStore } from './dataStore';

export default function App() {
  // Navigation: 'auth' | 'dashboard'
  const [currentScreen, setCurrentScreen] = useState<'auth' | 'dashboard'>('auth');
  const [isRegisterFlow, setIsRegisterFlow] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  // On page load, check for active session and URL MLM parameters
  useEffect(() => {
    // 1. Recover active user logs
    const active = DataStore.getCurrentUser();

    // 2. Fetch configured VIP levels
    setProducts(DataStore.getProducts());

    // 3. Catch referral tags in URL parameters (supports ?ref=, ?code=, ?r=, ?parrain=, ?sponsor=)
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref') || params.get('code') || params.get('r') || params.get('parrain') || params.get('sponsor');
    if (refCode) {
      localStorage.setItem('gi_captured_ref', refCode.toUpperCase());
      if (active) {
        setUser(active);
        setCurrentScreen('dashboard');
      } else {
        // Bypass home landing page entirely for users coming via a referral/sponsor link
        setIsRegisterFlow(true);
        setCurrentScreen('auth');
      }
    } else if (active) {
      setUser(active);
      setCurrentScreen('dashboard');
    } else {
      // Force registration page on fresh visits by non-logged-in users
      setIsRegisterFlow(true);
      setCurrentScreen('auth');
    }
  }, []);

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    DataStore.saveCurrentUser(null);
    setUser(null);
    setIsRegisterFlow(true);
    setCurrentScreen('auth');
  };

  const navigateToAuth = (isRegister: boolean) => {
    setIsRegisterFlow(isRegister);
    setCurrentScreen('auth');
  };

  return (
    <div className="min-h-screen bg-black font-sans tracking-tight leading-normal overflow-x-hidden select-none">

      {/* 1. AUTHENTICATION SCREENS (REGISTRATION / LOGIN) */}
      {currentScreen === 'auth' && (
        <Auth 
          initialIsRegister={isRegisterFlow}
          onAuthSuccess={handleAuthSuccess}
          onBackToHome={() => {}}
        />
      )}

      {/* 2. INVESTOR DESKTOP & MOBILE DASHBOARD AREA */}
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
