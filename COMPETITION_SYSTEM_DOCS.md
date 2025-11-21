# 🏆 CTF Competition Management System - Documentation

## 📋 Overview

Sistem manajemen kompetisi CTF yang lengkap dengan fitur admin panel dan user registration. Sistem ini memungkinkan admin untuk membuat dan mengelola kompetisi, memverifikasi pembayaran, dan user untuk mendaftar kompetisi.

---

## 🗄️ Database Structure

### 1. Table: `competitions`
Menyimpan data kompetisi CTF.

**Columns:**
- `id` - SERIAL PRIMARY KEY (auto-increment)
- `name` - VARCHAR(255) - Nama kompetisi
- `description` - TEXT - Deskripsi kompetisi
- `start_date` - TIMESTAMP - Tanggal mulai
- `end_date` - TIMESTAMP - Tanggal selesai
- `registration_deadline` - TIMESTAMP - Deadline pendaftaran
- `max_participants` - INTEGER - Maksimal peserta (optional)
- `difficulty_level` - VARCHAR(50) - Tingkat kesulitan (beginner, intermediate, advanced, expert)
- `prize_pool` - VARCHAR(255) - Hadiah kompetisi
- `status` - VARCHAR(20) - Status kompetisi
  - `upcoming` - Akan datang
  - `registration_open` - Pendaftaran dibuka
  - `registration_closed` - Pendaftaran ditutup
  - `ongoing` - Sedang berlangsung
  - `completed` - Selesai
  - `cancelled` - Dibatalkan
- `category` - VARCHAR(100) - Kategori (international, national, junior, internal)
- `rules` - TEXT - Peraturan kompetisi
- `contact_person` - VARCHAR(255) - Kontak person
- `created_at` - TIMESTAMP - Tanggal dibuat

**Constraints:**
- CHECK: `end_date > start_date`
- CHECK: `registration_deadline <= start_date`
- CHECK: Status harus salah satu dari nilai yang valid
- CHECK: Difficulty level harus salah satu dari nilai yang valid

---

### 2. Table: `competition_registrations`
Junction table untuk relasi many-to-many antara users dan competitions.

**Columns:**
- `id` - SERIAL PRIMARY KEY (auto-increment)
- `user_id` - INTEGER - FK ke users.id
- `competition_id` - INTEGER - FK ke competitions.id
- `team_name` - VARCHAR(255) - Nama tim (optional, untuk solo biarkan NULL)
- `registration_status` - VARCHAR(20) - Status pendaftaran
  - `pending` - Menunggu approval
  - `approved` - Disetujui
  - `rejected` - Ditolak
  - `cancelled` - Dibatalkan
  - `waitlisted` - Daftar tunggu
- `payment_status` - VARCHAR(20) - Status pembayaran
  - `unpaid` - Belum bayar
  - `pending` - Pembayaran pending
  - `paid` - Sudah dibayar
  - `refunded` - Dikembalikan
- `registration_notes` - TEXT - Catatan pendaftaran
- `score` - INTEGER - Score peserta
- `rank` - INTEGER - Ranking peserta
- `registered_at` - TIMESTAMP - Tanggal mendaftar
- `updated_at` - TIMESTAMP - Tanggal update

**Foreign Keys:**
- `user_id` REFERENCES `users(id)` ON DELETE CASCADE
- `competition_id` REFERENCES `competitions(id)` ON DELETE CASCADE

**Constraints:**
- UNIQUE(user_id, competition_id) - Satu user hanya bisa daftar 1x per kompetisi
- CHECK: registration_status harus salah satu dari nilai yang valid
- CHECK: payment_status harus salah satu dari nilai yang valid

---

## 🔌 API Endpoints

### **Admin Endpoints** (Requires role='admin')

#### 1. `/api/admin/manage_competitions.php`
Mengelola CRUD competitions.

**GET** - List semua competitions
```bash
GET /api/admin/manage_competitions.php
Response: Array of competition objects
```

**POST** - Create competition baru
```bash
POST /api/admin/manage_competitions.php
Content-Type: application/json

{
  "name": "CTF 2025",
  "description": "Annual CTF Competition",
  "start_date": "2025-11-01 09:00:00",
  "end_date": "2025-11-03 18:00:00",
  "registration_deadline": "2025-10-25 23:59:59",
  "max_participants": 100,
  "difficulty_level": "intermediate",
  "prize_pool": "$10,000",
  "status": "registration_open",
  "category": "international",
  "rules": "Standard CTF rules apply",
  "contact_person": "admin@ctf.com"
}

Response: { "success": true, "competition": {...} }
```

