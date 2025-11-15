import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { getSeedPhrase } from '@/storage';
import { decryptData } from '@/encryption';
import { validateMnemonic } from '@/wallet';
import toast from 'react-hot-toast';

export default function SeedPhraseVerify() {
  const navigate = useNavigate();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isVerified, setIsVerified] = useState(false);

  // Get the correct seed phrase
  const seedPhraseData = getSeedPhrase();
  const correctPhrase = seedPhraseData ? decryptData(seedPhraseData.phrase) : '';
  const correctWords = correctPhrase.split(' ');

  // Create shuffled word list with correct words
  const [availableWords, setAvailableWords] = useState<string[]>(() => {
    if (correctWords.length > 0) {
      return [...correctWords].sort(() => Math.random() - 0.5);
    }
    return [];
  });

  const handleWordClick = (word: string) => {
    if (selectedWords.length < correctWords.length) {
      setSelectedWords([...selectedWords, word]);
      setAvailableWords(availableWords.filter(w => w !== word));
    }
  };

  const handleRemoveWord = (index: number) => {
    const word = selectedWords[index];
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
    setAvailableWords([...availableWords, word]);
  };

  const handleVerify = () => {
    const userPhrase = selectedWords.join(' ');
    if (validateMnemonic(userPhrase) && userPhrase === correctPhrase) {
      setIsVerified(true);
      toast.success('Seed phrase verified successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      toast.error('Incorrect seed phrase. Please try again.');
      setSelectedWords([]);
      const shuffled = [...correctWords].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
    }
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
          <h1 className="text-4xl font-serif font-bold text-ivory-50 mb-2">Verify Your Seed Phrase</h1>
          <p className="text-ivory-200 font-light">Select the words in the correct order</p>
        </div>

        <div className="card bg-ivory-50/10 dark:bg-charcoal-900/50 backdrop-blur-lg border-charcoal-700/50">
          {/* Selected Words */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-ivory-50 mb-4">Selected Words</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 min-h-[120px] bg-charcoal-800/30 rounded-lg p-4 border border-charcoal-700">
              {selectedWords.map((word, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => handleRemoveWord(index)}
                  className="bg-matte-gold-500/20 border border-matte-gold-500/50 rounded-lg p-3 flex items-center justify-between hover:bg-matte-gold-500/30 transition-colors"
                >
                  <span className="text-matte-gold-400 font-mono text-sm font-semibold w-6">
                    {index + 1}
                  </span>
                  <span className="text-ivory-50 font-medium flex-1 text-center">{word}</span>
                  <XCircle size={16} className="text-charcoal-400" />
                </motion.button>
              ))}
              {Array.from({ length: correctWords.length - selectedWords.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="bg-charcoal-800/20 border border-charcoal-700/50 rounded-lg p-3 border-dashed"
                />
              ))}
            </div>
          </div>

          {/* Available Words */}
          <div>
            <h2 className="text-lg font-semibold text-ivory-50 mb-4">Available Words</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {availableWords.map((word, index) => (
                <motion.button
                  key={`${word}-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => handleWordClick(word)}
                  className="bg-charcoal-800/50 border border-charcoal-700 rounded-lg p-3 hover:bg-charcoal-700/50 hover:border-deep-green-500 transition-all duration-300"
                >
                  <span className="text-ivory-50 font-medium">{word}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={selectedWords.length !== correctWords.length || isVerified}
            className="btn-primary w-full mt-6 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isVerified ? (
              <>
                <CheckCircle size={20} />
                <span>Verified!</span>
              </>
            ) : (
              <>
                <span>Verify Seed Phrase</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

