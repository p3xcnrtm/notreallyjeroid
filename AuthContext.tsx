import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { getUser, saveUser, isEmailVerified, setEmailVerified } from '@/storage';
import { createPasskey, authenticateWithPasskey, isPasskeySupported } from '@/passkeys';
import { sendVerificationEmail, verifyEmail } from '@/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  passkeySupported: boolean;
  login: (email: string) => Promise<void>;
  loginWithPasskey: () => Promise<void>;
  register: (email: string) => Promise<void>;
  registerWithPasskey: (email: string) => Promise<void>;
  sendEmailVerification: (email: string) => Promise<void>;
  verifyEmailCode: (email: string, code: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [emailVerified, setEmailVerifiedState] = useState(false);

  useEffect(() => {
    const loadedUser = getUser();
    const verified = isEmailVerified();
    setUser(loadedUser);
    setEmailVerifiedState(verified);
  }, []);

  const login = async (email: string) => {
    // For demo purposes, create user if doesn't exist
    const existingUser = getUser();
    if (existingUser && existingUser.email === email) {
      setUser(existingUser);
      return;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      createdAt: Date.now(),
      lastLogin: Date.now(),
    };
    saveUser(newUser);
    setUser(newUser);
  };

  const loginWithPasskey = async () => {
    if (!isPasskeySupported()) {
      throw new Error('Passkeys are not supported on this device');
    }
    await authenticateWithPasskey();
    const existingUser = getUser();
    if (existingUser) {
      const updatedUser = { ...existingUser, lastLogin: Date.now() };
      saveUser(updatedUser);
      setUser(updatedUser);
    }
  };

  const register = async (email: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      createdAt: Date.now(),
      lastLogin: Date.now(),
    };
    saveUser(newUser);
    setUser(newUser);
  };

  const registerWithPasskey = async (email: string) => {
    if (!isPasskeySupported()) {
      throw new Error('Passkeys are not supported on this device');
    }
    const credential = await createPasskey(email);
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      passkeyId: credential.id,
      createdAt: Date.now(),
      lastLogin: Date.now(),
    };
    saveUser(newUser);
    setUser(newUser);
  };

  const sendEmailVerification = async (email: string) => {
    await sendVerificationEmail(email);
  };

  const verifyEmailCode = async (email: string, code: string): Promise<boolean> => {
    const verified = await verifyEmail(email);
    if (verified) {
      setEmailVerifiedState(true);
      setEmailVerified(true);
    }
    return verified;
  };

  const logout = () => {
    setUser(null);
    setEmailVerifiedState(false);
    setEmailVerified(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isEmailVerified: emailVerified,
        passkeySupported: isPasskeySupported(),
        login,
        loginWithPasskey,
        register,
        registerWithPasskey,
        sendEmailVerification,
        verifyEmailCode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

