"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Calendar,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";

interface Expense {
  _id: string;
  title: string;
  description?: string;
  amount: number;
  category: string;
  date: string;
  addedBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export default function ExpensesPage() {
  const { user } = useAuth();
  const params = useParams();
  const siteCode = params.siteCode as string;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  // Create expense form
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    amount: 0,
    category: "other",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (user?.siteId) {
      fetchExpenses();
    }
  }, [user, categoryFilter, monthFilter, yearFilter]);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        category: categoryFilter,
        month: monthFilter.toString(),
        year: yearFilter.toString(),
      });

      const response = await fetch(
        `/api/sites/${user?.siteId}/expenses?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
        setTotalAmount(data.totalAmount || 0);
      } else {
        toast.error("Giderler yüklenemedi");
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/sites/${user?.siteId}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        toast.success("Gider başarıyla eklendi!");
        setShowCreateModal(false);
        fetchExpenses();
        setCreateForm({
          title: "",
          description: "",
          amount: 0,
          category: "other",
          date: new Date().toISOString().split("T")[0],
        });
      } else {
        const error = await response.json();
        toast.error(error.message || "Gider eklenemedi");
      }
    } catch (error) {
      console.error("Error creating expense:", error);
      toast.error("Bir hata oluştu");
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      cleaning: "Temizlik",
      maintenance: "Bakım-Onarım",
      security: "Güvenlik",
      utilities: "Elektrik-Su-Doğalgaz",
      landscaping: "Peyzaj",
      insurance: "Sigorta",
      other: "Diğer",
    };
    return categories[category] || category;
  };

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryOptions = [
    { value: "all", label: "Tüm Kategoriler" },
    { value: "cleaning", label: "Temizlik" },
    { value: "maintenance", label: "Bakım-Onarım" },
    { value: "security", label: "Güvenlik" },
    { value: "utilities", label: "Elektrik-Su-Doğalgaz" },
    { value: "landscaping", label: "Peyzaj" },
    { value: "insurance", label: "Sigorta" },
    { value: "other", label: "Diğer" },
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
      value: (currentYear - 2).toString(),
      label: (currentYear - 2).toString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Giderler</h1>
          <p className="text-gray-600">
            Site giderlerini görüntüleyin ve yönetin
          </p>
        </div>
        {user?.role === "site_admin" && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Gider Ekle
          </Button>
        )}
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-danger-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-8 w-8 text-danger-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalAmount)}
              </p>
              <p className="text-sm text-gray-500">
                {
                  monthOptions.find((m) => m.value === monthFilter.toString())
                    ?.label
                }{" "}
                {yearFilter}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Receipt className="h-8 w-8 text-primary-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {expenses.length}
              </p>
              <p className="text-sm text-gray-500">Toplam Gider Kalemi</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-success-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-success-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {expenses.length > 0
                  ? formatCurrency(totalAmount / expenses.length)
                  : formatCurrency(0)}
              </p>
              <p className="text-sm text-gray-500">Ortalama Gider</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Gider ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={categoryOptions}
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

      {/* Expenses List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Yükleniyor...</p>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Receipt className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium mb-2">Gider bulunamadı</h4>
            <p className="text-gray-600">
              {searchTerm || categoryFilter !== "all"
                ? "Arama kriterlerinizi değiştirin"
                : "Henüz gider bulunmuyor"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExpenses.map((expense) => (
            <Card
              key={expense._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {expense.title}
                    </h3>
                    <Badge variant="info">
                      {getCategoryLabel(expense.category)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-danger-600">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                </div>

                {expense.description && (
                  <p className="text-gray-600 text-sm mb-4">
                    {expense.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(expense.date)}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {expense.addedBy.firstName} {expense.addedBy.lastName}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Expense Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Gider Ekle"
          size="lg"
        >
          <form onSubmit={handleCreateExpense} className="space-y-4">
            <Input
              label="Başlık"
              value={createForm.title}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tutar"
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
                required
              />
              <Select
                label="Kategori"
                value={createForm.category}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                options={categoryOptions.filter((opt) => opt.value !== "all")}
              />
            </div>

            <Input
              label="Tarih"
              type="date"
              value={createForm.date}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  date: e.target.value,
                }))
              }
              required
            />

            <Textarea
              label="Açıklama"
              value={createForm.description}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                İptal
              </Button>
              <Button type="submit">Gider Ekle</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
