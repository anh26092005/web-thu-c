"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

// Component kiểm tra cấu hình Pema
const EmailConfigChecker = () => {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Hàm kiểm tra cấu hình
  const checkEmailConfig = async () => {
    setChecking(true);
    
    try {
      // Kiểm tra API endpoint
      const response = await fetch("/api/send-order-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Gửi dữ liệu không hợp lệ để kiểm tra validation
          orderNumber: "",
          customerEmail: "",
        }),
      });

      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");
      
      let responseData = null;
      if (isJson) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Phân tích kết quả
      const results: any = {
        apiEndpoint: {
          status: response.status === 400 ? "ok" : "error",
          message: response.status === 400 
            ? "API endpoint hoạt động (validation thành công)" 
            : "API endpoint có vấn đề",
          details: `Status: ${response.status}, Response: ${JSON.stringify(responseData)}`,
        },
        emailConfig: {
          status: "unknown",
          message: "Chưa kiểm tra được cấu hình email",
          details: null,
        },
        smtpConnection: {
          status: "unknown", 
          message: "Chưa kiểm tra được kết nối SMTP",
          details: null,
        },
      };

      // Phân tích response để đánh giá cấu hình
      if (isJson && responseData) {
        if (responseData.debug && responseData.debug.includes("EMAIL_USER or EMAIL_PASSWORD")) {
          results.emailConfig = {
            status: "error",
            message: "Thiếu cấu hình EMAIL_USER hoặc EMAIL_PASSWORD",
            details: "Cần thêm EMAIL_USER và EMAIL_PASSWORD vào file .env.local",
          };
        } else if (responseData.debug && responseData.debug.includes("SMTP verification failed")) {
          results.emailConfig = {
            status: "warning",
            message: "Cấu hình email có vẻ đúng nhưng không kết nối được SMTP",
            details: "Kiểm tra lại email/password và cài đặt bảo mật",
          };
          results.smtpConnection = {
            status: "error",
            message: "Không thể kết nối đến máy chủ SMTP",
            details: "Có thể do App Password chưa được tạo hoặc Less secure app access chưa bật",
          };
        } else if (response.status === 400 && responseData.message?.includes("Thiếu thông tin")) {
          results.emailConfig = {
            status: "ok",
            message: "Cấu hình email có vẻ đúng",
            details: "API đã pass qua kiểm tra cấu hình email",
          };
          results.smtpConnection = {
            status: "ok",
            message: "Kết nối SMTP thành công",
            details: "SMTP server có thể kết nối được",
          };
        }
      }

      setResults(results);

    } catch (error) {
      setResults({
        apiEndpoint: {
          status: "error",
          message: "Không thể kết nối đến API",
          details: error instanceof Error ? error.message : "Network error",
        },
        emailConfig: {
          status: "error",
          message: "Không thể kiểm tra cấu hình email do lỗi API",
          details: null,
        },
        smtpConnection: {
          status: "error",
          message: "Không thể kiểm tra kết nối SMTP do lỗi API", 
          details: null,
        },
      });
    } finally {
      setChecking(false);
    }
  };

  // Helper functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ok":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ok":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Kiểm tra cấu hình Email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={checkEmailConfig} disabled={checking} className="w-full">
          {checking ? "Đang kiểm tra..." : "Kiểm tra cấu hình"}
        </Button>

        {results && (
          <div className="space-y-4">
            {Object.entries(results).map(([key, result]: [string, any]) => (
              <div key={key} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(result.status)}
                  <h3 className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{result.message}</p>
                {result.details && (
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {result.details}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Các bước khắc phục:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Kiểm tra file .env.local có EMAIL_USER và EMAIL_PASSWORD</li>
            <li>Với Gmail: Tạo App Password trong Google Account Settings</li>
            <li>Restart server sau khi thêm environment variables</li>
            <li>Đảm bảo API route.ts trong thư mục đúng</li>
            <li>Kiểm tra Network tab trong DevTools để xem request/response</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailConfigChecker; 