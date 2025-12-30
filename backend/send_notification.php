<?php
// ============================================================================
// PENGIRIM NOTIFIKASI EMAIL
// File: backend/send_notification.php
// Description: Backend PHP untuk mengirim notifikasi email via PHPMailer
// Tujuan: Menangani pengiriman email dari sistem login Firebase ke pengguna
// Features: Konfigurasi SMTP, Template email, Error handling, Dukungan CORS
// ============================================================================

// ============================================================================
// HEADER CORS DAN KEAMANAN
// Set header untuk mengizinkan cross-origin request dari frontend
// ============================================================================

// Set response content type ke JSON
header('Content-Type: application/json');

// Izinkan cross-origin request dari domain apa pun (untuk development)
// Untuk production, ganti '*' dengan domain spesifik Anda
header('Access-Control-Allow-Origin: *');

// Izinkan metode HTTP spesifik
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');

// Izinkan header spesifik
header('Access-Control-Allow-Headers: Content-Type');

// ============================================================================
// PENANGANAN PREFLIGHT REQUEST
// Handle OPTIONS request untuk CORS preflight
// ============================================================================

// Jika metode request adalah OPTIONS (preflight), kembalikan 200 OK dan exit
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);  // HTTP 200 OK
    exit();                   // Exit script
}

// ============================================================================
// INCLUDES DEPENDENCY
// Include PHPMailer dan file konfigurasi
// ============================================================================

// Include PHPMailer autoloader (dimuat via Composer)
require_once 'vendor/autoload.php';

// Include pengaturan konfigurasi email
require_once 'config.php';

// ============================================================================
// IMPORT NAMESPACE PHPMAILER
// Import kelas PHPMailer untuk fungsionalitas email
// ============================================================================

use PHPMailer\PHPMailer\PHPMailer;      // Kelas PHPMailer utama
use PHPMailer\PHPMailer\SMTP;           // Kelas konfigurasi SMTP
use PHPMailer\PHPMailer\Exception;      // Kelas penanganan Exception

// ============================================================================
// FUNGSI PENGIRIMAN EMAIL UTAMA
// Fungsi: sendNotificationEmail($email, $subject, $message, $type)
// Tujuan: Kirim notifikasi email menggunakan PHPMailer dengan konfigurasi SMTP
// Parameter:
//   - email: Alamat email penerima
//   - subject: Baris subjek email
//   - message: Konten pesan email
//   - type: Jenis notifikasi (untuk pemilihan template)
// Returns: Array dengan status sukses dan pesan
// ============================================================================
function sendNotificationEmail($email, $subject, $message, $type = 'info') {
    // Buat instance PHPMailer baru
    $mail = new PHPMailer(true);
    
    try {
        // ====================================================================
        // KONFIGURASI SERVER SMTP
        // Konfigurasi pengaturan SMTP untuk pengiriman email
        // ====================================================================
        
        // Set metode pengiriman email ke SMTP
        $mail->isSMTP();
        
        // Hostname server SMTP (dari config.php)
        $mail->Host       = SMTP_HOST;
        
        // Enable autentikasi SMTP
        $mail->SMTPAuth   = true;
        
        // Username SMTP (dari config.php)
        $mail->Username   = SMTP_USERNAME;
        
        // Password SMTP (dari config.php)
        $mail->Password   = SMTP_PASSWORD;
        
        // Enable enkripsi TLS
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        
        // Nomor port SMTP (dari config.php)
        $mail->Port       = SMTP_PORT;
        
        // ====================================================================
        // KONFIGURASI PENERIMA EMAIL
        // Set alamat pengirim, penerima, dan BCC
        // ====================================================================
        
        // Set informasi pengirim (dari config.php)
        $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        
        // Tambahkan penerima (pengguna)
        $mail->addAddress($email, 'Pengguna');
        
        // Tambahkan BCC (Blind Carbon Copy) ke admin untuk monitoring
        $mail->addBCC('qtonnnn@gmail.com', 'Admin');
        
        // ====================================================================
        // KONFIGURASI KONTEN EMAIL
        // Set format email, subjek, dan body content
        // ====================================================================
        
        // Set format email ke HTML
        $mail->isHTML(true);
        
        // Set baris subjek email
        $mail->Subject = $subject;
        
        // Dapatkan template email berdasarkan jenis notifikasi
        $emailTemplate = getEmailTemplate($type, $message);
        
        // Set konten body email HTML
        $mail->Body = $emailTemplate['html'];
        
        // Set alternatif plain text untuk klien email yang tidak mendukung HTML
        $mail->AltBody = strip_tags($message);
        
        // ====================================================================
        // KIRIM EMAIL
        // Coba kirim email via SMTP
        // ====================================================================
        
        $mail->send();
        
        // Kembalikan response sukses
        return [
            'success' => true,
            'message' => 'Email notifikasi berhasil dikirim'
        ];
        
    } catch (Exception $e) {
        // Tangani error pengiriman email
        return [
            'success' => false,
            'message' => 'Gagal mengirim email: ' . $mail->ErrorInfo
        ];
    }
}

