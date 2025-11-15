import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, KeyRound, Shield, Lock } from 'lucide-react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const { login, register, registerWithPasskey, loginWithPasskey, passkeySupported } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      await login(email);
      toast.success('Logged in successfully');
      navigate('/SeedPhraseCreate');
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeyRegister = async () => {
    if (!email) {
      toast.error('Please enter your email first');
      return;
    }

    setIsLoading(true);
    try {
      await registerWithPasskey(email);
      toast.success('Passkey registered successfully');
      navigate('/SeedPhraseCreate');
    } catch (error) {
      toast.error('Passkey registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithPasskey();
      toast.success('Logged in with passkey');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Passkey authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-deep-green-950 via-deep-green-900 to-charcoal-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 mx-auto bg-gradient-to-br from-matte-gold-500 to-matte-gold-700 rounded-2xl flex items-center justify-center shadow-2xl mb-6"
          >
            <span className="text-4xl font-serif font-bold text-charcoal-900">V</span>
          </motion.div>
          <h1 className="text-4xl font-serif font-bold text-ivory-50 mb-2">Welcome to Vault</h1>
          <p className="text-ivory-200 font-light">Your decentralized crypto wallet</p>
        </div>

        <div className="card bg-ivory-50/10 dark:bg-charcoal-900/50 backdrop-blur-lg border-charcoal-700/50">
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label className="block text-ivory-100 dark:text-ivory-200 mb-2 font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10 bg-charcoal-800/50 border-charcoal-700 text-ivory-50"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full bg-deep-green-700 hover:bg-deep-green-800"
            >
              {isLoading ? 'Processing...' : 'Continue with Email'}
            </button>
          </form>

          {passkeySupported && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-charcoal-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-ivory-300">Or</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePasskeyRegister}
                  disabled={isLoading || !email}
                  className="btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  <KeyRound size={20} />
                  <span>Register with Passkey</span>
                </button>

                <button
                  onClick={handlePasskeyLogin}
                  disabled={isLoading}
                  className="btn-outline w-full flex items-center justify-center space-x-2 border-matte-gold-500 text-matte-gold-500 hover:bg-matte-gold-500/10"
                >
                  <Shield size={20} />
                  <span>Login with Passkey</span>
                </button>
              </div>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-charcoal-700">
            <div className="flex items-start space-x-3 text-sm text-ivory-300">
              <Lock size={16} className="mt-0.5 flex-shrink-0" />
              <p>
                Your keys are stored locally and encrypted. We never have access to your funds.
                No KYC required.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

