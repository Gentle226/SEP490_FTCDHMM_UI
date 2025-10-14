'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { User } from '@/modules/auth/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user from server-side API that can read HTTP-only cookies
    const getUserFromServer = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        console.error('AuthContext: User data from server:', data);

        if (data.user && data.user.id) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getUserFromServer();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
