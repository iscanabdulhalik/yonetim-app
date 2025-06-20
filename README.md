# Apartman Yönetim Sistemi

Modern apartman ve site yönetimi için geliştirilmiş kapsamlı platform.

## 🚀 Özellikler

- **Multi-Tenant Yapı**: Her site/apartman için ayrı yönetim
- **Rol Tabanlı Erişim**: Super Admin, Site Admin, Sakin rolleri
- **Aidat Takibi**: Aylık aidat oluşturma ve takip sistemi
- **Duyuru Sistemi**: Öncelik bazlı duyuru yönetimi
- **Gider Yönetimi**: Kategori bazlı gider takibi
- **Şikayet Sistemi**: Sakinlerden gelen şikayet ve dilekler
- **Oylama Sistemi**: Apartman kararları için online oylama
- **Real-time Bildirimler**: Socket.io ile anlık güncellemeler
- **Çoklu Dil Desteği**: Türkçe ve İngilizce
- **Responsive Tasarım**: Mobil uyumlu arayüz

## 🛠 Teknoloji Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **Real-time**: Socket.io
- **Internationalization**: next-intl
- **Charts**: Recharts
- **UI Components**: Headless UI, Lucide React

## 📦 Kurulum

1. **Projeyi klonlayın**

```bash
git clone [repo-url]
cd apartman-yonetim
```

2. **Bağımlılıkları yükleyin**

```bash
npm install
```

3. **Environment dosyasını oluşturun**

```bash
cp .env.example .env.local
```

4. **Environment değişkenlerini düzenleyin**

```env
MONGODB_URI=mongodb://localhost:27017/apartman-yonetim
JWT_SECRET=your-super-secret-jwt-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

5. **MongoDB'yi başlatın**

```bash
# Local MongoDB için
mongod

# Veya MongoDB Atlas kullanın
```

6. **Projeyi çalıştırın**

```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## 📱 Kullanım

### İlk Kurulum

1. Super Admin hesabı oluşturun
2. Yeni site/apartman ekleyin
3. Site yöneticisi hesabı oluşturun
4. Sakinlerin kayıt olması için site kodunu paylaşın

### Roller ve Yetkiler

**Super Admin:**

- Tüm siteleri yönetir
- Yeni site oluşturabilir
- Sistem geneli istatistikleri görür

**Site Admin (Yönetici):**

- Site sakinlerini yönetir
- Aidat oluşturur ve takip eder
- Duyuru yayınlar
- Giderleri kayıt eder
- Şikayetleri yanıtlar
- Oylama başlatır

**Resident (Sakin):**

- Aidat durumunu görür
- Duyuruları okur
- Şikayet/dilek gönderir
- Oylamalara katılır
- Giderleri görüntüler

## 🔧 Geliştirme

### Proje Yapısı

```
src/
├── app/                 # Next.js App Router
├── components/          # React bileşenleri
├── contexts/           # React Context'leri
├── hooks/              # Custom hook'lar
├── lib/                # Utility fonksiyonlar
├── models/             # MongoDB modelleri
└── types/              # TypeScript type'ları
```

### API Endpoints

- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/register` - Kullanıcı kaydı
- `GET /api/auth/me` - Kullanıcı bilgileri
- `GET /api/sites` - Site listesi
- `POST /api/sites` - Yeni site oluşturma
- `GET /api/dashboard/[siteId]` - Dashboard verileri

## 🚀 Deployment

### Vercel (Önerilen)

1. Vercel'e projeyi yükleyin
2. Environment değişkenlerini ekleyin
3. MongoDB Atlas bağlantısını yapılandırın

### Manuel Deployment

```bash
npm run build
npm start
```

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit'leyin (`git commit -m 'Add amazing feature'`)
4. Push'layın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun
