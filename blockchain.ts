import { ethers } from 'ethers';
import { Chain } from '@/types';

/**
 * Get the appropriate RPC URL for a given chain
 */
export async function getRPCUrl(chain: Chain): Promise<string> {
  const rpcUrls: Record<Chain, string> = {
    ethereum: import.meta.env.VITE_ETHEREUM_RPC || 'https://eth.llamarpc.com',
    polygon: import.meta.env.VITE_POLYGON_RPC || 'https://polygon.llamarpc.com',
    bnb: import.meta.env.VITE_BNB_RPC || 'https://bsc-dataseed.binance.org',
    bitcoin: 'https://blockstream.info/api', // Bitcoin uses REST API
    solana: 'https://api.mainnet-beta.solana.com',
  };
  return rpcUrls[chain];
}

/**
 * Get the derivation path for a chain
 */
export function getDerivationPath(chain: Chain, index: number = 0): string {
  const paths: Record<Chain, string> = {
    ethereum: `m/44'/60'/0'/0/${index}`,
    polygon: `m/44'/60'/0'/0/${index}`, // Same as Ethereum
    bnb: `m/44'/60'/0'/0/${index}`, // Same as Ethereum
    bitcoin: `m/44'/0'/0'/0/${index}`,
    solana: `m/44'/501'/0'/${index}`,
  };
  return paths[chain];
}

/**
 * Derive private key from mnemonic for a specific chain and index
 */
export function derivePrivateKey(mnemonic: string, chain: Chain, index: number = 0): string {
  const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
  const path = getDerivationPath(chain, index);
  const wallet = hdNode.derivePath(path);
  return wallet.privateKey;
}

/**
 * Get provider for EVM chains
 */
export function getEVMProvider(chain: Chain): ethers.JsonRpcProvider {
  const rpcUrls: Record<Chain, string> = {
    ethereum: import.meta.env.VITE_ETHEREUM_RPC || 'https://eth.llamarpc.com',
    polygon: import.meta.env.VITE_POLYGON_RPC || 'https://polygon.llamarpc.com',
    bnb: import.meta.env.VITE_BNB_RPC || 'https://bsc-dataseed.binance.org',
    bitcoin: '',
    solana: '',
  };
  
  if (!rpcUrls[chain]) {
    throw new Error(`Unsupported chain for EVM: ${chain}`);
  }
  
  return new ethers.JsonRpcProvider(rpcUrls[chain]);
}

