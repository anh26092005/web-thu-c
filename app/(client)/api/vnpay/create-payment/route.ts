// Khối 1: Import các thư viện cần thiết
import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';
import { format } from 'date-fns';
import qs from 'qs';
import vnpayConfig from '../../../../../config/vnpay.json';

// Hàm sắp xếp object giống code mẫu Express.js
function sortObject(obj: any) {
  let sorted: { [key: string]: any } = {};
  let str: string[] = [];
  let key: any;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[decodeURIComponent(str[key])]).replace(/%20/g, "+");
  }
  return sorted;
}

// Khối 2: Hàm xử lý POST tạo URL thanh toán VNPAY
export async function POST(req: NextRequest) {
  try {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const { amount, bankCode = '' } = await req.json();
    if (!amount) {
      return new NextResponse('Amount is required.', { status: 400 });
    }

    const tmnCode = vnpayConfig.vnp_TmnCode;
    const secretKey = vnpayConfig.vnp_HashSecret;
    let vnpUrl = vnpayConfig.vnp_Url;
    const returnUrl = vnpayConfig.vnp_ReturnUrl;

    const date = new Date();
    const createDate = format(date, 'yyyyMMddHHmmss');
    const orderId = format(date, 'HHmmss'); // Đúng format mẫu
    const ipAddr = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
    const locale = 'vn';
    const currCode = 'VND';

    let vnp_Params: { [key: string]: any } = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    // Sắp xếp tham số giống mẫu
    const sorted_vnp_Params = sortObject(vnp_Params);

    // Tạo chuỗi ký dùng qs với encode: false
    const signData = qs.stringify(sorted_vnp_Params, { encode: false });

    // Tạo secure hash
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    sorted_vnp_Params['vnp_SecureHash'] = signed;

    // Tạo URL cuối cùng dùng qs với encode: false
    const paymentUrl = vnpUrl + '?' + qs.stringify(sorted_vnp_Params, { encode: false });

    return NextResponse.json({ paymentUrl });
  } catch (error) {
    console.error('VNPAY Create Payment Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 