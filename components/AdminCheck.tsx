"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Email admin được phép truy cập
const ADMIN_EMAIL = "anhdlcwk@gmail.com";

interface AdminCheckProps {
  children: React.ReactNode;
}

// Component kiểm tra quyền admin
export default function AdminCheck({ children }: AdminCheckProps) {
  const { user, isLoaded } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      // Lấy email từ user
      const userEmail = user?.primaryEmailAddress?.emailAddress || 
                       user?.emailAddresses?.[0]?.emailAddress;

      if (userEmail === ADMIN_EMAIL) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
      setIsChecking(false);
    }
  }, [isLoaded, user]);

  // Loading state
  if (isChecking || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang kiểm tra quyền truy cập...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Nếu không có quyền admin
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Truy cập bị từ chối
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center text-amber-600 mb-3">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="font-medium">Quyền admin bị giới hạn</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Bạn không có quyền truy cập vào khu vực quản trị. 
              Chỉ có tài khoản admin được ủy quyền mới có thể truy cập.
            </p>
            <div className="pt-4">
              <Button 
                onClick={() => router.push("/")}
                className="w-full"
              >
                Quay về trang chủ
              </Button>
            </div>
            {user && (
              <p className="text-xs text-gray-500 mt-4">
                Tài khoản hiện tại: {user.emailAddresses?.[0]?.emailAddress || "Không xác định"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Nếu có quyền admin, hiển thị nội dung
  return <>{children}</>;
} 