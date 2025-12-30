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
        this.antrianRequest = [];                     // Antrian untuk mengelola request email
        this.sedangMemproses = false;                  // Flag untuk mencegah concurrent processing
    }

    // ============================================================================
    // KIRIM NOTIFIKASI EMAIL
    // Fungsi: kirimEmail(email, jenis, pesan, subjek)
    // Tujuan: Kirim notifikasi email via backend PHP
    // Parameter:
    //   - email: Alamat email penerima
    //   - jenis: Jenis notifikasi (login_success, registration_success, dll.)
    //   - pesan: Konten pesan email
    //   - subjek: Baris subjek email (opsional, auto-generate jika null)
    // Returns: Promise yang resolve ke objek response
    // ============================================================================
    async kirimEmail(email, jenis, pesan, subjek = null) {
        try {
            // Siapkan data request untuk backend
            const dataRequest = {
                email: email,                                       // Email penerima
                jenis: jenis,                                         // Jenis notifikasi
                pesan: pesan,                                   // Konten pesan
                subjek: subjek || dapatkanSubjekDefault(jenis, pesan) // Baris subjek
            };

            // Kirim POST request ke backend PHP
            const response = await fetch(`${this.baseUrl}/send_notification.php`, {
                method: 'POST',                                     // Metode HTTP
                headers: {
                    'Content-Type': 'application/json',             // Header content type
                },
                body: JSON.stringify(dataRequest)                   // Payload request
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
    // Fungsi: dapatkanSubjekDefault(jenis, pesan)
    // Tujuan: Generate subjek email yang sesuai berdasarkan jenis notifikasi
    // Parameter:
    //   - jenis: Identifier jenis notifikasi
    //   - pesan: Konten pesan (untuk fallback)
    // Returns: String baris subjek dalam bahasa Indonesia
    // ============================================================================
    dapatkanSubjekDefault(jenis, pesan) {
        // Template subjek untuk berbagai jenis notifikasi
        const subjekTemplate = {
            'login_success': '🎉 Login Berhasil - Firebase Login System',
            'registration_success': '👋 Selamat Datang - Akun Berhasil Dibuat',
            'password_reset': '🔐 Reset Password - Permintaan Diterima',
            'security_alert': '⚠️ Alert Keamanan - Aktivitas Mencurigakan',
            'logout_success': '👋 Logout Berhasil - Sampai Jumpa'
        };

        // Kembalikan subjek untuk jenis tertentu atau subjek default
        return subjekTemplate[jenis] || 'Notifikasi dari Firebase Login System';
    }

    // ============================================================================
    // KIRIM NOTIFIKASI LOGIN SUKSES
    // Fungsi: kirimNotifikasiLogin(email, namaUser)
    // Tujuan: Kirim email ketika pengguna berhasil login
    // Parameter:
    //   - email: Alamat email pengguna
    //   - namaUser: Nama tampilan pengguna (opsional, ekstrak dari email jika null)
    // Returns: Promise yang resolve ke hasil pengiriman email
    // ============================================================================
    async kirimNotifikasiLogin(email, namaUser = null) {
        // Ekstrak display name dari email jika tidak disediakan
        const namaTampilan = namaUser || email.split('@')[0];
        
        // Buat pesan selamat datang yang dipersonalisasi
        const pesan = `Selamat datang kembali, ${namaTampilan}! Anda berhasil masuk ke sistem pada ${new Date().toLocaleString('id-ID')}.`;

        // Kirim email sukses login
        return await this.kirimEmail(email, 'login_success', pesan);
    }

    // ============================================================================
    // KIRIM NOTIFIKASI PENDAFTARAN SUKSES
    // Fungsi: kirimNotifikasiPendaftaran(email, namaUser)
    // Tujuan: Kirim email ketika pengguna baru berhasil mendaftar
    // Parameter:
    //   - email: Alamat email pengguna baru
    //   - namaUser: Nama tampilan pengguna (opsional, ekstrak dari email jika null)
    // Returns: Promise yang resolve ke hasil pengiriman email
    // ============================================================================
    async kirimNotifikasiPendaftaran(email, namaUser = null) {
        // Ekstrak display name dari email jika tidak disediakan
        const namaTampilan = namaUser || email.split('@')[0];
        
        // Buat pesan selamat datang untuk pengguna baru
        const pesan = `Akun Anda berhasil dibuat! Selamat datang, ${namaTampilan}! Bergabung dengan kami pada ${new Date().toLocaleString('id-ID')}.`;

        // Kirim email sukses pendaftaran
        return await this.kirimEmail(email, 'registration_success', pesan);
    }

    // ============================================================================
    // KIRIM NOTIFIKASI RESET PASSWORD
    // Fungsi: kirimNotifikasiResetPassword(email)
    // Tujuan: Kirim email ketika pengguna meminta reset password
    // Parameter:
    //   - email: Alamat email pengguna
    // Returns: Promise yang resolve ke hasil pengiriman email
    // ============================================================================
    async kirimNotifikasiResetPassword(email) {
        // Buat pesan notifikasi reset password
        const pesan = `Permintaan reset password untuk email ${email} pada ${new Date().toLocaleString('id-ID')}. Link reset akan expire dalam 1 jam.`;

        // Kirim email reset password
        return await this.kirimEmail(email, 'password_reset', pesan);
    }

    // ============================================================================
    // KIRIM NOTIFIKASI ALERT KEAMANAN
    // Fungsi: kirimAlertKeamanan(email, aktivitas)
    // Tujuan: Kirim email alert keamanan untuk aktivitas mencurigakan
    // Parameter:
    //   - email: Alamat email pengguna
    //   - aktivitas: Jenis aktivitas mencurigakan (default: 'login')
    // Returns: Promise yang resolve ke hasil pengiriman email
    // ============================================================================
    async kirimAlertKeamanan(email, aktivitas = 'login') {
        // Buat pesan alert keamanan
        const pesan = `Alert keamanan: Aktivitas ${aktivitas} mencurigakan terdeteksi untuk email ${email} pada ${new Date().toLocaleString('id-ID')}.`;

        // Kirim email alert keamanan
        return await this.kirimEmail(email, 'security_alert', pesan);
    }

    // ============================================================================
    // KIRIM NOTIFIKASI LOGOUT
    // Fungsi: kirimNotifikasiLogout(email)
    // Tujuan: Kirim email ketika pengguna berhasil logout
    // Parameter:
    //   - email: Alamat email pengguna
    // Returns: Promise yang resolve ke hasil pengiriman email
    // ============================================================================
    async kirimNotifikasiLogout(email) {
        // Buat pesan konfirmasi logout
        const pesan = `Anda telah logout dari sistem pada ${new Date().toLocaleString('id-ID')}. Terima kasih telah menggunakan layanan kami.`;

        // Kirim email logout
        return await this.kirimEmail(email, 'logout_success', pesan);
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
        const pesan = `Email test dari Firebase Login System. Dikirim pada ${new Date().toLocaleString('id-ID')}. Jika menerima email ini, sistem email berfungsi dengan baik!`;

        // Kirim email test dengan subjek kustom
        return await this.kirimEmail(email, 'info', pesan, '🧪 Test Email - Firebase Login System');
    }

    // ============================================================================
    // PERIKSA KONEKTIVITAS BACKEND
    // Fungsi: periksaStatusBackend()
    // Tujuan: Test apakah backend PHP dapat diakses dan merespons
    // Returns: Promise yang resolve ke boolean (true jika backend berfungsi)
    // ============================================================================
    async periksaStatusBackend() {
        try {
            // Kirim request test ke backend
            const response = await fetch(`${this.baseUrl}/send_notification.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'test@example.com',           // Email test
                    jenis: 'info',                        // Jenis notifikasi test
                    pesan: 'Backend connectivity test' // Pesan test
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
    // PROSES ANTRIAN REQUEST EMAIL
    // Fungsi: prosesAntrian()
    // Tujuan: Proses request email dalam antrian satu per satu
    // Termasuk rate limiting untuk mencegah overwhelming server
    // ============================================================================
    async prosesAntrian() {
        // Jangan proses jika sudah memproses atau antrian kosong
        if (this.sedangMemproses || this.antrianRequest.length === 0) {
            return;
        }

        // Set flag processing
        this.sedangMemproses = true;

        // Proses semua request dalam antrian
        while (this.antrianRequest.length > 0) {
            // Dapatkan request berikutnya dari antrian
            const request = this.antrianRequest.shift();
            
            try {
                // Kirim email untuk request saat ini
                await this.kirimEmail(request.email, request.jenis, request.pesan, request.subjek);
                
                // Tambahkan delay di antara email untuk mencegah rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error('Failed to process queued email:', error);
                // Lanjutkan memproses email lain meskipun satu gagal
            }
        }

        // Clear flag processing
        this.sedangMemproses = false;
    }

    // ============================================================================
    // ANTRIKAN EMAIL UNTUK PEMROSESAN NANTI
    // Fungsi: antrikanEmail(email, jenis, pesan, subjek)
    // Tujuan: Tambahkan request email ke antrian untuk pemrosesan nanti
    // Parameter:
    //   - email: Alamat email penerima
    //   - jenis: Jenis notifikasi
    //   - pesan: Konten pesan
    //   - subjek: Baris subjek (opsional)
    // ============================================================================
    antrikanEmail(email, jenis, pesan, subjek = null) {
        // Tambahkan request ke antrian
        this.antrianRequest.push({
            email,
            jenis,
            pesan,
            subjek
        });

        // Mulai memproses antrian setelah delay pendek
        setTimeout(() => this.prosesAntrian(), 500);
    }

    // ============================================================================
    // PENGIRIMAN EMAIL BATCH (Enhancement Opsional)
    // Fungsi: kirimBatchEmails(emailList, jenis, templatePesan)
    // Tujuan: Kirim email yang sama ke beberapa penerima secara efisien
    // Parameter:
    //   - emailList: Array alamat email
    //   - jenis: Jenis notifikasi
    //   - templatePesan: Fungsi template yang mengambil email dan mengembalikan pesan
    // Returns: Promise yang resolve ketika semua email terkirim
    // ============================================================================
    async kirimBatchEmails(emailList, jenis, templatePesan) {
        const hasil = [];
        
        for (const email of emailList) {
            try {
                const pesan = templatePesan(email);
                const result = await this.kirimEmail(email, jenis, pesan);
                hasil.push({ email, success: result.success, result });
                
                // Tambahkan delay di antara email
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Failed to send batch email to ${email}:`, error);
                hasil.push({ email, success: false, error });
            }
        }
        
        return hasil;
    }

    // ============================================================================
    // DAPATKAN STATUS ANTRIAN (Enhancement Opsional)
    // Fungsi: dapatkanStatusAntrian()
    // Tujuan: Dapatkan informasi tentang status antrian saat ini
    // Returns: Objek dengan informasi antrian
    // ============================================================================
    dapatkanStatusAntrian() {
        return {
            panjangAntrian: this.antrianRequest.length,
            sedangMemproses: this.sedangMemproses,
            baseUrl: this.baseUrl
        };
    }

    // ============================================================================
    // HAPUS ANTRIAN EMAIL (Enhancement Opsional)
    // Fungsi: bersihkanAntrian()
    // Tujuan: Hapus semua request email yang pending dari antrian
    // ============================================================================
    bersihkanAntrian() {
        this.antrianRequest = [];
        this.sedangMemproses = false;
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
