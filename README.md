<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=Asisten%20Produktif&fontSize=50&fontColor=fff&animation=twinkling&fontAlignY=35&desc=Telegram%20Bot%20Produktivitas%20Harian&descAlignY=55&descSize=18" width="100%"/>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" /></a>
  <a href="#"><img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Deploy-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Bot-Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" /></a>
  <a href="#"><img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" /></a>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/github/stars/yourusername/asisten-produktif?style=social" /></a>
  <a href="#"><img src="https://img.shields.io/github/forks/yourusername/asisten-produktif?style=social" /></a>
  <a href="#"><img src="https://img.shields.io/github/watchers/yourusername/asisten-produktif?style=social" /></a>
</p>

---

<h1 align="center">🎯 Asisten Produktif</h1>

<p align="center">
  <b>Telegram Bot canggih untuk tracking produktivitas harian kamu</b><br/>
  Multi-user • Weekly Schedule • Smart Reset • Progress Tracking • Cloud Deployed
</p>

<p align="center">
  <a href="#-demo">Demo</a> •
  <a href="#-fitur-utama">Fitur</a> •
  <a href="#-arsitektur">Arsitektur</a> •
  <a href="#-instalasi">Instalasi</a> •
  <a href="#-perintah-bot">Perintah</a> •
  <a href="#-database">Database</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-kontribusi">Kontribusi</a>
</p>

---

## 📸 Demo

> Berikut tampilan bot saat digunakan:

| Checklist Harian | Progress Mingguan | Manajemen Kategori |
|:-:|:-:|:-:|
| `📋 Tampilan daftar kegiatan hari ini` | `📊 Grafik progress per kategori` | `📂 CRUD kategori & kegiatan` |

---

## ✨ Fitur Utama

<table>
  <thead>
    <tr>
      <th>🔧 Fitur</th>
      <th>📋 Deskripsi</th>
      <th>📌 Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>📂 <b>Kategori System</b></td>
      <td>Kategori bawaan: Ibadah, Olahraga, Belajar. Bisa tambah kategori custom sesuai kebutuhan.</td>
      <td>✅ Aktif</td>
    </tr>
    <tr>
      <td>📅 <b>Weekly Schedule</b></td>
      <td>Atur jadwal kegiatan per hari (Senin–Minggu). Jadwal berlaku berulang selamanya setiap minggu.</td>
      <td>✅ Aktif</td>
    </tr>
    <tr>
      <td>✅ <b>Checklist Harian</b></td>
      <td>Tampilan interaktif tap-to-complete dengan update progress secara real-time.</td>
      <td>✅ Aktif</td>
    </tr>
    <tr>
      <td>🔄 <b>Smart Reset</b></td>
      <td>Reset otomatis setiap jam 03:00 WIB berdasarkan effective date. Tidak mengganggu kegiatan malam.</td>
      <td>✅ Aktif</td>
    </tr>
    <tr>
      <td>📊 <b>Progress Tracking</b></td>
      <td>Lihat progress per kategori maupun overall progress dalam bentuk yang mudah dipahami.</td>
      <td>✅ Aktif</td>
    </tr>
    <tr>
      <td>🗑️ <b>Soft Management</b></td>
      <td>CRUD lengkap: Tambah, Lihat, Edit, Hapus kegiatan dengan konfirmasi sebelum delete.</td>
      <td>✅ Aktif</td>
    </tr>
    <tr>
      <td>☁️ <b>Cloud Ready</b></td>
      <td>Deployed ke Railway dengan database Neon PostgreSQL. Uptime tinggi, tidak perlu VPS.</td>
      <td>✅ Aktif</td>
    </tr>
    <tr>
      <td>🔒 <b>Multi-User</b></td>
      <td>Setiap pengguna memiliki data terisolasi berdasarkan Telegram user_id.</td>
      <td>✅ Aktif</td>
    </tr>
    <tr>
      <td>🔔 <b>Notifikasi Pengingat</b></td>
      <td>Kirim reminder otomatis jika ada kegiatan yang belum selesai di sore hari.</td>
      <td>🚧 Coming Soon</td>
    </tr>
    <tr>
      <td>📈 <b>Laporan Mingguan</b></td>
      <td>Kirim rekap otomatis setiap minggu berisi statistik dan tren produktivitas.</td>
      <td>🚧 Coming Soon</td>
    </tr>
  </tbody>
