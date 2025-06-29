"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  TrendingUp,
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { CreateSiteModal } from "@/components/admin/CreateSiteModal";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Site {
  _id: string;
  siteCode: string;
  name: string;
  address: string;
  buildingCount: number;
  totalUnits: number;
  monthlyFee: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
}

interface Stats {
  totalSites: number;
  totalUsers: number;
  activeSites: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSites: 0,
    totalUsers: 0,
    activeSites: 0,
    totalRevenue: 0,
  });
  const [loadingSites, setLoadingSites] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "super_admin")) {
      router.push("/tr/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "super_admin") {
      fetchSites();
      fetchStats();
    }
  }, [user]);

  const fetchSites = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/sites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSites(data.sites || []);
      } else {
        toast.error("Siteler yüklenemedi");
      }
    } catch (error) {
      console.error("Error fetching sites:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setLoadingSites(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleCreateSite = async (siteData: any) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Token bulunamadı, lütfen tekrar giriş yapın");
        router.push("/tr/auth/login");
        return;
      }

      const response = await fetch("/api/sites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(siteData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Site başarıyla oluşturuldu!");
        setShowCreateModal(false);
        fetchSites();
        fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.message || "Site oluşturulamadı");
      }
    } catch (error) {
      console.error("Error creating site:", error);
      toast.error("Bir hata oluştu");
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    if (!confirm("Bu siteyi silmek istediğinizden emin misiniz?")) {
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
        fetchSites();
        fetchStats();
      } else {
        toast.error("Site silinemedi");
      }
    } catch (error) {
      console.error("Error deleting site:", error);
      toast.error("Bir hata oluştu");
    }
  };

  const filteredSites = sites.filter(
    (site) =>
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.siteCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Hoş geldiniz, {user.firstName} {user.lastName}!
            </h1>
            <p className="text-primary-100 mt-1">Super Admin Dashboard</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-primary-100">Bugün</div>
            <div className="text-lg font-semibold">
              {new Date().toLocaleDateString("tr-TR")}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Toplam Site</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalSites}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Toplam Kullanıcı
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aktif Siteler</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeSites}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Toplam Gelir</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sites Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Siteler</h3>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Site
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Site adı veya kodu ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loadingSites ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Yükleniyor...</p>
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium mb-2">
                {searchTerm ? "Site bulunamadı" : "Henüz site bulunmuyor"}
              </h4>
              <p className="mb-4">
                {searchTerm
                  ? "Arama kriterlerinizi değiştirin"
                  : "İlk sitenizi oluşturarak başlayın"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  İlk Siteyi Oluştur
                </Button>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adres
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blok/Daire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aylık Aidat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSites.map((site) => (
                  <tr key={site._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {site.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Kod: {site.siteCode}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {site.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {site.buildingCount} Blok
                      </div>
                      <div className="text-sm text-gray-500">
                        {site.totalUnits} Daire
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(site.monthlyFee, site.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={site.isActive ? "success" : "danger"}>
                        {site.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/tr/admin/sites/${site._id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/tr/admin/sites/${site._id}/edit`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSite(site._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Site Modal */}
      {showCreateModal && (
        <CreateSiteModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSite}
        />
      )}
    </div>
  );
}
