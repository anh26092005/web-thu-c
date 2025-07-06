"use server";

import { client } from "@/sanity/lib/client";

// Cập nhật số lần sử dụng mã giảm giá
export async function updateCouponUsage(couponId: string) {
  try {
    // Lấy thông tin mã giảm giá hiện tại
    const coupon = await client.fetch(
      `*[_type == "coupon" && _id == $couponId][0]`,
      { couponId }
    );

    if (!coupon) {
      throw new Error("Mã giảm giá không tồn tại");
    }

    // Cập nhật số lần sử dụng
    const updatedCoupon = await client
      .patch(couponId)
      .set({
        usageCount: (coupon.usageCount || 0) + 1,
      })
      .commit();

    return {
      success: true,
      data: updatedCoupon,
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật số lần sử dụng mã giảm giá:", error);
    return {
      success: false,
      error: "Không thể cập nhật số lần sử dụng mã giảm giá",
    };
  }
}

// Kiểm tra tính hợp lệ của mã giảm giá
export async function validateCouponCode(couponCode: string) {
  try {
    const coupon = await client.fetch(
      `*[_type == "coupon" && code == $code && isActive == true][0]{
        _id,
        code,
        name,
        discountType,
        discountValue,
        maxDiscountAmount,
        minOrderAmount,
        usageLimit,
        usageCount,
        userLimit,
        startDate,
        endDate,
        isActive
      }`,
      { code: couponCode.toUpperCase() }
    );

    if (!coupon) {
      return {
        success: false,
        error: "Mã giảm giá không tồn tại hoặc đã hết hạn",
      };
    }

    // Kiểm tra thời gian hiệu lực
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = coupon.endDate ? new Date(coupon.endDate) : null;

    if (now < startDate) {
      return {
        success: false,
        error: "Mã giảm giá chưa có hiệu lực",
      };
    }

    if (endDate && now > endDate) {
      return {
        success: false,
        error: "Mã giảm giá đã hết hạn",
      };
    }

    // Kiểm tra giới hạn sử dụng
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return {
        success: false,
        error: "Mã giảm giá đã hết lượt sử dụng",
      };
    }

    return {
      success: true,
      data: coupon,
    };
  } catch (error) {
    console.error("Lỗi khi kiểm tra mã giảm giá:", error);
    return {
      success: false,
      error: "Có lỗi xảy ra khi kiểm tra mã giảm giá",
    };
  }
}

// Lấy danh sách mã giảm giá đang hoạt động
export async function getActiveCoupons() {
  try {
    const coupons = await client.fetch(
      `*[_type == "coupon" && isActive == true] | order(_createdAt desc){
        _id,
        code,
        name,
        description,
        discountType,
        discountValue,
        maxDiscountAmount,
        minOrderAmount,
        usageLimit,
        usageCount,
        userLimit,
        startDate,
        endDate,
        isActive,
        _createdAt
      }`
    );

    return {
      success: true,
      data: coupons,
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách mã giảm giá:", error);
    return {
      success: false,
      error: "Không thể lấy danh sách mã giảm giá",
    };
  }
}

// Lấy lịch sử sử dụng mã giảm giá
export async function getCouponUsageHistory(couponId: string) {
  try {
    const history = await client.fetch(
      `*[_type == "order" && appliedCoupon._ref == $couponId] | order(orderDate desc){
        _id,
        orderNumber,
        customerName,
        email,
        totalPrice,
        amountDiscount,
        couponCode,
        orderDate,
        status
      }`,
      { couponId }
    );

    return {
      success: true,
      data: history,
    };
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử sử dụng mã giảm giá:", error);
    return {
      success: false,
      error: "Không thể lấy lịch sử sử dụng mã giảm giá",
    };
  }
}

// Tạo mã giảm giá mới
export async function createCoupon(couponData: {
  code: string;
  name: string;
  description?: string;
  discountType: "percentage" | "fixed_amount" | "free_shipping";
  discountValue?: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  userLimit?: number;
  startDate: string;
  endDate?: string;
  isActive?: boolean;
}) {
  try {
    // Kiểm tra mã giảm giá đã tồn tại chưa
    const existingCoupon = await client.fetch(
      `*[_type == "coupon" && code == $code][0]`,
      { code: couponData.code.toUpperCase() }
    );

    if (existingCoupon) {
      return {
        success: false,
        error: "Mã giảm giá đã tồn tại",
      };
    }

    // Tạo mã giảm giá mới
    const newCoupon = await client.create({
      _type: "coupon",
      code: couponData.code.toUpperCase(),
      name: couponData.name,
      description: couponData.description,
      discountType: couponData.discountType,
      discountValue: couponData.discountValue,
      maxDiscountAmount: couponData.maxDiscountAmount,
      minOrderAmount: couponData.minOrderAmount,
      usageLimit: couponData.usageLimit,
      usageCount: 0,
      userLimit: couponData.userLimit,
      startDate: couponData.startDate,
      endDate: couponData.endDate,
      isActive: couponData.isActive ?? true,
    });

    return {
      success: true,
      data: newCoupon,
    };
  } catch (error) {
    console.error("Lỗi khi tạo mã giảm giá:", error);
    return {
      success: false,
      error: "Không thể tạo mã giảm giá",
    };
  }
} 