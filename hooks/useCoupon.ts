import { useState, useCallback } from "react";
import { client } from "@/sanity/lib/client";
import { GET_COUPON_BY_CODE, GET_USER_COUPON_USAGE } from "@/sanity/queries/couponQueries";

// Type definitions cho mã giảm giá
export interface Coupon {
  _id: string;
  code: string;
  name: string;
  description?: string;
  discountType: "percentage" | "fixed_amount" | "free_shipping";
  discountValue?: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usageCount: number;
  userLimit?: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  applicableCategories?: Array<{
    _id: string;
    title: string;
  }>;
  applicableProducts?: Array<{
    _id: string;
    name: string;
    slug: any;
  }>;
  excludedProducts?: Array<{
    _id: string;
    name: string;
    slug: any;
  }>;
}

// Type cho kết quả tính toán giảm giá
export interface DiscountResult {
  isValid: boolean;
  discountAmount: number;
  shippingDiscount: number;
  errorMessage?: string;
  coupon?: Coupon;
}

// Type cho sản phẩm trong giỏ hàng
export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  categories?: string[];
  variant?: string; // Thêm variant để backup khi không có categories
}

export const useCoupon = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Xác thực mã giảm giá
  const validateCoupon = useCallback(async (
    couponCode: string,
    cartItems: CartItem[],
    subtotal: number,
    userId?: string
  ): Promise<DiscountResult> => {
    if (!couponCode.trim()) {
      return {
        isValid: false,
        discountAmount: 0,
        shippingDiscount: 0,
        errorMessage: "Vui lòng nhập mã giảm giá",
      };
    }

    setIsLoading(true);

    try {
      // Lấy thông tin mã giảm giá từ Sanity
      const coupon: Coupon = await client.fetch(GET_COUPON_BY_CODE, {
        code: couponCode.toUpperCase(),
      });

      if (!coupon) {
        return {
          isValid: false,
          discountAmount: 0,
          shippingDiscount: 0,
          errorMessage: "Mã giảm giá không tồn tại hoặc đã hết hạn",
        };
      }

      // Kiểm tra thời gian hiệu lực
      const now = new Date();
      const startDate = new Date(coupon.startDate);
      const endDate = coupon.endDate ? new Date(coupon.endDate) : null;

      if (now < startDate) {
        return {
          isValid: false,
          discountAmount: 0,
          shippingDiscount: 0,
          errorMessage: "Mã giảm giá chưa có hiệu lực",
        };
      }

      if (endDate && now > endDate) {
        return {
          isValid: false,
          discountAmount: 0,
          shippingDiscount: 0,
          errorMessage: "Mã giảm giá đã hết hạn",
        };
      }

      // Kiểm tra giới hạn sử dụng tổng
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return {
          isValid: false,
          discountAmount: 0,
          shippingDiscount: 0,
          errorMessage: "Mã giảm giá đã hết lượt sử dụng",
        };
      }

      // Kiểm tra giới hạn sử dụng của user
      if (coupon.userLimit && userId) {
        const userUsageCount = await client.fetch(GET_USER_COUPON_USAGE, {
          couponId: coupon._id,
          userId: userId,
        });

        if (userUsageCount >= coupon.userLimit) {
          return {
            isValid: false,
            discountAmount: 0,
            shippingDiscount: 0,
            errorMessage: "Bạn đã sử dụng hết lượt cho mã giảm giá này",
          };
        }
      }

      // Kiểm tra giá trị đơn hàng tối thiểu
      if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
        return {
          isValid: false,
          discountAmount: 0,
          shippingDiscount: 0,
          errorMessage: `Đơn hàng tối thiểu ${coupon.minOrderAmount.toLocaleString()}đ để áp dụng mã này`,
        };
      }

      // Kiểm tra sản phẩm áp dụng
      const applicableItems = filterApplicableItems(cartItems, coupon);
      if (applicableItems.length === 0) {
        return {
          isValid: false,
          discountAmount: 0,
          shippingDiscount: 0,
          errorMessage: "Không có sản phẩm nào áp dụng được mã giảm giá này",
        };
      }

      // Tính toán giảm giá
      const discountResult = calculateDiscount(applicableItems, coupon);

      setAppliedCoupon(coupon);

      return {
        isValid: true,
        discountAmount: discountResult.discountAmount,
        shippingDiscount: discountResult.shippingDiscount,
        coupon: coupon,
      };

    } catch (error) {
      console.error("Lỗi khi xác thực mã giảm giá:", error);
      return {
        isValid: false,
        discountAmount: 0,
        shippingDiscount: 0,
        errorMessage: "Có lỗi xảy ra khi kiểm tra mã giảm giá",
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Lọc sản phẩm áp dụng mã giảm giá
  const filterApplicableItems = (cartItems: CartItem[], coupon: Coupon): CartItem[] => {
    console.log("=== FILTER APPLICABLE ITEMS DEBUG ===");
    console.log("Cart Items:", cartItems);
    console.log("Coupon:", coupon);
    console.log("Applicable Categories:", coupon.applicableCategories);
    console.log("Applicable Products:", coupon.applicableProducts);
    console.log("Excluded Products:", coupon.excludedProducts);
    
    return cartItems.filter(item => {
      console.log(`\n--- Checking item: ${item.name} ---`);
      
      // Kiểm tra sản phẩm bị loại trừ
      if (coupon.excludedProducts?.some(excluded => excluded._id === item._id)) {
        console.log("❌ Item excluded by excludedProducts");
        return false;
      }

      // Nếu có danh sách sản phẩm cụ thể, chỉ áp dụng cho những sản phẩm đó
      if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
        const isApplicable = coupon.applicableProducts.some(applicable => applicable._id === item._id);
        console.log(`${isApplicable ? '✅' : '❌'} Item check by applicableProducts:`, isApplicable);
        return isApplicable;
      }

      // Nếu có danh sách danh mục, chỉ áp dụng cho sản phẩm thuộc danh mục đó
      if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
        console.log("Item categories:", item.categories);
        console.log("Item variant:", item.variant);
        
        // Kiểm tra categories
        const categoryMatch = item.categories?.some(category => 
          coupon.applicableCategories?.some(applicable => applicable.title === category)
        );
        
        // Kiểm tra variant (backup)
        const variantMatch = item.variant && coupon.applicableCategories?.some(applicable => {
          // Chuyển đổi variant thành tên danh mục tương ứng
          const variantToCategory: Record<string, string> = {
            "thuoc": "Thuốc",
            "thuc-pham-chuc-nang": "Thực phẩm chức năng",
            "sinh-ly": "Sinh lý",
            "trang-thiet-bi-y-te": "Trang thiết bị y tế",
            "dinh-duong": "Dinh dưỡng",
            "duoc-my-pham": "Dược mỹ phẩm",
            "cham-soc-ca-nhan": "Chăm sóc cá nhân",
          };
          
          const categoryName = variantToCategory[item.variant!];
          return applicable.title === categoryName;
        });
        
        const isApplicable = categoryMatch || variantMatch;
        console.log(`${isApplicable ? '✅' : '❌'} Item check by categories/variant:`, isApplicable);
        console.log("Category match:", categoryMatch, "Variant match:", variantMatch);
        return isApplicable;
      }

      // Nếu không có giới hạn, áp dụng cho tất cả
      console.log("✅ Item applicable (no restrictions)");
      return true;
    });
  };

  // Tính toán số tiền giảm giá
  const calculateDiscount = (applicableItems: CartItem[], coupon: Coupon) => {
    const applicableSubtotal = applicableItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );

    let discountAmount = 0;
    let shippingDiscount = 0;

    switch (coupon.discountType) {
      case "percentage":
        discountAmount = applicableSubtotal * (coupon.discountValue || 0) / 100;
        // Áp dụng giới hạn số tiền giảm tối đa
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
          discountAmount = coupon.maxDiscountAmount;
        }
        break;

      case "fixed_amount":
        discountAmount = Math.min(coupon.discountValue || 0, applicableSubtotal);
        break;

      case "free_shipping":
        shippingDiscount = 30000; // Giả sử phí ship là 30k
        break;
    }

    return { discountAmount, shippingDiscount };
  };

  // Xóa mã giảm giá đã áp dụng
  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  return {
    validateCoupon,
    removeCoupon,
    appliedCoupon,
    isLoading,
  };
}; 