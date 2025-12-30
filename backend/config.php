<?php
// ============================================================================
// EMAIL CONFIGURATION SETTINGS
// File: backend/config.php
// Description: Central configuration file for Firebase Login Email System
// Purpose: Store all SMTP, database, security, and email settings
// IMPORTANT: Replace placeholder values with your actual configuration
// ============================================================================

// ============================================================================
// SMTP EMAIL CONFIGURATION
// Configure SMTP settings for sending emails via PHPMailer
// These settings determine which email service will be used for sending notifications
// ============================================================================

// Gmail SMTP Configuration (Recommended for testing and development)
// For production, consider using a dedicated email service provider
define('SMTP_HOST', 'smtp.gmail.com');          // SMTP server hostname for Gmail
define('SMTP_PORT', 587);                       // SMTP port (587 for TLS, 465 for SSL)
define('SMTP_USERNAME', 'your-email@gmail.com'); // Your Gmail address (REPLACE THIS)
define('SMTP_PASSWORD', 'your-app-password');    // Gmail App Password (REPLACE THIS)
define('SMTP_FROM_EMAIL', 'your-email@gmail.com'); // From email address (REPLACE THIS)
define('SMTP_FROM_NAME', 'Firebase Login System');   // Display name for emails

// ============================================================================
// ALTERNATIVE SMTP PROVIDERS
// Uncomment and modify the section below for other email providers
// ============================================================================

/*
// Outlook/Hotmail SMTP Configuration
define('SMTP_HOST', 'smtp-mail.outlook.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@outlook.com');
define('SMTP_PASSWORD', 'your-password');
define('SMTP_FROM_EMAIL', 'your-email@outlook.com');
define('SMTP_FROM_NAME', 'Firebase Login System');

// Yahoo Mail SMTP Configuration
define('SMTP_HOST', 'smtp.mail.yahoo.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@yahoo.com');
define('SMTP_PASSWORD', 'your-app-password');
define('SMTP_FROM_EMAIL', 'your-email@yahoo.com');
define('SMTP_FROM_NAME', 'Firebase Login System');

// Custom SMTP Server Configuration
define('SMTP_HOST', 'your-smtp-server.com');
define('SMTP_PORT', 587); // or 465 for SSL
define('SMTP_USERNAME', 'your-smtp-username');
define('SMTP_PASSWORD', 'your-smtp-password');
define('SMTP_FROM_EMAIL', 'your-email@domain.com');
define('SMTP_FROM_NAME', 'Firebase Login System');
*/

// ============================================================================
// EMAIL SYSTEM CONTROL SETTINGS
// Settings to control email functionality for development and testing
// ============================================================================

// Enable or disable email sending globally
// true: Send actual emails (production mode)
// false: Disable email sending (testing mode)
define('ENABLE_EMAIL', true);

// Email logging instead of sending
// true: Log emails to file instead of sending (for testing)
// false: Send actual emails
define('LOG_EMAIL', true);

// ============================================================================
// DATABASE CONFIGURATION
// Database settings for storing user data and email logs (optional)
// Configure only if you want to store email logs or user activity
// ============================================================================

// Database connection settings
define('DB_HOST', 'localhost');     // Database server hostname
define('DB_NAME', 'firebase_login'); // Database name
define('DB_USER', 'root');          // Database username
define('DB_PASS', '');              // Database password

// ============================================================================
// SECURITY CONFIGURATION
// Security settings for API protection and JWT tokens
// IMPORTANT: Change these values in production for security
// ============================================================================

// JWT Secret Key for token generation and validation
// IMPORTANT: Replace with a strong, unique secret key in production
define('JWT_SECRET', 'your-jwt-secret-key-here');

// API Rate Limiting - Maximum requests per hour per IP
// Prevents abuse and DoS attacks
define('API_RATE_LIMIT', 100); // 100 requests per hour

// ============================================================================
// EMAIL RATE LIMITING
// Settings to prevent email spam and control email sending frequency
// ============================================================================

// Maximum number of emails that can be sent per hour
// Prevents spam and protects your SMTP provider
define('MAX_EMAIL_PER_HOUR', 50);

// Cooldown period between emails (in seconds)
// Prevents rapid-fire email sending
define('EMAIL_COOLDOWN', 60); // 60 seconds (1 minute) between emails

