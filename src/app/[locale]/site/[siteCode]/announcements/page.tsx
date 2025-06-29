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
  Megaphone,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: "low" | "normal" | "high" | "urgent";
  authorId: {
    firstName: string;
    lastName: string;
  };
  readBy: string[];
  createdAt: string;
}

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const params = useParams();
  const siteCode = params.siteCode as string;

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Create announcement form
  const [createForm, setCreateForm] = useState({
    title: "",
    content: "",
    priority: "normal" as const,
  });

  useEffect(() => {
    if (user?.siteId) {
      fetchAnnouncements();
    }
  }, [user, priorityFilter]);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        priority: priorityFilter,
      });

      const response = await fetch(
        `/api/sites/${user?.siteId}/announcements?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      } else {
        toast.error("Duyurular yüklenemedi");
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/sites/${user?.siteId}/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        toast.success("Duyuru başarıyla oluşturuldu!");
        setShowCreateModal(false);
        fetchAnnouncements();
        setCreateForm({
          title: "",
          content: "",
          priority: "normal",
        });
      } else {
        const error = await response.json();
        toast.error(error.message || "Duyuru oluşturulamadı");
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast.error("Bir hata oluştu");
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-danger-600" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-warning-600" />;
      case "normal":
        return <Info className="h-4 w-4 text-primary-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-success-600" />;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Acil";
      case "high":
        return "Yüksek";
      case "normal":
        return "Normal";
      default:
        return "Düşük";
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "danger" as const;
      case "high":
        return "warning" as const;
      case "normal":
        return "info" as const;
      default:
        return "success" as const;
    }
  };

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const priorityOptions = [
    { value: "all", label: "Tüm Öncelikler" },
    { value: "urgent", label: "Acil" },
    { value: "high", label: "Yüksek" },
    { value: "normal", label: "Normal" },
    { value: "low", label: "Düşük" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Duyurular</h1>
          <p className="text-gray-600">
            Site duyurularını görüntüleyin ve yönetin
          </p>
        </div>
        {user?.role === "site_admin" && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Duyuru Oluştur
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Duyuru ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={priorityOptions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Yükleniyor...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Megaphone className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium mb-2">Duyuru bulunamadı</h4>
              <p className="text-gray-600">
                {searchTerm || priorityFilter !== "all"
                  ? "Arama kriterlerinizi değiştirin"
                  : "Henüz duyuru bulunmuyor"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card
              key={announcement._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(announcement.priority)}
                      <Badge
                        variant={getPriorityVariant(announcement.priority)}
                      >
                        {getPriorityLabel(announcement.priority)}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(announcement.createdAt)}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {announcement.title}
                </h3>

                <div className="text-gray-700 mb-4 whitespace-pre-wrap">
                  {announcement.content}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>
                      Yayınlayan: {announcement.authorId.firstName}{" "}
                      {announcement.authorId.lastName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{announcement.readBy.length} kişi okudu</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Duyuru Oluştur"
          size="lg"
        >
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
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
                { value: "urgent", label: "Acil" },
              ]}
            />

            <Textarea
              label="İçerik"
              value={createForm.content}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  content: e.target.value,
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
              <Button type="submit">Duyuru Oluştur</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
