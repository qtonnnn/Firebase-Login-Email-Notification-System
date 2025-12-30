// ============================================================================
// KONFIGURASI DAN SETUP FIREBASE
// File: js/firebase-config.js
// Description: Konfigurasi Firebase lengkap dan fungsi utilitas
// Includes: Import Firebase SDK, inisialisasi, autentikasi, dan operasi Firestore
// ============================================================================

// ============================================================================
// IMPORT FIREBASE SDK (v10.7.1)
// Import modul Firebase App, Authentication, dan Firestore
// Menggunakan ES6 modules modern untuk tree-shaking dan performa yang lebih baik
// ============================================================================

// Fungsionalitas Firebase App inti
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';

// Modul Firebase Authentication
import { 
    getAuth,                          // Dapatkan instance Firebase Auth
    onAuthStateChanged,               // Dengarkan perubahan status autentikasi
    signInWithEmailAndPassword,       // Login dengan email/password
    createUserWithEmailAndPassword,   // Pendaftaran email/password
    sendPasswordResetEmail,          // Kirim email reset password
    signOut,                         // Logout pengguna
    updateProfile                    // Perbarui profil pengguna
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Modul Firebase Firestore (Database)
import { 
    getFirestore,                    // Dapatkan instance Firestore
    doc,                            // Referensi ke dokumen
    setDoc,                         // Buat/atur dokumen
    getDoc,                         // Dapatkan satu dokumen
    collection,                     // Referensi ke koleksi
    query,                         // Buat query
    where,                         // Kondisi query
    getDocs                        // Dapatkan multiple dokumen
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ============================================================================
// KONFIGURASI FIREBASE
// Ganti nilai placeholder ini dengan konfigurasi proyek Firebase Anda yang sebenarnya
// Dapatkan nilai ini dari Firebase Console > Project Settings > General > Your apps
// ============================================================================

const firebaseConfig = {
    apiKey: "your-api-key-here",              // API Key Firebase
    authDomain: "your-project-id.firebaseapp.com",  // Domain autentikasi
    projectId: "your-project-id",             // ID proyek Firestore
    storageBucket: "your-project-id.appspot.com",   // URL storage bucket
    messagingSenderId: "123456789",          // Cloud Messaging sender ID
    appId: "1:123456789:web:abcdef123456"    // Firebase app ID
};

// ============================================================================
// INISIALISASI FIREBASE APP
// Inisialisasi Firebase dengan konfigurasi
// Ini membuat instance Firebase app yang akan digunakan oleh semua layanan
// ============================================================================

// Inisialisasi Firebase app
const app = initializeApp(firebaseConfig);

// ============================================================================
// INISIALISASI LAYANAN FIREBASE
// Inisialisasi layanan Firebase (Authentication dan Firestore)
// Layanan ini akan digunakan di seluruh aplikasi
// ============================================================================

// Inisialisasi layanan Firebase Authentication
const auth = getAuth(app);

// Inisialisasi layanan Firebase Firestore (database)
const db = getFirestore(app);

// ============================================================================
// EXPORT FUNGSI FIREBASE INTI
// Export semua fungsi dan instance Firebase untuk digunakan di modul lain
// Ini memungkinkan file JavaScript lain untuk mengimpor dan menggunakan fungsionalitas Firebase
// ============================================================================
export {
    // Instance inti
    app,              // Instance Firebase app
    auth,             // Instance Firebase Authentication
    db,               // Instance database Firestore
    
    // Fungsi autentikasi
    getAuth,                          // Dapatkan instance Auth
    onAuthStateChanged,               // Dengarkan perubahan status auth
    signInWithEmailAndPassword,       // Login dengan email/password
    createUserWithEmailAndPassword,   // Pendaftaran email/password
    sendPasswordResetEmail,          // Kirim email reset password
    signOut,                         // Logout pengguna
    updateProfile,                   // Perbarui profil pengguna
    
    // Fungsi Firestore
    doc,                            // Referensi dokumen
    setDoc,                         // Buat/atur dokumen
    getDoc,                         // Dapatkan satu dokumen
    collection,                     // Referensi koleksi
    query,                         // Builder query
    where,                         // Kondisi query
    getDocs                        // Dapatkan multiple dokumen
};

// ============================================================================
// FUNGSI UTILITAS
// Fungsi helper untuk operasi Firebase yang umum
// ============================================================================

/**
 * Dapatkan pengguna yang sedang autentikasi
 * Fungsi: getCurrentUser()
 * Tujuan: Dapatkan pengguna yang sedang autentikasi (jika ada)
 * Returns: Promise yang resolve ke objek pengguna atau null
 * 
 * Fungsi ini menyediakan cara yang bersih untuk mendapatkan pengguna saat ini
 * tanpa harus deal dengan sifat async dari onAuthStateChanged
 */
export const getCurrentUser = () => {
    return new Promise((resolve) => {
        // Buat fungsi unsubscribe untuk berhenti listen setelah mendapatkan pengguna
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // Langsung berhenti listen untuk mencegah memory leaks
            unsubscribe();
            // Resolve dengan pengguna (atau null jika tidak terotentikasi)
            resolve(user);
        });
    });
};

/**
 * Periksa status autentikasi
 * Fungsi: checkAuthState(callback)
 * Tujuan: Subscribe untuk perubahan status autentikasi
 * Parameter:
 *   - callback: Fungsi yang dipanggil ketika status auth berubah
 *               Menerima objek pengguna sebagai parameter
 * Returns: Fungsi unsubscribe untuk berhenti listen
 * 
 * Fungsi ini memungkinkan komponen untuk react terhadap event login/logout
 */
