"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/ui/Loading";

export default function HomePage({ params }: { params: { locale: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { locale } = params;

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Kullanıcı yoksa giriş sayfasına yönlendir
        router.push(`/${locale}/auth/login`);
      } else {
        // Kullanıcı rolüne göre yönlendir
        if (user.role === "super_admin") {
          router.push(`/${locale}/admin/dashboard`);
        } else {
          const siteCode = user.siteCode || "default";
          router.push(`/${locale}/site/${siteCode}/dashboard`);
        }
      }
    }
  }, [user, loading, router, locale]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="text-center">
          <Loading size="lg" text="Kontrol ediliyor..." />
        </div>
      </div>
    );
  }

  // Yönlendirme sırasında loading göster
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="text-center">
        <Loading size="lg" text="Yönlendiriliyor..." />
      </div>
    </div>
  );
}
