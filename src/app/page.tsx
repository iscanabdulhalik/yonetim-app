"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/ui/Loading";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/tr/auth/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="text-center">
        <Loading size="lg" text="Yönlendiriliyor..." />
      </div>
    </div>
  );
}
