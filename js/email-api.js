// ============================================================================
// EMAIL API FOR BACKEND COMMUNICATION
// File: js/email-api.js
// Description: Frontend interface for email notification system
// Purpose: Handle communication with PHP backend for sending email notifications
// Features: Queue management, Error handling, Email templates, Backend connectivity
// ============================================================================

// ============================================================================
// EMAIL API CLASS
// Main class for handling email operations and backend communication
// ============================================================================
export class EmailAPI {
    
    // ============================================================================
    // CONSTRUCTOR
    // Initialize EmailAPI with base URL and queue management
    // ============================================================================
    constructor() {
        this.baseUrl = './backend';                 // Path to PHP backend directory
        this.requestQueue = [];                     // Queue for managing email requests
        this.isProcessing = false;                  // Flag to prevent concurrent processing
    }

    // ============================================================================
    // SEND EMAIL NOTIFICATION
    // Function: sendEmail(email, type, message, subject)
    // Purpose: Send email notification via PHP backend
    // Parameters:
    //   - email: Recipient email address
    //   - type: Notification type (login_success, registration_success, etc.)
    //   - message: Email message content
    //   - subject: Email subject line (optional, auto-generated if null)
    // Returns: Promise that resolves to response object
    // ============================================================================
    async sendEmail(email, type, message, subject = null) {
        try {
            // Prepare request data for backend
            const requestData = {
                email: email,                                       // Recipient email
                type: type,                                         // Notification type
                message: message,                                   // Message content
                subject: subject || this.getDefaultSubject(type, message) // Subject line
            };

            // Send POST request to PHP backend
            const response = await fetch(`${this.baseUrl}/send_notification.php`, {
                method: 'POST',                                     // HTTP method
                headers: {
                    'Content-Type': 'application/json',             // Content type header
                },
                body: JSON.stringify(requestData)                   // Request payload
            });

            // Parse JSON response from backend
            const result = await response.json();

            // Check if email was sent successfully
            if (result.success) {
                console.log('Email notification sent successfully');
                return result;
            } else {
                console.error('Failed to send email:', result.message);
                return result;
            }
        } catch (error) {
            // Handle network or parsing errors
            console.error('Email API error:', error);
            return {
                success: false,
                message: 'Network error: ' + error.message
            };
        }
    }

    // ============================================================================
    // GET DEFAULT SUBJECT LINE
    // Function: getDefaultSubject(type, message)
    // Purpose: Generate appropriate email subject based on notification type
    // Parameters:
    //   - type: Notification type identifier
    //   - message: Message content (for fallback)
    // Returns: Subject line string in Indonesian
    // ============================================================================
    getDefaultSubject(type, message) {
        // Subject templates for different notification types
        const subjects = {
            'login_success': '🎉 Login Berhasil - Firebase Login System',
            'registration_success': '👋 Selamat Datang - Akun Berhasil Dibuat',
            'password_reset': '🔐 Reset Password - Permintaan Diterima',
            'security_alert': '⚠️ Alert Keamanan - Aktivitas Mencurigakan',
            'logout_success': '👋 Logout Berhasil - Sampai Jumpa'
        };

        // Return subject for type or default subject
        return subjects[type] || 'Notifikasi dari Firebase Login System';
    }

    // ============================================================================
    // SEND LOGIN SUCCESS NOTIFICATION
    // Function: sendLoginNotification(email, userName)
    // Purpose: Send email when user successfully logs in
    // Parameters:
    //   - email: User's email address
    //   - userName: User's display name (optional, extracted from email if null)
    // Returns: Promise that resolves to email sending result
    // ============================================================================
    async sendLoginNotification(email, userName = null) {
        // Extract display name from email if not provided
        const userDisplayName = userName || email.split('@')[0];
        
        // Create personalized welcome message
        const message = `Selamat datang kembali, ${userDisplayName}! Anda berhasil masuk ke sistem pada ${new Date().toLocaleString('id-ID')}.`;

        // Send login success email
        return await this.sendEmail(email, 'login_success', message);
    }

