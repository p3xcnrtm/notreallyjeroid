import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'vault-encryption-key'; // In production, derive from user password

export function encryptData(data: string, password?: string): string {
  const key = password || ENCRYPTION_KEY;
  return CryptoJS.AES.encrypt(data, key).toString();
}

export function decryptData(encryptedData: string, password?: string): string {
  const key = password || ENCRYPTION_KEY;
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString();
}

export function generateSecureRandom(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