// ============================================================================
// GENERATOR TEMPLATE EMAIL
// Fungsi: getEmailTemplate($type, $message)
// Tujuan: Generate template email HTML berdasarkan jenis notifikasi
// Parameter:
//   - $type: Identifier jenis notifikasi
//   - $message: Konten pesan untuk disertakan dalam template
// Returns: Array dengan konten template HTML
// ============================================================================
function getEmailTemplate($type, $message) {
    // Definisikan template email untuk berbagai jenis notifikasi
    $templates = [
        
        // ============================================================================
        // TEMPLATE SUKSES LOGIN
        // Template untuk notifikasi login berhasil
        // ============================================================================
        'login_success' => [
            'html' => '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    /* CSS Styles untuk Email Sukses Login */
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                        background-color: #f4f4f4; 
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        background: white; 
                        padding: 30px; 
                        border-radius: 10px; 
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .header { 
                        text-align: center; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 20px; 
                        border-radius: 10px 10px 0 0; 
                        margin: -30px -30px 30px -30px; 
                    }
                    .success-icon { 
                        font-size: 48px; 
                        color: #10b981; 
                        margin-bottom: 20px; 
                    }
                    .content { 
                        line-height: 1.6; 
                        color: #333; 
                    }
                    .footer { 
                        margin-top: 30px; 
                        text-align: center; 
                        color: #666; 
                        font-size: 12px; 
                        border-top: 1px solid #eee;
                        padding-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="success-icon">🎉</div>
                        <h1>Login Berhasil!</h1>
                    </div>
                    <div class="content">
                        <p><strong>Selamat!</strong></p>
                        <p>Anda telah berhasil masuk ke sistem Firebase Login.</p>
                        <p><em>"' . $message . '"</em></p>
                        <p>Jika ini bukan aktivitas Anda, segera ubah password akun Anda.</p>
                    </div>
                    <div class="footer">
                        <p>Email ini dikirim secara otomatis oleh Sistem Firebase Login</p>
                        <p>© ' . date('Y') . ' Firebase Login System</p>
                    </div>
                </div>
            </body>
            </html>
            '
        ],
        
        // ============================================================================
        // TEMPLATE SUKSES PENDAFTARAN
        // Template untuk notifikasi pendaftaran pengguna baru
        // ============================================================================
        'registration_success' => [
            'html' => '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    /* CSS Styles untuk Email Sukses Pendaftaran */
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                        background-color: #f4f4f4; 
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        background: white; 
                        padding: 30px; 
                        border-radius: 10px; 
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .header { 
                        text-align: center; 
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                        color: white; 
                        padding: 20px; 
                        border-radius: 10px 10px 0 0; 
                        margin: -30px -30px 30px -30px; 
                    }
                    .welcome-icon { 
                        font-size: 48px; 
                        margin-bottom: 20px; 
                    }
                    .content { 
                        line-height: 1.6; 
                        color: #333; 
                    }
                    .footer { 
                        margin-top: 30px; 
                        text-align: center; 
                        color: #666; 
                        font-size: 12px; 
                        border-top: 1px solid #eee;
                        padding-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="welcome-icon">👋</div>
                        <h1>Selamat Datang!</h1>
                    </div>
                    <div class="content">
                        <p><strong>Akun Anda Berhasil Dibuat!</strong></p>
                        <p>Terima kasih telah bergabung dengan sistem kami.</p>
                        <p><em>"' . $message . '"</em></p>
                        <p>Anda sekarang dapat menggunakan semua fitur yang tersedia.</p>
                    </div>
                    <div class="footer">
                        <p>Email ini dikirim secara otomatis oleh Sistem Firebase Login</p>
                        <p>© ' . date('Y') . ' Firebase Login System</p>
                    </div>
                </div>
            </body>
            </html>
            '
        ],
        
        // ============================================================================
        // TEMPLATE RESET PASSWORD
        // Template untuk notifikasi permintaan reset password
        // ============================================================================
        'password_reset' => [
            'html' => '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    /* CSS Styles untuk Email Reset Password */
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                        background-color: #f4f4f4; 
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        background: white; 
                        padding: 30px; 
                        border-radius: 10px; 
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .header { 
                        text-align: center; 
                        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
                        color: white; 
                        padding: 20px; 
                        border-radius: 10px 10px 0 0; 
                        margin: -30px -30px 30px -30px; 
                    }
                    .reset-icon { 
                        font-size: 48px; 
                        margin-bottom: 20px; 
                    }
                    .content { 
                        line-height: 1.6; 
                        color: #333; 
                    }
                    .footer { 
                        margin-top: 30px; 
                        text-align: center; 
                        color: #666; 
                        font-size: 12px; 
                        border-top: 1px solid #eee;
                        padding-top: 20px;
                    }
                    .reset-button {
                        background: #667eea;
                        color: white;
                        padding: 10px 20px;
                        text-decoration: none;
                        border-radius: 5px;
                        display: inline-block;
                        margin: 10px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="reset-icon">🔐</div>
                        <h1>Reset Password</h1>
                    </div>
                    <div class="content">
                        <p><strong>Permintaan Reset Password Diterima</strong></p>
                        <p>Kami telah menerima permintaan untuk mereset password akun Anda.</p>
                        <p><em>"' . $message . '"</em></p>
                        <p>Klik tombol berikut untuk mereset password Anda:</p>
                        <p><a href="#" class="reset-button">Reset Password</a></p>
                        <p><small><em>Link ini akan expire dalam 1 jam.</em></small></p>
                        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
                    </div>
                    <div class="footer">
                        <p>Email ini dikirim secara otomatis oleh Sistem Firebase Login</p>
                        <p>© ' . date('Y') . ' Firebase Login System</p>
                    </div>
                </div>
            </body>
            </html>
            '
        ],
        
        // ============================================================================
        // TEMPLATE ALERT KEAMANAN
        // Template untuk notifikasi alert keamanan
        // ============================================================================
        'security_alert' => [
            'html' => '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    /* CSS Styles untuk Email Alert Keamanan */
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                        background-color: #f4f4f4; 
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        background: white; 
                        padding: 30px; 
                        border-radius: 10px; 
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .header { 
                        text-align: center; 
                        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
                        color: white; 
                        padding: 20px; 
                        border-radius: 10px 10px 0 0; 
                        margin: -30px -30px 30px -30px; 
                    }
                    .alert-icon { 
                        font-size: 48px; 
                        margin-bottom: 20px; 
                    }
                    .content { 
                        line-height: 1.6; 
                        color: #333; 
                    }
                    .footer { 
                        margin-top: 30px; 
                        text-align: center; 
                        color: #666; 
                        font-size: 12px; 
                        border-top: 1px solid #eee;
                        padding-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="alert-icon">⚠️</div>
                        <h1>Alert Keamanan</h1>
                    </div>
                    <div class="content">
                        <p><strong>Alert Keamanan Akun Anda</strong></p>
                        <p>Kami mendeteksi aktivitas mencurigakan pada akun Anda.</p>
                        <p><em>"' . $message . '"</em></p>
                        <p>Jika ini bukan aktivitas Anda, segera lakukan:</p>
                        <ul>
                            <li>Ubah password akun Anda</li>
                            <li>Periksa aktivitas login recentes</li>
                            <li>Aktifkan two-factor authentication</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>Email ini dikirim secara otomatis oleh Sistem Firebase Login</p>
                        <p>© ' . date('Y') . ' Firebase Login System</p>
                    </div>
                </div>
            </body>
            </html>
            '
        ],
        
        // ============================================================================
        // TEMPLATE INFO DEFAULT
        // Template untuk notifikasi informasi umum
        // ============================================================================
        'info' => [
            'html' => '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    /* CSS Styles untuk Email Info */
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 20px; 
                        background-color: #f4f4f4; 
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        background: white; 
                        padding: 30px; 
                        border-radius: 10px; 
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .header { 
                        text-align: center; 
                        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
                        color: white; 
                        padding: 20px; 
                        border-radius: 10px 10px 0 0; 
                        margin: -30px -30px 30px -30px; 
                    }
                    .info-icon { 
                        font-size: 48px; 
                        margin-bottom: 20px; 
                    }
                    .content { 
                        line-height: 1.6; 
                        color: #333; 
                    }
                    .footer { 
                        margin-top: 30px; 
                        text-align: center; 
                        color: #666; 
                        font-size: 12px; 
                        border-top: 1px solid #eee;
                        padding-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="info-icon">ℹ️</div>
                        <h1>Informasi</h1>
                    </div>
                    <div class="content">
                        <p><em>"' . $message . '"</em></p>
                    </div>
                    <div class="footer">
                        <p>Email ini dikirim secara otomatis oleh Sistem Firebase Login</p>
                        <p>© ' . date('Y') . ' Firebase Login System</p>
                    </div>
                </div>
            </body>
            </html>
            '
        ]
    ];
    
    // Kembalikan template untuk jenis yang ditentukan, atau template info default
    return $templates[$type] ?? $templates['info'];
}

// ============================================================================
// PENANGANAN REQUEST UTAMA
// Process request POST masuk dari frontend
// ============================================================================

// Periksa apakah metode request adalah POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // ====================================================================
    // VALIDASI INPUT
    // Validasi dan sanitize data input
    // ====================================================================
    
    // Dapatkan input JSON dari request body
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Periksa apakah parameter yang diperlukan ada
    if (!$input || !isset($input['email']) || !isset($input['type']) || !isset($input['message'])) {
        http_response_code(400);  // Bad Request
        echo json_encode([
            'success' => false,
            'message' => 'Parameter tidak lengkap'
        ]);
        exit();
    }
    
    // Sanitize dan validasi alamat email
    $email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
    
    // Dapatkan jenis notifikasi dan pesan
    $type = $input['type'];
    $message = $input['message'];
    
    // Dapatkan baris subjek atau gunakan default
    $subject = $input['subject'] ?? 'Notifikasi dari Firebase Login System';
    
    // Validasi format email
    if (!$email) {
        http_response_code(400);  // Bad Request
        echo json_encode([
            'success' => false,
            'message' => 'Email tidak valid'
        ]);
        exit();
    }
    
    // ====================================================================
    // KIRIM EMAIL
    // Panggil fungsi pengiriman email dengan parameter yang divalidasi
    // ====================================================================
    
    $result = sendNotificationEmail($email, $subject, $message, $type);
    
    // Kembalikan response JSON
    echo json_encode($result);
    
} else {
    // Handle metode HTTP yang tidak didukung
    http_response_code(405);  // Method Not Allowed
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}
?>
