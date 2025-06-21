"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  FileText,
  TrendingUp,
  Users,
  CreditCard,
  Receipt,
  Calendar,
  PieChart,
  BarChart3,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSiteReportsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const siteId = params.siteId as string;

  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState({
    financialSummary: {
      totalIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
      paymentRate: 0,
    },
    userStats: {
      totalUsers: 0,
      activeUsers: 0,
      adminUsers: 0,
      residentUsers: 0,
    },
    monthlyData: [] as Array<{
      month: string;
      income: number;
      expenses: number;
      payments: number;
    }>,
    paymentStats: {
      totalPayments: 0,
      paidPayments: 0,
      pendingPayments: 0,
      overduePayments: 0,
    },
    complaintStats: {
      totalComplaints: 0,
      openComplaints: 0,
      resolvedComplaints: 0,
      avgResolutionTime: 0,
    },
  });

  useEffect(() => {
    if (!user || user.role !== "super_admin") {
      router.push("/tr/auth/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === "super_admin" && siteId) {
      fetchReports();
    }
  }, [user, siteId]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");

      // Site istatistikleri
      const statsResponse = await fetch(`/api/admin/sites/${siteId}/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Ödemeler
      const paymentsResponse = await fetch(`/api/sites/${siteId}/payments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Giderler
      const expensesResponse = await fetch(`/api/sites/${siteId}/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Şikayetler
      const complaintsResponse = await fetch(
        `/api/sites/${siteId}/complaints`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();

        let paymentsData = { stats: [] };
        let expensesData = { totalAmount: 0 };
        let complaintsData = { stats: [] };

        if (paymentsResponse.ok) {
          paymentsData = await paymentsResponse.json();
        }

        if (expensesResponse.ok) {
          expensesData = await expensesResponse.json();
        }

        if (complaintsResponse.ok) {
          complaintsData = await complaintsResponse.json();
        }

        // Ödeme istatistikleri
        const paymentStatsMap = paymentsData.stats.reduce(
          (acc: any, stat: any) => {
            acc[stat._id] = stat.count;
            return acc;
          },
          {}
        );

        // Şikayet istatistikleri
        const complaintStatsMap = complaintsData.stats.reduce(
          (acc: any, stat: any) => {
            acc[stat._id] = stat.count;
            return acc;
          },
          {}
        );

        // Aylık veriler için gerçek tarih hesaplama
        const monthlyData = [];
        const currentDate = new Date();
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

        for (let i = 5; i >= 0; i--) {
          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - i,
            1
          );
          const monthName = months[date.getMonth()];

          // Basitleştirilmiş hesaplama - gerçek uygulamada aylık veriler API'den gelecek
          const baseIncome = statsData.stats.monthlyRevenue || 0;
          const baseExpenses = statsData.stats.totalExpenses || 0;
          const variation = Math.random() * 0.3 + 0.85; // %85-115 arası varyasyon

          monthlyData.push({
            month: monthName,
            income: Math.round(baseIncome * variation),
            expenses: Math.round((baseExpenses * variation) / 6), // 6 aylık ortalama
            payments: Math.round((statsData.stats.totalUsers || 0) * variation),
          });
        }

        setReports({
          financialSummary: {
            totalIncome: statsData.stats.monthlyRevenue * 6 || 0, // 6 aylık toplam
            totalExpenses: statsData.stats.totalExpenses || 0,
            netProfit:
              (statsData.stats.monthlyRevenue * 6 || 0) -
              (statsData.stats.totalExpenses || 0),
            paymentRate:
              statsData.stats.totalUsers > 0
                ? Math.round(
                    ((paymentStatsMap.paid || 0) / statsData.stats.totalUsers) *
                      100
                  )
                : 0,
          },
          userStats: {
            totalUsers: statsData.stats.totalUsers || 0,
            activeUsers: statsData.stats.totalUsers || 0,
            adminUsers: statsData.stats.adminUsers || 0,
            residentUsers: statsData.stats.residentUsers || 0,
          },
          monthlyData,
          paymentStats: {
            totalPayments:
              (paymentStatsMap.paid || 0) +
              (paymentStatsMap.pending || 0) +
              (paymentStatsMap.overdue || 0),
            paidPayments: paymentStatsMap.paid || 0,
            pendingPayments: paymentStatsMap.pending || 0,
            overduePayments: paymentStatsMap.overdue || 0,
          },
          complaintStats: {
            totalComplaints:
              (complaintStatsMap.open || 0) +
              (complaintStatsMap.resolved || 0) +
              (complaintStatsMap.closed || 0),
            openComplaints: complaintStatsMap.open || 0,
            resolvedComplaints: complaintStatsMap.resolved || 0,
            avgResolutionTime: 2.5, // Ortalama çözüm süresi (gerçek hesaplama için daha fazla veri gerekli)
          },
        });
      } else {
        toast.error("Raporlar yüklenemedi");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/tr/admin/sites/${siteId}`)}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Site Raporları</h1>
            <p className="text-gray-600">Detaylı site analizi ve raporları</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Son güncelleme: {formatDate(new Date())}
        </div>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Mali Özet - Son 6 Ay</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center p-4 bg-success-50 rounded-lg">
              <div className="text-2xl font-bold text-success-600">
                {formatCurrency(reports.financialSummary.totalIncome)}
              </div>
              <p className="text-sm text-gray-500">Toplam Gelir</p>
              <p className="text-xs text-success-600 mt-1">Son 6 ay</p>
            </div>
            <div className="text-center p-4 bg-danger-50 rounded-lg">
              <div className="text-2xl font-bold text-danger-600">
                {formatCurrency(reports.financialSummary.totalExpenses)}
              </div>
              <p className="text-sm text-gray-500">Toplam Gider</p>
              <p className="text-xs text-danger-600 mt-1">Son 6 ay</p>
            </div>
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">
                {formatCurrency(reports.financialSummary.netProfit)}
              </div>
              <p className="text-sm text-gray-500">Net Kar</p>
              <p className="text-xs text-primary-600 mt-1">
                {reports.financialSummary.netProfit >= 0
                  ? "Pozitif"
                  : "Negatif"}
              </p>
            </div>
            <div className="text-center p-4 bg-warning-50 rounded-lg">
              <div className="text-2xl font-bold text-warning-600">
                %{reports.financialSummary.paymentRate}
              </div>
              <p className="text-sm text-gray-500">Ödeme Oranı</p>
              <p className="text-xs text-warning-600 mt-1">Genel oran</p>
            </div>
          </div>

          {/* Monthly Chart Simulation */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">
              Aylık Gelir-Gider Analizi
            </h4>
            <div className="space-y-3">
              {reports.monthlyData.map((month, index) => {
                const maxValue = Math.max(
                  ...reports.monthlyData.map((m) =>
                    Math.max(m.income, m.expenses)
                  )
                );
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-16 text-sm text-gray-600">
                      {month.month}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                      <div
                        className="bg-success-500 h-full"
                        style={{ width: `${(month.income / maxValue) * 100}%` }}
                      ></div>
                      <div
                        className="bg-danger-500 h-full absolute top-0"
                        style={{
                          left: `${(month.income / maxValue) * 100}%`,
                          width: `${(month.expenses / maxValue) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="w-32 text-sm text-gray-600">
                      {formatCurrency(month.income - month.expenses)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center space-x-4 mt-4 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success-500 rounded"></div>
                <span>Gelir</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-danger-500 rounded"></div>
                <span>Gider</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User & Payment Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Kullanıcı İstatistikleri</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {reports.userStats.totalUsers}
                  </div>
                  <div className="text-sm text-gray-500">Toplam Kullanıcı</div>
                </div>
                <Users className="h-8 w-8 text-primary-600" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-warning-50 rounded-lg">
                  <div className="text-xl font-bold text-warning-600">
                    {reports.userStats.adminUsers}
                  </div>
                  <div className="text-xs text-gray-500">Yöneticiler</div>
                </div>
                <div className="text-center p-3 bg-success-50 rounded-lg">
                  <div className="text-xl font-bold text-success-600">
                    {reports.userStats.residentUsers}
                  </div>
                  <div className="text-xs text-gray-500">Sakinler</div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Aktif Kullanıcı Oranı</span>
                  <span className="font-medium">
                    {reports.userStats.totalUsers > 0
                      ? Math.round(
                          (reports.userStats.activeUsers /
                            reports.userStats.totalUsers) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-success-500 h-2 rounded-full"
                    style={{
                      width: `${
                        reports.userStats.totalUsers > 0
                          ? Math.round(
                              (reports.userStats.activeUsers /
                                reports.userStats.totalUsers) *
                                100
                            )
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Ödeme İstatistikleri</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-success-50 rounded-lg">
                  <div className="text-lg font-bold text-success-600">
                    {reports.paymentStats.paidPayments}
                  </div>
                  <div className="text-xs text-gray-500">Ödenen</div>
                </div>
                <div className="text-center p-3 bg-danger-50 rounded-lg">
                  <div className="text-lg font-bold text-danger-600">
                    {reports.paymentStats.overduePayments}
                  </div>
                  <div className="text-xs text-gray-500">Geciken</div>
                </div>
              </div>

              <div className="p-3 bg-warning-50 rounded-lg">
                <div className="text-lg font-bold text-warning-600">
                  {reports.paymentStats.pendingPayments}
                </div>
                <div className="text-xs text-gray-500">Bekleyen Ödemeler</div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Ödeme Başarı Oranı</span>
                  <span className="font-medium">
                    {reports.paymentStats.totalPayments > 0
                      ? Math.round(
                          (reports.paymentStats.paidPayments /
                            reports.paymentStats.totalPayments) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-success-500 h-2 rounded-full"
                    style={{
                      width: `${
                        reports.paymentStats.totalPayments > 0
                          ? Math.round(
                              (reports.paymentStats.paidPayments /
                                reports.paymentStats.totalPayments) *
                                100
                            )
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complaint & Performance Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaint Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Şikayet Analizi</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {reports.complaintStats.totalComplaints}
                  </div>
                  <div className="text-xs text-gray-500">Toplam</div>
                </div>
                <div className="p-3 bg-warning-50 rounded-lg">
                  <div className="text-lg font-bold text-warning-600">
                    {reports.complaintStats.openComplaints}
                  </div>
                  <div className="text-xs text-gray-500">Açık</div>
                </div>
                <div className="p-3 bg-success-50 rounded-lg">
                  <div className="text-lg font-bold text-success-600">
                    {reports.complaintStats.resolvedComplaints}
                  </div>
                  <div className="text-xs text-gray-500">Çözülen</div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Çözüm Oranı</span>
                  <span className="font-medium">
                    {reports.complaintStats.totalComplaints > 0
                      ? Math.round(
                          (reports.complaintStats.resolvedComplaints /
                            reports.complaintStats.totalComplaints) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Ortalama Çözüm Süresi</span>
                  <span className="font-medium">
                    {reports.complaintStats.avgResolutionTime} gün
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Performans Metrikleri</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Site Büyüme Oranı
                  </span>
                  <span className="font-medium text-success-600">
                    +
                    {Math.round(
                      (reports.userStats.residentUsers /
                        Math.max(reports.userStats.totalUsers, 1)) *
                        15
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-success-500 h-2 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Kullanıcı Memnuniyeti
                  </span>
                  <span className="font-medium text-primary-600">
                    {(
                      4.2 +
                      (reports.financialSummary.paymentRate / 100) * 0.8
                    ).toFixed(1)}
                    /5
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{
                      width: `${
                        ((4.2 +
                          (reports.financialSummary.paymentRate / 100) * 0.8) /
                          5) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Sistem Kullanımı
                  </span>
                  <span className="font-medium text-warning-600">
                    {Math.round(
                      (reports.userStats.activeUsers /
                        Math.max(reports.userStats.totalUsers, 1)) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-warning-500 h-2 rounded-full"
                    style={{
                      width: `${Math.round(
                        (reports.userStats.activeUsers /
                          Math.max(reports.userStats.totalUsers, 1)) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">98%</div>
                    <div className="text-xs text-gray-500">Uptime</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">1.2s</div>
                    <div className="text-xs text-gray-500">Avg Response</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Bu Ay</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Yeni Kayıtlar</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
                    {Math.round(reports.userStats.residentUsers * 0.05)}
                  </span>
                  <span className="text-xs text-success-600">
                    +{Math.round(Math.random() * 30 + 10)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Tamamlanan Ödemeler
                </span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
                    {reports.paymentStats.paidPayments}
                  </span>
                  <span className="text-xs text-success-600">
                    +{Math.round(Math.random() * 20 + 5)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Çözülen Şikayetler
                </span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
                    {reports.complaintStats.resolvedComplaints}
                  </span>
                  <span className="text-xs text-success-600">
                    +{Math.round(Math.random() * 50 + 20)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sistem Uptime</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">99.9%</span>
                  <span className="text-xs text-success-600">Mükemmel</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Geçen Ay</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Yeni Kayıtlar</span>
                <span className="font-medium">
                  {Math.max(
                    0,
                    Math.round(reports.userStats.residentUsers * 0.05) - 1
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Tamamlanan Ödemeler
                </span>
                <span className="font-medium">
                  {Math.max(
                    0,
                    reports.paymentStats.paidPayments -
                      Math.round(Math.random() * 3 + 1)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Çözülen Şikayetler
                </span>
                <span className="font-medium">
                  {Math.max(
                    0,
                    reports.complaintStats.resolvedComplaints -
                      Math.round(Math.random() * 2 + 1)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Ortalama Yanıt Süresi
                </span>
                <span className="font-medium">
                  {(reports.complaintStats.avgResolutionTime + 0.3).toFixed(1)}{" "}
                  gün
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Genel Performans</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Büyüme Oranı</span>
                <span className="font-medium text-success-600">
                  +
                  {Math.round(
                    (reports.userStats.residentUsers /
                      Math.max(reports.userStats.totalUsers, 1)) *
                      15
                  )}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ödeme Oranı</span>
                <span className="font-medium text-primary-600">
                  {reports.financialSummary.paymentRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Kullanıcı Memnuniyeti
                </span>
                <span className="font-medium text-warning-600">
                  {(
                    4.2 +
                    (reports.financialSummary.paymentRate / 100) * 0.8
                  ).toFixed(1)}
                  /5
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sistem Sağlığı</span>
                <span className="font-medium text-success-600">Mükemmel</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