    // ============================================================================
    // SEND REGISTRATION SUCCESS NOTIFICATION
    // Function: sendRegistrationNotification(email, userName)
    // Purpose: Send email when new user successfully registers
    // Parameters:
    //   - email: New user's email address
    //   - userName: User's display name (optional, extracted from email if null)
    // Returns: Promise that resolves to email sending result
    // ============================================================================
    async sendRegistrationNotification(email, userName = null) {
        // Extract display name from email if not provided
        const userDisplayName = userName || email.split('@')[0];
        
        // Create welcome message for new user
        const message = `Akun Anda berhasil dibuat! Selamat datang, ${userDisplayName}! Bergabung dengan kami pada ${new Date().toLocaleString('id-ID')}.`;

        // Send registration success email
        return await this.sendEmail(email, 'registration_success', message);
    }

    // ============================================================================
    // SEND PASSWORD RESET NOTIFICATION
    // Function: sendPasswordResetNotification(email)
    // Purpose: Send email when user requests password reset
    // Parameters:
    //   - email: User's email address
    // Returns: Promise that resolves to email sending result
    // ============================================================================
    async sendPasswordResetNotification(email) {
        // Create password reset notification message
        const message = `Permintaan reset password untuk email ${email} pada ${new Date().toLocaleString('id-ID')}. Link reset akan expire dalam 1 jam.`;

        // Send password reset email
        return await this.sendEmail(email, 'password_reset', message);
    }

    // ============================================================================
    // SEND SECURITY ALERT NOTIFICATION
    // Function: sendSecurityAlert(email, activity)
    // Purpose: Send security alert email for suspicious activities
    // Parameters:
    //   - email: User's email address
    //   - activity: Type of suspicious activity (default: 'login')
    // Returns: Promise that resolves to email sending result
    // ============================================================================
    async sendSecurityAlert(email, activity = 'login') {
        // Create security alert message
        const message = `Alert keamanan: Aktivitas ${activity} mencurigakan terdeteksi untuk email ${email} pada ${new Date().toLocaleString('id-ID')}.`;

        // Send security alert email
        return await this.sendEmail(email, 'security_alert', message);
    }

    // ============================================================================
    // SEND LOGOUT NOTIFICATION
    // Function: sendLogoutNotification(email)
    // Purpose: Send email when user successfully logs out
    // Parameters:
    //   - email: User's email address
    // Returns: Promise that resolves to email sending result
    // ============================================================================
    async sendLogoutNotification(email) {
        // Create logout confirmation message
        const message = `Anda telah logout dari sistem pada ${new Date().toLocaleString('id-ID')}. Terima kasih telah menggunakan layanan kami.`;

        // Send logout email
        return await this.sendEmail(email, 'logout_success', message);
    }

    // ============================================================================
    // TEST EMAIL FUNCTIONALITY
    // Function: testEmail(email)
    // Purpose: Test email system by sending test email
    // Parameters:
    //   - email: Email address to send test to (default: qtonnnn@gmail.com)
    // Returns: Promise that resolves to email sending result
    // ============================================================================
    async testEmail(email = 'qtonnnn@gmail.com') {
        // Create test message with timestamp
        const message = `Email test dari Firebase Login System. Dikirim pada ${new Date().toLocaleString('id-ID')}. Jika menerima email ini, sistem email berfungsi dengan baik!`;

        // Send test email with custom subject
        return await this.sendEmail(email, 'info', message, '🧪 Test Email - Firebase Login System');
    }

