"use client";


import Container from "@/components/Container";
import EmptyCart from "@/components/EmptyCart";
import NoAccess from "@/components/NoAccess";
import PriceFormatter from "@/components/PriceFormatter";
import ProductSideMenu from "@/components/ProductSideMenu";
import QuantityButtons from "@/components/QuantityButtons";
import Title from "@/components/Title";
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
import { Address, ProvinceData, WardData } from "@/sanity.types";
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

interface VietnameseAddress {
  _id: string;
  _type: "address";
  name?: string;
  email?: string;
  streetAddress: string;
  province: {
    _id: string;
    name: string;
    code: string;
  };
  ward: {
    _id: string;
    name: string;
    code: string;
  };
  default?: boolean;
  createdAt?: string;
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
  const router = useRouter();

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
        return;
      }

      // Trích xuất email từ Clerk user
      const { email: extractedEmail, source } = extractUserEmail();
      console.log("Email source:", source);
      
      // Sử dụng email thủ công nếu có, nếu không dùng email từ Clerk
      const finalEmail = manualEmail || extractedEmail || "Unknown";
      
      // Cảnh báo nếu không tìm thấy email
      if (!extractedEmail && !manualEmail) {
        toast.error("Không thể lấy email từ tài khoản. Vui lòng nhập email thủ công.");
        return;
      }

      const customerInfo = {
        clerkUserId: user?.id,
        name: user?.fullName ?? user?.firstName + " " + user?.lastName ?? "Unknown",
        email: finalEmail,
        phone: user?.phoneNumbers?.[0]?.phoneNumber ?? "Unknown",
      };

      console.log("=== THÔNG TIN KHÁCH HÀNG CUỐI CÙNG ===");
      console.log("Customer info being sent:", customerInfo);
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
            totalPrice: getTotalPrice(),
            customerInfo,
            shippingAddress: shippingAddressPayload,
            orderNotes,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          toast.success("Đơn hàng COD đã được tạo thành công!");
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
          totalPrice: getTotalPrice(),
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
            amount: getTotalPrice(),
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
                <ShoppingBag className="text-darkColor" />
                <Title className="text-xl font-bold">Danh sách sản phẩm</Title>
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
                                  width={500}
                                  height={500}
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
                                    {product?.variant}
                                  </span>
                                </p>
                                <p className="text-sm capitalize">
                                  Trạng thái:{" "}
                                  <span className="font-semibold">
                                    {product?.status}
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
                            <PriceFormatter
                              amount={(product?.price as number) * itemCount}
                              className="font-bold text-lg"
                            />
                            <QuantityButtons product={product} />
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      onClick={handleResetCart}
                      className="m-5 ml-3 font-semibold"
                      variant="destructive"
                    >
                      Xóa tất cả
                    </Button>
                  </div>
                </div>
                <div>
                  <div className="lg:col-span-1">
                    <div className="hidden md:inline-block w-full bg-white p-6 rounded-lg border">
                      <h2 className="text-xl font-semibold mb-8">
                        Tóm tắt đơn hàng
                      </h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Tổng phụ</span>
                          <PriceFormatter amount={getSubTotalPrice()} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Giảm giá</span>
                          <PriceFormatter
                            amount={getSubTotalPrice() - getTotalPrice()}
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between font-semibold text-lg">
                          <span>Tổng cộng</span>
                          <PriceFormatter
                            amount={getTotalPrice()}
                            className="text-lg font-bold text-black"
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
                            <Input
                              type="email"
                              placeholder="Email của bạn (tùy chọn)"
                              value={manualEmail}
                              onChange={(e) => setManualEmail(e.target.value)}
                              className="w-full"
                            />
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
                <div className="md:hidden fixed bottom-0 left-0 w-full bg-white pt-2">
                  <div className="bg-white p-4 rounded-lg border mx-4">
                    <h2 className="mb-4">Tóm tắt đơn hàng</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Tổng phụ</span>
                        <PriceFormatter amount={getSubTotalPrice()} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Giảm giá</span>
                        <PriceFormatter
                          amount={getSubTotalPrice() - getTotalPrice()}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between font-semibold text-lg">
                        <span>Tổng cộng</span>
                        <PriceFormatter
                          amount={getTotalPrice()}
                          className="text-lg font-bold text-black"
                        />
                      </div>
                      <Button
                        className="w-full rounded-full font-semibold tracking-wide hoverEffect hover:bg-shop_light_green text-white"
                        size="lg"
                        disabled={loading}
                        onClick={handleCheckout}
                      >
                        {loading ? "Vui lòng chờ..." : "Tiến hành thanh toán"}
                      </Button>
                    </div>
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