**PUT** - Update competition
```bash
PUT /api/admin/manage_competitions.php
Content-Type: application/json

{
  "id": 1,
  "status": "ongoing",
  "name": "Updated Name"
}

Response: { "success": true, "competition": {...} }
```

**DELETE** - Delete competition
```bash
DELETE /api/admin/manage_competitions.php
Content-Type: application/json

{
  "id": 1
}

Response: { "success": true, "message": "Competition deleted" }
```

---

#### 2. `/api/admin/verify_payments.php`
Verifikasi pembayaran peserta.

**GET** - List pending payments
```bash
GET /api/admin/verify_payments.php
Response: Array of registrations with payment_status IN ('pending', 'unpaid')
```

**POST** - Update payment status
```bash
POST /api/admin/verify_payments.php
Content-Type: application/json

{
  "registration_id": 5,
  "payment_status": "paid"  // atau "refunded"
}

Response: { "success": true, "registration": {...} }
```

**Note:** 
- Ketika payment_status = 'paid', registration_status otomatis jadi 'approved'
- Ketika payment_status = 'refunded', registration_status otomatis jadi 'cancelled'
- Jumlah peserta ditampilkan secara dinamis dari tabel `competition_registrations`

---

#### 3. `/api/admin/get_registrations.php`
List semua registrations dengan detail user dan competition.

**GET**
```bash
GET /api/admin/get_registrations.php
Response: Array of all registrations with user and competition details
```

---

### **User Endpoints**

#### 4. `/api/competitions.php`
List competitions yang tersedia (status: upcoming, registration_open, ongoing).

**GET**
```bash
GET /api/competitions.php
Response: Array of competitions dengan field 'is_registered' (true/false)
```

**Note:** Field `is_registered` menunjukkan apakah user yang sedang login sudah terdaftar di kompetisi tersebut.

---

#### 5. `/api/register_competition.php`
Register ke competition.

**POST**
```bash
POST /api/register_competition.php
Content-Type: application/json

{
  "competition_id": 1,
  "team_name": "Team Hackers",  // optional
  "registration_notes": "Excited to join!"  // optional
}

Response: { 
  "success": true, 
  "message": "Successfully registered for competition",
  "registration": {...}
}
```

**Validasi:**
- User harus login
- Competition harus exist dan status = 'registration_open' atau 'upcoming'
- Registration deadline belum lewat
- Max participants belum tercapai (jika ada limit)
- User belum terdaftar di competition tersebut

**Default values:**
- `registration_status` = 'pending'
- `payment_status` = 'unpaid'

---

#### 6. `/api/my_competitions.php`
List competitions yang sudah didaftar user.

**GET**
```bash
GET /api/my_competitions.php
Response: Array of competitions dengan detail registration (team_name, status, score, rank, dll)
```

---

## 🎨 Frontend Pages

### 1. **admin.html** - Admin Panel
**URL:** `/admin.html`

**Access:** Hanya user dengan `role='admin'`

**Features:**
- **Tab 1: Competitions**
  - Form untuk create competition baru
  - Grid menampilkan semua competitions
  - Edit/Delete competition
  
- **Tab 2: Payment Verification**
  - Table menampilkan pending payments
  - Button untuk approve/reject payment
  
- **Tab 3: All Registrations**
  - Table menampilkan semua registrations
  - Detail user, competition, status, score

**JavaScript:** `/assets/js/admin.js`

---

### 2. **index.html** - User Pages

#### Competitions Page
**URL:** `/#competitions`

**Features:**
- Search competitions
- Filter by status (All, Upcoming, Open, Ended)
- Competition cards dengan info lengkap
- Button "Register" untuk daftar
- Badge "Registered" jika sudah terdaftar

#### Dashboard Page  
**URL:** `/#dashboard`

**Features:**
- "My Competitions" section menampilkan competitions yang sudah didaftar
- Menampilkan team name, registration status, payment status
- Menampilkan score & rank untuk ongoing competitions
- Empty state jika belum ada registrations

---

## 🔒 Security & Access Control

### Role-based Access
1. **Admin** (`role='admin'`)
   - Akses ke `/admin.html`
   - Akses ke semua `/api/admin/*` endpoints
   - Link "Admin Panel" di navigation (dengan icon crown)

