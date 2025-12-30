// Notification System
let notificationCounter = 0;

// Notification types and their configurations
const NOTIFICATION_TYPES = {
    success: {
        icon: 'fas fa-check-circle',
        defaultTitle: 'Berhasil!',
        defaultMessage: 'Operasi berhasil dilakukan.',
        duration: 5000
    },
    error: {
        icon: 'fas fa-exclamation-circle',
        defaultTitle: 'Gagal!',
        defaultMessage: 'Terjadi kesalahan saat memproses.',
        duration: 7000
    },
    warning: {
        icon: 'fas fa-exclamation-triangle',
        defaultTitle: 'Peringatan!',
        defaultMessage: 'Harap periksa kembali input Anda.',
        duration: 6000
    },
    info: {
        icon: 'fas fa-info-circle',
        defaultTitle: 'Informasi',
        defaultMessage: 'Ini adalah pesan informasi.',
        duration: 4000
    }
};

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 * @param {string} title - Custom title (optional)
 * @param {number} duration - Custom duration in milliseconds (optional)
 */
export const showNotification = async (message, type = 'info', title = null, duration = null) => {
    const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info;
    const notificationTitle = title || config.defaultTitle;
    const notificationDuration = duration || config.duration;
    
    // Create notification element
    const notification = createNotificationElement(message, type, notificationTitle, config.icon);
    
    // Add to container
    const container = getNotificationContainer();
    container.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove after duration
    if (notificationDuration > 0) {
        setTimeout(() => {
            removeNotification(notification);
        }, notificationDuration);
    }
    
    // Request browser notification permission and show
    await requestNotificationPermission();
    if (Notification.permission === 'granted') {
        showBrowserNotification(notificationTitle, message, type);
    }
    
    return notification;
};

/**
 * Create notification DOM element
 */
function createNotificationElement(message, type, title, icon) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.id = `notification-${++notificationCounter}`;
    
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
    
    // Add click to dismiss functionality
    notification.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-close')) {
            removeNotification(notification);
        }
    });
    
    return notification;
}

/**
 * Remove notification with animation
 */
function removeNotification(notification) {
    if (!notification || !notification.parentNode) return;
    
    notification.classList.remove('show');
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

/**
 * Get or create notification container
 */
function getNotificationContainer() {
    let container = document.getElementById('notificationContainer');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    return container;
}

/**
 * Close notification by ID
 */
window.closeNotification = function(notificationId) {
    const notification = document.getElementById(notificationId);
    if (notification) {
        removeNotification(notification);
    }
};

/**
 * Request notification permission
 */
async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.warn('Notification permission request failed:', error);
            return false;
        }
    }
    return Notification.permission === 'granted';
}

/**
 * Show browser notification
 */
function showBrowserNotification(title, message, type) {
    try {
        const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info;
        const iconMap = {
            success: '🟢',
            error: '🔴',
            warning: '🟡',
            info: '🔵'
        };
        
        const notification = new Notification(title, {
            body: message,
            icon: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${iconMap[type] || iconMap.info}</text></svg>`,
            badge: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>`,
            tag: 'firebase-auth',
            requireInteraction: false,
            silent: false
        });
        
        // Auto close after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);
        
        // Handle notification click
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        
    } catch (error) {
        console.warn('Browser notification failed:', error);
    }
}

/**
 * Show multiple notifications
 */
export const showMultipleNotifications = async (notifications) => {
    for (const notification of notifications) {
        await showNotification(
            notification.message,
            notification.type,
            notification.title,
            notification.duration
        );
        // Add small delay between notifications
        await new Promise(resolve => setTimeout(resolve, 300));
    }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = () => {
    const container = getNotificationContainer();
    const notifications = container.querySelectorAll('.notification');
    
    notifications.forEach(notification => {
        removeNotification(notification);
    });
};

/**
 * Show success notification for login
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
 */
export const showLoadingNotification = async (message = 'Memproses...') => {
    const notification = await showNotification(
        message,
        'info',
        'Memproses...',
        0 // Don't auto-dismiss loading notifications
    );
    
    // Add loading spinner
    const icon = notification.querySelector('.notification-icon i');
    icon.className = 'fas fa-spinner fa-spin';
    
    return notification;
};

/**
 * Update loading notification
 */
export const updateLoadingNotification = (notification, message) => {
    if (notification && notification.parentNode) {
        const messageElement = notification.querySelector('.notification-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
    }
};

/**
 * Hide loading notification
 */
export const hideLoadingNotification = (notification) => {
    if (notification) {
        removeNotification(notification);
    }
};

// Utility function to check if notifications are supported
export const isNotificationSupported = () => {
    return 'Notification' in window;
};

// Utility function to get notification permission status
export const getNotificationPermission = () => {
    if (!isNotificationSupported()) {
        return 'unsupported';
    }
    return Notification.permission;
};
