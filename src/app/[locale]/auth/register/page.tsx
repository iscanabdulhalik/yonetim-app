"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Building2 } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    building: "",
    unitNumber: "",
    siteCode: "",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const params = useParams();
  const locale = params.locale as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        toast.error("Şifreler eşleşmiyor");
        return;
      }

      if (formData.password.length < 6) {
        toast.error("Şifre en az 6 karakter olmalıdır");
        return;
      }

      // AuthContext'teki register fonksiyonunu kullan
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        building: formData.building || undefined,
        unitNumber: formData.unitNumber,
        siteCode: formData.siteCode,
      });

      toast.success("Kayıt başarılı!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kayıt yapılamadı");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const buildingOptions = [
    { value: "", label: "Blok seçiniz (opsiyonel)" },
    { value: "A", label: "A Blok" },
    { value: "B", label: "B Blok" },
    { value: "C", label: "C Blok" },
    { value: "D", label: "D Blok" },
    { value: "E", label: "E Blok" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-xl">Kayıt Ol</CardTitle>
            <p className="text-sm text-secondary-600 mt-2">
              Daire sakinleri için yeni hesap oluşturun
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Ad"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Soyad"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <Input
                label="E-posta"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="ornek@email.com"
                required
              />

              <Input
                label="Telefon"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="05xx xxx xx xx"
              />

              <Input
                label="Site Kodu"
                name="siteCode"
                value={formData.siteCode}
                onChange={handleInputChange}
                placeholder="Yöneticinizden alacağınız kod"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Blok"
                  name="building"
                  value={formData.building}
                  onChange={handleInputChange}
                  options={buildingOptions}
                />
                <Input
                  label="Daire No"
                  name="unitNumber"
                  value={formData.unitNumber}
                  onChange={handleInputChange}
                  placeholder="1, 2, 3..."
                  required
                />
              </div>

              <Input
                label="Şifre"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                helperText="En az 6 karakter"
                required
              />

              <Input
                label="Şifre Tekrar"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
              />

              <Button type="submit" className="w-full" loading={loading}>
                Kayıt Ol
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-secondary-600">
                Zaten hesabınız var mı?{" "}
                <Link
                  href={`/${locale}/auth/login`}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Giriş yapın
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
