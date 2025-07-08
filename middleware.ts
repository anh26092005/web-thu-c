import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Định nghĩa các routes cần bảo vệ
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Email admin được phép truy cập
const ADMIN_EMAIL = "anhdlcwk@gmail.com";

export default clerkMiddleware(async (auth, req) => {
  // Kiểm tra nếu là admin route
  if (isAdminRoute(req)) {
    const { userId } = await auth();
    
    // Nếu chưa đăng nhập, chuyển hướng về trang chủ
    if (!userId) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Lấy thông tin user từ Clerk
    try {
      const userResponse = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const userEmail = userData.email_addresses?.[0]?.email_address || 
                         userData.primary_email_address?.email_address;

        // Kiểm tra nếu không phải email admin được phép
        if (userEmail !== ADMIN_EMAIL) {
          return NextResponse.redirect(new URL("/", req.url));
        }
      } else {
        // Nếu không thể lấy thông tin user, chặn truy cập
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      console.error("Lỗi kiểm tra quyền admin:", error);
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
