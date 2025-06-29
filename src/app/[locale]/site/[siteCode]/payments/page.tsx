"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  CreditCard,
  Plus,
  Search,
  Filter,
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
  notes?: string;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const params = useParams();
  const siteCode = params.siteCode as string;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  // Create payment form
  const [createForm, setCreateForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: 0,
    dueDate: "",
  });

  useEffect(() => {
    if (user?.siteId) {
      fetchPayments();
    }
  }, [user, statusFilter, monthFilter, yearFilter]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        status: statusFilter,
        month: monthFilter.toString(),
        year: yearFilter.toString(),
      });

      const response = await fetch(
        `/api/sites/${user?.siteId}/payments?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

  const handleCreatePayments = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/sites/${user?.siteId}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.count} adet aidat faturası oluşturuldu!`);
        setShowCreateModal(false);
        fetchPayments();
      } else {
        const error = await response.json();
        toast.error(error.message || "Aidat oluşturulamadı");
      }
    } catch (error) {
      console.error("Error creating payments:", error);
      toast.error("Bir hata oluştu");
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "paid",
          paymentMethod: "cash",
        }),
      });

      if (response.ok) {
        toast.success("Ödeme başarıyla kaydedildi!");
        fetchPayments();
      } else {
        toast.error("Ödeme kaydedilemedi");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Bir hata oluştu");
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

  const filteredPayments = payments.filter((payment) => {
    const searchMatch =
      `${payment.userId.firstName} ${payment.userId.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      `${payment.userId.building} ${payment.userId.unitNumber}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return searchMatch;
  });

  const statusOptions = [
    { value: "all", label: "Tüm Durumlar" },
    { value: "pending", label: "Bekliyor" },
    { value: "paid", label: "Ödendi" },
    { value: "overdue", label: "Gecikmiş" },
  ];

  const monthOptions = [
    { value: "1", label: "Ocak" },
    { value: "2", label: "Şubat" },
    { value: "3", label: "Mart" },
    { value: "4", label: "Nisan" },
    { value: "5", label: "Mayıs" },
    { value: "6", label: "Haziran" },
    { value: "7", label: "Temmuz" },
    { value: "8", label: "Ağustos" },
    { value: "9", label: "Eylül" },
    { value: "10", label: "Ekim" },
    { value: "11", label: "Kasım" },
    { value: "12", label: "Aralık" },
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: currentYear.toString(), label: currentYear.toString() },
    {
      value: (currentYear - 1).toString(),
      label: (currentYear - 1).toString(),
    },
    {
      value: (currentYear + 1).toString(),
      label: (currentYear + 1).toString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aidat Takibi</h1>
          <p className="text-gray-600">Aylık aidat ödemelerini takip edin</p>
        </div>
        {user?.role === "site_admin" && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Aidat Oluştur
          </Button>
        )}
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

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Sakin ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
            <Select
              value={monthFilter.toString()}
              onChange={(e) => setMonthFilter(parseInt(e.target.value))}
              options={monthOptions}
            />
            <Select
              value={yearFilter.toString()}
              onChange={(e) => setYearFilter(parseInt(e.target.value))}
              options={yearOptions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ödemeler ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Yükleniyor...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium mb-2">Ödeme bulunamadı</h4>
              <p>Arama kriterlerinizi değiştirin</p>
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
                    {user?.role === "site_admin" && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
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
                      {user?.role === "site_admin" && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {payment.status !== "paid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsPaid(payment._id)}
                            >
                              Ödendi İşaretle
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Payments Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Aidat Oluştur"
          size="lg"
        >
          <form onSubmit={handleCreatePayments} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                Bu işlem tüm aktif sakinler için aidat faturası oluşturacaktır.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Ay"
                value={createForm.month.toString()}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    month: parseInt(e.target.value),
                  }))
                }
                options={monthOptions}
              />
              <Select
                label="Yıl"
                value={createForm.year.toString()}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    year: parseInt(e.target.value),
                  }))
                }
                options={yearOptions}
              />
            </div>

            <Input
              label="Aidat Tutarı"
              type="number"
              min="0"
              step="0.01"
              value={createForm.amount}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  amount: parseFloat(e.target.value) || 0,
                }))
              }
              helperText="Boş bırakırsanız site varsayılan tutarı kullanılır"
            />

            <Input
              label="Son Ödeme Tarihi"
              type="date"
              value={createForm.dueDate}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  dueDate: e.target.value,
                }))
              }
              required
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                İptal
              </Button>
              <Button type="submit">Aidat Oluştur</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
