// ============================================================================
// SISTEM NOTIFIKASI
// File: js/notifications.js
// Description: Sistem notifikasi lengkap dengan toast dan notifikasi browser
// Features: Notifikasi Sukses, Error, Peringatan, Info dengan animasi
// Includes: Notifikasi browser, Auto-dismiss, Tutup manual, Multiple notifications
// ============================================================================

// ============================================================================
// VARIABEL GLOBAL
// ============================================================================

// Counter untuk menghasilkan ID notifikasi unik
let notificationCounter = 0;

// ============================================================================
// KONFIGURASI JENIS NOTIFIKASI
// Setiap jenis notifikasi memiliki styling, ikon, timing, dan pesan sendiri
// ============================================================================
const NOTIFICATION_TYPES = {
    // NOTIFIKASI SUKSES: Untuk operasi berhasil (login, register, dll)
    success: {
        icon: 'fas fa-check-circle',           // Ikon FontAwesome
        defaultTitle: 'Berhasil!',             // Judul default dalam bahasa Indonesia
        defaultMessage: 'Operasi berhasil dilakukan.', // Pesan default
        duration: 5000                         // Auto-dismiss setelah 5 detik
    },
    
    // NOTIFIKASI ERROR: Untuk operasi gagal atau error
    error: {
        icon: 'fas fa-exclamation-circle',
        defaultTitle: 'Gagal!',
        defaultMessage: 'Terjadi kesalahan saat memproses.',
        duration: 7000                         // Stay longer untuk pesan error
    },
    
    // NOTIFIKASI PERINGATAN: Untuk error validasi atau peringatan
    warning: {
        icon: 'fas fa-exclamation-triangle',
        defaultTitle: 'Peringatan!',
        defaultMessage: 'Harap periksa kembali input Anda.',
        duration: 6000
    },
    
    // NOTIFIKASI INFO: Untuk pesan informasi umum
    info: {
        icon: 'fas fa-info-circle',
        defaultTitle: 'Informasi',
        defaultMessage: 'Ini adalah pesan informasi.',
        duration: 4000                         // Durasi lebih pendek untuk info
    }
};

// ============================================================================
// FUNGSI NOTIFIKASI UTAMA
// Fungsi: showNotification(message, type, title, duration)
// Tujuan: Tampilkan notifikasi dengan parameter yang ditentukan
// Parameter:
//   - message: Konten pesan notifikasi
//   - type: Jenis notifikasi (success, error, warning, info)
//   - title: Judul kustom (opsional, gunakan default jika null)
//   - duration: Durasi kustom dalam milidetik (opsional)
// Returns: Elemen DOM dari notifikasi yang dibuat
// ============================================================================
export const showNotification = async (message, type = 'info', title = null, duration = null) => {
    // Dapatkan konfigurasi untuk jenis notifikasi yang ditentukan
    const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info;
    
    // Gunakan judul yang disediakan atau judul default dari konfigurasi
    const notificationTitle = title || config.defaultTitle;
    
    // Gunakan durasi yang disediakan atau durasi default dari konfigurasi
    const notificationDuration = duration || config.duration;
    
    // Buat elemen DOM notifikasi
    const notification = createNotificationElement(message, type, notificationTitle, config.icon);
    
    // Dapatkan container notifikasi dan tambahkan notifikasi baru
    const container = getNotificationContainer();
    container.appendChild(notification);
    
    // Tampilkan notifikasi dengan animasi slide-in
    // Delay kecil untuk memungkinkan DOM update sebelum animasi
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto-dismiss notifikasi setelah durasi yang ditentukan
    if (notificationDuration > 0) {
        setTimeout(() => {
            removeNotification(notification);
        }, notificationDuration);
    }
    
    // Minta izin notifikasi browser dan tampilkan jika diberikan
    await requestNotificationPermission();
    if (Notification.permission === 'granted') {
        showBrowserNotification(notificationTitle, message, type);
    }
    
    // Kembalikan elemen notifikasi untuk manipulasi lebih lanjut jika diperlukan
    return notification;
};

