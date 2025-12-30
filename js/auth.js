// ============================================================================
// FIREBASE AUTHENTICATION SYSTEM
// File: js/auth.js
// Description: Complete authentication logic for Firebase login system
// Includes: Login, Register, Password Reset, Logout functionality
// ============================================================================

// Import Firebase authentication functions and utilities
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
// DOM ELEMENTS SELECTION
// Get references to HTML form elements for interaction
// ============================================================================

// Main form elements
const loginForm = document.getElementById('loginForm');       // Login form element
const registerForm = document.getElementById('registerForm'); // Registration form element
const forgotForm = document.getElementById('forgotForm');     // Forgot password form element
const loading = document.getElementById('loading');           // Loading spinner element

// ============================================================================
// USER LOGIN FUNCTION
// Function: loginUser(email, password)
// Purpose: Authenticate user with Firebase Email/Password
// Parameters: 
//   - email: User's email address
//   - password: User's password
// Returns: User object if successful
// Throws: Error if authentication fails
// ============================================================================
export const loginUser = async (email, password) => {
    try {
        // Show loading spinner and disable buttons
        showLoading(true);
        
        // Check if email exists before attempting login
        // This prevents unnecessary Firebase requests
        const emailExists = await checkEmailExists(email);
        if (!emailExists) {
            throw new Error('Email belum terdaftar. Silakan daftar akun baru terlebih dahulu.');
        }
        
        // Attempt to sign in with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Display success notification with user's name
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                `Selamat datang kembali, ${user.displayName || user.email}! 🎉`,
                'success',
                'Login Berhasil!'
            );
        });

        // Send email notification to qtonnnn@gmail.com
        // This is for admin monitoring purposes
        try {
            const EmailAPI = await import('./email-api.js');
            const emailAPI = new EmailAPI.default();
            await emailAPI.sendLoginNotification(user.email, user.displayName);
        } catch (emailError) {
            console.warn('Email notification failed:', emailError);
            // Don't fail login if email notification fails
        }
        
        // Redirect user to dashboard after successful login
        // 1.5 second delay to show success notification
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
        return user;
    } catch (error) {
        console.error('Login error:', error);
        
        // Show error notification to user
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                getErrorMessage(error.code),
                'error',
                'Login Gagal'
            );
        });
        
        throw error;
    } finally {
        // Always hide loading spinner, regardless of success or failure
        showLoading(false);
    }
};

// ============================================================================
// USER REGISTRATION FUNCTION
// Function: registerUser(email, password, displayName)
// Purpose: Create new user account with Firebase
// Parameters:
//   - email: New user's email address
//   - password: New user's password
//   - displayName: User's display name (optional)
// Returns: User object if successful
// Throws: Error if registration fails
// ============================================================================
export const registerUser = async (email, password, displayName) => {
    try {
        // Show loading spinner and disable buttons
        showLoading(true);
        
        // Check if email already exists to prevent duplicate accounts
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
            throw new Error('Email sudah terdaftar. Gunakan email lain atau masuk dengan akun yang sudah ada.');
        }
        
        // Create new user account with Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update user profile with display name if provided
        // This sets the user's displayName in Firebase Auth
        if (displayName) {
            await updateProfile(user, {
                displayName: displayName
            });
        }
        
        // Create user profile document in Firestore database
        // This stores additional user information
        await createUserProfile(user, {
            displayName: displayName || '',
            emailVerified: false,
            createdAt: new Date().toISOString()
        });
        
        // Display success notification with user's name
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                `Akun berhasil dibuat! Selamat datang, ${displayName || email}! 🎊`,
                'success',
                'Pendaftaran Berhasil!'
            );
        });

        // Send email notification to admin about new registration
        try {
            const EmailAPI = await import('./email-api.js');
            const emailAPI = new EmailAPI.default();
            await emailAPI.sendRegistrationNotification(email, displayName);
        } catch (emailError) {
            console.warn('Email notification failed:', emailError);
            // Don't fail registration if email notification fails
        }
        
        // Redirect to dashboard after successful registration
        // 2 second delay to show success notification
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
        return user;
    } catch (error) {
        console.error('Registration error:', error);
        
        // Show error notification to user
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                getErrorMessage(error.code),
                'error',
                'Pendaftaran Gagal'
            );
        });
        
        throw error;
    } finally {
        // Always hide loading spinner
        showLoading(false);
    }
};

