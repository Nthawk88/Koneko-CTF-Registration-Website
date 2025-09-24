# CyberCat CTF Website - HTML/CSS/JavaScript Version

Website pendaftaran lomba CTF yang interaktif dengan animasi kucing dan tema cybersecurity.

## 🚀 Fitur Utama

### ✅ Halaman yang Tersedia:
1. **Home Page** - Landing page dengan hero section dan animasi kucing
2. **Competitions** - Daftar lomba CTF dengan filter dan search
3. **Dashboard** - Dashboard user dengan statistik dan lomba yang diikuti
4. **Profile** - Manajemen profil dengan 3 tab (Info, Security, Statistics)
5. **Sign In** - Halaman login dengan validasi form
6. **Sign Up** - Halaman registrasi dengan password strength indicator

### ✅ Fitur Interaktif:
- **Animasi Kucing Mascot** dengan blinking dan typing effect
- **Glassmorphism Design** dengan tema cyber dark
- **Hover Effects** dan smooth transitions
- **Form Validation** real-time
- **Password Strength Indicator**
- **Tab Navigation** di halaman profile
- **Search & Filter** di halaman competitions
- **Responsive Design** untuk desktop dan mobile
- **Matrix Rain Background Effect**
- **Floating Icons Animation**

### ✅ Tema CTF & Cyber:
- Color scheme: Cyan (#00ffff) dan Magenta (#ff00ff)
- Font: Orbitron untuk heading, Inter untuk body text
- Icons: Font Awesome untuk semua ikon
- Background: Matrix rain effect dan floating cyber icons
- Kucing mascot dengan hoodie hacker dan laptop

## 📁 Struktur File

```
ctf-website-html/
├── index.html          # File HTML utama
├── styles.css          # File CSS dengan semua styling
├── script.js           # File JavaScript dengan fungsionalitas
├── README.md           # File dokumentasi ini
└── [gambar-gambar]     # Aset gambar kucing dan cyber
```

## 🛠️ Cara Menjalankan

### Metode 1: Server HTTP Sederhana (Recommended)
```bash
# Masuk ke direktori website
cd ctf-website-html

# Jalankan server HTTP dengan Python
python3 -m http.server 8080

# Atau dengan Node.js jika tersedia
npx http-server -p 8080

# Buka browser dan akses: http://localhost:8080
```

### Metode 2: Buka Langsung di Browser
```bash
# Buka file index.html langsung di browser
# Namun beberapa fitur mungkin tidak berfungsi karena CORS policy
```

## 🎮 Cara Menggunakan

### Navigation
- Klik menu di navigation bar untuk berpindah halaman
- Semua halaman menggunakan Single Page Application (SPA) system
- URL akan berubah dengan hash (#home, #competitions, dll)

### Halaman Home
- Hero section dengan animasi kucing mascot
- Stats counter dengan angka-angka menarik
- Feature cards dengan hover effects
- CTA buttons untuk navigasi ke halaman lain

### Halaman Competitions
- Daftar 6 kompetisi CTF dengan berbagai status
- Search box untuk mencari kompetisi
- Filter buttons (All Status, Upcoming, Open, Ended)
- Competition cards dengan informasi lengkap
- Action buttons sesuai status kompetisi

### Halaman Dashboard
- Welcome section dengan user profile
- Stats cards (Total Points, Global Rank, dll)
- My Competitions section dengan status berbeda
- Sidebar dengan Quick Stats dan Recent Activity

### Halaman Profile
- Tab navigation: Profile Info, Security, Statistics
- Edit profile functionality dengan toggle mode
- Change password form dengan show/hide toggle
- Statistics cards dengan performance data

### Halaman Sign In/Up
- Form validation dengan error handling
- Password strength indicator (Sign Up)
- Show/hide password functionality
- Animasi kucing mascot dengan pesan kontekstual

## 🎨 Customization

### Mengubah Warna Tema
Edit variabel CSS di `styles.css`:
```css
:root {
    --primary-color: #00ffff;    /* Cyan */
    --secondary-color: #ff00ff;  /* Magenta */
    --accent-color: #00ff88;     /* Green */
    /* ... */
}
```

### Mengubah Pesan Kucing Mascot
Edit array `messages` di `script.js`:
```javascript
const messages = [
    "Ready to hack the matrix?",
    "Let's pwn some challenges!",
    // Tambahkan pesan baru di sini
];
```

### Menambah Kompetisi
Edit array `competitions` di `script.js`:
```javascript
competitions.push({
    id: 7,
    title: "New CTF Competition",
    description: "Description here...",
    // ... properti lainnya
});
```

## 🔧 Troubleshooting

### JavaScript Tidak Berfungsi
- Pastikan menjalankan dengan server HTTP, bukan membuka file langsung
- Cek browser console untuk error messages
- Pastikan semua file (HTML, CSS, JS) ada di direktori yang sama

### Animasi Tidak Smooth
- Pastikan browser mendukung CSS animations
- Cek apakah ada konflik dengan browser extensions
- Refresh halaman jika animasi terhenti

### Responsive Issues
- Test di berbagai ukuran layar
- Gunakan browser developer tools untuk debugging
- Adjust CSS media queries jika diperlukan

## 📱 Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ⚠️ Internet Explorer tidak didukung

## 🚀 Deployment

### GitHub Pages
1. Upload semua file ke repository GitHub
2. Enable GitHub Pages di repository settings
3. Website akan tersedia di `https://username.github.io/repository-name`

### Netlify
1. Drag & drop folder ke Netlify dashboard
2. Website akan otomatis ter-deploy dengan URL random
3. Bisa custom domain jika diperlukan

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Jalankan `vercel` di direktori website
3. Follow instruksi untuk deployment

## 📄 License

Website ini dibuat untuk keperluan demonstrasi dan pembelajaran. Silakan digunakan dan dimodifikasi sesuai kebutuhan.

## 🐱 Credits

- **Mascot Design**: Kucing hacker dengan hoodie dan laptop
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Orbitron, Inter)
- **Color Scheme**: Cyber/Hacker theme dengan glassmorphism
- **Animations**: CSS animations dan JavaScript interactions

---

**Selamat mencoba dan semoga bermanfaat! 🎯**

