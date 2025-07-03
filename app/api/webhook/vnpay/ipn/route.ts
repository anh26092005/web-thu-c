// Khối 1: Import các thư viện cần thiết
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import qs from "qs";
import vnpayConfig from '../../../../../config/vnpay.json';
import { backendClient } from '@/sanity/lib/backendClient';

// Hàm sắp xếp object theo key (giống mẫu VNPay)
function sortObject(obj: { [key: string]: any }) {
  let sorted: { [key: string]: any } = {};
  let str: string[] = [];
  let key: string;
  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (let i = 0; i < str.length; i++) {
    sorted[str[i]] = encodeURIComponent(obj[decodeURIComponent(str[i])]).replace(/%20/g, "+");
  }
  return sorted;
}

// Khối 2: Xử lý GET IPN từ VNPay
export async function GET(req: NextRequest) {
  try {
    // Lấy tất cả tham số từ query
    let vnp_Params = Object.fromEntries(req.nextUrl.searchParams.entries());
    let secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp tham số
    vnp_Params = sortObject(vnp_Params);

    // Lấy secret key từ config
    const secretKey = vnpayConfig.vnp_HashSecret;
    // Tạo chuỗi ký
    const signData = qs.stringify(vnp_Params, { encode: false });
    // Tạo chữ ký HMAC SHA512
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // Lấy thông tin đơn hàng
    const orderId = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];
    const amount = parseInt(vnp_Params['vnp_Amount']) / 100;

    // TODO: Kiểm tra orderId và amount với DB thực tế
    let checkOrderId = true; // Nên kiểm tra thực tế
    let checkAmount = true;  // Nên kiểm tra thực tế

    // Khối 3: Xác thực chữ ký
    if (secureHash === signed) {
      if (checkOrderId) {
        if (checkAmount) {
          if (rspCode === '00') {
            // Thanh toán thành công: cập nhật trạng thái đơn hàng
            try {
              await backendClient.patch(orderId)
                .set({
                  isPaid: true,
                  paymentMethod: 'vnpay',
                  status: 'processing',
                  vnpayResponse: vnp_Params,
                })
                .commit();
            } catch (err) {
              return NextResponse.json({ RspCode: '99', Message: 'Error updating order' }, { status: 200 });
            }
            return NextResponse.json({ RspCode: '00', Message: 'Success' }, { status: 200 });
          } else {
            // Thanh toán thất bại: cập nhật trạng thái đơn hàng
            try {
              await backendClient.patch(orderId)
                .set({
                  isPaid: false,
                  paymentMethod: 'vnpay',
                  status: 'cancelled',
                  vnpayResponse: vnp_Params,
                })
                .commit();
            } catch (err) {
              return NextResponse.json({ RspCode: '99', Message: 'Error updating order' }, { status: 200 });
            }
            return NextResponse.json({ RspCode: '00', Message: 'Success' }, { status: 200 });
          }
        } else {
          return NextResponse.json({ RspCode: '04', Message: 'Amount invalid' }, { status: 200 });
        }
      } else {
        return NextResponse.json({ RspCode: '01', Message: 'Order not found' }, { status: 200 });
      }
    } else {
      return NextResponse.json({ RspCode: '97', Message: 'Checksum failed' }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ RspCode: '99', Message: 'Unknown error' }, { status: 500 });
  }
} 