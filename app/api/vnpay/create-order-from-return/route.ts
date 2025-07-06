// Khối 1: Import các thư viện cần thiết
import { NextRequest, NextResponse } from 'next/server';
import { backendClient } from '@/sanity/lib/backendClient';
import { v4 as uuidv4 } from 'uuid';

// Khối 2: Xử lý POST tạo đơn hàng từ dữ liệu trả về của VNPay
export async function POST(req: NextRequest) {
  try {
    // Lấy dữ liệu từ body (các tham số trả về của VNPay và thông tin đơn hàng từ localStorage)
    const { vnpayParams, pendingOrderData } = await req.json();

    // Lấy các trường cơ bản từ VNPay
    const responseCode = vnpayParams.vnp_ResponseCode;
    const amount = parseInt(vnpayParams.vnp_Amount) / 100;

    if (responseCode === '00') {
      // Kiểm tra có dữ liệu đơn hàng tạm thời không
      if (!pendingOrderData || !pendingOrderData.cart || !pendingOrderData.customerInfo || !pendingOrderData.shippingAddress) {
        return NextResponse.json({ success: false, message: 'Missing order data from localStorage' }, { status: 400 });
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
      console.log("Email to save:", pendingOrderData.customerInfo.email);

      // Thanh toán thành công, tạo đơn hàng trong Sanity giống như COD
      const newOrder = {
        _type: 'order',
        orderNumber,
        clerkUserId: pendingOrderData.customerInfo.clerkUserId,
        customerName: pendingOrderData.customerInfo.name,
        email: pendingOrderData.customerInfo.email,
        phone: pendingOrderData.customerInfo.phone,
        orderNotes: pendingOrderData.orderNotes || "",
        shippingAddress: {
          _type: "vietnameseAddress",
          streetAddress: pendingOrderData.shippingAddress.street,
          province: {
            _type: "reference",
            _ref: pendingOrderData.shippingAddress.provinceId,
          },
          ward: {
            _type: "reference",
            _ref: pendingOrderData.shippingAddress.wardId,
          },
        },
        products: pendingOrderData.cart.map((item: any) => ({
          _key: item._id,
          product: {
            _type: "reference",
            _ref: item._id,
          },
          quantity: item.quantity,
        })),
        totalPrice: pendingOrderData.totalPrice,
        currency: 'VND',
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
        paymentMethod: 'vnpay',
        isPaid: true,
        status: 'processing',
        orderDate: new Date().toISOString(),
        vnpayResponse: vnpayParams,
      };

      try {
        const order = await backendClient.create(newOrder);
        
        // Cập nhật số lần sử dụng mã giảm giá nếu có
        if (pendingOrderData.appliedCoupon) {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/coupon/update-usage`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                couponId: pendingOrderData.appliedCoupon._id,
              }),
            });
            
            if (!response.ok) {
              console.error("Lỗi cập nhật usage mã giảm giá:", await response.text());
            }
          } catch (updateError) {
            console.error("Lỗi khi gọi API cập nhật usage mã giảm giá:", updateError);
          }
        }
        
        return NextResponse.json({ success: true, message: 'Order created successfully.', order }, { status: 200 });
      } catch (sanityError) {
        console.error('Error creating order in Sanity:', sanityError);
        return NextResponse.json({ success: false, message: 'Error creating order in Sanity.' }, { status: 500 });
      }
    } else {
      // Thanh toán thất bại hoặc bị hủy
      return NextResponse.json({ success: false, message: 'Payment failed or cancelled.' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error processing VNPay return:', error);
    return NextResponse.json({ success: false, message: 'Unknown error.' }, { status: 500 });
  }
} 