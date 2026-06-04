import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

// ============================================================
// TIPOS
// ============================================================

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
  role?: string | null;
  level?: string | null;
  group?: string | null;
  status: string;
}

interface AuthContextData {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (token: string, user: AuthUser, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (updatedFields: Partial<AuthUser>) => void;
}

// ============================================================
// CONTEXT
// ============================================================

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// ============================================================
// PROVIDER
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // Começa como true para bloquear o render antes de ler o localStorage
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Na montagem, lê o estado salvo no localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('@iires:token');
      const storedUser = localStorage.getItem('@iires:user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // Se o JSON estiver corrompido, limpa tudo
      localStorage.removeItem('@iires:token');
      localStorage.removeItem('@iires:user');
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  // Chamado após login ou signup bem-sucedido
  const login = useCallback((newToken: string, newUser: AuthUser, refreshToken?: string) => {
    localStorage.setItem('@iires:token', newToken);
    localStorage.setItem('@iires:user', JSON.stringify(newUser));
    if (refreshToken) localStorage.setItem('@iires:refreshToken', refreshToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  // Chamado ao sair do sistema
  const logout = useCallback(() => {
    localStorage.removeItem('@iires:token');
    localStorage.removeItem('@iires:user');
    localStorage.removeItem('@iires:refreshToken');
    setToken(null);
    setUser(null);
  }, []);

  // Chamado para atualizar dados do usuário sem precisar re-logar
  const updateUser = useCallback((updatedFields: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem('@iires:user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoadingAuth,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// HOOK de consumo (tipado e com guard)
// ============================================================

export function useAuthContext(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext deve ser usado dentro de <AuthProvider>');
  }
  return context;
}
