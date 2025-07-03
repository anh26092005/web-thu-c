import { NextResponse } from "next/server";
import crypto from "crypto";

// IMPORTANT: Move these to .env.local in a real application
const accessKey = process.env.MOMO_ACCESS_KEY || "";
const secretKey = process.env.MOMO_SECRET_KEY || "";
const partnerCode = process.env.MOMO_PARTNER_CODE || "";
const endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";

export async function POST(req: Request) {
  try {
    const { products, amount } = await req.json();

    if (!products || !amount) {
      return new NextResponse("Missing products or amount", { status: 400 });
    }

    const orderInfo = "pay with MoMo";
    const redirectUrl = process.env.MOMO_REDIRECT_URL || "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b";
    const ipnUrl = process.env.MOMO_IPN_URL || "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b";
    const requestType = "payWithMethod";
    const orderId = partnerCode + Date.now();
    const requestId = orderId;
    const orderGroupId = "";
    const autoCapture = true;
    const lang = "vi";

    const extraData = Buffer.from(JSON.stringify({ items: products })).toString("base64");

    const amountStr = amount.toString();

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amountStr}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

    const requestBody = JSON.stringify({
      partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId,
      amount: amountStr,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang,
      requestType,
      autoCapture,
      extraData,
      orderGroupId,
      signature
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody).toString(),
      },
      body: requestBody,
    });

    const result = await response.json();

    if (result && result.payUrl) {
      return NextResponse.json({ payUrl: result.payUrl });
    } else {
      console.error("MoMo Error Response:", result);
      return new NextResponse(JSON.stringify(result), { status: 400 });
    }
  } catch (error) {
    console.error("MoMo payment error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
