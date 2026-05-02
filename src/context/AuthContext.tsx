// Auth has been removed from CinePulse.
// This stub exists to prevent import errors from any legacy references.
import React, { createContext, useContext } from 'react';

interface AuthContextType {
  user: null;
  loading: false;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  signIn: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  return useContext(AuthContext);
}
