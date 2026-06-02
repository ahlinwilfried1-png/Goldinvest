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

    // 3. WestPay automatic deposit verification from redirect query params
    const params = new URLSearchParams(window.location.search);
    const wpStatus = params.get('status');
    const wpAmount = params.get('amount');
    const wpRef = params.get('ref');

    if (wpStatus === 'success' && wpAmount && wpRef) {
      const amt = parseInt(wpAmount);
      if (!isNaN(amt)) {
        if (active) {
          const res = DataStore.createWestPayDeposit(active.id, amt, wpRef);
          if (res) {
            const updatedActive = DataStore.getCurrentUser();
            if (updatedActive) {
              setUser(updatedActive);
            }
            sessionStorage.setItem('gi_wp_success_notif', JSON.stringify({ amount: amt, ref: wpRef }));
          }
        } else {
          // Store pending credit in localStorage to credit them immediately upon login/auth
          localStorage.setItem('gi_pending_westpay_credit', JSON.stringify({ amount: amt, ref: wpRef }));
        }

        // Clean query parameters to prevent duplicate submission on refresh
        const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }

    // 4. Catch referral tags in URL parameters (supports ?ref=, ?code=, ?r=, ?parrain=, ?sponsor=)
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
    // Check if there is any pending WestPay credit waiting
    const pendingStr = localStorage.getItem('gi_pending_westpay_credit');
    if (pendingStr) {
      try {
        const pending = JSON.parse(pendingStr);
        if (pending && pending.amount && pending.ref) {
          const res = DataStore.createWestPayDeposit(loggedInUser.id, pending.amount, pending.ref);
          if (res) {
            const updated = DataStore.getCurrentUser();
            if (updated) {
              loggedInUser = updated;
            }
            sessionStorage.setItem('gi_wp_success_notif', JSON.stringify({ amount: pending.amount, ref: pending.ref }));
          }
        }
      } catch (err) {
        console.error('Failed to parse pending WestPay deposit:', err);
      } finally {
        localStorage.removeItem('gi_pending_westpay_credit');
      }
    }
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
