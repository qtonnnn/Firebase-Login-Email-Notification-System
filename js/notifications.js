// ============================================================================
// NOTIFICATION SYSTEM
// File: js/notifications.js
// Description: Complete notification system with toast and browser notifications
// Features: Success, Error, Warning, Info notifications with animations
// Includes: Browser notifications, Auto-dismiss, Manual close, Multiple notifications
// ============================================================================

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================

// Counter for generating unique notification IDs
let notificationCounter = 0;

// ============================================================================
// NOTIFICATION TYPE CONFIGURATIONS
// Each notification type has its own styling, icons, timing, and messages
// ============================================================================
const NOTIFICATION_TYPES = {
    // SUCCESS NOTIFICATION: For successful operations (login, register, etc.)
    success: {
        icon: 'fas fa-check-circle',           // FontAwesome icon
        defaultTitle: 'Berhasil!',             // Default title in Indonesian
        defaultMessage: 'Operasi berhasil dilakukan.', // Default message
        duration: 5000                         // Auto-dismiss after 5 seconds
    },
    
    // ERROR NOTIFICATION: For failed operations or errors
    error: {
        icon: 'fas fa-exclamation-circle',
        defaultTitle: 'Gagal!',
        defaultMessage: 'Terjadi kesalahan saat memproses.',
        duration: 7000                         // Stay longer for error messages
    },
    
    // WARNING NOTIFICATION: For validation errors or warnings
    warning: {
        icon: 'fas fa-exclamation-triangle',
        defaultTitle: 'Peringatan!',
        defaultMessage: 'Harap periksa kembali input Anda.',
        duration: 6000
    },
    
    // INFO NOTIFICATION: For general information messages
    info: {
        icon: 'fas fa-info-circle',
        defaultTitle: 'Informasi',
        defaultMessage: 'Ini adalah pesan informasi.',
        duration: 4000                         // Shorter duration for info
    }
};

// ============================================================================
// MAIN NOTIFICATION FUNCTION
// Function: showNotification(message, type, title, duration)
// Purpose: Display a notification with specified parameters
// Parameters:
//   - message: The notification message content
//   - type: Notification type (success, error, warning, info)
//   - title: Custom title (optional, uses default if null)
//   - duration: Custom duration in milliseconds (optional)
// Returns: DOM element of the created notification
// ============================================================================
export const showNotification = async (message, type = 'info', title = null, duration = null) => {
    // Get configuration for the specified notification type
    const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info;
    
    // Use provided title or default title from config
    const notificationTitle = title || config.defaultTitle;
    
    // Use provided duration or default duration from config
    const notificationDuration = duration || config.duration;
    
    // Create the notification DOM element
    const notification = createNotificationElement(message, type, notificationTitle, config.icon);
    
    // Get the notification container and add the new notification
    const container = getNotificationContainer();
    container.appendChild(notification);
    
    // Show notification with slide-in animation
    // Small delay to allow DOM to update before animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto-dismiss notification after specified duration
    if (notificationDuration > 0) {
        setTimeout(() => {
            removeNotification(notification);
        }, notificationDuration);
    }
    
    // Request browser notification permission and show if granted
    await requestNotificationPermission();
    if (Notification.permission === 'granted') {
        showBrowserNotification(notificationTitle, message, type);
    }
    
    // Return the notification element for further manipulation if needed
    return notification;
};

// ============================================================================
// CREATE NOTIFICATION DOM ELEMENT
// Function: createNotificationElement(message, type, title, icon)
// Purpose: Create the HTML structure for a notification
// Parameters:
//   - message: Notification message content
//   - type: Notification type for styling
//   - title: Notification title
//   - icon: FontAwesome icon class
// Returns: DOM element of the notification
// ============================================================================
function createNotificationElement(message, type, title, icon) {
    // Create main notification div element
    const notification = document.createElement('div');
    
    // Add CSS classes for styling and type
    notification.className = `notification ${type}`;
    
    // Generate unique ID for this notification
    notification.id = `notification-${++notificationCounter}`;
    
    // Build the HTML structure inside the notification
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
    
    // Add click-to-dismiss functionality
    // Click anywhere on notification (except close button) to dismiss
    notification.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-close')) {
            removeNotification(notification);
        }
    });
    
    return notification;
}

