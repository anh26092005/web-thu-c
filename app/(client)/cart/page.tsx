"use client";


import Container from "@/components/Container";
import EmptyCart from "@/components/EmptyCart";
import NoAccess from "@/components/NoAccess";
import PriceFormatter from "@/components/PriceFormatter";
import ProductSideMenu from "@/components/ProductSideMenu";
import QuantityButtons from "@/components/QuantityButtons";
import Title from "@/components/Title";
import CouponInput from "@/components/CouponInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Address } from "@/sanity.types";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import useStore from "@/store";
import { useAuth, useUser } from "@clerk/nextjs";
import { useUserEmail } from "@/hooks/useUserEmail";
import { ShoppingBag, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PROVINCES_QUERY, WARDS_BY_PROVINCE_QUERY } from "@/sanity/queries/query";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

// Local type definitions
interface ProvinceData {
  _id: string;
  name?: string;
  code?: string;
}

interface WardData {
  _id: string;
  name?: string;
  code?: string;
  province?: {
    _ref: string;
    _type: "reference";
  };
}

const CartPage = () => {
  const {
    deleteCartProduct,
    getTotalPrice,
    getItemCount,
    getSubTotalPrice,
    resetCart,
  } = useStore();
  const [loading, setLoading] = useState(false);
  const groupedItems = useStore((state) => state.getGroupedItems());
  const { isSignedIn } = useAuth();
  const { extractUserEmail, user } = useUserEmail();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"cod" | "vnpay">("cod");
  const [newStreetAddress, setNewStreetAddress] = useState("");
  const [provinces, setProvinces] = useState<ProvinceData[] | null>(null);
  const [wards, setWards] = useState<WardData[] | null>(null);
  const [selectedNewProvince, setSelectedNewProvince] = useState<ProvinceData | null>(null);
  const [selectedNewWard, setSelectedNewWard] = useState<WardData | null>(null);
  const [orderNotes, setOrderNotes] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  
  // State cho mã giảm giá
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [shippingDiscount, setShippingDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  
  const router = useRouter();

  // Hàm tính tổng tiền sau khi trừ mã giảm giá
  const getFinalTotalPrice = () => {
    const originalTotal = getOriginalTotalPrice(); // Tổng giá gốc
    const productDiscount = getProductDiscountAmount(); // Giảm giá sản phẩm
    const subtotalAfterProductDiscount = originalTotal - productDiscount; // Tổng sau giảm giá sản phẩm
    const totalAfterCoupon = Math.max(0, subtotalAfterProductDiscount - couponDiscount); // Tổng cuối cùng
    return totalAfterCoupon;
  };

  // Function tính giá sau khi giảm
  const getDiscountedPrice = (product: any) => {
    const price = product?.price ?? 0;
    const discount = product?.discount ?? 0;
    if (discount > 0) {
      return price - (discount * price) / 100;
    }
    return price;
  };

  // Function tính tổng giá gốc của tất cả sản phẩm
  const getOriginalTotalPrice = () => {
    return Object.values(groupedItems).reduce((total: number, { product }) => {
      const itemCount = getItemCount(product?._id);
      const price = product?.price ?? 0;
      return total + (price * itemCount);
    }, 0);
  };

  // Function tính tổng số tiền giảm từ discount sản phẩm
  const getProductDiscountAmount = () => {
    return Object.values(groupedItems).reduce((total: number, { product }) => {
      const itemCount = getItemCount(product?._id);
      const price = product?.price ?? 0;
      const discount = product?.discount ?? 0;
      if (discount > 0) {
        const discountAmount = (discount * price) / 100;
        return total + (discountAmount * itemCount);
      }
      return total;
    }, 0);
  };

  // Hàm xử lý khi áp dụng mã giảm giá thành công
  const handleCouponApplied = (discountAmount: number, shippingDiscountAmount: number, coupon: any) => {
    setCouponDiscount(discountAmount);
    setShippingDiscount(shippingDiscountAmount);
    setAppliedCoupon(coupon);
    toast.success(`Áp dụng mã giảm giá thành công! Tiết kiệm ${discountAmount.toLocaleString()}đ`);
  };

  // Hàm xử lý khi xóa mã giảm giá
  const handleCouponRemoved = () => {
    setCouponDiscount(0);
    setShippingDiscount(0);
    setAppliedCoupon(null);
    toast.success("Đã xóa mã giảm giá");
  };

  // Chuyển đổi groupedItems thành CartItem format cho CouponInput
  const getCartItemsForCoupon = () => {
    const cartItems = Object.values(groupedItems).map((item: any) => {
      // Debug: Kiểm tra dữ liệu sản phẩm
      console.log("=== DEBUG PRODUCT DATA ===");
      console.log("Product:", item.product);
      console.log("Categories:", item.product.categories);
      console.log("Variant:", item.product.variant);
      
      return {
        _id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        categories: item.product.categories?.map((cat: any) => cat.title) || [],
        variant: item.product.variant, // Thêm variant để backup
      };
    });
    
    console.log("=== CART ITEMS FOR COUPON ===");
    console.log("Cart Items:", cartItems);
    
    return cartItems;
  };

  const fetchProvinces = async () => {
    try {
      const data = await client.fetch(PROVINCES_QUERY);
      setProvinces(data);
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const fetchWards = async (provinceId: string) => {
    try {
      const data = await client.fetch(WARDS_BY_PROVINCE_QUERY, { provinceId });
      setWards(data);
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (selectedNewProvince) {
      fetchWards(selectedNewProvince._id);
      setSelectedNewWard(null);
    }
  }, [selectedNewProvince]);

  const handleResetCart = () => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?"
    );
    if (confirmed) {
      resetCart();
      toast.success("Đã xóa tất cả sản phẩm trong giỏ hàng!");
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      if (!newStreetAddress || !selectedNewProvince || !selectedNewWard) {
        toast.error("Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng.");
        setLoading(false);
        return;
      }

      // Trích xuất email từ Clerk user
      const extractedEmail = extractUserEmail();
      
      // Sử dụng email thủ công nếu có, nếu không dùng email từ Clerk
      const finalEmail = manualEmail || extractedEmail.email || "";
      
      // Validation bắt buộc cho email
      if (!finalEmail || finalEmail === "Unknown") {
        setEmailError("Email là bắt buộc. Vui lòng nhập email của bạn.");
        toast.error("Email là bắt buộc. Vui lòng nhập email của bạn.");
        setLoading(false);
        return;
      }

      // Validation format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(finalEmail)) {
        setEmailError("Định dạng email không hợp lệ. Vui lòng nhập email đúng.");
        toast.error("Định dạng email không hợp lệ. Vui lòng nhập email đúng.");
        setLoading(false);
        return;
      }

      // Clear email error nếu email hợp lệ
      setEmailError("");

      // Trích xuất số điện thoại từ Clerk user
      const extractedPhone = user?.phoneNumbers?.[0]?.phoneNumber || "";
      
      // Sử dụng số điện thoại thủ công nếu có, nếu không dùng từ Clerk
      const finalPhone = manualPhone || extractedPhone || "";
      
      // Validation bắt buộc cho số điện thoại
      if (!finalPhone || finalPhone === "Unknown") {
        setPhoneError("Số điện thoại là bắt buộc. Vui lòng nhập số điện thoại của bạn.");
        toast.error("Số điện thoại là bắt buộc. Vui lòng nhập số điện thoại của bạn.");
        setLoading(false);
        return;
      }

      // Validation format số điện thoại Việt Nam
      const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
      if (!phoneRegex.test(finalPhone.replace(/\s+/g, ''))) {
        setPhoneError("Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam đúng định dạng.");
        toast.error("Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam đúng định dạng.");
        setLoading(false);
        return;
      }

      // Clear phone error nếu số điện thoại hợp lệ
      setPhoneError("");

      const customerInfo = {
        clerkUserId: user?.id,
        name: user?.fullName ?? user?.firstName + " " + user?.lastName ?? "Unknown",
        email: finalEmail,
        phone: finalPhone,
      };

      console.log("=== THÔNG TIN KHÁCH HÀNG CUỐI CÙNG ===");
      console.log("Customer info being sent:", customerInfo);
      console.log("Final email:", finalEmail);
      console.log("Final phone:", finalPhone);
      console.log("Extracted phone from Clerk:", extractedPhone);
      const shippingAddressPayload = {
        street: newStreetAddress,
        provinceId: selectedNewProvince._id,
        wardId: selectedNewWard._id,
      };

      if (selectedPaymentMethod === "cod") {
        const response = await fetch("/api/cod", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cart: groupedItems.map(item => ({
              _id: item.product?._id,
              quantity: item.quantity,
            })),
            totalPrice: getFinalTotalPrice(),
            originalPrice: getOriginalTotalPrice(), // Tổng giá gốc của tất cả sản phẩm
            discountAmount: getProductDiscountAmount() + couponDiscount, // Tổng giảm giá từ sản phẩm + coupon
            shippingDiscount: shippingDiscount,
            appliedCoupon: appliedCoupon ? {
              _id: appliedCoupon._id,
              code: appliedCoupon.code,
              name: appliedCoupon.name,
              discountType: appliedCoupon.discountType,
              discountValue: appliedCoupon.discountValue,
            } : null,
            customerInfo,
            shippingAddress: shippingAddressPayload,
            orderNotes,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          toast.success("Đơn hàng COD đã được tạo thành công!");
          // Cập nhật số lần sử dụng mã giảm giá nếu có
          if (appliedCoupon) {
            try {
              await fetch("/api/coupon/update-usage", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  couponId: appliedCoupon._id,
                }),
              });
            } catch (error) {
              console.error("Lỗi cập nhật usage mã giảm giá:", error);
            }
          }
          resetCart();
          router.push("/orders");
        } else {
          toast.error(`Lỗi tạo đơn hàng COD: ${result.message || "Unknown error"}`);
        }
      } else if (selectedPaymentMethod === "vnpay") {
        // Chuẩn bị dữ liệu đơn hàng để lưu vào localStorage
        const pendingOrderData = {
          cart: groupedItems.map(item => ({
            _id: item.product?._id,
            quantity: item.quantity,
          })),
          totalPrice: getFinalTotalPrice(),
          originalPrice: getOriginalTotalPrice(), // Tổng giá gốc của tất cả sản phẩm
          discountAmount: getProductDiscountAmount() + couponDiscount, // Tổng giảm giá từ sản phẩm + coupon
          shippingDiscount: shippingDiscount,
          appliedCoupon: appliedCoupon ? {
            _id: appliedCoupon._id,
            code: appliedCoupon.code,
            name: appliedCoupon.name,
            discountType: appliedCoupon.discountType,
            discountValue: appliedCoupon.discountValue,
          } : null,
          customerInfo,
          shippingAddress: shippingAddressPayload,
          orderNotes,
        };

        // Lưu dữ liệu đơn hàng vào localStorage
        localStorage.setItem('vnpayPendingOrder', JSON.stringify(pendingOrderData));

        const response = await fetch("/api/vnpay/create-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: getFinalTotalPrice(),
            orderInfo: `Thanh toan cho don hang`,
          }),
        });

        if (!response.ok) {
          toast.error("Lỗi tạo yêu cầu thanh toán VNPAY");
          return;
        }

        const result = await response.json();
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
        } else {
          toast.error(`Lỗi tạo yêu cầu thanh toán VNPAY: ${result.message || "Unknown error"}`);
        }
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-shop_light_pink pb-52 md:pb-10">
      {isSignedIn ? (
        <Container >
          {groupedItems?.length ? (
            <>
              <div className="flex items-center gap-2 py-5">
                <div className="flex items-center gap-1 bg-white rounded-full px-5 py-2">
                <ShoppingBag className="text-shop_light_green" />
                <Title className="text-xl font-bold text-shop_light_green">Danh sách sản phẩm</Title>
                </div>
              </div>
              <div className="grid lg:grid-cols-3 md:gap-8">
                <div className="lg:col-span-2 rounded-lg">
                  <div className="p-4 bg-white rounded-xl">
                    {groupedItems?.map(({ product }) => {
                      const itemCount = getItemCount(product?._id);
                      return (
                        <div
                          key={product?._id}
                          className="border-b p-2.5 last:border-b-0 flex items-center justify-between gap-5"
                        >
                          <div className="flex flex-1 items-start gap-2 h-36 md:h-44">
                            {product?.images && (
                              <Link
                                href={`/product/${product?.slug?.current}`}
                                className="border p-0.5 md:p-1 mr-2 rounded-md
                                 overflow-hidden group"
                              >
                                <Image
                                  src={urlFor(product?.images[0]).url()}
                                  alt="productImage"
                                  width={5000}
                                  height={5000}
                                  loading="lazy"
                                  className="w-32 md:w-40 h-32 md:h-40 object-cover group-hover:scale-105 hoverEffect"
                                />
                              </Link>
                            )}
                            <div className="h-full flex flex-1 flex-col justify-between py-1">
                              <div className="flex flex-col gap-0.5 md:gap-1.5">
                                <h2 className="text-base font-semibold line-clamp-1">
                                  {product?.name}
                                </h2>
                                <p className="text-sm capitalize">
                                  Danh mục:{" "}
                                  <span className="font-semibold">
                                  {
                                    product?.variant === "thuc-pham-chuc-nang" ? "Thực phẩm chức năng" :
                                    product?.variant as any === "thuoc" ? "Thuốc" :
                                    product?.variant as any === "sinh-ly" ? "Sinh lý" :
                                    product?.variant as any === "trang-thiet-bi-y-te" ? "Trang thiết bị y tế" :
                                    product?.variant as any === "dinh-duong" ? "Dinh dưỡng" :
                                    product?.variant as any === "duoc-my-pham" ? "Dược mỹ phẩm" :
                                    product?.variant as any === "cham-soc-ca-nhan" ? "Chăm sóc cá nhân" :
                                    product?.variant // Giá trị dự phòng nếu không khớp
                                  }
                                  </span>
                                </p>
                                <p className="text-sm capitalize">
                                  Trạng thái:{" "}
                                  <span className="font-semibold">
                                  {(product?.stock as number) > 0
                          ? "Còn hàng"
                          : "Hết hàng"}
                                  </span>
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <ProductSideMenu
                                        product={product}
                                        className="relative top-0 right-0"
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent className="font-bold">
                                      Thêm vào yêu thích
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Trash
                                        onClick={() => {
                                          deleteCartProduct(product?._id);
                                          toast.success(
                                            "Đã xóa sản phẩm thành công!"
                                          );
                                        }}
                                        className="w-4 h-4 md:w-5 md:h-5 mr-1 text-gray-500 hover:text-red-600 hoverEffect"
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent className="font-bold bg-red-600">
                                      Xóa sản phẩm
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-start justify-between h-36 md:h-44 p-0.5 md:p-1">
                            {/* Hiển thị thông tin giá chi tiết */}
                            <div className="flex flex-col items-end gap-1">
                              {/* Giá gốc */}
                              <div className="text-sm text-gray-600">
                                Giá gốc: <span className="font-medium">{product?.price?.toLocaleString()}đ</span>
                              </div>
                              
                              {/* Phần trăm giảm giá (nếu có) */}
                              {product?.discount && product?.discount > 0 && (
                                <div className="text-sm text-green-600">
                                  Giảm giá: <span className="font-medium">{product.discount}%</span>
                                </div>
                              )}
                              
                              {/* Tổng tiền sau giảm */}
                              <PriceFormatter
                                amount={getDiscountedPrice(product) * itemCount}
                                className="font-bold text-lg text-green-600"
                              />
                            </div>
                            
                            <QuantityButtons product={product} />
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      onClick={handleResetCart}
                      className="mt-2 ml-3 font-semibold bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                      variant="destructive"
                      >
                      Xóa tất cả
                    </Button>
                  </div>
                </div>
                <div>
                {/* lagre view */}
                <style jsx>{`
                /* CSS cho hiệu ứng viền răng cưa */
                .invoice-summary-box {
                  position: relative;
                }

                /* Tạo hiệu ứng răng cưa ở trên và dưới.
                  Chúng ta sẽ dùng linear-gradient thay vì radial-gradient để tạo hiệu ứng cắt ngang.
                */
                .invoice-summary-box::before,
                .invoice-summary-box::after {
                  content: '';
                  position: absolute;
                  left: 0;
                  right: 0;
                  height: 15px; /* Chiều cao của phần răng cưa */
                  background-size: 16px 16px; /* Kích thước của mỗi "răng" */
                  background-position: center;
                }

                /* Răng cưa ở dưới */
                .invoice-summary-box::after {
                  bottom: -8px; /* Đẩy xuống dưới */
                  background-image: linear-gradient(135deg, #fff 50%, transparent 50%),
                                    linear-gradient(-135deg, #fff 50%, transparent 50%);
                }   
                `}
                </style>
                  <div className="lg:col-span-1">
                    <div className="hidden md:inline-block w-full bg-white p-6 rounded-lg invoice-summary-box">
                      <h2 className="text-xl font-semibold mb-8">
                        Tóm tắt đơn hàng
                      </h2>
                      <div className="space-y-4">
                        {/* Tạm tính - Tổng giá gốc */}
                        <div className="flex items-center justify-between">
                          <span>Tạm tính (giá gốc)</span>
                          <PriceFormatter amount={getOriginalTotalPrice()} />
                        </div>
                        
                        {/* Giảm giá từ sản phẩm */}
                        {getProductDiscountAmount() > 0 && (
                          <div className="flex items-center justify-between text-green-600">
                            <span>Giảm giá sản phẩm</span>
                            <span>-<PriceFormatter amount={getProductDiscountAmount()} /></span>
                          </div>
                        )}
                        
                        {/* Hiển thị mã giảm giá nếu có */}
                        {couponDiscount > 0 && (
                          <div className="flex items-center justify-between text-green-600">
                            <span>Giảm giá mã ({appliedCoupon?.code})</span>
                            <span>-<PriceFormatter amount={couponDiscount} /></span>
                          </div>
                        )}
                        
                        {/* Hiển thị giảm giá vận chuyển nếu có */}
                        {shippingDiscount > 0 && (
                          <div className="flex items-center justify-between text-green-600">
                            <span>Miễn phí vận chuyển</span>
                            <span>-<PriceFormatter amount={shippingDiscount} /></span>
                          </div>
                        )}
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between font-semibold text-lg">
                          <span>Thành tiền</span>
                          <PriceFormatter
                            amount={getFinalTotalPrice()}
                            className="text-lg font-bold text-black"
                          />
                        </div>
                        
                        {/* Component nhập mã giảm giá */}
                        <div className="pt-4 border-t">
                          <CouponInput
                            cartItems={getCartItemsForCoupon()}
                            subtotal={getOriginalTotalPrice()}
                            userId={user?.id}
                            onCouponApplied={handleCouponApplied}
                            onCouponRemoved={handleCouponRemoved}
                          />
                        </div>
                        
                        <Button
                          className="w-full rounded-full font-semibold tracking-wide hoverEffect bg-shop_light_green text-white"
                          size="lg"
                          disabled={loading}
                          onClick={handleCheckout}
                        >
                          {loading ? "Vui lòng chờ..." : "Tiến hành thanh toán"}
                        </Button>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl mt-5">
                      <Card className="border-none shadow-none">
                        <CardHeader>
                          <CardTitle>Địa chỉ giao hàng</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <label htmlFor="email" className="text-sm font-medium">
                                Email <span className="text-red-500">*</span>
                              </label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="Nhập email của bạn (bắt buộc)"
                                value={manualEmail}
                                onChange={(e) => {
                                  setManualEmail(e.target.value);
                                  // Clear error khi user bắt đầu nhập
                                  if (emailError) setEmailError("");
                                }}
                                className={`w-full ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
                                required
                              />
                              {emailError && (
                                <p className="text-xs text-red-500">{emailError}</p>
                              )}
                              {user?.primaryEmailAddress?.emailAddress && !manualEmail && !emailError && (
                                <p className="text-xs text-gray-500">
                                  Email từ tài khoản: {user.primaryEmailAddress.emailAddress}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="phone" className="text-sm font-medium">
                                Số điện thoại <span className="text-red-500">*</span>
                              </label>
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="Nhập số điện thoại của bạn (bắt buộc)"
                                value={manualPhone}
                                onChange={(e) => {
                                  setManualPhone(e.target.value);
                                  // Clear error khi user bắt đầu nhập
                                  if (phoneError) setPhoneError("");
                                }}
                                className={`w-full ${phoneError ? 'border-red-500 focus:border-red-500' : ''}`}
                                required
                              />
                              {phoneError && (
                                <p className="text-xs text-red-500">{phoneError}</p>
                              )}
                              {user?.phoneNumbers?.[0]?.phoneNumber && !manualPhone && !phoneError && (
                                <p className="text-xs text-gray-500">
                                  Số điện thoại từ tài khoản: {user.phoneNumbers[0].phoneNumber}
                                </p>
                              )}
                            </div>
                            <Input
                              type="text"
                              placeholder="Số nhà, tên đường..."
                              value={newStreetAddress}
                              onChange={(e) => setNewStreetAddress(e.target.value)}
                              className="w-full"
                            />
                            <Select
                              onValueChange={(value: string) => {
                                const prov = provinces?.find(p => p._id === value);
                                setSelectedNewProvince(prov || null);
                              }}
                              value={selectedNewProvince?._id || ""}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Chọn Tỉnh / Thành phố" />
                              </SelectTrigger>
                              <SelectContent>
                                {provinces?.map(prov => (
                                  <SelectItem key={prov._id} value={prov._id}>
                                    {prov.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              onValueChange={(value: string) => {
                                const w = wards?.find(wa => wa._id === value);
                                setSelectedNewWard(w || null);
                              }}
                              value={selectedNewWard?._id || ""}
                              disabled={!selectedNewProvince}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Chọn Phường / Xã" />
                              </SelectTrigger>
                              <SelectContent>
                                {wards?.map(w => (
                                  <SelectItem key={w._id} value={w._id}>
                                    {w.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Separator className="my-4" />

                          <CardTitle className="mb-4">Ghi chú đơn hàng (tùy chọn)</CardTitle>
                          <textarea
                            className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md resize-none"
                            placeholder="Ghi chú đặc biệt về đơn hàng (ví dụ: thời gian giao hàng, địa chỉ cụ thể...)"
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                          />
                          <Separator className="my-4" />

                          <CardTitle className="mb-4">Phương thức thanh toán</CardTitle>
                          <RadioGroup
                            defaultValue="cod"
                            onValueChange={(value: "cod" | "vnpay") => setSelectedPaymentMethod(value)}
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              <RadioGroupItem value="cod" id="cod" />
                              <Label htmlFor="cod">Thanh toán khi nhận hàng (COD)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="vnpay" id="vnpay" />
                              <Label htmlFor="vnpay">Thanh toán qua VNPAY</Label>
                            </div>
                          </RadioGroup>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
                {/* Order summary for mobile view */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white p-6 rounded-2xl drop-shadow-lg">
                      <h2 className="text-lg font-semibold mb-2 text-shop_light_green">
                        Tóm tắt đơn hàng
                      </h2>
                      <div className="space-y-2">
                        {/* Tạm tính - Tổng giá gốc */}
                        <div className="flex items-center justify-between">
                          <span>Tạm tính (giá gốc)</span>
                          <PriceFormatter amount={getOriginalTotalPrice()} />
                        </div>
                        
                        {/* Giảm giá từ sản phẩm */}
                        {getProductDiscountAmount() > 0 && (
                          <div className="flex items-center justify-between text-green-600">
                            <span>Giảm giá sản phẩm</span>
                            <span>-<PriceFormatter amount={getProductDiscountAmount()} /></span>
                          </div>
                        )}
                        
                        {/* Hiển thị mã giảm giá nếu có */}
                        {couponDiscount > 0 && (
                          <div className="flex items-center justify-between text-green-600">
                            <span>Giảm giá mã ({appliedCoupon?.code})</span>
                            <span>-<PriceFormatter amount={couponDiscount} /></span>
                          </div>
                        )}
                        
                        {/* Hiển thị giảm giá vận chuyển nếu có */}
                        {shippingDiscount > 0 && (
                          <div className="flex items-center justify-between text-green-600">
                            <span>Miễn phí vận chuyển</span>
                            <span>-<PriceFormatter amount={shippingDiscount} /></span>
                          </div>
                        )}
                        
                        <Separator />
                        
                        <div className="flex items-center py-0 justify-between font-semibold text-lg">
                          <span>Thành tiền</span>
                          <PriceFormatter
                            amount={getFinalTotalPrice()}
                            className="text-lg font-bold text-black"
                          />
                        </div>
                        
                        {/* Component nhập mã giảm giá */}
                        <div className="pt-4 border-t">
                          <CouponInput
                            cartItems={getCartItemsForCoupon()}
                            subtotal={getOriginalTotalPrice()}
                            userId={user?.id}
                            onCouponApplied={handleCouponApplied}
                            onCouponRemoved={handleCouponRemoved}
                          />
                        </div>
                        
                        <Button
                          className="w-full rounded-full font-semibold mt-2 tracking-wide hoverEffect bg-shop_light_green text-white"
                          size="lg"
                          disabled={loading}
                          onClick={handleCheckout}
                        >
                          {loading ? "Vui lòng chờ..." : "Tiến hành thanh toán"}
                        </Button>
                      </div>
                    </div>
              </div>
            </>
          ) : (
            <EmptyCart />
          )}
        </Container>
      ) : (
        <NoAccess />
      )}
    </div>
  );
};

export default CartPage;
