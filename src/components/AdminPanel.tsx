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
  ChevronRight
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
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'deposits' | 'withdrawals' | 'products' | 'platform'>('deposits');

  // Edit user modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editBalance, setEditBalance] = useState<number>(0);
  const [editBonus, setEditBonus] = useState<number>(0);
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user');

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

  // Refresh lists
  const syncLocalStates = () => {
    setUsers(DataStore.getUsers());
    setDeposits(DataStore.getDeposits());
    setWithdrawals(DataStore.getWithdrawals());
    setProducts(DataStore.getProducts());
    setBonusCodes(DataStore.getBonusCodes());
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
  };

  const handleSaveUser = () => {
    if (editingUser) {
      DataStore.updateUserBalance(editingUser.id, {
        balance: editBalance,
        bonus: editBonus,
        role: editRole
      });
      setEditingUser(null);
      syncLocalStates();
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
      {activeAdminTab === 'users' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider font-semibold">Portefeuille des Affiliés</h3>
            <span className="text-[10px] text-slate-400">Total : {users.length} comptes enregistrés</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/30">
                  <th className="p-3">Id</th>
                  <th className="p-3">Nom Complet</th>
                  <th className="p-3 font-mono">WhatsApp</th>
                  <th className="p-3">Solde (FCFA)</th>
                  <th className="p-3">Bonus (FCFA)</th>
                  <th className="p-3">Code Parrainage</th>
                  <th className="p-3 text-center">Rôle</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((user) => (
                  <tr key={user.id} className={`hover:bg-slate-900/20 ${user.isBlocked ? 'bg-red-500/5' : ''}`}>
                    <td className="p-3 text-[10px] font-mono text-slate-500">{user.id}</td>
                    <td className="p-3">
                      <span className="font-semibold text-white block">{user.name}</span>
                      <span className="text-[10px] text-slate-400 block">{user.country}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-300">{user.whatsapp}</td>
                    <td className="p-3 font-bold font-mono text-yellow-400">{user.balance.toLocaleString()} F</td>
                    <td className="p-3 font-bold font-mono text-slate-400">{user.bonus.toLocaleString()} F</td>
                    <td className="p-3 font-mono text-slate-300 text-yellow-500/80">{user.referralCode}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
            {products.map((p) => (
              <div key={p.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-yellow-500 font-mono uppercase font-bold">Niveau {p.vipLevel}</span>
                      <h4 className="font-display font-medium text-white text-sm block mt-0.5">{p.name}</h4>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="text-red-400 hover:text-red-500 p-1 bg-red-500/10 rounded"
                      title="Supprimer le VIP"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
                    <div className="flex justify-between text-slate-400 font-bold border-t border-slate-900 pt-1.5 mt-1.5">
                      <span>Retour brut :</span>
                      <span className="text-white">{(p.dailyReturn * p.durationDays).toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
    </div>
  );
}
