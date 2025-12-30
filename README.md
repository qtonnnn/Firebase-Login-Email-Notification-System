# Website Login Firebase dengan Notifikasi

Website login modern yang menggunakan Firebase Authentication dengan sistem notifikasi yang interaktif.

## ✨ Fitur

- **🔐 Firebase Authentication**
  - Login dengan email dan password
  - Pendaftaran akun baru
  - Reset password via email
  - Manajemen sesi yang aman

- **🔔 Sistem Notifikasi**
  - Toast notifications dengan animasi
  - Browser notifications (dengan izin)
  - **📧 Email notifications otomatis ke qtonnnn@gmail.com**
  - Feedback visual untuk berbagai status
  - Auto-dismiss dan manual close

- **📱 Desain Responsif**
  - Mobile-friendly design
  - Modern UI dengan gradient colors
  - Smooth animations dan transitions
  - Font Awesome icons

- **⚡ Fitur Tambahan**
  - Toggle password visibility
  - Form validation
  - Loading states
  - Auto-redirect after login
  - Logout dengan konfirmasi
  - **🧪 Test email functionality**
  - **📧 Email templates professional**

## 🚀 Setup dan Konfigurasi

### 1. Persyaratan
- Node.js (untuk development server)
- Akun Firebase
- Modern web browser

### 2. Setup Firebase

#### a. Buat Firebase Project
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik "Add project" atau "Buat proyek"
3. Masukkan nama project, contoh: `login-firebase-app`
4. Pilih region yang sesuai (Indonesia: `asia-southeast2`)
5. Matikan Google Analytics (opsional)
6. Klik "Create project"

#### b. Enable Authentication
1. Di Firebase Console, masuk ke **Authentication**
2. Klik tab **Sign-in method**
3. Enable **Email/Password** provider
4. Save pengaturan

#### c. Setup Firestore Database
1. Masuk ke **Firestore Database**
2. Klik **Create database**
3. Pilih **Start in test mode** (untuk development)
4. Pilih region yang sama dengan project
5. Klik **Done**

#### d. Get Configuration
1. Masuk ke **Project settings** (icon gear)
2. Scroll ke bagian **Your apps**
3. Klik **</>** untuk web app
4. Masukkan nama app, contoh: `login-app`
5. **Jangan centang** "Also set up Firebase Hosting"
6. Klik **Register app**
7. Copy configuration object

### 3. Update Firebase Config

Edit file `js/firebase-config.js` dan ganti nilai konfigurasi:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyC...",           // API key dari Firebase
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

### 4. Setup PHP Email Backend

#### a. Install PHP Dependencies
```bash
cd backend
composer install
```

#### b. Configure Email Settings
Edit file `backend/config.php`:

```php
// Untuk Gmail SMTP
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@gmail.com'); // Ganti dengan email Anda
define('SMTP_PASSWORD', 'your-app-password'); // Ganti dengan app password Gmail
define('SMTP_FROM_EMAIL', 'your-email@gmail.com'); // Ganti dengan email Anda
define('SMTP_FROM_NAME', 'Firebase Login System');

// Enable email sending
define('ENABLE_EMAIL', true);
```

