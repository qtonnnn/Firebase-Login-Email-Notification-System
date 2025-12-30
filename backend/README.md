# Backend Email System - Firebase Login

Sistem email notification backend menggunakan PHP dan PHPMailer untuk mengirim notifikasi otomatis ke qtonnnn@gmail.com.

## 📧 Sistem Email Overview

Backend ini menangani pengiriman email untuk semua aktivitas Firebase Authentication:
- **Login notifications** ke user + BCC ke qtonnnn@gmail.com
- **Registration confirmations** dengan template profesional
- **Password reset** instructions
- **Security alerts** untuk aktivitas mencurigakan
- **Logout confirmations**

## 🗂️ Struktur Backend

```
backend/
├── send_notification.php    # Main email sender API
├── config.php              # SMTP & email configuration
├── composer.json           # PHPMailer dependencies
├── test_email.php          # Email testing interface
└── README.md              # File ini
```

## 🚀 Setup & Installation

### 1. Install PHP Dependencies
```bash
# Navigate to backend directory
cd backend

# Install PHPMailer
composer install
```

### 2. Configure Email Settings
Edit file `config.php`:

```php
// SMTP Configuration
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@gmail.com');
define('SMTP_PASSWORD', 'your-app-password');
define('SMTP_FROM_EMAIL', 'your-email@gmail.com');
define('SMTP_FROM_NAME', 'Firebase Login System');

// Enable email sending
define('ENABLE_EMAIL', true);
define('LOG_EMAIL', false); // Set true untuk log instead of send
```

### 3. Gmail App Password Setup

