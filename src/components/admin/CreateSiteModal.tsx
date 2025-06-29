"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

interface CreateSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function CreateSiteModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateSiteModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    buildingCount: 1,
    totalUnits: 1,
    monthlyFee: 0,
    currency: "TRY",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      setFormData({
        name: "",
        address: "",
        phone: "",
        email: "",
        buildingCount: 1,
        totalUnits: 1,
        monthlyFee: 0,
        currency: "TRY",
        adminFirstName: "",
        adminLastName: "",
        adminEmail: "",
        adminPassword: "",
      });
    } catch (error) {
      console.error("Error creating site:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const currencyOptions = [
    { value: "TRY", label: "₺ Türk Lirası" },
    { value: "USD", label: "$ Amerikan Doları" },
    { value: "EUR", label: "€ Euro" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Yeni Site Oluştur"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Site Bilgileri */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Site Bilgileri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Site Adı"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <Input
              label="E-posta"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <div className="md:col-span-2">
              <Textarea
                label="Adres"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                required
              />
            </div>
            <Input
              label="Telefon"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
            <Input
              label="Blok Sayısı"
              name="buildingCount"
              type="number"
              min="1"
              value={formData.buildingCount}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Toplam Daire Sayısı"
              name="totalUnits"
              type="number"
              min="1"
              value={formData.totalUnits}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Aylık Aidat"
              name="monthlyFee"
              type="number"
              min="0"
              step="0.01"
              value={formData.monthlyFee}
              onChange={handleInputChange}
              required
            />
            <Select
              label="Para Birimi"
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              options={currencyOptions}
            />
          </div>
        </div>

        {/* Site Yöneticisi */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Site Yöneticisi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ad"
              name="adminFirstName"
              value={formData.adminFirstName}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Soyad"
              name="adminLastName"
              value={formData.adminLastName}
              onChange={handleInputChange}
              required
            />
            <Input
              label="E-posta"
              name="adminEmail"
              type="email"
              value={formData.adminEmail}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Şifre"
              name="adminPassword"
              type="password"
              value={formData.adminPassword}
              onChange={handleInputChange}
              helperText="En az 6 karakter"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button type="submit" loading={loading}>
            Site Oluştur
          </Button>
        </div>
      </form>
    </Modal>
  );
}
