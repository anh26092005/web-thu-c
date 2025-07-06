# Hướng dẫn cấu hình Email với Resend

## Bước 1: Cài đặt Resend

```bash
npm install resend
```

## Bước 2: Đăng ký tài khoản Resend

1. Truy cập [https://resend.com](https://resend.com)
2. Đăng ký tài khoản miễn phí
3. Xác thực email và hoàn tất đăng ký

## Bước 3: Lấy API Key

1. Đăng nhập vào dashboard Resend
2. Vào mục "API Keys" 
3. Tạo API Key mới với tên "Medicine Store"
4. Copy API Key (chỉ hiển thị 1 lần)

## Bước 4: Cấu hình Domain (Tùy chọn)

### Sử dụng domain miễn phí của Resend:
- Có thể sử dụng ngay domain `onboarding@resend.dev`
- Phù hợp cho testing và development

### Sử dụng domain riêng (Khuyến nghị cho production):
1. Vào mục "Domains" trong dashboard
2. Thêm domain của bạn (ví dụ: `yourdomain.com`)
3. Cấu hình DNS records theo hướng dẫn
4. Chờ verify thành công

## Bước 5: Cấu hình Environment Variables

Thêm vào file `.env.local`:

```env
# Resend Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Hoặc sử dụng domain miễn phí của Resend
RESEND_FROM_EMAIL=onboarding@resend.dev

# Base URL cho API calls
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Bước 6: Cấu hình thông tin cửa hàng

Chỉnh sửa file `lib/email-service.ts`:

```typescript
export const STORE_CONFIG = {
  name: "Tên Cửa Hàng Của Bạn",
  supportPhone: "0123-456-789",
  supportEmail: "support@yourdomain.com",
  feedbackLink: "https://yourdomain.com/feedback",
};
```

## Bước 7: Test Email

1. Tạo đơn hàng thử nghiệm
2. Kiểm tra email trong hộp thư
3. Kiểm tra Resend dashboard để xem logs

## Giới hạn Free Plan

- **100 emails/ngày** cho domain miễn phí
- **3,000 emails/tháng** cho domain riêng
- Phù hợp cho testing và cửa hàng nhỏ

## Nâng cấp Plan

Nếu cần gửi nhiều email hơn:
- **Pro Plan**: $20/tháng - 50,000 emails
- **Business Plan**: $80/tháng - 100,000 emails

## Troubleshooting

### Lỗi "API Key not found"
- Kiểm tra API Key trong `.env.local`
- Đảm bảo không có khoảng trắng thừa
- Restart server sau khi thay đổi env

### Email không được gửi
- Kiểm tra RESEND_FROM_EMAIL có đúng format
- Kiểm tra domain đã được verify
- Xem logs trong Resend dashboard

### Email vào spam
- Sử dụng domain riêng đã verify
- Cấu hình SPF, DKIM, DMARC records
- Tránh từ ngữ spam trong nội dung

## Tính năng nâng cao

### 1. Template động
- Tùy chỉnh template theo loại sản phẩm
- Thêm logo và branding
- Responsive design cho mobile

### 2. Email tracking
- Theo dõi tỷ lệ mở email
- Theo dõi click links
- Analytics chi tiết

### 3. Automation
- Email chào mừng khách hàng mới
- Email nhắc nhở giỏ hàng bỏ quên
- Email marketing campaigns

## Lưu ý bảo mật

- Không commit API Key vào Git
- Sử dụng environment variables
- Giới hạn quyền API Key
- Thường xuyên rotate API Key 