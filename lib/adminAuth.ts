import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Email admin được phép truy cập
const ADMIN_EMAIL = "anhdlcwk@gmail.com";

// Utility function để kiểm tra quyền admin trong API routes
export async function checkAdminAuth() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: "Chưa đăng nhập" },
          { status: 401 }
        )
      };
    }

    // Lấy thông tin user từ Clerk API
    const userResponse = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    if (!userResponse.ok) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: "Không thể xác thực người dùng" },
          { status: 403 }
        )
      };
    }

    const userData = await userResponse.json();
    const userEmail = userData.email_addresses?.[0]?.email_address || 
                     userData.primary_email_address?.email_address;

    if (userEmail !== ADMIN_EMAIL) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: "Không có quyền truy cập admin" },
          { status: 403 }
        )
      };
    }

    return {
      authorized: true,
      userId,
      userEmail
    };

  } catch (error) {
    console.error("Lỗi kiểm tra quyền admin:", error);
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Lỗi hệ thống khi kiểm tra quyền" },
        { status: 500 }
      )
    };
  }
} 