// ============================================================================
// BUAT ELEMEN DOM NOTIFIKASI
// Fungsi: createNotificationElement(message, type, title, icon)
// Tujuan: Buat struktur HTML untuk sebuah notifikasi
// Parameter:
//   - message: Konten pesan notifikasi
//   - type: Jenis notifikasi untuk styling
//   - title: Judul notifikasi
//   - icon: Kelas ikon FontAwesome
// Returns: Elemen DOM dari notifikasi
// ============================================================================
function createNotificationElement(message, type, title, icon) {
    // Buat elemen div utama notifikasi
    const notification = document.createElement('div');
    
    // Tambahkan kelas CSS untuk styling dan tipe
    notification.className = `notification ${type}`;
    
    // Buat ID unik untuk notifikasi ini
    notification.id = `notification-${++notificationCounter}`;
    
    // Bangun struktur HTML di dalam notifikasi
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="${icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="closeNotification('${notification.id}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Tambahkan fungsionalitas click-to-dismiss
    // Klik di mana saja pada notifikasi (kecuali tombol close) untuk dismiss
    notification.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-close')) {
            removeNotification(notification);
        }
    });
    
    return notification;
}

// ============================================================================
// HAPUS NOTIFIKASI DENGAN ANIMASI
// Fungsi: removeNotification(notification)
// Tujuan: Hapus notifikasi dari DOM dengan animasi fade-out yang halus
// Parameter:
//   - notification: Elemen DOM notifikasi yang akan dihapus
// ============================================================================
function removeNotification(notification) {
    // Periksa apakah notifikasi ada dan masih di DOM
    if (!notification || !notification.parentNode) return;
    
    // Hapus kelas 'show' untuk memicu animasi fade-out
    notification.classList.remove('show');
    
    // Tunggu hingga animasi selesai (300ms) sebelum menghapus dari DOM
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// ============================================================================
// DAPATKAN ATAU BUAT CONTAINER NOTIFIKASI
// Fungsi: getNotificationContainer()
// Tujuan: Dapatkan div container di mana notifikasi ditampilkan
// Buat container jika belum ada
// Returns: Elemen DOM dari container notifikasi
// ============================================================================
function getNotificationContainer() {
    // Coba cari container notifikasi yang sudah ada
    let container = document.getElementById('notificationContainer');
    
    // Buat container jika belum ada
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        
        // Tambahkan container ke body (akhir dokumen)
        document.body.appendChild(container);
    }
    
    return container;
}

// ============================================================================
// TUTUP NOTIFIKASI BERDASARKAN ID (FUNGSI GLOBAL)
// Fungsi: closeNotification(notificationId)
// Tujuan: Fungsi global untuk menutup notifikasi tertentu berdasarkan ID
// Ini dipanggil dari atribut onclick dalam HTML
// Parameter:
//   - notificationId: ID dari notifikasi yang akan ditutup
// ============================================================================
window.closeNotification = function(notificationId) {
    // Cari notifikasi berdasarkan ID
    const notification = document.getElementById(notificationId);
    
    // Hapus notifikasi jika ditemukan
    if (notification) {
        removeNotification(notification);
    }
};

// ============================================================================
// MINTA IZIN NOTIFIKASI
// Fungsi: requestNotificationPermission()
// Tujuan: Minta izin pengguna untuk notifikasi browser
// Returns: Promise yang resolve ke boolean (izin diberikan atau tidak)
// ============================================================================
async function requestNotificationPermission() {
    // Periksa apakah browser mendukung notifikasi
    if ('Notification' in window && Notification.permission === 'default') {
        try {
            // Minta izin dari pengguna
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.warn('Notification permission request failed:', error);
            return false;
        }
    }
    // Kembalikan status izin saat ini
    return Notification.permission === 'granted';
}

