"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Tag, X, Check, AlertCircle } from "lucide-react";
import { useCoupon, type CartItem, type Coupon } from "@/hooks/useCoupon";

interface CouponInputProps {
  cartItems: CartItem[];
  subtotal: number;
  userId?: string;
  onCouponApplied: (discountAmount: number, shippingDiscount: number, coupon: Coupon) => void;
  onCouponRemoved: () => void;
  className?: string;
}

export default function CouponInput({
  cartItems,
  subtotal,
  userId,
  onCouponApplied,
  onCouponRemoved,
  className = "",
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const { validateCoupon, removeCoupon, appliedCoupon, isLoading } = useCoupon();

  // Xử lý áp dụng mã giảm giá
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Vui lòng nhập mã giảm giá");
      return;
    }

    setError("");
    setSuccess("");

    const result = await validateCoupon(couponCode, cartItems, subtotal, userId);

    if (result.isValid && result.coupon) {
      setSuccess(`Áp dụng mã giảm giá thành công! Tiết kiệm ${result.discountAmount.toLocaleString()}đ`);
      onCouponApplied(result.discountAmount, result.shippingDiscount, result.coupon);
      setCouponCode("");
    } else {
      setError(result.errorMessage || "Mã giảm giá không hợp lệ");
    }
  };

  

  // Xử lý xóa mã giảm giá
  const handleRemoveCoupon = () => {
    removeCoupon();
    onCouponRemoved();
    setSuccess("");
    setError("");
  };

  // Xử lý nhấn Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApplyCoupon();
    }
  };

  // Hiển thị thông tin mã giảm giá đã áp dụng
  const renderAppliedCoupon = () => {
    if (!appliedCoupon) return null;

    let discountText = "";
    if (appliedCoupon.discountType === "percentage") {
      discountText = `Giảm ${appliedCoupon.discountValue}%`;
    } else if (appliedCoupon.discountType === "fixed_amount") {
      discountText = `Giảm ${appliedCoupon.discountValue?.toLocaleString()}đ`;
    } else if (appliedCoupon.discountType === "free_shipping") {
      discountText = "Miễn phí vận chuyển";
    }

    return (
      
      <Card className="border-green-200 bg-green-50 shadow-none rounded-lg py-2 md:py-3">
        <CardContent className="px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                <Check className="md:w-4 md:h-4 w-3 h-3 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    {appliedCoupon.code}
                  </Badge>
                  <span className="text-sm font-medium text-green-800">
                    {discountText}
                  </span>
                </div>
                <p className="md:text-sm text-xs text-green-600 mt-1">
                  {appliedCoupon.name}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveCoupon}
              className="text-green-600 hover:text-green-800 hover:bg-green-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Form nhập mã giảm giá */}
      {!appliedCoupon && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">
              Mã giảm giá
            </label>
          </div>
          
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Nhập mã giảm giá"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleApplyCoupon}
              disabled={isLoading || !couponCode.trim()}
              className="px-6 bg-shop_light_green hover:bg-shop_light_green/80 text-white rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-shop_light_green focus:ring-offset-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang kiểm tra...
                </>
              ) : (
                "Áp dụng"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Hiển thị mã giảm giá đã áp dụng */}
      {appliedCoupon && renderAppliedCoupon()}

      {/* Hiển thị thông báo lỗi */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-800 border border-red-200 rounded-md bg-red-50">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hiển thị thông báo thành công */}
      {success && (
        <div className="flex items-center gap-2 p-3 text-sm text-green-800 border border-green-200 rounded-md bg-green-50">
          <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
} 