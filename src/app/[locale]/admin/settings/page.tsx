"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Settings,
  User,
  Database,
  Shield,
  Globe,
  Bell,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [systemSettings, setSystemSettings] = useState({
    appName: "Apartman Yönetim Sistemi",
    appVersion: "1.0.0",
    maintenanceMode: false,
    registrationEnabled: true,
    maxSitesPerAdmin: 10,
  });

  const [personalSettings, setPersonalSettings] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    language: "tr",
    notifications: true,
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "super_admin")) {
      router.push("/tr/auth/login");
    }
  }, [user, loading, router]);

  const [systemInfo, setSystemInfo] = useState({
    nodeVersion: "v18.17.0",
    environment: "development",
    uptime: "24h 15m",
    platform: "unknown",
  });

  useEffect(() => {
    if (user) {
      setPersonalSettings({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        language: "tr",
        notifications: true,
      });

      // Fetch system info
      fetchSystemInfo();
    }
  }, [user]);

  const fetchSystemInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/system-info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSystemInfo({
          nodeVersion: data.systemInfo.nodeVersion,
          environment: data.systemInfo.environment,
          uptime: data.systemInfo.uptime.formatted,
          platform: data.systemInfo.platform,
        });
      }
    } catch (error) {
      console.error("Error fetching system info:", error);
      // Keep default values if fetch fails
    }
  };

  const handlePersonalSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/users/${user?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: personalSettings.firstName,
          lastName: personalSettings.lastName,
          phone: personalSettings.phone,
        }),
      });

      if (response.ok) {
        toast.success("Kişisel ayarlar güncellendi!");
      } else {
        toast.error("Ayarlar güncellenemedi");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Bir hata oluştu");
    }
  };

  const handleSystemSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Sistem ayarları güncellendi!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || user.role !== "super_admin") {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sistem Ayarları</h1>
        <p className="text-gray-600">Sistem ve kişisel ayarlarınızı yönetin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kişisel Ayarlar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Kişisel Ayarlar</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePersonalSettingsUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Ad"
                  value={personalSettings.firstName}
                  onChange={(e) =>
                    setPersonalSettings((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  required
                />
                <Input
                  label="Soyad"
                  value={personalSettings.lastName}
                  onChange={(e) =>
                    setPersonalSettings((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <Input
                label="E-posta"
                type="email"
                value={personalSettings.email}
                disabled
                helperText="E-posta adresi değiştirilemez"
              />

              <Input
                label="Telefon"
                value={personalSettings.phone}
                onChange={(e) =>
                  setPersonalSettings((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
              />

              <div className="flex justify-end">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Sistem Ayarları */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Sistem Ayarları</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSystemSettingsUpdate} className="space-y-4">
              <Input
                label="Uygulama Adı"
                value={systemSettings.appName}
                onChange={(e) =>
                  setSystemSettings((prev) => ({
                    ...prev,
                    appName: e.target.value,
                  }))
                }
              />

              <Input
                label="Versiyon"
                value={systemSettings.appVersion}
                disabled
                helperText="Sistem versiyonu"
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Bakım Modu
                    </label>
                    <p className="text-sm text-gray-500">
                      Aktif olduğunda sadece admin erişebilir
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemSettings.maintenanceMode}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        maintenanceMode: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Kayıt Açık
                    </label>
                    <p className="text-sm text-gray-500">
                      Yeni kullanıcı kayıtlarına izin ver
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemSettings.registrationEnabled}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        registrationEnabled: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Sistem Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Sistem Bilgileri</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Node.js Versiyonu</span>
              <Badge variant="info">{systemInfo.nodeVersion}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ortam</span>
              <Badge
                variant={
                  systemInfo.environment === "production"
                    ? "success"
                    : "warning"
                }
              >
                {systemInfo.environment}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Platform</span>
              <Badge variant="info">{systemInfo.platform}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Veritabanı</span>
              <Badge variant="success">MongoDB</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Çalışma Süresi</span>
              <span className="text-sm font-medium text-gray-900">
                {systemInfo.uptime}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Güvenlik */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Güvenlik</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Şifre Değiştir
            </Button>

            <Button variant="outline" className="w-full justify-start">
              İki Faktörlü Doğrulama
            </Button>

            <Button variant="outline" className="w-full justify-start">
              Aktif Oturumlar
            </Button>

            <Button variant="outline" className="w-full justify-start">
              Sistem Logları
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
