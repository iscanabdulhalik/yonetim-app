"use client";

import { useEffect } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-danger-600 rounded-lg flex items-center justify-center mb-6">
            <Building2 className="h-8 w-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-secondary-900 mb-4">
            Bir Hata Oluştu
          </h1>
          <p className="text-secondary-600 mb-8">
            Sayfa yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
          </p>

          <div className="space-y-4">
            <Button onClick={reset} className="w-full">
              Tekrar Dene
            </Button>

            <Button
              variant="outline"
              onClick={() => (window.location.href = "/tr")}
              className="w-full"
            >
              Ana Sayfaya Dön
            </Button>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <h3 className="text-sm font-medium text-red-800 mb-2">
                Hata Detayları:
              </h3>
              <pre className="text-xs text-red-700 overflow-auto max-h-32">
                {error.message}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
