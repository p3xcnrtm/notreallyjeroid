import { Wallet, Transaction, PriceAlert, User, SeedPhrase } from '@/types';
import { encryptData, decryptData } from './encryption';

const STORAGE_KEYS = {
  WALLETS: 'vault_wallets',
  TRANSACTIONS: 'vault_transactions',
  USER: 'vault_user',
  SEED_PHRASE: 'vault_seed_phrase',
  PRICE_ALERTS: 'vault_price_alerts',
  THEME: 'vault_theme',
  EMAIL_VERIFIED: 'vault_email_verified',
};

export function getWallets(): Wallet[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WALLETS);
    if (!data) return [];
    const encrypted = JSON.parse(data);
    const decrypted = decryptData(encrypted);
    return JSON.parse(decrypted);
  } catch {
    return [];
  }
}

export function saveWallets(wallets: Wallet[]): void {
  try {
    const encrypted = encryptData(JSON.stringify(wallets));
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(encrypted));
  } catch (error) {
    console.error('Failed to save wallets:', error);
  }
}

export function getTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!data) return [];
    const encrypted = JSON.parse(data);
    const decrypted = decryptData(encrypted);
    return JSON.parse(decrypted);
  } catch {
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    const encrypted = encryptData(JSON.stringify(transactions));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(encrypted));
  } catch (error) {
    console.error('Failed to save transactions:', error);
  }
}

export function getUser(): User | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (!data) return null;
    const encrypted = JSON.parse(data);
    const decrypted = decryptData(encrypted);
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

export function saveUser(user: User): void {
  try {
    const encrypted = encryptData(JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(encrypted));
  } catch (error) {
    console.error('Failed to save user:', error);
  }
}

export function getSeedPhrase(): SeedPhrase | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SEED_PHRASE);
    if (!data) return null;
    const encrypted = JSON.parse(data);
    const decrypted = decryptData(encrypted);
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

export function saveSeedPhrase(seedPhrase: SeedPhrase): void {
  try {
    const encrypted = encryptData(JSON.stringify(seedPhrase));
    localStorage.setItem(STORAGE_KEYS.SEED_PHRASE, JSON.stringify(encrypted));
  } catch (error) {
    console.error('Failed to save seed phrase:', error);
  }
}

export function getPriceAlerts(): PriceAlert[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRICE_ALERTS);
    if (!data) return [];
    const encrypted = JSON.parse(data);
    const decrypted = decryptData(encrypted);
    return JSON.parse(decrypted);
  } catch {
    return [];
  }
}

export function savePriceAlerts(alerts: PriceAlert[]): void {
  try {
    const encrypted = encryptData(JSON.stringify(alerts));
    localStorage.setItem(STORAGE_KEYS.PRICE_ALERTS, JSON.stringify(encrypted));
  } catch (error) {
    console.error('Failed to save price alerts:', error);
  }
}

export function getTheme(): 'light' | 'dark' {
  try {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    return (theme as 'light' | 'dark') || 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (error) {
    console.error('Failed to save theme:', error);
  }
}

export function isEmailVerified(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.EMAIL_VERIFIED) === 'true';
  } catch {
    return false;
  }
}

export function setEmailVerified(verified: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EMAIL_VERIFIED, verified.toString());
  } catch (error) {
    console.error('Failed to save email verification status:', error);
  }
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

