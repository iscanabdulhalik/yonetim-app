"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSite } from "@/contexts/SiteContext";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import {
  Building2,
  Save,
  QrCode,
  Copy,
  Check,
  Settings,
  Info,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SiteSettingsPage() {
  const { user } = useAuth();
  const { site, updateSite } = useSite();
  const params = useParams();
  const siteCode = params.siteCode as string;

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Site settings form
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    buildingCount: 1,
    totalUnits: 1,
    monthlyFee: 0,
    currency: "TRY" as "TRY" | "USD" | "EUR",
  });

  useEffect(() => {
    if (site) {
      setSettingsForm({
        name: site.name || "",
        address: site.address || "",
        phone: site.phone || "",
        email: site.email || "",
        buildingCount: site.buildingCount || 1,
        totalUnits: site.totalUnits || 1,
        monthlyFee: site.monthlyFee || 0,
        currency: site.currency || "TRY",
      });
    }
  }, [site]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateSite(settingsForm);
      toast.success("Site ayarları başarıyla güncellendi!");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Ayarlar güncellenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleCopySiteCode = async () => {
    if (site?.siteCode) {
      try {
        await navigator.clipboard.writeText(site.siteCode);
        setCopied(true);
        toast.success("Site kodu kopyalandı!");
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error("Site kodu kopyalanamadı");
      }
    }
  };

  const generateQRCodeUrl = () => {
    if (!site?.siteCode) return "";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const qrData = `${baseUrl}/tr/auth/register?siteCode=${site.siteCode}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      qrData
    )}`;
  };

  const currencyOptions = [
    { value: "TRY", label: "₺ Türk Lirası" },
    { value: "USD", label: "$ Amerikan Doları" },
    { value: "EUR", label: "€ Euro" },
  ];

  // Redirect if not site admin
  if (user?.role !== "site_admin") {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Erişim Reddedildi
        </h1>
        <p className="text-gray-600">
          Bu sayfaya erişim yetkiniz bulunmamaktadır.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Ayarları</h1>
          <p className="text-gray-600">
            Site bilgilerini görüntüleyin ve düzenleyin
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Site Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Site Bilgileri</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSettings} className="space-y-4">
                <Input
                  label="Site Adı"
                  value={settingsForm.name}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                />

                <Textarea
                  label="Adres"
                  value={settingsForm.address}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  rows={3}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Telefon"
                    value={settingsForm.phone}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="E-posta"
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Blok Sayısı"
                    type="number"
                    min="1"
                    value={settingsForm.buildingCount}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        buildingCount: parseInt(e.target.value) || 1,
                      }))
                    }
                    required
                  />
                  <Input
                    label="Toplam Daire Sayısı"
                    type="number"
                    min="1"
                    value={settingsForm.totalUnits}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        totalUnits: parseInt(e.target.value) || 1,
                      }))
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Aylık Aidat"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settingsForm.monthlyFee}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        monthlyFee: parseFloat(e.target.value) || 0,
                      }))
                    }
                    required
                  />
                  <Select
                    label="Para Birimi"
                    value={settingsForm.currency}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        currency: e.target.value as any,
                      }))
                    }
                    options={currencyOptions}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" loading={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Değişiklikleri Kaydet
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Site Code & QR Code */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="h-5 w-5" />
                <span>Site Kodu</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {site?.siteCode}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Sakinlerin kayıt olması için bu kodu paylaşın
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySiteCode}
                  className="w-full"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Kopyalandı
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Kodu Kopyala
                    </>
                  )}
                </Button>
              </div>

              {site?.siteCode && (
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    QR Kod
                  </p>
                  <div className="flex justify-center">
                    <img
                      src={generateQRCodeUrl()}
                      alt="Site QR Code"
                      className="border border-gray-200 rounded-lg"
                      width={150}
                      height={150}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    QR kodu okutarak kayıt sayfasına ulaşabilirsiniz
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Site Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Site İstatistikleri</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Durumu</span>
                <Badge variant={site?.isActive ? "success" : "danger"}>
                  {site?.isActive ? "Aktif" : "Pasif"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Toplam Blok</span>
                <span className="font-medium">{site?.buildingCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Toplam Daire</span>
                <span className="font-medium">{site?.totalUnits}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Aylık Aidat</span>
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">
                    {site?.monthlyFee} {site?.currency}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Oluşturma Tarihi</span>
                <span className="font-medium">
                  {site?.createdAt
                    ? new Date(site.createdAt).toLocaleDateString("tr-TR")
                    : "-"}
                </span>
              </div>
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
                onClick={() => {
                  const mailtoLink = `mailto:?subject=Site Kayıt Kodu&body=Merhaba,%0A%0ASitemize kayıt olmak için aşağıdaki kodu kullanabilirsiniz:%0A%0ASite Kodu: ${site?.siteCode}%0A%0AKayıt olmak için: ${window.location.origin}/tr/auth/register%0A%0ATeşekkürler`;
                  window.location.href = mailtoLink;
                }}
              >
                Site Kodunu E-posta ile Gönder
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const whatsappText = `Merhaba! Sitemize kayıt olmak için aşağıdaki kodu kullanabilirsiniz:\n\nSite Kodu: ${site?.siteCode}\n\nKayıt olmak için: ${window.location.origin}/tr/auth/register`;
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
                    whatsappText
                  )}`;
                  window.open(whatsappUrl, "_blank");
                }}
              >
                WhatsApp ile Paylaş
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const qrImageUrl = generateQRCodeUrl();
                  const link = document.createElement("a");
                  link.href = qrImageUrl;
                  link.download = `${site?.siteCode}-qr-kod.png`;
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
        </div>
      </div>
    </div>
  );
}
