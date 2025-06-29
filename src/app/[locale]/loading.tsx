import { Loading } from "@/components/ui/Loading";

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="text-center">
        <Loading size="lg" text="Yükleniyor..." />
      </div>
    </div>
  );
}
