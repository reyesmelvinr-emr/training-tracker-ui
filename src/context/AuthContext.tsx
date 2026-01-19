import { createContext, useContext, useState, ReactNode, useMemo } from 'react';

export interface UserInfo {
  sub: string;
  email: string;
  role: 'Admin' | 'Employee';
}

interface AuthContextType {
  user: UserInfo | null;
  login: (user: UserInfo) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>({
    sub: 'demo-user',
    email: 'demo@company.com',
    role: 'Admin'
  });

  const value = useMemo(() => ({
    user,
    login: (u: UserInfo) => setUser(u),
    logout: () => setUser(null)
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