</table>

---

## 🏗 Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                    TELEGRAM CLIENT                       │
│              (User berinteraksi via chat)                │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS Webhook / Polling
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   RAILWAY CLOUD                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Node.js Application                  │  │
│  │                                                   │  │
│  │  ┌─────────────┐    ┌──────────────────────────┐  │  │
│  │  │  Bot Engine  │    │     Business Logic        │  │  │
│  │  │ (node-tele- │───▶│  - Kategori Manager      │  │  │
│  │  │  gram-bot)  │    │  - Schedule Engine       │  │  │
│  │  └─────────────┘    │  - Progress Tracker      │  │  │
│  │                     │  - Smart Reset Cron      │  │  │
│  │                     └──────────────────────────┘  │  │
│  │                               │                   │  │
│  └───────────────────────────────┼───────────────────┘  │
└──────────────────────────────────┼──────────────────────┘
                                   │ PostgreSQL Connection
                                   ▼
┌─────────────────────────────────────────────────────────┐
│                  NEON PostgreSQL                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  users   │  │categories│  │activities│  │ logs   │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 📁 Struktur Direktori

```
asisten-produktif/
│
├── 📁 src/
│   ├── 📁 commands/          # Handler setiap perintah bot
│   │   ├── start.js          # Onboarding user baru
│   │   ├── checklist.js      # Tampilan & interaksi checklist
│   │   ├── kategori.js       # Manajemen kategori
│   │   ├── kegiatan.js       # CRUD kegiatan
│   │   ├── jadwal.js         # Weekly schedule manager
│   │   └── progress.js       # Tampilan progress & statistik
│   │
│   ├── 📁 database/          # Lapisan database
│   │   ├── connection.js     # Koneksi ke Neon PostgreSQL
│   │   ├── migrations/       # File migrasi skema
│   │   └── queries/          # Query SQL terorganisir
│   │
│   ├── 📁 jobs/              # Scheduled tasks
│   │   ├── smartReset.js     # Reset harian jam 03:00
│   │   └── weeklyReport.js   # Laporan mingguan (coming soon)
│   │
│   ├── 📁 utils/             # Fungsi utilitas
│   │   ├── formatter.js      # Format teks & emoji
│   │   ├── dateHelper.js     # Logika tanggal & effective date
│   │   └── validator.js      # Validasi input user
│   │
│   └── index.js              # Entry point aplikasi
│
├── 📁 migrations/            # Database migration files
├── .env.example              # Template environment variables
├── package.json
├── railway.json              # Konfigurasi Railway deployment
└── README.md
```

---

## 🔄 Alur Kerja (Flow)

```
User ketik /mulai
        │
        ▼
   Cek user di DB
        │
   ┌────┴────┐
   │  Baru?  │
   └────┬────┘
     Ya │             Tidak
        ▼               ▼
  Buat profil     Load profil
  user baru       yang ada
        │               │
        └───────┬────────┘
                ▼
        Tampilkan Menu Utama
                │
      ┌─────────┼──────────┐
      ▼         ▼          ▼
  Checklist  Jadwal    Progress
      │         │          │
  [tap item] [atur hari] [lihat stats]
      │
      ▼
  Update status
  di database
      │
      ▼
  Refresh progress
  real-time
```

---

## 🛠 Tech Stack

| Layer | Teknologi | Versi | Keterangan |
|-------|-----------|-------|------------|
| **Runtime** | Node.js | 18+ | JavaScript runtime |
| **Bot Framework** | node-telegram-bot-api | Latest | Telegram Bot API wrapper |
| **Database** | PostgreSQL (Neon) | 15+ | Serverless PostgreSQL |
| **DB Client** | pg (node-postgres) | Latest | PostgreSQL client |
| **Scheduler** | node-cron | Latest | Cron jobs untuk smart reset |
| **Deployment** | Railway | - | Cloud hosting platform |
| **Environment** | dotenv | Latest | Manajemen env variables |

---

## ⚙️ Instalasi & Setup Lokal

### Prerequisites

Pastikan kamu sudah menginstall:

