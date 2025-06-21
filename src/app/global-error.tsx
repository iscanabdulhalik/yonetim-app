"use client";

import { Building2 } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
          <div className="text-center max-w-md w-full">
            <div className="mx-auto w-16 h-16 bg-danger-600 rounded-lg flex items-center justify-center mb-6">
              <Building2 className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-secondary-900 mb-4">
              Bir Hata Oluştu
            </h1>
            <p className="text-secondary-600 mb-8">
              Uygulama beklenmedik bir hatayla karşılaştı. Lütfen sayfayı
              yenileyin.
            </p>

            <div className="space-y-4">
              <button
                onClick={reset}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
              >
                Tekrar Dene
              </button>

              <div className="text-sm text-secondary-500">
                <a
                  href="/tr"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  Ana Sayfaya Dön
                </a>
              </div>
            </div>

            {process.env.NODE_ENV === "development" && (
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  Hata Detayları (Geliştirme Modu):
                </h3>
                <pre className="text-xs text-red-700 overflow-auto">
                  {error.message}
                </pre>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
