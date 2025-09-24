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

1. Buat database dan tabel `users` menggunakan file `sql/init.sql` (otomatis oleh docker-compose) atau manual via psql.

### 2) Konfigurasi Koneksi DB

Edit `api/config.php` dan sesuaikan kredensial PostgreSQL Anda, atau set `DATABASE_URL` via environment.

### 3) Menjalankan Server PHP (Windows)

```powershell
php -S localhost:8000 -t .
```

### 4) Docker (disarankan agar bebas masalah ekstensi)

1. Buat file `.env` di root (opsional, contoh):
```
DATABASE_URL=postgresql://postgres:postgres@db/cybercat_ctf
PGHOST=db
PGUSER=postgres
PGDATABASE=cybercat_ctf
PGPASSWORD=postgres
```
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
