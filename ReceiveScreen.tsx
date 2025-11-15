import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Download, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Layout from './Layout';
import { useWallet } from './WalletContext';
import { formatAddress, getChainSymbol } from './wallet';
import toast from 'react-hot-toast';

export default function ReceiveScreen() {
  const { wallets, selectedWallet } = useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!selectedWallet) return;

    try {
      await navigator.clipboard.writeText(selectedWallet.address);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };

  const handleDownloadQR = () => {
    // In a real app, you would generate and download the QR code image
    toast.success('QR code download feature coming soon');
  };

  if (!selectedWallet) {
    return (
      <Layout>
        <div className="card text-center py-12">
          <p className="text-charcoal-600 dark:text-charcoal-400 mb-4">
            Please select a wallet to receive to
          </p>
        </div>
      </Layout>
    );
  }

  const qrValue = `${selectedWallet.address}`;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-charcoal-900 dark:text-ivory-50 mb-2">
            Receive Crypto
          </h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            Share this address to receive {getChainSymbol(selectedWallet.chain)}
          </p>
        </div>

        <div className="card">
          <div className="text-center mb-6">
            <h2 className="text-xl font-serif font-semibold text-charcoal-900 dark:text-ivory-50 mb-2">
              {selectedWallet.name}
            </h2>
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400">
              {selectedWallet.chain}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-ivory-50 dark:bg-charcoal-800 rounded-xl border-2 border-charcoal-200 dark:border-charcoal-700"
            >
              <QRCodeSVG
                value={qrValue}
                size={256}
                level="H"
                includeMargin={true}
                fgColor="#1b382c"
                bgColor="transparent"
              />
            </motion.div>
          </div>

          {/* Address */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
              Wallet Address
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 input-field font-mono text-sm bg-charcoal-50 dark:bg-charcoal-800">
                {selectedWallet.address}
              </code>
              <button
                onClick={handleCopy}
                className="btn-secondary px-4 py-3 flex items-center space-x-2"
              >
                {copied ? (
                  <>
                    <Check size={18} />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadQR}
              className="btn-outline flex-1 flex items-center justify-center space-x-2"
            >
              <Download size={18} />
              <span>Download QR</span>
            </button>
            <button
              onClick={handleCopy}
              className="btn-primary flex-1 flex items-center justify-center space-x-2"
            >
              <QrCode size={18} />
              <span>Share Address</span>
            </button>
          </div>
        </div>

        {/* Warning */}
        <div className="card bg-matte-gold-50/50 dark:bg-matte-gold-950/20 border-matte-gold-500/30">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-6 h-6 bg-matte-gold-500/20 rounded-full flex items-center justify-center">
                <span className="text-matte-gold-600 dark:text-matte-gold-400 text-xs font-bold">!</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900 dark:text-ivory-50 mb-1">
                Important
              </h3>
              <p className="text-sm text-charcoal-700 dark:text-charcoal-300">
                Only send {getChainSymbol(selectedWallet.chain)} to this address. Sending other
                cryptocurrencies may result in permanent loss of funds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

