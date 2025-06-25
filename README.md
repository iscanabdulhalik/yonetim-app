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
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NODE_ENV=development
```

5. **MongoDB'yi başlatın**

```bash
# Local MongoDB için
mongod

# Veya MongoDB Atlas kullanın
```

6. **Veritabanı indexlerini oluşturun**

```bash
npm run create:indexes
```

7. **Super Admin hesabı oluşturun**

```bash
npm run seed:admin
```

Bu komut aşağıdaki bilgilere sahip Super Admin hesabı oluşturacak:

- Email: admin@apartman.com
- Şifre: admin123

8. **Projeyi çalıştırın**

```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## 📱 Kullanım

### İlk Kurulum

1. Super Admin hesabı ile giriş yapın (admin@apartman.com / admin123)
2. Yeni site/apartman ekleyin
3. Site yöneticisi hesabı oluşturun
4. Sakinlerin kayıt olması için site kodunu paylaşın

### Roller ve Yetkiler

**Super Admin:**

- Tüm siteleri yönetir
- Yeni site oluşturabilir
- Sistem geneli istatistikleri görür
- Tüm kullanıcıları yönetir

**Site Admin (Yönetici):**

- Site sakinlerini yönetir
- Aidat oluşturur ve takip eder
- Duyuru yayınlar
- Giderleri kayıt eder
- Şikayetleri yanıtlar
- Oylama başlatır
- Site ayarlarını düzenler

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
│   ├── [locale]/       # Internationalization
│   ├── api/            # API routes
│   └── global.css      # Global styles
├── components/          # React bileşenleri
│   ├── ui/             # Base UI components
│   ├── layout/         # Layout components
│   ├── dashboard/      # Dashboard specific
│   └── admin/          # Admin specific
├── contexts/           # React Context'leri
├── hooks/              # Custom hook'lar
├── lib/                # Utility fonksiyonlar
├── middleware/         # API middleware
├── models/             # MongoDB modelleri
└── types/              # TypeScript type'ları
```

### API Endpoints

#### Authentication

- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/register` - Kullanıcı kaydı
- `GET /api/auth/me` - Kullanıcı bilgileri

#### Sites (Super Admin)

- `GET /api/sites` - Site listesi
- `POST /api/sites` - Yeni site oluşturma
- `GET /api/sites/[siteId]` - Site detayı
- `PUT /api/sites/[siteId]` - Site güncelleme
- `DELETE /api/sites/[siteId]` - Site silme

#### Admin Routes

- `GET /api/admin/stats` - Sistem istatistikleri
- `GET /api/admin/sites` - Tüm siteler (stats ile)
- `GET /api/admin/sites/[siteId]/stats` - Site istatistikleri
- `GET /api/admin/sites/[siteId]/users` - Site kullanıcıları

#### Site Specific Routes

- `GET /api/dashboard/[siteId]` - Dashboard verileri
- `GET /api/sites/[siteId]/announcements` - Duyurular
- `POST /api/sites/[siteId]/announcements` - Duyuru oluşturma
- `GET /api/sites/[siteId]/payments` - Ödemeler
- `POST /api/sites/[siteId]/payments` - Toplu ödeme oluşturma
- `GET /api/sites/[siteId]/expenses` - Giderler
- `POST /api/sites/[siteId]/expenses` - Gider ekleme
- `GET /api/sites/[siteId]/complaints` - Şikayetler
- `POST /api/sites/[siteId]/complaints` - Şikayet oluşturma
- `GET /api/sites/[siteId]/voting` - Oylamalar
- `POST /api/sites/[siteId]/voting` - Oylama oluşturma

### Güvenlik

- JWT tabanlı authentication
- Rol bazlı yetkilendirme
- Input validation (Zod)
- CORS koruması
- Rate limiting (production için önerilir)

## 🚀 Deployment

### Vercel (Önerilen)

1. Vercel'e projeyi yükleyin
2. Environment değişkenlerini ekleyin
3. MongoDB Atlas bağlantısını yapılandırın
4. Build ve deploy

### Manuel Deployment

```bash
npm run build
npm start
```

### Docker (Opsiyonel)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Test

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## 📊 Performans

- MongoDB indexleri optimizasyonu
- API response caching
- Image optimization
- Code splitting
- Lazy loading

## 🔍 Troubleshooting

### Yaygın Sorunlar

1. **MongoDB bağlantı hatası**

   - MONGODB_URI'nin doğru olduğunu kontrol edin
   - MongoDB servisinin çalıştığını doğrulayın

2. **JWT token hatası**

   - JWT_SECRET'in tanımlı olduğunu kontrol edin
   - Token'ın süresi dolmuş olabilir

3. **Build hatası**

   - Node.js sürümünün 18+ olduğunu kontrol edin
   - npm cache'i temizleyin: `npm cache clean --force`

4. **Socket.io bağlantı sorunu**
   - NEXT_PUBLIC_SOCKET_URL'nin doğru olduğunu kontrol edin
   - Firewall ayarlarını kontrol edin

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit'leyin (`git commit -m 'Add amazing feature'`)
4. Push'layın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 Destek

Sorunlar için GitHub Issues kullanın veya iscanabdulhalik@gmail.com ile iletişime geçin.
