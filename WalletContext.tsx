import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Wallet, Transaction, Token } from './types';
import { getWallets, saveWallets, getTransactions, saveTransactions } from './storage';
import { getBalance, getTokenPrices } from './api';
import { getChainSymbol } from './wallet';

interface WalletContextType {
  wallets: Wallet[];
  transactions: Transaction[];
  selectedWallet: Wallet | null;
  totalBalanceUSD: number;
  tokens: Token[];
  addWallet: (wallet: Wallet) => void;
  removeWallet: (id: string) => void;
  updateWallet: (id: string, updates: Partial<Wallet>) => void;
  selectWallet: (id: string | null) => void;
  addTransaction: (transaction: Transaction) => void;
  refreshBalances: () => Promise<void>;
  refreshPrices: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    const loadedWallets = getWallets();
    const loadedTransactions = getTransactions();
    setWallets(loadedWallets);
    setTransactions(loadedTransactions);
    if (loadedWallets.length > 0) {
      setSelectedWallet(loadedWallets[0]);
    }
  }, []);

  useEffect(() => {
    if (wallets.length > 0) {
      saveWallets(wallets);
      refreshBalances();
      refreshPrices();
    }
  }, [wallets]);

  useEffect(() => {
    if (transactions.length > 0) {
      saveTransactions(transactions);
    }
  }, [transactions]);

  const refreshBalances = useCallback(async () => {
    const updatedWallets = await Promise.all(
      wallets.map(async (wallet) => {
        try {
          const balance = await getBalance(wallet.address, wallet.chain);
          return { ...wallet, balance };
        } catch {
          return wallet;
        }
      })
    );
    setWallets(updatedWallets);
  }, [wallets]);

  const refreshPrices = useCallback(async () => {
    const symbols = Array.from(new Set(wallets.map(w => getChainSymbol(w.chain))));
    const prices = await getTokenPrices(symbols);
    
    const updatedTokens: Token[] = wallets.map(wallet => {
      const price = prices.find(p => p.symbol === getChainSymbol(wallet.chain));
      const balanceUSD = parseFloat(wallet.balance) * (price?.price || 0);
      return {
        symbol: getChainSymbol(wallet.chain),
        name: wallet.chain,
        address: wallet.address,
        chain: wallet.chain,
        balance: wallet.balance,
        balanceUSD,
        priceUSD: price?.price || 0,
      };
    });

    setTokens(updatedTokens);
  }, [wallets]);

  const addWallet = (wallet: Wallet) => {
    setWallets(prev => [...prev, wallet]);
    if (!selectedWallet) {
      setSelectedWallet(wallet);
    }
  };

  const removeWallet = (id: string) => {
    setWallets(prev => prev.filter(w => w.id !== id));
    if (selectedWallet?.id === id) {
      const remaining = wallets.filter(w => w.id !== id);
      setSelectedWallet(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const updateWallet = (id: string, updates: Partial<Wallet>) => {
    setWallets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
    if (selectedWallet?.id === id) {
      setSelectedWallet(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const selectWallet = (id: string | null) => {
    const wallet = wallets.find(w => w.id === id) || null;
    setSelectedWallet(wallet);
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const totalBalanceUSD = tokens.reduce((sum, token) => sum + token.balanceUSD, 0);

  return (
    <WalletContext.Provider
      value={{
        wallets,
        transactions,
        selectedWallet,
        totalBalanceUSD,
        tokens,
        addWallet,
        removeWallet,
        updateWallet,
        selectWallet,
        addTransaction,
        refreshBalances,
        refreshPrices,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

