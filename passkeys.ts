// Passkey/WebAuthn implementation for secure authentication

export async function createPasskey(email: string): Promise<PublicKeyCredential> {
  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge: crypto.getRandomValues(new Uint8Array(32)),
    rp: {
      name: 'Vault Wallet',
      id: window.location.hostname,
    },
    user: {
      id: new TextEncoder().encode(email),
      name: email,
      displayName: email,
    },
    pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
    },
    timeout: 60000,
    attestation: 'direct',
  };

  try {
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    }) as PublicKeyCredential;

    return credential;
  } catch (error) {
    console.error('Passkey creation failed:', error);
    throw error;
  }
}

export async function authenticateWithPasskey(): Promise<PublicKeyCredential> {
  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
    challenge: crypto.getRandomValues(new Uint8Array(32)),
    allowCredentials: [],
    userVerification: 'required',
    timeout: 60000,
  };

  try {
    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    }) as PublicKeyCredential;

    return assertion;
  } catch (error) {
    console.error('Passkey authentication failed:', error);
    throw error;
  }
}

export function isPasskeySupported(): boolean {
  return typeof window.PublicKeyCredential !== 'undefined' &&
         typeof navigator.credentials !== 'undefined' &&
         typeof navigator.credentials.create !== 'undefined';
}

export function isBiometricSupported(): boolean {
  return isPasskeySupported();
}

