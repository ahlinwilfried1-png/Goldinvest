import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Check, 
  X, 
  Edit, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Award, 
  Eye, 
  FileText, 
  CreditCard, 
  Megaphone, 
  Gift, 
  Sparkles,
  ArrowRight,
  ChevronRight,
  Search
} from 'lucide-react';
import { User, Deposit, Withdrawal, Product, BonusCode, SystemNotification } from '../types';
import { DataStore, DEFAULT_PRODUCTS } from '../dataStore';

interface AdminPanelProps {
  currentUser: User;
  onRefreshData: () => void;
  onCloseAdmin: () => void;
}

export default function AdminPanel({ 
  currentUser, 
  onRefreshData, 
  onCloseAdmin 
}: AdminPanelProps) {
  // Lists from local storage
  const [users, setUsers] = useState<User[]>(() => DataStore.getUsers());
  const [deposits, setDeposits] = useState<Deposit[]>(() => DataStore.getDeposits());
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(() => DataStore.getWithdrawals());
  const [products, setProducts] = useState<Product[]>(() => DataStore.getProducts());
  const [bonusCodes, setBonusCodes] = useState<BonusCode[]>(() => DataStore.getBonusCodes());

  // Navigation tab
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'deposits' | 'withdrawals' | 'products' | 'platform' | 'affiliations'>('deposits');
  const [commissions, setCommissions] = useState<any[]>(() => DataStore.getCommissions());
  const [affiliateSearchQuery, setAffiliateSearchQuery] = useState('');

  // Search filter query for users tab
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Edit user modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editBalance, setEditBalance] = useState<number>(0);
  const [editBonus, setEditBonus] = useState<number>(0);
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user');
  const [editPassword, setEditPassword] = useState<string>('');
  const [editReferredBy, setEditReferredBy] = useState<string>('');

  // Edit product modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProductVipLevel, setEditProductVipLevel] = useState<number>(1);
  const [editProductName, setEditProductName] = useState<string>('');
  const [editProductPrice, setEditProductPrice] = useState<number>(5000);
  const [editProductDailyReturn, setEditProductDailyReturn] = useState<number>(1000);
  const [editProductDuration, setEditProductDuration] = useState<number>(10);
  const [editProductTag, setEditProductTag] = useState<string>('');

  // New product form state
  const [newVipLevel, setNewVipLevel] = useState(1);
  const [newVipName, setNewVipName] = useState('');
  const [newVipPrice, setNewVipPrice] = useState(5000);
  const [newVipDaily, setNewVipDaily] = useState(1000);
  const [newVipDuration, setNewVipDuration] = useState(10);
  const [newVipTag, setNewVipTag] = useState('');

  // Global notify state
  const [globalNotifTitle, setGlobalNotifTitle] = useState('');
  const [globalNotifMessage, setGlobalNotifMessage] = useState('');

  // New promo code state
  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeAmount, setNewCodeAmount] = useState(500);
  const [newCodeMax, setNewCodeMax] = useState(100);

  // Picture receipt lightbox state
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Product blocking states
  const [schedulingBlockProductId, setSchedulingBlockProductId] = useState<string | null>(null);
  const [blockReopenTime, setBlockReopenTime] = useState<string>('');

  const handleToggleBlockProduct = (id: string, currentlyBlocked: boolean) => {
    if (currentlyBlocked) {
      DataStore.toggleBlockProduct(id, false);
      syncLocalStates();
    } else {
      setSchedulingBlockProductId(id);
      const date = new Date();
      date.setHours(date.getHours() + 1);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
      setBlockReopenTime(localISOTime);
    }
  };

  const handleConfirmProductBlock = (id: string, useSchedule: boolean) => {
    const reopenISO = useSchedule && blockReopenTime ? new Date(blockReopenTime).toISOString() : undefined;
    DataStore.toggleBlockProduct(id, true, reopenISO);
    setSchedulingBlockProductId(null);
    syncLocalStates();
  };

  // Refresh lists
  const syncLocalStates = () => {
    setUsers(DataStore.getUsers());
    setDeposits(DataStore.getDeposits());
    setWithdrawals(DataStore.getWithdrawals());
    setProducts(DataStore.getProducts());
    setBonusCodes(DataStore.getBonusCodes());
    setCommissions(DataStore.getCommissions());
    onRefreshData();
  };

  // User events
  const handleBlockToggle = (userId: string, currentBlocked: boolean) => {
    DataStore.setBlockUser(userId, !currentBlocked);
    syncLocalStates();
  };

  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    setEditBalance(user.balance);
    setEditBonus(user.bonus);
    setEditRole(user.role);
    setEditPassword(user.password || (user.role === 'admin' ? 'admin' : 'user123'));
    setEditReferredBy(user.referredBy || '');
  };

  const handleSaveUser = () => {
    if (editingUser) {
      DataStore.updateUserBalance(editingUser.id, {
        balance: editBalance,
        bonus: editBonus,
        role: editRole,
        password: editPassword,
        referredBy: editReferredBy === '' ? null : editReferredBy
      });
      setEditingUser(null);
      syncLocalStates();
    }
  };

  const handleDeleteSponsor = (filleulId: string) => {
    const filleul = users.find(u => u.id === filleulId);
    if (filleul) {
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer le parrain de ${filleul.name} ?`)) {
        DataStore.updateUserBalance(filleul.id, {
          balance: filleul.balance,
          bonus: filleul.bonus,
          role: filleul.role,
          password: filleul.password,
          referredBy: null
        });
        syncLocalStates();
      }
    }
  };

  // Finance events
  const handleApproveDeposit = (id: string) => {
    DataStore.approveDeposit(id);
    syncLocalStates();
  };

  const handleRejectDeposit = (id: string) => {
    DataStore.rejectDeposit(id);
    syncLocalStates();
  };

  const handleApproveWithdrawal = (id: string) => {
    DataStore.approveWithdrawal(id);
    syncLocalStates();
  };

  const handleRejectWithdrawal = (id: string) => {
    DataStore.rejectWithdrawal(id);
    syncLocalStates();
  };

  // Product actions
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVipName) return;

    DataStore.addNewProduct({
      vipLevel: newVipLevel,
      name: newVipName,
      price: newVipPrice,
      dailyReturn: newVipDaily,
      durationDays: newVipDuration,
      tag: newVipTag || undefined
    });

    setNewVipName('');
    setNewVipTag('');
    syncLocalStates();
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer définitivement ce package d\'investissement VIP ?')) {
      DataStore.deleteProduct(id);
      syncLocalStates();
    }
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setEditProductVipLevel(product.vipLevel);
    setEditProductName(product.name);
    setEditProductPrice(product.price);
    setEditProductDailyReturn(product.dailyReturn);
    setEditProductDuration(product.durationDays);
    setEditProductTag(product.tag || '');
  };

  const handleSaveProduct = () => {
    if (editingProduct) {
      DataStore.updateProduct(editingProduct.id, {
        vipLevel: editProductVipLevel,
        name: editProductName,
        price: editProductPrice,
        dailyReturn: editProductDailyReturn,
        durationDays: editProductDuration,
        tag: editProductTag || undefined
      });
      setEditingProduct(null);
      syncLocalStates();
    }
  };

  const handleCreateBonusCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeName) return;

    DataStore.createBonusCode(newCodeName, newCodeAmount, newCodeMax);
    setNewCodeName('');
    syncLocalStates();
    alert(`Code bonus ${newCodeName.toUpperCase()} créé avec succès !`);
  };

  const handleSendGlobalAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalNotifTitle || !globalNotifMessage) return;

    DataStore.sendGlobalNotification(globalNotifTitle, globalNotifMessage);
    setGlobalNotifTitle('');
    setGlobalNotifMessage('');
    syncLocalStates();
    alert('Notification globale diffusée avec succès à tous les investisseurs !');
  };

  // Helper summaries
  const pendingDepositsCount = deposits.filter(d => d.status === 'pending').length;
  const pendingWithdrawCount = withdrawals.filter(w => w.status === 'pending').length;
  const totalVolumeApproved = deposits.filter(d => d.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPayoutApproved = withdrawals.filter(w => w.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="w-full relative pb-16">
      {/* Lightbox for visual invoice receipt proof */}
      {lightboxImg && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
          <button 
            onClick={() => setLightboxImg(null)}
            className="absolute top-6 right-6 bg-yellow-500 text-slate-950 p-2 rounded-full font-bold hover:scale-110 transition-transform"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-xl w-full bg-slate-900 border border-yellow-500/20 rounded-2xl p-3 overflow-hidden">
            <h4 className="text-xs text-yellow-500 uppercase tracking-widest text-center font-mono py-2">Preuve de Transfert Mobile Money</h4>
            <img 
              src={lightboxImg} 
              alt="Receipt screenshot proof" 
              className="w-full h-auto max-h-[75vh] object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
            <p className="text-[10px] text-slate-400 font-mono text-center mt-2.5 uppercase tracking-wide">Capture d'écran soumise par l'affilié</p>
          </div>
        </div>
      )}

      {/* Editing user modal overlay */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-yellow-500/30 rounded-3xl p-6 md:p-8 relative">
            <button 
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display font-bold text-lg text-white mb-6">Modifier l'Investisseur</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 block uppercase font-semibold">Nom de l'utilisateur</span>
                <span className="text-sm font-semibold text-white mt-1 block">{editingUser.name} ({editingUser.whatsapp})</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Solde Principal (FCFA)</label>
                <input
                  type="number"
                  value={editBalance}
                  onChange={(e) => setEditBalance(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl py-3 px-4 text-sm text-yellow-300 font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Gains Bonus (FCFA)</label>
                <input
                  type="number"
                  value={editBonus}
                  onChange={(e) => setEditBonus(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl py-3 px-4 text-sm text-yellow-300 font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Rôle du Compte</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none"
                >
                  <option value="user">Utilisateur Client</option>
                  <option value="admin">Administrateur Système</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Parrain / Sponsor Direct</label>
                <select
                  value={editReferredBy}
                  onChange={(e) => setEditReferredBy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl py-3 px-4 text-xs md:text-sm text-white focus:outline-none focus:border-yellow-500/40"
                >
                  <option value="">Aucun Sponsor (Inscrit en Direct)</option>
                  {users.filter(u => u.id !== editingUser.id).map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.whatsapp}) - Code: {u.referralCode}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">Vous pouvez associer l'investisseur à un parrain ou choisir "Aucun" pour supprimer son affiliation.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Mot de passe d'accès</label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Modifier le mot de passe"
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl py-3 px-4 text-sm text-white font-mono focus:outline-none focus:border-yellow-500/40"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 text-xs font-bold border border-slate-800 rounded-xl text-slate-400 hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveUser}
                  className="flex-1 py-3 text-xs font-bold rounded-xl gold-bg-gradient text-slate-950 shadow-md shadow-yellow-500/10"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editing product modal overlay */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-yellow-500/30 rounded-3xl p-6 md:p-8 relative">
            <button 
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display font-bold text-lg text-white mb-6">⚙️ Modifier le Produit VIP</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Niveau VIP (Indice)</label>
                <input
                  type="number"
                  value={editProductVipLevel}
                  onChange={(e) => setEditProductVipLevel(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl py-3 px-4 text-sm text-white font-mono focus:outline-none focus:border-yellow-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nom du Plan</label>
                <input
                  type="text"
                  value={editProductName}
                  onChange={(e) => setEditProductName(e.target.value)}
                  placeholder="Ex: VIP Platine 5"
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-yellow-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Prix d'acquisition (FCFA)</label>
                <input
                  type="number"
                  value={editProductPrice}
                  onChange={(e) => setEditProductPrice(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl py-3 px-4 text-sm text-yellow-300 font-mono focus:outline-none focus:border-yellow-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Rendement Journalier (FCFA)</label>
                <input
                  type="number"
                  value={editProductDailyReturn}
                  onChange={(e) => setEditProductDailyReturn(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl py-3 px-4 text-sm text-green-400 font-mono focus:outline-none focus:border-yellow-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Durée de l'effet (Jours)</label>
                <input
                  type="number"
                  value={editProductDuration}
                  onChange={(e) => setEditProductDuration(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl py-3 px-4 text-sm text-white font-mono focus:outline-none focus:border-yellow-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Slogan / Tag visuel</label>
                <input
                  type="text"
                  value={editProductTag}
                  onChange={(e) => setEditProductTag(e.target.value)}
                  placeholder="Ex: Populaire, Offre Spéciale"
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-yellow-500/40"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-3 text-xs font-bold border border-slate-800 rounded-xl text-slate-400 hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveProduct}
                  className="flex-1 py-3 text-xs font-bold rounded-xl gold-bg-gradient text-slate-950 shadow-md shadow-yellow-500/10"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-6 px-4 md:px-6 bg-slate-900/60 border border-yellow-500/10 rounded-2xl mb-8 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs text-yellow-400 font-bold uppercase tracking-widest mb-1 font-mono">
            <Lock className="w-3 h-3" />
            <span>ESPACE SÉCURISÉ ADMIN</span>
          </div>
          <h2 className="text-xl font-display font-medium text-white">Console d'Administration Globale</h2>
        </div>
        <button
          onClick={onCloseAdmin}
          className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 border border-yellow-500/20 text-yellow-500 hover:text-yellow-400 text-xs font-bold rounded-xl transition-all"
        >
          Retourner au Tableau de Bord
        </button>
      </div>

      {/* STRATEGIC ADMIN STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl relative">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Inscriptions Totales</span>
          <div className="text-xl font-bold text-white mt-1">{users.length} Investisseurs</div>
          <div className="text-[9px] text-green-400 font-mono mt-1">● Base de données consolidée</div>
        </div>
        
        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl relative">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Volume des Dépôts validés</span>
          <div className="text-xl font-bold text-green-400 mt-1">{totalVolumeApproved.toLocaleString()} FCFA</div>
          <span className="text-[9px] text-slate-400 font-mono">Rechargement effectif</span>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl relative">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Retraits Traités (Factures)</span>
          <div className="text-xl font-bold text-yellow-400 mt-1">{totalPayoutApproved.toLocaleString()} FCFA</div>
          <span className="text-[9px] text-slate-400 font-mono">Cashout finalisé</span>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl relative">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Encaissement Plateforme</span>
          <div className="text-xl font-bold text-white mt-1">{(totalVolumeApproved - totalPayoutApproved).toLocaleString()} FCFA</div>
          <div className="text-[9px] text-green-400 font-mono mt-1">Solde liquide net</div>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-slate-800 overflow-x-auto gap-4 mb-6">
        <button
          onClick={() => setActiveAdminTab('deposits')}
          className={`py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 whitespace-nowrap transition-colors flex items-center space-x-2 ${activeAdminTab === 'deposits' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <span>Dépôts</span>
          {pendingDepositsCount > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full animate-pulse">{pendingDepositsCount}</span>
          )}
        </button>
        <button
          onClick={() => setActiveAdminTab('withdrawals')}
          className={`py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 whitespace-nowrap transition-colors flex items-center space-x-2 ${activeAdminTab === 'withdrawals' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <span>Retraits</span>
          {pendingWithdrawCount > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full animate-pulse">{pendingWithdrawCount}</span>
          )}
        </button>
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 whitespace-nowrap transition-colors ${activeAdminTab === 'users' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <span>Clients MLM ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('affiliations')}
          className={`py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 whitespace-nowrap transition-colors ${activeAdminTab === 'affiliations' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <span>📈 Filiations ({users.filter(u => u.referredBy).length})</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('products')}
          className={`py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 whitespace-nowrap transition-colors ${activeAdminTab === 'products' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <span>Produits d'Investissement</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('platform')}
          className={`py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 whitespace-nowrap transition-colors ${activeAdminTab === 'platform' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <span>Option Système & Codes</span>
        </button>
      </div>

      {/* TAB CONTENTS */}

      {/* 1. DEPOSITS QUEUE */}
      {activeAdminTab === 'deposits' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Demandes de Dépôts reçues</h3>
            <span className="text-[11px] text-slate-400">Total : {deposits.length} entrées</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/30">
                  <th className="p-3">Utilisateur</th>
                  <th className="p-3">Montant</th>
                  <th className="p-3">Opérateur & Référence</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-center">Reçu</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">Aucun dépôt enregistré.</td>
                  </tr>
                ) : (
                  deposits.map((dep) => (
                    <tr key={dep.id} className="hover:bg-slate-900/30">
                      <td className="p-3 font-semibold text-white">{dep.userName}</td>
                      <td className="p-3 text-yellow-400 font-bold font-mono">+{dep.amount.toLocaleString()} FCFA</td>
                      <td className="p-3">
                        <span className="block text-slate-300">{dep.operator}</span>
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{dep.reference}</span>
                      </td>
                      <td className="p-3 text-slate-400 text-[10px]">{new Date(dep.createdAt).toLocaleString()}</td>
                      <td className="p-3 text-center">
                        {dep.receiptImage ? (
                          <button
                            onClick={() => setLightboxImg(dep.receiptImage)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-yellow-500/20 text-yellow-500 text-[10px] font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Voir</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Aucun</span>
                        )}
                      </td>
                      <td className="p-3">
                        {dep.status === 'approved' && (
                          <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded text-[9px] font-bold font-mono">APPROUVÉ</span>
                        )}
                        {dep.status === 'rejected' && (
                          <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-[9px] font-bold font-mono">REJETÉ</span>
                        )}
                        {dep.status === 'pending' && (
                          <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded text-[9px] font-bold font-mono animate-pulse">EN ATTENTE</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {dep.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleApproveDeposit(dep.id)}
                              className="w-7 h-7 bg-green-500 text-slate-950 flex items-center justify-center rounded-lg hover:scale-115 transition-transform"
                              title="Valider le dépôt"
                            >
                              <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                            </button>
                            <button
                              onClick={() => handleRejectDeposit(dep.id)}
                              className="w-7 h-7 bg-red-500 text-white flex items-center justify-center rounded-lg hover:scale-115 transition-transform"
                              title="Refuser le dépôt"
                            >
                              <X className="w-4 h-4 stroke-[3]" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-mono">Vérifié</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. WITHDRAWALS QUEUE */}
      {activeAdminTab === 'withdrawals' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Demandes de retraits passées</h3>
            <span className="text-[11px] text-slate-400">Total : {withdrawals.length} demandes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/30">
                  <th className="p-3">Destinataire</th>
                  <th className="p-3">Numéro Sollicité</th>
                  <th className="p-3 font-mono text-yellow-400">Montant</th>
                  <th className="p-3">Opérateur</th>
                  <th className="p-3">Date de Réception</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">Aucun retrait en attente.</td>
                  </tr>
                ) : (
                  withdrawals.map((wth) => (
                    <tr key={wth.id} className="hover:bg-slate-900/30">
                      <td className="p-3 font-semibold text-white">{wth.userName}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">{wth.number}</td>
                      <td className="p-3 text-yellow-400 font-bold font-mono">-{wth.amount.toLocaleString()} FCFA</td>
                      <td className="p-3">{wth.operator}</td>
                      <td className="p-3 text-[10px] text-slate-400">{new Date(wth.createdAt).toLocaleString()}</td>
                      <td className="p-3">
                        {wth.status === 'approved' && (
                          <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded text-[9px] font-bold font-mono">EXPÉDIÉ (2H)</span>
                        )}
                        {wth.status === 'rejected' && (
                          <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded text-[9px] font-bold font-mono">REJETÉ</span>
                        )}
                        {wth.status === 'pending' && (
                          <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded text-[9px] font-bold font-mono animate-pulse">ATTENTE</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {wth.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleApproveWithdrawal(wth.id)}
                              className="w-7 h-7 bg-green-500 text-slate-950 flex items-center justify-center rounded-lg hover:scale-115 transition-transform"
                              title="Valider le retrait"
                            >
                              <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                            </button>
                            <button
                              onClick={() => handleRejectWithdrawal(wth.id)}
                              className="w-7 h-7 bg-red-500 text-white flex items-center justify-center rounded-lg hover:scale-115 transition-transform"
                              title="Rejeter et recréditer"
                            >
                              <X className="w-4 h-4 stroke-[3]" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-mono">Résolu</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. USERS CONFIGURATION TABLE */}
      {activeAdminTab === 'users' && (() => {
        const filteredUsers = users.filter((u) => {
          const query = userSearchQuery.trim().toLowerCase();
          if (!query) return true;
          return (
            (u.name || '').toLowerCase().includes(query) ||
            (u.whatsapp || '').toLowerCase().includes(query) ||
            (u.country || '').toLowerCase().includes(query)
          );
        });

        return (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 overflow-hidden">
            {/* INSTRUCTION BANNER FOR DESIGNATING ADMINS / REMOVING SPONSORS */}
            <div className="bg-[#0b132a]/80 border border-yellow-500/10 rounded-xl p-3.5 mb-5 space-y-1 text-xs">
              <span className="font-bold text-yellow-400 block">💡 Administration des Rôles & Affiliations :</span>
              <p className="text-slate-400 leading-relaxed">
                Pour <strong>nommer d'autres comptes administrateurs</strong>, recherchez l'utilisateur concerné et cliquez sur le bouton de modification <span className="text-slate-200">⚙️</span>, puis changez son rôle en <em>"Administrateur Système"</em>. De la même façon, vous pouvez directement modifier ou <strong>supprimer son parrain / sponsor direct</strong>.
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider font-semibold">Portefeuille des Affiliés</h3>
                <span className="text-[10px] text-slate-400">Total : {users.length} comptes enregistrés</span>
              </div>

              {/* Search user input */}
              <div className="relative w-full md:w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur (nom, WhatsApp...)"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 text-xs rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/30">
                    <th className="p-3">Nom Complet</th>
                    <th className="p-3 font-mono">WhatsApp</th>
                    <th className="p-3">Parrain (Sponsor)</th>
                    <th className="p-3 text-center">Filleuls Directs</th>
                    <th className="p-3">Solde (FCFA)</th>
                    <th className="p-3 text-center">Rôle</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 font-mono">
                        Aucun utilisateur trouvé correspondant à votre recherche
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const sponsor = users.find(u => u.id === user.referredBy);
                      const directRefs = users.filter(u => u.referredBy === user.id);

                      return (
                        <tr key={user.id} className={`hover:bg-slate-900/20 ${user.isBlocked ? 'bg-red-500/5' : ''}`}>
                          <td className="p-3">
                            <span className="font-semibold text-white block">{user.name}</span>
                            <span className="text-[10px] text-slate-400 block">{user.country}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-300">
                            <a 
                              href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-slate-300 hover:text-green-400 flex items-center gap-1 transition-colors"
                            >
                              <span>📱</span>
                              <span>{user.whatsapp}</span>
                            </a>
                          </td>
                          <td className="p-3">
                            {sponsor ? (
                              <div className="space-y-0.5">
                                <span className="font-medium text-slate-200 block text-[11px]">{sponsor.name}</span>
                                <span className="text-[9px] text-yellow-500 font-mono block">Code: {sponsor.referralCode}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">Aucun (Direct)</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {directRefs.length > 0 ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-bold rounded-full">
                                  {directRefs.length} filleul(s)
                                </span>
                                <span className="text-[8px] text-slate-500 block mt-0.5 max-w-[120px] truncate">
                                  ({directRefs.map(r => r.name.split(' ')[0]).join(', ')})
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-600 text-[10px] italic">0 filleul</span>
                            )}
                          </td>
                          <td className="p-3 font-bold font-mono text-yellow-400">{user.balance.toLocaleString()} F</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 text-[10px] font-semibold font-mono rounded-full ${user.role === 'admin' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' : 'bg-slate-800 text-slate-400'}`}>
                              {user.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openEditUserModal(user)}
                                className="w-7 h-7 bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-center rounded duration-150"
                                title="Modifier les montants/droits"
                              >
                                <Edit className="w-3.5 h-3.5 text-slate-300" />
                              </button>
                              <button
                                onClick={() => handleBlockToggle(user.id, user.isBlocked)}
                                className={`w-7 h-7 flex items-center justify-center rounded duration-150 ${user.isBlocked ? 'bg-red-500 text-slate-950' : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-red-400'}`}
                                title={user.isBlocked ? "Débloquer le compte" : "Bloquer l'investisseur"}
                              >
                                {user.isBlocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* LIVE SPONSORSHIP RELATIONS & NETWORKS */}
            <div className="mt-8 border-t border-slate-800/80 pt-6">
              <div className="mb-4">
                <h4 className="font-display font-bold text-xs text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span>📈</span>
                  <span>Suivi en Temps Réel des Liens de Parrainage (MLM)</span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-1">
                  Ci-dessous s'affiche la liste de tous les filleuls qui se sont inscrits en utilisant un lien de parrainage de nos membres.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.filter(u => u.referredBy).length === 0 ? (
                  <div className="col-span-2 p-6 rounded-2xl bg-slate-950/20 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                    Aucun filleul actif ne s'est inscrit via un lien pour le moment.
                  </div>
                ) : (
                  users.filter(u => u.referredBy).map((filleul) => {
                    const parrain = users.find(u => u.id === filleul.referredBy);
                    return (
                      <div 
                        key={filleul.id} 
                        className="p-3 rounded-xl bg-slate-950/60 border border-yellow-500/5 hover:border-yellow-500/20 flex items-center justify-between gap-4 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white block">{filleul.name}</span>
                            <span className="text-[8px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-1 py-0.2 rounded font-mono uppercase">Filleul</span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            WhatsApp: <span className="font-mono text-slate-200">{filleul.whatsapp}</span> | Pays: <span className="text-slate-300">{filleul.country}</span>
                          </p>
                          <span className="text-[9px] text-slate-500 block">
                            Inscrit le : {new Date(filleul.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="text-right border-l border-slate-800 pl-4 space-y-1.5 flex flex-col items-end justify-center">
                          <div>
                            <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">Parrain / Sponsor</span>
                            <span className="text-xs font-bold text-yellow-500 block">
                              {parrain ? parrain.name : "Code inconnu"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              WA: {parrain ? parrain.whatsapp : "N/A"}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteSponsor(filleul.id)}
                            className="text-[9px] font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/30 rounded px-2 py-0.5 duration-100 flex items-center gap-1 cursor-pointer"
                            title="Supprimer ce lien d'affiliation"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 4. PRODUCTS MANAGEMENT */}
      {activeAdminTab === 'products' && (
        <div className="space-y-6">
          {/* New VIP creator Form */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-yellow-500" />
              <span>Créer une nouvelle Offre VIP</span>
            </h3>

            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Niveau VIP (Indice)</label>
                <input
                  type="number"
                  required
                  value={newVipLevel}
                  onChange={(e) => setNewVipLevel(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nom du Plan d'investissement</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: VIP Gold Rubis 5"
                  value={newVipName}
                  onChange={(e) => setNewVipName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Prix d'acquisition (FCFA)</label>
                <input
                  type="number"
                  required
                  value={newVipPrice}
                  onChange={(e) => setNewVipPrice(parseInt(e.target.value) || 3000)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-4 text-sm text-yellow-400 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Rendement Journalier (FCFA)</label>
                <input
                  type="number"
                  required
                  value={newVipDaily}
                  onChange={(e) => setNewVipDaily(parseInt(e.target.value) || 600)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-4 text-sm text-green-400 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Durée de l'effet (Jours)</label>
                <input
                  type="number"
                  required
                  value={newVipDuration}
                  onChange={(e) => setNewVipDuration(parseInt(e.target.value) || 10)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Slogan / Tag visuel</label>
                <input
                  type="text"
                  placeholder="Ex: Populaire, Offre Spéciale"
                  value={newVipTag}
                  onChange={(e) => setNewVipTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="md:col-span-3 pt-3">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl gold-bg-gradient text-slate-950 font-display font-bold text-xs uppercase tracking-wider hover:opacity-90 flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enregistrer et Publier le Produit</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of custom VIP packages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => {
              const isCurrentlyBlocked = p.isBlocked === true;
              const formattedReopenTime = p.reopenDateTime 
                ? new Date(p.reopenDateTime).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                : null;

              return (
                <div key={p.id} className={`p-5 rounded-xl border flex flex-col justify-between ${isCurrentlyBlocked ? 'bg-red-950/20 border-red-900/40' : 'bg-slate-950 border-slate-800'}`}>
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] text-yellow-500 font-mono uppercase font-bold">Niveau {p.vipLevel}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${isCurrentlyBlocked ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></span>
                        </div>
                        <h4 className="font-display font-medium text-white text-sm block mt-0.5">{p.name}</h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditProductModal(p)}
                          className="text-slate-350 hover:text-yellow-400 p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded duration-150"
                          title="Modifier le VIP"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="text-red-400 hover:text-red-500 p-1.5 bg-red-500/10 rounded duration-150"
                          title="Supprimer le VIP"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 mt-4 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Prix :</span>
                        <span className="text-white font-bold">{p.price.toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Dividendes :</span>
                        <span className="text-green-400">+{p.dailyReturn.toLocaleString()} F / Jour</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Cycle :</span>
                        <span className="text-yellow-400">{p.durationDays} Jours</span>
                      </div>
                      <div className="flex justify-between text-slate-400 font-bold border-t border-slate-900 pt-1.5 mt-1.5 font-mono">
                        <span>Retour brut :</span>
                        <span className="text-white">{(p.dailyReturn * p.durationDays).toLocaleString()} FCFA</span>
                      </div>
                      
                      {isCurrentlyBlocked && (
                        <div className="bg-red-950/35 border border-red-900/30 rounded-lg p-2.5 mt-3 font-sans">
                          <p className="text-[10px] text-red-400 font-bold flex items-center gap-1.5">
                            <Lock className="w-3 h-3" />
                            <span>INVESTISSEMENT BLOQUÉ</span>
                          </p>
                          {formattedReopenTime && (
                            <p className="text-[9px] text-slate-300 mt-0.5 font-mono">
                              Réouverture le : {formattedReopenTime}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Block / Unblock Action triggers */}
                  <div className="mt-5 pt-3 border-t border-slate-900">
                    {schedulingBlockProductId === p.id ? (
                      <div className="space-y-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">HEURE DE RÉOUVERTURE (OPTIONNELLE)</label>
                          <input
                            type="datetime-local"
                            value={blockReopenTime}
                            onChange={(e) => setBlockReopenTime(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-xs text-yellow-400 p-1.5 rounded focus:outline-none focus:border-yellow-500/40"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConfirmProductBlock(p.id, false)}
                            className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold uppercase transition-all"
                          >
                            Bloquer à vie
                          </button>
                          <button
                            onClick={() => handleConfirmProductBlock(p.id, true)}
                            className="flex-1 py-1.5 gold-bg-gradient text-slate-950 rounded text-[10px] font-bold uppercase transition-all"
                            disabled={!blockReopenTime}
                          >
                            Planifier Heure
                          </button>
                        </div>
                        <button
                          onClick={() => setSchedulingBlockProductId(null)}
                          className="w-full py-1 text-slate-500 hover:text-slate-400 text-[10px] uppercase font-bold text-center"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleToggleBlockProduct(p.id, isCurrentlyBlocked)}
                        className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${isCurrentlyBlocked ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'}`}
                      >
                        {isCurrentlyBlocked ? (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Débloquer immédiatement</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Bloquer / Planifier Heure</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. PLATFORM UTILITIES (PROMO CODES & GLOBAL NOTIFICATIONS TOOL) */}
      {activeAdminTab === 'platform' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Global Broadcast */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Megaphone className="w-4 h-4 text-yellow-500" />
              <span>Diffuser une Notification Globale</span>
            </h3>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Ce formulaire enverra une alerte financière instantanée visible en temps réel sur le fil de notifications de tous les membres enregistrés sur GoldInvest.
            </p>

            <form onSubmit={handleSendGlobalAlert} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Titre de l'Alerte</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 🎁 Maintenance des serveurs de paiement ou Bonus du Week-end !"
                  value={globalNotifTitle}
                  onChange={(e) => setGlobalNotifTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Description détaillée</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Saisissez le contenu du message public officiel ici..."
                  value={globalNotifMessage}
                  onChange={(e) => setGlobalNotifMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none placeholder-slate-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider transition-all"
              >
                Envoyer le message d'alerte global
              </button>
            </form>
          </div>

          {/* Promo code creator */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Gift className="w-4 h-4 text-yellow-500" />
              <span>Générer un Code Bonus Cadeau</span>
            </h3>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Créez des invitations promotionnelles gratuites. Les investisseurs peuvent saisir ce code sous leur panel "Bonus" pour approvisionner leur solde principal.
            </p>

            <form onSubmit={handleCreateBonusCode} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Code Promotionnel</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: WEEKEND100"
                    value={newCodeName}
                    onChange={(e) => setNewCodeName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-4 text-sm text-yellow-400 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Valeur Créditée (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={newCodeAmount}
                    onChange={(e) => setNewCodeAmount(parseInt(e.target.value) || 500)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-4 text-sm text-green-400 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nombre total d'utilisations</label>
                <input
                  type="number"
                  required
                  value={newCodeMax}
                  onChange={(e) => setNewCodeMax(parseInt(e.target.value) || 100)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white border border-yellow-500/30 text-xs font-display font-bold uppercase tracking-wider transition-all"
              >
                Générer et publier le Code promotionnel
              </button>
            </form>

            {/* List of active codes */}
            <div className="mt-6">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-3">Codes actifs répertoriés</span>
              <div className="space-y-2">
                {bonusCodes.map((bc, i) => (
                  <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono font-bold text-yellow-400 text-sm">{bc.code}</span>
                      <span className="text-slate-500 text-[10px] block mt-0.5">Crédit immédiat : <strong className="text-white">{bc.amount.toLocaleString()} FCFA</strong></span>
                    </div>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {bc.usedCount} / {bc.maxUses} Utilisés
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. AFFILIATIONS & PARRAINAGES */}
      {activeAdminTab === 'affiliations' && (() => {
        const filteredFilleuls = users.filter((u) => {
          if (!u.referredBy) return false;
          const query = affiliateSearchQuery.trim().toLowerCase();
          if (!query) return true;
          
          const parrain = users.find(s => s.id === u.referredBy);
          return (
            (u.name || '').toLowerCase().includes(query) ||
            (u.whatsapp || '').toLowerCase().includes(query) ||
            (u.country || '').toLowerCase().includes(query) ||
            (parrain?.name || '').toLowerCase().includes(query) ||
            (parrain?.referralCode || '').toLowerCase().includes(query)
          );
        });

        const totalCommissionsAmount = commissions.reduce((acc, c) => acc + c.amount, 0);

        return (
          <div className="space-y-6 animate-fade-in text-left">
            {/* STATS DE PARRAINAGE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Filleuls Enregistrés via Lien</span>
                <div className="text-xl font-bold text-white mt-1">
                  {users.filter(u => u.referredBy).length} Membres
                </div>
                <p className="text-[9px] text-yellow-500/80 font-mono mt-1">Associés à un parrain actif</p>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Commissions MLM Versées</span>
                <div className="text-xl font-bold text-green-400 mt-1">
                  {totalCommissionsAmount.toLocaleString()} FCFA
                </div>
                <p className="text-[9px] text-slate-400 font-mono mt-1">Niveaux 1 (20%), 2 (3%), et 3 (1%)</p>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Commissions MLM Payées</span>
                <div className="text-xl font-bold text-white mt-1">
                  {commissions.length} Transactions
                </div>
                <p className="text-[9px] text-green-450 font-mono mt-1">Dispersées automatiquement</p>
              </div>
            </div>

            {/* BARRE DE RECHERCHE FILTRÉE */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Suivi en Temps Réel des Liens de Parrainage</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Ci-dessous s'affiche la liste de tous les filleuls qui se sont inscrits en utilisant un lien de parrainage ou code d'affiliation de nos membres.
                  </p>
                </div>
                <div className="relative max-w-sm w-full">
                  <span className="absolute left-3.5 top-3 text-slate-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Rechercher un filleul, parrain ou code..."
                    value={affiliateSearchQuery}
                    onChange={(e) => setAffiliateSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none placeholder-slate-600 font-mono"
                  />
                </div>
              </div>

              {/* LISTE DES FILIATIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFilleuls.length === 0 ? (
                  <div className="col-span-2 p-8 rounded-2xl bg-slate-950/20 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                    Aucun filleul actif correspondant aux critères de recherche n'est enregistré.
                  </div>
                ) : (
                  filteredFilleuls.map((filleul) => {
                    const parrain = users.find(u => u.id === filleul.referredBy);
                    return (
                      <div 
                        key={filleul.id} 
                        className="p-4 rounded-xl bg-slate-950/60 border border-yellow-500/5 hover:border-yellow-500/20 flex items-center justify-between gap-4 transition-all text-left"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white block">{filleul.name}</span>
                            <span className="text-[8px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded font-mono uppercase font-semibold">Filleul</span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            WhatsApp: <span className="font-mono text-slate-200">{filleul.whatsapp}</span> | Pays: <span className="text-slate-300">{filleul.country}</span>
                          </p>
                          <span className="text-[9px] text-slate-500 block">
                            Inscrit le : {new Date(filleul.createdAt).toLocaleString('fr-FR')}
                          </span>
                        </div>

                        <div className="text-right border-l border-slate-800 pl-4 space-y-1.5 flex flex-col items-end justify-center min-w-[120px]">
                          <div>
                            <span className="text-[8px] text-slate-500 block uppercase tracking-wider font-bold">Parrain / Sponsor</span>
                            <span className="text-xs font-bold text-yellow-500 block truncate max-w-[140px]">
                              {parrain ? parrain.name : "Code inconnu"}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono block">
                              WA: {parrain ? parrain.whatsapp : "N/A"}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteSponsor(filleul.id)}
                            className="text-[8px] font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/30 rounded px-2 py-0.5 duration-100 flex items-center gap-1 cursor-pointer"
                            title="Supprimer ce lien d'affiliation"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* COMMISSION MLM TRANSACTIONS DETAIL */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>💰</span>
                <span>Historique des Commissions Affiliation MLM versées</span>
              </h3>
              
              <div className="overflow-x-auto text-[11px] md:text-xs">
                <table className="w-full text-left text-slate-300 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/30">
                      <th className="p-3">Bénéficiaire (Parrain)</th>
                      <th className="p-3">Initié par (Filleul)</th>
                      <th className="p-3">Niveau d'Affiliation</th>
                      <th className="p-3">Montant Reçu</th>
                      <th className="p-3">Date du versement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {commissions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 font-mono">
                          Aucune commission de parrainage n'a encore été payée sur la plateforme.
                        </td>
                      </tr>
                    ) : (
                      commissions.map((comm) => {
                        const beneficiary = users.find(u => u.id === comm.userId);
                        return (
                          <tr key={comm.id} className="hover:bg-slate-900/10">
                            <td className="p-3 text-left">
                              <span className="font-semibold text-white block">{beneficiary ? beneficiary.name : 'Membre Inconnu'}</span>
                              <span className="text-[10px] text-slate-400 block font-mono">{beneficiary ? beneficiary.whatsapp : ''}</span>
                            </td>
                            <td className="p-3 font-medium text-slate-200 text-left">
                              {comm.fromUserName}
                            </td>
                            <td className="p-3 text-left">
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                                comm.level === 1 
                                  ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
                                  : comm.level === 2
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              }`}>
                                Niveau {comm.level} {comm.level === 1 ? '(20%)' : comm.level === 2 ? '(3%)' : '(1%)'}
                              </span>
                            </td>
                            <td className="p-3 font-mono font-bold text-green-400 text-left">
                              +{comm.amount.toLocaleString()} FCFA
                            </td>
                            <td className="p-3 text-slate-400 text-[10px] font-mono text-left">
                              {new Date(comm.createdAt).toLocaleString('fr-FR')}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
