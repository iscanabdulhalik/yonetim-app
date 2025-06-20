"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/ui/Loading";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/tr/auth/login");
      } else {
        // Kullanıcı rolüne göre yönlendir
        if (user.role === "super_admin") {
          router.push("/tr/admin/dashboard");
        } else {
          const siteCode = user.siteCode || "default";
          router.push(`/tr/site/${siteCode}/dashboard`);
        }
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading size="lg" text="Yönlendiriliyor..." />
    </div>
  );
}
