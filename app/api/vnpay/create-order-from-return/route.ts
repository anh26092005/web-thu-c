// Khối 1: Import các thư viện cần thiết
import { NextRequest, NextResponse } from 'next/server';
import { backendClient } from '@/sanity/lib/backendClient';

// Khối 2: Xử lý POST tạo đơn hàng từ dữ liệu trả về của VNPay
export async function POST(req: NextRequest) {
  try {
    // Lấy dữ liệu từ body (các tham số trả về của VNPay và thông tin đơn hàng)
    const vnpayParams = await req.json();

    // Lấy các trường cơ bản từ VNPay
    const orderId = vnpayParams.vnp_TxnRef;
    const amount = parseInt(vnpayParams.vnp_Amount) / 100;
    const responseCode = vnpayParams.vnp_ResponseCode;

    // Có thể nhận thêm các trường khác từ client: customerName, email, phone, shippingAddress, products, ...
    // (Nên truyền đủ các trường này từ phía client khi gọi API này)

    if (responseCode === '00') {
      // Thanh toán thành công, tạo đơn hàng trong Sanity
      const newOrder = {
        _type: 'order',
        orderNumber: orderId,
        totalPrice: amount,
        paymentMethod: 'vnpay',
        isPaid: true,
        status: 'processing',
        vnpayResponse: vnpayParams,
        orderDate: new Date().toISOString(),
        // Các trường bổ sung từ client (nếu có)
        customerName: vnpayParams.customerName,
        email: vnpayParams.email,
        phone: vnpayParams.phone,
        shippingAddress: vnpayParams.shippingAddress,
        products: vnpayParams.products,
        currency: 'VND',
        amountDiscount: vnpayParams.amountDiscount || 0,
      };
      try {
        await backendClient.create(newOrder);
        return NextResponse.json({ success: true, message: 'Order created successfully.' }, { status: 200 });
      } catch (sanityError) {
        return NextResponse.json({ success: false, message: 'Error creating order in Sanity.' }, { status: 500 });
      }
    } else {
      // Thanh toán thất bại hoặc bị hủy
      return NextResponse.json({ success: false, message: 'Payment failed or cancelled.' }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Unknown error.' }, { status: 500 });
  }
} 