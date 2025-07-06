"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";

// Component test email cho admin
const EmailTestComponent = () => {
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  // Hàm test email với dữ liệu mẫu
  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error("Vui lòng nhập email để test");
      return;
    }

    setLoading(true);

    try {
      // Tạo dữ liệu đơn hàng mẫu
      const testEmailData = {
        orderNumber: "TEST-" + Date.now(),
        customerName: "Nguyễn Văn Test",
        customerEmail: testEmail,
        customerPhone: "0123456789",
        orderDate: new Date().toLocaleDateString('vi-VN'),
        status: "pending",
        products: [
          {
            name: "Thuốc giảm đau Paracetamol 500mg",
            quantity: 2,
            price: 15000,
          },
          {
            name: "Vitamin C 1000mg",
            quantity: 1,
            price: 120000,
          },
        ],
        subtotal: 150000,
        discountAmount: 15000,
        shippingFee: 0,
        totalAmount: 135000,
        paymentMethod: "cod",
        shippingAddress: {
          street: "123 Đường Test",
          ward: "Phường Test",
          province: "TP. Hồ Chí Minh",
        },
        estimatedDeliveryDays: 3,
        storeName: "Nhà Thuốc Online",
        supportPhone: "1900-1234",
        supportEmail: "support@nhathuoconline.com",
        feedbackLink: "https://nhathuoconline.com/feedback",
      };

      // Gọi API gửi email
      const response = await fetch("/api/send-order-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testEmailData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Email test đã được gửi thành công!");
        console.log("Email test result:", result);
      } else {
        toast.error(`Lỗi gửi email: ${result.message}`);
        console.error("Email test error:", result);
      }

    } catch (error) {
      console.error("Lỗi test email:", error);
      toast.error("Có lỗi xảy ra khi gửi email test");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Test Email System</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Email nhận test</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="test@example.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <Button 
          onClick={handleTestEmail} 
          disabled={loading || !testEmail}
          className="w-full"
        >
          {loading ? "Đang gửi..." : "Gửi Email Test"}
        </Button>

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Lưu ý:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Cần cấu hình RESEND_API_KEY trong .env.local</li>
            <li>Kiểm tra email trong hộp thư và thư mục spam</li>
            <li>Xem logs trong Resend dashboard</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailTestComponent; 