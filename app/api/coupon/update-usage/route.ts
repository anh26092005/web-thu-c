import { NextRequest, NextResponse } from "next/server";
import { updateCouponUsage } from "@/actions/couponActions";

// API để cập nhật số lần sử dụng mã giảm giá
export async function POST(request: NextRequest) {
  try {
    const { couponId } = await request.json();

    if (!couponId) {
      return NextResponse.json(
        { success: false, message: "Thiếu couponId" },
        { status: 400 }
      );
    }

    // Gọi server action để cập nhật usage count
    const result = await updateCouponUsage(couponId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Cập nhật số lần sử dụng mã giảm giá thành công",
        data: result.data,
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Lỗi API cập nhật usage mã giảm giá:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi server" },
      { status: 500 }
    );
  }
} 