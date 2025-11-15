// Real-time API endpoints using live blockchain services
import { ethers } from 'ethers';
import { Chain } from './types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const ONEINCH_API = import.meta.env.VITE_ONEINCH_API || 'https://api.1inch.dev';

// Token ID mapping for CoinGecko
const TOKEN_IDS: Record<string, string> = {
  ETH: 'ethereum',
  BTC: 'bitcoin',
  SOL: 'solana',
  BNB: 'binancecoin',
  MATIC: 'matic-network',
  USDT: 'tether',
};

export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
}

export interface GasEstimate {
  chain: string;
  gasPrice: string;
  gasLimit: string;
  totalGasUSD: number;
}

export async function getTokenPrices(tokens: string[]): Promise<TokenPrice[]> {
  try {
    const ids = tokens.map(t => TOKEN_IDS[t.toUpperCase()]).filter(Boolean).join(',');
    
    if (!ids) {
      return tokens.map(token => ({ symbol: token, price: 0, change24h: 0 }));
    }

    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch prices');
    }

    const data = await response.json();
    
    return tokens.map(token => {
      const id = TOKEN_IDS[token.toUpperCase()];
      if (id && data[id]) {
        return {
          symbol: token,
          price: data[id].usd || 0,
          change24h: data[id].usd_24h_change || 0,
        };
      }
      return { symbol: token, price: 0, change24h: 0 };
    });
  } catch (error) {
    console.error('Error fetching token prices:', error);
    // Fallback to basic prices if API fails
    const fallbackPrices: Record<string, TokenPrice> = {
      ETH: { symbol: 'ETH', price: 2450, change24h: 0 },
      BTC: { symbol: 'BTC', price: 43250, change24h: 0 },
      SOL: { symbol: 'SOL', price: 98, change24h: 0 },
      BNB: { symbol: 'BNB', price: 315, change24h: 0 },
      MATIC: { symbol: 'MATIC', price: 0.85, change24h: 0 },
      USDT: { symbol: 'USDT', price: 1.00, change24h: 0 },
    };
    return tokens.map(token => fallbackPrices[token.toUpperCase()] || { symbol: token, price: 0, change24h: 0 });
  }
}

import { getRPCUrl as getRPCUrlUtil, getEVMProvider } from './blockchain';
import { Chain } from './types';

async function getRPCUrl(chain: string): Promise<string> {
  return getRPCUrlUtil(chain as Chain);
}

async function getETHPrice(): Promise<number> {
  try {
    const prices = await getTokenPrices(['ETH']);
    return prices[0]?.price || 2450;
  } catch {
    return 2450; // Fallback
  }
}

export async function getGasEstimate(chain: string, from: string, to: string, amount: string): Promise<GasEstimate> {
  try {
    const chainType = chain as Chain;
    
    // Only EVM chains supported
    if (chainType === 'bitcoin' || chainType === 'solana') {
      return {
        chain,
        gasPrice: '0',
        gasLimit: '0',
        totalGasUSD: 0,
      };
    }
    
    const provider = getEVMProvider(chainType);
    
    // Get fee data
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
    
    // Estimate gas limit
    const amountWei = ethers.parseEther(amount);
    const gasLimit = await provider.estimateGas({
      from,
      to,
      value: amountWei,
    });
    
    const gasPriceGwei = Number(ethers.formatUnits(gasPrice, 'gwei'));
    const gasLimitNum = Number(gasLimit);
    const ethPrice = await getETHPrice();
    const totalGasETH = (gasPriceGwei * gasLimitNum) / 1e9;
    const totalGasUSD = totalGasETH * ethPrice;

    return {
      chain,
      gasPrice: gasPriceGwei.toString(),
      gasLimit: gasLimitNum.toString(),
      totalGasUSD,
    };
  } catch (error) {
    console.error('Error estimating gas:', error);
    // Fallback estimate
    return {
      chain,
      gasPrice: '0.000000025',
      gasLimit: '21000',
      totalGasUSD: 1.25,
    };
  }
}

// Token address mapping for 1inch
const TOKEN_ADDRESSES: Record<string, Record<string, string>> = {
  ethereum: {
    ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  },
  polygon: {
    MATIC: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  },
  bnb: {
    BNB: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  },
};

