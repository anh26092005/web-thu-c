import { groq } from "next-sanity";

// Query để lấy mã giảm giá theo code
export const GET_COUPON_BY_CODE = groq`
  *[_type == "coupon" && code == $code && isActive == true][0]{
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
    applicableCategories[]->{
      _id,
      title
    },
    applicableProducts[]->{
      _id,
      name,
      slug
    },
    excludedProducts[]->{
      _id,
      name,
      slug
    }
  }
`;

// Query để lấy tất cả mã giảm giá đang hoạt động
export const GET_ACTIVE_COUPONS = groq`
  *[_type == "coupon" && isActive == true] | order(_createdAt desc){
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
  }
`;

// Query để kiểm tra số lần sử dụng của user với mã giảm giá cụ thể
export const GET_USER_COUPON_USAGE = groq`
  count(*[_type == "order" && appliedCoupon._ref == $couponId && clerkUserId == $userId])
`;

// Query để lấy lịch sử sử dụng mã giảm giá
export const GET_COUPON_USAGE_HISTORY = groq`
  *[_type == "order" && appliedCoupon._ref == $couponId] | order(orderDate desc){
    _id,
    orderNumber,
    customerName,
    email,
    totalPrice,
    amountDiscount,
    couponCode,
    orderDate,
    status
  }
`;

// Query để cập nhật số lần sử dụng mã giảm giá
export const UPDATE_COUPON_USAGE_COUNT = groq`
  *[_type == "coupon" && _id == $couponId][0]{
    usageCount
  }
`; 