export const checkAuthState = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// ============================================================================
// MANAJEMEN PROFIL PENGGUNA
// Fungsi untuk membuat dan mengelola profil pengguna di Firestore
// ============================================================================

/**
 * Buat profil pengguna di Firestore
 * Fungsi: createUserProfile(user, additionalData)
 * Tujuan: Buat dokumen profil pengguna di database Firestore
 * Parameter:
 *   - user: Objek pengguna Firebase dari autentikasi
 *   - additionalData: Data tambahan untuk disimpan dengan profil pengguna
 * Returns: Promise yang resolve ke referensi dokumen
 * 
 * Fungsi ini membuat dokumen di koleksi 'users'
 * dengan informasi pengguna untuk easy retrieval dan management
 */
export const createUserProfile = async (user, additionalData = {}) => {
    // Jangan lanjutkan jika objek user tidak disediakan
    if (!user) return;

    // Buat referensi ke dokumen pengguna di koleksi 'users'
    const userRef = doc(db, 'users', user.uid);
    
    // Periksa apakah profil pengguna sudah ada
    const userSnap = await getDoc(userRef);

    // Hanya buat profil jika belum ada
    if (!userSnap.exists()) {
        // Ekstrak informasi pengguna
        const { email, displayName } = user;
        const createdAt = new Date().toISOString(); // Timestamp saat ini

        try {
            // Buat dokumen profil pengguna
            await setDoc(userRef, {
                email,                              // Alamat email pengguna
                displayName: displayName || additionalData.displayName || '', // Nama tampilan
                createdAt,                          // Kapan akun dibuat
                emailVerified: false,               // Status verifikasi email
                lastLogin: null,                    // Timestamp login terakhir
                ...additionalData                   // Data tambahan apapun
            });
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error; // Re-throw untuk ditangani di kode pemanggil
        }
    }

    // Kembalikan referensi dokumen
    return userRef;
};

/**
 * Dapatkan profil pengguna dari Firestore
 * Fungsi: getUserProfile(uid)
 * Tujuan: Ambil data profil pengguna dari Firestore
 * Parameter:
 *   - uid: ID unik pengguna (dari Firebase Auth)
 * Returns: Promise yang resolve ke data profil pengguna atau null
 */
export const getUserProfile = async (uid) => {
    try {
        // Buat referensi ke dokumen pengguna
        const userRef = doc(db, 'users', uid);
        
        // Dapatkan snapshot dokumen
        const userSnap = await getDoc(userRef);
        
        // Kembalikan data dokumen jika ada, jika tidak null
        if (userSnap.exists()) {
            return userSnap.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
};

/**
 * Periksa apakah email sudah ada di Firestore
 * Fungsi: checkEmailExists(email)
 * Tujuan: Periksa apakah alamat email sudah terdaftar
 * Parameter:
 *   - email: Alamat email untuk memeriksa
 * Returns: Promise yang resolve ke boolean (true jika email ada)
 * 
 * Fungsi ini digunakan untuk mencegah pendaftaran email duplikat
 * dan untuk memeriksa apakah email ada sebelum percobaan login
 */
export const checkEmailExists = async (email) => {
    try {
        // Buat referensi ke koleksi users
        const usersRef = collection(db, 'users');
        
        // Buat query untuk menemukan dokumen dengan email yang cocok
        const q = query(usersRef, where('email', '==', email));
        
        // Eksekusi query dan dapatkan hasil
        const querySnapshot = await getDocs(q);
        
        // Kembalikan true jika ada dokumen yang ditemukan (email ada)
        return !querySnapshot.empty;
    } catch (error) {
        console.error('Error checking email:', error);
        // Kembalikan false pada error untuk tidak menghalangi aksi pengguna
        return false;
    }
};

// ============================================================================
// FUNGSI UTILITAS TAMBAHAN (Opsional)
// Fungsi helper untuk operasi umum
// ============================================================================

/**
 * Perbarui informasi profil pengguna
 * Fungsi: updateUserProfile(uid, updateData)
 * Tujuan: Perbarui data profil pengguna di Firestore
 * Parameter:
 *   - uid: ID unik pengguna
 *   - updateData: Objek yang berisi field yang akan diperbarui
 * Returns: Promise yang resolve ketika update selesai
 */
export const updateUserProfile = async (uid, updateData) => {
    try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, updateData, { merge: true });
        return true;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

/**
 * Perbarui timestamp login terakhir pengguna
 * Fungsi: updateLastLogin(uid)
 * Tujuan: Catat kapan pengguna terakhir login
 * Parameter:
 *   - uid: ID unik pengguna
 * Returns: Promise yang resolve ketika update selesai
 */
export const updateLastLogin = async (uid) => {
    try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
            lastLogin: new Date().toISOString()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error('Error updating last login:', error);
        return false;
    }
};

/**
 * Dapatkan semua pengguna (fungsi admin)
 * Fungsi: getAllUsers()
 * Tujuan: Dapatkan semua profil pengguna dari Firestore
 * Returns: Promise yang resolve ke array profil pengguna
 * Note: Gunakan dengan hati-hati - mungkin mengembalikan dataset besar
 */
export const getAllUsers = async () => {
    try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        const users = [];
        
        querySnapshot.forEach((doc) => {
            users.push({
                uid: doc.id,
                ...doc.data()
            });
        });
        
        return users;
    } catch (error) {
        console.error('Error getting all users:', error);
        return [];
    }
};