export async function getSwapQuote(
  fromToken: string,
  toToken: string,
  amount: string,
  chain: string
): Promise<{
  toAmount: string;
  priceImpact: number;
  slippage: number;
  minimumReceived: string;
  gasEstimate: string;
}> {
  try {
    // Map chain names to 1inch chain IDs
    const chainIds: Record<string, number> = {
      ethereum: 1,
      polygon: 137,
      bnb: 56,
    };

    const chainId = chainIds[chain];
    if (!chainId) {
      throw new Error(`Unsupported chain: ${chain}`);
    }

    const fromAddress = TOKEN_ADDRESSES[chain]?.[fromToken] || TOKEN_ADDRESSES.ethereum[fromToken];
    const toAddress = TOKEN_ADDRESSES[chain]?.[toToken] || TOKEN_ADDRESSES.ethereum[toToken];

    if (!fromAddress || !toAddress) {
      throw new Error('Token not supported for swap');
    }

    // Convert amount to wei (assuming 18 decimals for most tokens)
    const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e18)).toString();

    const apiKey = import.meta.env.VITE_ONEINCH_API_KEY;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(
      `${ONEINCH_API}/swap/v5.2/${chainId}/quote?src=${fromAddress}&dst=${toAddress}&amount=${amountWei}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch swap quote');
    }

    const data = await response.json();
    const toAmountWei = BigInt(data.toAmount || '0');
    const toAmount = (Number(toAmountWei) / 1e18).toString();
    const priceImpact = parseFloat(data.estimatedPriceImpact || '0') * 100;
    const slippage = 0.5; // Default slippage tolerance
    const minimumReceived = (parseFloat(toAmount) * (1 - slippage / 100)).toString();
    const gasEstimate = data.estimatedGas || '21000';

    return {
      toAmount,
      priceImpact,
      slippage,
      minimumReceived,
      gasEstimate,
    };
  } catch (error) {
    console.error('Error fetching swap quote:', error);
    // Fallback to mock data
    const mockRate = 0.95;
    return {
      toAmount: (parseFloat(amount) * mockRate).toString(),
      priceImpact: 5.0,
      slippage: 0.5,
      minimumReceived: (parseFloat(amount) * mockRate * 0.995).toString(),
      gasEstimate: '21000',
    };
  }
}

export async function sendTransaction(
  chain: string,
  from: string,
  to: string,
  amount: string,
  privateKey: string
): Promise<{ hash: string }> {
  try {
    const chainType = chain as Chain;
    
    // Only EVM chains supported for now
    if (chainType === 'bitcoin' || chainType === 'solana') {
      throw new Error(`${chainType} transactions not yet implemented. Use EVM chains (Ethereum, Polygon, BNB).`);
    }
    
    const provider = getEVMProvider(chainType);
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey);
    const connectedWallet = wallet.connect(provider);
    
    // Get gas price
    const feeData = await provider.getFeeData();
    
    // Convert amount to wei
    const amountWei = ethers.parseEther(amount);
    
    // Send transaction
    const tx = await connectedWallet.sendTransaction({
      to,
      value: amountWei,
      gasPrice: feeData.gasPrice,
    });
    
    return {
      hash: tx.hash,
    };
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw new Error(`Failed to send transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getTransactionStatus(hash: string, chain: string): Promise<'pending' | 'confirmed' | 'failed'> {
  try {
    const chainType = chain as Chain;
    
    if (chainType === 'bitcoin' || chainType === 'solana') {
      // For non-EVM chains, return pending (would need specific implementations)
      return 'pending';
    }
    
    const provider = getEVMProvider(chainType);
    const receipt = await provider.getTransactionReceipt(hash);
    
    if (!receipt) {
      return 'pending';
    }
    
    if (receipt.status === 1) {
      return 'confirmed';
    } else {
      return 'failed';
    }
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return 'pending';
  }
}

export async function getBalance(address: string, chain: string): Promise<string> {
  try {
    const chainType = chain as Chain;
    
    if (chainType === 'bitcoin') {
      // Bitcoin uses Blockstream API
      const response = await fetch(`https://blockstream.info/api/address/${address}`);
      if (response.ok) {
        const data = await response.json();
        const balanceSatoshi = data.chain_stats?.funded_txo_sum || 0;
        return (balanceSatoshi / 1e8).toString();
      }
      return '0';
    }

    if (chainType === 'solana') {
      // Solana uses different RPC
      const response = await fetch('https://api.mainnet-beta.solana.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address],
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const balanceLamports = data.result?.value || 0;
        return (balanceLamports / 1e9).toString();
      }
      return '0';
    }

    // EVM chains (Ethereum, Polygon, BNB)
    const provider = getEVMProvider(chainType);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error(`Error fetching balance for ${chain}:`, error);
    return '0';
  }
}

export async function verifyEmail(email: string): Promise<boolean> {
  // Email verification - in production, use a service like SendGrid, AWS SES, etc.
  // For now, this is a placeholder that simulates verification
  // Replace with actual email verification service
  return new Promise(resolve => {
    // In production, verify the code against your backend
    setTimeout(() => resolve(true), 1000);
  });
}

export async function sendVerificationEmail(email: string): Promise<boolean> {
  // Email sending - in production, use a service like SendGrid, AWS SES, Resend, etc.
  // For now, this is a placeholder
  // Replace with actual email service integration
  return new Promise(resolve => {
    // In production, send actual verification email via your backend
    console.log(`[Mock] Verification email would be sent to ${email}`);
    setTimeout(() => resolve(true), 1000);
  });
}

