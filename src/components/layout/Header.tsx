"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSite } from "@/contexts/SiteContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Building2,
  Bell,
  User,
  LogOut,
  Settings,
  Menu,
  X,
  Globe,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  showMobileMenuButton?: boolean;
}

export function Header({
  onMobileMenuToggle,
  showMobileMenuButton = true,
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const { user, logout } = useAuth();
  const { site } = useSite();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Süper Admin";
      case "site_admin":
        return "Yönetici";
      case "resident":
        return "Sakin";
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "danger" as const;
      case "site_admin":
        return "warning" as const;
      case "resident":
        return "success" as const;
      default:
        return "default" as const;
    }
  };

  const changeLanguage = (locale: string) => {
    const newPath = pathname.replace(/^\/[a-z]{2}/, `/${locale}`);
    router.push(newPath);
    setShowLanguageMenu(false);
  };

  return (
    <header className="bg-white border-b border-secondary-200 shadow-soft">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            {showMobileMenuButton && (
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={onMobileMenuToggle}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-secondary-900">
                  {site?.name || "Apartman Yönetim"}
                </h1>
                {site?.siteCode && (
                  <p className="text-xs text-secondary-500">
                    Kod: {site.siteCode}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              >
                <Globe className="h-4 w-4" />
              </Button>

              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-medium border border-secondary-200 py-1 z-50">
                  <button
                    onClick={() => changeLanguage("tr")}
                    className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                  >
                    🇹🇷 Türkçe
                  </button>
                  <button
                    onClick={() => changeLanguage("en")}
                    className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                  >
                    🇺🇸 English
                  </button>
                </div>
              )}
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
            </Button>

            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-secondary-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <Badge
                    variant={getRoleBadgeVariant(user?.role || "")}
                    size="sm"
                  >
                    {getRoleLabel(user?.role || "")}
                  </Badge>
                </div>
              </Button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-medium border border-secondary-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-secondary-100">
                    <p className="text-sm font-medium text-secondary-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-secondary-500">{user?.email}</p>
                  </div>

                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profil
                  </Link>

                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Ayarlar
                  </Link>

                  <hr className="my-1" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-danger-600 hover:bg-danger-50"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
