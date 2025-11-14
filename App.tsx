import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { WalletProvider } from './WalletContext';
import { ThemeProvider } from './ThemeContext';
import SplashScreen from './SplashScreen';
import OnboardingScreen from './OnboardingScreen';
import SeedPhraseCreate from './SeedPhraseCreate';
import SeedPhraseVerify from './SeedPhraseVerify';
import Dashboard from './Dashboard';
import WalletList from './WalletList';
import SendScreen from './SendScreen';
import ReceiveScreen from './ReceiveScreen';
import SwapScreen from './SwapScreen';
import TransactionHistory from './TransactionHistory';
import Settings from './Settings';
import { Toaster } from 'react-hot-toast';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/onboarding" />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const seedPhrase = localStorage.getItem('vault_seed_phrase');

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/seed-phrase/create" element={<SeedPhraseCreate />} />
        <Route path="/seed-phrase/verify" element={<SeedPhraseVerify />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  if (!seedPhrase) {
    return (
      <Routes>
        <Route path="/seed-phrase/create" element={<SeedPhraseCreate />} />
        <Route path="*" element={<Navigate to="/seed-phrase/create" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/wallets" element={<PrivateRoute><WalletList /></PrivateRoute>} />
      <Route path="/send" element={<PrivateRoute><SendScreen /></PrivateRoute>} />
      <Route path="/receive" element={<PrivateRoute><ReceiveScreen /></PrivateRoute>} />
      <Route path="/swap" element={<PrivateRoute><SwapScreen /></PrivateRoute>} />
      <Route path="/transactions" element={<PrivateRoute><TransactionHistory /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WalletProvider>
          <Router>
            <div className="min-h-screen">
              <AppRoutes />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: 'var(--tw-color-charcoal-900)',
                    color: 'var(--tw-color-ivory-50)',
                    border: '1px solid var(--tw-color-deep-green-700)',
                  },
                }}
              />
            </div>
          </Router>
        </WalletProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

