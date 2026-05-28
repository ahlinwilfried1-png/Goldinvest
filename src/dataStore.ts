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
  { id: 'vip-1', vipLevel: 1, name: 'VIP Élixir 1', price: 3000, dailyReturn: 600, durationDays: 10, totalReturn: 6000, tag: 'Débutant' },
  { id: 'vip-2', vipLevel: 2, name: 'VIP Emeraude 2', price: 10000, dailyReturn: 2500, durationDays: 10, totalReturn: 25000, tag: 'Populaire' },
  { id: 'vip-3', vipLevel: 3, name: 'VIP Rubis 3', price: 25000, dailyReturn: 6500, durationDays: 10, totalReturn: 65000, tag: 'Recommandé' },
  { id: 'vip-4', vipLevel: 4, name: 'VIP Diamant 4', price: 50000, dailyReturn: 14000, durationDays: 10, totalReturn: 140000, tag: 'Rendement Sûr' },
  { id: 'vip-5', vipLevel: 5, name: 'VIP Platine 5', price: 100000, dailyReturn: 30000, durationDays: 10, totalReturn: 300000, tag: 'Haute Performance' },
  { id: 'vip-6', vipLevel: 6, name: 'VIP Prestige 6', price: 250000, dailyReturn: 80000, durationDays: 10, totalReturn: 800000, tag: 'Investisseur Elite' },
  { id: 'vip-7', vipLevel: 7, name: 'VIP Impérial 7', price: 500000, dailyReturn: 175000, durationDays: 10, totalReturn: 1750000, tag: 'Souverain Wealth' }
];

const INITIAL_USERS: User[] = [
  {
    id: 'u-admin',
    name: 'Administrateur Principal',
    whatsapp: '+2250102030405',
    country: 'Côte d’Ivoire',
    balance: 1250000,
    dailyEarnings: 0,
    totalEarnings: 0,
    bonus: 5000,
    referralCode: 'GOLD777',
    role: 'admin',
    isBlocked: false,
    createdAt: '2026-05-10T10:00:00Z'
  },
  {
    id: 'u-1',
    name: 'Aline Ouédraogo',
    whatsapp: '+22670717273',
    country: 'Burkina Faso',
    balance: 14200,
    dailyEarnings: 600,
    totalEarnings: 4200,
    bonus: 500,
    referralCode: 'ALINE226',
    referredBy: 'GOLD777',
    role: 'user',
    isBlocked: false,
    createdAt: '2026-05-18T14:30:00Z'
  },
  {
    id: 'u-2',
    name: 'Koffi Kouamé',
    whatsapp: '+2250708091011',
    country: 'Côte d’Ivoire',
    balance: 38000,
    dailyEarnings: 2500,
    totalEarnings: 15000,
    bonus: 1000,
    referralCode: 'KOFFI225',
    referredBy: 'ALINE226',
    role: 'user',
    isBlocked: false,
    createdAt: '2026-05-20T09:15:00Z'
  },
  {
    id: 'u-3',
    name: 'Moussa Diarra',
    whatsapp: '+22360616263',
    country: 'Mali',
    balance: 2400,
    dailyEarnings: 0,
    totalEarnings: 0,
    bonus: 500,
    referralCode: 'MOUSSA223',
    referredBy: 'KOFFI225',
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
  { code: 'GOLD777', amount: 1000, maxUses: 100, usedCount: 3, usedByUsers: ['u-1', 'u-2', 'u-3'] },
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
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
  }
};

// Database class that proxies lists inside localStorage
export class DataStore {
  static getUsers(): User[] {
    return getFromStore<User[]>('gi_users', INITIAL_USERS);
  }

  static saveUsers(users: User[]): void {
    setToStore<User[]>('gi_users', users);
  }

  static getProducts(): Product[] {
    return getFromStore<Product[]>('gi_products', DEFAULT_PRODUCTS);
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
    return getFromStore<User | null>('gi_current_user', null);
  }

