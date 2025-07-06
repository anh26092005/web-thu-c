import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";

// Query GROQ để lấy đơn hàng cho admin
const ADMIN_ORDERS_QUERY = `*[_type == "order"] | order(orderDate desc) {
  _id,
  orderNumber,
  customerName,
  email,
  phone,
  totalPrice,
  amountDiscount,
  shippingFee,
  status,
  paymentMethod,
  isPaid,
  orderDate,
  estimatedDeliveryDate,
  "products": products[] {
    "product": product-> {
      name,
      price,
      "image": images[0].asset->url
    },
    quantity
  },
  shippingAddress,
  orderNotes
}`;

// GET: Lấy danh sách đơn hàng cho admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Query cơ bản
    let query = ADMIN_ORDERS_QUERY;

    // Thêm filter tìm kiếm nếu có
    if (search) {
      query = `*[_type == "order" && (
        orderNumber match "*${search}*" ||
        customerName match "*${search}*" ||
        email match "*${search}*" ||
        phone match "*${search}*"
      )] | order(orderDate desc) {
        _id,
        orderNumber,
        customerName,
        email,
        phone,
        totalPrice,
        amountDiscount,
        shippingFee,
        status,
        paymentMethod,
        isPaid,
        orderDate,
        estimatedDeliveryDate,
        "products": products[] {
          "product": product-> {
            name,
            price,
            "image": images[0].asset->url
          },
          quantity
        },
        shippingAddress,
        orderNotes
      }`;
    }

    // Lấy dữ liệu từ Sanity
    const allOrders = await backendClient.fetch(query);

    // Filter theo status nếu cần
    let filteredOrders = allOrders;
    if (status !== "all") {
      filteredOrders = allOrders.filter((order: any) => order.status === status);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    // Tính toán thống kê
    const totalOrders = filteredOrders.length;
    const totalPages = Math.ceil(totalOrders / limit);
    
    // Thống kê theo trạng thái
    const statusCounts = {
      pending: allOrders.filter((o: any) => o.status === "pending").length,
      processing: allOrders.filter((o: any) => o.status === "processing").length,
      shipped: allOrders.filter((o: any) => o.status === "shipped").length,
      delivered: allOrders.filter((o: any) => o.status === "delivered").length,
      cancelled: allOrders.filter((o: any) => o.status === "cancelled").length,
    };

    // Tổng doanh thu
    const totalRevenue = allOrders
      .filter((o: any) => o.isPaid)
      .reduce((sum: number, o: any) => sum + o.totalPrice, 0);

    return NextResponse.json({
      success: true,
      data: {
        orders: paginatedOrders,
        stats: {
          total: allOrders.length,
          totalRevenue,
          statusCounts
        },
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Lỗi lấy dữ liệu đơn hàng:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Không thể lấy dữ liệu đơn hàng" 
      },
      { status: 500 }
    );
  }
}

// PATCH: Cập nhật trạng thái đơn hàng
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, notes } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: "Thiếu orderId hoặc status" },
        { status: 400 }
      );
    }

    // Cập nhật trạng thái đơn hàng
    const updateData: any = { status };
    
    // Thêm timestamps theo trạng thái
    if (status === "shipped") {
      updateData.shippedAt = new Date().toISOString();
    } else if (status === "delivered") {
      updateData.deliveredAt = new Date().toISOString();
    }

    if (notes) {
      updateData.adminNotes = notes;
    }

    const updatedOrder = await backendClient
      .patch(orderId)
      .set(updateData)
      .commit();

    return NextResponse.json({
      success: true,
      data: updatedOrder
    });

  } catch (error) {
    console.error("Lỗi cập nhật đơn hàng:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Không thể cập nhật đơn hàng" 
      },
      { status: 500 }
    );
  }
} 