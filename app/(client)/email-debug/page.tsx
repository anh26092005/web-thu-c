import EmailConfigChecker from "@/components/EmailConfigChecker";
import EmailTestComponent from "@/components/EmailTestComponent";

// Trang debug hệ thống email
export default function EmailDebugPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Debug Hệ Thống Email</h1>
        <p className="text-gray-600">
          Kiểm tra và test cấu hình email xác nhận đơn hàng
        </p>
      </div>

      {/* Component kiểm tra cấu hình */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">1. Kiểm tra cấu hình</h2>
        <EmailConfigChecker />
      </div>

      {/* Component test email */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">2. Test gửi email</h2>
        <EmailTestComponent />
      </div>

      {/* Hướng dẫn cấu hình */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">📝 Hướng dẫn cấu hình</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">Bước 1: Tạo file .env.local</h4>
            <pre className="bg-gray-100 p-3 rounded mt-2 text-sm">
{`# Email Configuration với Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev

# Base URL cho API calls  
NEXT_PUBLIC_BASE_URL=http://localhost:3000`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-semibold">Bước 2: Lấy API Key từ Resend</h4>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Truy cập <a href="https://resend.com" target="_blank" className="text-blue-600 underline">resend.com</a></li>
              <li>Đăng ký tài khoản miễn phí</li>
              <li>Vào mục "API Keys" và tạo key mới</li>
              <li>Copy API key vào .env.local</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold">Bước 3: Restart server</h4>
            <p className="mt-2">Chạy lại lệnh <code className="bg-gray-200 px-2 py-1 rounded">npm run dev</code> sau khi cấu hình .env.local</p>
          </div>
        </div>
      </div>
    </div>
  );
} 