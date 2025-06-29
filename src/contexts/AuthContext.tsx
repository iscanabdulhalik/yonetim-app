"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { AuthUser, LoginRequest, RegisterRequest } from "@/types/auth";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, siteCode?: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterRequest) => Promise<void>;
  updateUser: (userData: Partial<AuthUser>) => void;
  refreshToken: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Token yenileme fonksiyonu
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        return true;
      } else {
        // Token geçersiz, temizle
        localStorage.removeItem("token");
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      localStorage.removeItem("token");
      setUser(null);
      return false;
    }
  }, []);

  // Otomatik token kontrolü
  useEffect(() => {
    const checkAuthPeriodically = () => {
      const token = localStorage.getItem("token");
      if (token && user) {
        // Token'ı decode et ve süresini kontrol et
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Date.now() / 1000;

          // Token 5 dakika içinde sona erecekse yenile
          if (payload.exp - currentTime < 300) {
            refreshToken();
          }
        } catch (error) {
          console.error("Token decode error:", error);
        }
      }
    };

    // İlk kontrol
    if (user) {
      checkAuthPeriodically();

      // Her 5 dakikada bir kontrol et
      const interval = setInterval(checkAuthPeriodically, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [user, refreshToken]);

  // Sayfa yüklendiğinde auth kontrolü
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const isValid = await refreshToken();
      if (!isValid) {
        console.log("Token geçersiz, giriş sayfasına yönlendiriliyor...");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, siteCode?: string) => {
    const loginData: LoginRequest = { email, password };
    if (siteCode) {
      loginData.siteCode = siteCode;
    }

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Giriş yapılamadı");
    }

    const data = await response.json();

    // TOKEN'I SAKLA
    localStorage.setItem("token", data.token);
    setUser(data.user);

    // Redirect based on role
    if (data.user.role === "super_admin") {
      router.push("/tr/admin/dashboard");
    } else {
      const siteCode = data.user.siteCode;
      router.push(`/tr/site/${siteCode}/dashboard`);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Kayıt yapılamadı");
      }

      // Token'ı localStorage'a kaydet
      localStorage.setItem("token", data.token);
      setUser(data.user);

      // Kayıt sonrası site sayfasına yönlendir
      const siteCode = data.user.siteCode;
      router.push(`/tr/site/${siteCode}/dashboard`);

      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("rememberedEmail");
    setUser(null);
    router.push("/tr/auth/login");
  }, [router]);

  const updateUser = useCallback((userData: Partial<AuthUser>) => {
    setUser((prev: AuthUser | null) =>
      prev ? { ...prev, ...userData } : null
    );
  }, []);

  // Visibility change olayını dinle (sayfa gizlendiğinde/göründüğünde)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Sayfa tekrar göründüğünde token'ı kontrol et
        refreshToken();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, refreshToken]);

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateUser,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
