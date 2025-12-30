<?php
// Test email functionality
header('Content-Type: application/json');

require_once 'config.php';

if (isset($_GET['test'])) {
    $testEmail = $_GET['test'] ?? 'qtonnnn@gmail.com';
    
    // Test data
    $testData = [
        'email' => $testEmail,
        'type' => 'login_success',
        'message' => 'Ini adalah email test dari sistem Firebase Login. Dikirim pada ' . date('Y-m-d H:i:s'),
        'subject' => '🧪 Test Email - Firebase Login System'
    ];
    
    // Simulate sending email (without actually sending for security)
    if (ENABLE_EMAIL && !LOG_EMAIL) {
        echo json_encode([
            'success' => false,
            'message' => 'Email sending disabled for security. Please configure SMTP settings first.'
        ]);
    } else {
        // Log the test email
        $logEntry = "[" . date('Y-m-d H:i:s') . "] Test email to: {$testEmail}\n";
        file_put_contents(LOG_FILE, $logEntry, FILE_APPEND | LOCK_EX);
        
        echo json_encode([
            'success' => true,
            'message' => 'Test email logged successfully',
            'data' => $testData,
            'note' => 'Configure SMTP settings in config.php to enable actual email sending'
        ]);
    }
} else {
    // Show test form
    ?>
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Email - Firebase Login System</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .container { background: #f5f5f5; padding: 30px; border-radius: 10px; }
            .form-group { margin-bottom: 20px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input, select, button { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
            button { background: #667eea; color: white; border: none; cursor: pointer; }
            button:hover { background: #764ba2; }
            .result { margin-top: 20px; padding: 15px; border-radius: 5px; }
            .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🧪 Test Email System</h1>
            <p>Test sistem email untuk Firebase Login System</p>
            
            <form id="testForm">
                <div class="form-group">
                    <label for="email">Email Tujuan:</label>
                    <input type="email" id="email" name="email" value="qtonnnn@gmail.com" required>
                </div>
                
                <div class="form-group">
                    <label for="type">Jenis Notifikasi:</label>
                    <select id="type" name="type">
                        <option value="login_success">Login Berhasil</option>
                        <option value="registration_success">Pendaftaran Berhasil</option>
                        <option value="password_reset">Reset Password</option>
                        <option value="security_alert">Alert Keamanan</option>
                        <option value="logout_success">Logout Berhasil</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="message">Pesan:</label>
                    <textarea id="message" name="message" rows="4" placeholder="Masukkan pesan...">Ini adalah test email dari sistem Firebase Login.</textarea>
                </div>
                
                <button type="submit">🚀 Kirim Test Email</button>
            </form>
            
            <div id="result" style="display: none;"></div>
        </div>

        <script>
            document.getElementById('testForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const data = {
                    email: formData.get('email'),
                    type: formData.get('type'),
                    message: formData.get('message'),
                    subject: 'Test Email dari Firebase Login System'
                };
                
                const resultDiv = document.getElementById('result');
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = '<p>Mengirim email test...</p>';
                
                try {
                    const response = await fetch('send_notification.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        resultDiv.className = 'result success';
                        resultDiv.innerHTML = `
                            <h3>✅ Email Test Berhasil!</h3>
                            <p><strong>Pesan:</strong> ${result.message}</p>
                            <p><strong>Email:</strong> ${data.email}</p>
                            <p><strong>Waktu:</strong> ${new Date().toLocaleString('id-ID')}</p>
                            <p><em>Catatan: ${result.note || 'Email berhasil dikirim'}</em></p>
                        `;
                    } else {
                        resultDiv.className = 'result error';
                        resultDiv.innerHTML = `
                            <h3>❌ Email Test Gagal</h3>
                            <p><strong>Error:</strong> ${result.message}</p>
                            <p>Periksa konfigurasi SMTP di config.php</p>
                        `;
                    }
                } catch (error) {
                    resultDiv.className = 'result error';
                    resultDiv.innerHTML = `
                        <h3>❌ Error</h3>
                        <p><strong>Network Error:</strong> ${error.message}</p>
                        <p>Pastikan server PHP berjalan dengan benar</p>
                    `;
                }
            });
        </script>
    </body>
    </html>
    <?php
}
?>
