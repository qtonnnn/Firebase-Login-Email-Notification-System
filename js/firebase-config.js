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

const konfigurasiFirebase = {
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
const aplikasi = initializeApp(konfigurasiFirebase);

// ============================================================================
// INISIALISASI LAYANAN FIREBASE
// Inisialisasi layanan Firebase (Authentication dan Firestore)
// Layanan ini akan digunakan di seluruh aplikasi
// ============================================================================

// Inisialisasi layanan Firebase Authentication
const autentikasi = getAuth(aplikasi);

// Inisialisasi layanan Firebase Firestore (database)
const database = getFirestore(aplikasi);

// ============================================================================
// EXPORT FUNGSI FIREBASE INTI
// Export semua fungsi dan instance Firebase untuk digunakan di modul lain
// Ini memungkinkan file JavaScript lain untuk mengimpor dan menggunakan fungsionalitas Firebase
// ============================================================================
export {
    // Instance inti
    aplikasi,              // Instance Firebase app
    autentikasi,             // Instance Firebase Authentication
    database,               // Instance database Firestore
    
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
 * Fungsi: dapatkanUserSaatIni()
 * Tujuan: Dapatkan pengguna yang sedang autentikasi (jika ada)
 * Returns: Promise yang resolve ke objek pengguna atau null
 * 
 * Fungsi ini menyediakan cara yang bersih untuk mendapatkan pengguna saat ini
 * tanpa harus deal dengan sifat async dari onAuthStateChanged
 */
export const dapatkanUserSaatIni = () => {
    return new Promise((resolve) => {
        // Buat fungsi unsubscribe untuk berhenti listen setelah mendapatkan pengguna
        const unsubscribe = onAuthStateChanged(autentikasi, (user) => {
            // Langsung berhenti listen untuk mencegah memory leaks
            unsubscribe();
            // Resolve dengan pengguna (atau null jika tidak terotentikasi)
            resolve(user);
        });
    });
};

/**
 * Periksa status autentikasi
 * Fungsi: periksaStatusAuth(callback)
 * Tujuan: Subscribe untuk perubahan status autentikasi
 * Parameter:
 *   - callback: Fungsi yang dipanggil ketika status auth berubah
 *               Menerima objek pengguna sebagai parameter
 * Returns: Fungsi unsubscribe untuk berhenti listen
 * 
 * Fungsi ini memungkinkan komponen untuk react terhadap event login/logout
 */
export const periksaStatusAuth = (callback) => {
    return onAuthStateChanged(autentikasi, callback);
};

// ============================================================================
// MANAJEMEN PROFIL PENGGUNA
// Fungsi untuk membuat dan mengelola profil pengguna di Firestore
// ============================================================================

/**
 * Buat profil pengguna di Firestore
 * Fungsi: buatProfilUser(user, dataTambahan)
 * Tujuan: Buat dokumen profil pengguna di database Firestore
 * Parameter:
 *   - user: Objek pengguna Firebase dari autentikasi
 *   - dataTambahan: Data tambahan untuk disimpan dengan profil pengguna
 * Returns: Promise yang resolve ke referensi dokumen
 * 
 * Fungsi ini membuat dokumen di koleksi 'users'
 * dengan informasi pengguna untuk easy retrieval dan management
 */
export const buatProfilUser = async (user, dataTambahan = {}) => {
    // Jangan lanjutkan jika objek user tidak disediakan
    if (!user) return;

    // Buat referensi ke dokumen pengguna di koleksi 'users'
    const referensiUser = doc(database, 'users', user.uid);
    
    // Periksa apakah profil pengguna sudah ada
    const snapshotUser = await getDoc(referensiUser);

    // Hanya buat profil jika belum ada
    if (!snapshotUser.exists()) {
        // Ekstrak informasi pengguna
        const { email, displayName } = user;
        const dibuatPada = new Date().toISOString(); // Timestamp saat ini

        try {
            // Buat dokumen profil pengguna
            await setDoc(referensiUser, {
                email,                              // Alamat email pengguna
                displayName: displayName || dataTambahan.displayName || '', // Nama tampilan
                dibuatPada,                          // Kapan akun dibuat
                emailVerified: false,               // Status verifikasi email
                lastLogin: null,                    // Timestamp login terakhir
                ...dataTambahan                   // Data tambahan apapun
            });
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error; // Re-throw untuk ditangani di kode pemanggil
        }
    }

    // Kembalikan referensi dokumen
    return referensiUser;
};

/**
 * Dapatkan profil pengguna dari Firestore
 * Fungsi: dapatkanProfilUser(uid)
 * Tujuan: Ambil data profil pengguna dari Firestore
 * Parameter:
 *   - uid: ID unik pengguna (dari Firebase Auth)
 * Returns: Promise yang resolve ke data profil pengguna atau null
 */
export const dapatkanProfilUser = async (uid) => {
    try {
        // Buat referensi ke dokumen pengguna
        const referensiUser = doc(database, 'users', uid);
        
        // Dapatkan snapshot dokumen
        const snapshotUser = await getDoc(referensiUser);
        
        // Kembalikan data dokumen jika ada, jika tidak null
        if (snapshotUser.exists()) {
            return snapshotUser.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
};

/**
 * Periksa apakah email sudah ada di Firestore
 * Fungsi: periksaEmailTerdaftar(email)
 * Tujuan: Periksa apakah alamat email sudah terdaftar
 * Parameter:
 *   - email: Alamat email untuk memeriksa
 * Returns: Promise yang resolve ke boolean (true jika email ada)
 * 
 * Fungsi ini digunakan untuk mencegah pendaftaran email duplikat
 * dan untuk memeriksa apakah email ada sebelum percobaan login
 */
export const periksaEmailTerdaftar = async (email) => {
    try {
        // Buat referensi ke koleksi users
        const referensiUsers = collection(database, 'users');
        
        // Buat query untuk menemukan dokumen dengan email yang cocok
        const q = query(referensiUsers, where('email', '==', email));
        
        // Eksekusi query dan dapatkan hasil
        const snapshotQuery = await getDocs(q);
        
        // Kembalikan true jika ada dokumen yang ditemukan (email ada)
        return !snapshotQuery.empty;
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
 * Fungsi: perbaruiProfilUser(uid, dataUpdate)
 * Tujuan: Perbarui data profil pengguna di Firestore
 * Parameter:
 *   - uid: ID unik pengguna
 *   - dataUpdate: Objek yang berisi field yang akan diperbarui
 * Returns: Promise yang resolve ketika update selesai
 */
export const perbaruiProfilUser = async (uid, dataUpdate) => {
    try {
        const referensiUser = doc(database, 'users', uid);
        await setDoc(referensiUser, dataUpdate, { merge: true });
        return true;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

/**
 * Perbarui timestamp login terakhir pengguna
 * Fungsi: perbaruiLoginTerakhir(uid)
 * Tujuan: Catat kapan pengguna terakhir login
 * Parameter:
 *   - uid: ID unik pengguna
 * Returns: Promise yang resolve ketika update selesai
 */
export const perbaruiLoginTerakhir = async (uid) => {
    try {
        const referensiUser = doc(database, 'users', uid);
        await setDoc(referensiUser, {
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
 * Fungsi: dapatkanSemuaUsers()
 * Tujuan: Dapatkan semua profil pengguna dari Firestore
 * Returns: Promise yang resolve ke array profil pengguna
 * Note: Gunakan dengan hati-hati - mungkin mengembalikan dataset besar
 */
export const dapatkanSemuaUsers = async () => {
    try {
        const referensiUsers = collection(database, 'users');
        const snapshotQuery = await getDocs(referensiUsers);
        const users = [];
        
        snapshotQuery.forEach((doc) => {
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

/**
 * Hapus profil pengguna
 * Fungsi: hapusProfilUser(uid)
 * Tujuan: Hapus profil pengguna dari Firestore
 * Parameter:
 *   - uid: ID unik pengguna
 * Returns: Promise yang resolve ketika delete selesai
 */
export const hapusProfilUser = async (uid) => {
    try {
        const referensiUser = doc(database, 'users', uid);
        await deleteDoc(referensiUser);
        return true;
    } catch (error) {
        console.error('Error deleting user profile:', error);
        return false;
    }
};
