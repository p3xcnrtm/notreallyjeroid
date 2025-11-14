export type Chain = 'ethereum' | 'bitcoin' | 'solana' | 'bnb' | 'polygon';

export interface Wallet {
  id: string;
  name: string;
  address: string;
  chain: Chain;
  balance: string;
  balanceUSD: number;
  isWatchOnly: boolean;
  createdAt: number;
}

export interface Token {
  symbol: string;
  name: string;
  address: string;
  chain: Chain;
  balance: string;
  balanceUSD: number;
  priceUSD: number;
  logo?: string;
}

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  chain: Chain;
  type: 'send' | 'receive' | 'swap';
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  gasFee?: string;
  gasFeeUSD?: number;
}

export interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  priceImpact: number;
  slippage: number;
  minimumReceived: string;
  gasEstimate: string;
  route: string[];
}

export interface NetworkStatus {
  chain: Chain;
  status: 'online' | 'offline' | 'slow';
  blockHeight?: number;
  lastUpdate: number;
}

export interface PriceAlert {
  id: string;
  token: string;
  chain: Chain;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
}

export interface User {
  id: string;
  email: string;
  passkeyId?: string;
  createdAt: number;
  lastLogin: number;
}

export interface SeedPhrase {
  phrase: string;
  createdAt: number;
}