// ============================================================================
// REMOVE NOTIFICATION WITH ANIMATION
// Function: removeNotification(notification)
// Purpose: Remove notification from DOM with smooth fade-out animation
// Parameters:
//   - notification: DOM element of the notification to remove
// ============================================================================
function removeNotification(notification) {
    // Check if notification exists and is still in DOM
    if (!notification || !notification.parentNode) return;
    
    // Remove 'show' class to trigger fade-out animation
    notification.classList.remove('show');
    
    // Wait for animation to complete (300ms) before removing from DOM
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// ============================================================================
// GET OR CREATE NOTIFICATION CONTAINER
// Function: getNotificationContainer()
// Purpose: Get the container div where notifications are displayed
// Creates container if it doesn't exist
// Returns: DOM element of the notification container
// ============================================================================
function getNotificationContainer() {
    // Try to find existing notification container
    let container = document.getElementById('notificationContainer');
    
    // Create container if it doesn't exist
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        
        // Add container to body (end of document)
        document.body.appendChild(container);
    }
    
    return container;
}

// ============================================================================
// CLOSE NOTIFICATION BY ID (GLOBAL FUNCTION)
// Function: closeNotification(notificationId)
// Purpose: Global function to close specific notification by ID
// This is called from onclick attribute in the HTML
// Parameters:
//   - notificationId: ID of the notification to close
// ============================================================================
window.closeNotification = function(notificationId) {
    // Find notification by ID
    const notification = document.getElementById(notificationId);
    
    // Remove notification if found
    if (notification) {
        removeNotification(notification);
    }
};

// ============================================================================
// REQUEST NOTIFICATION PERMISSION
// Function: requestNotificationPermission()
// Purpose: Ask user for browser notification permission
// Returns: Promise that resolves to boolean (permission granted or not)
// ============================================================================
async function requestNotificationPermission() {
    // Check if browser supports notifications
    if ('Notification' in window && Notification.permission === 'default') {
        try {
            // Request permission from user
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.warn('Notification permission request failed:', error);
            return false;
        }
    }
    // Return current permission status
    return Notification.permission === 'granted';
}

// ============================================================================
// SHOW BROWSER NOTIFICATION
// Function: showBrowserNotification(title, message, type)
// Purpose: Display native browser notification (if permission granted)
// Parameters:
//   - title: Notification title
//   - message: Notification message
//   - type: Notification type for icon selection
// ============================================================================
function showBrowserNotification(title, message, type) {
    try {
        // Get configuration for notification type
        const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info;
        
        // Map notification types to emoji icons
        const iconMap = {
            success: '🟢',
            error: '🔴',
            warning: '🟡',
            info: '🔵'
        };
        
        // Create new browser notification
        const notification = new Notification(title, {
            body: message,                                          // Notification body text
            icon: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${iconMap[type] || iconMap.info}</text></svg>`, // Custom icon
            badge: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>`, // Notification badge
            tag: 'firebase-auth',                                   // Group notifications
            requireInteraction: false,                             // Allow auto-dismiss
            silent: false                                          // Play notification sound
        });
        
        // Auto-close browser notification after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);
        
        // Handle notification click - focus window and close notification
        notification.onclick = () => {
            window.focus();     // Bring browser window to front
            notification.close(); // Close the notification
        };
        
    } catch (error) {
        console.warn('Browser notification failed:', error);
    }
}

