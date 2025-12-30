<?php
// ============================================================================
// PENGATURAN KONFIGURASI EMAIL
// File: backend/config.php
// Description: File konfigurasi pusat untuk Sistem Email Firebase Login
// Tujuan: Menyimpan semua pengaturan SMTP, database, keamanan, dan email
// IMPORTANT: Ganti nilai placeholder dengan konfigurasi aktual Anda
// ============================================================================

// ============================================================================
// KONFIGURASI EMAIL SMTP
// Konfigurasi pengaturan SMTP untuk pengiriman email via PHPMailer
// Pengaturan ini menentukan layanan email mana yang akan digunakan untuk pengiriman notifikasi
// ============================================================================

// Konfigurasi Gmail SMTP (Direkomendasikan untuk testing dan development)
// Untuk production, pertimbangkan untuk menggunakan penyedia layanan email dedicated
define('SMTP_HOST', 'smtp.gmail.com');          // Hostname server SMTP untuk Gmail
define('SMTP_PORT', 587);                       // Port SMTP (587 untuk TLS, 465 untuk SSL)
define('SMTP_USERNAME', 'your-email@gmail.com'); // Alamat Gmail Anda (GANTI INI)
define('SMTP_PASSWORD', 'your-app-password');    // Gmail App Password (GANTI INI)
define('SMTP_FROM_EMAIL', 'your-email@gmail.com'); // Alamat email pengirim (GANTI INI)
define('SMTP_FROM_NAME', 'Firebase Login System');   // Nama tampilan untuk email

// ============================================================================
// PENYEDIA SMTP ALTERNATIF
// Uncomment dan modifikasi bagian di bawah untuk penyedia email lain
// ============================================================================

/*
// Konfigurasi SMTP Outlook/Hotmail
define('SMTP_HOST', 'smtp-mail.outlook.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@outlook.com');
define('SMTP_PASSWORD', 'your-password');
define('SMTP_FROM_EMAIL', 'your-email@outlook.com');
define('SMTP_FROM_NAME', 'Firebase Login System');

// Konfigurasi SMTP Yahoo Mail
define('SMTP_HOST', 'smtp.mail.yahoo.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@yahoo.com');
define('SMTP_PASSWORD', 'your-app-password');
define('SMTP_FROM_EMAIL', 'your-email@yahoo.com');
define('SMTP_FROM_NAME', 'Firebase Login System');

// Konfigurasi Server SMTP Kustom
define('SMTP_HOST', 'your-smtp-server.com');
define('SMTP_PORT', 587); // atau 465 untuk SSL
define('SMTP_USERNAME', 'your-smtp-username');
define('SMTP_PASSWORD', 'your-smtp-password');
define('SMTP_FROM_EMAIL', 'your-email@domain.com');
define('SMTP_FROM_NAME', 'Firebase Login System');
*/

// ============================================================================
// PENGATURAN KONTROL SISTEM EMAIL
// Pengaturan untuk mengontrol fungsionalitas email untuk development dan testing
// ============================================================================

// Aktifkan atau nonaktifkan pengiriman email secara global
// true: Kirim email aktual (mode production)
// false: Nonaktifkan pengiriman email (mode testing)
define('ENABLE_EMAIL', true);

// Email logging sebagai ganti pengiriman
// true: Log email ke file sebagai ganti pengiriman (untuk testing)
// false: Kirim email aktual
define('LOG_EMAIL', true);

// ============================================================================
// KONFIGURASI DATABASE
// Pengaturan database untuk menyimpan data pengguna dan log email (opsional)
// Konfigurasi hanya jika Anda ingin menyimpan log email atau aktivitas pengguna
// ============================================================================

// Pengaturan koneksi database
define('DB_HOST', 'localhost');     // Hostname server database
define('DB_NAME', 'firebase_login'); // Nama database
define('DB_USER', 'root');          // Username database
define('DB_PASS', '');              // Password database

// ============================================================================
// KONFIGURASI KEAMANAN
// Pengaturan keamanan untuk perlindungan API dan token JWT
// IMPORTANT: Ubah nilai-nilai ini di production untuk keamanan
// ============================================================================

// Secret Key JWT untuk pembuatan dan validasi token
// IMPORTANT: Ganti dengan secret key yang kuat dan unik di production
define('JWT_SECRET', 'your-jwt-secret-key-here');

// API Rate Limiting - Maksimal request per jam per IP
// Mencegah penyalahgunaan dan serangan DoS
define('API_RATE_LIMIT', 100); // 100 request per jam

// ============================================================================
// PEMBATASAN RATE EMAIL
// Pengaturan untuk mencegah spam email dan mengontrol frekuensi pengiriman email
// ============================================================================

// Maksimal jumlah email yang dapat dikirim per jam
// Mencegah spam dan melindungi penyedia SMTP Anda
define('MAX_EMAIL_PER_HOUR', 50);

// Periode cooldown antar email (dalam detik)
// Mencegah pengiriman email yang cepat beruntun
define('EMAIL_COOLDOWN', 60); // 60 detik (1 menit) antar email

// ============================================================================
// KONFIGURASI LOGGING
// Pengaturan untuk logging aktivitas email dan event sistem
// ============================================================================

// Path file log untuk aktivitas email
// Email akan dilog di sini sebagai ganti pengiriman (ketika LOG_EMAIL = true)
// Direktori akan dibuat otomatis jika belum ada
define('LOG_FILE', __DIR__ . '/logs/email_log.txt');

// File log untuk aktivitas sistem umum
define('SYSTEM_LOG', __DIR__ . '/logs/system_log.txt');

// File log untuk pelacakan error
define('ERROR_LOG', __DIR__ . '/logs/error_log.txt');

