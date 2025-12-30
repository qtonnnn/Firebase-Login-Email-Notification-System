// ============================================================================
// API EMAIL UNTUK KOMUNIKASI BACKEND
// File: js/email-api.js
// Description: Interface frontend untuk sistem notifikasi email
// Tujuan: Menangani komunikasi dengan backend PHP untuk mengirim notifikasi email
// Features: Queue management, Error handling, Email templates, Backend connectivity
// ============================================================================

// ============================================================================
// KELAS EMAIL API
// Kelas utama untuk menangani operasi email dan komunikasi backend
// ============================================================================
export class EmailAPI {
    
    // ============================================================================
    // KONSTRUKTOR
    // Inisialisasi EmailAPI dengan base URL dan queue management
    // ============================================================================
    constructor() {
        this.baseUrl = './backend';                 // Path ke direktori backend PHP
        this.requestQueue = [];                     // Queue untuk mengelola request email
        this.isProcessing = false;                  // Flag untuk mencegah concurrent processing
    }

    // ============================================================================
    // KIRIM NOTIFIKASI EMAIL
    // Fungsi: sendEmail(email, type, message, subject)
    // Tujuan: Kirim notifikasi email via backend PHP
    // Parameter:
    //   - email: Alamat email penerima
    //   - type: Jenis notifikasi (login_success, registration_success, dll.)
    //   - message: Konten pesan email
    //   - subject: Baris subjek email (opsional, auto-generate jika null)
    // Returns: Promise yang resolve ke objek response
    // ============================================================================
    async sendEmail(email, type, message, subject = null) {
        try {
            // Siapkan data request untuk backend
            const requestData = {
                email: email,                                       // Email penerima
                type: type,                                         // Jenis notifikasi
                message: message,                                   // Konten pesan
                subject: subject || this.getDefaultSubject(type, message) // Baris subjek
            };

            // Kirim POST request ke backend PHP
            const response = await fetch(`${this.baseUrl}/send_notification.php`, {
                method: 'POST',                                     // Metode HTTP
                headers: {
                    'Content-Type': 'application/json',             // Header content type
                },
                body: JSON.stringify(requestData)                   // Payload request
            });

            // Parse response JSON dari backend
            const result = await response.json();

            // Periksa apakah email berhasil dikirim
            if (result.success) {
                console.log('Email notification sent successfully');
                return result;
            } else {
                console.error('Failed to send email:', result.message);
                return result;
            }
        } catch (error) {
            // Tangani network atau parsing errors
            console.error('Email API error:', error);
            return {
                success: false,
                message: 'Network error: ' + error.message
            };
        }
    }

    // ============================================================================
    // DAPATKAN BARIS SUBJEK DEFAULT
    // Fungsi: getDefaultSubject(type, message)
    // Tujuan: Generate subjek email yang sesuai berdasarkan jenis notifikasi
    // Parameter:
    //   - type: Identifier jenis notifikasi
    //   - message: Konten pesan (untuk fallback)
    // Returns: String baris subjek dalam bahasa Indonesia
    // ============================================================================
    getDefaultSubject(type, message) {
        // Template subjek untuk berbagai jenis notifikasi
        const subjects = {
            'login_success': '🎉 Login Berhasil - Firebase Login System',
            'registration_success': '👋 Selamat Datang - Akun Berhasil Dibuat',
            'password_reset': '🔐 Reset Password - Permintaan Diterima',
            'security_alert': '⚠️ Alert Keamanan - Aktivitas Mencurigakan',
            'logout_success': '👋 Logout Berhasil - Sampai Jumpa'
        };

        // Kembalikan subjek untuk jenis tertentu atau subjek default
        return subjects[type] || 'Notifikasi dari Firebase Login System';
    }

    // ============================================================================
    // KIRIM NOTIFIKASI LOGIN SUKSES
    // Fungsi: sendLoginNotification(email, userName)
    // Tujuan: Kirim email ketika pengguna berhasil login
    // Parameter:
    //   - email: Alamat email pengguna
    //   - userName: Nama tampilan pengguna (opsional, ekstrak dari email jika null)
    // Returns: Promise yang resolve ke hasil pengiriman email
    // ============================================================================
    async sendLoginNotification(email, userName = null) {
        // Ekstrak display name dari email jika tidak disediakan
        const userDisplayName = userName || email.split('@')[0];
        
        // Buat pesan selamat datang yang dipersonalisasi
        const message = `Selamat datang kembali, ${userDisplayName}! Anda berhasil masuk ke sistem pada ${new Date().toLocaleString('id-ID')}.`;

        // Kirim email sukses login
        return await this.sendEmail(email, 'login_success', message);
    }

