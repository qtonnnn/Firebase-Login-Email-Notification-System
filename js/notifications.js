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
let counterNotifikasi = 0;

// ============================================================================
// KONFIGURASI JENIS NOTIFIKASI
// Setiap jenis notifikasi memiliki styling, ikon, timing, dan pesan sendiri
// ============================================================================
const KONFIGURASI_JENIS_NOTIFIKASI = {
    // NOTIFIKASI SUKSES: Untuk operasi berhasil (login, register, dll)
    success: {
        ikon: 'fas fa-check-circle',           // Ikon FontAwesome
        judulDefault: 'Berhasil!',             // Judul default dalam bahasa Indonesia
        pesanDefault: 'Operasi berhasil dilakukan.', // Pesan default
        durasi: 5000                         // Auto-dismiss setelah 5 detik
    },
    
    // NOTIFIKASI ERROR: Untuk operasi gagal atau error
    error: {
        ikon: 'fas fa-exclamation-circle',
        judulDefault: 'Gagal!',
        pesanDefault: 'Terjadi kesalahan saat memproses.',
        durasi: 7000                         // Stay longer untuk pesan error
    },
    
    // NOTIFIKASI PERINGATAN: Untuk error validasi atau peringatan
    warning: {
        ikon: 'fas fa-exclamation-triangle',
        judulDefault: 'Peringatan!',
        pesanDefault: 'Harap periksa kembali input Anda.',
        durasi: 6000
    },
    
    // NOTIFIKASI INFO: Untuk pesan informasi umum
    info: {
        ikon: 'fas fa-info-circle',
        judulDefault: 'Informasi',
        pesanDefault: 'Ini adalah pesan informasi.',
        durasi: 4000                         // Durasi lebih pendek untuk info
    }
};

// ============================================================================
// FUNGSI NOTIFIKASI UTAMA
// Fungsi: tampilkanNotifikasi(pesan, jenis, judul, durasi)
// Tujuan: Tampilkan notifikasi dengan parameter yang ditentukan
// Parameter:
//   - pesan: Konten pesan notifikasi
//   - jenis: Jenis notifikasi (success, error, warning, info)
//   - judul: Judul kustom (opsional, gunakan default jika null)
//   - durasi: Durasi kustom dalam milidetik (opsional)
// Returns: Elemen DOM dari notifikasi yang dibuat
// ============================================================================
export const tampilkanNotifikasi = async (pesan, jenis = 'info', judul = null, durasi = null) => {
    // Dapatkan konfigurasi untuk jenis notifikasi yang ditentukan
    const konfigurasi = KONFIGURASI_JENIS_NOTIFIKASI[jenis] || KONFIGURASI_JENIS_NOTIFIKASI.info;
    
    // Gunakan judul yang disediakan atau judul default dari konfigurasi
    const judulNotifikasi = judul || konfigurasi.judulDefault;
    
    // Gunakan durasi yang disediakan atau durasi default dari konfigurasi
    const durasiNotifikasi = durasi || konfigurasi.durasi;
    
    // Buat elemen DOM notifikasi
    const notifikasi = buatElemenNotifikasi(pesan, jenis, judulNotifikasi, konfigurasi.ikon);
    
    // Dapatkan container notifikasi dan tambahkan notifikasi baru
    const container = dapatkanContainerNotifikasi();
    container.appendChild(notifikasi);
    
    // Tampilkan notifikasi dengan animasi slide-in
    // Delay kecil untuk memungkinkan DOM update sebelum animasi
    setTimeout(() => {
        notifikasi.classList.add('show');
    }, 100);
    
    // Auto-dismiss notifikasi setelah durasi yang ditentukan
    if (durasiNotifikasi > 0) {
        setTimeout(() => {
            hapusNotifikasi(notifikasi);
        }, durasiNotifikasi);
    }
    
    // Minta izin notifikasi browser dan tampilkan jika diberikan
    await mintaIzinNotifikasi();
    if (Notification.permission === 'granted') {
        tampilkanNotifikasiBrowser(judulNotifikasi, pesan, jenis);
    }
    
    // Kembalikan elemen notifikasi untuk manipulasi lebih lanjut jika diperlukan
    return notifikasi;
};