// ============================================================================
// SHOW MULTIPLE NOTIFICATIONS
// Function: showMultipleNotifications(notifications)
// Purpose: Display multiple notifications with delays between them
// Parameters:
//   - notifications: Array of notification objects with message, type, title, duration
// ============================================================================
export const showMultipleNotifications = async (notifications) => {
    // Loop through each notification in the array
    for (const notification of notifications) {
        // Show current notification
        await showNotification(
            notification.message,
            notification.type,
            notification.title,
            notification.duration
        );
        
        // Add small delay (300ms) between notifications
        await new Promise(resolve => setTimeout(resolve, 300));
    }
};

// ============================================================================
// CLEAR ALL NOTIFICATIONS
// Function: clearAllNotifications()
// Purpose: Remove all active notifications from the screen
// ============================================================================
export const clearAllNotifications = () => {
    // Get notification container
    const container = getNotificationContainer();
    
    // Find all notification elements
    const notifications = container.querySelectorAll('.notification');
    
    // Remove each notification
    notifications.forEach(notification => {
        removeNotification(notification);
    });
};

// ============================================================================
// SPECIALIZED NOTIFICATION FUNCTIONS
// Pre-configured notifications for common use cases
// ============================================================================

/**
 * Show success notification for login
 * Function: showLoginSuccess(user)
 * Purpose: Display welcome message after successful login
 * Parameters: user - Firebase user object
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
 * Show registration success notification
 * Function: showRegistrationSuccess(user)
 * Purpose: Display welcome message after successful registration
 * Parameters: user - Firebase user object
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
 * Show password reset success notification
 * Function: showPasswordResetSuccess(email)
 * Purpose: Display message after password reset email is sent
 * Parameters: email - User's email address
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
 * Show logout success notification
 * Function: showLogoutSuccess()
 * Purpose: Display goodbye message after successful logout
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
 * Show welcome notification for new users
 * Function: showWelcomeNotification(user)
 * Purpose: Display welcome message for new user accounts
 * Parameters: user - Firebase user object
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
 * Show loading notification
 * Function: showLoadingNotification(message)
 * Purpose: Display persistent notification during processing
 * Parameters: message - Loading message text (optional)
 * Returns: Notification element that can be updated/hidden later
 */
export const showLoadingNotification = async (message = 'Memproses...') => {
    const notification = await showNotification(
        message,
        'info',
        'Memproses...',
        0 // Don't auto-dismiss loading notifications
    );
    
    // Add loading spinner animation to the icon
    const icon = notification.querySelector('.notification-icon i');
    icon.className = 'fas fa-spinner fa-spin';
    
    return notification;
};

/**
 * Update loading notification message
 * Function: updateLoadingNotification(notification, message)
 * Purpose: Update the message of an existing loading notification
 * Parameters:
 *   - notification: Notification element to update
 *   - message: New message text
 */
export const updateLoadingNotification = (notification, message) => {
    // Check if notification exists and is still visible
    if (notification && notification.parentNode) {
        // Find and update the message element
        const messageElement = notification.querySelector('.notification-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
    }
};

/**
 * Hide loading notification
 * Function: hideLoadingNotification(notification)
 * Purpose: Remove a loading notification
 * Parameters: notification - Notification element to hide
 */
export const hideLoadingNotification = (notification) => {
    // Simply remove the notification
    if (notification) {
        removeNotification(notification);
    }
};

// ============================================================================
// UTILITY FUNCTIONS
// Helper functions for checking notification capabilities
// ============================================================================

/**
 * Check if notifications are supported by the browser
 * Function: isNotificationSupported()
 * Returns: Boolean indicating browser notification support
 */
export const isNotificationSupported = () => {
    return 'Notification' in window;
};

/**
 * Get current notification permission status
 * Function: getNotificationPermission()
 * Returns: String indicating permission status ('granted', 'denied', 'default', 'unsupported')
 */
export const getNotificationPermission = () => {
    // Return 'unsupported' if browser doesn't support notifications
    if (!isNotificationSupported()) {
        return 'unsupported';
    }
    // Return current permission status
    return Notification.permission;
};
