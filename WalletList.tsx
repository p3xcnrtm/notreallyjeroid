import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Eye, EyeOff, Copy, Check } from 'lucide-react';
import Layout from '@/Layout';
import { useWallet } from '@/WalletContext';
import { formatAddress, getChainName, getChainSymbol } from '@/wallet';
import { getSeedPhrase } from '@/storage';
import { decryptData } from '@/encryption';
import { createWalletForChain, Chain } from '@/wallet';
import toast from 'react-hot-toast';

export default function WalletList() {
  const { wallets, addWallet, removeWallet, updateWallet, selectWallet, selectedWallet } = useWallet();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState<string | null>(null);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletChain, setNewWalletChain] = useState<Chain>('ethereum');
  const [revealedAddresses, setRevealedAddresses] = useState<Set<string>>(new Set());
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const chains: Chain[] = ['ethereum', 'bitcoin', 'solana', 'bnb', 'polygon'];

  const handleCreateWallet = async () => {
    if (!newWalletName.trim()) {
      toast.error('Please enter a wallet name');
      return;
    }

    try {
      const seedPhraseData = getSeedPhrase();
      if (!seedPhraseData) {
        toast.error('No seed phrase found');
        return;
      }

      const mnemonic = decryptData(seedPhraseData.phrase);
      const existingWalletsForChain = wallets.filter(w => w.chain === newWalletChain);
      const index = existingWalletsForChain.length;

      const { address } = await createWalletForChain(newWalletChain, mnemonic, index);

      const newWallet = {
        id: crypto.randomUUID(),
        name: newWalletName,
        address,
        chain: newWalletChain,
        balance: '0',
        balanceUSD: 0,
        isWatchOnly: false,
        createdAt: Date.now(),
      };

      addWallet(newWallet);
      setShowAddModal(false);
      setNewWalletName('');
      toast.success('Wallet created successfully');
    } catch (error) {
      toast.error('Failed to create wallet');
      console.error(error);
    }
  };

  const handleEditWallet = () => {
    if (!editingWallet || !newWalletName.trim()) {
      toast.error('Please enter a wallet name');
      return;
    }

    updateWallet(editingWallet, { name: newWalletName });
    setShowEditModal(false);
    setEditingWallet(null);
    setNewWalletName('');
    toast.success('Wallet updated');
  };

  const handleDeleteWallet = (id: string) => {
    if (confirm('Are you sure you want to delete this wallet? This action cannot be undone.')) {
      removeWallet(id);
      toast.success('Wallet deleted');
    }
  };

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };

  const toggleRevealAddress = (id: string) => {
    setRevealedAddresses(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const openEditModal = (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (wallet) {
      setEditingWallet(walletId);
      setNewWalletName(wallet.name);
      setShowEditModal(true);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold text-charcoal-900 dark:text-ivory-50 mb-2">
              Wallets
            </h1>
            <p className="text-charcoal-600 dark:text-charcoal-400">
              Manage your crypto wallets
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Wallet</span>
          </button>
        </div>

        {wallets.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-charcoal-600 dark:text-charcoal-400 mb-4">No wallets yet</p>
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              Create Your First Wallet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((wallet) => {
              const isRevealed = revealedAddresses.has(wallet.id);
              const isSelected = selectedWallet?.id === wallet.id;

              return (
                <motion.div
                  key={wallet.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`card cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-deep-green-500 bg-deep-green-50/50 dark:bg-deep-green-950/30' : ''
                  }`}
                  onClick={() => selectWallet(wallet.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-serif font-semibold text-charcoal-900 dark:text-ivory-50 mb-1">
                        {wallet.name}
                      </h3>
                      <p className="text-sm text-charcoal-600 dark:text-charcoal-400">
                        {getChainName(wallet.chain)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRevealAddress(wallet.id);
                        }}
                        className="p-2 rounded-lg hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
                      >
                        {isRevealed ? (
                          <EyeOff size={18} className="text-charcoal-600 dark:text-charcoal-400" />
                        ) : (
                          <Eye size={18} className="text-charcoal-600 dark:text-charcoal-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-charcoal-500 dark:text-charcoal-500 mb-1">Address</p>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm font-mono text-charcoal-700 dark:text-charcoal-300 flex-1">
                        {isRevealed ? wallet.address : formatAddress(wallet.address)}
                      </code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyAddress(wallet.address);
                        }}
                        className="p-1 rounded hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
                      >
                        {copiedAddress === wallet.address ? (
                          <Check size={16} className="text-deep-green-600" />
                        ) : (
                          <Copy size={16} className="text-charcoal-600 dark:text-charcoal-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-charcoal-500 dark:text-charcoal-500 mb-1">Balance</p>
                    <p className="text-xl font-semibold text-charcoal-900 dark:text-ivory-50">
                      {wallet.balance} {getChainSymbol(wallet.chain)}
                    </p>
                    <p className="text-sm text-charcoal-600 dark:text-charcoal-400">
                      ${wallet.balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 pt-4 border-t border-charcoal-200 dark:border-charcoal-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(wallet.id);
                      }}
                      className="flex-1 btn-outline py-2 text-sm flex items-center justify-center space-x-1"
                    >
                      <Edit2 size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWallet(wallet.id);
                      }}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Add Wallet Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card max-w-md w-full"
            >
              <h2 className="text-2xl font-serif font-bold text-charcoal-900 dark:text-ivory-50 mb-4">
                Create New Wallet
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                    Wallet Name
                  </label>
                  <input
                    type="text"
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                    className="input-field"
                    placeholder="My Ethereum Wallet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                    Blockchain
                  </label>
                  <select
                    value={newWalletChain}
                    onChange={(e) => setNewWalletChain(e.target.value as Chain)}
                    className="input-field"
                  >
                    {chains.map((chain) => (
                      <option key={chain} value={chain}>
                        {getChainName(chain)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewWalletName('');
                  }}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button onClick={handleCreateWallet} className="btn-primary flex-1">
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Wallet Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card max-w-md w-full"
            >
              <h2 className="text-2xl font-serif font-bold text-charcoal-900 dark:text-ivory-50 mb-4">
                Edit Wallet
              </h2>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                  Wallet Name
                </label>
                <input
                  type="text"
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                  className="input-field"
                  placeholder="My Ethereum Wallet"
                />
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingWallet(null);
                    setNewWalletName('');
                  }}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button onClick={handleEditWallet} className="btn-primary flex-1">
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
}

