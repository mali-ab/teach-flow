import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type SubscriptionTier = "free" | "pro";

export type AuthUser = {
  id: number | string;
  name: string;
  email: string;
  subscription: SubscriptionTier;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateSubscription: (tier: SubscriptionTier) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = window.localStorage.getItem("user");
      return raw ? JSON.parse(raw) as AuthUser : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });

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



  const updateSubscription = (tier: SubscriptionTier) => {
    if (user) {
      const updatedUser: AuthUser = { ...user, subscription: tier };
      setUser(updatedUser);
      window.localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextValue = useMemo(() => {
    return {
      user,
      token,
      isAuthenticated: !!token,
      login: (u, t) => {
        setUser(u);
        setToken(t);
        window.localStorage.setItem(TOKEN_KEY, t);
        window.localStorage.setItem("user", JSON.stringify(u));
      },
      logout: () => {
        setUser(null);
        setToken(null);
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem("user");
      },
      updateSubscription,
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

