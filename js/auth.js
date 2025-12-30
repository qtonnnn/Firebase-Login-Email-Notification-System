// ============================================================================
// SISTEM AUTENTIKASI FIREBASE
// File: js/auth.js
// Description: Logika autentikasi lengkap untuk sistem login Firebase
// Includes: Fungsi Login, Daftar, Reset Password, Logout
// ============================================================================

// Import fungsi autentikasi Firebase dan utilitas
import {
    auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    updateProfile,
    getCurrentUser,
    checkAuthState,
    createUserProfile,
    checkEmailExists
} from './firebase-config.js';

// ============================================================================
// PEMILIHAN ELEMEN DOM
// Mendapatkan referensi ke elemen HTML form untuk interaksi
// ============================================================================

// Elemen form utama
const formLogin = document.getElementById('loginForm');       // Elemen form login
const formDaftar = document.getElementById('registerForm'); // Elemen form pendaftaran
const formLupa = document.getElementById('forgotForm');     // Elemen form lupa password
const elemenLoading = document.getElementById('loading');           // Elemen loading spinner

// ============================================================================
// FUNGSI LOGIN PENGGUNA
// Fungsi: loginUser(email, kataSandi)
// Tujuan: Autentikasi pengguna dengan Firebase Email/Password
// Parameter: 
//   - email: Alamat email pengguna
//   - kataSandi: Password pengguna
// Returns: Objek User jika berhasil
// Throws: Error jika autentikasi gagal
// ============================================================================
export const loginUser = async (email, kataSandi) => {
    try {
        // Tampilkan loading spinner dan nonaktifkan tombol
        tampilkanLoading(true);
        
        // Periksa apakah email ada sebelum mencoba login
        // Ini mencegah request Firebase yang tidak perlu
        const emailTerdaftar = await checkEmailExists(email);
        if (!emailTerdaftar) {
            throw new Error('Email belum terdaftar. Silakan daftar akun baru terlebih dahulu.');
        }
        
        // Mencoba sign in dengan Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, kataSandi);
        const user = userCredential.user;
        
        // Tampilkan notifikasi sukses dengan nama pengguna
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                `Selamat datang kembali, ${user.displayName || user.email}! 🎉`,
                'success',
                'Login Berhasil!'
            );
        });

        // Kirim notifikasi email ke qtonnnn@gmail.com
        // Ini untuk tujuan monitoring admin
        try {
            const EmailAPI = await import('./email-api.js');
            const emailAPI = new EmailAPI.default();
            await emailAPI.kirimNotifikasiLogin(user.email, user.displayName);
        } catch (emailError) {
            console.warn('Email notification failed:', emailError);
            // Jangan gagalkan login jika notifikasi email gagal
        }
        
        // Redirect pengguna ke dashboard setelah login berhasil
        // Delay 1.5 detik untuk menampilkan notifikasi sukses
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
        return user;
    } catch (error) {
        console.error('Login error:', error);
        
        // Tampilkan notifikasi error kepada pengguna
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                getPesanError(error.code),
                'error',
                'Login Gagal'
            );
        });
        
        throw error;
    } finally {
        // Selalu sembunyikan loading spinner, независимо от успеха или неудачи
        tampilkanLoading(false);
    }
};

