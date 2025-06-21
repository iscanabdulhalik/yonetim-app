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
import { formatDateTime } from "@/lib/utils";
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: "maintenance" | "noise" | "security" | "cleaning" | "other";
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high";
  userId: {
    firstName: string;
    lastName: string;
    building?: string;
    unitNumber?: string;
  };
  adminResponse?: string;
  respondedBy?: {
    firstName: string;
    lastName: string;
  };
  respondedAt?: string;
  createdAt: string;
}

export default function ComplaintsPage() {
  const { user } = useAuth();
  const params = useParams();
  const siteCode = params.siteCode as string;

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [showResponseModal, setShowResponseModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Create complaint form
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    category: "other" as const,
    priority: "normal" as const,
  });

  // Response form
  const [responseForm, setResponseForm] = useState({
    status: "",
    adminResponse: "",
  });

  useEffect(() => {
    if (user?.siteId) {
      fetchComplaints();
    }
  }, [user, statusFilter, categoryFilter]);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        status: statusFilter,
        category: categoryFilter,
      });

      const response = await fetch(
        `/api/sites/${user?.siteId}/complaints?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComplaints(data.complaints || []);
        setStats(data.stats || []);
      } else {
        toast.error("Şikayetler yüklenemedi");
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/sites/${user?.siteId}/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        toast.success("Şikayet başarıyla oluşturuldu!");
        setShowCreateModal(false);
        fetchComplaints();
        setCreateForm({
          title: "",
          description: "",
          category: "other",
          priority: "normal",
        });
      } else {
        const error = await response.json();
        toast.error(error.message || "Şikayet oluşturulamadı");
      }
    } catch (error) {
      console.error("Error creating complaint:", error);
      toast.error("Bir hata oluştu");
    }
  };

  const handleResponseComplaint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedComplaint) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/complaints/${selectedComplaint._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(responseForm),
      });

      if (response.ok) {
        toast.success("Şikayet yanıtlandı!");
        setShowResponseModal(false);
        setSelectedComplaint(null);
        fetchComplaints();
        setResponseForm({
          status: "",
          adminResponse: "",
        });
      } else {
        toast.error("Şikayet yanıtlanamadı");
      }
    } catch (error) {
      console.error("Error responding to complaint:", error);
      toast.error("Bir hata oluştu");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-success-600" />;
      case "closed":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-warning-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-danger-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Açık";
      case "in_progress":
        return "İşlemde";
      case "resolved":
        return "Çözüldü";
      case "closed":
        return "Kapalı";
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "resolved":
        return "success" as const;
      case "closed":
        return "default" as const;
      case "in_progress":
        return "warning" as const;
      default:
        return "danger" as const;
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      maintenance: "Bakım-Onarım",
      noise: "Gürültü",
      security: "Güvenlik",
      cleaning: "Temizlik",
      other: "Diğer",
    };
    return categories[category] || category;
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "danger" as const;
      case "normal":
        return "warning" as const;
      default:
        return "success" as const;
    }
  };

  const filteredComplaints = complaints.filter(
    (complaint) =>
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusOptions = [
    { value: "all", label: "Tüm Durumlar" },
    { value: "open", label: "Açık" },
    { value: "in_progress", label: "İşlemde" },
    { value: "resolved", label: "Çözüldü" },
    { value: "closed", label: "Kapalı" },
  ];

  const categoryOptions = [
    { value: "all", label: "Tüm Kategoriler" },
    { value: "maintenance", label: "Bakım-Onarım" },
    { value: "noise", label: "Gürültü" },
    { value: "security", label: "Güvenlik" },
    { value: "cleaning", label: "Temizlik" },
    { value: "other", label: "Diğer" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Şikayet ve Dilekler
          </h1>
          <p className="text-gray-600">Şikayetleri görüntüleyin ve yönetin</p>
        </div>
        {user?.role === "resident" && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Şikayet Oluştur
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Şikayet ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={categoryOptions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Complaints List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Yükleniyor...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium mb-2">Şikayet bulunamadı</h4>
              <p className="text-gray-600">
                {searchTerm ||
                statusFilter !== "all" ||
                categoryFilter !== "all"
                  ? "Arama kriterlerinizi değiştirin"
                  : "Henüz şikayet bulunmuyor"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredComplaints.map((complaint) => (
            <Card
              key={complaint._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Badge variant={getStatusVariant(complaint.status)}>
                      {getStatusLabel(complaint.status)}
                    </Badge>
                    <Badge variant="info">
                      {getCategoryLabel(complaint.category)}
                    </Badge>
                    <Badge variant={getPriorityVariant(complaint.priority)}>
                      {complaint.priority === "high"
                        ? "Yüksek"
                        : complaint.priority === "normal"
                        ? "Normal"
                        : "Düşük"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(complaint.createdAt)}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {complaint.title}
                </h3>

                <p className="text-gray-700 mb-4">{complaint.description}</p>

                {complaint.adminResponse && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Yönetici Yanıtı
                      </span>
                    </div>
                    <p className="text-blue-800">{complaint.adminResponse}</p>
                    {complaint.respondedBy && complaint.respondedAt && (
                      <div className="text-xs text-blue-600 mt-2">
                        {complaint.respondedBy.firstName}{" "}
                        {complaint.respondedBy.lastName} -{" "}
                        {formatDateTime(complaint.respondedAt)}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    <span>
                      Şikayet eden: {complaint.userId.firstName}{" "}
                      {complaint.userId.lastName}
                    </span>
                    {complaint.userId.building &&
                      complaint.userId.unitNumber && (
                        <span className="ml-2">
                          ({complaint.userId.building} Blok -{" "}
                          {complaint.userId.unitNumber})
                        </span>
                      )}
                  </div>

                  {user?.role === "site_admin" &&
                    complaint.status !== "closed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setResponseForm({
                            status:
                              complaint.status === "open"
                                ? "in_progress"
                                : "resolved",
                            adminResponse: "",
                          });
                          setShowResponseModal(true);
                        }}
                      >
                        Yanıtla
                      </Button>
                    )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Complaint Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Şikayet Oluştur"
          size="lg"
        >
          <form onSubmit={handleCreateComplaint} className="space-y-4">
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
              <Select
                label="Kategori"
                value={createForm.category}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    category: e.target.value as any,
                  }))
                }
                options={categoryOptions.filter((opt) => opt.value !== "all")}
              />
              <Select
                label="Öncelik"
                value={createForm.priority}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    priority: e.target.value as any,
                  }))
                }
                options={[
                  { value: "low", label: "Düşük" },
                  { value: "normal", label: "Normal" },
                  { value: "high", label: "Yüksek" },
                ]}
              />
            </div>

            <Textarea
              label="Açıklama"
              value={createForm.description}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={6}
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
              <Button type="submit">Şikayet Oluştur</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedComplaint && (
        <Modal
          isOpen={showResponseModal}
          onClose={() => setShowResponseModal(false)}
          title="Şikayeti Yanıtla"
          size="lg"
        >
          <form onSubmit={handleResponseComplaint} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                {selectedComplaint.title}
              </h4>
              <p className="text-gray-600 text-sm">
                {selectedComplaint.description}
              </p>
            </div>

            <Select
              label="Durum"
              value={responseForm.status}
              onChange={(e) =>
                setResponseForm((prev) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
              options={[
                { value: "in_progress", label: "İşlemde" },
                { value: "resolved", label: "Çözüldü" },
                { value: "closed", label: "Kapalı" },
              ]}
              required
            />

            <Textarea
              label="Yanıt"
              value={responseForm.adminResponse}
              onChange={(e) =>
                setResponseForm((prev) => ({
                  ...prev,
                  adminResponse: e.target.value,
                }))
              }
              rows={4}
              required
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowResponseModal(false)}
              >
                İptal
              </Button>
              <Button type="submit">Yanıt Gönder</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
