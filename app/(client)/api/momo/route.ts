import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

// IMPORTANT: Move these to .env.local in a real application
const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE || "";
const MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY || "";
const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY || "";
const MOMO_API_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create";
const REDIRECT_URL = process.env.NEXT_PUBLIC_BASE_URL + "/momo-return"; // URL for MoMo to redirect to after payment
const IPN_URL = process.env.NEXT_PUBLIC_BASE_URL + "/api/webhook/momo"; // URL for MoMo to send IPN

export async function POST(req: Request) {
  try {
    const { cart, totalPrice, customerInfo, shippingAddress } = await req.json();

    if (!cart || !totalPrice || !customerInfo || !shippingAddress) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const orderId = uuidv4();
    const requestId = uuidv4();
    const orderInfo = `Thanh toan don hang ${orderId}`;
    const amount = totalPrice.toString();

    const extraData = Buffer.from(
      JSON.stringify({ customerInfo, shippingAddress, cart })
    ).toString("base64");

    const rawSignature = `partnerCode=${MOMO_PARTNER_CODE}&accessKey=${MOMO_ACCESS_KEY}&requestId=${requestId}&amount=${amount}&orderId=${orderId}&orderInfo=${orderInfo}&redirectUrl=${REDIRECT_URL}&ipnUrl=${IPN_URL}&extraData=${extraData}`;

    const signature = crypto
      .createHmac("sha256", MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest("hex");

    const requestBody = JSON.stringify({
      partnerCode: MOMO_PARTNER_CODE,
      accessKey: MOMO_ACCESS_KEY,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl: REDIRECT_URL,
      ipnUrl: IPN_URL,
      extraData,
      requestType: "captureWallet",
      signature,
      lang: "vi",
    });

    const response = await fetch(MOMO_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody,
    });

    const result = await response.json();

    if (result.resultCode !== 0) {
      return new NextResponse(`MoMo Error: ${result.message}`, { status: 500 });
    }

    return NextResponse.json({ payUrl: result.payUrl });
  } catch (error) {
    console.error("Error creating MoMo payment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
