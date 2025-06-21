"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Settings,
  Building2,
  Users,
  Shield,
  Archive,
} from "lucide-react";
import toast from "react-hot-toast";

interface SiteDetail {
  _id: string;
  siteCode: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  buildingCount: number;
  totalUnits: number;
  monthlyFee: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSiteSettingsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const siteId = params.siteId as string;

  const [site, setSite] = useState<SiteDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "super_admin") {
      router.push("/tr/auth/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === "super_admin" && siteId) {
      fetchSiteDetail();
    }
  }, [user, siteId]);

  const fetchSiteDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/sites/${siteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSite(data.site);
      } else {
        toast.error("Site bilgileri yüklenemedi");
        router.push("/tr/admin/sites");
      }
    } catch (error) {
      console.error("Error fetching site detail:", error);
      toast.error("Bir hata oluştu");
      router.push("/tr/admin/sites");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!site) return;

    const action = site.isActive ? "deaktive" : "aktive";
    if (!confirm(`Bu siteyi ${action} etmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/sites/${siteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: !site.isActive,
        }),
      });

      if (response.ok) {
        toast.success(`Site başarıyla ${action} edildi!`);
        fetchSiteDetail();
      } else {
        toast.error(`Site ${action} edilemedi`);
      }
    } catch (error) {
      console.error("Error toggling site status:", error);
      toast.error("Bir hata oluştu");
    }
  };

  const handleDeleteSite = async () => {
    if (!site) return;

    if (
      !confirm(
        "Bu siteyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!"
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/sites/${siteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Site başarıyla silindi!");
        router.push("/tr/admin/sites");
      } else {
        toast.error("Site silinemedi");
      }
    } catch (error) {
      console.error("Error deleting site:", error);
      toast.error("Bir hata oluştu");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!site) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/tr/admin/sites/${siteId}`)}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Site Ayarları</h1>
            <p className="text-gray-600">{site.name}</p>
          </div>
        </div>
        <Badge variant={site.isActive ? "success" : "danger"}>
          {site.isActive ? "Aktif" : "Pasif"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Site Bilgileri</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Site Kodu:</span>
                <p className="font-medium">{site.siteCode}</p>
              </div>
              <div>
                <span className="text-gray-500">Site Adı:</span>
                <p className="font-medium">{site.name}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Adres:</span>
                <p className="font-medium">{site.address}</p>
              </div>
              <div>
                <span className="text-gray-500">Telefon:</span>
                <p className="font-medium">{site.phone || "-"}</p>
              </div>
              <div>
                <span className="text-gray-500">E-posta:</span>
                <p className="font-medium">{site.email || "-"}</p>
              </div>
              <div>
                <span className="text-gray-500">Blok Sayısı:</span>
                <p className="font-medium">{site.buildingCount}</p>
              </div>
              <div>
                <span className="text-gray-500">Toplam Daire:</span>
                <p className="font-medium">{site.totalUnits}</p>
              </div>
              <div>
                <span className="text-gray-500">Aylık Aidat:</span>
                <p className="font-medium">
                  {site.monthlyFee} {site.currency}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Para Birimi:</span>
                <p className="font-medium">{site.currency}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => router.push(`/tr/admin/sites/${siteId}/edit`)}
                className="w-full"
              >
                Site Bilgilerini Düzenle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Sistem Bilgileri</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Oluşturma Tarihi:</span>
                <p className="font-medium">{formatDate(site.createdAt)}</p>
              </div>
              <div>
                <span className="text-gray-500">Son Güncelleme:</span>
                <p className="font-medium">{formatDate(site.updatedAt)}</p>
              </div>
              <div>
                <span className="text-gray-500">Durum:</span>
                <Badge variant={site.isActive ? "success" : "danger"}>
                  {site.isActive ? "Aktif" : "Pasif"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Hızlı İşlemler</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => router.push(`/tr/admin/sites/${siteId}/users`)}
            >
              Kullanıcıları Yönet
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => router.push(`/tr/admin/sites/${siteId}/payments`)}
            >
              Ödemeleri Görüntüle
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => router.push(`/tr/admin/sites/${siteId}/reports`)}
            >
              Raporları Görüntüle
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-danger-600">
              <Shield className="h-5 w-5" />
              <span>Tehlikeli Bölge</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Site Durumunu Değiştir
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Siteyi {site.isActive ? "deaktive" : "aktive"} edebilirsiniz.
              </p>
              <Button
                variant={site.isActive ? "outline" : "primary"}
                size="sm"
                onClick={handleToggleStatus}
                className="w-full"
              >
                <Archive className="h-4 w-4 mr-2" />
                {site.isActive ? "Siteyi Deaktive Et" : "Siteyi Aktive Et"}
              </Button>
            </div>

            <div className="pt-4 border-t border-danger-200">
              <h4 className="font-medium text-danger-600 mb-2">Siteyi Sil</h4>
              <p className="text-sm text-gray-600 mb-3">
                Bu işlem geri alınamaz. Tüm veriler silinecektir.
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteSite}
                className="w-full"
              >
                Siteyi Kalıcı Olarak Sil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
