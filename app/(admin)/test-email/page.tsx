import EmailTestComponent from "@/components/EmailTestComponent";
import EmailConfigChecker from "@/components/EmailConfigChecker";

// Trang test email cho admin
export default function TestEmailPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Test Email System</h1>
        <p className="text-gray-600">
          Kiểm tra và test hệ thống gửi email với Nodemailer
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        {/* Component kiểm tra cấu hình */}
        <div>
          <h2 className="text-xl font-semibold mb-4">1. Kiểm tra cấu hình</h2>
          <EmailConfigChecker />
        </div>

        {/* Component test gửi email */}
        <div>
          <h2 className="text-xl font-semibold mb-4">2. Test gửi email</h2>
          <EmailTestComponent />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Hướng dẫn test email:
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Trước tiên, chạy "Kiểm tra cấu hình" để đảm bảo setup đúng</li>
          <li>Nếu cấu hình OK, nhập email của bạn vào "Test gửi email"</li>
          <li>Click "Gửi Email Test" và kiểm tra hộp thư</li>
          <li>Nếu không nhận được email, kiểm tra thư mục spam</li>
          <li>Xem console logs để debug nếu có lỗi</li>
        </ol>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">
          Cấu hình environment variables cần thiết:
        </h3>
        <pre className="bg-yellow-100 p-4 rounded text-sm overflow-x-auto">
{`# File .env.local
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password-here  
EMAIL_FROM=your-gmail@gmail.com

# Thông tin cửa hàng
STORE_NAME="Nhà Thuốc Khủng Long Châu"
STORE_SUPPORT_PHONE="0909090909"
STORE_SUPPORT_EMAIL="support@nhathuockhunglongchau.com"

NEXT_PUBLIC_BASE_URL=http://localhost:3000`}
        </pre>
      </div>
    </div>
  );
} 