import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import { Wallet, Chain } from './types';

export function generateMnemonic(): string {
  return bip39.generateMnemonic(256); // 24 words
}

export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}

export function mnemonicToSeed(mnemonic: string): string {
  return bip39.mnemonicToSeedSync(mnemonic).toString('hex');
}

export async function createEthereumWallet(mnemonic: string, index: number = 0): Promise<{ address: string; privateKey: string }> {
  const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
  const wallet = hdNode.derivePath(`m/44'/60'/0'/0/${index}`);
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

export async function createBitcoinWallet(mnemonic: string, index: number = 0): Promise<{ address: string; privateKey: string }> {
  // Simplified Bitcoin address generation
  // In production, use proper Bitcoin libraries like bitcoinjs-lib
  const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
  const wallet = hdNode.derivePath(`m/44'/0'/0'/0/${index}`);
  // Bitcoin addresses start with different prefixes
  const address = 'bc1' + wallet.address.slice(2).toLowerCase();
  return {
    address,
    privateKey: wallet.privateKey,
  };
}

export async function createSolanaWallet(mnemonic: string, index: number = 0): Promise<{ address: string; privateKey: string }> {
  // Simplified Solana address generation
  // In production, use @solana/web3.js
  const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
  const wallet = hdNode.derivePath(`m/44'/501'/0'/${index}`);
  return {
    address: wallet.address.slice(0, 44), // Solana addresses are base58 encoded, 32-44 chars
    privateKey: wallet.privateKey,
  };
}

export async function createWalletForChain(chain: Chain, mnemonic: string, index: number = 0): Promise<{ address: string; privateKey: string }> {
  switch (chain) {
    case 'ethereum':
    case 'polygon':
    case 'bnb':
      return createEthereumWallet(mnemonic, index);
    case 'bitcoin':
      return createBitcoinWallet(mnemonic, index);
    case 'solana':
      return createSolanaWallet(mnemonic, index);
    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
}

export function formatAddress(address: string, chars: number = 6): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function isValidAddress(address: string, chain: Chain): boolean {
  switch (chain) {
    case 'ethereum':
    case 'polygon':
    case 'bnb':
      return ethers.isAddress(address);
    case 'bitcoin':
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/i.test(address);
    case 'solana':
      return address.length >= 32 && address.length <= 44;
    default:
      return false;
  }
}

export function getChainName(chain: Chain): string {
  const names: Record<Chain, string> = {
    ethereum: 'Ethereum',
    bitcoin: 'Bitcoin',
    solana: 'Solana',
    bnb: 'BNB Chain',
    polygon: 'Polygon',
  };
  return names[chain];
}

export function getChainSymbol(chain: Chain): string {
  const symbols: Record<Chain, string> = {
    ethereum: 'ETH',
    bitcoin: 'BTC',
    solana: 'SOL',
    bnb: 'BNB',
    polygon: 'MATIC',
  };
  return symbols[chain];
}

