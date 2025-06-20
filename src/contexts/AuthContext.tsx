"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        localStorage.removeItem("token");
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
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();
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
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    setUser(data.user);

    // Kayıt sonrası site sayfasına yönlendir
    const siteCode = data.user.siteCode;
    router.push(`/tr/site/${siteCode}/dashboard`);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/tr/auth/login");
  };

  const updateUser = (userData: Partial<AuthUser>) => {
    setUser((prev: AuthUser | null) =>
      prev ? { ...prev, ...userData } : null
    );
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateUser,
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
