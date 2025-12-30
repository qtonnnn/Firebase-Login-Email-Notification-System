// ============================================================================
// FIREBASE CONFIGURATION AND SETUP
// File: js/firebase-config.js
// Description: Complete Firebase configuration and utility functions
// Includes: Firebase SDK imports, initialization, authentication, and Firestore operations
// ============================================================================

// ============================================================================
// FIREBASE SDK IMPORTS (v10.7.1)
// Import Firebase App, Authentication, and Firestore modules
// Using modern ES6 modules for tree-shaking and better performance
// ============================================================================

// Core Firebase App functionality
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';

// Firebase Authentication module
import { 
    getAuth,                          // Get Firebase Auth instance
    onAuthStateChanged,               // Listen to authentication state changes
    signInWithEmailAndPassword,       // Email/password sign in
    createUserWithEmailAndPassword,   // Email/password registration
    sendPasswordResetEmail,          // Send password reset email
    signOut,                         // Sign out user
    updateProfile                    // Update user profile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase Firestore (Database) module
import { 
    getFirestore,                    // Get Firestore instance
    doc,                            // Reference to document
    setDoc,                         // Create/set document
    getDoc,                         // Get single document
    collection,                     // Reference to collection
    query,                         // Create query
    where,                         // Query condition
    getDocs                        // Get multiple documents
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ============================================================================
// FIREBASE CONFIGURATION
// Replace these placeholder values with your actual Firebase project configuration
// Get these values from Firebase Console > Project Settings > General > Your apps
// ============================================================================

const firebaseConfig = {
    apiKey: "your-api-key-here",              // Firebase API Key
    authDomain: "your-project-id.firebaseapp.com",  // Authentication domain
    projectId: "your-project-id",             // Firestore project ID
    storageBucket: "your-project-id.appspot.com",   // Storage bucket URL
    messagingSenderId: "123456789",          // Cloud Messaging sender ID
    appId: "1:123456789:web:abcdef123456"    // Firebase app ID
};

// ============================================================================
// FIREBASE APP INITIALIZATION
// Initialize Firebase with the configuration
// This creates the Firebase app instance that will be used by all services
// ============================================================================

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// ============================================================================
// FIREBASE SERVICES INITIALIZATION
// Initialize Firebase services (Authentication and Firestore)
// These services will be used throughout the application
// ============================================================================

// Initialize Firebase Authentication service
const auth = getAuth(app);

// Initialize Firebase Firestore (database) service
const db = getFirestore(app);

// ============================================================================
// EXPORT FIREBASE CORE FUNCTIONS
// Export all Firebase functions and instances for use in other modules
// This allows other JavaScript files to import and use Firebase functionality
// ============================================================================
export {
    // Core instances
    app,              // Firebase app instance
    auth,             // Firebase Authentication instance
    db,               // Firestore database instance
    
    // Authentication functions
    getAuth,                          // Get Auth instance
    onAuthStateChanged,               // Listen to auth state changes
    signInWithEmailAndPassword,       // Email/password sign in
    createUserWithEmailAndPassword,   // Email/password registration
    sendPasswordResetEmail,          // Send password reset email
    signOut,                         // Sign out user
    updateProfile,                   // Update user profile
    
    // Firestore functions
    doc,                            // Document reference
    setDoc,                         // Create/set document
    getDoc,                         // Get single document
    collection,                     // Collection reference
    query,                         // Query builder
    where,                         // Query condition
    getDocs                        // Get multiple documents
};

// ============================================================================
// UTILITY FUNCTIONS
// Helper functions for common Firebase operations
// ============================================================================

/**
 * Get current authenticated user
 * Function: getCurrentUser()
 * Purpose: Get the currently authenticated user (if any)
 * Returns: Promise that resolves to user object or null
 * 
 * This function provides a clean way to get the current user
 * without having to deal with the async nature of onAuthStateChanged
 */
export const getCurrentUser = () => {
    return new Promise((resolve) => {
        // Create unsubscribe function to stop listening after getting user
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // Immediately stop listening to avoid memory leaks
            unsubscribe();
            // Resolve with user (or null if not authenticated)
            resolve(user);
        });
    });
};

