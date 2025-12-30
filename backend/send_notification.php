<?php
// ============================================================================
// EMAIL NOTIFICATION SENDER
// File: backend/send_notification.php
// Description: PHP backend for sending email notifications via PHPMailer
// Purpose: Handle email sending from Firebase login system to users
// Features: SMTP configuration, Email templates, Error handling, CORS support
// ============================================================================

// ============================================================================
// CORS HEADERS AND SECURITY
// Set headers to allow cross-origin requests from frontend
// ============================================================================

// Set response content type to JSON
header('Content-Type: application/json');

// Allow cross-origin requests from any domain (for development)
// In production, replace '*' with your specific domain
header('Access-Control-Allow-Origin: *');

// Allow specific HTTP methods
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');

// Allow specific headers
header('Access-Control-Allow-Headers: Content-Type');

// ============================================================================
// PREFLIGHT REQUEST HANDLING
// Handle OPTIONS requests for CORS preflight
// ============================================================================

// If request method is OPTIONS (preflight), return 200 OK and exit
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);  // HTTP 200 OK
    exit();                   // Exit script
}

// ============================================================================
// DEPENDENCY INCLUDES
// Include PHPMailer and configuration files
// ============================================================================

// Include PHPMailer autoloader (loaded via Composer)
require_once 'vendor/autoload.php';

// Include email configuration settings
require_once 'config.php';

// ============================================================================
// PHPMAILER NAMESPACE IMPORTS
// Import PHPMailer classes for email functionality
// ============================================================================

use PHPMailer\PHPMailer\PHPMailer;      // Main PHPMailer class
use PHPMailer\PHPMailer\SMTP;           // SMTP configuration class
use PHPMailer\PHPMailer\Exception;      // Exception handling class

// ============================================================================
// MAIN EMAIL SENDING FUNCTION
// Function: sendNotificationEmail($email, $subject, $message, $type)
// Purpose: Send notification email using PHPMailer with SMTP configuration
// Parameters:
//   - $email: Recipient email address
//   - $subject: Email subject line
//   - $message: Email message content
//   - $type: Notification type (for template selection)
// Returns: Array with success status and message
// ============================================================================
function sendNotificationEmail($email, $subject, $message, $type = 'info') {
    // Create new PHPMailer instance
    $mail = new PHPMailer(true);
    
    try {
        // ====================================================================
        // SMTP SERVER CONFIGURATION
        // Configure SMTP settings for email sending
        // ====================================================================
        
        // Set email sending method to SMTP
        $mail->isSMTP();
        
        // SMTP server hostname (from config.php)
        $mail->Host       = SMTP_HOST;
        
        // Enable SMTP authentication
        $mail->SMTPAuth   = true;
        
        // SMTP username (from config.php)
        $mail->Username   = SMTP_USERNAME;
        
        // SMTP password (from config.php)
        $mail->Password   = SMTP_PASSWORD;
        
        // Enable TLS encryption
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        
        // SMTP port number (from config.php)
        $mail->Port       = SMTP_PORT;
        
        // ====================================================================
        // EMAIL RECIPIENTS CONFIGURATION
        // Set sender, recipient, and BCC addresses
        // ====================================================================
        
        // Set sender information (from config.php)
        $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        
        // Add recipient (the user)
        $mail->addAddress($email, 'Pengguna');
        
        // Add BCC (Blind Carbon Copy) to admin for monitoring
        $mail->addBCC('qtonnnn@gmail.com', 'Admin');
        
        // ====================================================================
        // EMAIL CONTENT CONFIGURATION
        // Set email format, subject, and body content
        // ====================================================================
        
        // Set email format to HTML
        $mail->isHTML(true);
        
        // Set email subject line
        $mail->Subject = $subject;
        
        // Get email template based on notification type
        $emailTemplate = getEmailTemplate($type, $message);
        
        // Set HTML email body content
        $mail->Body = $emailTemplate['html'];
        
        // Set plain text alternative for email clients that don't support HTML
        $mail->AltBody = strip_tags($message);
        
        // ====================================================================
        // SEND EMAIL
        // Attempt to send the email via SMTP
        // ====================================================================
        
        $mail->send();
        
        // Return success response
        return [
            'success' => true,
            'message' => 'Email notifikasi berhasil dikirim'
        ];
        
    } catch (Exception $e) {
        // Handle email sending errors
        return [
            'success' => false,
            'message' => 'Gagal mengirim email: ' . $mail->ErrorInfo
        ];
    }
}

// ============================================================================
// EMAIL TEMPLATE GENERATOR
// Function: getEmailTemplate($type, $message)
// Purpose: Generate HTML email templates based on notification type
// Parameters:
//   - $type: Notification type identifier
//   - $message: Message content to include in template
// Returns: Array with HTML template content
// ============================================================================
function getEmailTemplate($type, $message) {
    // Define email templates for different notification types
    $templates = [
        
        // ============================================================================
        // LOGIN SUCCESS TEMPLATE
        // Template for successful login notifications
        // ============================================================================
        'login_success' => [
            'html' => '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    /* CSS Styles for Login Success Email */
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
        // REGISTRATION SUCCESS TEMPLATE
        // Template for new user registration notifications
        // ============================================================================
        'registration_success' => [
            'html' => '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    /* CSS Styles for Registration Success Email */
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
        // PASSWORD RESET TEMPLATE
        // Template for password reset request notifications
        // ============================================================================
        'password_reset' => [
            'html' => '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    /* CSS Styles for Password Reset Email */
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
        // SECURITY ALERT TEMPLATE
        // Template for security alert notifications
        // ============================================================================
        'security_alert' => [
            'html' => '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    /* CSS Styles for Security Alert Email */
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
        // DEFAULT INFO TEMPLATE
        // Template for general information notifications
        // ============================================================================
        'info' => [
            'html' => '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    /* CSS Styles for Info Email */
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
    
    // Return template for specified type, or default info template
    return $templates[$type] ?? $templates['info'];
}

// ============================================================================
// MAIN REQUEST HANDLER
// Process incoming POST requests from frontend
// ============================================================================

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // ====================================================================
    // INPUT VALIDATION
    // Validate and sanitize input data
    // ====================================================================
    
    // Get JSON input from request body
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Check if required parameters are present
    if (!$input || !isset($input['email']) || !isset($input['type']) || !isset($input['message'])) {
        http_response_code(400);  // Bad Request
        echo json_encode([
            'success' => false,
            'message' => 'Parameter tidak lengkap'
        ]);
        exit();
    }
    
    // Sanitize and validate email address
    $email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
    
    // Get notification type and message
    $type = $input['type'];
    $message = $input['message'];
    
    // Get subject line or use default
    $subject = $input['subject'] ?? 'Notifikasi dari Firebase Login System';
    
    // Validate email format
    if (!$email) {
        http_response_code(400);  // Bad Request
        echo json_encode([
            'success' => false,
            'message' => 'Email tidak valid'
        ]);
        exit();
    }
    
    // ====================================================================
    // SEND EMAIL
    // Call email sending function with validated parameters
    // ====================================================================
    
    $result = sendNotificationEmail($email, $subject, $message, $type);
    
    // Return JSON response
    echo json_encode($result);
    
} else {
    // Handle unsupported HTTP methods
    http_response_code(405);  // Method Not Allowed
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}
?>
