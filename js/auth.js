// Authentication Logic
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

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotForm = document.getElementById('forgotForm');
const loading = document.getElementById('loading');

// Authentication Functions
export const loginUser = async (email, password) => {
    try {
        showLoading(true);
        
        // Check if email exists before attempting login
        const emailExists = await checkEmailExists(email);
        if (!emailExists) {
            throw new Error('Email belum terdaftar. Silakan daftar akun baru terlebih dahulu.');
        }
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Show success notification
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                `Selamat datang kembali, ${user.displayName || user.email}! 🎉`,
                'success',
                'Login Berhasil!'
            );
        });

        // Send email notification
        try {
            const EmailAPI = await import('./email-api.js');
            const emailAPI = new EmailAPI.default();
            await emailAPI.sendLoginNotification(user.email, user.displayName);
        } catch (emailError) {
            console.warn('Email notification failed:', emailError);
            // Don't fail login if email fails
        }
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
        return user;
    } catch (error) {
        console.error('Login error:', error);
        
        // Show error notification
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                getErrorMessage(error.code),
                'error',
                'Login Gagal'
            );
        });
        
        throw error;
    } finally {
        showLoading(false);
    }
};

export const registerUser = async (email, password, displayName) => {
    try {
        showLoading(true);
        
        // Check if email already exists
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
            throw new Error('Email sudah terdaftar. Gunakan email lain atau masuk dengan akun yang sudah ada.');
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update user profile with display name
        if (displayName) {
            await updateProfile(user, {
                displayName: displayName
            });
        }
        
        // Create user profile in Firestore
        await createUserProfile(user, {
            displayName: displayName || '',
            emailVerified: false
        });
        
        // Show success notification
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                `Akun berhasil dibuat! Selamat datang, ${displayName || email}! 🎊`,
                'success',
                'Pendaftaran Berhasil!'
            );
        });

        // Send email notification
        try {
            const EmailAPI = await import('./email-api.js');
            const emailAPI = new EmailAPI.default();
            await emailAPI.sendRegistrationNotification(email, displayName);
        } catch (emailError) {
            console.warn('Email notification failed:', emailError);
            // Don't fail registration if email fails
        }
        
        // Redirect to dashboard after registration
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
        return user;
    } catch (error) {
        console.error('Registration error:', error);
        
        // Show error notification
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                getErrorMessage(error.code),
                'error',
                'Pendaftaran Gagal'
            );
        });
        
        throw error;
    } finally {
        showLoading(false);
    }
};

export const resetPassword = async (email) => {
    try {
        showLoading(true);
        
        // Check if email exists before attempting reset
        const emailExists = await checkEmailExists(email);
        if (!emailExists) {
            throw new Error('Email belum terdaftar. Silakan periksa kembali email Anda.');
        }
        
        await sendPasswordResetEmail(auth, email);
        
        // Show success notification
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                `Link reset password telah dikirim ke ${email}. Periksa inbox dan folder spam.`,
                'success',
                'Reset Link Terkirim!'
            );
        });

        // Send email notification
        try {
            const EmailAPI = await import('./email-api.js');
            const emailAPI = new EmailAPI.default();
            await emailAPI.sendPasswordResetNotification(email);
        } catch (emailError) {
            console.warn('Email notification failed:', emailError);
            // Don't fail password reset if email fails
        }
        
        // Clear form and show login
        setTimeout(() => {
            showLogin();
            document.getElementById('resetEmail').value = '';
        }, 3000);
        
    } catch (error) {
        console.error('Password reset error:', error);
        
        // Show error notification
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                getErrorMessage(error.code),
                'error',
                'Reset Password Gagal'
            );
        });
        
        throw error;
    } finally {
        showLoading(false);
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        
        // Show success notification
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                'Logout berhasil! Terima kasih telah menggunakan layanan kami.',
                'success',
                'Logout Berhasil!'
            );
        });

        // Send email notification (get current user email first)
        try {
            const currentUser = await getCurrentUser();
            if (currentUser && currentUser.email) {
                const EmailAPI = await import('./email-api.js');
                const emailAPI = new EmailAPI.default();
                await emailAPI.sendLogoutNotification(currentUser.email);
            }
        } catch (emailError) {
            console.warn('Email notification failed:', emailError);
            // Don't fail logout if email fails
        }
        
    } catch (error) {
        console.error('Logout error:', error);
        
        // Show error notification
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

// Utility Functions
function showLoading(show) {
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
    }
    
    // Disable/enable form buttons during loading
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
    
    return errorMessages[errorCode] || 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.';
}

// Form Event Listeners
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
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
        
        await loginUser(email, password);
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const displayName = email.split('@')[0]; // Use email prefix as display name
        
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
        
        await registerUser(email, password, displayName);
    });
}

if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('resetEmail').value;
        
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
        
        await resetPassword(email);
    });
}

// Auto-fill email in forgot password form
if (document.getElementById('email') && document.getElementById('resetEmail')) {
    document.getElementById('email').addEventListener('input', (e) => {
        document.getElementById('resetEmail').value = e.target.value;
    });
}

// Check authentication state on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState((user) => {
        if (user && window.location.pathname.endsWith('index.html')) {
            // User is logged in, redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    });
});
