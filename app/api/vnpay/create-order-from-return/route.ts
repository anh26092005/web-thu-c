// Khối 1: Import các thư viện cần thiết
import { NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { v4 as uuidv4 } from "uuid";
import { sendOrderConfirmationEmail, OrderData } from "@/lib/email-service";

export async function POST(req: Request) {
  try {
    // Sửa lại để nhận đúng structure từ frontend
    const { vnpayParams, pendingOrderData } = await req.json();

    if (!vnpayParams) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing VNPay parameters" 
      }, { status: 400 });
    }

    if (!pendingOrderData) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing pending order data" 
      }, { status: 400 });
    }

    // Debug dữ liệu nhận được từ localStorage
    console.log("VNPay - Pending order data from localStorage:");
    console.log("CustomerInfo:", pendingOrderData.customerInfo);
    console.log("Email specifically:", pendingOrderData.customerInfo?.email);
    console.log("Coupon info:", pendingOrderData.appliedCoupon);
    console.log("Discount amount:", pendingOrderData.discountAmount);

    // Tạo orderNumber mới
    const orderNumber = uuidv4();

    // Tính thời gian giao hàng dự kiến (2-3 ngày làm việc cho thanh toán online)
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 3); // 3 ngày sau

    // Debug dữ liệu sẽ lưu vào Sanity
    console.log("VNPay - Order data to be saved:");
    console.log("Email to save:", pendingOrderData.customerInfo?.email);

    const order = await backendClient.create({
      _type: "order",
      orderNumber,
      clerkUserId: pendingOrderData.customerInfo?.clerkUserId,
      customerName: pendingOrderData.customerInfo?.name,
      email: pendingOrderData.customerInfo?.email,
      phone: pendingOrderData.customerInfo?.phone,
      orderNotes: pendingOrderData.orderNotes || "",
      shippingAddress: {
        _type: "vietnameseAddress",
        streetAddress: pendingOrderData.shippingAddress?.street,
        province: {
          _type: "reference",
          _ref: pendingOrderData.shippingAddress?.provinceId,
        },
        ward: {
          _type: "reference",
          _ref: pendingOrderData.shippingAddress?.wardId,
        },
      },
      products: pendingOrderData.cart?.map((item: any) => ({
        _key: item._id,
        product: {
          _type: "reference",
          _ref: item._id,
        },
        quantity: item.quantity,
      })),
      totalPrice: pendingOrderData.totalPrice,
      currency: "VND",
      amountDiscount: pendingOrderData.discountAmount || 0,
      // Thêm thông tin mã giảm giá nếu có
      ...(pendingOrderData.appliedCoupon && {
        appliedCoupon: {
          _type: "reference",
          _ref: pendingOrderData.appliedCoupon._id,
        },
        couponCode: pendingOrderData.appliedCoupon.code,
      }),
      shippingFee: pendingOrderData.shippingDiscount ? 0 : 30000, // Miễn phí vận chuyển nếu có mã giảm giá shipping
      estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
      paymentMethod: "vnpay",
      isPaid: true, // VNPay đã thanh toán
      status: "processing", // Trạng thái processing cho đơn hàng đã thanh toán
      orderDate: new Date().toISOString(),
      vnpayTransactionId: vnpayParams.vnp_TransactionNo,
      vnpayPaymentDate: vnpayParams.vnp_PayDate,
    });

    // Gửi email xác nhận đơn hàng
    try {
      // Lấy thông tin chi tiết sản phẩm từ cart
      const productDetails = await Promise.all(
        pendingOrderData.cart.map(async (item: any) => {
          const product = await backendClient.fetch(
            `*[_type == "product" && _id == $productId][0]{ name, price }`,
            { productId: item._id }
          );
          return {
            name: product?.name || "Sản phẩm",
            quantity: item.quantity,
            price: product?.price || 0,
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
          provinceId: pendingOrderData.shippingAddress.provinceId,
          wardId: pendingOrderData.shippingAddress.wardId 
        }
      );

      // Chuẩn bị dữ liệu email
      const emailData: OrderData = {
        orderNumber: orderNumber,
        customerInfo: {
          name: pendingOrderData.customerInfo.name,
          email: pendingOrderData.customerInfo.email,
          phone: pendingOrderData.customerInfo.phone,
        },
        products: productDetails,
        totalPrice: pendingOrderData.totalPrice,
        originalPrice: pendingOrderData.originalPrice || pendingOrderData.totalPrice,
        discountAmount: pendingOrderData.discountAmount || 0,
        shippingDiscount: pendingOrderData.shippingDiscount || 0,
        paymentMethod: "vnpay",
        shippingAddress: {
          street: pendingOrderData.shippingAddress.street,
          ward: addressDetails.ward?.name || "Không xác định",
          province: addressDetails.province?.name || "Không xác định",
        },
        orderDate: new Date().toISOString(),
        estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
      };

      // Gửi email xác nhận
      const emailResult = await sendOrderConfirmationEmail(emailData);
      
      if (emailResult.success) {
        console.log("Email xác nhận VNPay đã được gửi thành công");
      } else {
        console.error("Lỗi gửi email xác nhận VNPay:", emailResult.message);
        // Không throw error để không ảnh hưởng đến việc tạo đơn hàng
      }

    } catch (emailError) {
      console.error("Lỗi trong quá trình gửi email VNPay:", emailError);
      // Không throw error để không ảnh hưởng đến việc tạo đơn hàng
    }

    // Trả về JSON response đúng format
    return NextResponse.json({ 
      success: true, 
      message: "Order created successfully",
      order: order 
    });
  } catch (error) {
    console.error("Error creating VNPay order:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal Server Error" 
    }, { status: 500 });
  }
} 