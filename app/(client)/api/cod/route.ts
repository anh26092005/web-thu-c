import { NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { cart, totalPrice, customerInfo, shippingAddress } = await req.json();

    if (!cart || !totalPrice || !customerInfo || !shippingAddress) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const orderNumber = uuidv4();

    const order = await backendClient.create({
      _type: "order",
      orderNumber,
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
      totalPrice,
      currency: "VND",
      amountDiscount: 0, // Handle discount logic if needed
      paymentMethod: "cod",
      isPaid: false,
      status: "pending",
      orderDate: new Date().toISOString(),
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error creating COD order:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
