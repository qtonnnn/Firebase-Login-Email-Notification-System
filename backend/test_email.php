<?php
// ============================================================================
// ANTARMUKA TESTING SISTEM EMAIL
// File: backend/test_email.php
// Description: Antarmuka testing untuk sistem notifikasi email
// Tujuan: Memungkinkan testing dan validasi fungsionalitas email
// Features: Antarmuka form web, AJAX testing, Email logging, Error handling
// ============================================================================

// ============================================================================
// HEADER HTTP
// Set header untuk penanganan response yang tepat dan dukungan CORS
// ============================================================================

// Set response content type ke JSON untuk API responses
header('Content-Type: application/json');

// ============================================================================
// INCLUDES DEPENDENCY
// Include file konfigurasi untuk pengaturan email
// ============================================================================

// Muat pengaturan konfigurasi email dari config.php
require_once 'config.php';

// ============================================================================
// PENANGAN TEST EMAIL
// Process request test email via parameter URL
// ============================================================================

// Periksa apakah ini request test (via parameter URL)
// Usage: test_email.php?test=email@example.com
if (isset($_GET['test'])) {
    
    // Dapatkan test email dari parameter URL, atau gunakan default
    // Default: qtonnnn@gmail.com (seperti yang ditetapkan dalam requirements)
    $testEmail = $_GET['test'] ?? 'qtonnnn@gmail.com';
    
    // ============================================================================
    // SIAPKAN DATA TEST
    // Buat data email sample untuk testing
    // ============================================================================
    
    // Definisikan parameter email test
    $testData = [
        'email' => $testEmail,                                      // Email penerima test
        'type' => 'login_success',                                  // Jenis notifikasi test
        'message' => 'Ini adalah email test dari sistem Firebase Login. Dikirim pada ' . date('Y-m-d H:i:s'), // Pesan test dengan timestamp
        'subject' => '🧪 Test Email - Firebase Login System'        // Subjek email test
    ];
    
    // ============================================================================
    // PERIKSA KEAMANAN
    // Cegah pengiriman email aktual selama testing untuk keamanan
    // ============================================================================
    
    // Periksa apakah pengiriman email diaktifkan tetapi logging dinonaktifkan
    // Ini mencegah spam accidental selama testing
    if (ENABLE_EMAIL && !LOG_EMAIL) {
        echo json_encode([
            'success' => false,
            'message' => 'Email sending disabled for security. Please configure SMTP settings first.'
        ]);
    } else {
        
        // ============================================================================
        // LOG TEST EMAIL
        // Log aktivitas email test sebagai ganti pengiriman email aktual
        // ============================================================================
        
        // Buat entri log dengan timestamp dan detail test
        $logEntry = "[" . date('Y-m-d H:i:s') . "] Test email to: {$testEmail}\n";
        $logEntry .= "Type: {$testData['type']}\n";
        $logEntry .= "Message: {$testData['message']}\n";
        $logEntry .= "Subject: {$testData['subject']}\n";
        $logEntry .= "IP: {$_SERVER['REMOTE_ADDR']}\n";
        $logEntry .= "User-Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown') . "\n";
        $logEntry .= "----------------------------------------\n";
        
        // Append entri log ke file dengan locking yang tepat
        file_put_contents(LOG_FILE, $logEntry, FILE_APPEND | LOCK_EX);
        
        // Kembalikan response sukses dengan data test
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
    // TAMPILKAN FORM TEST
    // Tampilkan antarmuka HTML untuk testing fungsionalitas email
    // ============================================================================
    ?>
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <!-- Tag meta HTML dasar -->
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
        <!-- Judul halaman -->
        <title>Test Email - Firebase Login System</title>
        
        <!-- CSS Styles untuk antarmuka test -->
        <style>
            /* Gaya dasar untuk body dan layout */
            body { 
                font-family: Arial, sans-serif; 
                max-width: 600px; 
                margin: 50px auto; 
                padding: 20px; 
                background-color: #f8f9fa;
                line-height: 1.6;
            }
            
            /* Container untuk form test */
            .container { 
                background: white; 
                padding: 30px; 
                border-radius: 10px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            /* Gaya form group */
            .form-group { 
                margin-bottom: 20px; 
            }
            
            /* Gaya label */
            label { 
                display: block; 
                margin-bottom: 5px; 
                font-weight: bold; 
                color: #333;
            }
            
            /* Gaya input field */
            input, select, textarea, button { 
                width: 100%; 
                padding: 12px; 
                border: 1px solid #ddd; 
                border-radius: 5px; 
                font-size: 14px;
                box-sizing: border-box;
            }
            
            /* State fokus input field */
            input:focus, select:focus, textarea:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
            }
            
            /* Gaya tombol */
            button { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                border: none; 
                cursor: pointer; 
                font-weight: bold;
                transition: all 0.3s ease;
            }
            
            /* State hover tombol */
            button:hover { 
                background: linear-gradient(135deg, #764ba2 0%, #667eea 100%); 
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            
            /* State disabled tombol */
            button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            
            /* Gaya display result */
            .result { 
                margin-top: 20px; 
                padding: 15px; 
                border-radius: 5px; 
                display: none;
            }
            
            /* Gaya pesan sukses */
            .success { 
                background: #d4edda; 
                color: #155724; 
                border: 1px solid #c3e6cb; 
            }
            
            /* Gaya pesan error */
            .error { 
                background: #f8d7da; 
                color: #721c24; 
                border: 1px solid #f5c6cb; 
            }
            
            /* Indikator loading */
            .loading {
                background: #cce7ff;
                color: #004085;
                border: 1px solid #99d1ff;
            }
            
            /* Gaya header */
            h1 {
                color: #333;
                text-align: center;
                margin-bottom: 10px;
            }
            
            /* Gaya subtitle */
            .subtitle {
                text-align: center;
                color: #666;
                margin-bottom: 30px;
                font-style: italic;
            }
            
            /* Kotak info konfigurasi */
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
            
            /* Indikator status */
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
        <!-- Container utama -->
        <div class="container">
            <!-- Header halaman -->
            <h1>🧪 Test Email System</h1>
            <p class="subtitle">Antarmuka testing untuk sistem email Firebase Login</p>
            
            <!-- Info status konfigurasi -->
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
            
            <!-- Form test -->
            <form id="testForm">
                <!-- Field input email -->
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
                
                <!-- Pemilihan jenis notifikasi -->
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
                
                <!-- Input pesan custom -->
                <div class="form-group">
                    <label for="message">💬 Pesan:</label>
                    <textarea id="message" 
                              name="message" 
                              rows="4" 
                              placeholder="Masukkan pesan custom..."
                              required>Ini adalah test email dari sistem Firebase Login. Dikirim pada <?php echo date('Y-m-d H:i:s'); ?>.</textarea>
                    <small style="color: #666;">Pesan yang akan dikirim dalam email</small>
                </div>
                
                <!-- Tombol submit -->
                <button type="submit" id="submitBtn">
                    🚀 Kirim Test Email
                </button>
            </form>
            
            <!-- Area display result -->
            <div id="result"></div>
        </div>

        <!-- JavaScript untuk penanganan form -->
        <script>
            // ============================================================================
            // EVENT LISTENER FORM
            // Handle form submission dan request AJAX
            // ============================================================================
            
            document.getElementById('testForm').addEventListener('submit', async function(e) {
                // Mencegah default form submission
                e.preventDefault();
                
                // Dapatkan data form
                const formData = new FormData(this);
                
                // Siapkan data email untuk request API
                const emailData = {
                    email: formData.get('email'),                    // Email penerima
                    type: formData.get('type'),                      // Jenis notifikasi
                    message: formData.get('message'),                // Pesan email
                    subject: '🧪 Test Email dari Firebase Login System' // Subjek email
                };
                
                // Dapatkan elemen display result
                const resultDiv = document.getElementById('result');
                const submitBtn = document.getElementById('submitBtn');
                
                // Tampilkan state loading
                resultDiv.style.display = 'block';
                resultDiv.className = 'result loading';
                resultDiv.innerHTML = `
                    <h3>⏳ Mengirim Email Test...</h3>
                    <p>Sedang memproses request ke server PHP...</p>
                    <p><strong>Email:</strong> ${emailData.email}</p>
                    <p><strong>Type:</strong> ${emailData.type}</p>
                `;
                
                // Nonaktifkan tombol submit selama request
                submitBtn.disabled = true;
                submitBtn.textContent = 'Mengirim...';
                
                try {
                    // ============================================================================
                    // REQUEST AJAX KE BACKEND
                    // Kirim test email via backend PHP
                    // ============================================================================
                    
                    const response = await fetch('send_notification.php', {
                        method: 'POST',                              // Metode HTTP POST
                        headers: {
                            'Content-Type': 'application/json',      // Content type JSON
                        },
                        body: JSON.stringify(emailData)              // Kirim data sebagai JSON
                    });
                    
                    // Parse response JSON
                    const result = await response.json();
                    
                    // Periksa apakah request berhasil
                    if (result.success) {
                        // Tampilkan pesan sukses
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
                        // Tampilkan pesan error
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
                    // Handle network atau JavaScript errors
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
                    // Re-enable tombol submit
                    submitBtn.disabled = false;
                    submitBtn.textContent = '🚀 Kirim Test Email';
                }
            });
            
            // ============================================================================
            // ENHANCEMENT FORM
            // Tambahkan fungsionalitas ekstra untuk meningkatkan pengalaman pengguna
            // ============================================================================
            
            // Auto-update timestamp di field message
            const messageField = document.getElementById('message');
            const emailField = document.getElementById('email');
            
            // Update timestamp setiap menit
            setInterval(() => {
                const now = new Date().toLocaleString('id-ID');
                if (messageField.value.includes('Dikirim pada')) {
                    messageField.value = messageField.value.replace(
                        /Dikirim pada [\d\-\s:]+/,
                        `Dikirim pada ${now}`
                    );
                }
            }, 60000); // Update setiap menit
            
            // Auto-fill email dari pemilihan type
            document.getElementById('type').addEventListener('change', function() {
                const type = this.value;
                let suggestion = 'qtonnnn@gmail.com'; // Default
                
                // Sarankan email berbeda berdasarkan type (opsional)
                if (type === 'security_alert') {
                    suggestion = 'admin@domain.com'; // Security alerts ke admin
                } else if (type === 'registration_success') {
                    suggestion = 'newuser@example.com'; // Test dengan email berbeda
                }
                
                // Hanya update jika field kosong atau berisi default
                if (!emailField.value || emailField.value === 'qtonnnn@gmail.com') {
                    emailField.value = suggestion;
                }
            });
            
            // Character counter untuk field message
            messageField.addEventListener('input', function() {
                const length = this.value.length;
                const maxLength = 500;
                
                // Tambahkan atau update character counter
                let counter = document.getElementById('charCounter');
                if (!counter) {
                    counter = document.createElement('small');
                    counter.id = 'charCounter';
                    counter.style.color = '#666';
                    this.parentNode.appendChild(counter);
                }
                
                counter.textContent = `${length}/${maxLength} karakter`;
                
                // Ubah warna berdasarkan panjang
                if (length > maxLength * 0.9) {
                    counter.style.color = '#dc3545'; // Merah untuk near limit
                } else if (length > maxLength * 0.7) {
                    counter.style.color = '#ffc107'; // Kuning untuk warning
                } else {
                    counter.style.color = '#666'; // Warna normal
                }
            });
            
            // Enhancement validasi form
            function validateForm() {
                const email = emailField.value;
                const message = messageField.value.trim();
                const type = document.getElementById('type').value;
                
                let isValid = true;
                let errors = [];
                
                // Validasi email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    errors.push('Format email tidak valid');
                    isValid = false;
                }
                
                // Validasi pesan
                if (message.length < 10) {
                    errors.push('Pesan terlalu pendek (minimal 10 karakter)');
                    isValid = false;
                }
                
                if (message.length > 500) {
                    errors.push('Pesan terlalu panjang (maksimal 500 karakter)');
                    isValid = false;
                }
                
                // Tampilkan validation errors
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
            
            // Tambahkan validasi pada form submission
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
