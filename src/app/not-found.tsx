import Link from "next/link";
import { Building2 } from "lucide-react";

export default function NotFound() {
  return (
    <html lang="tr">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
          <div className="text-center max-w-md w-full">
            <div className="mx-auto w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center mb-6">
              <Building2 className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-secondary-900 mb-2">
              Sayfa Bulunamadı
            </h2>
            <p className="text-secondary-600 mb-8">
              Aradığınız sayfa mevcut değil veya taşınmış olabilir.
            </p>

            <div className="space-y-4">
              <Link
                href="/tr"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
              >
                Ana Sayfaya Dön
              </Link>

              <div className="text-sm text-secondary-500">
                <Link
                  href="/tr/auth/login"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  Giriş Yap
                </Link>
                {" • "}
                <Link
                  href="/tr/auth/register"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  Kayıt Ol
                </Link>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