    // ============================================================================
    // KIRIM NOTIFIKASI PENDAFTARAN SUKSES
    // Fungsi: sendRegistrationNotification(email, userName)
    // Tujuan: Kirim email ketika pengguna baru berhasil mendaftar
    // Parameter:
    //   - email: Alamat email pengguna baru
    //   - userName: Nama tampilan pengguna (opsional, ekstrak dari email jika null)
    // Returns: Promise yang resolve ke hasil pengiriman email
    // ============================================================================
    async sendRegistrationNotification(email, userName = null) {
        // Ekstrak display name dari email jika tidak disediakan
        const userDisplayName = userName || email.split('@')[0];
        
        // Buat pesan selamat datang untuk pengguna baru
        const message = `Akun Anda berhasil dibuat! Selamat datang, ${userDisplayName}! Bergabung dengan kami pada ${new Date().toLocaleString('id-ID')}.`;

        // Kirim email sukses pendaftaran
        return await this.sendEmail(email, 'registration_success', message);
    }

    // ============================================================================
    // KIRIM NOTIFIKASI RESET PASSWORD
    // Fungsi: sendPasswordResetNotification(email)
    // Tujuan: Kirim email ketika pengguna meminta reset password
    // Parameter:
    //   - email: Alamat email pengguna
    // Returns: Promise yang resolve ke hasil pengiriman email
    // ============================================================================
    async sendPasswordResetNotification(email) {
        // Buat pesan notifikasi reset password
        const message = `Permintaan reset password untuk email ${email} pada ${new Date().toLocaleString('id-ID')}. Link reset akan expire dalam 1 jam.`;

        // Kirim email reset password
        return await this.sendEmail(email, 'password_reset', message);
    }

    // ============================================================================
    // KIRIM NOTIFIKASI ALERT KEAMANAN
    // Fungsi: sendSecurityAlert(email, activity)
    // Tujuan: Kirim email alert keamanan untuk aktivitas mencurigakan
    // Parameter:
    //   - email: Alamat email pengguna
    //   - activity: Jenis aktivitas mencurigakan (default: 'login')
    // Returns: Promise yang resolve ke hasil pengiriman email
    // ============================================================================
    async sendSecurityAlert(email, activity = 'login') {
        // Buat pesan alert keamanan
        const message = `Alert keamanan: Aktivitas ${activity} mencurigakan terdeteksi untuk email ${email} pada ${new Date().toLocaleString('id-ID')}.`;

        // Kirim email alert keamanan
        return await this.sendEmail(email, 'security_alert', message);
    }

    // ============================================================================
    // KIRIM NOTIFIKASI LOGOUT
    // Fungsi: sendLogoutNotification(email)
    // Tujuan: Kirim email ketika pengguna berhasil logout
    // Parameter:
    //   - email: Alamat email pengguna
    // Returns: Promise yang resolve ke hasil pengiriman email
    // ============================================================================
    async sendLogoutNotification(email) {
        // Buat pesan konfirmasi logout
        const message = `Anda telah logout dari sistem pada ${new Date().toLocaleString('id-ID')}. Terima kasih telah menggunakan layanan kami.`;

        // Kirim email logout
        return await this.sendEmail(email, 'logout_success', message);
    }

    // ============================================================================
    // TEST FUNGSIONALITAS EMAIL
    // Fungsi: testEmail(email)
    // Tujuan: Test sistem email dengan mengirim email test
    // Parameter:
    //   - email: Alamat email untuk mengirim test (default: qtonnnn@gmail.com)
    // Returns: Promise yang resolve ke hasil pengiriman email
    // ============================================================================
    async testEmail(email = 'qtonnnn@gmail.com') {
        // Buat pesan test dengan timestamp
        const message = `Email test dari Firebase Login System. Dikirim pada ${new Date().toLocaleString('id-ID')}. Jika menerima email ini, sistem email berfungsi dengan baik!`;

        // Kirim email test dengan subjek kustom
        return await this.sendEmail(email, 'info', message, '🧪 Test Email - Firebase Login System');
    }

