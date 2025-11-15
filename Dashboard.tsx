import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, ArrowUpDown, TrendingUp, Wallet, Eye } from 'lucide-react';
import Layout from './Layout';
import { useWallet } from './WalletContext';
import { formatAddress } from './wallet';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet as WalletType, Token } from './types';

export default function Dashboard() {
  const { totalBalanceUSD, wallets, tokens, refreshBalances, refreshPrices } = useWallet();

  useEffect(() => {
    refreshBalances();
    refreshPrices();
    const interval = setInterval(() => {
      refreshBalances();
      refreshPrices();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refreshBalances, refreshPrices]);

  // Mock chart data
  const chartData = [
    { date: 'Mon', value: 12500 },
    { date: 'Tue', value: 13200 },
    { date: 'Wed', value: 12800 },
    { date: 'Thu', value: 14500 },
    { date: 'Fri', value: 15000 },
    { date: 'Sat', value: 14800 },
    { date: 'Sun', value: totalBalanceUSD },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold text-charcoal-900 dark:text-ivory-50 mb-2">
              Portfolio
            </h1>
            <p className="text-charcoal-600 dark:text-charcoal-400">
              {wallets.length} wallet{wallets.length !== 1 ? 's' : ''} connected
            </p>
          </div>
        </div>

        {/* Total Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-br from-deep-green-700 to-deep-green-900 border-deep-green-800"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-ivory-200 font-light">Total Balance</span>
            <Eye size={20} className="text-ivory-300" />
          </div>
          <div className="flex items-baseline space-x-2 mb-2">
            <span className="text-5xl font-serif font-bold text-ivory-50">
              ${totalBalanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-ivory-300">
            <TrendingUp size={16} />
            <span className="text-sm">+2.5% (24h)</span>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/send">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="card bg-matte-gold-500/10 border-matte-gold-500/30 hover:bg-matte-gold-500/20 transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-matte-gold-500/20 rounded-lg flex items-center justify-center">
                  <ArrowUpRight size={24} className="text-matte-gold-600 dark:text-matte-gold-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900 dark:text-ivory-50">Send</h3>
                  <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Transfer crypto</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/receive">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="card bg-deep-green-500/10 border-deep-green-500/30 hover:bg-deep-green-500/20 transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-deep-green-500/20 rounded-lg flex items-center justify-center">
                  <ArrowDownLeft size={24} className="text-deep-green-600 dark:text-deep-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900 dark:text-ivory-50">Receive</h3>
                  <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Get crypto</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to="/swap">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="card bg-charcoal-500/10 border-charcoal-500/30 hover:bg-charcoal-500/20 transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-charcoal-500/20 rounded-lg flex items-center justify-center">
                  <ArrowUpDown size={24} className="text-charcoal-600 dark:text-charcoal-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900 dark:text-ivory-50">Swap</h3>
                  <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Exchange tokens</p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Portfolio Chart */}
        <div className="card">
          <h2 className="text-xl font-serif font-semibold text-charcoal-900 dark:text-ivory-50 mb-4">
            Portfolio Value
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tw-color-charcoal-900)',
                  border: '1px solid var(--tw-color-deep-green-700)',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--tw-color-deep-green-600)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Wallets Overview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-semibold text-charcoal-900 dark:text-ivory-50">
              Your Wallets
            </h2>
            <Link
              to="/wallets"
              className="text-deep-green-600 dark:text-deep-green-400 hover:underline text-sm font-medium"
            >
              Manage
            </Link>
          </div>

          {wallets.length === 0 ? (
            <div className="text-center py-8">
              <Wallet size={48} className="mx-auto text-charcoal-400 mb-4" />
              <p className="text-charcoal-600 dark:text-charcoal-400 mb-4">No wallets yet</p>
              <Link to="/wallets" className="btn-primary inline-block">
                Create Wallet
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {wallets.slice(0, 3).map((wallet: WalletType) => {
                const token = tokens.find((t: Token) => t.chain === wallet.chain);
                return (
                  <motion.div
                    key={wallet.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-charcoal-50 dark:bg-charcoal-800/50 rounded-lg border border-charcoal-200 dark:border-charcoal-700"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-deep-green-500/20 rounded-lg flex items-center justify-center">
                        <Wallet size={20} className="text-deep-green-600 dark:text-deep-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-charcoal-900 dark:text-ivory-50">
                          {wallet.name}
                        </h3>
                        <p className="text-sm text-charcoal-600 dark:text-charcoal-400">
                          {formatAddress(wallet.address)} • {wallet.chain}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-charcoal-900 dark:text-ivory-50">
                        ${(token?.balanceUSD ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-charcoal-600 dark:text-charcoal-400">
                        {wallet.balance} {token?.symbol ?? ''}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