#### c. Gmail App Password Setup
1. Login ke Gmail account Anda
2. Buka [Google Account Settings](https://myaccount.google.com/)
3. Masuk ke Security > 2-Step Verification > App passwords
4. Generate app password untuk "Mail"
5. Gunakan app password di konfigurasi SMTP

#### d. Test Email System
1. Buka browser: `http://localhost/CRD/backend/test_email.php`
2. Isi form test dengan email `qtonnnn@gmail.com`
3. Klik "Kirim Test Email"
4. Periksa inbox qtonnnn@gmail.com

### 5. Run Website

#### Option 1: Live Server (VSCode Extension)
1. Install extension "Live Server" di VSCode
2. Klik kanan pada `index.html`
3. Pilih "Open with Live Server"

#### Option 2: Python Server
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Option 3: Node.js Server
```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server -p 8000
```

#### Option 4: PHP Server (XAMPP)
1. Letakkan folder project di `htdocs/CRD/`
2. Start Apache dari XAMPP Control Panel
3. Buka browser: `http://localhost/CRD/`

## 📁 Struktur Proyek

```
/opt/lampp/htdocs/CRD/
├── index.html              # Halaman login utama
├── dashboard.html          # Dashboard setelah login
├── css/
│   └── style.css          # Styling untuk semua halaman
├── js/
│   ├── firebase-config.js # Konfigurasi Firebase
│   ├── auth.js           # Logika autentikasi
│   └── notifications.js  # Sistem notifikasi
└── README.md             # Dokumentasi (file ini)
```

## 🎯 Cara Penggunaan

### 1. Pendaftaran Akun Baru
1. Buka halaman login
2. Klik "Daftar Akun Baru"
3. Isi email dan password (minimal 6 karakter)
4. Klik "Daftar"
5. Akun akan dibuat dan otomatis login

### 2. Login
1. Masukkan email dan password
2. Klik "Login"
3. Akan muncul notifikasi sukses
4. Otomatis redirect ke dashboard

### 3. Reset Password
1. Klik "Lupa Password?"
2. Masukkan email yang terdaftar
3. Klik "Kirim Reset Link"
4. Periksa email untuk link reset

### 4. Logout
1. Di dashboard, klik "Logout"
2. Akan muncul konfirmasi
3. Redirect ke halaman login

## 🔧 Customization

### Mengubah Warna Tema
Edit file `css/style.css`, cari gradient colors:
```css
/* Gradient utama */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Untuk mengubah warna, ganti kode hex */
background: linear-gradient(135deg, #your-color1 0%, #your-color2 100%);
```

### Mengubah Durasi Notifikasi
Edit file `js/notifications.js`, ubah nilai `duration`:
```javascript
const NOTIFICATION_TYPES = {
    success: {
        // ..., 
        duration: 5000  // 5 detik
    }
};
```

### Menambah Provider Login
1. Enable provider di Firebase Console (Google, Facebook, dll)
2. Tambahkan button di `index.html`
3. Import dan gunakan provider di `auth.js`

## 🛠️ Troubleshooting

### Error: "Firebase configuration not found"
**Solusi:** Pastikan file `js/firebase-config.js` sudah dikonfigurasi dengan benar.

### Error: "Auth domain not configured"
**Solusi:** 
1. Cek authDomain di Firebase config
2. Pastikan sudah enable Email/Password auth
3. Verifikasi domain di Firebase Console > Authentication > Settings > Authorized domains

### Error: "Permission denied" di Firestore
**Solusi:**
1. Update Firestore rules untuk test mode:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Notifikasi Browser Tidak Muncul
**Solusi:**
1. Allow notifications di browser
2. Cek permission di browser settings
3. Pastikan HTTPS (untuk production)

### Login Tidak Berhasil
**Solusi:**
1. Cek email sudah terdaftar
2. Pastikan password benar
3. Cek console browser untuk error details
4. Verifikasi Firebase project settings

## 🔒 Security Notes

- **Development:** Firestore dalam test mode untuk kemudahan testing
- **Production:** Selalu setup proper Firestore security rules
- **Environment:** Jangan commit API keys ke repository
- **HTTPS:** Gunakan HTTPS untuk production deployment

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🆕 Update dan Maintenance

### Update Firebase SDK
```bash
# Check latest version di https://firebase.google.com/docs/web/setup#add-sdks
# Update import URLs di js/firebase-config.js
```

### Backup Data
- User data tersimpan di Firestore
- Gunakan Firebase Console untuk export/import
- Setup automated backups untuk production

## 📞 Support

Jika ada masalah atau pertanyaan:
1. Cek console browser untuk error messages
2. Verifikasi Firebase configuration
3. Pastikan semua dependencies sudah di-load
4. Test dengan user account yang baru dibuat

## 📄 License

Project ini dibuat untuk keperluan pembelajaran dan development. 

---

**Catatan:** Website ini masih dalam mode development. Untuk production, pastikan:
- Setup proper Firestore security rules
- Configure authorized domains
- Enable Google Analytics (opsional)
- Setup monitoring dan logging
- Implement proper error handling dan validation
