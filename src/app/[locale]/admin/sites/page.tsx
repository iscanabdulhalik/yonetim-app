"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  Plus,
  Eye,
  Edit,
  Search,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { CreateSiteModal } from "@/components/admin/CreateSiteModal";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface SiteWithStats {
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
  totalUsers: number;
  adminUsers: number;
  residentUsers: number;
}

export default function AdminSitesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sites, setSites] = useState<SiteWithStats[]>([]);
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
    }
  }, [user]);

  const fetchSites = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/sites", {
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

  const handleCreateSite = async (siteData: any) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/sites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(siteData),
      });

      if (response.ok) {
        toast.success("Site başarıyla oluşturuldu!");
        setShowCreateModal(false);
        fetchSites();
      } else {
        const error = await response.json();
        toast.error(error.message || "Site oluşturulamadı");
      }
    } catch (error) {
      console.error("Error creating site:", error);
      toast.error("Bir hata oluştu");
    }
  };

  const filteredSites = sites.filter(
    (site) =>
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.siteCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.address.toLowerCase().includes(searchTerm.toLowerCase())
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Yönetimi</h1>
          <p className="text-gray-600">Tüm siteleri görüntüleyin ve yönetin</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-600 text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Site
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Site adı, kodu veya adres ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sites Grid */}
      {loadingSites ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSites.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "Site bulunamadı" : "Henüz site bulunmuyor"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "Arama kriterlerinizi değiştirin"
                : "İlk sitenizi oluşturarak başlayın"}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary-600 text-white hover:bg-primary-700"
              >
                İlk Siteyi Oluştur
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
            <Card key={site._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{site.name}</CardTitle>
                    <p className="text-sm text-gray-500">
                      Kod: {site.siteCode}
                    </p>
                  </div>
                  <Badge variant={site.isActive ? "success" : "danger"}>
                    {site.isActive ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p className="truncate">{site.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Blok:</span>
                    <span className="ml-1 font-medium">
                      {site.buildingCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Daire:</span>
                    <span className="ml-1 font-medium">{site.totalUnits}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Kullanıcı:</span>
                    <span className="ml-1 font-medium">{site.totalUsers}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Aidat:</span>
                    <span className="ml-1 font-medium">
                      {formatCurrency(site.monthlyFee, site.currency)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-xs text-gray-500">
                    {formatDate(site.createdAt)}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/tr/admin/sites/${site._id}`)}
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
