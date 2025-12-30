// Email API for backend communication
export class EmailAPI {
    constructor() {
        this.baseUrl = './backend';
        this.requestQueue = [];
        this.isProcessing = false;
    }

    /**
     * Send email notification via PHP backend
     * @param {string} email - Recipient email
     * @param {string} type - Notification type
     * @param {string} message - Message content
     * @param {string} subject - Email subject (optional)
     */
    async sendEmail(email, type, message, subject = null) {
        try {
            const requestData = {
                email: email,
                type: type,
                message: message,
                subject: subject || this.getDefaultSubject(type, message)
            };

            const response = await fetch(`${this.baseUrl}/send_notification.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (result.success) {
                console.log('Email notification sent successfully');
                return result;
            } else {
                console.error('Failed to send email:', result.message);
                return result;
            }
        } catch (error) {
            console.error('Email API error:', error);
            return {
                success: false,
                message: 'Network error: ' + error.message
            };
        }
    }

    /**
     * Get default subject based on notification type
     */
    getDefaultSubject(type, message) {
        const subjects = {
            'login_success': '🎉 Login Berhasil - Firebase Login System',
            'registration_success': '👋 Selamat Datang - Akun Berhasil Dibuat',
            'password_reset': '🔐 Reset Password - Permintaan Diterima',
            'security_alert': '⚠️ Alert Keamanan - Aktivitas Mencurigakan',
            'logout_success': '👋 Logout Berhasil - Sampai Jumpa'
        };

        return subjects[type] || 'Notifikasi dari Firebase Login System';
    }

    /**
     * Send login success notification
     */
    async sendLoginNotification(email, userName = null) {
        const userDisplayName = userName || email.split('@')[0];
        const message = `Selamat datang kembali, ${userDisplayName}! Anda berhasil masuk ke sistem pada ${new Date().toLocaleString('id-ID')}.`;

        return await this.sendEmail(email, 'login_success', message);
    }

    /**
     * Send registration success notification
     */
    async sendRegistrationNotification(email, userName = null) {
        const userDisplayName = userName || email.split('@')[0];
        const message = `Akun Anda berhasil dibuat! Selamat datang, ${userDisplayName}! Bergabung dengan kami pada ${new Date().toLocaleString('id-ID')}.`;

        return await this.sendEmail(email, 'registration_success', message);
    }

    /**
     * Send password reset notification
     */
    async sendPasswordResetNotification(email) {
        const message = `Permintaan reset password untuk email ${email} pada ${new Date().toLocaleString('id-ID')}. Link reset akan expire dalam 1 jam.`;

        return await this.sendEmail(email, 'password_reset', message);
    }

    /**
     * Send security alert notification
     */
    async sendSecurityAlert(email, activity = 'login') {
        const message = `Alert keamanan: Aktivitas ${activity} mencurigakan terdeteksi untuk email ${email} pada ${new Date().toLocaleString('id-ID')}.`;

        return await this.sendEmail(email, 'security_alert', message);
    }

    /**
     * Send logout notification
     */
    async sendLogoutNotification(email) {
        const message = `Anda telah logout dari sistem pada ${new Date().toLocaleString('id-ID')}. Terima kasih telah menggunakan layanan kami.`;

        return await this.sendEmail(email, 'logout_success', message);
    }

    /**
     * Test email functionality
     */
    async testEmail(email = 'qtonnnn@gmail.com') {
        const message = `Email test dari Firebase Login System. Dikirim pada ${new Date().toLocaleString('id-ID')}. Jika menerima email ini, sistem email berfungsi dengan baik!`;

        return await this.sendEmail(email, 'info', message, '🧪 Test Email - Firebase Login System');
    }

    /**
     * Check backend connectivity
     */
    async checkBackendStatus() {
        try {
            const response = await fetch(`${this.baseUrl}/send_notification.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'test@example.com',
                    type: 'info',
                    message: 'Backend connectivity test'
                })
            });

            return response.ok;
        } catch (error) {
            console.error('Backend connectivity check failed:', error);
            return false;
        }
    }

    /**
     * Process queued email requests
     */
    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        while (this.requestQueue.length > 0) {
            const request = this.requestQueue.shift();
            try {
                await this.sendEmail(request.email, request.type, request.message, request.subject);
                
                // Add delay between emails to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error('Failed to process queued email:', error);
            }
        }

        this.isProcessing = false;
    }

    /**
     * Queue email for later processing
     */
    queueEmail(email, type, message, subject = null) {
        this.requestQueue.push({
            email,
            type,
            message,
            subject
        });

        // Process queue after a short delay
        setTimeout(() => this.processQueue(), 500);
    }
}

// Create global instance
window.emailAPI = new EmailAPI();

// Export for use in modules
export default EmailAPI;