// ============================================================================
// SETUP DIREKTORI
// Buat direktori yang diperlukan untuk logging dan file temporary
// ============================================================================

// Buat direktori logs jika belum ada
if (!file_exists(__DIR__ . '/logs')) {
    // Buat direktori dengan permission yang tepat
    // 0755 = rwxr-xr-x (owner: read/write/execute, group/others: read/execute)
    mkdir(__DIR__ . '/logs', 0755, true);
}

// Buat direktori temp untuk file temporary jika diperlukan
if (!file_exists(__DIR__ . '/temp')) {
    mkdir(__DIR__ . '/temp', 0755, true);
}

// ============================================================================
// OPSI KONFIGURASI TAMBAHAN
// Pengaturan opsional untuk fungsionalitas yang ditingkatkan
// ============================================================================

// Pengaturan retry email
define('EMAIL_MAX_RETRIES', 3);        // Maksimal percobaan retry untuk email gagal
define('EMAIL_RETRY_DELAY', 5);        // Delay antar retry (detik)

// Mode debug
define('DEBUG_MODE', false);           // Set ke true untuk pesan error detail
define('VERBOSE_LOGGING', false);      // Set ke true untuk logging detail

// Pengaturan queue email (untuk enhancement masa depan)
define('EMAIL_QUEUE_ENABLED', false);  // Aktifkan sistem queue email
define('QUEUE_CHECK_INTERVAL', 30);    // Periksa queue setiap 30 detik

// Layanan email backup (untuk failover)
define('BACKUP_SMTP_HOST', '');        // Server SMTP backup (opsional)
define('BACKUP_SMTP_PORT', 587);       // Port SMTP backup
define('USE_BACKUP_ON_FAILURE', false); // Gunakan server backup jika primer gagal

// ============================================================================
// PENGATURAN TIMEZONE
// Set timezone untuk akurasi timestamp di log dan email
// ============================================================================

// Set timezone ke Indonesia (Jakarta)
// Ubah ini untuk mencocokkan timezone server Anda
date_default_timezone_set('Asia/Jakarta');

// Timezone alternatif yang mungkin ingin Anda gunakan:
// date_default_timezone_set('UTC');           // Coordinated Universal Time
// date_default_timezone_set('America/New_York'); // Eastern Time
// date_default_timezone_set('Europe/London');    // Greenwich Mean Time

// ============================================================================
// FUNGSI HELPER
// Fungsi utilitas untuk manajemen konfigurasi
// ============================================================================

/**
 * Periksa apakah pengiriman email diaktifkan
 * Returns: boolean - true jika email harus dikirim
 */
function isEmailEnabled() {
    return defined('ENABLE_EMAIL') && ENABLE_EMAIL;
}

/**
 * Periksa apakah email logging diaktifkan
 * Returns: boolean - true jika email harus dilog sebagai ganti dikirim
 */
function isEmailLoggingEnabled() {
    return defined('LOG_EMAIL') && LOG_EMAIL;
}

/**
 * Dapatkan konfigurasi SMTP sebagai array
 * Returns: array dengan pengaturan SMTP
 */
function getSMTPConfig() {
    return [
        'host' => SMTP_HOST,
        'port' => SMTP_PORT,
        'username' => SMTP_USERNAME,
        'password' => SMTP_PASSWORD,
        'from_email' => SMTP_FROM_EMAIL,
        'from_name' => SMTP_FROM_NAME
    ];
}

/**
 * Log pemeriksaan konfigurasi (untuk debugging)
 * Fungsi ini membantu memverifikasi bahwa konfigurasi dimuat dengan benar
 */
function logConfigurationCheck() {
    if (defined('DEBUG_MODE') && DEBUG_MODE) {
        $logMessage = "[" . date('Y-m-d H:i:s') . "] Configuration loaded successfully\n";
        $logMessage .= "Email enabled: " . (isEmailEnabled() ? 'Yes' : 'No') . "\n";
        $logMessage .= "Email logging: " . (isEmailLoggingEnabled() ? 'Yes' : 'No') . "\n";
        $logMessage .= "SMTP Host: " . SMTP_HOST . "\n";
        $logMessage .= "SMTP Port: " . SMTP_PORT . "\n";
        $logMessage .= "From Email: " . SMTP_FROM_EMAIL . "\n";
        $logMessage .= "Timezone: " . date_default_timezone_get() . "\n\n";
        
        file_put_contents(SYSTEM_LOG, $logMessage, FILE_APPEND | LOCK_EX);
    }
}

// Jalankan pemeriksaan konfigurasi jika mode debug diaktifkan
if (defined('DEBUG_MODE') && DEBUG_MODE) {
    logConfigurationCheck();
}

// ============================================================================
// CATATAN KEAMANAN
// Pertimbangan keamanan penting untuk deployment production
// ============================================================================

/*
CHECKLIST KEAMANAN PENTING:

1. Ganti semua nilai placeholder dengan kredensial aktual
2. Gunakan password dan secret key yang kuat dan unik
3. Aktifkan SSL/TLS untuk semua komunikasi email
4. Implementasi validasi input dan sanitasi yang tepat
5. Gunakan environment variables untuk konfigurasi sensitif
6. Aktifkan rate limiting dan perlindungan DDoS
7. Update dependencies dan security patch secara rutin
8. Monitor log untuk aktivitas yang mencurigakan
9. Implementasi penanganan error yang tepat tanpa mengekspos info sensitif
10. Gunakan HTTPS untuk semua komunikasi di production

PERUBAHAN PRODUCTION YANG DIREKOMENDASIKAN:
- Pindahkan konfigurasi ke environment variables
- Gunakan layanan manajemen secrets
- Implementasi logging dan monitoring yang tepat
- Setup backup otomatis
- Aktifkan security headers
- Gunakan web application firewall
*/

?>
