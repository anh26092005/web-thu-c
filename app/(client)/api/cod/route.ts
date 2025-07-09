import { NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { v4 as uuidv4 } from "uuid";
import { sendOrderConfirmationEmail, OrderData } from "@/lib/email-service";

export async function POST(req: Request) {
  try {
    const { 
      cart, 
      totalPrice, 
      originalPrice,
      discountAmount,
      shippingDiscount,
      appliedCoupon,
      customerInfo, 
      shippingAddress, 
      orderNotes 
    } = await req.json();

    // Debug dữ liệu nhận được
    console.log("Received data in COD API:");
    console.log("CustomerInfo:", customerInfo);
    console.log("Email specifically:", customerInfo?.email);
    console.log("Coupon info:", appliedCoupon);
    console.log("Discount amount:", discountAmount);

    if (!cart || !totalPrice || !customerInfo || !shippingAddress) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const orderNumber = uuidv4();

    // Tính thời gian giao hàng dự kiến (3-5 ngày làm việc)
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 4); // 4 ngày sau

    // Debug dữ liệu sẽ lưu vào Sanity
    console.log("Order data to be saved:");
    console.log("Email to save:", customerInfo.email);

    const order = await backendClient.create({
      _type: "order",
      orderNumber,
      clerkUserId: customerInfo.clerkUserId,
      customerName: customerInfo.name,
      email: customerInfo.email,
      phone: customerInfo.phone,
      orderNotes: orderNotes || "",
      shippingAddress: {
        _type: "vietnameseAddress",
        streetAddress: shippingAddress.street,
        province: {
          _type: "reference",
          _ref: shippingAddress.provinceId,
        },
        ward: {
          _type: "reference",
          _ref: shippingAddress.wardId,
        },
      },
      products: cart.map((item: any) => ({
        _key: item._id,
        product: {
          _type: "reference",
          _ref: item._id,
        },
        quantity: item.quantity,
      })),
      totalPrice,
      currency: "VND",
      amountDiscount: discountAmount || 0,
      // Thêm thông tin mã giảm giá nếu có
      ...(appliedCoupon && {
        appliedCoupon: {
          _type: "reference",
          _ref: appliedCoupon._id,
        },
        couponCode: appliedCoupon.code,
      }),
      shippingFee: shippingDiscount ? 0 : 30000, // Miễn phí vận chuyển nếu có mã giảm giá shipping
      estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
      paymentMethod: "cod",
      isPaid: false,
      status: "pending",
      orderDate: new Date().toISOString(),
    });

    // Gửi email xác nhận đơn hàng
    try {
      // Lấy thông tin chi tiết sản phẩm từ cart
      const productDetails = await Promise.all(
        cart.map(async (item: any) => {
          const product = await backendClient.fetch(
            `*[_type == "product" && _id == $productId][0]{ name, price, discount }`,
            { productId: item._id }
          );
          return {
            name: product?.name || "Sản phẩm",
            quantity: item.quantity,
            price: product?.price || 0,
            discount: product?.discount || 0, // Thêm thông tin discount
          };
        })
      );

      // Lấy thông tin địa chỉ chi tiết
      const addressDetails = await backendClient.fetch(
        `{
          "province": *[_type == "province" && _id == $provinceId][0]{ name },
          "ward": *[_type == "ward" && _id == $wardId][0]{ name }
        }`,
        { 
          provinceId: shippingAddress.provinceId,
          wardId: shippingAddress.wardId 
        }
      );

      // Chuẩn bị dữ liệu email
      const emailData: OrderData = {
        orderNumber: orderNumber,
        customerInfo: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
        },
        products: productDetails,
        totalPrice: totalPrice,
        originalPrice: originalPrice || totalPrice,
        discountAmount: discountAmount || 0,
        shippingDiscount: shippingDiscount || 0,
        paymentMethod: "cod",
        shippingAddress: {
          street: shippingAddress.street,
          ward: addressDetails.ward?.name || "Không xác định",
          province: addressDetails.province?.name || "Không xác định",
        },
        orderDate: new Date().toISOString(),
        estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
      };

      // Gửi email xác nhận
      const emailResult = await sendOrderConfirmationEmail(emailData);
      
      if (emailResult.success) {
        console.log("Email xác nhận đã được gửi thành công");
      } else {
        console.error("Lỗi gửi email xác nhận:", emailResult.message);
        // Không throw error để không ảnh hưởng đến việc tạo đơn hàng
      }

    } catch (emailError) {
      console.error("Lỗi trong quá trình gửi email:", emailError);
      // Không throw error để không ảnh hưởng đến việc tạo đơn hàng
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error creating COD order:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
