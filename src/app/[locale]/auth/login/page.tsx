"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Building2, Users, Key } from "lucide-react";
import toast from "react-hot-toast";

type LoginMode = "role-selection" | "manager" | "resident";

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>("role-selection");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    siteCode: "",
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const params = useParams();
  const locale = params.locale as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "manager") {
        await login(formData.email, formData.password);
      } else {
        if (!formData.siteCode) {
          toast.error("Site kodu gereklidir");
          return;
        }
        await login(formData.email, formData.password, formData.siteCode);
      }
      toast.success("Giriş başarılı!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Giriş yapılamadı");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (mode === "role-selection") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-secondary-900">
              Apartman Yönetim
            </h1>
            <p className="text-secondary-600 mt-2">Giriş türünü seçiniz</p>
          </div>

          <div className="space-y-4">
            <Card
              className="cursor-pointer hover:shadow-medium transition-shadow"
              onClick={() => setMode("manager")}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Key className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-secondary-900">
                      Yönetici Girişi
                    </h3>
                    <p className="text-sm text-secondary-600">
                      Site/apartman yöneticileri için
                    </p>
                  </div>
                  <Badge variant="info">Admin</Badge>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-medium transition-shadow"
              onClick={() => setMode("resident")}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-success-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-secondary-900">
                      Sakin Girişi
                    </h3>
                    <p className="text-sm text-secondary-600">
                      Daire sakinleri için
                    </p>
                  </div>
                  <Badge variant="success">Sakin</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-sm text-secondary-600">
              Hesabınız yok mu?{" "}
              <Link
                href={`/${locale}/auth/register`}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Kayıt olun
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
              {mode === "manager" ? (
                <Key className="h-6 w-6 text-white" />
              ) : (
                <Users className="h-6 w-6 text-white" />
              )}
            </div>
            <CardTitle className="text-xl">
              {mode === "manager" ? "Yönetici Girişi" : "Sakin Girişi"}
            </CardTitle>
            <p className="text-sm text-secondary-600 mt-2">
              {mode === "manager"
                ? "Yönetici hesabınızla giriş yapın"
                : "Site kodunuz ile giriş yapın"}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "resident" && (
                <Input
                  label="Site Kodu"
                  name="siteCode"
                  value={formData.siteCode}
                  onChange={handleInputChange}
                  placeholder="Örn: ABC12345"
                  required
                />
              )}

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
                label="Şifre"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
              />

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMode("role-selection")}
                >
                  ← Geri
                </Button>
                <Link
                  href={`/${locale}/auth/forgot-password`}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Şifremi unuttum
                </Link>
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                Giriş Yap
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-secondary-600">
                Hesabınız yok mu?{" "}
                <Link
                  href={`/${locale}/auth/register`}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Kayıt olun
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
