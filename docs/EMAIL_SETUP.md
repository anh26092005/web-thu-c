# Hướng dẫn cấu hình Email với Nodemailer

## Bước 1: Cài đặt Nodemailer

```bash
npm install nodemailer
npm install @types/nodemailer --save-dev
```

## Bước 2: Chuẩn bị tài khoản Gmail

### Tạo tài khoản Gmail (nếu chưa có):
1. Truy cập [https://accounts.google.com](https://accounts.google.com)
2. Tạo tài khoản Gmail mới hoặc sử dụng tài khoản hiện có
3. Nên tạo một tài khoản riêng cho việc gửi email tự động

### Bật 2-Factor Authentication:
1. Vào [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Bật "2-Step Verification"
3. Thực hiện theo hướng dẫn để xác thực

## Bước 3: Tạo App Password

1. Đăng nhập vào Gmail
2. Vào [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Chọn "Select app" → "Mail"
4. Chọn "Select device" → "Other (custom name)"
5. Nhập tên: "Medicine Store Email"
6. Click "Generate"
7. Copy App Password (16 ký tự, dạng: xxxx xxxx xxxx xxxx)

## Bước 4: Cấu hình Environment Variables

Thêm vào file `.env.local`:

```env
# Nodemailer Email Configuration
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_FROM=your-gmail@gmail.com

# Thông tin cửa hàng
STORE_NAME="Nhà Thuốc Khủng Long Châu"
STORE_SUPPORT_PHONE="0909090909"
STORE_SUPPORT_EMAIL="support@nhathuockhunglongchau.com"

# Base URL cho API calls
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Ví dụ cấu hình:
```env
EMAIL_USER=nhathuoc.store@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=nhathuoc.store@gmail.com
```

## Bước 5: Cấu hình thông tin cửa hàng

Chỉnh sửa file `lib/email-service.ts`:

```typescript
export const STORE_CONFIG = {
  name: "Nhà Thuốc Khủng Long Châu",
  supportPhone: "0909090909",
  supportEmail: "support@nhathuockhunglongchau.com",
  feedbackLink: "https://nhathuockhunglongchau.com/feedback",
};
```

## Bước 6: Test Email

1. Restart server sau khi cấu hình environment variables
2. Sử dụng EmailTestComponent để test
3. Tạo đơn hàng thử nghiệm
4. Kiểm tra email trong hộp thư
5. Kiểm tra console logs để debug

## Ưu điểm của Nodemailer so với Resend

### 1. Miễn phí hoàn toàn:
- Không giới hạn số email gửi
- Chỉ bị giới hạn bởi Gmail (500 emails/ngày cho tài khoản thường)
- Không cần trả phí monthly

### 2. Tự chủ cao:
- Hoàn toàn kiểm soát cấu hình SMTP
- Có thể dễ dàng thay đổi provider (Gmail, Outlook, SMTP server riêng)
- Không phụ thuộc vào dịch vụ bên thứ ba

### 3. Tính năng đầy đủ:
- Hỗ trợ HTML và plain text
- Attachment files
- CC, BCC
- Custom headers

## Troubleshooting

### Lỗi "Invalid login"
- Kiểm tra EMAIL_USER có đúng format email
- Đảm bảo đã tạo App Password (không dùng mật khẩu thường)
- Kiểm tra 2-Factor Authentication đã được bật

### Lỗi "Connection timeout"
- Kiểm tra kết nối internet
- Đảm bảo firewall không block port 587/465
- Thử restart server

### Email vào spam
- Sử dụng FROM email giống với EMAIL_USER
- Tránh từ ngữ spam trong subject và content
- Yêu cầu người nhận whitelist email

### Lỗi "Too many emails"
- Gmail giới hạn 500 emails/ngày cho tài khoản thường
- Nếu cần gửi nhiều hơn, cân nhắc:
  - Sử dụng G Suite/Google Workspace (2000 emails/ngày)
  - SMTP server riêng
  - Dịch vụ email marketing khác

## Cấu hình nâng cao

### 1. Sử dụng SMTP server khác:

```typescript
// Outlook/Hotmail
const transporter = nodemailer.createTransporter({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// SMTP server tùy chỉnh
const transporter = nodemailer.createTransporter({
  host: 'your-smtp-server.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

### 2. Template HTML nâng cao:
- Thêm CSS inline để tương thích email client
- Sử dụng table layout thay vì flexbox/grid
- Test trên nhiều email client (Gmail, Outlook, Apple Mail)

### 3. Queue system cho email:
- Sử dụng Redis/database để queue email
- Xử lý background jobs với Bull.js
- Retry mechanism cho email gửi thất bại

### 4. Email tracking:
- Thêm tracking pixel để theo dõi email opened
- UTM parameters cho links
- Analytics integration

## Lưu ý bảo mật

- Không commit EMAIL_PASSWORD vào Git
- Sử dụng App Password thay vì mật khẩu thường
- Giới hạn permissions của email account
- Thường xuyên rotate App Password
- Monitor email usage để phát hiện bất thường

## Giới hạn Gmail

### Tài khoản Gmail thường:
- **500 emails/ngày**
- **100 recipients/email**
- **25MB attachment/email**

### Google Workspace:
- **2,000 emails/ngày**
- **2,000 recipients/email**
- **25MB attachment/email**

## Migration từ Resend

Nếu đang sử dụng Resend:
1. Backup environment variables cũ
2. Cài đặt Nodemailer
3. Cập nhật API route
4. Test thoroughly
5. Update documentation
6. Remove Resend dependencies 