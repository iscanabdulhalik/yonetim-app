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
  Download,
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
    monthlyData: [
      { month: "Ocak", income: 45000, expenses: 28000, payments: 25 },
      { month: "Şubat", income: 47000, expenses: 32000, payments: 27 },
      { month: "Mart", income: 44000, expenses: 29000, payments: 24 },
      { month: "Nisan", income: 48000, expenses: 31000, payments: 28 },
      { month: "Mayıs", income: 46000, expenses: 30000, payments: 26 },
      { month: "Haziran", income: 49000, expenses: 33000, payments: 29 },
    ],
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
      const response = await fetch(`/api/admin/sites/${siteId}/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReports({
          financialSummary: {
            totalIncome: data.stats.totalPayments || 0,
            totalExpenses: data.stats.totalExpenses || 0,
            netProfit:
              (data.stats.totalPayments || 0) - (data.stats.totalExpenses || 0),
            paymentRate: 85,
          },
          userStats: {
            totalUsers: data.stats.totalUsers || 0,
            activeUsers: data.stats.totalUsers || 0,
            adminUsers: data.stats.adminUsers || 0,
            residentUsers: data.stats.residentUsers || 0,
          },
          monthlyData: [
            { month: "Ocak", income: 45000, expenses: 28000, payments: 25 },
            { month: "Şubat", income: 47000, expenses: 32000, payments: 27 },
            { month: "Mart", income: 44000, expenses: 29000, payments: 24 },
            { month: "Nisan", income: 48000, expenses: 31000, payments: 28 },
            { month: "Mayıs", income: 46000, expenses: 30000, payments: 26 },
            { month: "Haziran", income: 49000, expenses: 33000, payments: 29 },
          ],
          paymentStats: {
            totalPayments: 180,
            paidPayments: 153,
            pendingPayments: 15,
            overduePayments: 12,
          },
          complaintStats: {
            totalComplaints: 45,
            openComplaints: 8,
            resolvedComplaints: 37,
            avgResolutionTime: 3.2,
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

  const generateReport = (type: string) => {
    toast.success(`${type} raporu oluşturuluyor...`);
    // Simulated download delay
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = "#";
      link.download = `${type
        .toLowerCase()
        .replace(" ", "_")}_${new Date().getTime()}.pdf`;
      link.click();
      toast.success(`${type} raporu hazır!`);
    }, 2000);
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
              <p className="text-xs text-success-600 mt-1">+12% artış</p>
            </div>
            <div className="text-center p-4 bg-danger-50 rounded-lg">
              <div className="text-2xl font-bold text-danger-600">
                {formatCurrency(reports.financialSummary.totalExpenses)}
              </div>
              <p className="text-sm text-gray-500">Toplam Gider</p>
              <p className="text-xs text-danger-600 mt-1">+5% artış</p>
            </div>
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">
                {formatCurrency(reports.financialSummary.netProfit)}
              </div>
              <p className="text-sm text-gray-500">Net Kar</p>
              <p className="text-xs text-primary-600 mt-1">+18% artış</p>
            </div>
            <div className="text-center p-4 bg-warning-50 rounded-lg">
              <div className="text-2xl font-bold text-warning-600">
                %{reports.financialSummary.paymentRate}
              </div>
              <p className="text-sm text-gray-500">Ödeme Oranı</p>
              <p className="text-xs text-warning-600 mt-1">+3% iyileşme</p>
            </div>
          </div>

          {/* Monthly Chart Simulation */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">
              Aylık Gelir-Gider Analizi
            </h4>
            <div className="space-y-3">
              {reports.monthlyData.map((month, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-16 text-sm text-gray-600">
                    {month.month}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                    <div
                      className="bg-success-500 h-full"
                      style={{ width: `${(month.income / 50000) * 100}%` }}
                    ></div>
                    <div
                      className="bg-danger-500 h-full absolute top-0"
                      style={{
                        left: `${(month.income / 50000) * 100}%`,
                        width: `${(month.expenses / 50000) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="w-32 text-sm text-gray-600">
                    {formatCurrency(month.income - month.expenses)}
                  </div>
                </div>
              ))}
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
                  <span className="font-medium">95%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-success-500 h-2 rounded-full"
                    style={{ width: "95%" }}
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
                  <span className="font-medium">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-success-500 h-2 rounded-full"
                    style={{ width: "85%" }}
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
                  <span className="font-medium">82%</span>
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
                  <span className="font-medium text-success-600">+15%</span>
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
                  <span className="font-medium text-primary-600">4.5/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: "90%" }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Sistem Kullanımı
                  </span>
                  <span className="font-medium text-warning-600">78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-warning-500 h-2 rounded-full"
                    style={{ width: "78%" }}
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
                    <div className="text-lg font-bold text-gray-900">2.3s</div>
                    <div className="text-xs text-gray-500">Avg Response</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Rapor Oluştur ve İndir</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Button
              variant="outline"
              className="w-full justify-start h-16"
              onClick={() => generateReport("Mali Rapor")}
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-success-50 rounded-lg flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-success-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Mali Rapor</div>
                  <div className="text-sm text-gray-500">
                    Gelir, gider ve kar analizi
                  </div>
                </div>
              </div>
              <Download className="h-4 w-4 ml-auto" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-16"
              onClick={() => generateReport("Kullanıcı Raporu")}
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Kullanıcı Raporu</div>
                  <div className="text-sm text-gray-500">
                    Kullanıcı aktivite analizi
                  </div>
                </div>
              </div>
              <Download className="h-4 w-4 ml-auto" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-16"
              onClick={() => generateReport("Ödeme Raporu")}
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-warning-50 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-warning-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Ödeme Raporu</div>
                  <div className="text-sm text-gray-500">
                    Aidat ve ödeme detayları
                  </div>
                </div>
              </div>
              <Download className="h-4 w-4 ml-auto" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-16"
              onClick={() => generateReport("Genel Performans Raporu")}
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Performans Raporu</div>
                  <div className="text-sm text-gray-500">
                    Kapsamlı site analizi
                  </div>
                </div>
              </div>
              <Download className="h-4 w-4 ml-auto" />
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  Rapor Oluşturma Bilgileri
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>
                    • Raporlar PDF formatında oluşturulur ve otomatik olarak
                    indirilir
                  </li>
                  <li>
                    • Büyük veri setleri için rapor oluşturma 2-3 dakika
                    sürebilir
                  </li>
                  <li>• Raporlar son 12 aylık veriyi kapsar</li>
                  <li>
                    • Özel tarih aralığı için destek ekibiyle iletişime geçin
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  <span className="font-medium">5</span>
                  <span className="text-xs text-success-600">+25%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Tamamlanan Ödemeler
                </span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">28</span>
                  <span className="text-xs text-success-600">+12%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Çözülen Şikayetler
                </span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">12</span>
                  <span className="text-xs text-success-600">+50%</span>
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
                <span className="font-medium">4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Tamamlanan Ödemeler
                </span>
                <span className="font-medium">25</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Çözülen Şikayetler
                </span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Ortalama Yanıt Süresi
                </span>
                <span className="font-medium">2.1 gün</span>
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
                <span className="font-medium text-success-600">+15%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ödeme Oranı</span>
                <span className="font-medium text-primary-600">92%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Kullanıcı Memnuniyeti
                </span>
                <span className="font-medium text-warning-600">4.5/5</span>
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