// ============================================================================
// TAMPILKAN NOTIFIKASI BROWSER
// Fungsi: showBrowserNotification(title, message, type)
// Tujuan: Tampilkan notifikasi browser asli (jika izin diberikan)
// Parameter:
//   - title: Judul notifikasi
//   - message: Pesan notifikasi
//   - type: Jenis notifikasi untuk pemilihan ikon
// ============================================================================
function showBrowserNotification(title, message, type) {
    try {
        // Dapatkan konfigurasi untuk jenis notifikasi
        const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info;
        
        // Map jenis notifikasi ke ikon emoji
        const iconMap = {
            success: '🟢',
            error: '🔴',
            warning: '🟡',
            info: '🔵'
        };
        
        // Buat notifikasi browser baru
        const notification = new Notification(title, {
            body: message,                                          // Teks body notifikasi
            icon: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${iconMap[type] || iconMap.info}</text></svg>`, // Ikon kustom
            badge: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>`, // Badge notifikasi
            tag: 'firebase-auth',                                   // Group notifikasi
            requireInteraction: false,                             // Allow auto-dismiss
            silent: false                                          // Mainkan suara notifikasi
        });
        
        // Auto-close notifikasi browser setelah 5 detik
        setTimeout(() => {
            notification.close();
        }, 5000);
        
        // Tangani klik notifikasi - fokus window dan tutup notifikasi
        notification.onclick = () => {
            window.focus();     // Bawa browser window ke depan
            notification.close(); // Tutup notifikasi
        };
        
    } catch (error) {
        console.warn('Browser notification failed:', error);
    }
}

// ============================================================================
// TAMPILKAN MULTIPLE NOTIFIKASI
// Fungsi: showMultipleNotifications(notifications)
// Tujuan: Tampilkan multiple notifikasi dengan delay di antara mereka
// Parameter:
//   - notifications: Array objek notifikasi dengan message, type, title, duration
// ============================================================================
export const showMultipleNotifications = async (notifications) => {
    // Loop melalui setiap notifikasi dalam array
    for (const notification of notifications) {
        // Tampilkan notifikasi saat ini
        await showNotification(
            notification.message,
            notification.type,
            notification.title,
            notification.duration
        );
        
        // Tambahkan delay kecil (300ms) di antara notifikasi
        await new Promise(resolve => setTimeout(resolve, 300));
    }
};

// ============================================================================
// HAPUS SEMUA NOTIFIKASI
// Fungsi: clearAllNotifications()
// Tujuan: Hapus semua notifikasi aktif dari layar
// ============================================================================
export const clearAllNotifications = () => {
    // Dapatkan container notifikasi
    const container = getNotificationContainer();
    
    // Temukan semua elemen notifikasi
    const notifications = container.querySelectorAll('.notification');
    
    // Hapus setiap notifikasi
    notifications.forEach(notification => {
        removeNotification(notification);
    });
};

// ============================================================================
// FUNGSI NOTIFIKASI TERSPESIALISASI
// Notifikasi yang dikonfigurasi sebelumnya untuk use case umum
// ============================================================================

/**
 * Tampilkan notifikasi sukses untuk login
 * Fungsi: showLoginSuccess(user)
 * Tujuan: Tampilkan pesan selamat datang setelah login berhasil
 * Parameter: user - Objek pengguna Firebase
 */
export const showLoginSuccess = async (user) => {
    const userName = user.displayName || user.email.split('@')[0];
    const message = `Selamat datang kembali, ${userName}! Anda berhasil masuk ke sistem.`;
    
    await showNotification(
        message,
        'success',
        'Login Berhasil! 🎉',
        6000
    );
};

/**
 * Tampilkan notifikasi sukses pendaftaran
 * Fungsi: showRegistrationSuccess(user)
 * Tujuan: Tampilkan pesan selamat datang setelah pendaftaran berhasil
 * Parameter: user - Objek pengguna Firebase
 */
export const showRegistrationSuccess = async (user) => {
    const userName = user.displayName || user.email.split('@')[0];
    const message = `Akun Anda berhasil dibuat! Selamat datang, ${userName}!`;
    
    await showNotification(
        message,
        'success',
        'Pendaftaran Berhasil! 🎊',
        7000
    );
};

