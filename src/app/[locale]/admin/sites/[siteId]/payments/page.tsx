"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

interface Payment {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    building?: string;
    unitNumber?: string;
  };
  amount: number;
  month: number;
  year: number;
  dueDate: string;
  paidDate?: string;
  status: "pending" | "paid" | "overdue";
  paymentMethod?: string;
}

export default function AdminSitePaymentsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const siteId = params.siteId as string;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "super_admin") {
      router.push("/tr/auth/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === "super_admin" && siteId) {
      fetchPayments();
    }
  }, [user, siteId]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/sites/${siteId}/payments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
        setStats(data.stats || []);
      } else {
        toast.error("Ödemeler yüklenemedi");
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-success-600" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-danger-600" />;
      default:
        return <Clock className="h-4 w-4 text-warning-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Ödendi";
      case "overdue":
        return "Gecikmiş";
      default:
        return "Bekliyor";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "success" as const;
      case "overdue":
        return "danger" as const;
      default:
        return "warning" as const;
    }
  };

  const getMonthName = (month: number) => {
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
    return months[month - 1];
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
            <h1 className="text-2xl font-bold text-gray-900">Site Ödemeleri</h1>
            <p className="text-gray-600">Ödeme durumlarını görüntüleyin</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card key={stat._id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {getStatusLabel(stat._id)}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.count}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(stat.total || 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                    {getStatusIcon(stat._id)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Son Ödemeler ({payments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium mb-2">Ödeme bulunamadı</h4>
              <p>Henüz ödeme kaydı bulunmuyor</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sakin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dönem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Son Ödeme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.slice(0, 20).map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.userId.firstName} {payment.userId.lastName}
                          </div>
                          {payment.userId.building &&
                            payment.userId.unitNumber && (
                              <div className="text-sm text-gray-500">
                                {payment.userId.building} Blok -{" "}
                                {payment.userId.unitNumber}
                              </div>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getMonthName(payment.month)} {payment.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.paidDate ? (
                          <div>
                            <div>{formatDate(payment.paidDate)}</div>
                            {payment.paymentMethod && (
                              <div className="text-xs text-gray-500">
                                {payment.paymentMethod}
                              </div>
                            )}
                          </div>
                        ) : (
                          formatDate(payment.dueDate)
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusVariant(payment.status)}>
                          {getStatusLabel(payment.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
