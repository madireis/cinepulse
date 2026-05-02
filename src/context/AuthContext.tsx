import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, Auth } from 'firebase/auth';
import { getFirebase } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInstance, setAuthInstance] = useState<Auth | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const setupAuth = async () => {
      const { auth } = await getFirebase();
      
      if (!auth) {
        console.warn("Auth not available.");
        setLoading(false);
        return;
      }

      setAuthInstance(auth);
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
    };

    setupAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signIn = async () => {
    if (!authInstance) return;
    const provider = new GoogleAuthProvider();
    await signInWithPopup(authInstance, provider);
  };

  const logout = async () => {
    if (!authInstance) return;
    await signOut(authInstance);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logout }}>
      {loading ? (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary" />
        </div>
      ) : (
        children
      )}
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
