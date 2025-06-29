import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir email adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  siteCode: z
    .string()
    .min(6, "Site kodu en az 6 karakter olmalıdır")
    .optional(),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir email adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  phone: z.string().optional(),
  building: z.string().optional(),
  unitNumber: z.string().min(1, "Daire numarası gereklidir"),
  siteCode: z.string().min(6, "Site kodu gereklidir"),
});

export const siteSchema = z.object({
  name: z.string().min(2, "Site adı en az 2 karakter olmalıdır"),
  address: z.string().min(10, "Adres en az 10 karakter olmalıdır"),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  buildingCount: z.number().min(1, "En az 1 blok olmalıdır"),
  totalUnits: z.number().min(1, "En az 1 daire olmalıdır"),
  monthlyFee: z.number().min(0, "Aylık aidat 0'dan küçük olamaz"),
  currency: z.enum(["TRY", "USD", "EUR"]),
});

export const announcementSchema = z.object({
  title: z.string().min(5, "Başlık en az 5 karakter olmalıdır"),
  content: z.string().min(10, "İçerik en az 10 karakter olmalıdır"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
});

export const expenseSchema = z.object({
  title: z.string().min(2, "Başlık en az 2 karakter olmalıdır"),
  description: z.string().optional(),
  amount: z.number().min(0, "Tutar 0'dan küçük olamaz"),
  category: z.string().min(2, "Kategori seçiniz"),
  date: z.date(),
});

export const complaintSchema = z.object({
  title: z.string().min(5, "Başlık en az 5 karakter olmalıdır"),
  description: z.string().min(10, "Açıklama en az 10 karakter olmalıdır"),
  category: z.enum(["maintenance", "noise", "security", "cleaning", "other"]),
  priority: z.enum(["low", "normal", "high"]),
});

export const voteSchema = z.object({
  title: z.string().min(5, "Başlık en az 5 karakter olmalıdır"),
  description: z.string().min(10, "Açıklama en az 10 karakter olmalıdır"),
  options: z.array(z.string().min(1)).min(2, "En az 2 seçenek olmalıdır"),
  startDate: z.date(),
  endDate: z.date(),
});