// ============================================================================
// FUNGSI PENDAFTARAN PENGGUNA
// Fungsi: registerUser(email, kataSandi, namaTampilan)
// Tujuan: Buat akun pengguna baru dengan Firebase
// Parameter:
//   - email: Alamat email pengguna baru
//   - kataSandi: Password pengguna baru
//   - namaTampilan: Nama tampilan pengguna (opsional)
// Returns: Objek User jika berhasil
// Throws: Error jika pendaftaran gagal
// ============================================================================
export const registerUser = async (email, kataSandi, namaTampilan) => {
    try {
        // Tampilkan loading spinner dan nonaktifkan tombol
        tampilkanLoading(true);
        
        // Periksa apakah email sudah ada untuk mencegah akun duplikat
        const emailTerdaftar = await checkEmailExists(email);
        if (emailTerdaftar) {
            throw new Error('Email sudah terdaftar. Gunakan email lain atau masuk dengan akun yang sudah ada.');
        }
        
        // Buat akun pengguna baru dengan Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, kataSandi);
        const user = userCredential.user;
        
        // Perbarui profil pengguna dengan nama tampilan jika disediakan
        // Ini mengatur displayName pengguna di Firebase Auth
        if (namaTampilan) {
            await updateProfile(user, {
                displayName: namaTampilan
            });
        }
        
        // Buat dokumen profil pengguna di database Firestore
        // Ini menyimpan informasi pengguna tambahan
        await createUserProfile(user, {
            displayName: namaTampilan || '',
            emailVerified: false,
            createdAt: new Date().toISOString()
        });
        
        // Tampilkan notifikasi sukses dengan nama pengguna
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                `Akun berhasil dibuat! Selamat datang, ${namaTampilan || email}! 🎊`,
                'success',
                'Pendaftaran Berhasil!'
            );
        });

        // Kirim notifikasi email ke admin tentang pendaftaran baru
        try {
            const EmailAPI = await import('./email-api.js');
            const emailAPI = new EmailAPI.default();
            await emailAPI.kirimNotifikasiPendaftaran(email, namaTampilan);
        } catch (emailError) {
            console.warn('Email notification failed:', emailError);
            // Jangan gagalkan pendaftaran jika notifikasi email gagal
        }
        
        // Redirect ke dashboard setelah pendaftaran berhasil
        // Delay 2 detik untuk menampilkan notifikasi sukses
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
        return user;
    } catch (error) {
        console.error('Registration error:', error);
        
        // Tampilkan notifikasi error kepada pengguna
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                getPesanError(error.code),
                'error',
                'Pendaftaran Gagal'
            );
        });
        
        throw error;
    } finally {
        // Selalu sembunyikan loading spinner
        tampilkanLoading(false);
    }
};

// ============================================================================
// FUNGSI RESET PASSWORD
// Fungsi: resetPassword(email)
// Tujuan: Kirim email reset password ke pengguna
// Parameter:
//   - email: Alamat email untuk mengirim link reset
// Returns: Promise yang resolve ketika email dikirim
// Throws: Error jika reset password gagal
// ============================================================================
export const resetPassword = async (email) => {
    try {
        // Tampilkan loading spinner
        tampilkanLoading(true);
        
        // Periksa apakah email ada sebelum mencoba reset
        const emailTerdaftar = await checkEmailExists(email);
        if (!emailTerdaftar) {
            throw new Error('Email belum terdaftar. Silakan periksa kembali email Anda.');
        }
        
        // Kirim email reset password via Firebase
        await sendPasswordResetEmail(auth, email);
        
        // Tampilkan notifikasi sukses
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                `Link reset password telah dikirim ke ${email}. Periksa inbox dan folder spam.`,
                'success',
                'Reset Link Terkirim!'
            );
        });

        // Kirim notifikasi email ke admin tentang permintaan reset password
        try {
            const EmailAPI = await import('./email-api.js');
            const emailAPI = new EmailAPI.default();
            await emailAPI.kirimNotifikasiResetPassword(email);
        } catch (emailError) {
            console.warn('Email notification failed:', emailError);
            // Jangan gagalkan reset password jika notifikasi email gagal
        }
        
        // Clear form dan tampilkan form login setelah 3 detik
        setTimeout(() => {
            tampilkanLogin();
            document.getElementById('resetEmail').value = '';
        }, 3000);
        
    } catch (error) {
        console.error('Password reset error:', error);
        
        // Tampilkan notifikasi error
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                getPesanError(error.code),
                'error',
                'Reset Password Gagal'
            );
        });
        
        throw error;
    } finally {
        // Sembunyikan loading spinner
        tampilkanLoading(false);
    }
};

