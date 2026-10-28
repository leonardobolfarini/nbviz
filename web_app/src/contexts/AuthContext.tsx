import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type AnalysesStatus = "pending" | "finished" | "processing" | "error";

type VennRow = {
  combination: string;
  count: number;
};

type Analyses = {
  id: string;
  title: string;
  used_bases: string[];
  status: AnalysesStatus;
  created_at: string;
  expires_at: string;
  download_url: string | null;
  removed_url: string | null;
  venn: VennRow[] | null;
};

type User = {
  id: string;
  email: string;
  analyses: Analyses[];
};

type AuthContextData = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshUser() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/me");

      if (!response.ok) {
        setUser(null);
        return;
      }

      setUser(await response.json());
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  async function deleteAccount() {
    const response = await fetch("/api/delete", { method: "DELETE" });

    if (!response.ok) {
      throw new Error("Não foi possível excluir a conta.");
    }

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        refreshUser,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
