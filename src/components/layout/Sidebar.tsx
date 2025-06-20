"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  Megaphone,
  Receipt,
  MessageSquare,
  Vote,
  Users,
  Settings,
  Building2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const params = useParams();
  const locale = params.locale as string;
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  const getBasePath = () => {
    if (user?.role === "super_admin") {
      return `/${locale}/admin`;
    }
    return `/${locale}/site/${user?.siteCode}`;
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: `${getBasePath()}/dashboard`,
      roles: ["super_admin", "site_admin", "resident"],
    },
    // Super Admin özel menüler
    {
      id: "sites",
      label: "Siteler",
      icon: Building2,
      href: `${getBasePath()}/sites`,
      roles: ["super_admin"],
    },
    {
      id: "all_users",
      label: "Tüm Kullanıcılar",
      icon: Users,
      href: `${getBasePath()}/users`,
      roles: ["super_admin"],
    },
    // Site Admin ve Resident menüler
    {
      id: "payments",
      label: "Aidat Takibi",
      icon: CreditCard,
      href: `${getBasePath()}/payments`,
      roles: ["site_admin", "resident"],
    },
    {
      id: "announcements",
      label: "Duyurular",
      icon: Megaphone,
      href: `${getBasePath()}/announcements`,
      roles: ["site_admin", "resident"],
    },
    {
      id: "expenses",
      label: "Giderler",
      icon: Receipt,
      href: `${getBasePath()}/expenses`,
      roles: ["site_admin", "resident"],
    },
    {
      id: "complaints",
      label: "Şikayetler",
      icon: MessageSquare,
      href: `${getBasePath()}/complaints`,
      roles: ["site_admin", "resident"],
    },
    {
      id: "voting",
      label: "Oylamalar",
      icon: Vote,
      href: `${getBasePath()}/voting`,
      roles: ["site_admin", "resident"],
    },
    {
      id: "site_users",
      label: "Site Kullanıcıları",
      icon: Users,
      href: `${getBasePath()}/users`,
      roles: ["site_admin"],
    },
    {
      id: "settings",
      label: "Ayarlar",
      icon: Settings,
      href: `${getBasePath()}/settings`,
      roles: ["super_admin", "site_admin"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-secondary-200 shadow-soft transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-secondary-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-secondary-900">
                  Apartman Yönetim
                </h2>
                <p className="text-xs text-secondary-500">v1.0.0</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-50 text-primary-700 border border-primary-200"
                      : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-secondary-200">
            <div className="text-xs text-secondary-500 text-center">
              © 2025 Yönetim App
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
