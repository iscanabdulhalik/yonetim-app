"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Building2, ArrowLeft, Mail, Phone } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "contact">("email");
  const [formData, setFormData] = useState({
    email: "",
    siteCode: "",
  });
  const [siteInfo, setSiteInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const locale = params.locale as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Önce site bilgilerini al
      if (formData.siteCode) {
        const siteResponse = await fetch(
          `/api/sites/info?siteCode=${formData.siteCode}`
        );
        if (siteResponse.ok) {
          const siteData = await siteResponse.json();
          setSiteInfo(siteData.site);
          setStep("contact");
          toast.success("Site bulundu! Lütfen yöneticinizle iletişime geçin.");
        } else {
          toast.error("Geçersiz site kodu");
        }
      } else {
        toast.error("Lütfen site kodunuzu girin");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Bir hata oluştu");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-xl">
              {step === "email" ? "Şifremi Unuttum" : "Yönetici İletişim"}
            </CardTitle>
            <p className="text-sm text-secondary-600 mt-2">
              {step === "email"
                ? "Site kodunuzu girerek yönetici iletişim bilgilerini alabilirsiniz"
                : "Şifrenizi sıfırlamak için yöneticinizle iletişime geçin"}
            </p>
          </CardHeader>

          <CardContent>
            {step === "email" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="E-posta Adresiniz"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ornek@email.com"
                  required
                  helperText="Kayıtlı e-posta adresinizi girin"
                />

                <Input
                  label="Site Kodu"
                  name="siteCode"
                  value={formData.siteCode}
                  onChange={handleInputChange}
                  placeholder="Örn: ABC12345"
                  required
                  helperText="Sitenizin kodunu girin"
                />

                <Button type="submit" className="w-full" loading={loading}>
                  Site Bilgilerini Getir
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                {siteInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">
                      {siteInfo.name}
                    </h3>
                    <p className="text-sm text-blue-700">
                      Site Kodu: {siteInfo.siteCode}
                    </p>
                  </div>
                )}

                <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 text-warning-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-warning-900 mb-1">
                        Şifre Sıfırlama
                      </h4>
                      <p className="text-sm text-warning-700 mb-3">
                        Şifrenizi sıfırlamak için site yöneticinizle iletişime
                        geçmeniz gerekmektedir.
                      </p>
                      <div className="space-y-2 text-sm">
                        <p className="text-warning-800">
                          <strong>1.</strong> Yöneticinize e-posta adresinizi (
                          {formData.email}) söyleyin
                        </p>
                        <p className="text-warning-800">
                          <strong>2.</strong> Kimliğinizi doğrulatın
                        </p>
                        <p className="text-warning-800">
                          <strong>3.</strong> Yeni şifrenizi alın
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    İletişim Yolları:
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>• Site yönetim ofisi</p>
                    <p>• Kapıcı daireniz</p>
                    <p>• WhatsApp site grubu</p>
                    <p>• Site telefonu (varsa)</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setStep("email")}
                  className="w-full"
                >
                  Farklı Site Kodu Dene
                </Button>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link
                href={`/${locale}/auth/login`}
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Giriş sayfasına dön
              </Link>
            </div>

            {step === "email" && (
              <div className="mt-4 text-center">
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
