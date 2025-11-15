import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Shield,
  Bell,
  Network,
  Trash2,
  LogOut,
  Key,
  Mail,
  Eye,
  EyeOff,
} from 'lucide-react';
import Layout from './Layout';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { useWallet } from './WalletContext';
import { clearAllData } from './storage';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Chain } from './types';
import { getChainName } from './wallet';

export default function Settings() {
  const { user, logout, isEmailVerified, sendEmailVerification } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { wallets } = useWallet();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/onboarding');
    toast.success('Logged out successfully');
  };

  const handleDeleteAllData = () => {
    if (confirm('Are you absolutely sure? This will delete all wallets and data. This action cannot be undone.')) {
      clearAllData();
      logout();
      navigate('/onboarding');
      toast.success('All data deleted');
    }
  };

  const handleResendVerification = async () => {
    if (user) {
      try {
        await sendEmailVerification(user.email);
        toast.success('Verification email sent');
      } catch (error) {
        toast.error('Failed to send verification email');
      }
    }
  };

  const enabledChains: Chain[] = ['ethereum', 'bitcoin', 'solana', 'bnb', 'polygon'];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-charcoal-900 dark:text-ivory-50 mb-2">
            Settings
          </h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            Manage your wallet preferences and security
          </p>
        </div>

        {/* Account Section */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-deep-green-500/20 rounded-lg flex items-center justify-center">
              <SettingsIcon size={20} className="text-deep-green-600 dark:text-deep-green-400" />
            </div>
            <h2 className="text-xl font-serif font-semibold text-charcoal-900 dark:text-ivory-50">
              Account
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-charcoal-200 dark:border-charcoal-700">
              <div className="flex items-center space-x-3">
                <Mail size={20} className="text-charcoal-600 dark:text-charcoal-400" />
                <div>
                  <p className="font-medium text-charcoal-900 dark:text-ivory-50">Email</p>
                  <p className="text-sm text-charcoal-600 dark:text-charcoal-400">{user?.email}</p>
                </div>
              </div>
              {isEmailVerified ? (
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Verified</span>
              ) : (
                <button
                  onClick={handleResendVerification}
                  className="text-sm text-deep-green-600 dark:text-deep-green-400 hover:underline"
                >
                  Verify
                </button>
              )}
            </div>

            <div className="flex items-center justify-between py-3 border-b border-charcoal-200 dark:border-charcoal-700">
              <div className="flex items-center space-x-3">
                <Key size={20} className="text-charcoal-600 dark:text-charcoal-400" />
                <div>
                  <p className="font-medium text-charcoal-900 dark:text-ivory-50">Passkey</p>
                  <p className="text-sm text-charcoal-600 dark:text-charcoal-400">
                    {user?.passkeyId ? 'Registered' : 'Not registered'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-matte-gold-500/20 rounded-lg flex items-center justify-center">
              {theme === 'dark' ? (
                <Moon size={20} className="text-matte-gold-600 dark:text-matte-gold-400" />
              ) : (
                <Sun size={20} className="text-matte-gold-600 dark:text-matte-gold-400" />
              )}
            </div>
            <h2 className="text-xl font-serif font-semibold text-charcoal-900 dark:text-ivory-50">
              Appearance
            </h2>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-charcoal-900 dark:text-ivory-50">Theme</p>
              <p className="text-sm text-charcoal-600 dark:text-charcoal-400">
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="btn-outline flex items-center space-x-2"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={18} />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon size={18} />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Section */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Shield size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-serif font-semibold text-charcoal-900 dark:text-ivory-50">
              Security
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-charcoal-50 dark:bg-charcoal-800/50 rounded-lg border border-charcoal-200 dark:border-charcoal-700">
              <div className="flex items-start space-x-3">
                <Eye size={20} className="text-charcoal-600 dark:text-charcoal-400 mt-0.5" />
                <div>
                  <p className="font-medium text-charcoal-900 dark:text-ivory-50 mb-1">
                    Non-Custodial Wallet
                  </p>
                  <p className="text-sm text-charcoal-600 dark:text-charcoal-400">
                    Your private keys are stored locally and encrypted. We never have access to your funds.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-charcoal-50 dark:bg-charcoal-800/50 rounded-lg border border-charcoal-200 dark:border-charcoal-700">
              <div className="flex items-start space-x-3">
                <Shield size={20} className="text-charcoal-600 dark:text-charcoal-400 mt-0.5" />
                <div>
                  <p className="font-medium text-charcoal-900 dark:text-ivory-50 mb-1">
                    No KYC Required
                  </p>
                  <p className="text-sm text-charcoal-600 dark:text-charcoal-400">
                    Use the wallet without identity verification. No tier limits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Networks Section */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Network size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-serif font-semibold text-charcoal-900 dark:text-ivory-50">
              Supported Networks
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {enabledChains.map((chain) => {
              const hasWallet = wallets.some(w => w.chain === chain);
              return (
                <div
                  key={chain}
                  className={`p-4 rounded-lg border ${
                    hasWallet
                      ? 'bg-deep-green-50/50 dark:bg-deep-green-950/20 border-deep-green-200 dark:border-deep-green-800'
                      : 'bg-charcoal-50 dark:bg-charcoal-800/50 border-charcoal-200 dark:border-charcoal-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-charcoal-900 dark:text-ivory-50">
                      {getChainName(chain)}
                    </span>
                    {hasWallet && (
                      <span className="text-xs text-deep-green-600 dark:text-deep-green-400 font-medium">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card border-red-500/30 bg-red-50/50 dark:bg-red-950/20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Trash2 size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-serif font-semibold text-red-900 dark:text-red-400">
              Danger Zone
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="font-medium text-charcoal-900 dark:text-ivory-50 mb-2">Logout</p>
              <p className="text-sm text-charcoal-600 dark:text-charcoal-400 mb-3">
                Sign out of your account. Your wallets will remain secure.
              </p>
              <button onClick={handleLogout} className="btn-outline border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                <LogOut size={18} className="mr-2" />
                Logout
              </button>
            </div>

            <div className="pt-4 border-t border-red-500/30">
              <p className="font-medium text-charcoal-900 dark:text-ivory-50 mb-2">Delete All Data</p>
              <p className="text-sm text-charcoal-600 dark:text-charcoal-400 mb-3">
                Permanently delete all wallets, transactions, and account data. This action cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-primary bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 size={18} className="mr-2" />
                Delete All Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-md w-full border-red-500/50"
          >
            <h2 className="text-2xl font-serif font-bold text-red-600 dark:text-red-400 mb-4">
              Confirm Deletion
            </h2>
            <p className="text-charcoal-700 dark:text-charcoal-300 mb-6">
              Are you absolutely sure you want to delete all data? This will permanently remove all
              wallets, transactions, and account information. This action cannot be undone.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  handleDeleteAllData();
                }}
                className="btn-primary flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Everything
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}

