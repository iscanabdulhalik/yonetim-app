"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { formatDate } from "@/lib/utils";
import { Building2, Save, ArrowLeft } from "lucide-react";
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

export default function AdminSiteEditPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const siteId = params.siteId as string;

  const [site, setSite] = useState<SiteDetail | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  // Site settings form
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    buildingCount: 1,
    totalUnits: 1,
    monthlyFee: 0,
    currency: "TRY" as "TRY" | "USD" | "EUR",
    isActive: true,
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "super_admin")) {
      router.push("/tr/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "super_admin" && siteId) {
      fetchSiteDetail();
    }
  }, [user, siteId]);

  useEffect(() => {
    if (site) {
      setFormData({
        name: site.name || "",
        address: site.address || "",
        phone: site.phone || "",
        email: site.email || "",
        buildingCount: site.buildingCount || 1,
        totalUnits: site.totalUnits || 1,
        monthlyFee: site.monthlyFee || 0,
        currency: (site.currency as "TRY" | "USD" | "EUR") || "TRY",
        isActive: site.isActive,
      });
    }
  }, [site]);

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
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/sites/${siteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Site başarıyla güncellendi!");
        router.push(`/tr/admin/sites/${siteId}`);
      } else {
        const error = await response.json();
        toast.error(error.message || "Site güncellenemedi");
      }
    } catch (error) {
      console.error("Error updating site:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? parseFloat(value) || 0
          : type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const currencyOptions = [
    { value: "TRY", label: "₺ Türk Lirası" },
    { value: "USD", label: "$ Amerikan Doları" },
    { value: "EUR", label: "€ Euro" },
  ];

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
            onClick={() => router.push(`/tr/admin/sites/${siteId}`)}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Site Düzenle</h1>
            <p className="text-gray-600">{site.name}</p>
          </div>
        </div>
      </div>

      {/* Site Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Site Bilgileri</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Site Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Site Adı"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Input
                label="E-posta"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <Textarea
              label="Adres"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Telefon"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-gray-700"
                >
                  Site Aktif
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Blok Sayısı"
                name="buildingCount"
                type="number"
                min="1"
                value={formData.buildingCount || ""}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Toplam Daire Sayısı"
                name="totalUnits"
                type="number"
                min="1"
                value={formData.totalUnits || ""}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Aylık Aidat"
                name="monthlyFee"
                type="number"
                min="0"
                step="0.01"
                value={formData.monthlyFee || ""}
                onChange={handleInputChange}
                required
              />
              <Select
                label="Para Birimi"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                options={currencyOptions}
              />
            </div>

            {/* Site Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Site Bilgileri</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Site Kodu:</span>
                  <span className="ml-2 font-medium">{site.siteCode}</span>
                </div>
                <div>
                  <span className="text-gray-500">Oluşturma Tarihi:</span>
                  <span className="ml-2 font-medium">
                    {formatDate(site.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/tr/admin/sites/${siteId}`)}
              >
                İptal
              </Button>
              <Button type="submit" loading={saving}>
                <Save className="h-4 w-4 mr-2" />
                Değişiklikleri Kaydet
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