// ============================================================================
// FUNGSI LOGOUT PENGGUNA
// Fungsi: logoutUser()
// Tujuan: Sign out pengguna saat ini dari Firebase
// Returns: Promise yang resolve ketika logout selesai
// Throws: Error jika logout gagal
// ============================================================================
export const logoutUser = async () => {
    try {
        // Sign out pengguna dari Firebase
        await signOut(auth);
        
        // Tampilkan notifikasi sukses
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                'Logout berhasil! Terima kasih telah menggunakan layanan kami.',
                'success',
                'Logout Berhasil!'
            );
        });

        // Kirim notifikasi email ke admin tentang logout
        try {
            const userSaatIni = await getCurrentUser();
            if (userSaatIni && userSaatIni.email) {
                const EmailAPI = await import('./email-api.js');
                const emailAPI = new EmailAPI.default();
                await emailAPI.kirimNotifikasiLogout(userSaatIni.email);
            }
        } catch (emailError) {
            console.warn('Email notification failed:', emailError);
            // Jangan gagalkan logout jika notifikasi email gagal
        }
        
    } catch (error) {
        console.error('Logout error:', error);
        
        // Tampilkan notifikasi error
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                'Terjadi kesalahan saat logout. Coba lagi.',
                'error',
                'Logout Gagal'
            );
        });
        
        throw error;
    }
};

// ============================================================================
// MANAJEMEN STATUS LOADING
// Fungsi: tampilkanLoading(tampilkan)
// Tujuan: Tampilkan/sembunyikan loading spinner dan nonaktifkan tombol form
// Parameter:
//   - tampilkan: Boolean untuk menampilkan (true) atau menyembunyikan (false) status loading
// ============================================================================
function tampilkanLoading(tampilkan) {
    // Tampilkan/sembunyikan loading spinner
    if (elemenLoading) {
        elemenLoading.style.display = tampilkan ? 'flex' : 'none';
    }
    
    // Nonaktifkan/aktifkan tombol form selama loading
    const tombolForm = document.querySelectorAll('.btn-login, button[type="submit"]');
    tombolForm.forEach(tombol => {
        tombol.disabled = tampilkan;
        if (tampilkan) {
            tombol.style.opacity = '0.6';
            tombol.style.cursor = 'not-allowed';
        } else {
            tombol.style.opacity = '1';
            tombol.style.cursor = 'pointer';
        }
    });
}

// ============================================================================
// TRANSLASI PESAN ERROR
// Fungsi: getPesanError(kodeError)
// Tujuan: Konversi kode error Firebase menjadi pesan ramah pengguna dalam bahasa Indonesia
// Parameter:
//   - kodeError: String kode error Firebase
// Returns: Pesan error terlokalisasi dalam bahasa Indonesia
// ============================================================================
function getPesanError(kodeError) {
    const pesanError = {
        'auth/invalid-email': 'Format email tidak valid.',
        'auth/user-disabled': 'Akun telah dinonaktifkan oleh administrator.',
        'auth/user-not-found': 'Email belum terdaftar. Silakan daftar akun baru.',
        'auth/wrong-password': 'Password salah. Periksa kembali password Anda.',
        'auth/email-already-in-use': 'Email sudah digunakan. Gunakan email lain.',
        'auth/weak-password': 'Password terlalu lemah. Gunakan minimal 6 karakter.',
        'auth/operation-not-allowed': 'Operasi tidak diizinkan. Hubungi administrator.',
        'auth/invalid-credential': 'Kredensial tidak valid. Periksa email dan password.',
        'auth/too-many-requests': 'Terlalu banyak percobaan. Tunggu beberapa saat lagi.',
        'auth/network-request-failed': 'Koneksi jaringan gagal. Periksa koneksi internet Anda.'
    };
    
    // Kembalikan pesan terlokalisasi atau pesan default
    return pesanError[kodeError] || 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.';
}

// ============================================================================
// EVENT LISTENER FORM
// Setup event listener untuk semua form autentikasi
// ============================================================================

// EVENT LISTENER FORM LOGIN
// Menangani pengiriman form untuk login pengguna
if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault(); // Mencegah pengiriman form default
        
        // Dapatkan nilai form
        const email = document.getElementById('email').value;
        const kataSandi = document.getElementById('password').value;
        
        // Validasi field form
        if (!email || !kataSandi) {
            await import('./notifications.js').then(({ showNotification }) => {
                showNotification(
                    'Silakan isi semua field yang diperlukan.',
                    'warning',
                    'Field Kosong'
                );
            });
            return;
        }
        
        // Coba login
        await loginUser(email, kataSandi);
    });
}

