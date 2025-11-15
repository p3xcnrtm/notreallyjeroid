import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, QrCode, AlertTriangle, Zap } from 'lucide-react';
import Layout from './Layout';
import { useWallet } from './WalletContext';
import { isValidAddress, formatAddress, getChainSymbol } from './wallet';
import { getGasEstimate, sendTransaction } from './api';
import { getSeedPhrase } from './storage';
import { decryptData } from './encryption';
import toast from 'react-hot-toast';

export default function SendScreen() {
  const { wallets, selectedWallet, addTransaction } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [gasEstimate, setGasEstimate] = useState<{ gasPrice: string; totalGasUSD: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  useEffect(() => {
    if (selectedWallet && recipient && amount) {
      loadGasEstimate();
    }
  }, [selectedWallet, recipient, amount]);

  const loadGasEstimate = async () => {
    if (!selectedWallet || !isValidAddress(recipient, selectedWallet.chain)) return;

    try {
      const estimate = await getGasEstimate(
        selectedWallet.chain,
        selectedWallet.address,
        recipient,
        amount
      );
      setGasEstimate({
        gasPrice: estimate.gasPrice,
        totalGasUSD: estimate.totalGasUSD,
      });
    } catch (error) {
      console.error('Failed to load gas estimate:', error);
    }
  };

  const handleSend = async () => {
    if (!selectedWallet) {
      toast.error('Please select a wallet');
      return;
    }

    if (!recipient || !isValidAddress(recipient, selectedWallet.chain)) {
      toast.error('Please enter a valid recipient address');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(selectedWallet.balance)) {
      toast.error('Insufficient balance');
      return;
    }

    setIsLoading(true);
    try {
      const seedPhraseData = getSeedPhrase();
      if (!seedPhraseData) {
        toast.error('No seed phrase found');
        return;
      }

      // Derive private key from seed phrase
      const mnemonic = decryptData(seedPhraseData.phrase);
      const { ethers } = await import('ethers');
      const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
      
      // Find wallet index
      const walletIndex = wallets.findIndex(w => w.id === selectedWallet.id);
      const wallet = hdNode.derivePath(`m/44'/60'/0'/0/${walletIndex}`);
      const privateKey = wallet.privateKey;

      const result = await sendTransaction(
        selectedWallet.chain,
        selectedWallet.address,
        recipient,
        amount,
        privateKey
      );

      const newTransaction = {
        id: crypto.randomUUID(),
        hash: result.hash,
        from: selectedWallet.address,
        to: recipient,
        amount,
        token: getChainSymbol(selectedWallet.chain),
        chain: selectedWallet.chain,
        type: 'send' as const,
        status: 'pending' as const,
        timestamp: Date.now(),
        gasFee: gasEstimate?.gasPrice,
        gasFeeUSD: gasEstimate?.totalGasUSD,
      };

      addTransaction(newTransaction);
      toast.success('Transaction sent successfully');
      setRecipient('');
      setAmount('');
      setGasEstimate(null);
    } catch (error) {
      toast.error('Transaction failed');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedWallet) {
    return (
      <Layout>
        <div className="card text-center py-12">
          <p className="text-charcoal-600 dark:text-charcoal-400 mb-4">
            Please select a wallet to send from
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
            Send Crypto
          </h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            From: {selectedWallet.name} ({formatAddress(selectedWallet.address)})
          </p>
        </div>

        <div className="card">
          <div className="space-y-6">
            {/* Recipient Address */}
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                Recipient Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="input-field pr-12"
                  placeholder="0x..."
                />
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
                >
                  <QrCode size={20} className="text-charcoal-600 dark:text-charcoal-400" />
                </button>
              </div>
              {recipient && !isValidAddress(recipient, selectedWallet.chain) && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                  <AlertTriangle size={16} />
                  <span>Invalid address for {selectedWallet.chain}</span>
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300">
                  Amount
                </label>
                <span className="text-sm text-charcoal-600 dark:text-charcoal-400">
                  Balance: {selectedWallet.balance} {getChainSymbol(selectedWallet.chain)}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field pr-20"
                  placeholder="0.0"
                  step="0.00000001"
                  min="0"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-charcoal-600 dark:text-charcoal-400 font-medium">
                    {getChainSymbol(selectedWallet.chain)}
                  </span>
                </div>
              </div>
              {amount && parseFloat(amount) > parseFloat(selectedWallet.balance) && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  Insufficient balance
                </p>
              )}
            </div>

            {/* Gas Estimate */}
            {gasEstimate && (
              <div className="p-4 bg-charcoal-50 dark:bg-charcoal-800/50 rounded-lg border border-charcoal-200 dark:border-charcoal-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-charcoal-600 dark:text-charcoal-400 flex items-center space-x-2">
                    <Zap size={16} />
                    <span>Estimated Gas Fee</span>
                  </span>
                  <span className="text-sm font-semibold text-charcoal-900 dark:text-ivory-50">
                    ${gasEstimate.totalGasUSD.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-charcoal-500 dark:text-charcoal-500">
                  Gas Price: {gasEstimate.gasPrice}
                </p>
              </div>
            )}

            {/* Transaction Summary */}
            {amount && recipient && isValidAddress(recipient, selectedWallet.chain) && (
              <div className="p-4 bg-deep-green-50/50 dark:bg-deep-green-950/30 rounded-lg border border-deep-green-200 dark:border-deep-green-800">
                <h3 className="text-sm font-semibold text-charcoal-900 dark:text-ivory-50 mb-3">
                  Transaction Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal-600 dark:text-charcoal-400">Amount</span>
                    <span className="text-charcoal-900 dark:text-ivory-50 font-medium">
                      {amount} {getChainSymbol(selectedWallet.chain)}
                    </span>
                  </div>
                  {gasEstimate && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-600 dark:text-charcoal-400">Gas Fee</span>
                      <span className="text-charcoal-900 dark:text-ivory-50 font-medium">
                        ${gasEstimate.totalGasUSD.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-deep-green-200 dark:border-deep-green-800">
                    <span className="text-charcoal-600 dark:text-charcoal-400 font-medium">Total</span>
                    <span className="text-charcoal-900 dark:text-ivory-50 font-semibold">
                      {amount} {getChainSymbol(selectedWallet.chain)} + Gas
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={
                isLoading ||
                !recipient ||
                !amount ||
                !isValidAddress(recipient, selectedWallet.chain) ||
                parseFloat(amount) <= 0 ||
                parseFloat(amount) > parseFloat(selectedWallet.balance)
              }
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <ArrowUpRight size={20} />
              <span>{isLoading ? 'Sending...' : 'Send Transaction'}</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

