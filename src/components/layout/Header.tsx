"use client";

import { useState, useEffect } from "react";
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

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  isRead: boolean;
  createdAt: string;
}

export function Header({
  onMobileMenuToggle,
  showMobileMenuButton = true,
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, logout } = useAuth();
  const { site } = useSite();
  const router = useRouter();
  const pathname = usePathname();

  // Dummy notifications - gerçek uygulamada API'den gelecek
  useEffect(() => {
    setNotifications([
      {
        id: "1",
        title: "Yeni Duyuru",
        message: "Asansör bakımı hakkında duyuru yayınlandı",
        type: "info",
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: "2",
        title: "Ödeme Hatırlatması",
        message: "Aylık aidat ödemeniz yaklaşıyor",
        type: "warning",
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: "3",
        title: "Şikayet Yanıtlandı",
        message: "Gürültü şikayetiniz yanıtlandı",
        type: "success",
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ]);
  }, []);

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

  const getCurrentLocale = () => {
    const pathSegments = pathname.split("/");
    return pathSegments[1] || "tr";
  };

  const changeLanguage = (locale: string) => {
    const currentLocale = getCurrentLocale();
    const newPath = pathname.replace(`/${currentLocale}`, `/${locale}`);
    setShowLanguageMenu(false);
    router.push(newPath);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const currentLocale = getCurrentLocale();

  return (
    <>
      {/* Click outside handlers */}
      {(showUserMenu || showLanguageMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowUserMenu(false);
            setShowLanguageMenu(false);
            setShowNotifications(false);
          }}
        />
      )}

      <header className="bg-white border-b border-secondary-200 shadow-soft relative z-40">
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
                  <Globe className="h-4 w-4 mr-1" />
                  <span className="text-xs uppercase">{currentLocale}</span>
                </Button>

                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-medium border border-secondary-200 py-1 z-50">
                    <button
                      onClick={() => changeLanguage("tr")}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-secondary-50 ${
                        currentLocale === "tr"
                          ? "text-primary-600 bg-primary-50 font-medium"
                          : "text-secondary-700"
                      }`}
                    >
                      🇹🇷 Türkçe
                    </button>
                    <button
                      onClick={() => changeLanguage("en")}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-secondary-50 ${
                        currentLocale === "en"
                          ? "text-primary-600 bg-primary-50 font-medium"
                          : "text-secondary-700"
                      }`}
                    >
                      🇺🇸 English
                    </button>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 rounded-full text-xs text-white flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-medium border border-secondary-200 py-2 z-50 max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-secondary-100">
                      <h3 className="font-medium text-secondary-900">
                        Bildirimler
                      </h3>
                      {unreadCount > 0 && (
                        <p className="text-xs text-secondary-500">
                          {unreadCount} okunmamış
                        </p>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-secondary-500 text-sm">
                        Henüz bildirim yok
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 border-b border-secondary-50 hover:bg-secondary-25 cursor-pointer ${
                              !notification.isRead ? "bg-primary-25" : ""
                            }`}
                            onClick={() =>
                              markNotificationAsRead(notification.id)
                            }
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-secondary-900">
                                  {notification.title}
                                </h4>
                                <p className="text-xs text-secondary-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-secondary-400 mt-1">
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleString("tr-TR")}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-primary-500 rounded-full ml-2 mt-1"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="px-4 py-2 border-t border-secondary-100">
                      <button className="text-sm text-primary-600 hover:text-primary-700">
                        Tümünü görüntüle
                      </button>
                    </div>
                  </div>
                )}
              </div>

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
                      <p className="text-xs text-secondary-500">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      href={`/${currentLocale}/profile`}
                      className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profil
                    </Link>

                    {user?.role !== "resident" && (
                      <Link
                        href={`/${currentLocale}/${
                          user?.role === "super_admin"
                            ? "admin"
                            : `site/${user?.siteCode}`
                        }/settings`}
                        className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Ayarlar
                      </Link>
                    )}

                    <hr className="my-1" />

                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
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
    </>
  );
}
