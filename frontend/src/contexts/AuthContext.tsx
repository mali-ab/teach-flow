import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Role = "student" | "teacher" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);

      const storedUserRaw = window.localStorage.getItem("user");
      if (storedUserRaw) {
        try {
          const parsed = JSON.parse(storedUserRaw) as AuthUser;
          setUser(parsed);
        } catch {
          // ignore
        }
      }
    }
  }, []);



  const value: AuthContextValue = useMemo(() => {
    return {
      user,
      token,
      isAuthenticated: !!token,
      login: (u, t) => {
        setUser(u);
        setToken(t);
        window.localStorage.setItem(TOKEN_KEY, t);
      },
      logout: () => {
        setUser(null);
        setToken(null);
        window.localStorage.removeItem(TOKEN_KEY);
      },
    };
  }, [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