2. **User** (`role='user'`)
   - Akses ke competitions page
   - Akses ke dashboard
   - Bisa register ke competitions
   - Bisa lihat competitions yang sudah didaftar

### Session Validation
Semua protected endpoints mengecek:
```php
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit;
}
```

Admin endpoints juga mengecek:
```php
if ($_SESSION['role'] !== 'admin') {
    http_response_code(403);
    exit;
}
```

---

## 🚀 How to Use

### Setup Database
1. Jalankan `src/sql/init.sql` untuk create tables:
```bash
psql -U your_user -d your_db -f src/sql/init.sql
```

### Admin Workflow
1. Login sebagai admin
2. Klik "Admin Panel" di navigation
3. **Create Competition:**
   - Isi form di tab "Competitions"
   - Klik "Add Competition"
4. **Verify Payments:**
   - Buka tab "Payment Verification"
   - Klik "Approve" untuk verify payment
   - Registration status otomatis berubah jadi 'approved'

### User Workflow
1. Login/Register sebagai user
2. Browse competitions di "Competitions" page
3. **Register:**
   - Klik "Register" pada competition yang diinginkan
   - Isi team name (optional)
   - Klik "Confirm Registration"
   - Status awal: pending, payment: unpaid
4. **View My Competitions:**
   - Buka "Dashboard"
   - Lihat section "My Competitions"
   - Cek registration status & payment status

---

## 📊 Data Flow

### Registration Flow
```
User clicks "Register"
    ↓
Modal muncul dengan form
    ↓
Submit → /api/register_competition.php
    ↓
Insert ke competition_registrations
    ↓
registration_status = 'pending'
payment_status = 'unpaid'
    ↓
Admin verify payment di admin panel
    ↓
Update payment_status = 'paid'
registration_status = 'approved'
    ↓
User bisa ikut competition
```

### Many-to-Many Relationship
```
users (1) ←→ (*) competition_registrations (*) ←→ (1) competitions

- 1 user bisa daftar banyak competitions
- 1 competition bisa diikuti banyak users
- Data relasi tersimpan di competition_registrations
```

---

## 🎯 Key Features

✅ **Admin Panel** dengan UI modern
✅ **CRUD Competitions** (Create, Read, Update, Delete)
✅ **Payment Verification** system
✅ **User Registration** dengan validation
✅ **Role-based Access Control** (Admin vs User)
✅ **Many-to-Many Relationship** dengan junction table
✅ **Foreign Keys & Constraints** untuk data integrity
✅ **Real-time Status Updates** (pending → approved → paid)
✅ **Search & Filter** competitions
✅ **Responsive Design** untuk mobile
✅ **Modal System** untuk registration
✅ **Empty States** untuk better UX

---

## 🔧 Technical Stack

- **Backend:** PHP + PostgreSQL
- **Frontend:** Vanilla JavaScript + HTML + CSS
- **Database:** PostgreSQL dengan proper indexing
- **Authentication:** Session-based
- **Architecture:** RESTful API

---

## 📝 Notes

1. **Auto-increment:** PostgreSQL menggunakan `SERIAL` (bukan `AUTO_INCREMENT` seperti MySQL)
2. **Timestamps:** Menggunakan `TIMESTAMP` dengan `DEFAULT NOW()`
3. **Cascade Delete:** Jika competition dihapus, semua registrations ikut terhapus
4. **Unique Constraint:** Satu user tidak bisa register 2x ke competition yang sama
5. **Check Constraints:** Validasi di database level untuk status, difficulty, dates

---

## 🐛 Common Issues & Solutions

**Issue:** Admin link tidak muncul
- **Solution:** Pastikan user sudah login dan `role='admin'` di database

**Issue:** Registration gagal
- **Solution:** Cek apakah:
  - User sudah login
  - Registration deadline belum lewat
  - Max participants belum tercapai
  - User belum terdaftar sebelumnya

---

## 🎓 Best Practices

1. **Always validate on backend** - Frontend validation bisa di-bypass
2. **Use prepared statements** - Untuk prevent SQL injection (bisa ditingkatkan)
3. **Check permissions** - Setiap admin endpoint harus cek role
4. **Proper error messages** - Jangan expose sensitive info
5. **Use transactions** - Untuk operasi multi-table (bisa ditambahkan)

---

## 📞 Contact & Support

Jika ada pertanyaan atau issue, silakan check:
- Database structure di `src/sql/init.sql`
- API implementation di `src/api/`
- Frontend logic di `src/assets/js/`

**Happy Hacking! 🚀**

