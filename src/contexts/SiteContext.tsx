"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

interface Site {
  _id: string;
  siteCode: string;
  name: string;
  address: string;
  logo?: string;
  phone?: string;
  email?: string;
  buildingCount: number;
  totalUnits: number;
  monthlyFee: number;
  currency: "TRY" | "USD" | "EUR";
  isActive: boolean;
}

interface SiteContextType {
  site: Site | null;
  loading: boolean;
  refreshSite: () => Promise<void>;
  updateSite: (siteData: Partial<Site>) => Promise<void>;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.siteId) {
      fetchSite();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSite = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/sites/${user?.siteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSite(data.site);
      }
    } catch (error) {
      console.error("Failed to fetch site:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSite = async () => {
    await fetchSite();
  };

  const updateSite = async (siteData: Partial<Site>) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/sites/${user?.siteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(siteData),
      });

      if (response.ok) {
        const data = await response.json();
        setSite(data.site);
      } else {
        throw new Error("Failed to update site");
      }
    } catch (error) {
      console.error("Failed to update site:", error);
      throw error;
    }
  };

  const value = {
    site,
    loading,
    refreshSite,
    updateSite,
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error("useSite must be used within a SiteProvider");
  }
  return context;
}
