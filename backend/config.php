<?php
// Email Configuration
// Replace these with your actual SMTP settings

// For Gmail SMTP
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@gmail.com'); // Replace with your email
define('SMTP_PASSWORD', 'your-app-password'); // Replace with your app password
define('SMTP_FROM_EMAIL', 'your-email@gmail.com'); // Replace with your email
define('SMTP_FROM_NAME', 'Firebase Login System');

// For other SMTP providers, update accordingly:
// Outlook: smtp-mail.outlook.com, port 587
// Yahoo: smtp.mail.yahoo.com, port 587
// Custom: your-smtp-server.com, port 587 or 465

// For development/testing, you can use:
define('ENABLE_EMAIL', true); // Set to false to disable email sending
define('LOG_EMAIL', true); // Set to true to log emails instead of sending

// Database Configuration (if needed for storing email logs)
define('DB_HOST', 'localhost');
define('DB_NAME', 'firebase_login');
define('DB_USER', 'root');
define('DB_PASS', '');

// Security
define('JWT_SECRET', 'your-jwt-secret-key-here');
define('API_RATE_LIMIT', 100); // Max requests per hour

// Email Settings
define('MAX_EMAIL_PER_HOUR', 50);
define('EMAIL_COOLDOWN', 60); // Seconds between emails

// Log file path
define('LOG_FILE', __DIR__ . '/logs/email_log.txt');

// Create logs directory if it doesn't exist
if (!file_exists(__DIR__ . '/logs')) {
    mkdir(__DIR__ . '/logs', 0755, true);
}
?>
