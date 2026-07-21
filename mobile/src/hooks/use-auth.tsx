import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { firebaseAuth } from '@/firebase/config';

type AuthContextValue = {
  user: FirebaseUser | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue>({ user: null, isLoading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={{ user, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
