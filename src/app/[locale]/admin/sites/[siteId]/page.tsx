"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Building2,
  Users,
  DollarSign,
  Settings,
  ArrowLeft,
  Edit,
  QrCode,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  AlertTriangle,
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

interface SiteStats {
  totalUsers: number;
  adminUsers: number;
  residentUsers: number;
  totalPayments: number;
  totalExpenses: number;
  activeComplaints: number;
  monthlyRevenue: number;
}

export default function AdminSiteDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const siteId = params.siteId as string;

  const [site, setSite] = useState<SiteDetail | null>(null);
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "super_admin")) {
      router.push("/tr/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "super_admin" && siteId) {
      fetchSiteDetail();
      fetchSiteStats();
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
    }
  };

  const fetchSiteStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/sites/${siteId}/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching site stats:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const generateQRCodeUrl = () => {
    if (!site?.siteCode) return "";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const qrData = `${baseUrl}/tr/auth/register?siteCode=${site.siteCode}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      qrData
    )}`;
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || user.role !== "super_admin" || !site) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/tr/admin/sites")}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
            <p className="text-gray-600">Site Detayları</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={site.isActive ? "success" : "danger"}>
            {site.isActive ? "Aktif" : "Pasif"}
          </Badge>
          <Button
            onClick={() => router.push(`/tr/admin/sites/${siteId}/edit`)}
            className="bg-primary-600 text-white hover:bg-primary-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Düzenle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Site Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Site Bilgileri</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Site Kodu
                  </label>
                  <p className="text-lg font-semibold text-primary-600">
                    {site.siteCode}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Site Adı
                  </label>
                  <p className="text-lg font-semibold">{site.name}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Adres
                </label>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <p className="text-gray-900">{site.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {site.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Telefon
                    </label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{site.phone}</p>
                    </div>
                  </div>
                )}
                {site.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      E-posta
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{site.email}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Blok Sayısı
                  </label>
                  <p className="text-2xl font-bold text-gray-900">
                    {site.buildingCount}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Toplam Daire
                  </label>
                  <p className="text-2xl font-bold text-gray-900">
                    {site.totalUnits}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Aylık Aidat
                  </label>
                  <p className="text-2xl font-bold text-success-600">
                    {formatCurrency(site.monthlyFee, site.currency)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Oluşturma Tarihi
                  </label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">
                      {formatDate(site.createdAt)}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Son Güncelleme
                  </label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">
                      {formatDate(site.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Site İstatistikleri</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Users className="h-8 w-8 text-primary-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalUsers}
                    </p>
                    <p className="text-sm text-gray-500">Toplam Kullanıcı</p>
                    <div className="text-xs text-gray-400 mt-1">
                      {stats.adminUsers} Yönetici, {stats.residentUsers} Sakin
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-success-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="h-8 w-8 text-success-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.monthlyRevenue, site.currency)}
                    </p>
                    <p className="text-sm text-gray-500">Aylık Gelir</p>
                    <div className="text-xs text-gray-400 mt-1">
                      {stats.totalPayments} Ödeme
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-warning-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <AlertTriangle className="h-8 w-8 text-warning-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.activeComplaints}
                    </p>
                    <p className="text-sm text-gray-500">Aktif Şikayet</p>
                    <div className="text-xs text-gray-400 mt-1">
                      Toplam Gider:{" "}
                      {formatCurrency(stats.totalExpenses, site.currency)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* QR Code and Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="h-5 w-5" />
                <span>QR Kod</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex justify-center">
                <img
                  src={generateQRCodeUrl()}
                  alt="Site QR Code"
                  className="border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <p className="text-lg font-bold text-primary-600 mb-2">
                  {site.siteCode}
                </p>
                <p className="text-sm text-gray-600">
                  Sakinlerin kayıt olması için bu QR kodu paylaşabilirsiniz
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  const qrImageUrl = generateQRCodeUrl();
                  const link = document.createElement("a");
                  link.href = qrImageUrl;
                  link.download = `${site.siteCode}-qr-kod.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  toast.success("QR kod indirildi!");
                }}
              >
                QR Kodu İndir
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
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
                <Users className="h-4 w-4 mr-2" />
                Kullanıcıları Görüntüle
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() =>
                  router.push(`/tr/admin/sites/${siteId}/payments`)
                }
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Ödemeleri Görüntüle
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => router.push(`/tr/admin/sites/${siteId}/reports`)}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Raporları Görüntüle
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() =>
                  router.push(`/tr/admin/sites/${siteId}/settings`)
                }
              >
                <Settings className="h-4 w-4 mr-2" />
                Site Ayarları
              </Button>
            </CardContent>
          </Card>

          {/* Site Status */}
          <Card>
            <CardHeader>
              <CardTitle>Site Durumu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Durum</span>
                <Badge variant={site.isActive ? "success" : "danger"}>
                  {site.isActive ? "Aktif" : "Pasif"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Para Birimi</span>
                <span className="font-medium">{site.currency}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Potansiyel Gelir</span>
                <span className="font-medium text-success-600">
                  {formatCurrency(
                    site.monthlyFee * site.totalUnits,
                    site.currency
                  )}
                </span>
              </div>

              {stats && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Doluluk Oranı</span>
                  <span className="font-medium">
                    {Math.round((stats.residentUsers / site.totalUnits) * 100)}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
