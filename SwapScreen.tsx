import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, AlertTriangle, Zap, TrendingDown } from 'lucide-react';
import Layout from '@/components/Layout';
import { useWallet } from '@/contexts/WalletContext';
import { getChainSymbol } from '@/utils/wallet';
import { getSwapQuote } from '@/utils/api';
import toast from 'react-hot-toast';

const TOKENS = ['ETH', 'BTC', 'SOL', 'BNB', 'MATIC', 'USDT'];

export default function SwapScreen() {
  const { wallets, selectedWallet, addTransaction } = useWallet();
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDT');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [quote, setQuote] = useState<{
    toAmount: string;
    priceImpact: number;
    slippage: number;
    minimumReceived: string;
    gasEstimate: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (fromAmount && selectedWallet) {
      loadQuote();
    } else {
      setQuote(null);
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken, selectedWallet]);

  const loadQuote = async () => {
    if (!selectedWallet || !fromAmount || parseFloat(fromAmount) <= 0) return;

    try {
      const swapQuote = await getSwapQuote(
        fromToken,
        toToken,
        fromAmount,
        selectedWallet.chain
      );
      setQuote(swapQuote);
      setToAmount(swapQuote.toAmount);
    } catch (error) {
      console.error('Failed to load swap quote:', error);
    }
  };

  const handleSwap = async () => {
    if (!selectedWallet) {
      toast.error('Please select a wallet');
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(fromAmount) > parseFloat(selectedWallet.balance)) {
      toast.error('Insufficient balance');
      return;
    }

    setIsLoading(true);
    try {
      // Mock swap transaction
      const newTransaction = {
        id: crypto.randomUUID(),
        hash: '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map(b => b.toString(16).padStart(2, '0')).join(''),
        from: selectedWallet.address,
        to: selectedWallet.address,
        amount: fromAmount,
        token: fromToken,
        chain: selectedWallet.chain,
        type: 'swap' as const,
        status: 'pending' as const,
        timestamp: Date.now(),
        gasFee: quote?.gasEstimate,
      };

      addTransaction(newTransaction);
      toast.success('Swap initiated successfully');
      setFromAmount('');
      setToAmount('');
      setQuote(null);
    } catch (error) {
      toast.error('Swap failed');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const swapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  if (!selectedWallet) {
    return (
      <Layout>
        <div className="card text-center py-12">
          <p className="text-charcoal-600 dark:text-charcoal-400 mb-4">
            Please select a wallet to swap from
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-charcoal-900 dark:text-ivory-50 mb-2">
            Swap Tokens
          </h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            Exchange cryptocurrencies instantly
          </p>
        </div>

        <div className="card">
          <div className="space-y-4">
            {/* From Token */}
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                From
              </label>
              <div className="flex items-center space-x-3">
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="input-field w-32"
                >
                  {TOKENS.map((token) => (
                    <option key={token} value={token}>
                      {token}
                    </option>
                  ))}
                </select>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="input-field"
                    placeholder="0.0"
                    step="0.00000001"
                    min="0"
                  />
                  <button
                    onClick={() => setFromAmount(selectedWallet.balance)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-deep-green-600 dark:text-deep-green-400 hover:underline"
                  >
                    Max
                  </button>
                </div>
              </div>
              <p className="text-xs text-charcoal-500 dark:text-charcoal-500 mt-1">
                Balance: {selectedWallet.balance} {getChainSymbol(selectedWallet.chain)}
              </p>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-2">
              <button
                onClick={swapTokens}
                className="p-3 rounded-full bg-charcoal-100 dark:bg-charcoal-800 hover:bg-charcoal-200 dark:hover:bg-charcoal-700 transition-colors border-2 border-charcoal-200 dark:border-charcoal-700"
              >
                <ArrowUpDown size={24} className="text-charcoal-600 dark:text-charcoal-400" />
              </button>
            </div>

            {/* To Token */}
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                To
              </label>
              <div className="flex items-center space-x-3">
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  className="input-field w-32"
                >
                  {TOKENS.filter(t => t !== fromToken).map((token) => (
                    <option key={token} value={token}>
                      {token}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={toAmount || '0.0'}
                  readOnly
                  className="input-field flex-1 bg-charcoal-50 dark:bg-charcoal-800/50"
                />
              </div>
            </div>

            {/* Quote Details */}
            {quote && (
              <div className="p-4 bg-charcoal-50 dark:bg-charcoal-800/50 rounded-lg border border-charcoal-200 dark:border-charcoal-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-charcoal-600 dark:text-charcoal-400">Price Impact</span>
                  <span className={`text-sm font-semibold ${
                    quote.priceImpact > 5 ? 'text-red-600 dark:text-red-400' : 'text-charcoal-900 dark:text-ivory-50'
                  }`}>
                    {quote.priceImpact.toFixed(2)}%
                  </span>
                </div>
                {quote.priceImpact > 5 && (
                  <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                    <AlertTriangle size={16} />
                    <span>High price impact. Consider splitting your trade.</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-charcoal-600 dark:text-charcoal-400">Slippage Tolerance</span>
                  <span className="text-sm font-semibold text-charcoal-900 dark:text-ivory-50">
                    {quote.slippage.toFixed(2)}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-charcoal-600 dark:text-charcoal-400">Minimum Received</span>
                  <span className="text-sm font-semibold text-charcoal-900 dark:text-ivory-50">
                    {parseFloat(quote.minimumReceived).toFixed(6)} {toToken}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-charcoal-600 dark:text-charcoal-400 flex items-center space-x-1">
                    <Zap size={14} />
                    <span>Estimated Gas</span>
                  </span>
                  <span className="text-sm font-semibold text-charcoal-900 dark:text-ivory-50">
                    {quote.gasEstimate} {getChainSymbol(selectedWallet.chain)}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleSwap}
              disabled={
                isLoading ||
                !fromAmount ||
                !toAmount ||
                parseFloat(fromAmount) <= 0 ||
                parseFloat(fromAmount) > parseFloat(selectedWallet.balance) ||
                !quote
              }
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <ArrowUpDown size={20} />
              <span>{isLoading ? 'Swapping...' : 'Swap Tokens'}</span>
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="card bg-deep-green-50/50 dark:bg-deep-green-950/20 border-deep-green-200 dark:border-deep-green-800">
          <div className="flex items-start space-x-3">
            <TrendingDown size={20} className="text-deep-green-600 dark:text-deep-green-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-charcoal-900 dark:text-ivory-50 mb-1">
                About Swaps
              </h3>
              <p className="text-sm text-charcoal-700 dark:text-charcoal-300">
                Swaps are executed through decentralized exchanges. Prices may vary based on market
                conditions and liquidity. Always review the price impact before confirming.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