// ============================================================================
// PASSWORD RESET FUNCTION
// Function: resetPassword(email)
// Purpose: Send password reset email to user
// Parameters:
//   - email: Email address to send reset link to
// Returns: Promise that resolves when email is sent
// Throws: Error if password reset fails
// ============================================================================
export const resetPassword = async (email) => {
    try {
        // Show loading spinner
        showLoading(true);
        
        // Check if email exists before attempting reset
        const emailExists = await checkEmailExists(email);
        if (!emailExists) {
            throw new Error('Email belum terdaftar. Silakan periksa kembali email Anda.');
        }
        
        // Send password reset email via Firebase
        await sendPasswordResetEmail(auth, email);
        
        // Show success notification
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                `Link reset password telah dikirim ke ${email}. Periksa inbox dan folder spam.`,
                'success',
                'Reset Link Terkirim!'
            );
        });

        // Send email notification to admin about password reset request
        try {
            const EmailAPI = await import('./email-api.js');
            const emailAPI = new EmailAPI.default();
            await emailAPI.sendPasswordResetNotification(email);
        } catch (emailError) {
            console.warn('Email notification failed:', emailError);
            // Don't fail password reset if email notification fails
        }
        
        // Clear form and show login form after 3 seconds
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
        // Hide loading spinner
        showLoading(false);
    }
};

// ============================================================================
// USER LOGOUT FUNCTION
// Function: logoutUser()
// Purpose: Sign out current user from Firebase
// Returns: Promise that resolves when logout is complete
// Throws: Error if logout fails
// ============================================================================
export const logoutUser = async () => {
    try {
        // Sign out user from Firebase
        await signOut(auth);
        
        // Show success notification
        await import('./notifications.js').then(({ showNotification }) => {
            showNotification(
                'Logout berhasil! Terima kasih telah menggunakan layanan kami.',
                'success',
                'Logout Berhasil!'
            );
        });

        // Send email notification to admin about logout
        try {
            const currentUser = await getCurrentUser();
            if (currentUser && currentUser.email) {
                const EmailAPI = await import('./email-api.js');
                const emailAPI = new EmailAPI.default();
                await emailAPI.sendLogoutNotification(currentUser.email);
            }
        } catch (emailError) {
            console.warn('Email notification failed:', emailError);
            // Don't fail logout if email notification fails
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

// ============================================================================
// LOADING STATE MANAGEMENT
// Function: showLoading(show)
// Purpose: Show/hide loading spinner and disable form buttons
// Parameters:
//   - show: Boolean to show (true) or hide (false) loading state
// ============================================================================
function showLoading(show) {
    // Show/hide loading spinner
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

// ============================================================================
// ERROR MESSAGE TRANSLATION
// Function: getErrorMessage(errorCode)
// Purpose: Convert Firebase error codes to user-friendly Indonesian messages
// Parameters:
//   - errorCode: Firebase error code string
// Returns: Localized error message in Indonesian
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
    
    // Return localized message or default message
    return errorMessages[errorCode] || 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.';
}

// ============================================================================
// FORM EVENT LISTENERS
// Setup event listeners for all authentication forms
// ============================================================================

// LOGIN FORM EVENT LISTENER
// Handles form submission for user login
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission
        
        // Get form values
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Validate form fields
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
        
        // Attempt login
        await loginUser(email, password);
    });
}

// REGISTRATION FORM EVENT LISTENER
// Handles form submission for new user registration
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission
        
        // Get form values
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const displayName = email.split('@')[0]; // Use email prefix as display name
        
        // Validate all required fields
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
        
        // Validate password confirmation
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
        
        // Validate password strength
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
        
        // Attempt registration
        await registerUser(email, password, displayName);
    });
}

// FORGOT PASSWORD FORM EVENT LISTENER
// Handles form submission for password reset requests
if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission
        
        // Get email value
        const email = document.getElementById('resetEmail').value;
        
        // Validate email field
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
        
        // Attempt password reset
        await resetPassword(email);
    });
}

// ============================================================================
// AUTO-FILL EMAIL IN FORGOT PASSWORD FORM
// When user types email in login form, auto-fill in forgot password form
// ============================================================================
if (document.getElementById('email') && document.getElementById('resetEmail')) {
    document.getElementById('email').addEventListener('input', (e) => {
        document.getElementById('resetEmail').value = e.target.value;
    });
}

// ============================================================================
// AUTHENTICATION STATE CHECK ON PAGE LOAD
// Check if user is already logged in and redirect accordingly
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Check current authentication state
    checkAuthState((user) => {
        // If user is logged in and on login page, redirect to dashboard
        if (user && window.location.pathname.endsWith('index.html')) {
            window.location.href = 'dashboard.html';
        }
    });
});
