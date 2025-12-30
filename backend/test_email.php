<?php
// ============================================================================
// EMAIL SYSTEM TESTING INTERFACE
// File: backend/test_email.php
// Description: Testing interface for email notification system
// Purpose: Allow testing and validation of email functionality
// Features: Web form interface, AJAX testing, Email logging, Error handling
// ============================================================================

// ============================================================================
// HTTP HEADERS
// Set headers for proper response handling and CORS support
// ============================================================================

// Set response content type to JSON for API responses
header('Content-Type: application/json');

// ============================================================================
// DEPENDENCY INCLUDES
// Include configuration file for email settings
// ============================================================================

// Load email configuration settings from config.php
require_once 'config.php';

// ============================================================================
// TEST EMAIL HANDLER
// Process test email requests via URL parameters
// ============================================================================

// Check if this is a test request (via URL parameter)
// Usage: test_email.php?test=email@example.com
if (isset($_GET['test'])) {
    
    // Get test email from URL parameter, or use default
    // Default: qtonnnn@gmail.com (as specified in requirements)
    $testEmail = $_GET['test'] ?? 'qtonnnn@gmail.com';
    
    // ============================================================================
    // PREPARE TEST DATA
    // Create sample email data for testing
    // ============================================================================
    
    // Define test email parameters
    $testData = [
        'email' => $testEmail,                                      // Test recipient email
        'type' => 'login_success',                                  // Test notification type
        'message' => 'Ini adalah email test dari sistem Firebase Login. Dikirim pada ' . date('Y-m-d H:i:s'), // Test message with timestamp
        'subject' => '🧪 Test Email - Firebase Login System'        // Test email subject
    ];
    
    // ============================================================================
    // SECURITY CHECK
    // Prevent actual email sending during testing for security
    // ============================================================================
    
    // Check if email sending is enabled but logging is disabled
    // This prevents accidental spam during testing
    if (ENABLE_EMAIL && !LOG_EMAIL) {
        echo json_encode([
            'success' => false,
            'message' => 'Email sending disabled for security. Please configure SMTP settings first.'
        ]);
    } else {
        
        // ============================================================================
        // LOG TEST EMAIL
        // Log test email activity instead of sending actual emails
        // ============================================================================
        
        // Create log entry with timestamp and test details
        $logEntry = "[" . date('Y-m-d H:i:s') . "] Test email to: {$testEmail}\n";
        $logEntry .= "Type: {$testData['type']}\n";
        $logEntry .= "Message: {$testData['message']}\n";
        $logEntry .= "Subject: {$testData['subject']}\n";
        $logEntry .= "IP: {$_SERVER['REMOTE_ADDR']}\n";
        $logEntry .= "User-Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown') . "\n";
        $logEntry .= "----------------------------------------\n";
        
        // Append log entry to file with proper locking
        file_put_contents(LOG_FILE, $logEntry, FILE_APPEND | LOCK_EX);
        
        // Return success response with test data
        echo json_encode([
            'success' => true,
            'message' => 'Test email logged successfully',
            'data' => $testData,
            'note' => 'Configure SMTP settings in config.php to enable actual email sending',
            'timestamp' => date('Y-m-d H:i:s'),
            'log_file' => LOG_FILE
        ]);
    }
    
} else {
    // ============================================================================
    // DISPLAY TEST FORM
    // Show HTML interface for testing email functionality
    // ============================================================================
    ?>
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <!-- Basic HTML meta tags -->
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
        <!-- Page title -->
        <title>Test Email - Firebase Login System</title>
        
        <!-- CSS Styles for the test interface -->
        <style>
            /* Base styles for body and layout */
            body { 
                font-family: Arial, sans-serif; 
                max-width: 600px; 
                margin: 50px auto; 
                padding: 20px; 
                background-color: #f8f9fa;
                line-height: 1.6;
            }
            
            /* Container for the test form */
            .container { 
                background: white; 
                padding: 30px; 
                border-radius: 10px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            /* Form group styling */
            .form-group { 
                margin-bottom: 20px; 
            }
            
            /* Label styling */
            label { 
                display: block; 
                margin-bottom: 5px; 
                font-weight: bold; 
                color: #333;
            }
            
            /* Input field styling */
            input, select, textarea, button { 
                width: 100%; 
                padding: 12px; 
                border: 1px solid #ddd; 
                border-radius: 5px; 
                font-size: 14px;
                box-sizing: border-box;
            }
            
            /* Input field focus state */
            input:focus, select:focus, textarea:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
            }
            
            /* Button styling */
            button { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                border: none; 
                cursor: pointer; 
                font-weight: bold;
                transition: all 0.3s ease;
            }
            
            /* Button hover state */
            button:hover { 
                background: linear-gradient(135deg, #764ba2 0%, #667eea 100%); 
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            
            /* Button disabled state */
            button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            
            /* Result display styling */
            .result { 
                margin-top: 20px; 
                padding: 15px; 
                border-radius: 5px; 
                display: none;
            }
            
            /* Success message styling */
            .success { 
                background: #d4edda; 
                color: #155724; 
                border: 1px solid #c3e6cb; 
            }
            
            /* Error message styling */
            .error { 
                background: #f8d7da; 
                color: #721c24; 
                border: 1px solid #f5c6cb; 
            }
            
            /* Loading indicator */
            .loading {
                background: #cce7ff;
                color: #004085;
                border: 1px solid #99d1ff;
            }
            
            /* Header styling */
            h1 {
                color: #333;
                text-align: center;
                margin-bottom: 10px;
            }
            
            /* Subtitle styling */
            .subtitle {
                text-align: center;
                color: #666;
                margin-bottom: 30px;
                font-style: italic;
            }
            
            /* Configuration info box */
            .config-info {
                background: #e7f3ff;
                border: 1px solid #b3d9ff;
                border-radius: 5px;
                padding: 15px;
                margin-bottom: 20px;
            }
            
            .config-info h3 {
                margin-top: 0;
                color: #0066cc;
            }
            
            /* Status indicator */
            .status-indicator {
                display: inline-block;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                margin-right: 8px;
            }
            
            .status-enabled { background-color: #28a745; }
            .status-disabled { background-color: #dc3545; }
        </style>
    </head>
    <body>
        <!-- Main container -->
        <div class="container">
            <!-- Page header -->
            <h1>🧪 Test Email System</h1>
            <p class="subtitle">Testing interface untuk sistem email Firebase Login</p>
            
            <!-- Configuration status info -->
            <div class="config-info">
                <h3>📊 Status Konfigurasi</h3>
                <p>
                    <span class="status-indicator <?php echo ENABLE_EMAIL ? 'status-enabled' : 'status-disabled'; ?>"></span>
                    <strong>Email Sending:</strong> <?php echo ENABLE_EMAIL ? 'Enabled' : 'Disabled'; ?>
                </p>
                <p>
                    <span class="status-indicator <?php echo LOG_EMAIL ? 'status-enabled' : 'status-disabled'; ?>"></span>
                    <strong>Email Logging:</strong> <?php echo LOG_EMAIL ? 'Enabled' : 'Disabled'; ?>
                </p>
                <p>
                    <span class="status-indicator status-enabled"></span>
                    <strong>SMTP Host:</strong> <?php echo SMTP_HOST; ?>:<?php echo SMTP_PORT; ?>
                </p>
                <p>
                    <span class="status-indicator status-enabled"></span>
                    <strong>From Email:</strong> <?php echo SMTP_FROM_EMAIL; ?>
                </p>
            </div>
            
            <!-- Test form -->
            <form id="testForm">
                <!-- Email input field -->
                <div class="form-group">
                    <label for="email">📧 Email Tujuan:</label>
                    <input type="email" 
                           id="email" 
                           name="email" 
                           value="qtonnnn@gmail.com" 
                           placeholder="email@example.com"
                           required>
                    <small style="color: #666;">Email yang akan menerima test notification</small>
                </div>
                
                <!-- Notification type selection -->
                <div class="form-group">
                    <label for="type">🔔 Jenis Notifikasi:</label>
                    <select id="type" name="type">
                        <option value="login_success">🎉 Login Berhasil</option>
                        <option value="registration_success">👋 Pendaftaran Berhasil</option>
                        <option value="password_reset">🔐 Reset Password</option>
                        <option value="security_alert">⚠️ Alert Keamanan</option>
                        <option value="logout_success">👋 Logout Berhasil</option>
                        <option value="info">ℹ️ Info Umum</option>
                    </select>
                    <small style="color: #666;">Pilih jenis notification untuk testing</small>
                </div>
                
                <!-- Custom message input -->
                <div class="form-group">
                    <label for="message">💬 Pesan:</label>
                    <textarea id="message" 
                              name="message" 
                              rows="4" 
                              placeholder="Masukkan pesan custom..."
                              required>Ini adalah test email dari sistem Firebase Login. Dikirim pada <?php echo date('Y-m-d H:i:s'); ?>.</textarea>
                    <small style="color: #666;">Pesan yang akan dikirim dalam email</small>
                </div>
                
                <!-- Submit button -->
                <button type="submit" id="submitBtn">
                    🚀 Kirim Test Email
                </button>
            </form>
            
            <!-- Result display area -->
            <div id="result"></div>
        </div>

        <!-- JavaScript for form handling -->
        <script>
            // ============================================================================
            // FORM EVENT LISTENER
            // Handle form submission and AJAX request
            // ============================================================================
            
            document.getElementById('testForm').addEventListener('submit', async function(e) {
                // Prevent default form submission
                e.preventDefault();
                
                // Get form data
                const formData = new FormData(this);
                
                // Prepare email data for API request
                const emailData = {
                    email: formData.get('email'),                    // Recipient email
                    type: formData.get('type'),                      // Notification type
                    message: formData.get('message'),                // Email message
                    subject: '🧪 Test Email dari Firebase Login System' // Email subject
                };
                
                // Get result display element
                const resultDiv = document.getElementById('result');
                const submitBtn = document.getElementById('submitBtn');
                
                // Show loading state
                resultDiv.style.display = 'block';
                resultDiv.className = 'result loading';
                resultDiv.innerHTML = `
                    <h3>⏳ Mengirim Email Test...</h3>
                    <p>Sedang memproses request ke server PHP...</p>
                    <p><strong>Email:</strong> ${emailData.email}</p>
                    <p><strong>Type:</strong> ${emailData.type}</p>
                `;
                
                // Disable submit button during request
                submitBtn.disabled = true;
                submitBtn.textContent = 'Mengirim...';
                
                try {
                    // ============================================================================
                    // AJAX REQUEST TO BACKEND
                    // Send test email via PHP backend
                    // ============================================================================
                    
                    const response = await fetch('send_notification.php', {
                        method: 'POST',                              // HTTP POST method
                        headers: {
                            'Content-Type': 'application/json',      // JSON content type
                        },
                        body: JSON.stringify(emailData)              // Send data as JSON
                    });
                    
                    // Parse JSON response
                    const result = await response.json();
                    
                    // Check if request was successful
                    if (result.success) {
                        // Show success message
                        resultDiv.className = 'result success';
                        resultDiv.innerHTML = `
                            <h3>✅ Email Test Berhasil!</h3>
                            <p><strong>Status:</strong> ${result.message}</p>
                            <p><strong>Email Tujuan:</strong> ${emailData.email}</p>
                            <p><strong>Jenis:</strong> ${emailData.type}</p>
                            <p><strong>Waktu:</strong> ${new Date().toLocaleString('id-ID')}</p>
                            ${result.note ? `<p><em>📝 Catatan: ${result.note}</em></p>` : ''}
                            ${result.data ? `
                                <details>
                                    <summary>📋 Detail Data</summary>
                                    <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(result.data, null, 2)}</pre>
                                </details>
                            ` : ''}
                        `;
                    } else {
                        // Show error message
                        resultDiv.className = 'result error';
                        resultDiv.innerHTML = `
                            <h3>❌ Email Test Gagal</h3>
                            <p><strong>Error:</strong> ${result.message}</p>
                            <p><strong>Kemungkinan Penyebab:</strong></p>
                            <ul>
                                <li>SMTP configuration belum diset di config.php</li>
                                <li>Network connectivity issue</li>
                                <li>Server PHP error</li>
                                <li>Email service provider blocking</li>
                            </ul>
                            <p><strong>Solusi:</strong></p>
                            <ol>
                                <li>Periksa konfigurasi SMTP di config.php</li>
                                <li>Pastikan Gmail App Password sudah benar</li>
                                <li>Check log file untuk detail error</li>
                                <li>Test dengan email berbeda</li>
                            </ol>
                        `;
                    }
                } catch (error) {
                    // Handle network or JavaScript errors
                    resultDiv.className = 'result error';
                    resultDiv.innerHTML = `
                        <h3>❌ Network Error</h3>
                        <p><strong>Error:</strong> ${error.message}</p>
                        <p><strong>Kemungkinan Penyebab:</strong></p>
                        <ul>
                            <li>Server PHP tidak berjalan</li>
                            <li>JavaScript fetch API tidak supported</li>
                            <li>CORS policy blocking request</li>
                            <li>Network connectivity issue</li>
                        </ul>
                        <p><strong>Solusi:</strong></p>
                        <ol>
                            <li>Pastikan Apache/XAMPP sudah running</li>
                            <li>Check console browser untuk JavaScript error</li>
                            <li>Test dengan URL langsung: http://localhost/CRD/backend/send_notification.php</li>
                        </ol>
                    `;
                } finally {
                    // Re-enable submit button
                    submitBtn.disabled = false;
                    submitBtn.textContent = '🚀 Kirim Test Email';
                }
            });
            
            // ============================================================================
            // FORM ENHANCEMENTS
            // Add extra functionality to improve user experience
            // ============================================================================
            
            // Auto-update timestamp in message field
            const messageField = document.getElementById('message');
            const emailField = document.getElementById('email');
            
            // Update timestamp every minute
            setInterval(() => {
                const now = new Date().toLocaleString('id-ID');
                if (messageField.value.includes('Dikirim pada')) {
                    messageField.value = messageField.value.replace(
                        /Dikirim pada [\d\-\s:]+/,
                        `Dikirim pada ${now}`
                    );
                }
            }, 60000); // Update every minute
            
            // Auto-fill email from type selection
            document.getElementById('type').addEventListener('change', function() {
                const type = this.value;
                let suggestion = 'qtonnnn@gmail.com'; // Default
                
                // Suggest different emails based on type (optional)
                if (type === 'security_alert') {
                    suggestion = 'admin@domain.com'; // Security alerts to admin
                } else if (type === 'registration_success') {
                    suggestion = 'newuser@example.com'; // Test with different email
                }
                
                // Only update if field is empty or contains default
                if (!emailField.value || emailField.value === 'qtonnnn@gmail.com') {
                    emailField.value = suggestion;
                }
            });
            
            // Character counter for message field
            messageField.addEventListener('input', function() {
                const length = this.value.length;
                const maxLength = 500;
                
                // Add or update character counter
                let counter = document.getElementById('charCounter');
                if (!counter) {
                    counter = document.createElement('small');
                    counter.id = 'charCounter';
                    counter.style.color = '#666';
                    this.parentNode.appendChild(counter);
                }
                
                counter.textContent = `${length}/${maxLength} karakter`;
                
                // Change color based on length
                if (length > maxLength * 0.9) {
                    counter.style.color = '#dc3545'; // Red for near limit
                } else if (length > maxLength * 0.7) {
                    counter.style.color = '#ffc107'; // Yellow for warning
                } else {
                    counter.style.color = '#666'; // Normal color
                }
            });
            
            // Form validation enhancement
            function validateForm() {
                const email = emailField.value;
                const message = messageField.value.trim();
                const type = document.getElementById('type').value;
                
                let isValid = true;
                let errors = [];
                
                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    errors.push('Format email tidak valid');
                    isValid = false;
                }
                
                // Message validation
                if (message.length < 10) {
                    errors.push('Pesan terlalu pendek (minimal 10 karakter)');
                    isValid = false;
                }
                
                if (message.length > 500) {
                    errors.push('Pesan terlalu panjang (maksimal 500 karakter)');
                    isValid = false;
                }
                
                // Show validation errors
                let errorDiv = document.getElementById('validationErrors');
                if (errors.length > 0) {
                    if (!errorDiv) {
                        errorDiv = document.createElement('div');
                        errorDiv.id = 'validationErrors';
                        errorDiv.className = 'result error';
                        document.getElementById('testForm').parentNode.insertBefore(errorDiv, document.getElementById('testForm').nextSibling);
                    }
                    errorDiv.innerHTML = `
                        <h3>❌ Validasi Error</h3>
                        <ul>${errors.map(error => `<li>${error}</li>`).join('')}</ul>
                    `;
                    errorDiv.style.display = 'block';
                } else if (errorDiv) {
                    errorDiv.style.display = 'none';
                }
                
                return isValid;
            }
            
            // Add validation on form submission
            document.getElementById('testForm').addEventListener('submit', function(e) {
                if (!validateForm()) {
                    e.preventDefault();
                }
            });
        </script>
    </body>
    </html>
    <?php
}
?>