// ============================================================================
// LOGGING CONFIGURATION
// Settings for logging email activity and system events
// ============================================================================

// Log file path for email activity
// Emails will be logged here instead of being sent (when LOG_EMAIL = true)
// The directory will be created automatically if it doesn't exist
define('LOG_FILE', __DIR__ . '/logs/email_log.txt');

// Log file for general system activity
define('SYSTEM_LOG', __DIR__ . '/logs/system_log.txt');

// Log file for error tracking
define('ERROR_LOG', __DIR__ . '/logs/error_log.txt');

// ============================================================================
// DIRECTORY SETUP
// Create necessary directories for logging and temporary files
// ============================================================================

// Create logs directory if it doesn't exist
if (!file_exists(__DIR__ . '/logs')) {
    // Create directory with proper permissions
    // 0755 = rwxr-xr-x (owner: read/write/execute, group/others: read/execute)
    mkdir(__DIR__ . '/logs', 0755, true);
}

// Create temp directory for temporary files if needed
if (!file_exists(__DIR__ . '/temp')) {
    mkdir(__DIR__ . '/temp', 0755, true);
}

// ============================================================================
// ADDITIONAL CONFIGURATION OPTIONS
// Optional settings for enhanced functionality
// ============================================================================

// Email retry settings
define('EMAIL_MAX_RETRIES', 3);        // Maximum retry attempts for failed emails
define('EMAIL_RETRY_DELAY', 5);        // Delay between retries (seconds)

// Debug mode
define('DEBUG_MODE', false);           // Set to true for detailed error messages
define('VERBOSE_LOGGING', false);      // Set to true for detailed logging

// Email queue settings (for future enhancement)
define('EMAIL_QUEUE_ENABLED', false);  // Enable email queuing system
define('QUEUE_CHECK_INTERVAL', 30);    // Check queue every 30 seconds

// Backup email service (for failover)
define('BACKUP_SMTP_HOST', '');        // Backup SMTP server (optional)
define('BACKUP_SMTP_PORT', 587);       // Backup SMTP port
define('USE_BACKUP_ON_FAILURE', false); // Use backup server if primary fails

// ============================================================================
// TIMEZONE SETTING
// Set timezone for timestamp accuracy in logs and emails
// ============================================================================

// Set timezone to Indonesia (Jakarta)
// Change this to match your server's timezone
date_default_timezone_set('Asia/Jakarta');

// Alternative timezones you might want to use:
// date_default_timezone_set('UTC');           // Coordinated Universal Time
// date_default_timezone_set('America/New_York'); // Eastern Time
// date_default_timezone_set('Europe/London');    // Greenwich Mean Time

// ============================================================================
// HELPER FUNCTIONS
// Utility functions for configuration management
// ============================================================================

/**
 * Check if email sending is enabled
 * Returns: boolean - true if emails should be sent
 */
function isEmailEnabled() {
    return defined('ENABLE_EMAIL') && ENABLE_EMAIL;
}

/**
 * Check if email logging is enabled
 * Returns: boolean - true if emails should be logged instead of sent
 */
function isEmailLoggingEnabled() {
    return defined('LOG_EMAIL') && LOG_EMAIL;
}

/**
 * Get SMTP configuration as array
 * Returns: array with SMTP settings
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
 * Log configuration check (for debugging)
 * This function helps verify that configuration is loaded correctly
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

// Run configuration check if debug mode is enabled
if (defined('DEBUG_MODE') && DEBUG_MODE) {
    logConfigurationCheck();
}

// ============================================================================
// SECURITY NOTES
// Important security considerations for production deployment
// ============================================================================

/*
IMPORTANT SECURITY CHECKLIST:

1. Replace all placeholder values with actual credentials
2. Use strong, unique passwords and secret keys
3. Enable SSL/TLS for all email communications
4. Implement proper input validation and sanitization
5. Use environment variables for sensitive configuration
6. Enable rate limiting and DDoS protection
7. Regularly update dependencies and security patches
8. Monitor logs for suspicious activity
9. Implement proper error handling without exposing sensitive info
10. Use HTTPS for all communications in production

RECOMMENDED PRODUCTION CHANGES:
- Move configuration to environment variables
- Use a secrets management service
- Implement proper logging and monitoring
- Set up automated backups
- Enable security headers
- Use a web application firewall
*/

?>
