import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Check, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { generateMnemonic } from '@/utils/wallet';
import { saveSeedPhrase } from '@/utils/storage';
import { encryptData } from '@/utils/encryption';
import toast from 'react-hot-toast';

export default function SeedPhraseCreate() {
  const navigate = useNavigate();
  const [mnemonic] = useState(() => generateMnemonic());
  const [words, setWords] = useState<string[]>(() => mnemonic.split(' '));
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      toast.success('Seed phrase copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy seed phrase');
    }
  };

  const handleContinue = () => {
    if (!confirmed) {
      toast.error('Please confirm that you have saved your seed phrase');
      return;
    }

    // Save encrypted seed phrase
    const encrypted = encryptData(mnemonic);
    saveSeedPhrase({
      phrase: encrypted,
      createdAt: Date.now(),
    });

    toast.success('Seed phrase saved securely');
    navigate('/seed-phrase/verify');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-deep-green-950 via-deep-green-900 to-charcoal-950 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-ivory-50 mb-2">Secure Your Wallet</h1>
          <p className="text-ivory-200 font-light">Save your seed phrase in a safe place</p>
        </div>

        <div className="card bg-ivory-50/10 dark:bg-charcoal-900/50 backdrop-blur-lg border-charcoal-700/50">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif font-semibold text-ivory-50">Your Recovery Phrase</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setRevealed(!revealed)}
                  className="p-2 rounded-lg hover:bg-charcoal-800/50 transition-colors"
                >
                  {revealed ? <EyeOff size={20} className="text-ivory-300" /> : <Eye size={20} className="text-ivory-300" />}
                </button>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg hover:bg-charcoal-800/50 transition-colors"
                >
                  {copied ? (
                    <Check size={20} className="text-deep-green-400" />
                  ) : (
                    <Copy size={20} className="text-ivory-300" />
                  )}
                </button>
              </div>
            </div>

            {revealed ? (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {words.map((word, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="bg-charcoal-800/50 border border-charcoal-700 rounded-lg p-3 flex items-center space-x-2"
                  >
                    <span className="text-matte-gold-500 font-mono text-sm font-semibold w-6">
                      {index + 1}
                    </span>
                    <span className="text-ivory-50 font-medium">{word}</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {words.map((_, index) => (
                  <div
                    key={index}
                    className="bg-charcoal-800/50 border border-charcoal-700 rounded-lg p-3 flex items-center space-x-2"
                  >
                    <span className="text-matte-gold-500 font-mono text-sm font-semibold w-6">
                      {index + 1}
                    </span>
                    <span className="text-ivory-300">••••••</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-matte-gold-500/10 border border-matte-gold-500/30 rounded-lg">
              <p className="text-sm text-ivory-200">
                <strong className="text-matte-gold-400">Warning:</strong> Never share your seed phrase with anyone.
                Anyone with access to it can control your wallet. Store it securely offline.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-5 h-5 rounded border-charcoal-700 bg-charcoal-800 text-deep-green-600 focus:ring-deep-green-500"
              />
              <span className="text-ivory-200">
                I have saved my seed phrase in a secure location
              </span>
            </label>
          </div>

          <button
            onClick={handleContinue}
            disabled={!confirmed || !revealed}
            className="btn-primary w-full mt-6 flex items-center justify-center space-x-2"
          >
            <span>Continue</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

