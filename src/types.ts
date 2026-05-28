export interface User {
  id: string;
  name: string;
  whatsapp: string;
  country: string;
  balance: number;
  dailyEarnings: number;
  totalEarnings: number;
  bonus: number;
  referralCode: string;
  referredBy?: string;
  isBlocked: boolean;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Deposit {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  operator: string;
  reference: string;
  receiptImage: string; // Base64 or standard asset url
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  operator: string;
  number: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Product {
  id: string;
  vipLevel: number;
  name: string;
  price: number;
  dailyReturn: number;
  durationDays: number;
  totalReturn: number;
  tag?: string;
}

export interface Investment {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  price: number;
  dailyReturn: number;
  daysPassed: number;
  durationDays: number;
  totalReturnClaimed: number;
  lastClaimDate: string; // ISO string or short date
  status: 'active' | 'completed';
  createdAt: string;
}

export interface Commission {
  id: string;
  userId: string;
  fromUserName: string;
  level: 1 | 2;
  amount: number;
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  userId?: string; // If undefined, it is global
  title: string;
  message: string;
  type: 'deposit' | 'withdraw' | 'bonus' | 'plan' | 'info';
  createdAt: string;
  read: boolean;
}

export interface SupportMessage {
  id: string;
  userId: string;
  sender: 'user' | 'admin';
  message: string;
  createdAt: string;
}

export interface BonusCode {
  code: string;
  amount: number;
  maxUses: number;
  usedCount: number;
  usedByUsers: string[]; // User IDs
}

export interface ChatSession {
  userId: string;
  userName: string;
  messages: SupportMessage[];
  lastUpdated: string;
}
