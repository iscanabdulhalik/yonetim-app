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
import { formatDate } from "@/lib/utils";
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Building2,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

interface SiteUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  building?: string;
  unitNumber?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export default function SiteUsersPage() {
  const { user } = useAuth();
  const params = useParams();
  const siteCode = params.siteCode as string;

  const [users, setUsers] = useState<SiteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [buildingFilter, setBuildingFilter] = useState("all");

  // Create user form
  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "resident" as const,
    building: "",
    unitNumber: "",
  });

  useEffect(() => {
    if (user?.siteId && user.role === "site_admin") {
      fetchUsers();
    }
  }, [user, roleFilter]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        role: roleFilter,
      });

      const response = await fetch(
        `/api/admin/sites/${user?.siteId}/users?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        toast.error("Kullanıcılar yüklenemedi");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/sites/${user?.siteId}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        toast.success("Kullanıcı başarıyla oluşturuldu!");
        setShowCreateModal(false);
        fetchUsers();
        setCreateForm({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          phone: "",
          role: "resident",
          building: "",
          unitNumber: "",
        });
      } else {
        const error = await response.json();
        toast.error(error.message || "Kullanıcı oluşturulamadı");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Bir hata oluştu");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Kullanıcı başarıyla silindi!");
        fetchUsers();
      } else {
        toast.error("Kullanıcı silinemedi");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Bir hata oluştu");
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "site_admin":
        return "Site Yöneticisi";
      case "resident":
        return "Sakin";
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "site_admin":
        return "warning" as const;
      case "resident":
        return "success" as const;
      default:
        return "default" as const;
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchMatch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.building} ${user.unitNumber}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const buildingMatch =
      buildingFilter === "all" || user.building === buildingFilter;

    return searchMatch && buildingMatch;
  });

  const roleOptions = [
    { value: "all", label: "Tüm Roller" },
    { value: "site_admin", label: "Site Yöneticisi" },
    { value: "resident", label: "Sakin" },
  ];

  const buildingOptions = [
    { value: "all", label: "Tüm Bloklar" },
    { value: "A", label: "A Blok" },
    { value: "B", label: "B Blok" },
    { value: "C", label: "C Blok" },
    { value: "D", label: "D Blok" },
    { value: "E", label: "E Blok" },
  ];

  // Redirect if not site admin
  if (user?.role !== "site_admin") {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Erişim Reddedildi
        </h1>
        <p className="text-gray-600">
          Bu sayfaya erişim yetkiniz bulunmamaktadır.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Site Kullanıcıları
          </h1>
          <p className="text-gray-600">
            Site kullanıcılarını görüntüleyin ve yönetin
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-600 text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Kullanıcı Ekle
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Toplam Kullanıcı
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Sakinler</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.role === "resident").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-50 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-success-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Yöneticiler</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.role === "site_admin").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-50 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-warning-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={roleOptions}
            />
            <Select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              options={buildingOptions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcılar ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Yükleniyor...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium mb-2">Kullanıcı bulunamadı</h4>
              <p>Arama kriterlerinizi değiştirin</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Daire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Son Giriş
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-gray-500">
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.building && user.unitNumber
                          ? `${user.building} Blok - ${user.unitNumber}`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin
                          ? formatDate(user.lastLogin)
                          : "Hiç giriş yapmadı"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Edit functionality would go here
                              toast("Düzenleme özelliği yakında...");
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Kullanıcı Ekle"
          size="lg"
        >
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ad"
                value={createForm.firstName}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                required
              />
              <Input
                label="Soyad"
                value={createForm.lastName}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                required
              />
            </div>

            <Input
              label="E-posta"
              type="email"
              value={createForm.email}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              required
            />

            <Input
              label="Şifre"
              type="password"
              value={createForm.password}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              helperText="En az 6 karakter"
              required
            />

            <Input
              label="Telefon"
              type="tel"
              value={createForm.phone}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
            />

            <Select
              label="Rol"
              value={createForm.role}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  role: e.target.value as any,
                }))
              }
              options={[
                { value: "resident", label: "Sakin" },
                { value: "site_admin", label: "Site Yöneticisi" },
              ]}
            />

            {createForm.role === "resident" && (
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Blok"
                  value={createForm.building}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      building: e.target.value,
                    }))
                  }
                  options={[
                    { value: "", label: "Blok seçiniz" },
                    ...buildingOptions.filter((opt) => opt.value !== "all"),
                  ]}
                />
                <Input
                  label="Daire No"
                  value={createForm.unitNumber}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      unitNumber: e.target.value,
                    }))
                  }
                  required={createForm.role === "resident"}
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                İptal
              </Button>
              <Button type="submit">Kullanıcı Oluştur</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
