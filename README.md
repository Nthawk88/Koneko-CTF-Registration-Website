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
sql/database.sql    -> Skema tabel PostgreSQL (users)
```

### 1) Siapkan Database

1. Buat database dan tabel `users` menggunakan file `sql/database.sql`:

   - Via psql CLI:
     ```bash
     createdb cybercat_ctf
     psql -d cybercat_ctf -f sql/database.sql
     ```

   - Atau buka `sql/database.sql`, lalu eksekusi isinya pada DB Anda (pgAdmin).

2. Jika ingin nama database khusus, buat DB-nya terlebih dahulu lalu jalankan file `sql/database.sql` pada DB tersebut.

### 2) Konfigurasi Koneksi DB

Edit `api/config.php` dan sesuaikan kredensial PostgreSQL Anda:

```php
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '5432');
define('DB_NAME', 'cybercat_ctf');
define('DB_USER', 'postgres');
define('DB_PASS', 'your_password');
```

Catatan:
- Session sudah diatur HTTPOnly. Jika Anda memakai HTTPS, aktifkan juga `session.cookie_secure` (uncomment barisnya di `config.php`).

### 3) Aktifkan ekstensi pdo_pgsql

Di php.ini pastikan ini aktif:
```
extension=pdo_pgsql
```

### 4) Menjalankan Server PHP (Windows)

Jalankan perintah ini dari folder project:

```powershell
php -S localhost:8000 -t .
```

Lalu buka `http://localhost:8000/` di browser.

Frontend (`script.js`) otomatis akan memanggil API berikut:
- `POST /api/signup.php`  -> membuat akun baru
- `POST /api/signin.php`  -> login dengan email/username + password

### 5) Format Request/Response

Semua request harus `Content-Type: application/json`. Contoh:

- Sign Up
  ```bash
  curl -X POST http://localhost:8000/api/signup.php \
    -H "Content-Type: application/json" \
    -d '{
      "fullName": "John Doe",
      "email": "john@example.com",
      "username": "johnd",
      "password": "Str0ngPass!",
      "confirmPassword": "Str0ngPass!"
    }'
  ```

- Sign In (email atau username pada `identifier`)
  ```bash
  curl -X POST http://localhost:8000/api/signin.php \
    -H "Content-Type: application/json" \
    -d '{
      "identifier": "john@example.com",
      "password": "Str0ngPass!"
    }'
  ```

Respons sukses akan berbentuk JSON, misalnya untuk login:

```json
{
  "message": "Signed in successfully",
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "username": "johnd"
  }
}
```

### 6) Validasi & Keamanan

- Password disimpan menggunakan `password_hash()` (default algorithm) dan dicek dengan `password_verify()`.
- Query menggunakan prepared statements (PDO) untuk mencegah SQL Injection.
- Cookie HTTPOnly aktif.

### 7) Integrasi Frontend

Form di halaman `Sign Up` dan `Sign In` sudah terhubung:
- `script.js` menambahkan handler `setupForms()` untuk submit ke API.
- Notifikasi sukses/error memakai `showNotification()`.
- Setelah Sign Up sukses, pengguna diarahkan ke halaman Sign In.
- Setelah Sign In sukses, pengguna diarahkan ke `Dashboard`.

Jika Anda mengubah nama file atau path API, sesuaikan di `script.js` pada fungsi `apiRequest()` dan pemanggilnya.

### 8) Deployment

- Untuk produksi, gunakan web server seperti Apache/Nginx + PHP-FPM.
- Pastikan `api/config.php` tidak dapat diakses publik selain melalui PHP (jangan menayangkan isi file mentah).
- Gunakan HTTPS dan aktifkan `session.cookie_secure`.