  static saveCurrentUser(user: User | null): void {
    setToStore<User | null>('gi_current_user', user);
    
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
  static login(whatsapp: string, passwordString: string): { success: boolean, user?: User, message: string } {
    const users = this.getUsers();
    const user = users.find(u => u.whatsapp === whatsapp);
    if (!user) {
      return { success: false, message: 'Aucun utilisateur trouvé avec ce numéro WhatsApp.' };
    }
    if (user.isBlocked) {
      return { success: false, message: 'Ce compte a été bloqué par l\'administrateur. Veuillez contacter le support.' };
    }
    
    // In our live responsive system, we support a simple password comparison for demo code
    if (passwordString.trim() === '') {
      return { success: false, message: 'Mot de passe requis.' };
    }
    
    // Auto-approve password if matching or fallback
    if (passwordString === 'admin' && user.role === 'admin') {
      this.saveCurrentUser(user);
      return { success: true, user, message: 'Connexion administrateur réussie.' };
    }
    
    // Standard user simple validation
    if (passwordString === 'user123' || passwordString === 'admin' || passwordString.length >= 4) {
      this.saveCurrentUser(user);
      return { success: true, user, message: 'Connexion réussie.' };
    }

    return { success: false, message: 'Mot de passe incorrect.' };
  }

  // Register modern form
  static register(data: {
    name: string;
    whatsapp: string;
    country: string;
    referredByCode: string;
  }): { success: boolean, user?: User, message: string } {
    const users = this.getUsers();
    
    // Duplicate check
    const existing = users.find(u => u.whatsapp === data.whatsapp);
    if (existing) {
      return { success: false, message: 'Ce numéro WhatsApp est déjà enregistré sur notre plateforme.' };
    }

    // Generate custom referral code for this user
    const usernameClean = data.name.trim().split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const referralCode = `${usernameClean || 'GOLD'}${randomSuffix}`;

    // Verify if referred by exists
    let refereeId: string | undefined = undefined;
    if (data.referredByCode.trim().length > 0) {
      const referrerUser = users.find(u => u.referralCode.toUpperCase() === data.referredByCode.trim().toUpperCase());
      if (referrerUser) {
        refereeId = referrerUser.id;
      } else {
        return { success: false, message: 'Le code de parrainage saisi est invalide.' };
      }
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: data.name,
      whatsapp: data.whatsapp,
      country: data.country,
      balance: 1000, // 1,000 FCFA Welcome Signup Bonus as requested
      dailyEarnings: 0,
      totalEarnings: 0,
      bonus: 1000,
      referralCode,
      referredBy: refereeId,
      role: 'user',
      isBlocked: false,
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    this.saveUsers(updatedUsers);

    // Create system notification for signing up
    const systemNotifs = this.getNotifications();
    systemNotifs.unshift({
      id: `not-${Date.now()}`,
      userId: newUser.id,
      title: 'Bienvenue sur GoldInvest !',
      message: 'Félicitations pour votre inscription. Un bonus de bienvenue de 1 000 FCFA a été crédité sur votre compte.',
      type: 'bonus',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(systemNotifs);

    // If referred by someone, increment their "invités" count under MLM, write notification
    if (refereeId) {
      const parentNotifs = this.getNotifications();
      parentNotifs.unshift({
        id: `not-ref-${Date.now()}`,
        userId: refereeId,
        title: 'Nouveau parrainage',
        message: `${newUser.name} s'est inscrit en utilisant votre lien. Vous recevrez 10% de commission sur ses investissements !`,
        type: 'info',
        createdAt: new Date().toISOString(),
        read: false
      });
      this.saveNotifications(parentNotifs);
    }

    this.saveCurrentUser(newUser);
    return { success: true, user: newUser, message: 'Inscription réussie.' };
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

  // Withdrawal logic
  static createWithdrawal(userId: string, amount: number, operator: string, number: string): { success: boolean, error?: string, withdrawal?: Withdrawal } {
    const users = this.getUsers();
    const userIdx = users.findIndex(u => u.id === userId);
    
    if (userIdx === -1) {
      return { success: false, error: 'Utilisateur non trouvé.' };
    }

    const user = users[userIdx];
    if (user.balance < amount) {
      return { success: false, error: 'Solde insuffisant pour effectuer ce retrait.' };
    }

    // Deduct preliminary balance or keep it pending and deduct once approved? 
    // Usually, withdrawing locks the balance in investment systems
    user.balance -= amount;
    this.saveUsers(users);

    const withdrawals = this.getWithdrawals();
    const newWth: Withdrawal = {
      id: `wth-${Date.now()}`,
      userId,
      userName: user.name,
      amount,
      operator,
      number,
      status: 'pending',
      createdAt: new Date().toISOString()
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
  static buyProduct(userId: string, productId: string): { success: boolean, message: string } {
    const products = this.getProducts();
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) {
      return { success: false, message: 'Le produit d\'investissement sélectionné est introuvable.' };
    }

    const users = this.getUsers();
    const userIdx = users.findIndex(u => u.id === userId);
    if (userIdx === -1) {
      return { success: false, message: 'Utilisateur non trouvé.' };
    }

    const user = users[userIdx];
    if (user.balance < targetProduct.price) {
      return { success: false, message: `Solde insuffisant. Vous devez avoir au moins ${targetProduct.price.toLocaleString()} FCFA.` };
    }

    // Deduct price from balance
    user.balance -= targetProduct.price;
    user.dailyEarnings += targetProduct.dailyReturn;
    this.saveUsers(users);

    // Save current user sync
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.balance = user.balance;
      currentUser.dailyEarnings = user.dailyEarnings;
      this.saveCurrentUser(currentUser);
    }

    // Record new active investment
    const investments = this.getInvestments();
    const newInvestment: Investment = {
      id: `inv-${Date.now()}`,
      userId,
      productId: targetProduct.id,
      productName: targetProduct.name,
      price: targetProduct.price,
      dailyReturn: targetProduct.dailyReturn,
      daysPassed: 0,
      durationDays: targetProduct.durationDays,
      totalReturnClaimed: 0,
      lastClaimDate: new Date().toISOString(), // Newly bought
      status: 'active',
      createdAt: new Date().toISOString()
    };
    investments.unshift(newInvestment);
    this.saveInvestments(investments);

    // Process MLM Commission split!
    // Level 1: 10%
    // Level 2: 5%
    if (user.referredBy) {
      const parentUser = users.find(u => u.id === user.referredBy);
      if (parentUser) {
        const commAmtLvl1 = Math.round(targetProduct.price * 0.10); // 10%
        parentUser.balance += commAmtLvl1;
        parentUser.bonus += commAmtLvl1;
        
        const commissions = this.getCommissions();
        const newCommLvl1: Commission = {
          id: `com-${Date.now()}-1`,
          userId: parentUser.id,
          fromUserName: user.name,
          level: 1,
          amount: commAmtLvl1,
          createdAt: new Date().toISOString()
        };
        commissions.unshift(newCommLvl1);
        this.saveCommissions(commissions);

        // Notify parent
        const parentNotifs = this.getNotifications();
        parentNotifs.unshift({
          id: `not-com1-${Date.now()}`,
          userId: parentUser.id,
          title: 'Commission MLM reçue !',
          message: `Félicitations, vous avez perçu ${commAmtLvl1} FCFA (Niveau 1) car votre affilié ${user.name} a investi de l'argent dans le plan ${targetProduct.name}.`,
          type: 'bonus',
          createdAt: new Date().toISOString(),
          read: false
        });
        this.saveNotifications(parentNotifs);

        // Sync if parent user is current logged in
        if (currentUser && currentUser.id === parentUser.id) {
          currentUser.balance = parentUser.balance;
          currentUser.bonus = parentUser.bonus;
          this.saveCurrentUser(currentUser);
        }

        // Level 2 MLM: 5%
        if (parentUser.referredBy) {
          const grandParentUser = users.find(u => u.id === parentUser.referredBy);
          if (grandParentUser) {
            const commAmtLvl2 = Math.round(targetProduct.price * 0.05); // 5%
            grandParentUser.balance += commAmtLvl2;
            grandParentUser.bonus += commAmtLvl2;

            const newCommLvl2: Commission = {
              id: `com-${Date.now()}-2`,
              userId: grandParentUser.id,
              fromUserName: user.name,
              level: 2,
              amount: commAmtLvl2,
              createdAt: new Date().toISOString()
            };
            const currentComms = this.getCommissions();
            currentComms.unshift(newCommLvl2);
            this.saveCommissions(currentComms);

            // Notify grandparent
            const gpNotifs = this.getNotifications();
            gpNotifs.unshift({
              id: `not-com2-${Date.now()}`,
              userId: grandParentUser.id,
              title: 'Commission MLM Niveau 2 !',
              message: `Vous avez perçu ${commAmtLvl2} FCFA (Niveau 2) suite à l'investissement de ${user.name} (parrainé par ${parentUser.name}).`,
              type: 'bonus',
              createdAt: new Date().toISOString(),
              read: false
            });
            this.saveNotifications(gpNotifs);

            if (currentUser && currentUser.id === grandParentUser.id) {
              currentUser.balance = grandParentUser.balance;
              currentUser.bonus = grandParentUser.bonus;
              this.saveCurrentUser(currentUser);
            }
          }
        }
      }
    }

    // Create purchase notification for user
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `not-plan-${Date.now()}`,
      userId,
      title: 'Plan activé avec succès !',
      message: `Votre investissement de ${targetProduct.price.toLocaleString()} FCFA dans le plan ${targetProduct.name} a bien été pris en compte. Vous gagnerez ${targetProduct.dailyReturn.toLocaleString()} FCFA chaque jour pendant ${targetProduct.durationDays} jours.`,
      type: 'plan',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifications);

    return { success: true, message: `Vous avez investi avec succès dans le plan ${targetProduct.name} !` };
  }

  // Claim Daily Rewards Code
  static claimDailyReward(userId: string): { success: boolean, message: string, amount: number } {
    const checkKey = `gi_last_daily_${userId}`;
    const today = new Date().toDateString();
    const lastClaim = localStorage.getItem(checkKey);

    if (lastClaim === today) {
      return { success: false, message: 'Revenu journalier déjà réclamé pour aujourd\'hui. Revenez demain !', amount: 0 };
    }

    const rewardAmt = 150; // Standard daily loyalty reward
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
  static updateUserBalance(userId: string, data: { balance: number, bonus: number, role: 'user' | 'admin' }): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].balance = data.balance;
      users[idx].bonus = data.bonus;
      users[idx].role = data.role;
      this.saveUsers(users);

      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        current.balance = data.balance;
        current.bonus = data.bonus;
        current.role = data.role;
        this.saveCurrentUser(current);
      }
    }
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
}