**Langkah-langkah:**
1. Login ke Gmail account Anda
2. Buka [Google Account Settings](https://myaccount.google.com/)
3. Masuk ke **Security** → **2-Step Verification**
4. Enable 2-Step Verification (jika belum aktif)
5. Pilih **App passwords**
6. Select **Mail** dan **Other (custom name)**
7. Masukkan nama: "Firebase Login System"
8. Copy app password yang digenerate
9. Paste app password ke `config.php`

**⚠️ Penting:** 
- App password berbeda dari regular password
- Jangan share app password
- Setiap app password dapat dicabut secara terpisah

## 📡 API Endpoints

### 1. Send Notification
**Endpoint:** `POST /send_notification.php`

**Request Body:**
```json
{
    "email": "user@example.com",
    "type": "login_success",
    "message": "Login berhasil pada 2024-01-01 12:00:00",
    "subject": "Login Berhasil - Firebase Login System"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Email notifikasi berhasil dikirim"
}
```

### 2. Test Email Interface
**URL:** `/test_email.php`

Interface web untuk testing sistem email dengan form yang mudah digunakan.

## 🎨 Email Templates

### Template Types

#### 1. Login Success
- **Icon:** 🎉
- **Color:** Green gradient (#10b981 → #059669)
- **Content:** Welcome message dengan waktu login
- **Recipients:** User + BCC to qtonnnn@gmail.com

#### 2. Registration Success  
- **Icon:** 👋
- **Color:** Green gradient (#10b981 → #059669)
- **Content:** Welcome message untuk akun baru
- **Recipients:** User + BCC to qtonnnn@gmail.com

#### 3. Password Reset
- **Icon:** 🔐
- **Color:** Orange gradient (#f59e0b → #d97706)
- **Content:** Instruksi reset password dengan link
- **Recipients:** User + BCC to qtonnnn@gmail.com

#### 4. Security Alert
- **Icon:** ⚠️
- **Color:** Red gradient (#ef4444 → #dc2626)
- **Content:** Alert keamanan dengan rekomendasi
- **Recipients:** User + BCC to qtonnnn@gmail.com

#### 5. Logout Success
- **Icon:** 👋
- **Color:** Blue gradient (#3b82f6 → #1d4ed8)
- **Content:** Konfirmasi logout dengan thank you message
- **Recipients:** User + BCC to qtonnnn@gmail.com

### Customization
Untuk menambah atau mengubah template, edit function `getEmailTemplate()` di `send_notification.php`.

## 🔧 Configuration Options

### Email Settings
```php
// Enable/Disable email sending
define('ENABLE_EMAIL', true); // false = disable sending

// Log mode (true = log only, false = send)
define('LOG_EMAIL', false); // true = don't actually send

// Rate limiting
define('MAX_EMAIL_PER_HOUR', 50);
define('EMAIL_COOLDOWN', 60); // seconds between emails
```

### Security Settings
```php
// JWT Secret (untuk future enhancements)
define('JWT_SECRET', 'your-jwt-secret-key-here');

// API Rate limiting
define('API_RATE_LIMIT', 100); // max requests per hour
```

### Logging
```php
// Log file path
define('LOG_FILE', __DIR__ . '/logs/email_log.txt');

// Auto-create logs directory
if (!file_exists(__DIR__ . '/logs')) {
    mkdir(__DIR__ . '/logs', 0755, true);
}
```

## 🧪 Testing

### 1. Manual Testing
```bash
# Via command line
php -S localhost:8000
# Then visit: http://localhost:8000/backend/test_email.php
```

### 2. Programmatic Testing
```bash
# Test via curl
curl -X POST http://localhost/CRD/backend/send_notification.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "qtonnnn@gmail.com",
    "type": "login_success", 
    "message": "Test email dari command line"
  }'
```

### 3. Expected Results
- **Success:** Email terkirim ke qtonnnn@gmail.com
- **Failure:** JSON response dengan error message
- **Logs:** Entry ditambahkan ke `logs/email_log.txt`

## 🔍 Troubleshooting

### Common Issues

#### 1. "SMTP Error: Authentication failed"
**Causes:**
- Email/password salah
- App password tidak valid
- 2-Step verification tidak aktif

**Solutions:**
- Verify Gmail app password di [App Passwords](https://myaccount.google.com/apppasswords)
- Enable 2-Step verification
- Check SMTP_USERNAME dan SMTP_PASSWORD

#### 2. "Connection refused"
**Causes:**
- SMTP server tidak accessible
- Firewall blocking port 587

**Solutions:**
- Check internet connection
- Try different SMTP provider (Yahoo, Outlook)
- Use port 465 (SSL) instead of 587 (TLS)

#### 3. "Permission denied" pada log file
**Solution:**
```bash
# Create logs directory
mkdir backend/logs
chmod 755 backend/logs
chmod 644 backend/config.php
```

#### 4. Email tidak masuk ke inbox
**Causes:**
- Marked as spam
- BCC not working
- Email configuration wrong

**Solutions:**
- Check spam folder
- Verify BCC configuration
- Test with simple email first

### Debug Mode
Enable debug logging:
```php
// In config.php
define('LOG_EMAIL', true); // Log instead of send
define('DEBUG_MODE', true); // Enable detailed logging
```

## 🚀 Deployment

### Production Checklist
- [ ] Enable HTTPS
- [ ] Set `LOG_EMAIL` to false
- [ ] Use strong JWT_SECRET
- [ ] Enable API rate limiting
- [ ] Setup email monitoring
- [ ] Configure proper firewall rules
- [ ] Test all email templates

### Performance Optimization
- [ ] Use email queue for high volume
- [ ] Implement caching
- [ ] Setup email monitoring/alerts
- [ ] Monitor SMTP server limits
- [ ] Setup backup email provider

## 🔐 Security Best Practices

1. **Never commit config.php** dengan real credentials
2. **Use environment variables** untuk sensitive data
3. **Validate all inputs** before processing
4. **Implement rate limiting** untuk prevent abuse
5. **Monitor email logs** untuk suspicious activity
6. **Use HTTPS** untuk all communications
7. **Regularly rotate** app passwords
8. **Setup monitoring** untuk email delivery

## 📊 Monitoring

### Email Metrics
- Total emails sent per day/hour
- Delivery success rate
- Bounce/undeliverable rate
- Response time for email sending

### Log Analysis
```bash
# Check email logs
tail -f backend/logs/email_log.txt

# Count daily emails
grep "2024-01-01" backend/logs/email_log.txt | wc -l
```

## 🔄 Integration

Backend ini terintegrasi dengan frontend melalui:
- **email-api.js** untuk client-side communication
- **auth.js** untuk automatic email triggers
- **Real-time notifications** dengan toast messages

## 📞 Support

Untuk masalah backend email:
1. Check logs di `backend/logs/email_log.txt`
2. Verify SMTP configuration
3. Test with `test_email.php`
4. Check Gmail app password
5. Monitor delivery status

---

**Note:** Backend ini dirancang untuk development dan testing. Untuk production, implementasi additional security measures dan monitoring diperlukan.