    // ============================================================================
    // CHECK BACKEND CONNECTIVITY
    // Function: checkBackendStatus()
    // Purpose: Test if PHP backend is accessible and responding
    // Returns: Promise that resolves to boolean (true if backend is working)
    // ============================================================================
    async checkBackendStatus() {
        try {
            // Send test request to backend
            const response = await fetch(`${this.baseUrl}/send_notification.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'test@example.com',           // Test email
                    type: 'info',                        // Test notification type
                    message: 'Backend connectivity test' // Test message
                })
            });

            // Return true if response is OK
            return response.ok;
        } catch (error) {
            console.error('Backend connectivity check failed:', error);
            return false;
        }
    }

    // ============================================================================
    // PROCESS EMAIL REQUEST QUEUE
    // Function: processQueue()
    // Purpose: Process queued email requests one by one
    // Includes rate limiting to prevent overwhelming the server
    // ============================================================================
    async processQueue() {
        // Don't process if already processing or queue is empty
        if (this.isProcessing || this.requestQueue.length === 0) {
            return;
        }

        // Set processing flag
        this.isProcessing = true;

        // Process all queued requests
        while (this.requestQueue.length > 0) {
            // Get next request from queue
            const request = this.requestQueue.shift();
            
            try {
                // Send email for current request
                await this.sendEmail(request.email, request.type, request.message, request.subject);
                
                // Add delay between emails to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error('Failed to process queued email:', error);
                // Continue processing other emails even if one fails
            }
        }

        // Clear processing flag
        this.isProcessing = false;
    }

    // ============================================================================
    // QUEUE EMAIL FOR LATER PROCESSING
    // Function: queueEmail(email, type, message, subject)
    // Purpose: Add email request to queue for later processing
    // Parameters:
    //   - email: Recipient email address
    //   - type: Notification type
    //   - message: Message content
    //   - subject: Subject line (optional)
    // ============================================================================
    queueEmail(email, type, message, subject = null) {
        // Add request to queue
        this.requestQueue.push({
            email,
            type,
            message,
            subject
        });

        // Start processing queue after short delay
        setTimeout(() => this.processQueue(), 500);
    }

    // ============================================================================
    // BATCH EMAIL SENDING (Optional Enhancement)
    // Function: sendBatchEmails(emailList, type, messageTemplate)
    // Purpose: Send same email to multiple recipients efficiently
    // Parameters:
    //   - emailList: Array of email addresses
    //   - type: Notification type
    //   - messageTemplate: Template function that takes email and returns message
    // Returns: Promise that resolves when all emails are sent
    // ============================================================================
    async sendBatchEmails(emailList, type, messageTemplate) {
        const results = [];
        
        for (const email of emailList) {
            try {
                const message = messageTemplate(email);
                const result = await this.sendEmail(email, type, message);
                results.push({ email, success: result.success, result });
                
                // Add delay between emails
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Failed to send batch email to ${email}:`, error);
                results.push({ email, success: false, error });
            }
        }
        
        return results;
    }

    // ============================================================================
    // GET QUEUE STATUS (Optional Enhancement)
    // Function: getQueueStatus()
    // Purpose: Get information about current queue status
    // Returns: Object with queue information
    // ============================================================================
    getQueueStatus() {
        return {
            queueLength: this.requestQueue.length,
            isProcessing: this.isProcessing,
            baseUrl: this.baseUrl
        };
    }

    // ============================================================================
    // CLEAR EMAIL QUEUE (Optional Enhancement)
    // Function: clearQueue()
    // Purpose: Clear all pending email requests from queue
    // ============================================================================
    clearQueue() {
        this.requestQueue = [];
        this.isProcessing = false;
        console.log('Email queue cleared');
    }
}

// ============================================================================
// GLOBAL INSTANCE CREATION
// Create global instance for use across the application
// This allows easy access via window.emailAPI from any script
// ============================================================================
window.emailAPI = new EmailAPI();

// ============================================================================
// MODULE EXPORT
// Export class for use in ES6 modules
// This allows importing EmailAPI in other JavaScript files
// ============================================================================
export default EmailAPI;