/**
 * Check authentication state
 * Function: checkAuthState(callback)
 * Purpose: Subscribe to authentication state changes
 * Parameters:
 *   - callback: Function to call when auth state changes
 *               Receives user object as parameter
 * Returns: Unsubscribe function to stop listening
 * 
 * This function allows components to react to login/logout events
 */
export const checkAuthState = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// ============================================================================
// USER PROFILE MANAGEMENT
// Functions for creating and managing user profiles in Firestore
// ============================================================================

/**
 * Create user profile in Firestore
 * Function: createUserProfile(user, additionalData)
 * Purpose: Create user profile document in Firestore database
 * Parameters:
 *   - user: Firebase user object from authentication
 *   - additionalData: Additional data to store with user profile
 * Returns: Promise that resolves to document reference
 * 
 * This function creates a document in the 'users' collection
 * with user information for easy retrieval and management
 */
export const createUserProfile = async (user, additionalData = {}) => {
    // Don't proceed if user object is not provided
    if (!user) return;

    // Create reference to user document in 'users' collection
    const userRef = doc(db, 'users', user.uid);
    
    // Check if user profile already exists
    const userSnap = await getDoc(userRef);

    // Only create profile if it doesn't exist
    if (!userSnap.exists()) {
        // Extract user information
        const { email, displayName } = user;
        const createdAt = new Date().toISOString(); // Current timestamp

        try {
            // Create user profile document
            await setDoc(userRef, {
                email,                              // User's email address
                displayName: displayName || additionalData.displayName || '', // Display name
                createdAt,                          // When account was created
                emailVerified: false,               // Email verification status
                lastLogin: null,                    // Last login timestamp
                ...additionalData                   // Any additional data
            });
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error; // Re-throw to handle in calling code
        }
    }

    // Return document reference
    return userRef;
};

/**
 * Get user profile from Firestore
 * Function: getUserProfile(uid)
 * Purpose: Retrieve user profile data from Firestore
 * Parameters:
 *   - uid: User's unique ID (from Firebase Auth)
 * Returns: Promise that resolves to user profile data or null
 */
export const getUserProfile = async (uid) => {
    try {
        // Create reference to user document
        const userRef = doc(db, 'users', uid);
        
        // Get document snapshot
        const userSnap = await getDoc(userRef);
        
        // Return document data if it exists, otherwise null
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
 * Check if email already exists in Firestore
 * Function: checkEmailExists(email)
 * Purpose: Check if an email address is already registered
 * Parameters:
 *   - email: Email address to check
 * Returns: Promise that resolves to boolean (true if email exists)
 * 
 * This function is used to prevent duplicate email registrations
 * and to check if an email exists before login attempts
 */
export const checkEmailExists = async (email) => {
    try {
        // Create reference to users collection
        const usersRef = collection(db, 'users');
        
        // Create query to find documents with matching email
        const q = query(usersRef, where('email', '==', email));
        
        // Execute query and get results
        const querySnapshot = await getDocs(q);
        
        // Return true if any documents found (email exists)
        return !querySnapshot.empty;
    } catch (error) {
        console.error('Error checking email:', error);
        // Return false on error to avoid blocking user actions
        return false;
    }
};

// ============================================================================
// ADDITIONAL UTILITY FUNCTIONS (Optional)
// Helper functions for common operations
// ============================================================================

/**
 * Update user profile information
 * Function: updateUserProfile(uid, updateData)
 * Purpose: Update user profile data in Firestore
 * Parameters:
 *   - uid: User's unique ID
 *   - updateData: Object containing fields to update
 * Returns: Promise that resolves when update is complete
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
 * Update user's last login timestamp
 * Function: updateLastLogin(uid)
 * Purpose: Record when user last logged in
 * Parameters:
 *   - uid: User's unique ID
 * Returns: Promise that resolves when update is complete
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
 * Get all users (admin function)
 * Function: getAllUsers()
 * Purpose: Get all user profiles from Firestore
 * Returns: Promise that resolves to array of user profiles
 * Note: Use with caution - may return large datasets
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
