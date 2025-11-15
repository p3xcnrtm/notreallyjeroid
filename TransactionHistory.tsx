import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, ArrowUpDown, Filter, Copy, Check, ExternalLink } from 'lucide-react';
import Layout from '@/Layout';
import { useWallet } from '@/WalletContext';
import { formatAddress, getChainSymbol } from '@/wallet';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

type FilterType = 'all' | 'send' | 'receive' | 'swap';
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'failed';

export default function TransactionHistory() {
  const { transactions, wallets } = useWallet();
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [chainFilter, setChainFilter] = useState<string>('all');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const filteredTransactions = transactions.filter((tx) => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (chainFilter !== 'all' && tx.chain !== chainFilter) return false;
    return true;
  });

  const handleCopyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      toast.success('Transaction hash copied');
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (error) {
      toast.error('Failed to copy hash');
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight size={20} className="text-red-500" />;
      case 'receive':
        return <ArrowDownLeft size={20} className="text-green-500" />;
      case 'swap':
        return <ArrowUpDown size={20} className="text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-charcoal-600 dark:text-charcoal-400';
    }
  };

  const getExplorerUrl = (hash: string, chain: string) => {
    const explorers: Record<string, string> = {
      ethereum: `https://etherscan.io/tx/${hash}`,
      polygon: `https://polygonscan.com/tx/${hash}`,
      bnb: `https://bscscan.com/tx/${hash}`,
      bitcoin: `https://blockstream.info/tx/${hash}`,
      solana: `https://solscan.io/tx/${hash}`,
    };
    return explorers[chain] || '#';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold text-charcoal-900 dark:text-ivory-50 mb-2">
              Transaction History
            </h1>
            <p className="text-charcoal-600 dark:text-charcoal-400">
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Filter size={20} className="text-charcoal-600 dark:text-charcoal-400" />
            <h2 className="text-lg font-semibold text-charcoal-900 dark:text-ivory-50">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as FilterType)}
                className="input-field"
              >
                <option value="all">All Types</option>
                <option value="send">Send</option>
                <option value="receive">Receive</option>
                <option value="swap">Swap</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                Chain
              </label>
              <select
                value={chainFilter}
                onChange={(e) => setChainFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Chains</option>
                {Array.from(new Set(wallets.map(w => w.chain))).map((chain) => (
                  <option key={chain} value={chain}>
                    {chain}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-charcoal-600 dark:text-charcoal-400">
              No transactions found
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => {
              const wallet = wallets.find(w => w.address === tx.from || w.address === tx.to);
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-charcoal-100 dark:bg-charcoal-800 rounded-lg flex items-center justify-center">
                        {getTransactionIcon(tx.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-charcoal-900 dark:text-ivory-50 capitalize">
                            {tx.type}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tx.status)} bg-opacity-10`}>
                            {tx.status}
                          </span>
                          <span className="text-xs text-charcoal-500 dark:text-charcoal-500 px-2 py-1 rounded-full bg-charcoal-100 dark:bg-charcoal-800">
                            {tx.chain}
                          </span>
                        </div>

                        <div className="space-y-1 text-sm">
                          <p className="text-charcoal-600 dark:text-charcoal-400">
                            <span className="font-medium">From:</span> {formatAddress(tx.from)}
                          </p>
                          <p className="text-charcoal-600 dark:text-charcoal-400">
                            <span className="font-medium">To:</span> {formatAddress(tx.to)}
                          </p>
                          <p className="text-charcoal-900 dark:text-ivory-50 font-semibold">
                            {tx.amount} {tx.token}
                          </p>
                          {tx.gasFeeUSD && (
                            <p className="text-xs text-charcoal-500 dark:text-charcoal-500">
                              Gas: ${tx.gasFeeUSD.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <p className="text-xs text-charcoal-500 dark:text-charcoal-500 mb-2">
                        {format(new Date(tx.timestamp), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-charcoal-500 dark:text-charcoal-500 mb-3">
                        {format(new Date(tx.timestamp), 'h:mm a')}
                      </p>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCopyHash(tx.hash)}
                          className="p-2 rounded-lg hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
                          title="Copy hash"
                        >
                          {copiedHash === tx.hash ? (
                            <Check size={16} className="text-deep-green-600" />
                          ) : (
                            <Copy size={16} className="text-charcoal-600 dark:text-charcoal-400" />
                          )}
                        </button>
                        <a
                          href={getExplorerUrl(tx.hash, tx.chain)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
                          title="View on explorer"
                        >
                          <ExternalLink size={16} className="text-charcoal-600 dark:text-charcoal-400" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