/**
 * Tampilkan notifikasi sukses reset password
 * Fungsi: showPasswordResetSuccess(email)
 * Tujuan: Tampilkan pesan setelah email reset password dikirim
 * Parameter: email - Alamat email pengguna
 */
export const showPasswordResetSuccess = async (email) => {
    await showNotification(
        `Link reset password telah dikirim ke ${email}. Periksa inbox dan folder spam untuk instruksi selanjutnya.`,
        'success',
        'Reset Link Terkirim! 📧',
        8000
    );
};

/**
 * Tampilkan notifikasi sukses logout
 * Fungsi: showLogoutSuccess()
 * Tujuan: Tampilkan pesan selamat tinggal setelah logout berhasil
 */
export const showLogoutSuccess = async () => {
    await showNotification(
        'Logout berhasil! Terima kasih telah menggunakan layanan kami. Sampai jumpa! 👋',
        'success',
        'Logout Berhasil!',
        5000
    );
};

/**
 * Tampilkan notifikasi selamat datang untuk pengguna baru
 * Fungsi: showWelcomeNotification(user)
 * Tujuan: Tampilkan pesan selamat datang untuk akun pengguna baru
 * Parameter: user - Objek pengguna Firebase
 */
export const showWelcomeNotification = async (user) => {
    const userName = user.displayName || user.email.split('@')[0];
    const message = `Hai ${userName}! Senang melihat Anda bergabung dengan kami. Nikmati fitur-fitur menarik yang tersedia!`;
    
    await showNotification(
        message,
        'info',
        'Selamat Datang! 🌟',
        8000
    );
};

/**
 * Tampilkan notifikasi loading
 * Fungsi: showLoadingNotification(message)
 * Tujuan: Tampilkan notifikasi persisten selama pemrosesan
 * Parameter: message - Teks pesan loading (opsional)
 * Returns: Elemen notifikasi yang bisa diupdate/disembunyikan nanti
 */
export const showLoadingNotification = async (message = 'Memproses...') => {
    const notification = await showNotification(
        message,
        'info',
        'Memproses...',
        0 // Jangan auto-dismiss notifikasi loading
    );
    
    // Tambahkan animasi loading spinner ke ikon
    const icon = notification.querySelector('.notification-icon i');
    icon.className = 'fas fa-spinner fa-spin';
    
    return notification;
};

/**
 * Update notifikasi loading
 * Fungsi: updateLoadingNotification(notification, message)
 * Tujuan: Update pesan notifikasi loading yang ada
 * Parameter:
 *   - notification: Elemen notifikasi untuk diupdate
 *   - message: Teks pesan baru
 */
export const updateLoadingNotification = (notification, message) => {
    // Periksa apakah notifikasi ada dan masih terlihat
    if (notification && notification.parentNode) {
        // Temukan dan update elemen pesan
        const messageElement = notification.querySelector('.notification-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
    }
};

/**
 * Sembunyikan notifikasi loading
 * Fungsi: hideLoadingNotification(notification)
 * Tujuan: Hapus notifikasi loading
 * Parameter: notification - Elemen notifikasi untuk disembunyikan
 */
export const hideLoadingNotification = (notification) => {
    // Simplemente hapus notifikasi
    if (notification) {
        removeNotification(notification);
    }
};

// ============================================================================
// FUNGSI UTILITAS
// Fungsi helper untuk memeriksa kemampuan notifikasi
// ============================================================================

/**
 * Periksa apakah notifikasi didukung oleh browser
 * Fungsi: isNotificationSupported()
 * Returns: Boolean yang menunjukkan dukungan notifikasi browser
 */
export const isNotificationSupported = () => {
    return 'Notification' in window;
};

/**
 * Dapatkan status izin notifikasi saat ini
 * Fungsi: getNotificationPermission()
 * Returns: String yang menunjukkan status izin ('granted', 'denied', 'default', 'unsupported')
 */
export const getNotificationPermission = () => {
    // Kembalikan 'unsupported' jika browser tidak mendukung notifikasi
    if (!isNotificationSupported()) {
        return 'unsupported';
    }
    // Kembalikan status izin saat ini
    return Notification.permission;
};
