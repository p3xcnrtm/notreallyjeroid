# Quick Start Guide

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to `http://localhost:5173`

## First Time Setup

1. **Splash Screen**: You'll see the Vault logo and branding
2. **Onboarding**: 
   - Enter your email address
   - Optionally register/login with passkey (if supported)
3. **Seed Phrase Creation**:
   - Your 24-word recovery phrase will be generated
   - **IMPORTANT**: Save this phrase securely offline
   - Confirm you've saved it
4. **Seed Phrase Verification**:
   - Select words in the correct order to verify
5. **Dashboard**: You're ready to use Vault!

## Creating Your First Wallet

1. Navigate to **Wallets** from the sidebar
2. Click **Add Wallet**
3. Enter a name (e.g., "My Ethereum Wallet")
4. Select a blockchain (Ethereum, Bitcoin, Solana, BNB Chain, or Polygon)
5. Click **Create**

## Sending Crypto

1. Go to **Send** from the sidebar
2. Enter recipient address (or scan QR code)
3. Enter amount
4. Review gas fees and transaction summary
5. Click **Send Transaction**

## Receiving Crypto

1. Go to **Receive** from the sidebar
2. Share your wallet address or QR code
3. Wait for incoming transactions

## Swapping Tokens

1. Go to **Swap** from the sidebar
2. Select tokens to swap
3. Enter amount
4. Review price impact and slippage
5. Click **Swap Tokens**

## Features

- **No KYC**: Use without identity verification
- **No Limits**: No tier restrictions on balances or transactions
- **Multi-Chain**: Support for 5 major blockchains
- **Secure**: Local encryption, passkey support, seed phrase recovery
- **Beautiful UI**: Old-money luxury design with dark/light mode

## Security Notes

⚠️ **This is a demo application**. For production:
- Replace all mock APIs in `src/utils/api.ts`
- Implement proper blockchain RPC connections
- Add comprehensive error handling
- Conduct security audits
- Test thoroughly before using with real funds

## Troubleshooting

**Issue**: Passkeys not working
- **Solution**: Ensure you're using a modern browser with WebAuthn support (Chrome, Safari, Edge)

**Issue**: Seed phrase not generating
- **Solution**: Check browser console for errors. Ensure crypto APIs are available.

**Issue**: Wallets not loading
- **Solution**: Clear browser localStorage and restart the app

## Next Steps

- Explore all features in the Settings page
- Create multiple wallets for different chains
- Review transaction history
- Customize appearance (dark/light mode)

Enjoy using Vault! 🏦✨

