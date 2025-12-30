<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'vendor/autoload.php';
require_once 'config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

function sendNotificationEmail($email, $subject, $message, $type = 'info') {
    $mail = new PHPMailer(true);
    
    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USERNAME;
        $mail->Password   = SMTP_PASSWORD;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = SMTP_PORT;
        
        // Recipients
        $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        $mail->addAddress($email, 'Pengguna');
        $mail->addBCC('qtonnnn@gmail.com', 'Admin'); // Copy to admin
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        
        // Email template based on type
        $emailTemplate = getEmailTemplate($type, $message);
        $mail->Body = $emailTemplate['html'];
        $mail->AltBody = strip_tags($message);
        
        // Send email
        $mail->send();
        
        return [
            'success' => true,
            'message' => 'Email notifikasi berhasil dikirim'
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Gagal mengirim email: ' . $mail->ErrorInfo
        ];
    }
}

function getEmailTemplate($type, $message) {
    $templates = [
        'login_success' => [
            'html' => '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
                    .header { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; margin: -30px -30px 30px -30px; }
                    .success-icon { font-size: 48px; color: #10b981; margin-bottom: 20px; }
                    .content { line-height: 1.6; color: #333; }
                    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
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
        'registration_success' => [
            'html' => '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
                    .header { text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; margin: -30px -30px 30px -30px; }
                    .welcome-icon { font-size: 48px; margin-bottom: 20px; }
                    .content { line-height: 1.6; color: #333; }
                    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
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
        'password_reset' => [
            'html' => '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
                    .header { text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; margin: -30px -30px 30px -30px; }
                    .reset-icon { font-size: 48px; margin-bottom: 20px; }
                    .content { line-height: 1.6; color: #333; }
                    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
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
                        <p>Klik link berikut untuk mereset password Anda:</p>
                        <p><a href="#" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
                        <p><small>Link ini akan expire dalam 1 jam.</small></p>
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
        'security_alert' => [
            'html' => '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
                    .header { text-align: center; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; margin: -30px -30px 30px -30px; }
                    .alert-icon { font-size: 48px; margin-bottom: 20px; }
                    .content { line-height: 1.6; color: #333; }
                    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
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
        ]
    ];
    
    return $templates[$type] ?? $templates['info'];
}

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['email']) || !isset($input['type']) || !isset($input['message'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Parameter tidak lengkap'
        ]);
        exit();
    }
    
    $email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
    $type = $input['type'];
    $message = $input['message'];
    $subject = $input['subject'] ?? 'Notifikasi dari Firebase Login System';
    
    if (!$email) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Email tidak valid'
        ]);
        exit();
    }
    
    $result = sendNotificationEmail($email, $subject, $message, $type);
    
    echo json_encode($result);
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}
?>
