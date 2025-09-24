# SecProg-CTF-Registration-Website

## Backend PHP + PostgreSQL (Sign Up & Sign In)

Proyek ini sekarang memiliki backend sederhana berbasis PHP dengan API untuk Sign Up dan Sign In yang terhubung ke PostgreSQL.

### Struktur Baru

```
api/
  config.php    -> Konfigurasi database & session
  db.php        -> Koneksi PDO ke PostgreSQL (prepared statements)
  utils.php     -> Helper JSON response, input parser, session start
  signup.php    -> Endpoint API untuk registrasi
  signin.php    -> Endpoint API untuk login
assets/
  css/styles.css
  js/script.js
sql/
  init.sql      -> Skema tabel PostgreSQL (users)
```

### 1) Siapkan Database

1. Buat database PostgreSQL di Neon (https://neon.tech) atau penyedia cloud lainnya.
2. Jalankan query dari `sql/init.sql` di database Anda untuk membuat tabel `users`.

### 2) Konfigurasi Koneksi DB

Buat file `.env` di root proyek dengan kredensial database cloud Anda (contoh untuk Neon):

```
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
```

### 3) Menjalankan Server PHP (Windows)

```powershell
php -S localhost:8000 -t .
```

### 4) Docker (disarankan agar bebas masalah ekstensi)

1. Pastikan file `.env` sudah dibuat dengan kredensial database cloud.
2. Jalankan docker-compose:
```bash
docker compose up --build
```
3. Akses aplikasi:
- App: http://localhost:8000
- Health check: http://localhost:8000/api/health.php

### 5) Format Request/Response

Semua request harus `Content-Type: application/json`.

### 6) Validasi & Keamanan

- Password disimpan menggunakan `password_hash()` dan dicek dengan `password_verify()`.
- Query menggunakan prepared statements (PDO).

### 7) Integrasi Frontend

Form `Sign Up` dan `Sign In` sudah terhubung `script.js`.

### 8) Deployment

- Untuk produksi, gunakan web server seperti Apache/Nginx + PHP-FPM.
- Gunakan HTTPS dan aktifkan `session.cookie_secure`.