    // ============================================================================
    // PERIKSA KONEKTIVITAS BACKEND
    // Fungsi: checkBackendStatus()
    // Tujuan: Test apakah backend PHP dapat diakses dan merespons
    // Returns: Promise yang resolve ke boolean (true jika backend berfungsi)
    // ============================================================================
    async checkBackendStatus() {
        try {
            // Kirim request test ke backend
            const response = await fetch(`${this.baseUrl}/send_notification.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'test@example.com',           // Email test
                    type: 'info',                        // Jenis notifikasi test
                    message: 'Backend connectivity test' // Pesan test
                })
            });

            // Kembalikan true jika response OK
            return response.ok;
        } catch (error) {
            console.error('Backend connectivity check failed:', error);
            return false;
        }
    }

    // ============================================================================
    // PROSES QUEUE REQUEST EMAIL
    // Fungsi: processQueue()
    // Tujuan: Proses request email dalam queue satu per satu
    // Termasuk rate limiting untuk mencegah overwhelming server
    // ============================================================================
    async processQueue() {
        // Jangan proses jika sudah memproses atau queue kosong
        if (this.isProcessing || this.requestQueue.length === 0) {
            return;
        }

        // Set flag processing
        this.isProcessing = true;

        // Proses semua request dalam queue
        while (this.requestQueue.length > 0) {
            // Dapatkan request berikutnya dari queue
            const request = this.requestQueue.shift();
            
            try {
                // Kirim email untuk request saat ini
                await this.sendEmail(request.email, request.type, request.message, request.subject);
                
                // Tambahkan delay di antara email untuk mencegah rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error('Failed to process queued email:', error);
                // Lanjutkan memproses email lain meskipun satu gagal
            }
        }

        // Clear flag processing
        this.isProcessing = false;
    }

    // ============================================================================
    // QUEUE EMAIL UNTUK PEMROSESAN NANTI
    // Fungsi: queueEmail(email, type, message, subject)
    // Tujuan: Tambahkan request email ke queue untuk pemrosesan nanti
    // Parameter:
    //   - email: Alamat email penerima
    //   - type: Jenis notifikasi
    //   - message: Konten pesan
    //   - subject: Baris subjek (opsional)
    // ============================================================================
    queueEmail(email, type, message, subject = null) {
        // Tambahkan request ke queue
        this.requestQueue.push({
            email,
            type,
            message,
            subject
        });

        // Mulai memproses queue setelah delay pendek
        setTimeout(() => this.processQueue(), 500);
    }

    // ============================================================================
    // PENGIRIMAN EMAIL BATCH (Enhancement Opsional)
    // Fungsi: sendBatchEmails(emailList, type, messageTemplate)
    // Tujuan: Kirim email yang sama ke beberapa penerima secara efisien
    // Parameter:
    //   - emailList: Array alamat email
    //   - type: Jenis notifikasi
    //   - messageTemplate: Fungsi template yang mengambil email dan mengembalikan pesan
    // Returns: Promise yang resolve ketika semua email terkirim
    // ============================================================================
    async sendBatchEmails(emailList, type, messageTemplate) {
        const results = [];
        
        for (const email of emailList) {
            try {
                const message = messageTemplate(email);
                const result = await this.sendEmail(email, type, message);
                results.push({ email, success: result.success, result });
                
                // Tambahkan delay di antara email
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Failed to send batch email to ${email}:`, error);
                results.push({ email, success: false, error });
            }
        }
        
        return results;
    }

    // ============================================================================
    // DAPATKAN STATUS QUEUE (Enhancement Opsional)
    // Fungsi: getQueueStatus()
    // Tujuan: Dapatkan informasi tentang status queue saat ini
    // Returns: Objek dengan informasi queue
    // ============================================================================
    getQueueStatus() {
        return {
            queueLength: this.requestQueue.length,
            isProcessing: this.isProcessing,
            baseUrl: this.baseUrl
        };
    }

    // ============================================================================
    // CLEAR EMAIL QUEUE (Enhancement Opsional)
    // Fungsi: clearQueue()
    // Tujuan: Hapus semua request email yang pending dari queue
    // ============================================================================
    clearQueue() {
        this.requestQueue = [];
        this.isProcessing = false;
        console.log('Email queue cleared');
    }
}

// ============================================================================
// PEMBUATAN INSTANCE GLOBAL
// Buat instance global untuk penggunaan di seluruh aplikasi
// Ini memungkinkan akses mudah melalui window.emailAPI dari script mana pun
// ============================================================================
window.emailAPI = new EmailAPI();

// ============================================================================
// EXPORT MODULE
// Export kelas untuk digunakan dalam modul ES6
// Ini memungkinkan import EmailAPI di file JavaScript lain
// ============================================================================
export default EmailAPI;
