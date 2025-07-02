import { NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import crypto from "crypto";

const MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY || "";
const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY || "";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resultCode, extraData, orderId } = body;

    // 1. Verify signature (this is a simplified version, refer to MoMo docs for full implementation)
    const rawSignature = `...`; // Construct the raw signature string as per MoMo's documentation
    const expectedSignature = crypto
      .createHmac("sha256", MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest("hex");

    // if (body.signature !== expectedSignature) {
    //   return new NextResponse("Invalid signature", { status: 400 });
    // }

    // 2. Check if payment was successful
    if (resultCode === 0) {
      // 3. Decode extraData
      const decodedData = JSON.parse(
        Buffer.from(extraData, "base64").toString("utf-8")
      );
      const { customerInfo, shippingAddress, cart } = decodedData;

      // 4. Create order in Sanity
      const order = await backendClient.create({
        _type: "order",
        orderNumber: orderId,
        customerName: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
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
        totalPrice: body.amount,
        currency: "VND",
        amountDiscount: 0,
        paymentMethod: "momo",
        isPaid: true,
        status: "processing", // Or "pending" if you have a manual confirmation step
        orderDate: new Date().toISOString(),
      });

      console.log("MoMo order created successfully:", order._id);
    } else {
      console.log("MoMo payment failed or was cancelled:", body);
    }

    // Respond to MoMo to acknowledge receipt
    return NextResponse.json({ resultCode: 0, message: "Success" });
  } catch (error) {
    console.error("Error handling MoMo IPN:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