// ============================================================================
// BUAT ELEMEN DOM NOTIFIKASI
// Fungsi: buatElemenNotifikasi(pesan, jenis, judul, ikon)
// Tujuan: Buat struktur HTML untuk sebuah notifikasi
// Parameter:
//   - pesan: Konten pesan notifikasi
//   - jenis: Jenis notifikasi untuk styling
//   - judul: Judul notifikasi
//   - ikon: Kelas ikon FontAwesome
// Returns: Elemen DOM dari notifikasi
// ============================================================================
function buatElemenNotifikasi(pesan, jenis, judul, ikon) {
    // Buat elemen div utama notifikasi
    const notifikasi = document.createElement('div');
    
    // Tambahkan kelas CSS untuk styling dan tipe
    notifikasi.className = `notifikasi ${jenis}`;
    
    // Buat ID unik untuk notifikasi ini
    notifikasi.id = `notifikasi-${++counterNotifikasi}`;
    
    // Bangun struktur HTML di dalam notifikasi
    notifikasi.innerHTML = `
        <div class="notifikasi-ikon">
            <i class="${ikon}"></i>
        </div>
        <div class="notifikasi-konten">
            <div class="notifikasi-judul">${judul}</div>
            <div class="notifikasi-pesan">${pesan}</div>
        </div>
        <button class="notifikasi-tutup" onclick="tutupNotifikasi('${notifikasi.id}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Tambahkan fungsionalitas click-to-dismiss
    // Klik di mana saja pada notifikasi (kecuali tombol close) untuk dismiss
    notifikasi.addEventListener('click', (e) => {
        if (!e.target.closest('.notifikasi-tutup')) {
            hapusNotifikasi(notifikasi);
        }
    });
    
    return notifikasi;
}

// ============================================================================
// HAPUS NOTIFIKASI DENGAN ANIMASI
// Fungsi: hapusNotifikasi(notifikasi)
// Tujuan: Hapus notifikasi dari DOM dengan animasi fade-out yang halus
// Parameter:
//   - notifikasi: Elemen DOM notifikasi yang akan dihapus
// ============================================================================
function hapusNotifikasi(notifikasi) {
    // Periksa apakah notifikasi ada dan masih di DOM
    if (!notifikasi || !notifikasi.parentNode) return;
    
    // Hapus kelas 'show' untuk memicu animasi fade-out
    notifikasi.classList.remove('show');
    
    // Tunggu hingga animasi selesai (300ms) sebelum menghapus dari DOM
    setTimeout(() => {
        if (notifikasi.parentNode) {
            notifikasi.parentNode.removeChild(notifikasi);
        }
    }, 300);
}

// ============================================================================
// DAPATKAN ATAU BUAT CONTAINER NOTIFIKASI
// Fungsi: dapatkanContainerNotifikasi()
// Tujuan: Dapatkan div container di mana notifikasi ditampilkan
// Buat container jika belum ada
// Returns: Elemen DOM dari container notifikasi
// ============================================================================
function dapatkanContainerNotifikasi() {
    // Coba cari container notifikasi yang sudah ada
    let container = document.getElementById('containerNotifikasi');
    
    // Buat container jika belum ada
    if (!container) {
        container = document.createElement('div');
        container.id = 'containerNotifikasi';
        container.className = 'container-notifikasi';
        
        // Tambahkan container ke body (akhir dokumen)
        document.body.appendChild(container);
    }
    
    return container;
}

// ============================================================================
// TUTUP NOTIFIKASI BERDASARKAN ID (FUNGSI GLOBAL)
// Fungsi: tutupNotifikasi(idNotifikasi)
// Tujuan: Fungsi global untuk menutup notifikasi tertentu berdasarkan ID
// Ini dipanggil dari atribut onclick dalam HTML
// Parameter:
//   - idNotifikasi: ID dari notifikasi yang akan ditutup
// ============================================================================
window.tutupNotifikasi = function(idNotifikasi) {
    // Cari notifikasi berdasarkan ID
    const notifikasi = document.getElementById(idNotifikasi);
    
    // Hapus notifikasi jika ditemukan
    if (notifikasi) {
        hapusNotifikasi(notifikasi);
    }
};

// ============================================================================
// MINTA IZIN NOTIFIKASI
// Fungsi: mintaIzinNotifikasi()
// Tujuan: Minta izin pengguna untuk notifikasi browser
// Returns: Promise yang resolve ke boolean (izin diberikan atau tidak)
// ============================================================================
async function mintaIzinNotifikasi() {
    // Periksa apakah browser mendukung notifikasi
    if ('Notification' in window && Notification.permission === 'default') {
        try {
            // Minta izin dari pengguna
            const izin = await Notification.requestPermission();
            return izin === 'granted';
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
// Fungsi: tampilkanNotifikasiBrowser(judul, pesan, jenis)
// Tujuan: Tampilkan notifikasi browser asli (jika izin diberikan)
// Parameter:
//   - judul: Judul notifikasi
//   - pesan: Pesan notifikasi
//   - jenis: Jenis notifikasi untuk pemilihan ikon
// ============================================================================
function tampilkanNotifikasiBrowser(judul, pesan, jenis) {
    try {
        // Dapatkan konfigurasi untuk jenis notifikasi
        const konfigurasi = KONFIGURASI_JENIS_NOTIFIKASI[jenis] || KONFIGURASI_JENIS_NOTIFIKASI.info;
        
        // Map jenis notifikasi ke ikon emoji
        const mapIkon = {
            success: '🟢',
            error: '🔴',
            warning: '🟡',
            info: '🔵'
        };
        
        // Buat notifikasi browser baru
        const notifikasi = new Notification(judul, {
            body: pesan,                                          // Teks body notifikasi
            ikon: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${mapIkon[jenis] || mapIkon.info}</text></svg>`, // Ikon kustom
            badge: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>`, // Badge notifikasi
            tag: 'firebase-auth',                                   // Group notifikasi
            requireInteraction: false,                             // Allow auto-dismiss
            silent: false                                          // Mainkan suara notifikasi
        });
        
        // Auto-close notifikasi browser setelah 5 detik
        setTimeout(() => {
            notifikasi.close();
        }, 5000);
        
        // Tangani klik notifikasi - fokus window dan tutup notifikasi
        notifikasi.onclick = () => {
            window.focus();     // Bawa browser window ke depan
            notifikasi.close(); // Tutup notifikasi
        };
        
    } catch (error) {
        console.warn('Browser notification failed:', error);
    }
}

// ============================================================================
// TAMPILKAN MULTIPLE NOTIFIKASI
// Fungsi: tampilkanMultipleNotifikasi(notifikasiList)
// Tujuan: Tampilkan multiple notifikasi dengan delay di antara mereka
// Parameter:
//   - notifikasiList: Array objek notifikasi dengan pesan, jenis, judul, durasi
// ============================================================================
export const tampilkanMultipleNotifikasi = async (notifikasiList) => {
    // Loop melalui setiap notifikasi dalam array
    for (const notifikasi of notifikasiList) {
        // Tampilkan notifikasi saat ini
        await tampilkanNotifikasi(
            notifikasi.pesan,
            notifikasi.jenis,
            notifikasi.judul,
            notifikasi.durasi
        );
        
        // Tambahkan delay kecil (300ms) di antara notifikasi
        await new Promise(resolve => setTimeout(resolve, 300));
    }
};

// ============================================================================
// HAPUS SEMUA NOTIFIKASI
// Fungsi: hapusSemuaNotifikasi()
// Tujuan: Hapus semua notifikasi aktif dari layar
// ============================================================================
export const hapusSemuaNotifikasi = () => {
    // Dapatkan container notifikasi
    const container = dapatkanContainerNotifikasi();
    
    // Temukan semua elemen notifikasi
    const notifikasi = container.querySelectorAll('.notifikasi');
    
    // Hapus setiap notifikasi
    notifikasi.forEach(item => {
        hapusNotifikasi(item);
    });
};

// ============================================================================
// FUNGSI NOTIFIKASI TERSPESIALISASI
// Notifikasi yang dikonfigurasi sebelumnya untuk use case umum
// ============================================================================

/**
 * Tampilkan notifikasi sukses untuk login
 * Fungsi: tampilkanNotifikasiSuksesLogin(user)
 * Tujuan: Tampilkan pesan selamat datang setelah login berhasil
 * Parameter: user - Objek pengguna Firebase
 */
export const tampilkanNotifikasiSuksesLogin = async (user) => {
    const namaUser = user.displayName || user.email.split('@')[0];
    const pesan = `Selamat datang kembali, ${namaUser}! Anda berhasil masuk ke sistem.`;
    
    await tampilkanNotifikasi(
        pesan,
        'success',
        'Login Berhasil! 🎉',
        6000
    );
};

/**
 * Tampilkan notifikasi sukses pendaftaran
 * Fungsi: tampilkanNotifikasiSuksesPendaftaran(user)
 * Tujuan: Tampilkan pesan selamat datang setelah pendaftaran berhasil
 * Parameter: user - Objek pengguna Firebase
 */
export const tampilkanNotifikasiSuksesPendaftaran = async (user) => {
    const namaUser = user.displayName || user.email.split('@')[0];
    const pesan = `Akun Anda berhasil dibuat! Selamat datang, ${namaUser}!`;
    
    await tampilkanNotifikasi(
        pesan,
        'success',
        'Pendaftaran Berhasil! 🎊',
        7000
    );
};

/**
 * Tampilkan notifikasi sukses reset password
 * Fungsi: tampilkanNotifikasiSuksesResetPassword(email)
 * Tujuan: Tampilkan pesan setelah email reset password dikirim
 * Parameter: email - Alamat email pengguna
 */
export const tampilkanNotifikasiSuksesResetPassword = async (email) => {
    await tampilkanNotifikasi(
        `Link reset password telah dikirim ke ${email}. Periksa inbox dan folder spam untuk instruksi selanjutnya.`,
        'success',
        'Reset Link Terkirim! 📧',
        8000
    );
};

/**
 * Tampilkan notifikasi sukses logout
 * Fungsi: tampilkanNotifikasiSuksesLogout()
 * Tujuan: Tampilkan pesan selamat tinggal setelah logout berhasil
 */
export const tampilkanNotifikasiSuksesLogout = async () => {
    await tampilkanNotifikasi(
        'Logout berhasil! Terima kasih telah menggunakan layanan kami. Sampai jumpa! 👋',
        'success',
        'Logout Berhasil!',
        5000
    );
};

/**
 * Tampilkan notifikasi selamat datang untuk pengguna baru
 * Fungsi: tampilkanNotifikasiSelamatDatang(user)
 * Tujuan: Tampilkan pesan selamat datang untuk akun pengguna baru
 * Parameter: user - Objek pengguna Firebase
 */
export const tampilkanNotifikasiSelamatDatang = async (user) => {
    const namaUser = user.displayName || user.email.split('@')[0];
    const pesan = `Hai ${namaUser}! Senang melihat Anda bergabung dengan kami. Nikmati fitur-fitur menarik yang tersedia!`;
    
    await tampilkanNotifikasi(
        pesan,
        'info',
        'Selamat Datang! 🌟',
        8000
    );
};

/**
 * Tampilkan notifikasi loading
 * Fungsi: tampilkanNotifikasiLoading(pesan)
// Tujuan: Tampilkan notifikasi persisten selama pemrosesan
 * Parameter: pesan - Teks pesan loading (opsional)
 * Returns: Elemen notifikasi yang bisa diupdate/disembunyikan nanti
 */
export const tampilkanNotifikasiLoading = async (pesan = 'Memproses...') => {
    const notifikasi = await tampilkanNotifikasi(
        pesan,
        'info',
        'Memproses...',
        0 // Jangan auto-dismiss notifikasi loading
    );
    
    // Tambahkan animasi loading spinner ke ikon
    const ikon = notifikasi.querySelector('.notifikasi-ikon i');
    ikon.className = 'fas fa-spinner fa-spin';
    
    return notifikasi;
};

/**
 * Update notifikasi loading
 * Fungsi: updateNotifikasiLoading(notifikasi, pesan)
// Tujuan: Update pesan notifikasi loading yang ada
 * Parameter:
 *   - notifikasi: Elemen notifikasi untuk diupdate
 *   - pesan: Teks pesan baru
 */
export const updateNotifikasiLoading = (notifikasi, pesan) => {
    // Periksa apakah notifikasi ada dan masih terlihat
    if (notifikasi && notifikasi.parentNode) {
        // Temukan dan update elemen pesan
        const elemenPesan = notifikasi.querySelector('.notifikasi-pesan');
        if (elemenPesan) {
            elemenPesan.textContent = pesan;
        }
    }
};

/**
 * Sembunyikan notifikasi loading
 * Fungsi: sembunyikanNotifikasiLoading(notifikasi)
// Tujuan: Hapus notifikasi loading
 * Parameter: notifikasi - Elemen notifikasi untuk disembunyikan
 */
export const sembunyikanNotifikasiLoading = (notifikasi) => {
    // Simplemente hapus notifikasi
    if (notifikasi) {
        hapusNotifikasi(notifikasi);
    }
};

// ============================================================================
// FUNGSI UTILITAS
// Fungsi helper untuk memeriksa kemampuan notifikasi
// ============================================================================

/**
 * Periksa apakah notifikasi didukung oleh browser
 * Fungsi: apakahNotifikasiDidukung()
 * Returns: Boolean yang menunjukkan dukungan notifikasi browser
 */
export const apakahNotifikasiDidukung = () => {
    return 'Notification' in window;
};

/**
 * Dapatkan status izin notifikasi saat ini
 * Fungsi: dapatkanIzinNotifikasi()
 * Returns: String yang menunjukkan status izin ('granted', 'denied', 'default', 'unsupported')
 */
export const dapatkanIzinNotifikasi = () => {
    // Kembalikan 'unsupported' jika browser tidak mendukung notifikasi
    if (!apakahNotifikasiDidukung()) {
        return 'unsupported';
    }
    // Kembalikan status izin saat ini
    return Notification.permission;
};
