"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSite } from "@/contexts/SiteContext";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatsCards } from "@/components/dashboard/StatsCard";
import { PaymentChart } from "@/components/dashboard/PaymentChart";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import {
  Users,
  CreditCard,
  Receipt,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { site } = useSite();
  const params = useParams();
  const siteCode = params.siteCode as string;

  const [stats, setStats] = useState({
    totalResidents: 0,
    monthlyIncome: 0,
    totalExpenses: 0,
    overduePayments: 0,
    paymentRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.siteId) {
      fetchDashboardData();
    }
  }, [user?.siteId]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      // FIXED: siteId'yi user'dan al, site'dan değil
      const response = await fetch(`/api/dashboard/${user?.siteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi günler";
    return "İyi akşamlar";
  };

  const getCurrentMonth = () => {
    const months = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];
    return months[new Date().getMonth()];
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {getGreeting()}, {user?.firstName}!
            </h1>
            <p className="text-primary-100 mt-1">
              {site?.name || siteCode} - {getCurrentMonth()} ayı özeti
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-primary-100">Bugün</div>
            <div className="text-lg font-semibold">
              {new Date().toLocaleDateString("tr-TR")}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} loading={loading} />

      {/* Charts and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentChart />
        <RecentActivities />
      </div>

      {/* Quick Actions for Admins */}
      {user?.role === "site_admin" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Hızlı İşlemler</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors text-left">
                <Calendar className="h-6 w-6 text-primary-600 mb-2" />
                <h3 className="font-medium text-secondary-900">
                  Aidat Oluştur
                </h3>
                <p className="text-sm text-secondary-600">
                  Bu ay için aidat faturası oluştur
                </p>
              </button>

              <button className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors text-left">
                <Receipt className="h-6 w-6 text-success-600 mb-2" />
                <h3 className="font-medium text-secondary-900">Gider Ekle</h3>
                <p className="text-sm text-secondary-600">
                  Yeni gider kaydı oluştur
                </p>
              </button>

              <button className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors text-left">
                <Users className="h-6 w-6 text-warning-600 mb-2" />
                <h3 className="font-medium text-secondary-900">Duyuru Yap</h3>
                <p className="text-sm text-secondary-600">
                  Tüm sakinlere duyuru gönder
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
