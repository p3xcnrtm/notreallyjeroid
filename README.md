# Vault - Decentralized Crypto Wallet

A beautiful, secure, and non-custodial cryptocurrency wallet web application with an old-money luxury aesthetic.

## Features

### Core Functionality
- **Non-Custodial Wallet**: Users fully own their private keys. Keys are stored locally and encrypted.
- **Multi-Chain Support**: Ethereum, Bitcoin, Solana, BNB Chain, and Polygon
- **Send & Receive**: Easy crypto transfers with QR code support
- **Real-Time APIs**: Live blockchain data, prices, and transactions
- **Swap Integration**: Real DEX aggregator integration (1inch) with price impact and slippage
- **Portfolio Tracker**: Real-time balance tracking with live price updates
- **Transaction History**: Complete transaction log with real blockchain data

### Security
- **Passkey Authentication**: WebAuthn/FIDO2 support for secure login
- **Email Verification**: Optional email verification for additional security
- **Local Encryption**: All sensitive data encrypted locally
- **Seed Phrase Management**: Secure generation, storage, and recovery
- **No KYC**: No identity verification required
- **No Tier Limits**: No restrictions based on wallet balance or transaction amounts

### User Experience
- **Old-Money Luxury Design**: Deep green, matte gold, black, and ivory color palette
- **Serif Typography**: Elegant Playfair Display font for headings
- **Smooth Animations**: Framer Motion powered transitions
- **Dark/Light Mode**: Luxury-themed appearance options
- **Responsive Design**: Works beautifully on all devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Ethers.js v6** for Ethereum/EVM chain interactions
- **BIP39** for mnemonic generation
- **CryptoJS** for encryption
- **Recharts** for portfolio charts
- **QRCode.react** for QR code generation

### Real-Time APIs
- **CoinGecko API** - Cryptocurrency prices
- **Public RPC Endpoints** - Blockchain data (Ethereum, Polygon, BNB)
- **Blockstream API** - Bitcoin blockchain data
- **Solana RPC** - Solana blockchain data
- **1inch API** - DEX aggregation for swaps

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Crypto-wallet
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/        # React context providers
├── screens/         # Main application screens
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
│   ├── api.ts       # Mock API endpoints (replace with real APIs)
│   ├── encryption.ts # Encryption utilities
│   ├── passkeys.ts  # WebAuthn/Passkey implementation
│   ├── storage.ts   # Local storage management
│   └── wallet.ts    # Wallet generation and utilities
├── App.tsx          # Main app component
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## API Configuration

### Real-Time APIs Used

The application uses real-time blockchain APIs:

1. **CoinGecko API** (Free, no key required)
   - Real-time cryptocurrency prices
   - 24h price changes
   - No API key needed for basic usage

2. **Public RPC Endpoints** (Free)
   - Ethereum: LlamaRPC (default)
   - Polygon: LlamaRPC (default)
   - BNB Chain: Binance public RPC (default)
   - Bitcoin: Blockstream API
   - Solana: Public RPC

3. **1inch DEX Aggregator** (Optional API key)
   - Real swap quotes
   - Price impact calculations
   - Get free API key at: https://portal.1inch.dev/

### Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

```bash
# Optional: Use your own RPC endpoints for better reliability
VITE_ETHEREUM_RPC=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_POLYGON_RPC=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_BNB_RPC=https://bsc-dataseed.binance.org

# Optional: 1inch API key for better swap quotes
VITE_ONEINCH_API_KEY=your_1inch_api_key_here
```

### Recommended RPC Providers

For production, consider using:
- **Alchemy**: https://www.alchemy.com/ (Free tier: 300M compute units/month)
- **Infura**: https://www.infura.io/ (Free tier: 100k requests/day)
- **QuickNode**: https://www.quicknode.com/ (Free tier available)
- **Ankr**: https://www.ankr.com/ (Free public RPCs)

## Security Notes

⚠️ **Important**: For production use:

1. **Use Your Own RPC Endpoints**: 
   - Sign up for Alchemy, Infura, or QuickNode
   - Add your API keys to `.env` file
   - This provides better reliability and rate limits

2. **Enhance Encryption**: The current encryption uses a simple key. In production:
   - Derive encryption keys from user passwords
   - Use hardware security modules where possible
   - Implement proper key derivation functions (PBKDF2, Argon2)

3. **Private Key Management**: 
   - Never store private keys in plain text
   - Consider using Web3 wallets (MetaMask, WalletConnect) for production
   - Implement proper HD wallet derivation

4. **Email Verification**: Replace placeholder with real service (SendGrid, AWS SES, Resend, etc.)

5. **Passkey Storage**: Store passkey credentials securely on the server if needed

6. **Rate Limiting**: Implement rate limiting for API calls to avoid hitting limits

## Supported Chains

- **Ethereum**: Mainnet and testnets
- **Bitcoin**: Mainnet and testnets
- **Solana**: Mainnet and devnet
- **BNB Chain**: Mainnet
- **Polygon**: Mainnet

## Features Roadmap

- [ ] Hardware wallet support (Ledger, Trezor)
- [ ] DeFi protocol integrations
- [ ] NFT support
- [ ] Multi-signature wallets
- [ ] Advanced portfolio analytics
- [ ] Price alerts
- [ ] Network status monitoring
- [ ] Watch-only wallet mode improvements

## Contributing

This is a demonstration project. For production use, please:
1. Conduct thorough security audits
2. Implement proper error handling
3. Add comprehensive testing
4. Follow security best practices
5. Replace all mock implementations

## License

This project is provided as-is for educational and demonstration purposes.

## Disclaimer

This software is provided "as is" without warranty. Use at your own risk. Always test thoroughly before using with real funds.