// EVENT LISTENER FORM PENDAFTARAN
// Menangani pengiriman form untuk pendaftaran pengguna baru
if (formDaftar) {
    formDaftar.addEventListener('submit', async (e) => {
        e.preventDefault(); // Mencegah pengiriman form default
        
        // Dapatkan nilai form
        const email = document.getElementById('registerEmail').value;
        const kataSandi = document.getElementById('registerPassword').value;
        const konfirmasiKataSandi = document.getElementById('confirmPassword').value;
        const namaTampilan = email.split('@')[0]; // Gunakan prefix email sebagai display name
        
        // Validasi semua field yang diperlukan
        if (!email || !kataSandi || !konfirmasiKataSandi) {
            await import('./notifications.js').then(({ showNotification }) => {
                showNotification(
                    'Silakan isi semua field yang diperlukan.',
                    'warning',
                    'Field Kosong'
                );
            });
            return;
        }
        
        // Validasi konfirmasi password
        if (kataSandi !== konfirmasiKataSandi) {
            await import('./notifications.js').then(({ showNotification }) => {
                showNotification(
                    'Password dan konfirmasi password tidak sama.',
                    'warning',
                    'Password Tidak Cocok'
                );
            });
            return;
        }
        
        // Validasi kekuatan password
        if (kataSandi.length < 6) {
            await import('./notifications.js').then(({ showNotification }) => {
                showNotification(
                    'Password minimal 6 karakter.',
                    'warning',
                    'Password Terlalu Pendek'
                );
            });
            return;
        }
        
        // Coba pendaftaran
        await registerUser(email, kataSandi, namaTampilan);
    });
}

// EVENT LISTENER FORM LUPA PASSWORD
// Menangani pengiriman form untuk permintaan reset password
if (formLupa) {
    formLupa.addEventListener('submit', async (e) => {
        e.preventDefault(); // Mencegah pengiriman form default
        
        // Dapatkan nilai email
        const email = document.getElementById('resetEmail').value;
        
        // Validasi field email
        if (!email) {
            await import('./notifications.js').then(({ showNotification }) => {
                showNotification(
                    'Silakan masukkan email Anda.',
                    'warning',
                    'Email Diperlukan'
                );
            });
            return;
        }
        
        // Coba reset password
        await resetPassword(email);
    });
}

// ============================================================================
// AUTO-FILL EMAIL DI FORM LUPA PASSWORD
// Ketika pengguna mengetik email di form login, auto-fill di form lupa password
// ============================================================================
if (document.getElementById('email') && document.getElementById('resetEmail')) {
    document.getElementById('email').addEventListener('input', (e) => {
        document.getElementById('resetEmail').value = e.target.value;
    });
}

// ============================================================================
// PERIKSA STATUS AUTENTIKASI SAAT HALAMAN DIMUAT
// Periksa apakah pengguna sudah login dan redirect sesuai
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Periksa status autentikasi saat ini
    checkAuthState((user) => {
        // Jika pengguna sudah login dan di halaman login, redirect ke dashboard
        if (user && window.location.pathname.endsWith('index.html')) {
            window.location.href = 'dashboard.html';
        }
    });
});

// ============================================================================
// FUNGSI TAMBAHAN UNTUK MANAJEMEN FORM
// ============================================================================

/**
 * Tampilkan form login
 * Fungsi: tampilkanLogin()
 * Tujuan: Switch ke form login dan sembunyikan form lain
 */
function tampilkanLogin() {
    // Sembunyikan semua form
    const formContainer = document.querySelector('.form-container');
    const forms = formContainer.querySelectorAll('.form');
    forms.forEach(form => form.style.display = 'none');
    
    // Tampilkan form login
    const formLoginElement = document.querySelector('.form.login-form');
    if (formLoginElement) {
        formLoginElement.style.display = 'block';
    }
}
