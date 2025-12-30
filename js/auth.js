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
const loginForm = document.getElementById('loginForm');       // Elemen form login
const registerForm = document.getElementById('registerForm'); // Elemen form pendaftaran
const forgotForm = document.getElementById('forgotForm');     // Elemen form lupa password
const loading = document.getElementById('loading');           // Elemen loading spinner

// ============================================================================
// FUNGSI LOGIN PENGGUNA
// Fungsi: loginUser(email, password)
// Tujuan: Autentikasi pengguna dengan Firebase Email/Password
// Parameter: 
//   - email: Alamat email pengguna
//   - password: Password pengguna
// Returns: Objek User jika berhasil
// Throws: Error jika autentikasi gagal
// ============================================================================
export const loginUser = async (email, password) => {
    try {
        // Tampilkan loading spinner dan nonaktifkan tombol
        showLoading(true);
        
        // Periksa apakah email ada sebelum mencoba login
        // Ini mencegah request Firebase yang tidak perlu
        const emailExists = await checkEmailExists(email);
        if (!emailExists) {
            throw new Error('Email belum terdaftar. Silakan daftar akun baru terlebih dahulu.');
        }
        
        // Mencoba sign in dengan Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
            await emailAPI.sendLoginNotification(user.email, user.displayName);
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
                getErrorMessage(error.code),
                'error',
                'Login Gagal'
            );
        });
        
        throw error;
    } finally {
        // Selalu sembunyikan loading spinner, независимо от успеха или неудачи
        showLoading(false);
    }
};

// ============================================================================
// FUNGSI PENDAFTARAN PENGGUNA
// Fungsi: registerUser(email, password, displayName)
// Tujuan: Buat akun pengguna baru dengan Firebase
// Parameter:
//   - email: Alamat email pengguna baru
//   - password: Password pengguna baru
//   - displayName: Nama tampilan pengguna (opsional)
// Returns: Objek User jika berhasil
// Throws: Error jika pendaftaran gagal
// ============================================================================
export const registerUser = async (email, password, displayName) => {
    try {
        // Tampilkan loading spinner dan nonaktifkan tombol
        showLoading(true);
        
        // Periksa apakah email sudah ada untuk mencegah akun duplikat
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
            throw new Error('Email sudah terdaftar. Gunakan email lain atau masuk dengan akun yang sudah ada.');
        }
        
        // Buat akun pengguna baru dengan Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Perbarui profil pengguna dengan nama tampilan jika disediakan
        // Ini mengatur displayName pengguna di Firebase Auth
        if (displayName) {
            await updateProfile(user, {
                displayName: displayName
            });
        }
        
        // Buat dokumen profil pengguna di database Firestore
        // Ini menyimpan informasi pengguna tambahan
        await createUserProfile(user, {
            displayName: displayName || '',
            emailVerified: false,
            createdAt: new Date().toISOString()
        });
        
        // Tampilkan notifikasi sukses dengan nama pengguna
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                `Akun berhasil dibuat! Selamat datang, ${displayName || email}! 🎊`,
                'success',
                'Pendaftaran Berhasil!'
            );
        });

        // Kirim notifikasi email ke admin tentang pendaftaran baru
        try {
            const EmailAPI = await import('./email-api.js');
            const emailAPI = new EmailAPI.default();
            await emailAPI.sendRegistrationNotification(email, displayName);
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
                getErrorMessage(error.code),
                'error',
                'Pendaftaran Gagal'
            );
        });
        
        throw error;
    } finally {
        // Selalu sembunyikan loading spinner
        showLoading(false);
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
        showLoading(true);
        
        // Periksa apakah email ada sebelum mencoba reset
        const emailExists = await checkEmailExists(email);
        if (!emailExists) {
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
            await emailAPI.sendPasswordResetNotification(email);
        } catch (emailError) {
            console.warn('Email notification failed:', emailError);
            // Jangan gagalkan reset password jika notifikasi email gagal
        }
        
        // Clear form dan tampilkan form login setelah 3 detik
        setTimeout(() => {
            showLogin();
            document.getElementById('resetEmail').value = '';
        }, 3000);
        
    } catch (error) {
        console.error('Password reset error:', error);
        
        // Tampilkan notifikasi error
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                getErrorMessage(error.code),
                'error',
                'Reset Password Gagal'
            );
        });
        
        throw error;
    } finally {
        // Sembunyikan loading spinner
        showLoading(false);
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
            const currentUser = await getCurrentUser();
            if (currentUser && currentUser.email) {
                const EmailAPI = await import('./email-api.js');
                const emailAPI = new EmailAPI.default();
                await emailAPI.sendLogoutNotification(currentUser.email);
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
// Fungsi: showLoading(show)
// Tujuan: Tampilkan/sembunyikan loading spinner dan nonaktifkan tombol form
// Parameter:
//   - show: Boolean untuk menampilkan (true) atau menyembunyikan (false) status loading
// ============================================================================
function showLoading(show) {
    // Tampilkan/sembunyikan loading spinner
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
    }
    
    // Nonaktifkan/aktifkan tombol form selama loading
    const buttons = document.querySelectorAll('.btn-login, button[type="submit"]');
    buttons.forEach(button => {
        button.disabled = show;
        if (show) {
            button.style.opacity = '0.6';
            button.style.cursor = 'not-allowed';
        } else {
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }
    });
}

// ============================================================================
// TRANSLASI PESAN ERROR
// Fungsi: getErrorMessage(errorCode)
// Tujuan: Konversi kode error Firebase menjadi pesan ramah pengguna dalam bahasa Indonesia
// Parameter:
//   - errorCode: String kode error Firebase
// Returns: Pesan error terlokalisasi dalam bahasa Indonesia
// ============================================================================
function getErrorMessage(errorCode) {
    const errorMessages = {
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
    return errorMessages[errorCode] || 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.';
}

// ============================================================================
// EVENT LISTENER FORM
// Setup event listener untuk semua form autentikasi
// ============================================================================

// EVENT LISTENER FORM LOGIN
// Menangani pengiriman form untuk login pengguna
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Mencegah pengiriman form default
        
        // Dapatkan nilai form
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Validasi field form
        if (!email || !password) {
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
        await loginUser(email, password);
    });
}

// EVENT LISTENER FORM PENDAFTARAN
// Menangani pengiriman form untuk pendaftaran pengguna baru
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Mencegah pengiriman form default
        
        // Dapatkan nilai form
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const displayName = email.split('@')[0]; // Gunakan prefix email sebagai display name
        
        // Validasi semua field yang diperlukan
        if (!email || !password || !confirmPassword) {
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
        if (password !== confirmPassword) {
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
        if (password.length < 6) {
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
        await registerUser(email, password, displayName);
    });
}

// EVENT LISTENER FORM LUPA PASSWORD
// Menangani pengiriman form untuk permintaan reset password
if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
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