- [Node.js](https://nodejs.org/) versi 18 atau lebih baru
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)
- Akun [Telegram](https://telegram.org/) untuk membuat bot
- Akun [Neon](https://neon.tech/) untuk database (gratis)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/asisten-produktif.git
cd asisten-produktif
```

### 2️⃣ Install Dependencies

```bash
npm install
# atau
yarn install
```

### 3️⃣ Buat Bot Telegram

1. Buka Telegram, cari **@BotFather**
2. Kirim `/newbot`
3. Ikuti instruksi — masukkan nama dan username bot
4. Salin **Bot Token** yang diberikan

### 4️⃣ Setup Database Neon

1. Daftar di [neon.tech](https://neon.tech/)
2. Buat project baru
3. Salin **Connection String** dari dashboard
4. Jalankan migrasi database:

```bash
npm run migrate
```

### 5️⃣ Konfigurasi Environment

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Isi dengan nilai yang sesuai:

```env
# ==========================================
# BOT CONFIGURATION
# ==========================================
BOT_TOKEN=your_telegram_bot_token_here
BOT_USERNAME=your_bot_username

# ==========================================
# DATABASE CONFIGURATION
# ==========================================
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# ==========================================
# APP CONFIGURATION
# ==========================================
NODE_ENV=development
RESET_HOUR=3          # Jam reset harian (default: 03:00)
TIMEZONE=Asia/Jakarta  # Timezone aplikasi
```

### 6️⃣ Jalankan Bot

```bash
# Development mode (dengan auto-reload)
npm run dev

# Production mode
npm start
```

Jika berhasil, kamu akan melihat output:

```
✅ Database connected successfully
🤖 Bot is running...
⏰ Smart Reset scheduled at 03:00 Asia/Jakarta
```

---

## 📱 Perintah Bot

### 🏠 Menu Utama

| Perintah | Alias | Deskripsi |
|----------|-------|-----------|
| `/start` | `/mulai` | Memulai bot & onboarding user baru |
| `/menu` | `/help` | Tampilkan semua perintah yang tersedia |
| `/hari_ini` | `/checklist` | Tampilkan checklist kegiatan hari ini |
| `/progress` | `/stats` | Lihat progress harian & mingguan |

### 📂 Manajemen Kategori

| Perintah | Deskripsi | Contoh |
|----------|-----------|--------|
| `/kategori` | Lihat semua kategori | `/kategori` |
| `/tambah_kategori` | Tambah kategori baru | `/tambah_kategori Hobi` |
| `/hapus_kategori` | Hapus kategori | `/hapus_kategori 3` |

### 📝 Manajemen Kegiatan

| Perintah | Deskripsi | Contoh |
|----------|-----------|--------|
| `/kegiatan` | Lihat semua kegiatan | `/kegiatan` |
| `/tambah` | Tambah kegiatan baru | `/tambah Sholat Subuh` |
| `/edit` | Edit nama kegiatan | `/edit 5 Sholat Subuh Berjamaah` |
| `/hapus` | Hapus kegiatan | `/hapus 5` |

### 📅 Manajemen Jadwal

| Perintah | Deskripsi | Contoh |
|----------|-----------|--------|
| `/jadwal` | Lihat jadwal mingguan | `/jadwal` |
| `/atur_jadwal` | Set jadwal kegiatan per hari | `/atur_jadwal 5 senin,rabu,jumat` |
| `/hapus_jadwal` | Hapus jadwal kegiatan tertentu | `/hapus_jadwal 5 selasa` |

### 📊 Progress & Statistik

| Perintah | Deskripsi |
|----------|-----------|
| `/progress` | Progress harian keseluruhan |
| `/progress_kategori` | Progress per kategori hari ini |
| `/riwayat` | Riwayat 7 hari terakhir |

---

## 🗃 Database Schema

### Tabel `users`

```sql
CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  telegram_id  BIGINT UNIQUE NOT NULL,
  username     VARCHAR(100),
  full_name    VARCHAR(200),
  timezone     VARCHAR(50) DEFAULT 'Asia/Jakarta',
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);
```

### Tabel `categories`

```sql
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  user_id     BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  emoji       VARCHAR(10) DEFAULT '📌',
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### Tabel `activities`

```sql
CREATE TABLE activities (
  id           SERIAL PRIMARY KEY,
  user_id      BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
  category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name         VARCHAR(200) NOT NULL,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);
```

### Tabel `schedules`

```sql
CREATE TABLE schedules (
  id          SERIAL PRIMARY KEY,
  activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
  user_id     BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,  -- 0=Minggu, 1=Senin, ..., 6=Sabtu
  UNIQUE(activity_id, day_of_week)
);
```

### Tabel `daily_logs`

```sql
CREATE TABLE daily_logs (
  id            SERIAL PRIMARY KEY,
  user_id       BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
  activity_id   INTEGER REFERENCES activities(id) ON DELETE CASCADE,
  effective_date DATE NOT NULL,
  is_done       BOOLEAN DEFAULT FALSE,
  done_at       TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, activity_id, effective_date)
);
```

### Entity Relationship Diagram

```
users ──────┬──── categories
            │          │
            ├──── activities ──── schedules
            │          │
            └──── daily_logs
```

---

## 🔄 Smart Reset Logic

Smart Reset adalah fitur inti yang memastikan checklist me-reset secara cerdas tanpa mengganggu kegiatan malam hari.

### Bagaimana Cara Kerjanya?

```
Waktu Sekarang       Effective Date (Tanggal Aktif)
─────────────────    ─────────────────────────────
00:00 – 02:59    →   Tanggal KEMARIN (masih dianggap "malam kemarin")
03:00 – 23:59    →   Tanggal HARI INI (hari baru dimulai)
```

**Contoh:**
- Kamu membuka bot jam **02:30** tengah malam → masih menampilkan checklist **kemarin**
- Jam **03:01** → bot secara otomatis menampilkan checklist **hari ini** yang fresh

### Implementasi Cron Job

```javascript
// Cron berjalan setiap hari jam 03:00 WIB
cron.schedule('0 3 * * *', async () => {
  await generateDailyLogs();
  console.log('✅ Daily logs generated for new effective date');
}, {
  timezone: 'Asia/Jakarta'
});
```

---

## ☁️ Deployment ke Railway

### Langkah-langkah Deploy

**1. Persiapan**

```bash
# Pastikan kode sudah di-push ke GitHub
git add .
git commit -m "feat: ready for deployment"
git push origin main
```

**2. Setup Railway**

1. Buka [railway.app](https://railway.app/) dan login dengan GitHub
2. Klik **New Project** → **Deploy from GitHub repo**
3. Pilih repository `asisten-produktif`
4. Railway akan otomatis mendeteksi Node.js

**3. Tambah Environment Variables**

Di dashboard Railway, buka tab **Variables** dan tambahkan:

```
BOT_TOKEN         = [token dari BotFather]
DATABASE_URL      = [connection string dari Neon]
NODE_ENV          = production
TIMEZONE          = Asia/Jakarta
RESET_HOUR        = 3
```

**4. Konfigurasi `railway.json`**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**5. Deploy!**

Railway akan otomatis build dan deploy. Pantau log di tab **Deployments**.

### Monitoring

```bash
# Cek status deployment via Railway CLI
railway logs
railway status
```

---

## 🔐 Keamanan

- ✅ **Isolasi Data**: Setiap user hanya bisa melihat dan mengubah data miliknya sendiri
- ✅ **Validasi Input**: Semua input dari user divalidasi sebelum diproses
- ✅ **SQL Injection Prevention**: Menggunakan parameterized queries
- ✅ **Environment Variables**: Semua kredensial disimpan di `.env`, tidak hardcoded
- ✅ **HTTPS**: Semua komunikasi melalui HTTPS (Railway & Telegram API)

---

## 🧪 Testing

```bash
# Jalankan semua test
npm test

# Jalankan test dengan coverage
npm run test:coverage

# Jalankan test spesifik
npm test -- --grep "Smart Reset"
```

---

## 📊 Performa & Limitasi

| Parameter | Nilai |
|-----------|-------|
| Max kegiatan per user | 50 kegiatan |
| Max kategori per user | 20 kategori |
| Response time | < 500ms (rata-rata) |
| Uptime target | 99.9% |
| Database connection pool | 10 koneksi |

---

## 🤝 Kontribusi

Kontribusi sangat disambut! Berikut cara berkontribusinya:

### 1. Fork & Clone

```bash
git fork https://github.com/yourusername/asisten-produktif
git clone https://github.com/YOUR_USERNAME/asisten-produktif
```

### 2. Buat Branch Baru

```bash
git checkout -b feat/nama-fitur-kamu
# atau
git checkout -b fix/nama-bug-yang-difix
```

### 3. Commit dengan Format yang Benar

Gunakan [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: tambah fitur notifikasi pengingat"
git commit -m "fix: perbaiki bug reset di timezone tertentu"
git commit -m "docs: update README bagian deployment"
```

### 4. Push & Pull Request

```bash
git push origin feat/nama-fitur-kamu
```

Buka Pull Request ke branch `main` dan isi template PR yang tersedia.

### 📋 Guidelines Kontribusi

- Pastikan semua test lolos sebelum PR
- Tambahkan test untuk fitur baru
- Update dokumentasi jika diperlukan
- Ikuti code style yang sudah ada (gunakan ESLint)

---

## 🐛 Bug Report & Feature Request

Temukan bug atau punya ide fitur baru?

- 🐛 **Bug**: Buka [Issue](https://github.com/yourusername/asisten-produktif/issues) dengan label `bug`
- 💡 **Fitur**: Buka [Issue](https://github.com/yourusername/asisten-produktif/issues) dengan label `enhancement`
- 📖 **Dokumentasi**: Buka [Issue](https://github.com/yourusername/asisten-produktif/issues) dengan label `documentation`

---

## 📋 Roadmap

### v1.0 (Current) ✅
- [x] Multi-user support
- [x] Kategori system (default + custom)
- [x] Weekly schedule
- [x] Checklist harian
- [x] Smart reset jam 03:00
- [x] Progress tracking
- [x] Deploy ke Railway + Neon

### v1.1 (Next) 🚧
- [ ] Notifikasi pengingat sore hari
- [ ] Laporan mingguan otomatis
- [ ] Export data ke CSV

### v2.0 (Future) 💭
- [ ] Dashboard web untuk statistik
- [ ] Integrasi Google Calendar
- [ ] AI-powered insights produktivitas
- [ ] Gamifikasi (streak, poin, badges)

---

## ❓ FAQ

<details>
<summary><b>Q: Bot tidak merespons setelah deploy, kenapa?</b></summary>

Pastikan `BOT_TOKEN` sudah benar di environment variables Railway. Cek juga log deployment untuk error lebih spesifik.
</details>

<details>
<summary><b>Q: Bagaimana cara reset manual tanpa menunggu jam 03:00?</b></summary>

Gunakan perintah `/reset_manual` (khusus admin). Untuk user biasa, reset akan berjalan otomatis sesuai jadwal.
</details>

<details>
<summary><b>Q: Apakah data saya aman jika bot restart?</b></summary>

Ya, semua data disimpan di Neon PostgreSQL yang persisten. Restart bot tidak akan menghilangkan data apapun.
</details>

<details>
<summary><b>Q: Bisa digunakan untuk grup Telegram?</b></summary>

Saat ini bot hanya mendukung private chat (1-on-1). Dukungan grup ada di roadmap v2.0.
</details>

<details>
<summary><b>Q: Bagaimana cara mengganti timezone?</b></summary>

Saat ini timezone dikonfigurasi secara global di environment variable `TIMEZONE`. Konfigurasi timezone per-user ada di roadmap.
</details>

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License** — bebas digunakan, dimodifikasi, dan didistribusikan.

Lihat file [LICENSE](./LICENSE) untuk detail lengkap.

---

## 🙏 Acknowledgments

- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) — Library bot Telegram terbaik untuk Node.js
- [Neon](https://neon.tech/) — Serverless PostgreSQL yang luar biasa
- [Railway](https://railway.app/) — Platform deployment yang simpel dan powerful
- Semua [kontributor](https://github.com/yourusername/asisten-produktif/graphs/contributors) yang telah membantu proyek ini

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%"/>
</p>

<p align="center">
  Dibuat dengan ❤️ oleh <a href="https://github.com/yourusername"><b>@yourusername</b></a><br/>
  ⭐ Jangan lupa beri bintang kalau bermanfaat!
</p>

<p align="center">
  <a href="https://t.me/your_bot_username">
    <img src="https://img.shields.io/badge/Try%20the%20Bot-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" />
  </a>
</p>