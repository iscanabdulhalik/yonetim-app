"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import {
  Users,
  Plus,
  Search,
  ArrowLeft,
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

export default function AdminSiteUsersPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const siteId = params.siteId as string;

  const [users, setUsers] = useState<SiteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    if (!user || user.role !== "super_admin") {
      router.push("/tr/auth/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === "super_admin" && siteId) {
      fetchUsers();
    }
  }, [user, siteId, roleFilter]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        role: roleFilter,
      });

      const response = await fetch(
        `/api/admin/sites/${siteId}/users?${queryParams}`,
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

    return searchMatch;
  });

  const roleOptions = [
    { value: "all", label: "Tüm Roller" },
    { value: "site_admin", label: "Site Yöneticisi" },
    { value: "resident", label: "Sakin" },
  ];

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
            <h1 className="text-2xl font-bold text-gray-900">
              Site Kullanıcıları
            </h1>
            <p className="text-gray-600">Site kullanıcılarını yönetin</p>
          </div>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
}
